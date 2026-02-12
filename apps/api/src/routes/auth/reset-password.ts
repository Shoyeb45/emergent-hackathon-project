import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { ValidationSource } from '../../helpers/validator';
import { asyncHandler } from '../../core/async-handler';
import { SuccessMsgResponse } from '../../core/api-response';
import { resetPasswordWithOtp } from '../../services/auth.service';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'post',
    path: '/auth/reset-password',
    summary: 'Reset password',
    description:
        'Reset password using the OTP sent to email. Requires email, otp (6 digits), and newPassword. Requires API key.',
    tags: ['Auth'],
    security: [],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schema.resetPassword,
                },
            },
        },
    },
    responses: {
        200: { description: 'Password reset successful' },
        400: { description: 'Invalid or expired OTP' },
        403: { description: 'Missing or invalid API key' },
    },
});

const router = Router();

router.post(
    '/',
    validator(schema.resetPassword, ValidationSource.BODY),
    asyncHandler(async (req, res) => {
        const { email, otp, newPassword } = req.body;
        await resetPasswordWithOtp(email, otp, newPassword);
        new SuccessMsgResponse(
            'Password has been reset. You can now sign in with your new password.',
        ).send(res);
    }),
);

export default router;
