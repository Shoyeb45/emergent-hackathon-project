import crypto from 'crypto';
import { mailClient } from './ses.service';
import { s3Service } from './s3.service';
import { sesFromEmail, sesFromName } from '../config';
import logger from '../core/logger';
import QRCode from 'qrcode';

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

    // Generate QR code; upload to S3 for storage; embed in email via inline attachment (CID) so Gmail doesn't strip the image
    let qrBuffer: Buffer | null = null;
    try {
        qrBuffer = await QRCode.toBuffer(invitationLink, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 200,
            margin: 1,
            color: { dark: '#6b1f3f', light: '#ffffff' },
        });
        const qrKey = `invitations/qr/${crypto.createHash('sha256').update(invitationLink).digest('hex').slice(0, 16)}.png`;
        const qrUrl = await s3Service.uploadToS3(qrBuffer, qrKey, 'image/png');
        logger.info('QR code uploaded to S3', { to, qrUrl });
    } catch (error) {
        logger.error('Failed to generate or upload QR code', { error, to });
    }

    // Use cid:qrcode so image is embedded in email (Gmail strips external img src URLs)
    const qrImgSrc = qrBuffer ? 'cid:qrcode' : '';

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Invitation</title>
</head>
<body style="margin: 0; padding: 0; background: #e9ecef; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 24px 0;">
        <tr>
            <td align="center" style="padding: 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="550" style="margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,0.12); max-width: 100%;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); height: 3px;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 36px 40px; background: #fdfbf7;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 18px;">
                                        <span style="color: #d4af37; font-size: 28px;">✦</span>
                                        <span style="color: #6b1f3f; font-size: 15px; margin: 0 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">You're Invited</span>
                                        <span style="color: #d4af37; font-size: 28px;">✦</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 14px;">
                                        <p style="margin: 0; color: #2c2c2c; font-size: 16px; font-style: italic;">Dear <strong style="color: #6b1f3f; font-style: normal;">${guestName}</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 14px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tr><td style="width: 70px; height: 1px; background: #d4af37;"></td></tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <p style="margin: 0; color: #4a4a4a; font-size: 15px; line-height: 1.5;">You are cordially invited to celebrate</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 18px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); border-radius: 8px; padding: 20px 24px; text-align: center;">
                                                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 400; letter-spacing: 0.5px; font-family: Georgia, serif;">${weddingTitle}</h2>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 18px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); border-radius: 50px; padding: 14px 32px; text-align: center;">
                                                    <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.9); margin-bottom: 4px;">📅 Save the Date</div>
                                                    <div style="font-size: 16px; font-weight: 600; color: #ffffff;">${formattedDate}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                ${accountMessage ? `
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 14px 16px; background: #fff9f0; border-left: 3px solid #d4af37; border-radius: 6px;">
                                                    <p style="margin: 0; color: #6b5d3f; font-size: 13px; line-height: 1.5;"><strong>Note:</strong> ${accountMessage}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;"><span style="color: #d4af37; font-size: 14px;">❖</span></td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <a href="${invitationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">RSVP Now</a>
                                    </td>
                                </tr>
                                ${qrImgSrc ? `
                                <tr>
                                    <td align="center" style="padding-bottom: 12px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="60%">
                                            <tr>
                                                <td style="border-top: 1px solid #d4af37; padding-top: 12px; text-align: center;">
                                                    <span style="color: #888; font-size: 11px; text-transform: uppercase;">or scan QR code</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="background: #fdfbf7; border: 1px solid #f0ebe3; border-radius: 10px;">
                                            <tr>
                                                <td style="padding: 14px; text-align: center;">
                                                    <img src="${qrImgSrc}" alt="RSVP QR Code" width="160" height="160" style="display: block; border-radius: 6px;" />
                                                    <p style="margin: 8px 0 0 0; color: #6b1f3f; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Scan to RSVP</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td align="center" style="padding-top: 4px;">
                                        <p style="margin: 0; color: #888; font-size: 12px; font-style: italic;">We can't wait to celebrate with you!</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f8f5f0; padding: 20px 30px; text-align: center; border-top: 1px solid #e8e4dc;">
                            <p style="margin: 0 0 8px 0; color: #6b1f3f; font-size: 13px; font-style: italic;">With love and anticipation</p>
                            <p style="margin: 0; color: #999; font-size: 11px;">This is an automated invitation. Please do not reply.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); height: 3px;"></td>
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
        const subject = `✨ You're Invited to ${weddingTitle}! ✨`;

        if (qrBuffer) {
            await mailClient.sendRawEmail(
                from,
                to,
                subject,
                htmlBody,
                {
                    contentBase64: qrBuffer.toString('base64'),
                    contentType: 'image/png',
                    contentId: 'qrcode',
                },
            );
        } else {
            await mailClient.sendEmail(
                {
                    Source: from,
                    Destination: { ToAddresses: [to] },
                    Message: {
                        Subject: { Data: subject, Charset: 'UTF-8' },
                        Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } },
                    },
                },
                to,
            );
        }
        logger.info('Invitation email sent successfully', { to, weddingTitle });
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%); font-family: Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="500" style="margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b1f3f 0%, #8b2f4f 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                Password Reset
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
                                Use this one-time password to reset your account:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8f5f0 0%, #ffffff 100%); border: 2px dashed #6b1f3f; border-radius: 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                    Your OTP Code
                                </p>
                                <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6b1f3f; font-family: 'Courier New', monospace;">
                                    ${otp}
                                </p>
                            </div>
                            
                            <!-- Warning -->
                            <div style="margin: 30px 0; padding: 15px; background: #fff9f0; border-left: 3px solid #d4af37; border-radius: 6px;">
                                <p style="margin: 0; color: #6b5d3f; font-size: 14px; line-height: 1.5;">
                                    ⏱️ This OTP expires in <strong>10 minutes</strong>.<br>
                                    If you did not request a password reset, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f5f0; padding: 20px 30px; text-align: center; border-top: 1px solid #e8e4dc;">
                            <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                                This is an automated email. Please do not reply.
                            </p>
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
        logger.info('Password reset OTP email sent successfully', { to });
        return { success: true };
    } catch (error) {
        logger.error('Failed to send password reset OTP email.', { to, error });
        throw error;
    }
}