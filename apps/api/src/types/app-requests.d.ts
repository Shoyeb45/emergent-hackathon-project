import { Request } from 'express';
import { Keystore } from '@prisma/client';
import { AuthUser } from './user';

declare interface ProtectedRequest extends Request {
    user: AuthUser;
    accessToken: string;
    keystore: Keystore;
}

declare interface Tokens {
    accessToken: string;
    refreshToken: string;
}
