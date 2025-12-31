/**
 * Resilient Fetch Utility
 * Implements unified fetch contract with timeout, retry, and backoff.
 */

import { FETCH_CONFIG, API_BASE, FetchState, FetchResult } from './config';

/**
 * Sleep utility for backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Resilient fetch with retry and backoff
 * Returns explicit FetchResult with state, data, error, timestamp
 */
export async function resilientFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<FetchResult<T>> {
    const url = `${API_BASE}${endpoint}`;
    const mergedOptions: RequestInit = {
        ...options,
        headers: {
            ...FETCH_CONFIG.headers,
            ...options.headers,
        },
    };

    let lastError: string | null = null;

    for (let attempt = 0; attempt <= FETCH_CONFIG.retryLimit; attempt++) {
        try {
            const response = await fetchWithTimeout(
                url,
                mergedOptions,
                FETCH_CONFIG.timeout
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                state: 'success' as FetchState,
                data: data as T,
                error: null,
                timestamp: Date.now(),
            };
        } catch (err) {
            lastError = err instanceof Error ? err.message : 'Unknown error';

            // Don't retry on abort (timeout)
            if (err instanceof DOMException && err.name === 'AbortError') {
                lastError = `Request timeout after ${FETCH_CONFIG.timeout}ms`;
                break;
            }

            // Backoff before retry
            if (attempt < FETCH_CONFIG.retryLimit) {
                await sleep(FETCH_CONFIG.backoffMs * (attempt + 1));
            }
        }
    }

    // All retries exhausted
    return {
        state: 'error' as FetchState,
        data: null,
        error: lastError || 'Request failed after retries',
        timestamp: Date.now(),
    };
}

/**
 * Create a section-scoped fetcher
 * Each section fetches independently and does not block others
 */
export function createSectionFetcher<T>(endpoint: string) {
    return async (
        params?: Record<string, string>
    ): Promise<FetchResult<T>> => {
        const queryString = params
            ? '?' + new URLSearchParams(params).toString()
            : '';
        return resilientFetch<T>(`${endpoint}${queryString}`);
    };
}
