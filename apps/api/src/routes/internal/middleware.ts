import { RequestHandler } from 'express';
import { ForbiddenError } from '../../core/api-error';

export const verifyInternalRequest: RequestHandler = (req, _res, next) => {
    const secret = req.headers['x-internal-secret'];
    if (secret !== process.env.INTERNAL_SECRET) {
        return next(new ForbiddenError('Forbidden'));
    }
    next();
};
