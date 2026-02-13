import { prisma } from '..';

export async function findManyByUserId(
    userId: number,
    options?: { weddingId?: string },
) {
    // Include tags where the user is tagged directly (userId) OR via a guest record (guest.userId)

    const tags = await prisma.photoTag.findMany({
        where: {
            rejected: false,
            OR: [{ userId }, { guest: { userId } }] as const,
        },
        include: {
            photo: {
                include: {
                    wedding: {
                        select: { id: true, title: true, weddingDate: true },
                    },
                    event: {
                        select: { id: true, name: true, eventType: true },
                    },
                    uploadedByUser: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (options?.weddingId) {
        return tags.filter((t) => t.photo.weddingId === options.weddingId);
    }
    return tags;
}

export async function create(data: {
    photoId: string;
    guestId?: string | null;
    userId?: number | null;
    confidenceScore?: number | null;
    boundingBox?: object;
    faceEncodingId?: string | null;
}) {
    return prisma.photoTag.create({
        data: {
            ...data,
            verified: false,
            rejected: false,
            isPrimaryPerson: false,
        },
    });
}

export default {
    findManyByUserId,
    create,
};
