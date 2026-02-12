import { Response, NextFunction, Request } from 'express';

/**
 * Optional permission check. Current schema has no ApiKey/Permission; always allow.
 */
export default (_permission: string) =>
    (_req: Request, _res: Response, next: NextFunction) => {
        next();
    };
