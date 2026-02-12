from services.classifier import PhotoClassifier
from services.vector_db import VectorDBService
from services.s3_client import S3Client
import os

# Initialize services
s3_client = S3Client(bucket_name='my-photo-bucket')
vector_db = VectorDBService(
    api_key=os.getenv('PINECONE_API_KEY'),
    index_name='face-embeddings'
)
classifier = PhotoClassifier(s3_client, vector_db)

# Example 1: Classify uploaded photo
result = classifier.classify_and_store_photo(
    photo_id='photo_123',
    s3_key='uploads/user_abc/photo_123.jpg',
    user_id='user_abc'
)
print(f"Detected {result['faces_detected']} faces in {result['processing_time']:.2f}s")

# Example 2: Find matching photos
matches = classifier.find_matching_photos(
    query_image_path='/tmp/query_selfie.jpg',
    top_k=50,
    min_similarity=0.6
)

print(f"Found {matches['total_matches']} matching photos")
for photo in matches['photos'][:5]:  # Top 5
    print(f"Photo: {photo['photo_id']}, Score: {photo['max_score']:.3f}, Faces: {photo['face_count']}")