import bcryptjs from 'bcryptjs';
import UserRepo from '../database/repositories/user.repo';
import { sendPasswordResetOtpEmail } from './email.service';
import { BadRequestError } from '../core/api-error';
import type { User } from '@prisma/client';

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

/**
 * Request password reset: find user by email, generate OTP, store and send email.
 * Returns success even when email not found (no user enumeration).
 */
export async function requestPasswordReset(
    email: string,
): Promise<{ success: boolean }> {
    const user = await UserRepo.findByEmail(email);
    if (!user) {
        return { success: true };
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await UserRepo.setPasswordResetOtp(user.id, otp, expiresAt);
    await sendPasswordResetOtpEmail({ to: email, otp });
    return { success: true };
}

/**
 * Reset password using OTP: validate OTP and expiry, then set new password and clear OTP.
 */
export async function resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string,
): Promise<void> {
    const user = await UserRepo.findByEmail(email);
    if (!user) {
        throw new BadRequestError('Invalid or expired reset code.');
    }

    const u = user as User;
    const storedOtp = u.passwordResetOtp;
    const expiresAt = u.passwordResetOtpExpiresAt;

    if (!storedOtp || !expiresAt || new Date() > expiresAt) {
        throw new BadRequestError('Invalid or expired reset code.');
    }
    if (storedOtp !== otp.trim()) {
        throw new BadRequestError('Invalid or expired reset code.');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    await UserRepo.update(user.id, { password: hashedPassword });
    await UserRepo.clearPasswordResetOtp(user.id);
}
