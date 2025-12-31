import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    label?: string;
    reason?: string;
    className?: string;
}

/**
 * Inline component for displaying when a metric is unavailable
 * Used to replace hardcoded values with honest "unavailable" states
 */
export default function MetricUnavailableInline({ label, reason, className = '' }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-white/30 ${className}`}>
            <AlertCircle size={12} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
                {label || 'Unavailable'}
            </span>
            {reason && (
                <span className="text-[9px] text-white/20">({reason})</span>
            )}
        </span>
    );
}
