import { prisma } from '..';

export async function findManyByHostId(hostId: number) {
  return prisma.wedding.findMany({
    where: { hostId },
    include: {
      events: {
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          eventDate: true,
          startTime: true,
          endTime: true,
          eventType: true,
          location: true,
        },
      },
      guests: { select: { id: true, rsvpStatus: true } },
      stats: true,
      _count: { select: { events: true, guests: true, photos: true } },
    },
    orderBy: { weddingDate: 'desc' },
  });
}

export async function findManyByGuestUserId(userId: number) {
  return prisma.wedding.findMany({
    where: {
      guests: {
        some: { userId },
      },
    },
    include: {
      host: { select: { id: true, name: true } },
      events: {
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          eventDate: true,
          startTime: true,
          endTime: true,
          eventType: true,
          location: true,
        },
      },
      guests: {
        where: { userId },
        select: { id: true, rsvpStatus: true },
      },
      stats: true,
      _count: { select: { events: true, guests: true, photos: true } },
    },
    orderBy: { weddingDate: 'desc' },
  });
}

export async function findById(weddingId: string) {
  return prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      host: { select: { id: true, name: true, email: true, phone: true } },
      events: { orderBy: { displayOrder: 'asc' } },
      guests: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      stats: true,
    },
  });
}

export async function getHostId(weddingId: string): Promise<number | null> {
  const w = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { hostId: true },
  });
  return w?.hostId ?? null;
}

export async function findByIdMinimal(weddingId: string) {
  return prisma.wedding.findUnique({
    where: { id: weddingId },
    select: {
      id: true,
      hostId: true,
      title: true,
      weddingDate: true,
      autoTagPhotos: true,
    },
  });
}

export async function create(data: {
  hostId: number;
  title: string;
  description?: string | null;
  weddingDate: Date;
  venue?: string | null;
  venueAddress?: string | null;
  coverImageUrl?: string | null;
}) {
  const wedding = await prisma.wedding.create({
    data: {
      ...data,
      status: 'planning',
      autoTagPhotos: true,
    },
    include: {
      host: { select: { id: true, name: true, email: true } },
    },
  });
  await prisma.weddingStats.create({
    data: {
      weddingId: wedding.id,
      totalGuests: 0,
      guestsAccepted: 0,
      guestsDeclined: 0,
      guestsPending: 0,
      totalEvents: 0,
      totalPhotos: 0,
      photosProcessed: 0,
      photosPending: 0,
      totalFaceTags: 0,
    },
  });
  return wedding;
}

export async function update(weddingId: string, data: Record<string, unknown>) {
  return prisma.wedding.update({
    where: { id: weddingId },
    data,
  });
}

export default {
  findManyByHostId,
  findManyByGuestUserId,
  findById,
  findByIdMinimal,
  getHostId,
  create,
  update,
};
