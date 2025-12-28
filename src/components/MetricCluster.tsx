import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface MetricSignal {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
    sparkline?: number[];
    context: string; // "What does this help me worry about?"
}

interface MetricClusterProps {
    title: string;
    description: string;
    signals: MetricSignal[];
}

function Sparkline({ data }: { data: number[] }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="opacity-60">
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TrendIndicator({ trend, value }: { trend: 'up' | 'down' | 'stable'; value: string }) {
    const config = {
        up: { icon: TrendingUp, color: 'text-risk-high', bg: 'bg-risk-high/10' },
        down: { icon: TrendingDown, color: 'text-health-good', bg: 'bg-health-good/10' },
        stable: { icon: Minus, color: 'text-muted', bg: 'bg-white/5' },
    };

    const { icon: Icon, color, bg } = config[trend];

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${bg}`}>
            <Icon size={12} className={color} />
            <span className={`text-[10px] font-bold ${color}`}>{value}</span>
        </div>
    );
}

export default function MetricCluster({ title, description, signals }: MetricClusterProps) {
    return (
        <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{description}</p>
            </div>

            <div className="space-y-4">
                {signals.map((signal, i) => (
                    <motion.div
                        key={signal.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-border/30 hover:border-border transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Left: Label & Trend */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-white">{signal.label}</span>
                                    <TrendIndicator trend={signal.trend} value={signal.trendValue} />
                                </div>

                                {/* Sparkline (Trend-First) */}
                                {signal.sparkline && (
                                    <div className="text-risk-low">
                                        <Sparkline data={signal.sparkline} />
                                    </div>
                                )}
                            </div>

                            {/* Right: Value (Subordinate) */}
                            <div className="text-right">
                                <span className="text-2xl font-mono font-bold text-white/60">{signal.value}</span>
                            </div>
                        </div>

                        {/* Context Framing */}
                        <div className="mt-3 pt-3 border-t border-border/20 flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info size={12} className="text-muted mt-0.5 shrink-0" />
                            <p className="text-[10px] text-muted italic leading-relaxed">{signal.context}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
