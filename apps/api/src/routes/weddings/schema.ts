import z from 'zod';
import { registry } from '../../docs/swagger';
import { zodTimeOnly } from '../../helpers/time';

const uuidParam = z.object({
    weddingId: z.string().uuid(),
});

const eventIdParam = z.object({
    eventId: z.string().uuid(),
});

const createWeddingBody = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
    weddingDate: z.string().min(1),
    venue: z.string().max(500).optional(),
    venueAddress: z.string().max(2000).optional(),
    coverImageUrl: z.string().url().optional().or(z.literal('')),
});

const updateWeddingBody = createWeddingBody.partial();

const createEventItem = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    eventDate: z.string(),
    startTime: zodTimeOnly,
    endTime: zodTimeOnly.optional(),
    location: z.string().max(500).optional(),
    locationAddress: z.string().max(2000).optional(),
    eventType: z.string().max(50).optional(),
    colorTheme: z.string().max(7).optional(),
    icon: z.string().max(50).optional(),
    dressCode: z.string().max(255).optional(),
});

const createEventsBody = z.object({
    events: z.array(createEventItem).min(1).max(50),
});

const addGuestsBody = z.object({
    guests: z
        .array(z.object({ email: z.string().email() }))
        .min(1)
        .max(500),
});

const guestIdParam = z.object({
    weddingId: z.string().uuid(),
    guestId: z.string().uuid(),
});

const updateGuestBody = z.object({
    uploadPermission: z.boolean().optional(),
});

const updateEventBody = createEventItem.partial();

registry.register('UuidParam', uuidParam);
registry.register('CreateWeddingBody', createWeddingBody);
registry.register('UpdateWeddingBody', updateWeddingBody);
registry.register('CreateEventsBody', createEventsBody);
registry.register('AddGuestsBody', addGuestsBody);
registry.register('GuestIdParam', guestIdParam);
registry.register('UpdateGuestBody', updateGuestBody);
registry.register('UpdateEventBody', updateEventBody);

export default {
    uuidParam,
    eventIdParam,
    guestIdParam,
    createWeddingBody,
    updateWeddingBody,
    createEventsBody,
    addGuestsBody,
    updateGuestBody,
    updateEventBody,
};
