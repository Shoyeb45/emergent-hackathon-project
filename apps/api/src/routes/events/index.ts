import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from '../weddings/schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessResponse } from '../../core/api-response';
import { ForbiddenError, NotFoundError } from '../../core/api-error';
import eventRepo from '../../database/repositories/event.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { timeStringToMinutes, eventWithTimeStrings } from '../../helpers/time';

const router = Router();

router.use(authMiddleware);

router.patch(
    '/:eventId',
    validator(schema.eventIdParam, ValidationSource.PARAM),
    validator(schema.updateEventBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const { eventId } = req.params;
        const userId = req.user.id;
        const updateData = req.body as Record<string, unknown>;

        const event = await eventRepo.findById(eventId);
        if (!event) throw new NotFoundError('Event not found.');
        if (event.wedding.hostId !== userId)
            throw new ForbiddenError('Only the host can update events.');

        const data: Record<string, unknown> = { ...updateData };
        if (typeof data.startTime === 'string')
            data.startTime = timeStringToMinutes(data.startTime);
        if (typeof data.endTime === 'string')
            data.endTime = timeStringToMinutes(data.endTime);
        if (data.eventDate) data.eventDate = new Date(data.eventDate as string);

        const updated = await eventRepo.update(eventId, data);
        new SuccessResponse(
            'Event updated successfully.',
            eventWithTimeStrings(updated),
        ).send(res);
    }),
);

router.delete(
    '/:eventId',
    validator(schema.eventIdParam, ValidationSource.PARAM),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const { eventId } = req.params;
        const userId = req.user.id;

        const event = await eventRepo.findById(eventId);
        if (!event) throw new NotFoundError('Event not found.');
        if (event.wedding.hostId !== userId)
            throw new ForbiddenError('Only the host can delete events.');

        await eventRepo.remove(eventId);
        await eventRepo.incrementWeddingEventsCount(event.wedding.id, -1);
        new SuccessResponse('Event deleted successfully.', {}).send(res);
    }),
);

export default router;
