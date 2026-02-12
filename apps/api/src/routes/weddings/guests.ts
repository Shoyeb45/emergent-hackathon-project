import { Router } from 'express';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
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
import guestRepo from '../../database/repositories/guest.repo';
import userRepo from '../../database/repositories/user.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { updateWeddingStats } from '../../helpers/stats.helper';
import { sendInvitationEmail } from '../../services/email.service';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/weddings/{weddingId}/guests',
    summary: 'Get wedding guests',
    description:
        'List guests for a wedding. Optional filters: rsvpStatus, search. Requires Bearer JWT.',
    tags: ['Guests'],
    security: [{ bearerAuth: [] }],
    request: { params: schema.uuidParam },
    responses: {
        200: { description: 'List of guests' },
        403: { description: 'Access denied' },
        404: { description: 'Wedding not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/weddings/{weddingId}/guests',
    summary: 'Add guests',
    description:
        'Add one or more guests by email. Creates user if needed, sends invitation. Requires Bearer JWT.',
    tags: ['Guests'],
    security: [{ bearerAuth: [] }],
    request: {
        params: schema.uuidParam,
        body: {
            content: { 'application/json': { schema: schema.addGuestsBody } },
        },
    },
    responses: {
        201: { description: 'Guests invited' },
        400: { description: 'Validation error' },
        403: { description: 'Only host' },
        404: { description: 'Wedding not found' },
    },
});

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get(
    '/',
    validator(schema.uuidParam, ValidationSource.PARAM),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const { weddingId } = req.params;
        const { rsvpStatus, search } = req.query as {
            rsvpStatus?: string;
            search?: string;
        };
        const userId = req.user.id;

        const hostId = await weddingRepo.getHostId(weddingId);
        if (hostId === null) throw new NotFoundError('Wedding not found.');
        if (hostId !== userId)
            throw new ForbiddenError('Access denied.');

        const guests = await guestRepo.findManyByWeddingId(weddingId, {
            rsvpStatus,
            search,
        });

        new SuccessResponse('Guests.', guests).send(res);
    }),
);

router.post(
    '/',
    validator(schema.uuidParam, ValidationSource.PARAM),
    validator(schema.addGuestsBody, ValidationSource.BODY),
    asyncHandler(async (req: ProtectedRequest, res) => {
        const { weddingId } = req.params;
        const userId = req.user.id;
        const { guests: guestsData } = req.body;

        const wedding = await weddingRepo.findByIdMinimal(weddingId);
        if (!wedding) throw new NotFoundError('Wedding not found.');
        if (wedding.hostId !== userId)
            throw new ForbiddenError('Only the host can add guests.');

        const invited: unknown[] = [];
        const errors: { email: string; error: string }[] = [];
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        for (const g of guestsData) {
            try {
                let user = await userRepo.checkByEmail(g.email);
                let autoCreated = false;
                if (!user) {
                    const tempPassword = crypto.randomBytes(16).toString('hex');
                    const hashed = await bcryptjs.hash(tempPassword, 12);
                    user = await userRepo.createUserOnly({
                        name: g.email.split('@')[0],
                        email: g.email,
                        password: hashed,
                    });
                    autoCreated = true;
                }

                const existingGuest = await guestRepo.findExistingByWeddingAndUser(
                    weddingId,
                    user.id,
                );
                if (existingGuest) {
                    errors.push({
                        email: g.email,
                        error: 'Already invited to this wedding',
                    });
                    continue;
                }

                const invitationToken = crypto.randomBytes(32).toString('hex');
                const guest = await guestRepo.create({
                    weddingId,
                    userId: user.id,
                    invitationToken,
                    rsvpStatus: 'pending',
                    uploadPermission: false,
                });

                const invitationLink = `${frontendUrl}/invite/${invitationToken}`;
                await sendInvitationEmail({
                    to: g.email,
                    guestName: user.name,
                    weddingTitle: wedding.title,
                    weddingDate: wedding.weddingDate,
                    invitationLink,
                    isNewAccount: autoCreated,
                });

                await guestRepo.updateInvitationSent(guest.id);

                invited.push(guest);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Unknown error';
                errors.push({ email: g.email, error: message });
            }
        }

        await updateWeddingStats(weddingId);

        new SuccessCreatedResponse(
            `${invited.length} guest(s) invited successfully.`,
            {
                invited,
                errors: errors.length ? errors : undefined,
            },
        ).send(res);
    }),
);

export default router;
