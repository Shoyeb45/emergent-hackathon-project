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
    path: '/weddings/invited',
    summary: 'Get invited weddings',
    description:
        'List weddings the current user is invited to as a guest. Requires Bearer JWT.',
    tags: ['Weddings'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: { description: 'List of invited weddings' },
        401: { description: 'Invalid or missing access token' },
    },
});

const router = Router();

router.use(authMiddleware);

router.get(
    '/',
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userId = req.user.id;
        const weddings = await weddingRepo.findManyByGuestUserId(userId);
        const withTimeStrings = weddings.map((w) => ({
            ...w,
            events: eventsWithTimeStrings(w.events),
            guestStats: w.guests[0]
                ? {
                      rsvpStatus: w.guests[0].rsvpStatus,
                  }
                : undefined,
        }));
        new SuccessResponse('Invited weddings.', withTimeStrings).send(res);
    }),
);

export default router;
