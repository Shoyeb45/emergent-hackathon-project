import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessCreatedResponse } from '../../core/api-response';
import { BadRequestError } from '../../core/api-error';
import weddingRepo from '../../database/repositories/wedding.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'post',
    path: '/weddings',
    summary: 'Create wedding',
    description: 'Create a new wedding. Requires Bearer JWT.',
    tags: ['Weddings'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schema.createWeddingBody,
                },
            },
        },
    },
    responses: {
        201: { description: 'Wedding created' },
        400: { description: 'Validation error or past date' },
        401: { description: 'Invalid or missing access token' },
    },
});

const router = Router();

router.use(authMiddleware);

router.post(
    '/',
    validator(schema.createWeddingBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userId = req.user.id;
        const {
            title,
            description,
            weddingDate,
            venue,
            venueAddress,
            coverImageUrl,
        } = req.body;

        const dateObj = new Date(weddingDate);
        if (Number.isNaN(dateObj.getTime())) {
            throw new BadRequestError('Invalid wedding date.');
        }
        if (dateObj < new Date()) {
            throw new BadRequestError('Wedding date must be in the future.');
        }

        const wedding = await weddingRepo.create({
            hostId: userId,
            title,
            description: description ?? null,
            weddingDate: dateObj,
            venue: venue ?? null,
            venueAddress: venueAddress ?? null,
            coverImageUrl: coverImageUrl || null,
        });

        new SuccessCreatedResponse(
            'Wedding created successfully.',
            wedding,
        ).send(res);
    }),
);

export default router;
