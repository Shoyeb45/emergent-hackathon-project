import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import {
    SuccessResponse,
    SuccessCreatedResponse,
} from '../../core/api-response';
import { ForbiddenError, NotFoundError } from '../../core/api-error';
import weddingRepo from '../../database/repositories/wedding.repo';
import eventRepo from '../../database/repositories/event.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { timeStringToMinutes, eventsWithTimeStrings } from '../../helpers/time';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/weddings/{weddingId}/events',
    summary: 'Get wedding events',
    description: 'List events for a wedding. Requires Bearer JWT.',
    tags: ['Events'],
    security: [{ bearerAuth: [] }],
    request: { params: schema.uuidParam },
    responses: {
        200: { description: 'List of events' },
        403: { description: 'Access denied' },
        404: { description: 'Wedding not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/weddings/{weddingId}/events',
    summary: 'Create wedding events',
    description:
        'Create one or more events for a wedding. Only host. Requires Bearer JWT.',
    tags: ['Events'],
    security: [{ bearerAuth: [] }],
    request: {
        params: schema.uuidParam,
        body: {
            content: {
                'application/json': { schema: schema.createEventsBody },
            },
        },
    },
    responses: {
        201: { description: 'Events created' },
        400: { description: 'Validation error' },
        403: { description: 'Only host' },
        404: { description: 'Wedding not found' },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/events/{eventId}',
    summary: 'Update event',
    description: 'Update an event. Only host. Requires Bearer JWT.',
    tags: ['Events'],
    security: [{ bearerAuth: [] }],
    request: {
        params: schema.eventIdParam,
        body: {
            content: { 'application/json': { schema: schema.updateEventBody } },
        },
    },
    responses: {
        200: { description: 'Event updated' },
        403: { description: 'Only host' },
        404: { description: 'Event not found' },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/events/{eventId}',
    summary: 'Delete event',
    description: 'Delete an event. Only host. Requires Bearer JWT.',
    tags: ['Events'],
    security: [{ bearerAuth: [] }],
    request: { params: schema.eventIdParam },
    responses: {
        200: { description: 'Event deleted' },
        403: { description: 'Only host' },
        404: { description: 'Event not found' },
    },
});

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get(
    '/',
    validator(schema.uuidParam, ValidationSource.PARAM),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const { weddingId } = req.params;
        const userId = req.user.id;
        const hostId = await weddingRepo.getHostId(weddingId);
        if (hostId === null) throw new NotFoundError('Wedding not found.');
        if (hostId !== userId)
            throw new ForbiddenError('Access denied.');

        const events = await eventRepo.findManyByWeddingId(weddingId);
        new SuccessResponse('Events.', eventsWithTimeStrings(events)).send(res);
    }),
);

router.post(
    '/',
    validator(schema.uuidParam, ValidationSource.PARAM),
    validator(schema.createEventsBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const { weddingId } = req.params;
        const userId = req.user.id;
        const { events: eventsData } = req.body;

        const wedding = await weddingRepo.findByIdMinimal(weddingId);
        if (!wedding) throw new NotFoundError('Wedding not found.');
        if (wedding.hostId !== userId)
            throw new ForbiddenError('Only the host can create events.');

        const created = [];
        for (let i = 0; i < eventsData.length; i++) {
            const e = eventsData[i];
            const eventDate = new Date(e.eventDate);
            const startTimeMinutes = timeStringToMinutes(e.startTime);
            const endTimeMinutes = e.endTime
                ? timeStringToMinutes(e.endTime)
                : null;
            const event = await eventRepo.create({
                weddingId,
                name: e.name,
                description: e.description ?? null,
                eventDate,
                startTime: startTimeMinutes,
                endTime: endTimeMinutes,
                location: e.location ?? null,
                locationAddress: e.locationAddress ?? null,
                eventType: e.eventType ?? null,
                colorTheme: e.colorTheme ?? null,
                icon: e.icon ?? null,
                dressCode: e.dressCode ?? null,
                displayOrder: i,
            });
            created.push(event);
        }

        await eventRepo.incrementWeddingEventsCount(weddingId, created.length);

        new SuccessCreatedResponse(
            `${created.length} event(s) created successfully.`,
            eventsWithTimeStrings(created),
        ).send(res);
    }),
);

export default router;
