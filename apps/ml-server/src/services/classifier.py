import os
from typing import List, Dict, Optional
from .face_processor import FaceProcessor
from .vector_db import VectorDBService
from .s3_client import S3Client
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class PhotoClassifier:
    """
    Core logic for classifying photos by faces and finding matches
    """
    
    def __init__(self, s3_client: S3Client, vector_db: VectorDBService):
        self.face_processor = FaceProcessor()
        self.s3_client = s3_client
        self.vector_db = vector_db
    
    def classify_and_store_photo(
        self, 
        photo_id: str, 
        s3_key: str, 
        user_id: str,
        local_temp_path: str = '/tmp'
    ) -> Dict:
        """
        Main classification logic:
        1. Download photo from S3
        2. Extract all faces
        3. Store embeddings in vector DB
        4. Upload face thumbnails to S3
        5. Return classification results
        
        Args:
            photo_id: Unique photo identifier
            s3_key: S3 object key
            user_id: User who uploaded the photo
            
        Returns:
            {
                'photo_id': str,
                'faces_detected': int,
                'faces_stored': int,
                'face_ids': List[str],
                'processing_time': float
            }
        """
        import time
        start_time = time.time()
        
        try:
            # 1. Download photo from S3
            local_path = os.path.join(local_temp_path, f"{photo_id}.jpg")
            self.s3_client.download_file(s3_key, local_path)
            logger.info(f"Downloaded {s3_key} to {local_path}")
            
            # 2. Extract faces
            faces = self.face_processor.extract_faces(local_path, min_confidence=0.6)
            
            if not faces:
                logger.warning(f"No faces detected in photo {photo_id}")
                return {
                    'photo_id': photo_id,
                    'faces_detected': 0,
                    'faces_stored': 0,
                    'face_ids': [],
                    'processing_time': time.time() - start_time
                }
            
            # 3. Prepare faces for vector DB
            face_records = []
            face_ids = []
            
            for idx, face in enumerate(faces):
                face_id = f"{photo_id}:face_{idx}"
                face_ids.append(face_id)
                
                # Crop and upload thumbnail
                face_crop = self.face_processor.crop_face(local_path, face['bbox'])
                thumbnail_key = f"thumbnails/{user_id}/{photo_id}_face_{idx}.jpg"
                thumbnail_url = self.s3_client.upload_image(face_crop, thumbnail_key)
                
                # Prepare metadata
                metadata = {
                    'photo_id': photo_id,
                    'user_id': user_id,
                    'bbox': face['bbox'],
                    's3_url': self.s3_client.get_url(s3_key),
                    'thumbnail_url': thumbnail_url,
                    'confidence': face['confidence'],
                    'upload_timestamp': datetime.utcnow().isoformat(),
                    'face_index': idx
                }
                
                face_records.append({
                    'id': face_id,
                    'embedding': face['embedding'],
                    'metadata': metadata
                })
            
            # 4. Batch insert to vector DB
            stored_count = self.vector_db.upsert_faces_batch(face_records)
            
            # 5. Cleanup
            os.remove(local_path)
            
            processing_time = time.time() - start_time
            logger.info(f"Classified photo {photo_id}: {len(faces)} faces in {processing_time:.2f}s")
            
            return {
                'photo_id': photo_id,
                'faces_detected': len(faces),
                'faces_stored': stored_count,
                'face_ids': face_ids,
                'processing_time': processing_time
            }
            
        except Exception as e:
            logger.error(f"Error classifying photo {photo_id}: {str(e)}")
            raise
    
    def find_matching_photos(
        self, 
        query_image_path: str,
        top_k: int = 100,
        min_similarity: float = 0.5,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Find all photos containing the queried face
        
        Args:
            query_image_path: Path to query image (user's selfie)
            top_k: Maximum results to return
            min_similarity: Minimum similarity threshold (0-1)
            user_id: Optional filter by user
            
        Returns:
            {
                'query_face_found': bool,
                'total_matches': int,
                'photos': List[{
                    'photo_id': str,
                    'match_score': float,
                    'face_count': int,  # How many faces in this photo match
                    's3_url': str,
                    'thumbnail_url': str,
                    'faces': List[{...}]  # Individual face matches
                }]
            }
        """
        import time
        start_time = time.time()
        
        try:
            # 1. Extract face from query image
            query_face = self.face_processor.extract_single_face(query_image_path)
            
            if not query_face:
                logger.warning("No face detected in query image")
                return {
                    'query_face_found': False,
                    'total_matches': 0,
                    'photos': [],
                    'processing_time': time.time() - start_time
                }
            
            # 2. Search vector database
            filter_metadata = {'user_id': user_id} if user_id else None
            
            matches = self.vector_db.search_similar_faces(
                query_embedding=query_face['embedding'],
                top_k=top_k,
                min_score=min_similarity,
                filter_metadata=filter_metadata
            )
            
            # 3. Group by photo_id and aggregate scores
            photos_dict = {}
            
            for match in matches:
                photo_id = match['photo_id']
                
                if photo_id not in photos_dict:
                    photos_dict[photo_id] = {
                        'photo_id': photo_id,
                        'max_score': match['score'],
                        'avg_score': match['score'],
                        'face_count': 1,
                        's3_url': match['s3_url'],
                        'user_id': match.get('user_id'),
                        'faces': [match]
                    }
                else:
                    photo = photos_dict[photo_id]
                    photo['face_count'] += 1
                    photo['max_score'] = max(photo['max_score'], match['score'])
                    photo['avg_score'] = (photo['avg_score'] * (photo['face_count'] - 1) + match['score']) / photo['face_count']
                    photo['faces'].append(match)
            
            # 4. Sort by best match score
            sorted_photos = sorted(
                photos_dict.values(),
                key=lambda x: x['max_score'],
                reverse=True
            )
            
            processing_time = time.time() - start_time
            
            logger.info(f"Found {len(sorted_photos)} photos with matching faces in {processing_time:.2f}s")
            
            return {
                'query_face_found': True,
                'total_matches': len(sorted_photos),
                'photos': sorted_photos,
                'processing_time': processing_time,
                'query_confidence': query_face['confidence']
            }
            
        except Exception as e:
            logger.error(f"Error finding matching photos: {str(e)}")
            raise
    
    def get_similarity_label(self, score: float) -> str:
        """Convert similarity score to human-readable label"""
        if score >= 0.7:
            return "Very High Match"
        elif score >= 0.6:
            return "High Match"
        elif score >= 0.5:
            return "Moderate Match"
        elif score >= 0.4:
            return "Low Match"
        else:
            return "Very Low Match"