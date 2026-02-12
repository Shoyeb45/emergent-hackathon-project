import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessCreatedResponse } from '../../core/api-response';
import { BadRequestError } from '../../core/api-error';
import userRepo from '../../database/repositories/user.repo';
import guestRepo from '../../database/repositories/guest.repo';
import faceSampleRepo from '../../database/repositories/face-sample.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { registry } from '../../docs/swagger';

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
        const { imageUrl } = req.body;

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
