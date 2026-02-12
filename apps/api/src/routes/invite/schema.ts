import z from 'zod';

export const tokenParam = z.object({
    token: z.string().min(1).max(64),
});

export default { tokenParam };
