import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    reason?: string;
    onRetry?: () => void;
    size?: 'sm' | 'md';
}

export default function MetricUnavailable({ reason, onRetry, size = 'md' }: Props) {
    const isSm = size === 'sm';

    return (
        <div className={`flex flex-col items-center justify-center ${isSm ? 'py-2 gap-1' : 'py-4 gap-2'} text-center`}>
            <AlertCircle
                size={isSm ? 14 : 18}
                className="text-white/20"
            />
            <span className={`${isSm ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-wider text-white/30`}>
                {reason || 'Insufficient data'}
            </span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className={`flex items-center gap-1 ${isSm ? 'px-2 py-0.5 text-[7px]' : 'px-3 py-1 text-[9px]'} rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all font-bold uppercase tracking-wider`}
                >
                    <RefreshCw size={isSm ? 8 : 10} />
                    Retry
                </button>
            )}
        </div>
    );
}
