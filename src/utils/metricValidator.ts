/**
 * METRIC VALIDATION LAYER
 * 
 * Enforces anti-mock guarantees:
 * - Every value must have verifiable computational origin
 * - No static fallbacks that resemble analysis
 * - All computations must be repository-specific
 */

export interface MetricValidation {
    isValid: boolean;
    source: 'github_api' | 'commit_history' | 'dependency_manifest' | 'graph_derived' | 'unknown';
    reason?: string;
}

export interface ValidatedMetric<T> {
    value: T | null;
    validation: MetricValidation;
    renderValue: () => T | 'unavailable';
}

/**
 * Validates that a metric has a verifiable computational origin
 */
export function validateMetric<T>(
    value: T | null | undefined,
    source: MetricValidation['source'],
    minThreshold?: number
): ValidatedMetric<T> {
    // Check if value exists
    if (value === null || value === undefined) {
        return {
            value: null,
            validation: {
                isValid: false,
                source: 'unknown',
                reason: 'Value is null or undefined'
            },
            renderValue: () => 'unavailable' as any
        };
    }

    // For numeric values, check minimum threshold
    if (typeof value === 'number' && minThreshold !== undefined && value < minThreshold) {
        return {
            value: null,
            validation: {
                isValid: false,
                source,
                reason: `Value ${value} below minimum threshold ${minThreshold}`
            },
            renderValue: () => 'unavailable' as any
        };
    }

    // For arrays, check if empty
    if (Array.isArray(value) && value.length === 0) {
        return {
            value: null,
            validation: {
                isValid: false,
                source,
                reason: 'Empty array - insufficient data'
            },
            renderValue: () => 'unavailable' as any
        };
    }

    return {
        value,
        validation: {
            isValid: true,
            source
        },
        renderValue: () => value
    };
}

/**
 * Validates that required inputs exist before rendering a card
 */
export function validateCardInputs(inputs: Record<string, any>): {
    isReady: boolean;
    missingInputs: string[];
} {
    const missingInputs: string[] = [];

    for (const [key, value] of Object.entries(inputs)) {
        if (value === null || value === undefined) {
            missingInputs.push(key);
        } else if (Array.isArray(value) && value.length === 0) {
            missingInputs.push(`${key} (empty)`);
        }
    }

    return {
        isReady: missingInputs.length === 0,
        missingInputs
    };
}

/**
 * Generates repository-specific hash to ensure cross-repo consistency
 */
export function generateRepoHash(repoId: string, data: any): string {
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `${repoId}-${Math.abs(hash).toString(16)}`;
}

/**
 * Validates internal consistency between related metrics
 */
export function validateConsistency(checks: {
    label: string;
    condition: () => boolean;
}[]): { isConsistent: boolean; failures: string[] } {
    const failures: string[] = [];

    for (const check of checks) {
        try {
            if (!check.condition()) {
                failures.push(check.label);
            }
        } catch (e) {
            failures.push(`${check.label} (error)`);
        }
    }

    return {
        isConsistent: failures.length === 0,
        failures
    };
}

/**
 * FORBIDDEN VALUES - These should never appear in production
 * Used for development-time validation
 */
export const FORBIDDEN_STATIC_VALUES = [
    '92%', '88%', '2.8x', '78%', '65%',
    'Critical', 'High', 'Low', // unless computed from thresholds
    'Identity Root', 'Legacy User DB', // sample node names
];

/**
 * Development-only: Check if a string contains forbidden static values
 */
export function checkForForbiddenValues(text: string): {
    hasForbidden: boolean;
    matches: string[];
} {
    const matches: string[] = [];

    for (const forbidden of FORBIDDEN_STATIC_VALUES) {
        if (text.includes(forbidden)) {
            matches.push(forbidden);
        }
    }

    return {
        hasForbidden: matches.length > 0,
        matches
    };
}
