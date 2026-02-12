import { prisma } from '..';

export async function findManyForGallery(
  weddingId: string,
  options: { eventId?: string; skip: number; take: number }
) {
  const where: { weddingId: string; isPublic: boolean; isApproved: boolean; eventId?: string } = {
    weddingId,
    isPublic: true,
    isApproved: true,
  };
  if (options.eventId) where.eventId = options.eventId;

  const [photos, totalCount] = await Promise.all([
    prisma.photo.findMany({
      where,
      include: {
        uploadedByUser: { select: { id: true, name: true, profileImageUrl: true } },
        event: { select: { id: true, name: true, eventType: true } },
        _count: { select: { photoTags: true } },
      },
      orderBy: { uploadedAt: 'desc' },
      skip: options.skip,
      take: options.take,
    }),
    prisma.photo.count({ where }),
  ]);
  return { photos, totalCount };
}

export async function findById(photoId: string) {
  return prisma.photo.findUnique({
    where: { id: photoId },
    include: {
      wedding: { select: { id: true, autoTagPhotos: true } },
    },
  });
}

export async function create(data: {
  weddingId: string;
  eventId?: string | null;
  uploadedByUserId: number;
  uploadedByGuestId?: string | null;
  fileName: string;
  originalUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  processingStatus?: string;
  isPublic?: boolean;
  isApproved?: boolean;
}) {
  return prisma.photo.create({
    data: {
      ...data,
      processingStatus: data.processingStatus ?? 'pending',
      isPublic: data.isPublic ?? true,
      isApproved: data.isApproved ?? true,
    },
  });
}

export async function update(photoId: string, data: Record<string, unknown>) {
  return prisma.photo.update({
    where: { id: photoId },
    data,
  });
}

export async function createAiQueueEntry(photoId: string, weddingId: string) {
  return prisma.aiProcessingQueue.create({
    data: {
      photoId,
      weddingId,
      status: 'queued',
      priority: 5,
      attempts: 0,
      maxAttempts: 3,
    },
  });
}

export async function updateAiQueue(photoId: string, data: Record<string, unknown>) {
  return prisma.aiProcessingQueue.updateMany({
    where: { photoId },
    data,
  });
}

export async function incrementWeddingPhotoCount(
  weddingId: string,
  options: { total?: number; pending?: number }
) {
  const update: Record<string, { increment: number }> = {};
  if (options.total != null) update.totalPhotos = { increment: options.total };
  if (options.pending != null) update.photosPending = { increment: options.pending };
  if (Object.keys(update).length === 0) return;
  return prisma.weddingStats.update({
    where: { weddingId },
    data: update,
  });
}

export default {
  findManyForGallery,
  findById,
  create,
  update,
  createAiQueueEntry,
  updateAiQueue,
  incrementWeddingPhotoCount,
};
