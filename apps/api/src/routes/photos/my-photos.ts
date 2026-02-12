import { Router } from 'express';
import { asyncHandler } from '../../core/async-handler';
import { ProtectedRequest } from '../../types/app-requests';
import { SuccessResponse } from '../../core/api-response';
import photoTagRepo from '../../database/repositories/photo-tag.repo';
import authMiddleware from '../../middlewares/auth.middleware';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'get',
    path: '/photos/my-photos',
    summary: 'Get my tagged photos',
    description:
        'Photos where the current user is tagged (face recognition). Optional: weddingId. Requires Bearer JWT.',
    tags: ['Photos'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: { description: 'List of tagged photos' },
        401: { description: 'Invalid or missing access token' },
    },
});

const router = Router();

router.use(authMiddleware);

router.get(
    '/',
    asyncHandler(async (req: ProtectedRequest, res) => {
        const userId = req.user.id;
        const weddingId = req.query.weddingId as string | undefined;

        const tags = await photoTagRepo.findManyByUserId(userId, {
            weddingId,
        });

        const list = tags.map((t) => ({
            ...t.photo,
            tagInfo: {
                confidenceScore: t.confidenceScore?.toString(),
                verified: t.verified,
                isPrimaryPerson: t.isPrimaryPerson,
            },
        }));

        new SuccessResponse('My photos.', {
            photos: list,
            totalCount: list.length,
        }).send(res);
    }),
);

export default router;
