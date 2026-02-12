import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { SuccessMsgResponse } from '../../core/api-response';
import { requestPasswordReset } from '../../services/auth.service';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'post',
    path: '/auth/forgot-password',
    summary: 'Forgot password',
    description:
        'Request a password reset. Sends a 6-digit OTP to the email via SES. Always returns success to avoid user enumeration. Requires API key.',
    tags: ['Auth'],
    security: [],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schema.forgotPassword,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'If the email exists, OTP was sent. Check your inbox.',
        },
        403: { description: 'Missing or invalid API key' },
    },
});

const router = Router();

router.post(
    '/',
    validator(schema.forgotPassword, ValidationSource.BODY),
    asyncHandler(async (req, res) => {
        await requestPasswordReset(req.body.email);
        new SuccessMsgResponse(
            'If an account exists with this email, you will receive a password reset code shortly.',
        ).send(res);
    }),
);

export default router;
