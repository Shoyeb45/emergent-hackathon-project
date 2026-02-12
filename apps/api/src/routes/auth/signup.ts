import { Router } from 'express';
import { validator } from '../../middlewares/validator.middleware';
import schema from './schema';
import { asyncHandler } from '../../core/async-handler';
import UserRepo from '../../database/repositories/user.repo';
import { BadRequestError } from '../../core/api-error';
import crypto from 'crypto';
import { createTokens } from '../../core/auth-utils';
import { getUserData } from './../../core/utils';
import { SuccessCreatedResponse } from '../../core/api-response';
import { ValidationSource } from '../../helpers/validator';
import bcryptjs from 'bcryptjs';
// import { RoleCode } from '@prisma/client';
import { setCookies } from '../../core/cookie-utils';
import { registry } from '../../docs/swagger';

registry.registerPath({
    method: 'post',
    path: '/auth/signup',
    summary: 'User Signup',
    description:
        'Register a new user. Returns user data and tokens. Requires API key.',
    tags: ['Auth'],
    security: [],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schema.signup,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created successfully',
        },
        400: {
            description: 'Validation error or user already registered',
        },
        403: {
            description: 'Missing or invalid API key',
        },
    },
});

const router = Router();

router.post(
    '/',
    validator(schema.signup, ValidationSource.BODY),
    asyncHandler(async (req, res) => {
        const user = await UserRepo.findByEmail(req.body.email);
        if (user) throw new BadRequestError('User already registered.');

        // Hash password
        const hashedPassword = await bcryptjs.hash(req.body.password, 12);

        const accessTokenKey = crypto.randomBytes(64).toString('hex');
        const refreshTokenKey = crypto.randomBytes(64).toString('hex');

        const { user: createdUser, keystore } = await UserRepo.create(
            {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                phone: req.body.phone,
            },
            accessTokenKey,
            refreshTokenKey,
        );

        const tokens = await createTokens(
            createdUser,
            keystore.primaryKey,
            keystore.secondaryKey,
        );

        const userData = getUserData(createdUser);

        // Set cookie for browser
        setCookies(res, tokens);

        new SuccessCreatedResponse('Signup successful.', {
            user: userData,
            tokens: tokens,
        }).send(res);
    }),
);

export default router;
