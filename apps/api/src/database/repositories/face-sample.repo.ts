import { prisma } from '..';

export async function create(data: {
  userId: number;
  sampleImageUrl: string;
  thumbnailUrl?: string | null;
  faceEncodingId: string;
  encodingQuality?: number;
  isPrimary?: boolean;
  source?: string | null;
}) {
  return prisma.faceSample.create({
    data: {
      ...data,
      isPrimary: data.isPrimary ?? true,
      source: data.source ?? 'upload',
    },
  });
}

export default { create };
