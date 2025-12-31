import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    failedMetrics?: string[];
    onRetryAll?: () => void;
}

export default function PartialAnalysisBanner({ failedMetrics = [], onRetryAll }: Props) {
    if (failedMetrics.length === 0) return null;

    return (
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-[10px]">
            <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-yellow-500/50" />
                <span className="text-yellow-500/70 font-medium">
                    Partial analysis: {failedMetrics.length} metric{failedMetrics.length > 1 ? 's' : ''} unavailable
                </span>
            </div>
            {onRetryAll && (
                <button
                    onClick={onRetryAll}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-500/70 hover:text-yellow-500 hover:bg-yellow-500/20 transition-all font-bold uppercase tracking-wider"
                >
                    <RefreshCw size={10} />
                    Retry All
                </button>
            )}
        </div>
    );
}
