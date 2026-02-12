import { RequestHandler } from 'express';
import { ProtectedRequest } from '../types/app-requests';
import { ForbiddenError } from '../core/api-error';

/**
 * Optional role-based authorize. Current schema has no roles; allows all authenticated users.
 */
export const authorize = (..._allowedRoles: string[]): RequestHandler => {
    return (req, _res, next) => {
        try {
            const protectedReq = req as ProtectedRequest;
            if (!protectedReq.user) {
                throw new ForbiddenError('Authentication required');
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
