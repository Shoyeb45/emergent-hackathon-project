import { Router } from 'express';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessResponse } from '../../core/api-response';
import { getUserData } from '../../core/utils';
import authMiddleware from '../../middlewares/auth.middleware';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/auth/me',
    summary: 'Get current user',
    description: 'Returns the authenticated user. Requires Bearer JWT.',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: { description: 'Current user data' },
        401: { description: 'Invalid or missing access token' },
        403: { description: 'Missing or invalid API key' },
    },
});

const router = Router();

router.use(authMiddleware);

router.get(
    '/',
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userData = getUserData(req.user);
        new SuccessResponse('Current user.', userData).send(res);
    }),
);

export default router;
