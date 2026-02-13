"""
AI pipeline worker: consumes jobs from Redis stream and processes photos / face samples.
"""
import json
import logging
import os
import tempfile
import time
from typing import Any, Dict, List, Optional

import requests

from services.api_client import (
    get_photo,
    get_wedding_photo_ids,
    patch_guest,
    patch_photo,
    patch_processing_queue,
    patch_user,
    post_face_sample,
    post_photo_tag,
)
from services.face_processor import FaceProcessor
from services.redis_service import RedisClient as RedisClientClass
from services.s3_client import S3Client
from services.vector_db import VectorDBService


def _redis():
    return RedisClientClass.get_instance()

logger = logging.getLogger(__name__)

# Config from env
STREAM_KEY = os.getenv("REDIS_AI_QUEUE_STREAM", "ai:processing:stream")
CONSUMER_GROUP = os.getenv("REDIS_AI_CONSUMER_GROUP", "ai-workers")
CONSUMER_NAME = os.getenv("REDIS_AI_CONSUMER_NAME", "worker-1")
SIMILARITY_THRESHOLD = float(os.getenv("FACE_SIMILARITY_THRESHOLD", "0.6"))
PINECONE_INDEX = os.getenv("PINECONE_INDEX_NAME", "wedding-faces")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
S3_BUCKET = os.getenv("S3_BUCKET_NAME", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")


def _parse_s3_url(url: str) -> Optional[tuple[str, str, str]]:
    """
    Parse virtual-hosted or path-style S3 URL.
    Returns (bucket, key, region) or None if not an S3 URL.
    """
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return None
        host = parsed.netloc.lower()
        path = (parsed.path or "").lstrip("/")
        # Virtual-hosted: bucket.s3.region.amazonaws.com or bucket.s3.amazonaws.com
        if ".s3." in host and "amazonaws.com" in host:
            parts = host.replace(".amazonaws.com", "").split(".s3.")
            bucket = parts[0]
            region = parts[1] if len(parts) > 1 else AWS_REGION
            return (bucket, path, region)
        # Path-style: s3.region.amazonaws.com/bucket/key
        if host.startswith("s3.") and "amazonaws.com" in host:
            region = host.replace(".amazonaws.com", "").replace("s3.", "")
            if "/" not in path:
                return None
            bucket, _, key = path.partition("/")
            return (bucket, key, region or AWS_REGION)
        return None
    except Exception:
        return None


def _download_image_to_temp(url: str, suffix: str = ".jpg") -> Optional[str]:
    """
    Download image to a temp file. Uses boto3 (S3) when url is S3 and credentials
    are set, otherwise falls back to requests.get (for public URLs).
    """
    s3_parsed = _parse_s3_url(url)
    if s3_parsed and (os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_SECRET_ACCESS_KEY")):
        bucket, key, region = s3_parsed
        try:
            s3 = S3Client(bucket_name=bucket, region=region)
            fd, path = tempfile.mkstemp(suffix=suffix)
            os.close(fd)
            if s3.download_file(s3_key=key, local_path=path):
                return path
            try:
                os.unlink(path)
            except OSError:
                pass
            return None
        except Exception as e:
            logger.error("S3 download failed for %s: %s", url[:80], e)
            return None

    try:
        r = requests.get(url, timeout=60, stream=True)
        r.raise_for_status()
        fd, path = tempfile.mkstemp(suffix=suffix)
        with os.fdopen(fd, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return path
    except Exception as e:
        logger.error("Download failed for %s: %s", url[:80], e)
        return None


def _bbox_to_box(bbox: List[Any]) -> Dict[str, int]:
    """Convert [x1, y1, x2, y2] to {x, y, width, height}. Handles str/int/float (e.g. from Pinecone metadata)."""
    if len(bbox) < 4:
        return {}
    try:
        x1, y1, x2, y2 = (float(bbox[i]) for i in range(4))
    except (TypeError, ValueError):
        return {}
    return {"x": int(x1), "y": int(y1), "width": int(x2 - x1), "height": int(y2 - y1)}


def process_photo_job(photo_id: str, vector_db: VectorDBService) -> bool:
    """
    Flow: get photo -> download -> extract faces -> get guest encodings ->
    for each face search Pinecone (samples for this wedding) -> create PhotoTags ->
    upsert face vectors -> update Photo and Queue.
    """
    photo = get_photo(photo_id)
    if not photo:
        patch_processing_queue(photo_id, status="failed", error_message="Photo not found")
        return False

    wedding_id = photo.get("wedding", {}).get("id") or photo.get("weddingId")
    if not wedding_id:
        patch_processing_queue(
            photo_id, status="failed", error_message="Missing weddingId"
        )
        return False

    original_url = photo.get("originalUrl")
    if not original_url:
        patch_processing_queue(
            photo_id, status="failed", error_message="Missing originalUrl"
        )
        return False

    started_at = time.time()
    patch_processing_queue(
        photo_id,
        status="processing",
        started_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(started_at)),
    )
    patch_photo(photo_id, processing_status="processing")

    local_path = _download_image_to_temp(original_url)
    if not local_path:
        patch_photo(photo_id, processing_status="failed", ai_error_message="Download failed")
        patch_processing_queue(
            photo_id,
            status="failed",
            error_message="Download failed",
            completed_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
        return False

    try:
        face_processor = FaceProcessor()
        faces = face_processor.extract_faces(local_path, min_confidence=0.5)
    except Exception as e:
        logger.exception("Face extraction failed for %s", photo_id)
        patch_photo(photo_id, processing_status="failed", ai_error_message=str(e))
        patch_processing_queue(
            photo_id,
            status="failed",
            error_message=str(e),
            completed_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
        try:
            os.unlink(local_path)
        except OSError:
            pass
        return False

    num_faces = len(faces)
    matches_created = 0
    wedding_id_str = str(wedding_id)
    filter_samples = {"wedding_id": wedding_id_str, "type": "sample"}

    for face_index, face_data in enumerate(faces):
        embedding = face_data["embedding"]
        bbox = face_data.get("bbox", [0, 0, 0, 0])
        confidence = face_data.get("confidence", 0)
        face_encoding_id = f"photo:{photo_id}:{face_index}"

        # Search existing samples for this wedding
        search_results = vector_db.search_similar_faces(
            query_embedding=embedding,
            top_k=5,
            min_score=SIMILARITY_THRESHOLD,
            filter_metadata=filter_samples,
        )

        guest_id = None
        user_id = None
        best_score = None
        if search_results:
            best = search_results[0]
            best_score = best.get("score")
            guest_id = best.get("guest_id")
            user_id = best.get("user_id")
            if best_score and (guest_id or user_id):
                matches_created += 1

        # Create PhotoTag
        post_photo_tag(
            photo_id,
            guest_id=guest_id,
            user_id=user_id,
            confidence_score=float(best_score) if best_score is not None else None,
            bounding_box=_bbox_to_box(bbox),
            face_encoding_id=face_encoding_id,
        )

        # Upsert this face to Pinecone (photo type)
        metadata = {
            "type": "photo",
            "wedding_id": wedding_id_str,
            "photo_id": photo_id,
            "face_index": face_index,
            "bbox": bbox,
            "confidence": confidence,
            "photo_url": original_url,
        }
        if guest_id:
            metadata["guest_id"] = guest_id
        if user_id is not None:
            metadata["user_id"] = str(user_id)
        vector_db.upsert_face(face_encoding_id, embedding, metadata)

    try:
        os.unlink(local_path)
    except OSError:
        pass

    processing_time_ms = int((time.time() - started_at) * 1000)
    processed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    patch_photo(
        photo_id,
        processing_status="completed",
        faces_detected=num_faces,
        processed_at=processed_at,
    )
    patch_processing_queue(
        photo_id,
        status="completed",
        faces_found=num_faces,
        matches_created=matches_created,
        completed_at=processed_at,
        processing_time_ms=processing_time_ms,
    )
    logger.info(
        "Photo %s done: %d faces, %d matches, %d ms",
        photo_id,
        num_faces,
        matches_created,
        processing_time_ms,
    )
    return True


def _match_sample_to_photo_faces(
    vector_db: VectorDBService,
    *,
    embedding: List[float],
    guest_id: Optional[str],
    user_id: Optional[int],
    wedding_ids: List[str],
) -> int:
    """
    When a new face sample is added, search existing photo faces in Pinecone
    and create PhotoTags for matches. This avoids reprocessing every photo
    (face -> image refs; one search instead of N photo jobs).
    Returns the number of tags created.
    """
    matches = vector_db.search_photo_faces(
        query_embedding=embedding,
        wedding_ids=wedding_ids,
        top_k=500,
        min_score=SIMILARITY_THRESHOLD,
    )
    created = 0
    for match in matches:
        photo_id = match.get("photo_id")
        if not photo_id:
            continue
        bbox_raw = match.get("bbox")
        if isinstance(bbox_raw, list) and len(bbox_raw) >= 4:
            bounding_box = _bbox_to_box(bbox_raw)
        else:
            bounding_box = None
        ok = post_photo_tag(
            photo_id,
            guest_id=guest_id,
            user_id=user_id,
            confidence_score=float(match["score"]) if match.get("score") is not None else None,
            bounding_box=bounding_box,
            face_encoding_id=match.get("face_id"),
        )
        if ok:
            created += 1
    if wedding_ids:
        logger.info(
            "Sample matched to %d photo faces (weddings: %s)",
            created,
            len(wedding_ids),
        )
    return created


def process_face_sample_job(
    payload: Dict[str, Any], vector_db: VectorDBService
) -> bool:
    """
    Payload: { userId, guestId?, imageUrl }.
    Download image -> extract single face -> generate faceEncodingId ->
    upsert to Pinecone (type=sample) -> create FaceSample via API ->
    update Guest and/or User -> push reprocess_wedding for wedding(s).
    """
    user_id = payload.get("userId")
    guest_id = payload.get("guestId")
    image_url = payload.get("imageUrl")
    if not image_url:
        logger.error("face_sample job missing imageUrl")
        return False

    local_path = _download_image_to_temp(image_url)
    if not local_path:
        return False

    try:
        face_processor = FaceProcessor()
        face_data = face_processor.extract_single_face(local_path)
    finally:
        try:
            os.unlink(local_path)
        except OSError:
            pass

    if not face_data:
        logger.error("No face detected in face sample image")
        return False

    embedding = face_data["embedding"]
    quality = float(face_data.get("confidence", 0.9))

    # Unique ID for this sample
    face_encoding_id = (
        f"sample:guest:{guest_id}:0" if guest_id else f"sample:user:{user_id}:0"
    )

    wedding_id = payload.get("weddingId")

    if guest_id and wedding_id:
        metadata = {
            "type": "sample",
            "wedding_id": str(wedding_id),
            "guest_id": guest_id,
            "face_index": 0,
            "confidence": quality,
            "sample_source": "upload",
            "is_primary": True,
        }
        vector_db.upsert_face(face_encoding_id, embedding, metadata)
    else:
        # User sample: upsert one vector per wedding (guest + host) so photo search finds them
        guest_wedding_ids = payload.get("weddingIds") or []
        hosted_wedding_ids = payload.get("hostedWeddingIds") or []
        wedding_ids = list(set(guest_wedding_ids + hosted_wedding_ids))
        for idx, wid in enumerate(wedding_ids):
            vid = face_encoding_id if idx == 0 else f"sample:user:{user_id}:{idx}"
            meta = {
                "type": "sample",
                "wedding_id": str(wid),
                "user_id": str(user_id),
                "face_index": 0,
                "confidence": quality,
                "sample_source": "upload",
                "is_primary": True,
            }
            vector_db.upsert_face(vid, embedding, meta)
        if not wedding_ids:
            # No weddings: still store one vector without wedding_id (won't match photo search by wedding)
            meta = {
                "type": "sample",
                "user_id": str(user_id),
                "face_index": 0,
                "confidence": quality,
                "sample_source": "upload",
                "is_primary": True,
            }
            vector_db.upsert_face(face_encoding_id, embedding, meta)

    post_face_sample(
        user_id=user_id,
        guest_id=guest_id,
        sample_image_url=image_url,
        thumbnail_url=image_url,
        face_encoding_id=face_encoding_id,
        encoding_quality=quality,
        is_primary=True,
        source="upload",
    )

    if guest_id:
        patch_guest(
            guest_id,
            face_encoding_id=face_encoding_id,
            face_sample_provided=True,
            photos_processed=False,
        )
        if wedding_id:
            created = _match_sample_to_photo_faces(
                vector_db,
                embedding=embedding,
                guest_id=guest_id,
                user_id=None,
                wedding_ids=[str(wedding_id)],
            )
            if created == 0:
                _queue_photo_process_for_weddings([str(wedding_id)])
    else:
        patch_user(
            user_id,
            face_encoding_id=face_encoding_id,
            face_sample_uploaded=True,
        )
        wedding_ids = list(
            set(
                (payload.get("weddingIds") or [])
                + (payload.get("hostedWeddingIds") or [])
            )
        )
        if wedding_ids:
            wedding_ids_str = [str(w) for w in wedding_ids]
            created = _match_sample_to_photo_faces(
                vector_db,
                embedding=embedding,
                guest_id=None,
                user_id=user_id,
                wedding_ids=wedding_ids_str,
            )
            if created == 0:
                _queue_photo_process_for_weddings(wedding_ids_str)
    return True


def _queue_photo_process_for_weddings(wedding_ids: List[str]) -> None:
    """
    When no photo faces exist in Pinecone yet (e.g. sample added before photos
    were processed), queue photo_process for all photos in these weddings.
    When those jobs run they will search samples and create tags.
    """
    redis_client = _redis()
    total = 0
    for wid in wedding_ids:
        photo_ids = get_wedding_photo_ids(wid)
        for pid in photo_ids:
            redis_client.xadd_event(
                STREAM_KEY, "photo_process", {"photoId": pid}, max_len=10000
            )
            total += 1
    if total:
        logger.info(
            "No photo faces in index yet; queued %d photos for processing (weddings: %s)",
            total,
            len(wedding_ids),
        )


def process_reprocess_wedding_job(payload: Dict[str, Any]) -> bool:
    """Payload: { weddingId }. Re-queue all photos in wedding for photo_process."""
    wedding_id = payload.get("weddingId")
    if not wedding_id:
        return False
    photo_ids = get_wedding_photo_ids(wedding_id)
    redis_client = _redis()
    for photo_id in photo_ids:
        redis_client.xadd_event(STREAM_KEY, "photo_process", {"photoId": photo_id}, max_len=10000)
    logger.info("Re-queued %d photos for wedding %s", len(photo_ids), wedding_id)
    return True


def run_worker():
    """Main loop: create consumer group, read from stream, dispatch, ack."""
    # Ensure logging works when run via launcher (not as __main__)
    import sys
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stderr,
        force=True,
    )
    # Force stderr to flush so logs show under uv run
    if hasattr(sys.stderr, "reconfigure"):
        try:
            sys.stderr.reconfigure(line_buffering=True)
        except Exception:
            pass
    print("Worker getting ready", flush=True)
    logger.info("Initialising redis...")
    redis_client = _redis()
    if not redis_client.is_ready():
        logger.error("Redis not ready; worker exiting")
        return

    redis_client.create_consumer_group(STREAM_KEY, CONSUMER_GROUP)

    vector_db = VectorDBService(
        api_key=PINECONE_API_KEY,
        index_name=PINECONE_INDEX,
        dimension=512,
    )

    logger.info(
        "Worker started, reading from %s (block 5s; no message = idle)",
        STREAM_KEY,
    )
    idle_cycles = 0
    while True:
        if idle_cycles == 0:
            logger.info("Waiting for jobs...")
        messages = redis_client.read_from_group(
            STREAM_KEY,
            CONSUMER_GROUP,
            CONSUMER_NAME,
            count=1,
            block_ms=5000,
        )
        if not messages:
            idle_cycles += 1
            # Log every ~30s so the terminal isn't silent
            if idle_cycles % 6 == 1 and idle_cycles > 1:
                logger.info("Idle, waiting for jobs...")
            continue
        idle_cycles = 0
        for message_id, fields in messages:
            event = fields.get("event", "")
            payload_str = fields.get("payload", "{}")
            try:
                payload = json.loads(payload_str) if payload_str else {}
            except json.JSONDecodeError:
                payload = {}

            try:
                if event == "photo_process":
                    photo_id = payload.get("photoId")
                    if photo_id:
                        process_photo_job(photo_id, vector_db)
                elif event == "face_sample":
                    process_face_sample_job(payload, vector_db)
                elif event == "reprocess_wedding":
                    process_reprocess_wedding_job(payload)
                else:
                    logger.warning("Unknown event: %s", event)
            except Exception as e:
                logger.exception("Job failed for %s: %s", event, e)
            finally:
                redis_client.acknowledge(STREAM_KEY, CONSUMER_GROUP, message_id)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    run_worker()
