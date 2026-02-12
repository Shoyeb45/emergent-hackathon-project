import {
    SESClient,
    SendEmailCommand,
    SendEmailCommandInput,
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

    generateVerificationToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}

export const mailClient = SESMailClient.getInstance();
