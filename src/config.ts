/**
 * Application Configuration
 */

// Use environment variable for API base or fallback to localhost
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Warn in production if using localhost fallback
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE) {
    console.warn(
        '[Config] VITE_API_BASE is not set! API requests will fail. ' +
        'Set this environment variable in your deployment platform.'
    );
}
