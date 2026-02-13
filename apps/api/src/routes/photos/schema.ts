import z from 'zod';
import { registry } from '../../docs/swagger';

const uuidParam = z.object({ weddingId: z.string().uuid() });
const photoIdParam = z.object({ photoId: z.string().uuid() });

const uploadPhotoBody = z.object({
    eventId: z.string().uuid().optional(),
    originalUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    caption: z.string().max(2000).optional(),
});

const faceSampleBody = z.object({
    imageUrl: z.string().url(),
    guestId: z.string().uuid().optional(),
});

/** Request body for getting a presigned upload URL. Frontend will PUT file to uploadUrl. */
const presignPhotoBody = z.object({
    fileName: z.string().min(1).max(255),
    contentType: z
        .string()
        .min(1)
        .max(100)
        .refine(
            (s) => s.startsWith('image/'),
            'Must be an image MIME type (e.g. image/jpeg)',
        ),
});

/** Request body for confirming a photo after frontend has uploaded to S3 using the presigned URL. */
const confirmPhotoBody = z.object({
    key: z.string().min(1).max(1024),
    eventId: z.string().uuid().optional(),
    caption: z.string().max(2000).optional(),
});

/** Same shape as presign for photo upload; used for face-sample file upload. */
const presignFaceSampleBody = presignPhotoBody;

registry.register('UploadPhotoBody', uploadPhotoBody);
registry.register('FaceSampleBody', faceSampleBody);
registry.register('PresignPhotoBody', presignPhotoBody);
registry.register('PresignFaceSampleBody', presignFaceSampleBody);
registry.register('ConfirmPhotoBody', confirmPhotoBody);

export default {
    uuidParam,
    photoIdParam,
    uploadPhotoBody,
    faceSampleBody,
    presignPhotoBody,
    presignFaceSampleBody,
    confirmPhotoBody,
};
