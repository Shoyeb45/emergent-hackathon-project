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
        ? "We've created an account for you. You can set your password when you RSVP."
        : '';

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Invitation</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%); font-family: 'Georgia', 'Times New Roman', serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; max-width: 100%;">
                    
                    <!-- Decorative Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 50%, #6b1f3f 100%); padding: 0; position: relative;">
                            <!-- Gold ornamental border top -->
                            <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #d4af37 20%, #d4af37 80%, transparent 100%);"></div>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 50px 40px; text-align: center;">
                                        <!-- Decorative flourish -->
                                        <div style="margin-bottom: 20px; font-size: 40px; color: #d4af37; line-height: 1;">✦</div>
                                        
                                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; font-family: 'Georgia', serif;">
                                            You're Invited
                                        </h1>
                                        
                                        <!-- Decorative flourish -->
                                        <div style="margin-top: 20px; font-size: 40px; color: #d4af37; line-height: 1;">✦</div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Gold ornamental border bottom -->
                            <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #d4af37 20%, #d4af37 80%, transparent 100%);"></div>
                        </td>
                    </tr>
                    
                    <!-- Content Section -->
                    <tr>
                        <td style="padding: 50px 40px; background: #ffffff;">
                            <!-- Greeting -->
                            <p style="margin: 0 0 30px 0; color: #2c2c2c; font-size: 18px; line-height: 1.6; text-align: center; font-style: italic;">
                                Dear <strong style="color: #6b1f3f; font-style: normal;">${guestName}</strong>,
                            </p>
                            
                            <!-- Invitation Text -->
                            <p style="margin: 0 0 40px 0; color: #4a4a4a; font-size: 16px; line-height: 1.8; text-align: center;">
                                You are cordially invited to celebrate the union of
                            </p>
                            
                            <!-- Wedding Title - Emphasized -->
                            <div style="margin: 0 0 40px 0; padding: 30px; background: linear-gradient(135deg, #faf8f3 0%, #f5f0e8 100%); border-left: 4px solid #6b1f3f; border-right: 4px solid #6b1f3f; position: relative;">
                                <!-- Decorative corner elements -->
                                <div style="position: absolute; top: 10px; left: 10px; width: 30px; height: 30px; border-top: 2px solid #d4af37; border-left: 2px solid #d4af37;"></div>
                                <div style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-top: 2px solid #d4af37; border-right: 2px solid #d4af37;"></div>
                                <div style="position: absolute; bottom: 10px; left: 10px; width: 30px; height: 30px; border-bottom: 2px solid #d4af37; border-left: 2px solid #d4af37;"></div>
                                <div style="position: absolute; bottom: 10px; right: 10px; width: 30px; height: 30px; border-bottom: 2px solid #d4af37; border-right: 2px solid #d4af37;"></div>
                                
                                <h2 style="margin: 0; color: #6b1f3f; font-size: 28px; font-weight: 400; text-align: center; letter-spacing: 1px; font-family: 'Georgia', serif;">
                                    ${weddingTitle}
                                </h2>
                            </div>
                            
                            <!-- Date Section -->
                            <div style="margin: 0 0 40px 0; text-align: center;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); color: #ffffff; padding: 20px 40px; border-radius: 50px; box-shadow: 0 8px 20px rgba(107, 31, 63, 0.3);">
                                    <div style="font-size: 14px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; margin-bottom: 8px;">
                                        📅 Save the Date
                                    </div>
                                    <div style="font-size: 18px; font-weight: 600; letter-spacing: 1px;">
                                        ${formattedDate}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Account Message (if applicable) -->
                            ${accountMessage ? `
                            <div style="margin: 0 0 40px 0; padding: 20px; background: #fff9f0; border-left: 3px solid #d4af37; border-radius: 8px;">
                                <p style="margin: 0; color: #6b5d3f; font-size: 14px; line-height: 1.6;">
                                    ℹ️ <strong>Account Created:</strong> ${accountMessage}
                                </p>
                            </div>
                            ` : ''}
                            
                            <!-- Decorative Divider -->
                            <div style="margin: 40px 0; text-align: center;">
                                <div style="display: inline-block; width: 60px; height: 1px; background: #d4af37; position: relative;">
                                    <span style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); color: #d4af37; font-size: 14px;">❖</span>
                                </div>
                            </div>
                            
                            <!-- RSVP Button -->
                            <div style="text-align: center; margin: 40px 0 0 0;">
                                <a href="${invitationLink}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 10px 30px rgba(107, 31, 63, 0.4); transition: all 0.3s ease;">
                                    ✨ RSVP Now ✨
                                </a>
                                <p style="margin: 20px 0 0 0; color: #888; font-size: 13px; font-style: italic;">
                                    We can't wait to celebrate with you!
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer Section -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f8f5f0 0%, #f0ebe3 100%); padding: 40px; text-align: center; border-top: 1px solid #e0dcd5;">
                            <!-- Decorative element -->
                            <div style="margin-bottom: 20px; font-size: 24px; color: #6b1f3f;">❦</div>
                            
                            <p style="margin: 0 0 10px 0; color: #6b1f3f; font-size: 14px; font-style: italic; font-family: 'Georgia', serif;">
                                With love and anticipation
                            </p>
                            
                            <div style="margin: 20px 0; height: 1px; background: linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%);"></div>
                            
                            <p style="margin: 0; color: #888; font-size: 12px; line-height: 1.6;">
                                This is an automated invitation. Please do not reply to this email.<br>
                                If you have any questions, please contact the wedding organizers.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Bottom Decorative Border -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 50%, #6b1f3f 100%); padding: 0;">
                            <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #d4af37 20%, #d4af37 80%, transparent 100%);"></div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
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
                        Data: `✨ You're Invited to ${weddingTitle}! ✨`,
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
