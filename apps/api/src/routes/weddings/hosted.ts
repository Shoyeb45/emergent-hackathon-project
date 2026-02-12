import { Router } from 'express';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessResponse } from '../../core/api-response';
import weddingRepo from '../../database/repositories/wedding.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { eventsWithTimeStrings } from '../../helpers/time';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/weddings/hosted',
    summary: 'Get hosted weddings',
    description:
        'List weddings hosted by the current user. Requires Bearer JWT.',
    tags: ['Weddings'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: { description: 'List of hosted weddings with stats' },
        401: { description: 'Invalid or missing access token' },
    },
});

const router = Router();

router.use(authMiddleware);

router.get(
    '/',
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userId = req.user.id;
        const weddings = await weddingRepo.findManyByHostId(userId);

        const weddingsWithStats = weddings.map((wedding) => {
            const totalGuests = wedding.guests.length;
            const acceptedGuests = wedding.guests.filter(
                (g) => g.rsvpStatus === 'accepted',
            ).length;
            const pendingGuests = wedding.guests.filter(
                (g) => g.rsvpStatus === 'pending',
            ).length;
            return {
                ...wedding,
                events: eventsWithTimeStrings(wedding.events),
                guestStats: {
                    total: totalGuests,
                    accepted: acceptedGuests,
                    pending: pendingGuests,
                    declined: totalGuests - acceptedGuests - pendingGuests,
                },
            };
        });

        new SuccessResponse('Hosted weddings.', weddingsWithStats).send(res);
    }),
);

export default router;
