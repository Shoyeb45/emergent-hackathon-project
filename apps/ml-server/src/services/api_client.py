"""
Internal API client for the ML worker.
Calls Express internal routes with x-internal-secret.
"""
import os
import logging
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

API_BASE = os.getenv("API_BASE_URL", "http://localhost:9090")
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "")


def _headers() -> Dict[str, str]:
    return {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET or "",
    }


def get_photo(photo_id: str) -> Optional[Dict[str, Any]]:
    """GET /internal/photos/:photoId"""
    try:
        r = requests.get(
            f"{API_BASE}/internal/photos/{photo_id}",
            headers=_headers(),
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("data") if isinstance(data, dict) else data
    except requests.RequestException as e:
        logger.error("get_photo failed for %s: %s", photo_id, e)
        return None


def patch_photo(
    photo_id: str,
    *,
    processing_status: Optional[str] = None,
    faces_detected: Optional[int] = None,
    processed_at: Optional[str] = None,
    ai_error_message: Optional[str] = None,
) -> bool:
    """PATCH /internal/photos/:photoId"""
    body: Dict[str, Any] = {}
    if processing_status is not None:
        body["processingStatus"] = processing_status
    if faces_detected is not None:
        body["facesDetected"] = faces_detected
    if processed_at is not None:
        body["processedAt"] = processed_at
    if ai_error_message is not None:
        body["aiErrorMessage"] = ai_error_message
    if not body:
        return True
    try:
        r = requests.patch(
            f"{API_BASE}/internal/photos/{photo_id}",
            json=body,
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("patch_photo failed for %s: %s", photo_id, e)
        return False


def get_guest_encodings(wedding_id: str) -> List[Dict[str, Any]]:
    """GET /internal/weddings/:weddingId/guest-encodings"""
    try:
        r = requests.get(
            f"{API_BASE}/internal/weddings/{wedding_id}/guest-encodings",
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        payload = data.get("data", data) if isinstance(data, dict) else data
        if isinstance(payload, list):
            return payload
        return payload.get("guestEncodings", payload.get("guests", [])) or []
    except requests.RequestException as e:
        logger.error("get_guest_encodings failed for %s: %s", wedding_id, e)
        return []


def post_photo_tag(
    photo_id: str,
    *,
    guest_id: Optional[str] = None,
    user_id: Optional[int] = None,
    confidence_score: Optional[float] = None,
    bounding_box: Optional[Dict[str, int]] = None,
    face_encoding_id: Optional[str] = None,
) -> bool:
    """POST /internal/photo-tags"""
    body: Dict[str, Any] = {"photoId": photo_id}
    if guest_id is not None:
        body["guestId"] = guest_id
    if user_id is not None:
        body["userId"] = user_id
    if confidence_score is not None:
        body["confidenceScore"] = confidence_score
    if bounding_box is not None:
        body["boundingBox"] = bounding_box
    if face_encoding_id is not None:
        body["faceEncodingId"] = face_encoding_id
    try:
        r = requests.post(
            f"{API_BASE}/internal/photo-tags",
            json=body,
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("post_photo_tag failed: %s", e)
        return False


def patch_processing_queue(
    photo_id: str,
    *,
    status: Optional[str] = None,
    started_at: Optional[str] = None,
    faces_found: Optional[int] = None,
    matches_created: Optional[int] = None,
    completed_at: Optional[str] = None,
    error_message: Optional[str] = None,
    processing_time_ms: Optional[int] = None,
) -> bool:
    """PATCH /internal/processing-queue/:photoId"""
    body: Dict[str, Any] = {}
    if status is not None:
        body["status"] = status
    if started_at is not None:
        body["startedAt"] = started_at
    if faces_found is not None:
        body["facesFound"] = faces_found
    if matches_created is not None:
        body["matchesCreated"] = matches_created
    if completed_at is not None:
        body["completedAt"] = completed_at
    if error_message is not None:
        body["errorMessage"] = error_message
    if processing_time_ms is not None:
        body["processingTimeMs"] = processing_time_ms
    if not body:
        return True
    try:
        r = requests.patch(
            f"{API_BASE}/internal/processing-queue/{photo_id}",
            json=body,
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("patch_processing_queue failed for %s: %s", photo_id, e)
        return False


def post_face_sample(
    *,
    user_id: Optional[int] = None,
    guest_id: Optional[str] = None,
    sample_image_url: str,
    thumbnail_url: Optional[str] = None,
    face_encoding_id: str,
    encoding_quality: Optional[float] = None,
    is_primary: bool = True,
    source: str = "upload",
) -> bool:
    """POST /internal/face-samples"""
    body: Dict[str, Any] = {
        "sampleImageUrl": sample_image_url,
        "faceEncodingId": face_encoding_id,
        "isPrimary": is_primary,
        "source": source,
    }
    if user_id is not None:
        body["userId"] = user_id
    if guest_id is not None:
        body["guestId"] = guest_id
    if thumbnail_url is not None:
        body["thumbnailUrl"] = thumbnail_url
    if encoding_quality is not None:
        body["encodingQuality"] = encoding_quality
    try:
        r = requests.post(
            f"{API_BASE}/internal/face-samples",
            json=body,
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("post_face_sample failed: %s", e)
        return False


def patch_guest(
    guest_id: str,
    *,
    face_encoding_id: Optional[str] = None,
    face_sample_provided: Optional[bool] = None,
    photos_processed: Optional[bool] = None,
) -> bool:
    """PATCH /internal/guests/:guestId"""
    body: Dict[str, Any] = {}
    if face_encoding_id is not None:
        body["faceEncodingId"] = face_encoding_id
    if face_sample_provided is not None:
        body["faceSampleProvided"] = face_sample_provided
    if photos_processed is not None:
        body["photosProcessed"] = photos_processed
    if not body:
        return True
    try:
        r = requests.patch(
            f"{API_BASE}/internal/guests/{guest_id}",
            json=body,
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("patch_guest failed for %s: %s", guest_id, e)
        return False


def patch_user(
    user_id: int,
    *,
    face_encoding_id: Optional[str] = None,
    face_sample_uploaded: Optional[bool] = None,
) -> bool:
    """PATCH /internal/users/:userId"""
    body: Dict[str, Any] = {}
    if face_encoding_id is not None:
        body["faceEncodingId"] = face_encoding_id
    if face_sample_uploaded is not None:
        body["faceSampleUploaded"] = face_sample_uploaded
    if not body:
        return True
    try:
        r = requests.patch(
            f"{API_BASE}/internal/users/{user_id}",
            json=body,
            headers=_headers(),
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error("patch_user failed for %s: %s", user_id, e)
        return False


def get_wedding_photo_ids(wedding_id: str) -> List[str]:
    """GET /internal/weddings/:weddingId/photo-ids"""
    try:
        r = requests.get(
            f"{API_BASE}/internal/weddings/{wedding_id}/photo-ids",
            headers=_headers(),
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        payload = data.get("data", data) if isinstance(data, dict) else data
        return payload.get("photoIds", []) or []
    except requests.RequestException as e:
        logger.error("get_wedding_photo_ids failed for %s: %s", wedding_id, e)
        return []
