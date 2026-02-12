import { prisma } from '..';

export async function findManyByWeddingId(weddingId: string) {
  return prisma.event.findMany({
    where: { weddingId },
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { photos: true } } },
  });
}

export async function findById(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: { wedding: { select: { hostId: true, id: true } } },
  });
}

export async function create(data: {
  weddingId: string;
  name: string;
  description?: string | null;
  eventDate: Date;
  startTime: number;
  endTime?: number | null;
  location?: string | null;
  locationAddress?: string | null;
  eventType?: string | null;
  colorTheme?: string | null;
  icon?: string | null;
  dressCode?: string | null;
  displayOrder: number;
}) {
  return prisma.event.create({ data });
}

export async function update(eventId: string, data: Record<string, unknown>) {
  return prisma.event.update({
    where: { id: eventId },
    data,
  });
}

export async function remove(eventId: string) {
  return prisma.event.delete({ where: { id: eventId } });
}

export async function incrementWeddingEventsCount(weddingId: string, delta: number) {
  return prisma.weddingStats.update({
    where: { weddingId },
    data: { totalEvents: { increment: delta } },
  });
}

export default {
  findManyByWeddingId,
  findById,
  create,
  update,
  remove,
  incrementWeddingEventsCount,
};
