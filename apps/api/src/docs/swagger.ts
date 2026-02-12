import { z } from 'zod';
import {
    extendZodWithOpenApi,
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { serverUrl } from '../config.js';

// Required: add .openapi() to Zod schemas before using registry.register()
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
        'JWT access token. Required for signout and token refresh. Use the Authorize button above to set it.',
});

export function generateOpenAPIDocument() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    const doc = generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: 'Wedding Management Platform API',
            version: '1.0.0',
        },
        servers: [
            {
                url: serverUrl,
                description: 'API server',
            },
        ],
        tags: [
            {
                name: 'Health',
                description: 'Health check. No authentication required.',
            },
            {
                name: 'Auth',
                description:
                    'Authentication: signup, signin, signout, token refresh, me.',
            },
            { name: 'Weddings', description: 'Wedding CRUD and hosted list.' },
            {
                name: 'Events',
                description: 'Wedding events (create, list, update, delete).',
            },
            { name: 'Guests', description: 'Guest list and add guests.' },
            {
                name: 'Invite',
                description: 'Get invitation by token (public).',
            },
            { name: 'RSVP', description: 'Submit RSVP by token (public).' },
            {
                name: 'Photos',
                description: 'Gallery, upload, my-photos, face-sample.',
            },
        ],
        security: [],
    });

    return doc;
}
