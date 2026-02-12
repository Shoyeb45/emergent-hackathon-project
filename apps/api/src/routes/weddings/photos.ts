import { Router } from 'express';
import crypto from 'crypto';
import { validator } from '../../middlewares/validator.middleware';
import weddingSchema from './schema';
import photoSchema from '../photos/schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import {
    SuccessResponse,
    SuccessCreatedResponse,
} from '../../core/api-response';
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from '../../core/api-error';
import weddingRepo from '../../database/repositories/wedding.repo';
import guestRepo from '../../database/repositories/guest.repo';
import photoRepo from '../../database/repositories/photo.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { s3Service } from '../../services/s3.service';
import { s3BucketUrl } from '../../config';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/weddings/{weddingId}/photos',
    summary: 'Get gallery photos',
    description:
        'List photos for a wedding. Optional: eventId, page, limit. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    request: { params: weddingSchema.uuidParam },
    responses: {
        200: { description: 'Paginated photos' },
        403: { description: 'Access denied' },
        404: { description: 'Wedding not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/weddings/{weddingId}/photos',
    summary: 'Upload photo (JSON body)',
    description:
        'Add photo by URL (originalUrl). Triggers AI processing if enabled. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: weddingSchema.uuidParam,
        body: {
            content: {
                'application/json': { schema: photoSchema.uploadPhotoBody },
            },
        },
    },
    responses: {
        201: { description: 'Photo added' },
        403: { description: 'No upload permission' },
        404: { description: 'Wedding not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/weddings/{weddingId}/photos/presign',
    summary: 'Get presigned upload URL',
    description:
        'Returns a presigned S3 URL. Frontend must PUT the file to uploadUrl with Content-Type header matching contentType, then call POST .../photos/confirm with the key. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: weddingSchema.uuidParam,
        body: {
            content: {
                'application/json': { schema: photoSchema.presignPhotoBody },
            },
        },
    },
    responses: {
        200: { description: 'uploadUrl, key, publicUrl' },
        403: { description: 'No upload permission' },
        404: { description: 'Wedding not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/weddings/{weddingId}/photos/confirm',
    summary: 'Confirm photo after upload',
    description:
        'Call after frontend has uploaded the file to the presigned URL. Creates the photo record with the S3 URL. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: weddingSchema.uuidParam,
        body: {
            content: {
                'application/json': { schema: photoSchema.confirmPhotoBody },
            },
        },
    },
    responses: {
        201: { description: 'Photo confirmed and created' },
        400: { description: 'Invalid key' },
        403: { description: 'No upload permission' },
        404: { description: 'Wedding not found' },
    },
});

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get(
    '/',
    validator(weddingSchema.uuidParam, ValidationSource.PARAM),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const weddingId = req.params.weddingId;
        const {
            eventId,
            page = '1',
            limit = '20',
        } = req.query as { eventId?: string; page?: string; limit?: string };
        const userId = req.user.id;

        const hostId = await weddingRepo.getHostId(weddingId);
        if (hostId === null) throw new NotFoundError('Wedding not found.');
        const isHost = hostId === userId;
        const isGuest =
            !isHost &&
            (await guestRepo.findFirstByWeddingAndUser(weddingId, userId));
        if (!isHost && !isGuest) throw new ForbiddenError('Access denied.');

        const skip =
            (Math.max(1, parseInt(page, 10)) - 1) *
            Math.min(50, Math.max(1, parseInt(limit, 10)));
        const take = Math.min(50, Math.max(1, parseInt(limit, 10)));

        const { photos, totalCount } = await photoRepo.findManyForGallery(
            weddingId,
            { eventId, skip, take },
        );

        new SuccessResponse('Gallery photos.', {
            photos,
            pagination: {
                page: Math.floor(skip / take) + 1,
                limit: take,
                totalCount,
                totalPages: Math.ceil(totalCount / take),
            },
        }).send(res);
    }),
);

router.post(
    '/',
    validator(weddingSchema.uuidParam, ValidationSource.PARAM),
    validator(photoSchema.uploadPhotoBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const weddingId = req.params.weddingId;
        const userId = req.user.id;
        const { eventId, originalUrl, thumbnailUrl, caption } = req.body;

        const wedding = await weddingRepo.findByIdMinimal(weddingId);
        if (!wedding) throw new NotFoundError('Wedding not found.');
        const isHost = wedding.hostId === userId;
        if (!isHost) {
            const guest = await guestRepo.findFirstWithUploadPermission(
                weddingId,
                userId,
            );
            if (!guest)
                throw new ForbiddenError(
                    'You do not have permission to upload photos.',
                );
        }

        const guestRecord = isHost
            ? null
            : await guestRepo.findFirstByWeddingAndUser(weddingId, userId);

        const photo = await photoRepo.create({
            weddingId,
            eventId: eventId ?? null,
            uploadedByUserId: userId,
            uploadedByGuestId: guestRecord?.id ?? null,
            fileName: originalUrl.split('/').pop() || 'photo',
            originalUrl,
            thumbnailUrl: thumbnailUrl ?? null,
            caption: caption ?? null,
            processingStatus: 'pending',
        });

        if (wedding.autoTagPhotos) {
            await photoRepo.createAiQueueEntry(photo.id, weddingId);
            const aiUrl = process.env.AI_SERVICE_URL;
            if (aiUrl) {
                fetch(`${aiUrl}/api/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photoId: photo.id }),
                }).catch((e: unknown) => console.error('AI trigger failed', e));
            }
        }

        await photoRepo.incrementWeddingPhotoCount(weddingId, {
            total: 1,
            ...(wedding.autoTagPhotos && { pending: 1 }),
        });

        new SuccessCreatedResponse('Photo uploaded successfully.', photo).send(
            res,
        );
    }),
);

router.post(
    '/presign',
    validator(weddingSchema.uuidParam, ValidationSource.PARAM),
    validator(photoSchema.presignPhotoBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const weddingId = req.params.weddingId;
        const userId = req.user.id;
        const { fileName, contentType } = req.body;

        const hostId = await weddingRepo.getHostId(weddingId);
        if (hostId === null) throw new NotFoundError('Wedding not found.');
        const isHost = hostId === userId;
        if (!isHost) {
            const guest = await guestRepo.findFirstWithUploadPermission(
                weddingId,
                userId,
            );
            if (!guest)
                throw new ForbiddenError(
                    'You do not have permission to upload photos.',
                );
        }

        const sanitized = (fileName || 'photo').replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `weddings/${weddingId}/${crypto.randomUUID()}-${sanitized}`;

        const { uploadUrl, publicUrl } = await s3Service.getPresignedUploadUrl(
            key,
            contentType,
        );

        new SuccessResponse(
            'Use uploadUrl to PUT the file; then call POST .../photos/confirm with key.',
            {
                uploadUrl,
                key,
                publicUrl,
            },
        ).send(res);
    }),
);

router.post(
    '/confirm',
    validator(weddingSchema.uuidParam, ValidationSource.PARAM),
    validator(photoSchema.confirmPhotoBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const weddingId = req.params.weddingId;
        const userId = req.user.id;
        const { key, eventId, caption } = req.body;

        const prefix = `weddings/${weddingId}/`;
        if (!key.startsWith(prefix)) {
            throw new BadRequestError(
                'Invalid key: must belong to this wedding.',
            );
        }

        const wedding = await weddingRepo.findByIdMinimal(weddingId);
        if (!wedding) throw new NotFoundError('Wedding not found.');
        const isHost = wedding.hostId === userId;
        if (!isHost) {
            const guest = await guestRepo.findFirstWithUploadPermission(
                weddingId,
                userId,
            );
            if (!guest)
                throw new ForbiddenError(
                    'You do not have permission to upload photos.',
                );
        }

        const guestRecord = isHost
            ? null
            : await guestRepo.findFirstByWeddingAndUser(weddingId, userId);
        const fileName = key.split('/').pop() || 'photo';
        const publicUrl = `${s3BucketUrl.replace(/\/$/, '')}/${key}`;

        const photo = await photoRepo.create({
            weddingId,
            eventId: eventId ?? null,
            uploadedByUserId: userId,
            uploadedByGuestId: guestRecord?.id ?? null,
            fileName,
            originalUrl: publicUrl,
            thumbnailUrl: publicUrl,
            caption: caption ?? null,
            processingStatus: 'pending',
        });

        if (wedding.autoTagPhotos) {
            await photoRepo.createAiQueueEntry(photo.id, weddingId);
            const aiUrl = process.env.AI_SERVICE_URL;
            if (aiUrl) {
                fetch(`${aiUrl}/api/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photoId: photo.id }),
                }).catch((e: unknown) => console.error('AI trigger failed', e));
            }
        }

        await photoRepo.incrementWeddingPhotoCount(weddingId, {
            total: 1,
            ...(wedding.autoTagPhotos && { pending: 1 }),
        });

        new SuccessCreatedResponse('Photo confirmed and added.', photo).send(
            res,
        );
    }),
);

export default router;
