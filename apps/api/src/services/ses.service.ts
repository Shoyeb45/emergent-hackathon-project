import {
    SESClient,
    SendEmailCommand,
    SendEmailCommandInput,
    SendRawEmailCommand,
} from '@aws-sdk/client-ses';
import { awsRegion, awsAccessKeyId, awsSecretAccessKey } from '../config';
import logger from '../core/logger';
import crypto from 'crypto';

class SESMailClient {
    private static instance: SESMailClient;
    private sesClient: SESClient | undefined;

    private constructor() {
        this.initialiseSes();
    }

    private initialiseSes() {
        try {
            if (awsAccessKeyId && awsSecretAccessKey) {
                this.sesClient = new SESClient({
                    region: awsRegion,
                    credentials: {
                        accessKeyId: awsAccessKeyId,
                        secretAccessKey: awsSecretAccessKey,
                    },
                });
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to initialise SES client.', {
                error: message,
            });
        }
    }

    public static getInstance(): SESMailClient {
        if (!SESMailClient.instance) {
            SESMailClient.instance = new SESMailClient();
        }
        return SESMailClient.instance;
    }

    async sendEmail(
        params: SendEmailCommandInput,
        email: string,
    ): Promise<void> {
        if (!this.sesClient) {
            logger.warn('SES not initialised, retrying.');
            this.initialiseSes();
            if (!this.sesClient) {
                logger.error('SES initialisation failed.');
                throw new Error(
                    'Failed to send email: SES client is not initialised.',
                );
            }
        }

        const command = new SendEmailCommand(params);
        await this.sesClient.send(command);
        logger.info(`Email sent to ${email}`);
    }

    /**
     * Send email with inline image (e.g. QR code) via raw MIME.
     * Many clients block data: URLs; using cid: with an inline attachment ensures the image displays.
     */
    async sendRawEmail(
        from: string,
        to: string,
        subject: string,
        html: string,
        inlineImage: { contentBase64: string; contentType: string; contentId: string },
    ): Promise<void> {
        if (!this.sesClient) {
            this.initialiseSes();
            if (!this.sesClient) {
                throw new Error(
                    'Failed to send email: SES client is not initialised.',
                );
            }
        }

        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const crlf = '\r\n';
        const wrapBase64 = (b64: string) =>
            b64.replace(/(.{76})/g, `$1${crlf}`).trimEnd();

        const htmlBase64 = wrapBase64(
            Buffer.from(html, 'utf-8').toString('base64'),
        );
        const imageBase64 = wrapBase64(inlineImage.contentBase64);

        const raw =
            `From: ${from}${crlf}` +
            `To: ${to}${crlf}` +
            `Subject: ${subject}${crlf}` +
            `MIME-Version: 1.0${crlf}` +
            `Content-Type: multipart/related; boundary="${boundary}"${crlf}${crlf}` +
            `--${boundary}${crlf}` +
            `Content-Type: text/html; charset=UTF-8${crlf}` +
            `Content-Transfer-Encoding: base64${crlf}${crlf}` +
            `${htmlBase64}${crlf}` +
            `--${boundary}${crlf}` +
            `Content-Type: ${inlineImage.contentType}${crlf}` +
            `Content-Transfer-Encoding: base64${crlf}` +
            `Content-Disposition: inline; filename="qrcode.png"${crlf}` +
            `Content-ID: <${inlineImage.contentId}>${crlf}${crlf}` +
            `${imageBase64}${crlf}` +
            `--${boundary}--${crlf}`;

        const command = new SendRawEmailCommand({
            RawMessage: { Data: Buffer.from(raw, 'utf-8') },
        });
        await this.sesClient.send(command);
        logger.info(`Raw email (with inline image) sent to ${to}`);
    }

    generateVerificationToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}

export const mailClient = SESMailClient.getInstance();
