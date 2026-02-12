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
        const tag = await photoTagRepo.create({
            photoId,
            guestId: guestId ?? null,
            userId: userId ?? null,
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
            facesFound,
            matchesCreated,
            completedAt,
            errorMessage,
        } = req.body;
        const data: Record<string, unknown> = {};
        if (status != null) data.status = status;
        if (facesFound != null) data.facesFound = Number(facesFound);
        if (matchesCreated != null)
            data.matchesCreated = Number(matchesCreated);
        if (completedAt != null) data.completedAt = new Date(completedAt);
        if (errorMessage != null) data.errorMessage = errorMessage;
        await photoRepo.updateAiQueue(photoId, data);
        new SuccessResponse('Queue updated.', {}).send(res);
    }),
);

export default router;
