from typing import List, Dict, Optional
import numpy as np
from pinecone import Pinecone, ServerlessSpec

# OR for Milvus:
# from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType
import logging

logger = logging.getLogger(__name__)


def _pinecone_metadata(value):
    """
    Convert a value to a type Pinecone accepts: str, int, float, bool, or list of str.
    """
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (list, tuple)):
        if not value:
            return []
        if all(isinstance(x, str) for x in value):
            return list(value)
        return [str(x) for x in value]
    return str(value)


def _sanitize_metadata(metadata: Dict) -> Dict:
    """Ensure all metadata values are Pinecone-acceptable."""
    return {k: _pinecone_metadata(v) for k, v in metadata.items() if v is not None}


class VectorDBService:
    """
    Handles vector storage and similarity search
    Using Pinecone as example (similar pattern for Milvus)
    """

    def __init__(
        self, api_key: str, index_name: str = "face-embeddings", dimension: int = 512
    ):
        self.pc = Pinecone(api_key=api_key)
        self.index_name = index_name
        self.dimension = dimension

        # Create index if doesn't exist
        if index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=index_name,
                dimension=dimension,
                metric="cosine",  # cosine similarity for face embeddings
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )

        self.index = self.pc.Index(index_name)
        logger.info(f"Connected to Pinecone index: {index_name}")

    def upsert_face(self, face_id: str, embedding: List[float], metadata: Dict) -> bool:
        """
        Store a single face embedding

        Args:
            face_id: Unique identifier (format: photo_id:face_index)
            embedding: 512-dim face embedding
            metadata: {
                'photo_id': str,
                'user_id': str,
                'bbox': [x1, y1, x2, y2],
                's3_url': str,
                'thumbnail_url': str,
                'confidence': float,
                'upload_timestamp': str
            }
        """
        try:
            safe_meta = _sanitize_metadata(metadata)
            self.index.upsert(
                vectors=[{"id": face_id, "values": embedding, "metadata": safe_meta}]
            )
            logger.debug(f"Upserted face: {face_id}")
            return True
        except Exception as e:
            logger.error(f"Error upserting face {face_id}: {str(e)}")
            return False

    def upsert_faces_batch(self, faces: List[Dict]) -> int:
        """
        Batch insert multiple faces

        Args:
            faces: List of dicts with 'id', 'embedding', 'metadata'

        Returns:
            Number of successfully inserted faces
        """
        try:
            vectors = [
                {
                    "id": face["id"],
                    "values": face["embedding"],
                    "metadata": _sanitize_metadata(face.get("metadata") or {}),
                }
                for face in faces
            ]

            # Pinecone recommends batches of 100
            batch_size = 100
            success_count = 0

            for i in range(0, len(vectors), batch_size):
                batch = vectors[i : i + batch_size]
                self.index.upsert(vectors=batch)
                success_count += len(batch)

            logger.info(f"Batch upserted {success_count} faces")
            return success_count

        except Exception as e:
            logger.error(f"Error batch upserting: {str(e)}")
            return 0

    def search_similar_faces(
        self,
        query_embedding: List[float],
        top_k: int = 100,
        min_score: float = 0.4,
        filter_metadata: Optional[Dict] = None,
    ) -> List[Dict]:
        """
        Find most similar faces

        Args:
            query_embedding: Face embedding to search for
            top_k: Number of results to return
            min_score: Minimum similarity score (0-1)
            filter_metadata: Optional filters e.g., {'user_id': 'xyz'}

        Returns:
            List of matches with scores and metadata
        """
        try:
            # Query vector database
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_metadata,
            )

            # Filter by minimum score and format results
            matches = []
            meta = results.get("matches", [])
            for match in meta:
                m = match.get("metadata") or {}
                if match.get("score", 0) >= min_score:
                    matches.append(
                        {
                            "face_id": match["id"],
                            "score": match["score"],
                            "photo_id": m.get("photo_id"),
                            "guest_id": m.get("guest_id"),
                            "user_id": m.get("user_id"),
                            "s3_url": m.get("s3_url") or m.get("photo_url"),
                            "thumbnail_url": m.get("thumbnail_url"),
                            "bbox": m.get("bbox"),
                            "confidence": m.get("confidence"),
                        }
                    )

            logger.info(f"Found {len(matches)} matches above threshold {min_score}")
            return matches

        except Exception as e:
            logger.error(f"Error searching similar faces: {str(e)}")
            return []

    def delete_faces_by_photo(self, photo_id: str) -> bool:
        """Delete all faces belonging to a photo"""
        try:
            # Pinecone delete by metadata filter
            self.index.delete(filter={"photo_id": photo_id})
            logger.info(f"Deleted faces for photo: {photo_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting faces for {photo_id}: {str(e)}")
            return False

    def get_stats(self) -> Dict:
        """Get index statistics"""
        return self.index.describe_index_stats()

    def fetch_vectors(self, ids: List[str]) -> Dict[str, Dict]:
        """
        Fetch vectors and metadata by IDs.
        Returns dict mapping id -> {"values": [...], "metadata": {...}}
        """
        try:
            result = self.index.fetch(ids=ids)
            vectors = result.get("vectors", {})
            return {
                vid: {
                    "values": info.get("values"),
                    "metadata": info.get("metadata") or {},
                }
                for vid, info in vectors.items()
            }
        except Exception as e:
            logger.error("fetch_vectors failed: %s", e)
            return {}
