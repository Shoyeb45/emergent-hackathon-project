import { AuthUser } from '../../types/user';
import { prisma } from '..';

async function findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return user;
}

async function create(
    userData: { name: string; email: string; password: string; phone?: string },
    accessTokenKey: string,
    refreshTokenKey: string,
) {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone ?? null,
            },
        });

        const keystore = await tx.keystore.create({
            data: {
                clientId: user.id,
                primaryKey: accessTokenKey,
                secondaryKey: refreshTokenKey,
            },
        });

        return { user, keystore };
    });

    return result;
}

async function findById(id: number): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
        where: { id, status: true },
    });
    return user;
}

async function checkById(id: number) {
    return prisma.user.findUnique({
        where: { id },
    });
}

async function checkByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
}

async function update(
    id: number,
    data: {
        password?: string;
        verified?: boolean;
        faceEncodingId?: string;
        faceSampleUploaded?: boolean;
        passwordResetOtp?: string | null;
        passwordResetOtpExpiresAt?: Date | null;
    },
) {
    return prisma.user.update({
        where: { id },
        data,
    });
}

async function setPasswordResetOtp(
    userId: number,
    otp: string,
    expiresAt: Date,
): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            passwordResetOtp: otp,
            passwordResetOtpExpiresAt: expiresAt,
        },
    });
}

async function clearPasswordResetOtp(userId: number): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: {
            passwordResetOtp: null,
            passwordResetOtpExpiresAt: null,
        },
    });
}

/** Create user only (no keystore). Used when adding guests who do not have an account yet. */
async function createUserOnly(data: {
    name: string;
    email: string;
    password: string;
}) {
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
            verified: false,
            status: true,
        },
    });
}

export default {
    findByEmail,
    create,
    createUserOnly,
    findById,
    checkById,
    checkByEmail,
    update,
    setPasswordResetOtp,
    clearPasswordResetOtp,
};
