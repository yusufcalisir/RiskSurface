import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    AlertCircle,
    Loader2,
    Zap,
    Wind,
    ArrowUpRight,
    Search
} from 'lucide-react';

import { API_BASE } from '../config';

interface TemporalHotspot {
    path: string;
    commitCount: number;
    frequencyBaseline: number;
    shortestIntervalHr: number;
    meanIntervalHr: number;
    severityScore: number;
    classification: 'burst' | 'drift';
    timestamps: string[];
}

interface TemporalAnalysis {
    available: boolean;
    reason?: string;
    baselineFound: boolean;
    medianFrequency: number;
    temporalHotspots: TemporalHotspot[];
    windowDays: number;
}

interface Props {
    projectId: string;
}

export default function RealTemporal({ projectId }: Props) {
    const [data, setData] = useState<TemporalAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchTemporal();
    }, [projectId]);

    const fetchTemporal = async () => {
        // Reset state to prevent stale data
        setData(null);
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/projects/selected`);
            const json = await res.json();

            // CRITICAL: Validate project context matches expected
            const returnedFullName = json.project?.fullName;
            if (returnedFullName && returnedFullName !== projectId) {
                console.warn(`[RealTemporal] Project mismatch: expected ${projectId}, got ${returnedFullName}. Retrying...`);
                setTimeout(() => fetchTemporal(), 300);
                return;
            }

            if (json.selected && json.analysis?.temporal) {
                setData(json.analysis.temporal);
            } else {
                setError('No temporal analysis data available');
            }
        } catch (err) {
            setError('Failed to fetch temporal analysis');
        }
        setLoading(false);
    };

    if (loading) return <LoadingState />;
    if (error || !data || !data.available) {
        return <UnavailableState reason={error || data?.reason} />;
    }

    const filteredHotspots = data.temporalHotspots.filter(h =>
        (h.path || '').toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Clock className="text-risk-medium" size={20} />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">Stability Analysis</h2>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Temporal Hotspots</h1>
                    <p className="text-white/40 mt-1 font-medium">Tracking instability and change compression across time</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/40 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Filter hotspots..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all w-64"
                    />
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Repository Baseline</div>
                    <div className="text-4xl font-black text-white">{data.medianFrequency.toFixed(2)}</div>
                    <div className="text-xs text-white/40 mt-1 font-medium">Median changes per file in window</div>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-risk-medium/5">
                    <div className="text-[10px] uppercase font-bold text-risk-medium tracking-widest mb-1">Unstable Modules</div>
                    <div className="text-4xl font-black text-white">{data.temporalHotspots.length}</div>
                    <div className="text-xs text-white/40 mt-1 font-medium">Files exceeding baseline instability</div>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Analysis Window</div>
                    <div className="text-4xl font-black text-white">{data.windowDays} Days</div>
                    <div className="text-xs text-white/40 mt-1 font-medium">Rolling temporal scan depth</div>
                </div>
            </div>

            {/* Hotspots Grid */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {filteredHotspots.map((hotspot, i) => (
                        <motion.div
                            key={hotspot.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-panel rounded-2xl border border-white/10 hover:bg-white/5 transition-all overflow-hidden group"
                        >
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${hotspot.classification === 'burst' ? 'bg-risk-high/10' : 'bg-risk-medium/10'}`}>
                                        {hotspot.classification === 'burst' ? (
                                            <Zap className="text-risk-high" size={24} />
                                        ) : (
                                            <Wind className="text-risk-medium" size={24} />
                                        )}
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
                                            {hotspot.severityScore.toFixed(0)}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-white font-mono truncate">{hotspot.path}</h3>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest ${hotspot.classification === 'burst' ? 'bg-risk-high/20 text-risk-high' : 'bg-risk-medium/20 text-risk-medium'}`}>
                                                {hotspot.classification}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-medium">
                                            <span className="text-white/40">Baseline Multiplier: <span className="text-white/60">{(hotspot.commitCount / data.medianFrequency).toFixed(1)}x</span></span>
                                            <span className="text-white/40">MTBC: <span className="text-white/60">{hotspot.meanIntervalHr.toFixed(1)}h</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 text-right">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Shortest Interval</div>
                                        <div className="text-xl font-black text-white">{hotspot.shortestIntervalHr < 1 ? 'Sub-hour' : `${hotspot.shortestIntervalHr.toFixed(1)}h`}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Total Changes</div>
                                        <div className="text-xl font-black text-white">{hotspot.commitCount}</div>
                                    </div>
                                    <ArrowUpRight className="text-white/10 group-hover:text-white/30 transition-colors" size={20} />
                                </div>
                            </div>

                            {/* Timeline Visual - Simplified */}
                            <div className="px-6 pb-6 mt-2 flex items-center gap-1 overflow-x-hidden opacity-30 group-hover:opacity-60 transition-opacity">
                                {[...Array(20)].map((_, ti) => (
                                    <div
                                        key={ti}
                                        className={`h-4 w-1.5 rounded-full ${ti % 4 === 0 ? (hotspot.classification === 'burst' ? 'bg-risk-high' : 'bg-risk-medium') : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-risk-high/10 flex items-center justify-center">
                        <Zap className="text-risk-high" size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-white text-left">Burst Hotspot</div>
                        <div className="text-[10px] text-white/40 text-left">High-frequency changes in short span</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-risk-medium/10 flex items-center justify-center">
                        <Wind className="text-risk-medium" size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-white text-left">Drift Hotspot</div>
                        <div className="text-[10px] text-white/40 text-left">Repeated, sustained changes</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] gap-6">
            <Loader2 className="text-risk-medium animate-spin" size={40} />
            <div className="text-center">
                <div className="text-white font-black uppercase tracking-widest text-sm mb-1">Extracting Timestamps</div>
                <div className="text-white/20 text-[10px] uppercase font-bold">Computing Change Density</div>
            </div>
        </div>
    );
}

function UnavailableState({ reason }: { reason?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] gap-6 px-12">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <AlertCircle size={40} className="text-white/10" />
            </div>
            <div className="text-center max-w-sm">
                <h3 className="text-xl font-bold text-white mb-2">Temporal Analysis Unavailable</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                    {reason || 'Insufficient commit time-series data to detect temporal hotspots.'}
                </p>
            </div>
        </div>
    );
}
