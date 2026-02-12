import z from 'zod';
import { registry } from '../../docs/swagger';

export const tokenParam = z.object({
    token: z.string().min(1).max(64),
});

export const submitRsvpBody = z.object({
    rsvpStatus: z.enum(['accepted', 'declined']),
    rsvpNote: z.string().max(2000).optional(),
    setPassword: z.string().min(8).max(128).optional(),
});

registry.register('SubmitRsvpBody', submitRsvpBody);

export default { tokenParam, submitRsvpBody };
