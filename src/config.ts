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

// ==================== UNIFIED FETCH CONTRACT ====================

export const FETCH_CONFIG = {
    timeout: 30000,      // 30 seconds max execution window
    retryLimit: 2,       // Max 2 retries
    backoffMs: 1000,     // 1 second backoff between retries
    headers: {
        'Content-Type': 'application/json',
    },
} as const;

// ==================== EXPLICIT FETCH STATES ====================

export type FetchState = 'idle' | 'loading' | 'success' | 'error';

export interface FetchResult<T> {
    state: FetchState;
    data: T | null;
    error: string | null;
    timestamp: number;
}

// ==================== SECTION ISOLATION ====================

export const SECTION_ENDPOINTS = {
    analysis: '/api/analyze',
    topology: '/api/topology',
    trajectory: '/api/trajectory',
    impact: '/api/impact',
    dependencies: '/api/dependencies',
    concentration: '/api/concentration',
    temporal: '/api/temporal',
    predictions: '/api/predictions',
} as const;

// ==================== CACHING CONFIG ====================

export const CACHE_CONFIG = {
    maxAgeMs: 5 * 60 * 1000,  // 5 minutes cache TTL
    staleWhileRevalidate: true,
} as const;
