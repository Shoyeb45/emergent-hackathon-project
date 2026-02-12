"""
Standalone Face Matching Test Script
No S3, no external services - pure local testing

Requirements:
pip install insightface onnxruntime opencv-python numpy pillow

Usage:
1. Place your photos in a 'test_photos' folder
2. Place your query photo (single person) in the same folder
3. Run: python test_face_matching.py
"""

import cv2
import numpy as np
from insightface.app import FaceAnalysis
from typing import List, Dict, Tuple
import os
from pathlib import Path
import json

class LocalFaceClassifier:
    def __init__(self):
        """Initialize InsightFace model"""
        print("🔄 Initializing InsightFace model...")
        self.app = FaceAnalysis(
            name='buffalo_l',  # High accuracy model
            providers=['CPUExecutionProvider']  # Use CPU (change to CUDA if you have GPU)
        )
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        
        # In-memory storage for face embeddings
        self.face_database = []  # List of {photo_path, face_idx, embedding, bbox}
        print("✅ Model loaded successfully!\n")
    
    def extract_faces(self, image_path: str, min_confidence: float = 0.5) -> List[Dict]:
        """
        Extract all faces from an image
        
        Returns:
            List of faces with embeddings and metadata
        """
        print(f"📸 Processing: {os.path.basename(image_path)}")
        
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot read image: {image_path}")
        
        # Detect faces
        faces = self.app.get(img)
        
        results = []
        for idx, face in enumerate(faces):
            if face.det_score < min_confidence:
                continue
            
            face_data = {
                'face_idx': idx,
                'embedding': face.embedding,  # 512-dim numpy array
                'bbox': face.bbox.astype(int).tolist(),  # [x1, y1, x2, y2]
                'confidence': float(face.det_score),
                'area': self._calculate_area(face.bbox)
            }
            results.append(face_data)
        
        print(f"   ✓ Found {len(results)} face(s)")
        return results
    
    def add_photos_to_database(self, photo_paths: List[str]):
        """
        Process multiple photos and store all detected faces
        """
        print("=" * 60)
        print("STEP 1: Building Face Database")
        print("=" * 60)
        
        for photo_path in photo_paths:
            faces = self.extract_faces(photo_path)
            
            for face in faces:
                self.face_database.append({
                    'photo_path': photo_path,
                    'photo_name': os.path.basename(photo_path),
                    'face_idx': face['face_idx'],
                    'embedding': face['embedding'],
                    'bbox': face['bbox'],
                    'confidence': face['confidence']
                })
        
        print(f"\n✅ Database built: {len(self.face_database)} total faces from {len(photo_paths)} photos\n")
    
    def find_matching_photos(
        self, 
        query_image_path: str, 
        threshold: float = 0.5
    ) -> Dict:
        """
        Find all photos containing the person in the query image
        
        Args:
            query_image_path: Path to single person photo
            threshold: Similarity threshold (0.4-0.7 recommended)
                      0.6+ = Very likely same person
                      0.4-0.6 = Possibly same person
                      <0.4 = Different person
        
        Returns:
            Dictionary with matching results
        """
        print("=" * 60)
        print("STEP 2: Searching for Matches")
        print("=" * 60)
        
        # Extract query face
        print(f"🔍 Query image: {os.path.basename(query_image_path)}")
        query_faces = self.extract_faces(query_image_path)
        
        if not query_faces:
            return {
                'success': False,
                'message': 'No face detected in query image',
                'matches': []
            }
        
        # Use the largest/most prominent face
        query_face = max(query_faces, key=lambda x: x['area'])
        query_embedding = query_face['embedding']
        
        print(f"   ✓ Query face extracted (confidence: {query_face['confidence']:.3f})\n")
        
        # Compare with all faces in database
        print(f"🔄 Comparing against {len(self.face_database)} faces...")
        matches = []
        
        for db_face in self.face_database:
            similarity = self._cosine_similarity(query_embedding, db_face['embedding'])
            
            if similarity >= threshold:
                matches.append({
                    'photo_path': db_face['photo_path'],
                    'photo_name': db_face['photo_name'],
                    'face_idx': db_face['face_idx'],
                    'similarity': similarity,
                    'bbox': db_face['bbox'],
                    'match_quality': self._get_match_label(similarity)
                })
        
        # Group by photo and sort by best similarity
        photo_matches = {}
        for match in matches:
            photo_name = match['photo_name']
            if photo_name not in photo_matches:
                photo_matches[photo_name] = {
                    'photo_path': match['photo_path'],
                    'photo_name': photo_name,
                    'best_similarity': match['similarity'],
                    'face_count': 1,
                    'faces': [match],
                    'match_quality': match['match_quality']
                }
            else:
                photo_matches[photo_name]['face_count'] += 1
                photo_matches[photo_name]['faces'].append(match)
                if match['similarity'] > photo_matches[photo_name]['best_similarity']:
                    photo_matches[photo_name]['best_similarity'] = match['similarity']
                    photo_matches[photo_name]['match_quality'] = match['match_quality']
        
        # Sort by similarity
        sorted_matches = sorted(
            photo_matches.values(),
            key=lambda x: x['best_similarity'],
            reverse=True
        )
        
        return {
            'success': True,
            'total_photos_matched': len(sorted_matches),
            'total_faces_matched': len(matches),
            'matches': sorted_matches
        }
    
    def visualize_results(self, query_path: str, results: Dict, output_dir: str = 'output'):
        """
        Create annotated images showing matches
        """
        if not results['success']:
            return
        
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n📊 Creating visualizations in '{output_dir}' folder...")
        
        # Draw boxes on matched photos
        for idx, match in enumerate(results['matches'], 1):
            img = cv2.imread(match['photo_path'])
            
            for face in match['faces']:
                bbox = face['bbox']
                similarity = face['similarity']
                
                # Draw bounding box
                color = (0, 255, 0) if similarity >= 0.6 else (0, 255, 255)
                cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 3)
                
                # Add similarity score
                label = f"{similarity:.3f}"
                cv2.putText(
                    img, label, (bbox[0], bbox[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2
                )
            
            # Save annotated image
            output_path = os.path.join(output_dir, f"match_{idx}_{match['photo_name']}")
            cv2.imwrite(output_path, img)
        
        print(f"   ✓ Saved {len(results['matches'])} annotated images")
    
    @staticmethod
    def _cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        # Normalize embeddings
        embedding1 = embedding1 / np.linalg.norm(embedding1)
        embedding2 = embedding2 / np.linalg.norm(embedding2)
        
        # Cosine similarity
        return float(np.dot(embedding1, embedding2))
    
    @staticmethod
    def _calculate_area(bbox):
        """Calculate bounding box area"""
        return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
    
    @staticmethod
    def _get_match_label(similarity: float) -> str:
        """Convert similarity score to label"""
        if similarity >= 0.7:
            return "EXCELLENT"
        elif similarity >= 0.6:
            return "VERY GOOD"
        elif similarity >= 0.5:
            return "GOOD"
        elif similarity >= 0.4:
            return "FAIR"
        else:
            return "POOR"


def print_results(results: Dict):
    """Pretty print the matching results"""
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    
    if not results['success']:
        print(f"❌ {results['message']}")
        return
    
    print(f"✅ Found matches in {results['total_photos_matched']} photo(s)")
    print(f"📊 Total matching faces: {results['total_faces_matched']}\n")
    
    if results['total_photos_matched'] == 0:
        print("😔 No matching photos found. Try lowering the threshold (e.g., 0.4)")
        return
    
    print("📸 Matched Photos (sorted by similarity):\n")
    for idx, match in enumerate(results['matches'], 1):
        print(f"{idx}. {match['photo_name']}")
        print(f"   └─ Best Similarity: {match['best_similarity']:.4f} ({match['match_quality']})")
        print(f"   └─ Matching Faces: {match['face_count']}")
        for face in match['faces']:
            print(f"      • Face #{face['face_idx']}: {face['similarity']:.4f}")
        print()


def main():
    """
    Main test function
    
    Directory structure:
    test_face_matching.py
    test_photos/
        ├── group_photo_1.jpg  (multiple people)
        ├── group_photo_2.jpg  (multiple people)
        └── query_person.jpg   (single person to search for)
    """
    
    print("\n" + "🎯" * 30)
    print("FACE MATCHING TEST - LOCAL VERSION")
    print("🎯" * 30 + "\n")
    
    # Setup paths
    test_photos_dir = 'photos'
    
    # Check if directory exists
    if not os.path.exists(test_photos_dir):
        print(f"❌ Error: '{test_photos_dir}' directory not found!")
        print(f"\n📝 Setup Instructions:")
        print(f"   1. Create a folder named '{test_photos_dir}'")
        print(f"   2. Add 2+ photos with multiple people (e.g., group_photo_1.jpg, group_photo_2.jpg)")
        print(f"   3. Add 1 photo with the person you want to search for (e.g., query_person.jpg)")
        print(f"   4. Run this script again\n")
        return
    
    # Get all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
    all_photos = [
        os.path.join(test_photos_dir, f) 
        for f in os.listdir(test_photos_dir) 
        if Path(f).suffix in image_extensions
    ]
    
    if len(all_photos) < 2:
        print(f"❌ Error: Need at least 2 photos in '{test_photos_dir}'")
        print(f"   Found: {len(all_photos)} photo(s)")
        return
    
    print(f"📁 Found {len(all_photos)} photos in '{test_photos_dir}':\n")
    for idx, photo in enumerate(all_photos, 1):
        print(f"   {idx}. {os.path.basename(photo)}")
    
    # Let user select query photo
    print(f"\n❓ Which photo is your QUERY (single person to search for)?")
    print("   Enter the number (or press Enter to use the last photo):")
    
    try:
        choice = input("   > ").strip()
        if choice == "":
            query_idx = len(all_photos) - 1
        else:
            query_idx = int(choice) - 1
            if query_idx < 0 or query_idx >= len(all_photos):
                print("❌ Invalid selection!")
                return
    except ValueError:
        print("❌ Invalid input!")
        return
    
    query_photo = all_photos[query_idx]
    database_photos = [p for i, p in enumerate(all_photos) if i != query_idx]
    
    print(f"\n✅ Query photo: {os.path.basename(query_photo)}")
    print(f"✅ Database photos: {len(database_photos)}\n")
    
    # Initialize classifier
    classifier = LocalFaceClassifier()
    
    # Build database
    classifier.add_photos_to_database(database_photos)
    
    # Search for matches
    results = classifier.find_matching_photos(
        query_image_path=query_photo,
        threshold=0.5  # Adjust this: 0.4 (loose) to 0.7 (strict)
    )
    
    # Print results
    print_results(results)
    
    # Create visualizations
    if results['success'] and results['total_photos_matched'] > 0:
        classifier.visualize_results(query_photo, results)
        print("✅ Check 'output' folder for annotated images with bounding boxes!\n")
    
    print("=" * 60)
    print("✨ Test completed!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()