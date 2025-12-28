import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type SignalState = 'complete' | 'pending' | 'stale' | 'failed';

interface SignalBadgeProps {
    state: SignalState;
    label?: string;
    timestamp?: string;
}

const stateConfig = {
    complete: {
        icon: CheckCircle,
        bg: 'bg-health-good/10',
        text: 'text-health-good',
        border: 'border-health-good/20',
        label: 'Signal Complete',
    },
    pending: {
        icon: Loader2,
        bg: 'bg-risk-low/10',
        text: 'text-risk-low',
        border: 'border-risk-low/20',
        label: 'Awaiting Signal...',
    },
    stale: {
        icon: Clock,
        bg: 'bg-risk-med/10',
        text: 'text-risk-med',
        border: 'border-risk-med/20',
        label: 'Stale Data',
    },
    failed: {
        icon: AlertCircle,
        bg: 'bg-risk-crit/10',
        text: 'text-risk-crit',
        border: 'border-risk-crit/20',
        label: 'Signal Failed',
    },
};

export default function SignalBadge({ state, label, timestamp }: SignalBadgeProps) {
    const config = stateConfig[state];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${config.bg} ${config.border}`}>
            <Icon
                size={12}
                className={`${config.text} ${state === 'pending' ? 'animate-spin' : ''}`}
            />
            <span className={`text-[9px] font-black uppercase tracking-widest ${config.text}`}>
                {label || config.label}
            </span>
            {timestamp && (
                <span className="text-[8px] text-muted font-mono">
                    {timestamp}
                </span>
            )}
        </div>
    );
}

// Analysis Status for sidebar/header
interface AnalysisStatusProps {
    lastRun: string;
    state: 'idle' | 'pending' | 'running' | 'partial';
    signalsReceived?: number;
    signalsTotal?: number;
}

export function AnalysisStatus({ lastRun, state, signalsReceived = 0, signalsTotal = 0 }: AnalysisStatusProps) {
    return (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest">Analysis Engine</span>
                {state === 'running' && (
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-risk-low"
                    />
                )}
                {state === 'idle' && <div className="w-2 h-2 rounded-full bg-health-good" />}
                {state === 'partial' && <div className="w-2 h-2 rounded-full bg-risk-med" />}
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted">Last Complete Run</span>
                    <span className="text-[10px] font-bold text-white">{lastRun}</span>
                </div>

                {state === 'running' && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted">Signals Received</span>
                            <span className="text-[10px] font-bold text-risk-low">{signalsReceived} / {signalsTotal}</span>
                        </div>
                        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(signalsReceived / signalsTotal) * 100}%` }}
                                className="h-full bg-risk-low"
                            />
                        </div>
                    </div>
                )}

                {state === 'partial' && (
                    <div className="flex items-center gap-2 mt-2">
                        <AlertCircle size={12} className="text-risk-med" />
                        <span className="text-[9px] text-risk-med font-bold">Partial results available</span>
                    </div>
                )}
            </div>
        </div>
    );
}
