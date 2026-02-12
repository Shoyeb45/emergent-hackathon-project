import crypto from 'crypto';

/**
 * Stub: API key is optional and validated via env API_KEY in middleware.
 * No api_keys table in current schema.
 */
export async function createApiKey(
    _comments: string[],
    _permissions: string[],
) {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('Generated API key (set API_KEY in env to enforce):', key);
    return key;
}
