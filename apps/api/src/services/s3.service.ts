import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    awsRegion,
    awsAccessKeyId,
    awsSecretAccessKey,
    s3BucketName,
    s3BucketUrl,
} from '../config';
import logger from '../core/logger';

class S3Service {
    private static instance: S3Service;
    private s3Client: S3Client | undefined;

    private constructor() {
        this.initialiseS3Client();
    }

    private initialiseS3Client() {
        try {
            if (awsAccessKeyId && awsSecretAccessKey && s3BucketName) {
                this.s3Client = new S3Client({
                    region: awsRegion,
                    credentials: {
                        accessKeyId: awsAccessKeyId,
                        secretAccessKey: awsSecretAccessKey,
                    },
                });
            }
        } catch (error) {
            logger.error('Failed to initialise S3 client.', { error });
        }
    }

    public static getInstance(): S3Service {
        if (!S3Service.instance) {
            S3Service.instance = new S3Service();
        }
        return S3Service.instance;
    }

    /**
     * Upload a buffer to S3. Returns the public URL of the object.
     * @param fileBuffer - File content as Buffer
     * @param key - S3 object key (e.g. "weddings/{weddingId}/photos/{filename}")
     * @param contentType - MIME type (e.g. "image/jpeg", "image/png")
     */
    async uploadToS3(
        fileBuffer: Buffer,
        key: string,
        contentType: string = 'application/octet-stream',
    ): Promise<string> {
        if (!this.s3Client) {
            this.initialiseS3Client();
        }
        if (!this.s3Client) {
            throw new Error(
                'S3 client is not initialised. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME.',
            );
        }
        if (!s3BucketName) {
            throw new Error('S3_BUCKET_NAME is not set.');
        }

        const uploadParams: PutObjectCommandInput = {
            Bucket: s3BucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        };

        await this.s3Client.send(new PutObjectCommand(uploadParams));

        return `${s3BucketUrl.replace(/\/$/, '')}/${key}`;
    }

    /**
     * Generate a presigned URL for the frontend to upload a file directly to S3 (PUT).
     * Frontend should PUT the file to uploadUrl with header Content-Type matching contentType.
     * @param key - S3 object key
     * @param contentType - MIME type (e.g. "image/jpeg"); must match the Content-Type header frontend sends
     * @param expiresIn - URL validity in seconds (default 900 = 15 min)
     */
    async getPresignedUploadUrl(
        key: string,
        contentType: string,
        expiresIn: number = 900,
    ): Promise<{ uploadUrl: string; publicUrl: string }> {
        if (!this.s3Client) {
            this.initialiseS3Client();
        }
        if (!this.s3Client) {
            throw new Error(
                'S3 client is not initialised. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME.',
            );
        }
        if (!s3BucketName) {
            throw new Error('S3_BUCKET_NAME is not set.');
        }

        const command = new PutObjectCommand({
            Bucket: s3BucketName,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn,
            signableHeaders: new Set(['content-type']),
        });

        const publicUrl = `${s3BucketUrl.replace(/\/$/, '')}/${key}`;
        return { uploadUrl, publicUrl };
    }
}

export const s3Service = S3Service.getInstance();
