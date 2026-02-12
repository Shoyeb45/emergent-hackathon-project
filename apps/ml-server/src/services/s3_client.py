import boto3
from botocore.exceptions import ClientError
import cv2
import numpy as np
import logging
import os

logger = logging.getLogger(__name__)


class S3Client:
    def __init__(
        self,
        bucket_name: str,
        region: str = (
            os.getenv("AWS_REGION") if os.getenv("AWS_REGION") else "us-east-1"
        ),
    ):
        self.s3 = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        self.bucket_name = bucket_name
        self.region = region

    def download_file(
        self,
        s3_key: str,
        local_path: str,
    ) -> bool:
        """Download file from S3"""
        try:
            self.s3.download_file(self.bucket_name, s3_key, local_path)
            return True
        except ClientError as e:
            logger.error(f"Error downloading {s3_key}: {str(e)}")
            return False

    def upload_image(self, image: np.ndarray, s3_key: str) -> str:
        """Upload OpenCV image to S3 and return URL"""
        try:
            # Encode image
            _, buffer = cv2.imencode(".jpg", image)

            # Upload
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=buffer.tobytes(),
                ContentType="image/jpeg",
            )

            return self.get_url(s3_key)
        except ClientError as e:
            logger.error(f"Error uploading image {s3_key}: {str(e)}")
            return ""

    def get_url(self, s3_key: str) -> str:
        """Get S3 object URL"""
        return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"

    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        """Generate presigned URL for private objects"""
        try:
            url = self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": s3_key},
                ExpiresIn=expiration,
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            return ""
