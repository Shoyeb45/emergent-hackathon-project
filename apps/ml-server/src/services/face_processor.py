import numpy as np
import insightface
from insightface.app import FaceAnalysis
import cv2
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class FaceProcessor:
    def __init__(self, model_name="buffalo_l", det_size=(640, 640)):
        """
        Initialize InsightFace model
        buffalo_l: High accuracy model
        det_size: Detection size (larger = more accurate but slower)
        """
        self.app = FaceAnalysis(
            # name=model_name, providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
            name=model_name, providers=["CPUExecutionProvider"]
        )
        self.app.prepare(ctx_id=0, det_size=det_size)
        logger.info(f"FaceProcessor initialized with model: {model_name}")

    def extract_faces(self, image_path: str, min_confidence: float = 0.5) -> List[Dict]:
        """
        Extract all faces from an image with their embeddings

        Returns:
            List of dicts containing:
            - embedding: 512-dim vector
            - bbox: [x1, y1, x2, y2]
            - confidence: detection confidence
            - landmarks: facial landmarks
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Cannot read image: {image_path}")

            # Detect faces
            faces = self.app.get(img)

            results = []
            for idx, face in enumerate(faces):
                # Filter by confidence
                if face.det_score < min_confidence:
                    logger.debug(
                        f"Skipping face {idx} with low confidence: {face.det_score}"
                    )
                    continue

                # Normalize embedding (InsightFace embeddings are already L2 normalized)
                embedding = face.embedding

                # Extract face data
                face_data = {
                    "embedding": embedding.tolist(),  # Convert to list for JSON serialization
                    "bbox": face.bbox.astype(int).tolist(),  # [x1, y1, x2, y2]
                    "confidence": float(face.det_score),
                    "landmarks": (
                        face.kps.astype(int).tolist() if hasattr(face, "kps") else None
                    ),
                    "face_area": self._calculate_face_area(face.bbox),
                    # Optional: age, gender if you need them
                    "age": int(face.age) if hasattr(face, "age") else None,
                    "gender": int(face.gender) if hasattr(face, "gender") else None,
                }

                results.append(face_data)

            logger.info(f"Extracted {len(results)} faces from {image_path}")
            return results

        except Exception as e:
            logger.error(f"Error extracting faces from {image_path}: {str(e)}")
            raise

    def extract_single_face(self, image_path: str) -> Optional[Dict]:
        """
        Extract the most prominent face (largest face area)
        Useful for query images where user uploads their photo
        """
        faces = self.extract_faces(image_path)

        if not faces:
            return None

        # Return face with largest area
        return max(faces, key=lambda x: x["face_area"])

    def extract_embedding_from_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """
        Extract embedding directly from image bytes
        Useful for API endpoints
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            faces = self.app.get(img)

            if not faces:
                return None

            # Return largest face embedding
            largest_face = max(faces, key=lambda x: self._calculate_face_area(x.bbox))
            return largest_face.embedding

        except Exception as e:
            logger.error(f"Error processing image bytes: {str(e)}")
            return None

    def compare_embeddings(
        self, embedding1: np.ndarray, embedding2: np.ndarray
    ) -> float:
        """
        Calculate similarity between two embeddings
        Returns cosine similarity (-1 to 1, higher = more similar)

        For face matching:
        - > 0.6: Very likely same person
        - 0.4-0.6: Possibly same person
        - < 0.4: Different person
        """
        # Ensure normalized
        embedding1 = embedding1 / np.linalg.norm(embedding1)
        embedding2 = embedding2 / np.linalg.norm(embedding2)

        # Cosine similarity
        similarity = np.dot(embedding1, embedding2)
        return float(similarity)

    @staticmethod
    def _calculate_face_area(bbox):
        """Calculate bounding box area"""
        return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])

    def crop_face(
        self, image_path: str, bbox: List[int], margin: float = 0.2
    ) -> np.ndarray:
        """
        Crop face from image with margin
        Useful for creating thumbnails
        """
        img = cv2.imread(image_path)
        x1, y1, x2, y2 = bbox

        # Add margin
        h, w = img.shape[:2]
        margin_x = int((x2 - x1) * margin)
        margin_y = int((y2 - y1) * margin)

        x1 = max(0, x1 - margin_x)
        y1 = max(0, y1 - margin_y)
        x2 = min(w, x2 + margin_x)
        y2 = min(h, y2 + margin_y)

        face_crop = img[y1:y2, x1:x2]
        return face_crop
