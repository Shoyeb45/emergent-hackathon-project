import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessResponse } from '../../core/api-response';
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from '../../core/api-error';
import weddingRepo from '../../database/repositories/wedding.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'patch',
    path: '/weddings/{weddingId}',
    summary: 'Update wedding',
    description:
        'Update wedding details. Only host can update. Requires Bearer JWT.',
    tags: ['Weddings'],
    security: [{ bearerAuth: [] }],
    request: {
        params: schema.uuidParam,
        body: {
            content: {
                'application/json': {
                    schema: schema.updateWeddingBody,
                },
            },
        },
    },
    responses: {
        200: { description: 'Wedding updated' },
        400: { description: 'Validation error or past date' },
        403: { description: 'Only host can update' },
        404: { description: 'Wedding not found' },
    },
});

const router = Router();

router.use(authMiddleware);

router.patch(
    '/',
    validator(schema.uuidParam, ValidationSource.PARAM),
    validator(schema.updateWeddingBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const weddingId = req.params.weddingId;
        const userId = req.user.id;
        const updateData = req.body as Record<string, unknown>;

        const wedding = await weddingRepo.findByIdMinimal(weddingId);

        if (!wedding) {
            throw new NotFoundError('Wedding not found.');
        }
        if (wedding.hostId !== userId) {
            throw new ForbiddenError('Only the host can update this wedding.');
        }

        if (updateData.weddingDate) {
            const dateObj = new Date(updateData.weddingDate as string);
            if (Number.isNaN(dateObj.getTime()) || dateObj < new Date()) {
                throw new BadRequestError(
                    'Wedding date must be a valid future date.',
                );
            }
            (updateData as Record<string, Date>).weddingDate = dateObj;
        }

        const updated = await weddingRepo.update(weddingId, updateData);

        new SuccessResponse('Wedding updated successfully.', updated).send(res);
    }),
);

export default router;
