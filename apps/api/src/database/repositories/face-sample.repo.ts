import { prisma } from '..';

export async function create(data: {
  userId?: number | null;
  guestId?: string | null;
  sampleImageUrl: string;
  thumbnailUrl?: string | null;
  faceEncodingId: string;
  encodingQuality?: number;
  isPrimary?: boolean;
  source?: string | null;
}) {
  return prisma.faceSample.create({
    data: {
      userId: data.userId ?? undefined,
      guestId: data.guestId ?? undefined,
      sampleImageUrl: data.sampleImageUrl,
      thumbnailUrl: data.thumbnailUrl ?? data.sampleImageUrl,
      faceEncodingId: data.faceEncodingId,
      encodingQuality: data.encodingQuality ?? undefined,
      isPrimary: data.isPrimary ?? true,
      source: data.source ?? 'upload',
    },
  });
}

export default { create };
