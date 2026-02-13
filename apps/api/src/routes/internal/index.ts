import { Router } from 'express';
import { verifyInternalRequest } from './middleware';
import { asyncHandler } from '../../core/async-handler';
import {
    SuccessResponse,
    SuccessCreatedResponse,
} from '../../core/api-response';
import { NotFoundError } from '../../core/api-error';
import photoRepo from '../../database/repositories/photo.repo';
import guestRepo from '../../database/repositories/guest.repo';
import photoTagRepo from '../../database/repositories/photo-tag.repo';
import faceSampleRepo from '../../database/repositories/face-sample.repo';
import userRepo from '../../database/repositories/user.repo';

const router = Router();

router.use(verifyInternalRequest);

router.get(
    '/photos/:photoId',
    asyncHandler(async (req, res) => {
        const { photoId } = req.params;
        const photo = await photoRepo.findById(photoId);
        if (!photo) throw new NotFoundError('Photo not found.');
        new SuccessResponse('Photo.', photo).send(res);
    }),
);

router.patch(
    '/photos/:photoId',
    asyncHandler(async (req, res) => {
        const { photoId } = req.params;
        const { processingStatus, facesDetected, processedAt, aiErrorMessage } =
            req.body;
        const data: Record<string, unknown> = {};
        if (processingStatus != null) data.processingStatus = processingStatus;
        if (facesDetected != null) data.facesDetected = Number(facesDetected);
        if (processedAt != null) data.processedAt = new Date(processedAt);
        if (aiErrorMessage != null) data.aiErrorMessage = aiErrorMessage;
        const updated = await photoRepo.update(photoId, data);
        new SuccessResponse('Updated.', updated).send(res);
    }),
);

router.get(
    '/weddings/:weddingId/guest-encodings',
    asyncHandler(async (req, res) => {
        const { weddingId } = req.params;
        const guests = await guestRepo.findManyWithEncodings(weddingId);
        new SuccessResponse('Guest encodings.', guests).send(res);
    }),
);

router.post(
    '/photo-tags',
    asyncHandler(async (req, res) => {
        const {
            photoId,
            guestId,
            userId,
            confidenceScore,
            boundingBox,
            faceEncodingId,
        } = req.body;
        const parsedUserId =
            userId != null && userId !== '' && !Number.isNaN(Number(userId))
                ? Number(userId)
                : null;
        const tag = await photoTagRepo.create({
            photoId,
            guestId: guestId != null && guestId !== '' ? guestId : null,
            userId: parsedUserId,
            confidenceScore:
                confidenceScore != null ? Number(confidenceScore) : null,
            boundingBox: boundingBox ?? undefined,
            faceEncodingId: faceEncodingId ?? null,
        });
        new SuccessCreatedResponse('Tag created.', tag).send(res);
    }),
);

router.patch(
    '/processing-queue/:photoId',
    asyncHandler(async (req, res) => {
        const { photoId } = req.params;
        const {
            status,
            startedAt,
            facesFound,
            matchesCreated,
            completedAt,
            errorMessage,
            processingTimeMs,
        } = req.body;
        const data: Record<string, unknown> = {};
        if (status != null) data.status = status;
        if (startedAt != null) data.startedAt = new Date(startedAt);
        if (facesFound != null) data.facesFound = Number(facesFound);
        if (matchesCreated != null)
            data.matchesCreated = Number(matchesCreated);
        if (completedAt != null) data.completedAt = new Date(completedAt);
        if (errorMessage != null) data.errorMessage = errorMessage;
        if (processingTimeMs != null)
            data.processingTimeMs = Number(processingTimeMs);
        await photoRepo.updateAiQueue(photoId, data);
        new SuccessResponse('Queue updated.', {}).send(res);
    }),
);

router.post(
    '/face-samples',
    asyncHandler(async (req, res) => {
        const {
            userId,
            guestId,
            sampleImageUrl,
            thumbnailUrl,
            faceEncodingId,
            encodingQuality,
            isPrimary,
            source,
        } = req.body;
        const sample = await faceSampleRepo.create({
            userId: userId ?? undefined,
            guestId: guestId ?? undefined,
            sampleImageUrl,
            thumbnailUrl: thumbnailUrl ?? sampleImageUrl,
            faceEncodingId,
            encodingQuality:
                encodingQuality != null ? Number(encodingQuality) : undefined,
            isPrimary: isPrimary ?? true,
            source: source ?? 'upload',
        });
        new SuccessCreatedResponse('Face sample created.', sample).send(res);
    }),
);

router.patch(
    '/guests/:guestId',
    asyncHandler(async (req, res) => {
        const { guestId } = req.params;
        const { faceEncodingId, faceSampleProvided, photosProcessed } =
            req.body;
        const data: Record<string, unknown> = {};
        if (faceEncodingId != null) data.faceEncodingId = faceEncodingId;
        if (faceSampleProvided != null)
            data.faceSampleProvided = Boolean(faceSampleProvided);
        if (photosProcessed != null)
            data.photosProcessed = Boolean(photosProcessed);
        const guest = await guestRepo.update(guestId, data);
        new SuccessResponse('Guest updated.', guest).send(res);
    }),
);

router.get(
    '/weddings/:weddingId/photo-ids',
    asyncHandler(async (req, res) => {
        const { weddingId } = req.params;
        const photos = await photoRepo.findManyPhotoIdsByWedding(weddingId);
        new SuccessResponse('Photo IDs.', { photoIds: photos }).send(res);
    }),
);

router.patch(
    '/users/:userId',
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId))
            throw new NotFoundError('Invalid user ID.');
        const { faceEncodingId, faceSampleUploaded } = req.body;
        const data: Record<string, unknown> = {};
        if (faceEncodingId != null) data.faceEncodingId = faceEncodingId;
        if (faceSampleUploaded != null)
            data.faceSampleUploaded = Boolean(faceSampleUploaded);
        const user = await userRepo.update(userId, data);
        new SuccessResponse('User updated.', user).send(res);
    }),
);

export default router;
