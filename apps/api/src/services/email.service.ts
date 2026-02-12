import { mailClient } from './ses.service';
import { sesFromEmail, sesFromName } from '../config';
import logger from '../core/logger';

export interface InvitationEmailData {
    to: string;
    guestName: string;
    weddingTitle: string;
    weddingDate: Date;
    invitationLink: string;
    isNewAccount: boolean;
}

export async function sendInvitationEmail(
    data: InvitationEmailData,
): Promise<{ success: boolean }> {
    const {
        to,
        guestName,
        weddingTitle,
        weddingDate,
        invitationLink,
        isNewAccount,
    } = data;
    const formattedDate = new Date(weddingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const accountMessage = isNewAccount
        ? " We've created an account for you. You can set your password when you RSVP."
        : '';

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>You're Invited!</h1>
      <p>Dear ${guestName},</p>
      <p>You are cordially invited to:</p>
      <p><strong>${weddingTitle}</strong></p>
      <p>📅 ${formattedDate}</p>
      <p>${accountMessage}</p>
      <p><a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">RSVP Now</a></p>
    </div>
  `;

    if (!sesFromEmail) {
        logger.warn('SES_FROM_EMAIL not set; skipping invitation email.', {
            to,
            weddingTitle,
        });
        return { success: true };
    }

    try {
        const from = sesFromName
            ? `"${sesFromName}" <${sesFromEmail}>`
            : sesFromEmail;

        await mailClient.sendEmail(
            {
                Source: from,
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Subject: {
                        Data: `You're Invited to ${weddingTitle}!`,
                        Charset: 'UTF-8',
                    },
                    Body: {
                        Html: {
                            Data: htmlBody,
                            Charset: 'UTF-8',
                        },
                    },
                },
            },
            to,
        );
        return { success: true };
    } catch (error) {
        logger.error('Failed to send invitation email.', { to, error });
        throw error;
    }
}

export interface PasswordResetOtpEmailData {
    to: string;
    otp: string;
}

export async function sendPasswordResetOtpEmail(
    data: PasswordResetOtpEmailData,
): Promise<{ success: boolean }> {
    const { to, otp } = data;

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Password reset</h1>
      <p>Use this one-time password to reset your account:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This OTP expires in 10 minutes. If you did not request a reset, please ignore this email.</p>
    </div>
  `;

    if (!sesFromEmail) {
        logger.warn(
            'SES_FROM_EMAIL not set; skipping password reset OTP email.',
            { to },
        );
        return { success: true };
    }

    try {
        const from = sesFromName
            ? `"${sesFromName}" <${sesFromEmail}>`
            : sesFromEmail;

        await mailClient.sendEmail(
            {
                Source: from,
                Destination: { ToAddresses: [to] },
                Message: {
                    Subject: {
                        Data: 'Your password reset code',
                        Charset: 'UTF-8',
                    },
                    Body: {
                        Html: { Data: htmlBody, Charset: 'UTF-8' },
                    },
                },
            },
            to,
        );
        return { success: true };
    } catch (error) {
        logger.error('Failed to send password reset OTP email.', { to, error });
        throw error;
    }
}
