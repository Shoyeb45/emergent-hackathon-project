import { Router } from 'express';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { SuccessResponse } from '../../core/api-response';
import { BadRequestError, NotFoundError } from '../../core/api-error';
import guestRepo from '../../database/repositories/guest.repo';
import userRepo from '../../database/repositories/user.repo';
import keystoreRepo from '../../database/repositories/keystore.repo';
import { createTokens } from '../../core/auth-utils';
import { setCookies } from '../../core/cookie-utils';
import { updateWeddingStats } from '../../helpers/stats.helper';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'post',
    path: '/rsvp/{token}',
    summary: 'Submit RSVP',
    description:
        'Submit RSVP (accepted/declined). Optionally set password. Returns tokens and redirect path. Public (token in path).',
    tags: ['RSVP'],
    security: [],
    request: {
        params: schema.tokenParam,
        body: {
            content: { 'application/json': { schema: schema.submitRsvpBody } },
        },
    },
    responses: {
        200: { description: 'RSVP submitted; tokens and redirectTo returned' },
        400: { description: 'Invalid RSVP status' },
        404: { description: 'Invalid invitation' },
    },
});

const router = Router();

router.post(
    '/:token',
    validator(schema.tokenParam, ValidationSource.PARAM),
    validator(schema.submitRsvpBody, ValidationSource.BODY),
    asyncHandler(async (req, res) => {
        const { token } = req.params;
        const { rsvpStatus, rsvpNote, setPassword } = req.body;

        const guest = await guestRepo.findByInvitationTokenForRsvp(token);

        if (!guest) {
            throw new NotFoundError('Invalid invitation.');
        }

        if (!guest.user) {
            throw new BadRequestError('Guest user not found.');
        }

        await guestRepo.update(guest.id, {
            rsvpStatus,
            rsvpNote: rsvpNote ?? null,
            rsvpRespondedAt: new Date(),
        });

        if (setPassword && setPassword.length >= 8) {
            const hashed = await bcryptjs.hash(setPassword, 12);
            await userRepo.update(guest.userId!, {
                password: hashed,
                verified: true,
            });
        }

        const accessTokenKey = crypto.randomBytes(64).toString('hex');
        const refreshTokenKey = crypto.randomBytes(64).toString('hex');
        await keystoreRepo.create(
            guest.userId!,
            accessTokenKey,
            refreshTokenKey,
        );

        const tokens = await createTokens(
            guest.user,
            accessTokenKey,
            refreshTokenKey,
        );
        setCookies(res, tokens);

        await updateWeddingStats(guest.wedding.id);

        const { password: _p, ...userWithoutPassword } = guest.user;
        new SuccessResponse('RSVP submitted successfully.', {
            guest: { id: guest.id, rsvpStatus, rsvpNote },
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
            redirectTo: '/guest-dashboard',
        }).send(res);
    }),
);

export default router;
