import { prisma } from '../database';

export async function updateWeddingStats(weddingId: string): Promise<void> {
    try {
        const [
            totalGuests,
            guestsAccepted,
            guestsDeclined,
            guestsPending,
            totalEvents,
            totalPhotos,
            photosProcessed,
            photosPending,
            totalFaceTags,
        ] = await Promise.all([
            prisma.guest.count({ where: { weddingId } }),
            prisma.guest.count({
                where: { weddingId, rsvpStatus: 'accepted' },
            }),
            prisma.guest.count({
                where: { weddingId, rsvpStatus: 'declined' },
            }),
            prisma.guest.count({ where: { weddingId, rsvpStatus: 'pending' } }),
            prisma.event.count({ where: { weddingId } }),
            prisma.photo.count({ where: { weddingId } }),
            prisma.photo.count({
                where: { weddingId, processingStatus: 'completed' },
            }),
            prisma.photo.count({
                where: { weddingId, processingStatus: 'pending' },
            }),
            prisma.photoTag.count({
                where: { photo: { weddingId } },
            }),
        ]);

        await prisma.weddingStats.upsert({
            where: { weddingId },
            create: {
                weddingId,
                totalGuests,
                guestsAccepted,
                guestsDeclined,
                guestsPending,
                totalEvents,
                totalPhotos,
                photosProcessed,
                photosPending,
                totalFaceTags,
                lastCalculatedAt: new Date(),
            },
            update: {
                totalGuests,
                guestsAccepted,
                guestsDeclined,
                guestsPending,
                totalEvents,
                totalPhotos,
                photosProcessed,
                photosPending,
                totalFaceTags,
                lastCalculatedAt: new Date(),
            },
        });
    } catch (err) {
        console.error('updateWeddingStats error:', err);
    }
}
