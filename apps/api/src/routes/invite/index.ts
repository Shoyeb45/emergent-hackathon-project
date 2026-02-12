import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { SuccessResponse } from '../../core/api-response';
import { NotFoundError } from '../../core/api-error';
import guestRepo from '../../database/repositories/guest.repo';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/invite/{token}',
    summary: 'Get invitation by token',
    description:
        'Returns invitation and wedding details for the given token. Public (no auth).',
    tags: ['Invite'],
    security: [],
    request: { params: schema.tokenParam },
    responses: {
        200: { description: 'Invitation and wedding details' },
        404: { description: 'Invalid invitation link' },
    },
});

const router = Router();

router.get(
    '/:token',
    validator(schema.tokenParam, ValidationSource.PARAM),
    asyncHandler(async (req, res) => {
        const { token } = req.params;

        const guest = await guestRepo.findByInvitationToken(token);

        if (!guest) {
            throw new NotFoundError('Invalid invitation link.');
        }

        new SuccessResponse('Invitation details.', {
            guest: {
                id: guest.id,
                rsvpStatus: guest.rsvpStatus,
                user: guest.user,
            },
            wedding: guest.wedding,
            hasResponded: guest.rsvpStatus !== 'pending',
        }).send(res);
    }),
);

export default router;
