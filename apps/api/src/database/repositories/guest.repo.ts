import { prisma } from '..';

type GuestWhere = {
  weddingId: string;
  rsvpStatus?: string;
  user?: { OR: { name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }[] };
};

export async function findManyByWeddingId(weddingId: string, filters?: { rsvpStatus?: string; search?: string }) {
  const where: GuestWhere = { weddingId };
  if (filters?.rsvpStatus) where.rsvpStatus = filters.rsvpStatus;
  if (filters?.search?.trim()) {
    const term = filters.search.trim();
    (where as Record<string, unknown>).user = {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    };
  }
  return prisma.guest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(guestId: string) {
  return prisma.guest.findUnique({
    where: { id: guestId },
  });
}

export async function findByInvitationToken(token: string) {
  return prisma.guest.findUnique({
    where: { invitationToken: token },
    include: {
      wedding: {
        select: {
          id: true,
          title: true,
          description: true,
          weddingDate: true,
          venue: true,
          venueAddress: true,
          coverImageUrl: true,
          host: { select: { name: true, email: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, verified: true } },
    },
  });
}

export async function findByInvitationTokenForRsvp(token: string) {
  return prisma.guest.findUnique({
    where: { invitationToken: token },
    include: {
      user: true,
      wedding: {
        select: { id: true, title: true, weddingDate: true },
      },
    },
  });
}

export async function findManyByUserId(userId: number) {
  return prisma.guest.findMany({
    where: { userId },
    select: { id: true, weddingId: true },
  });
}

export async function findManyWithEncodings(weddingId: string) {
  return prisma.guest.findMany({
    where: {
      weddingId,
      faceSampleProvided: true,
      faceEncodingId: { not: null },
    },
    select: {
      id: true,
      userId: true,
      faceEncodingId: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function findFirstByWeddingAndUser(weddingId: string, userId: number) {
  return prisma.guest.findFirst({
    where: { weddingId, userId },
    select: { id: true },
  });
}

export async function findMyGuestByWedding(weddingId: string, userId: number) {
  return prisma.guest.findFirst({
    where: { weddingId, userId },
    select: {
      id: true,
      uploadPermission: true,
      uploadRequestedAt: true,
      rsvpStatus: true,
    },
  });
}

export async function findFirstWithUploadPermission(weddingId: string, userId: number) {
  return prisma.guest.findFirst({
    where: { weddingId, userId, uploadPermission: true },
  });
}

export async function findExistingByWeddingAndUser(weddingId: string, userId: number) {
  return prisma.guest.findFirst({
    where: { weddingId, userId },
  });
}

export async function create(data: {
  weddingId: string;
  userId: number;
  invitationToken: string;
  rsvpStatus?: string;
  uploadPermission?: boolean;
  faceSampleProvided?: boolean;
  photosProcessed?: boolean;
}) {
  return prisma.guest.create({
    data: {
      ...data,
      rsvpStatus: data.rsvpStatus ?? 'pending',
      uploadPermission: data.uploadPermission ?? false,
      faceSampleProvided: data.faceSampleProvided ?? false,
      photosProcessed: data.photosProcessed ?? false,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function update(guestId: string, data: Record<string, unknown>) {
  return prisma.guest.update({
    where: { id: guestId },
    data,
  });
}

export async function updateInvitationSent(guestId: string) {
  return prisma.guest.update({
    where: { id: guestId },
    data: { invitationSentAt: new Date() },
  });
}

export default {
  findManyByWeddingId,
  findById,
  findByInvitationToken,
  findByInvitationTokenForRsvp,
  findManyByUserId,
  findManyWithEncodings,
  findFirstByWeddingAndUser,
  findFirstWithUploadPermission,
  findMyGuestByWedding,
  findExistingByWeddingAndUser,
  create,
  update,
  updateInvitationSent,
};
