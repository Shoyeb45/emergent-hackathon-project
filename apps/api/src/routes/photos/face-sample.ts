import { Router } from 'express';
import crypto from 'crypto';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import {
    SuccessResponse,
    SuccessCreatedResponse,
} from '../../core/api-response';
import { BadRequestError, ForbiddenError } from '../../core/api-error';
import userRepo from '../../database/repositories/user.repo';
import guestRepo from '../../database/repositories/guest.repo';
import faceSampleRepo from '../../database/repositories/face-sample.repo';
import weddingRepo from '../../database/repositories/wedding.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { aiQueueStreamKey } from '../../config';
import { redisClient } from '../../services/redis.service';
import { s3Service } from '../../services/s3.service';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'post',
    path: '/photos/face-sample/presign',
    summary: 'Get presigned URL for face sample upload',
    description:
        'Returns a presigned S3 URL. Frontend PUTs the file to uploadUrl, then calls POST /photos/face-sample with { imageUrl: publicUrl }. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: schema.presignFaceSampleBody },
            },
        },
    },
    responses: {
        200: { description: 'uploadUrl, key, publicUrl' },
        401: { description: 'Invalid or missing access token' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/photos/face-sample',
    summary: 'Upload face sample',
    description:
        'Submit a face image URL for encoding. AI service will create encoding and trigger reprocessing. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { 'application/json': { schema: schema.faceSampleBody } },
        },
    },
    responses: {
        201: { description: 'Face sample accepted' },
        400: { description: 'No face detected' },
        401: { description: 'Invalid or missing access token' },
    },
});

const router = Router();

router.use(authMiddleware);

router.post(
    '/presign',
    validator(schema.presignFaceSampleBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userId = req.user.id;
        const { fileName, contentType } = req.body;
        const sanitized = (fileName || 'photo').replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
        );
        const key = `face-samples/${userId}/${crypto.randomUUID()}-${sanitized}`;
        const { uploadUrl, publicUrl } = await s3Service.getPresignedUploadUrl(
            key,
            contentType,
        );
        new SuccessResponse(
            'Use uploadUrl to PUT the file; then call POST /photos/face-sample with { imageUrl: publicUrl }.',
            { uploadUrl, key, publicUrl },
        ).send(res);
    }),
);

async function callAiEncodeFace(
    aiUrl: string,
    imageUrl: string,
    userId: number,
): Promise<{ faceEncodingId: string; quality: number }> {
    const res = await fetch(`${aiUrl}/api/encode-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, userId }),
    });
    const data = (await res.json()) as {
        success: boolean;
        data?: { faceEncodingId: string; quality: number };
        message?: string;
    };
    if (!data.success || !data.data?.faceEncodingId) {
        throw new BadRequestError(
            data.message ||
                'No face detected in the image. Please upload a clear photo of your face.',
        );
    }
    return data.data;
}

router.post(
    '/',
    validator(schema.faceSampleBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userId = req.user.id;
        const { imageUrl, guestId } = req.body;

        let weddingId: string | null = null;
        let weddingIds: string[] = [];

        if (guestId) {
            const guestRecord = await guestRepo.findById(guestId);
            if (!guestRecord || guestRecord.userId !== userId) {
                throw new ForbiddenError(
                    'You can only add a face sample for yourself as a guest.',
                );
            }
            weddingId = guestRecord.weddingId;
        } else {
            const guestRecords = await guestRepo.findManyByUserId(userId);
            weddingIds = guestRecords.map((g) => g.weddingId);
        }

        const hostedWeddings = await weddingRepo.findManyByHostId(userId);
        const hostedWeddingIds: string[] = hostedWeddings.map((w) => w.id);

        if (redisClient.isReady()) {
            redisClient
                .addToStream(
                    aiQueueStreamKey,
                    {
                        event: 'face_sample',
                        payload: JSON.stringify({
                            userId,
                            guestId: guestId ?? null,
                            imageUrl,
                            weddingId: weddingId ?? null,
                            weddingIds,
                            hostedWeddingIds,
                        }),
                        ts: String(Date.now()),
                    },
                    10000,
                )
                .catch((e: unknown) =>
                    console.error('Face sample queue push failed', e),
                );
            new SuccessCreatedResponse(
                "Face sample received. We're processing it and will scan wedding photos for you shortly!",
                { accepted: true },
            ).send(res);
            return;
        }

        const aiUrl = process.env.AI_SERVICE_URL;
        let faceEncodingId: string;
        let quality = 0.9;

        if (aiUrl) {
            try {
                const result = await callAiEncodeFace(aiUrl, imageUrl, userId);
                faceEncodingId = result.faceEncodingId;
                quality = result.quality ?? 0.9;
            } catch (e: unknown) {
                const msg =
                    e instanceof Error
                        ? e.message
                        : 'Face encoding failed. Please upload a clear photo of your face.';
                throw new BadRequestError(msg);
            }
        } else {
            faceEncodingId = `stub_${userId}_${Date.now()}`;
        }

        await faceSampleRepo.create({
            userId,
            sampleImageUrl: imageUrl,
            thumbnailUrl: imageUrl,
            faceEncodingId,
            encodingQuality: quality,
            isPrimary: true,
            source: 'upload',
        });

        await userRepo.update(userId, {
            faceEncodingId,
            faceSampleUploaded: true,
        });

        const guestRecords = await guestRepo.findManyByUserId(userId);
        for (const g of guestRecords) {
            await guestRepo.update(g.id, {
                faceEncodingId,
                faceSampleProvided: true,
                photosProcessed: false,
            });
            if (aiUrl) {
                fetch(`${aiUrl}/api/reprocess-wedding`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weddingId: g.weddingId, userId }),
                }).catch((err: unknown) =>
                    console.error('Reprocess trigger failed', err),
                );
            }
        }

        for (const wId of hostedWeddingIds) {
            if (aiUrl) {
                fetch(`${aiUrl}/api/reprocess-wedding`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weddingId: wId, userId }),
                }).catch((err: unknown) =>
                    console.error('Reprocess trigger failed', err),
                );
            }
        }

        new SuccessCreatedResponse(
            "Face sample uploaded successfully. We're now scanning wedding photos for you!",
            {
                faceEncodingId,
                encodingQuality: quality,
            },
        ).send(res);
    }),
);

export default router;
