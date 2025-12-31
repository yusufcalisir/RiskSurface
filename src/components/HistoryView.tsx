import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface CommitDataPoint {
    date: string;
    commits: number;
    fragility?: number;
}

interface Props {
    commitHistory?: CommitDataPoint[];
    annotations?: { date: string; text: string }[];
    isLoading?: boolean;
}

// Compute velocity acceleration from commit history
function computeVelocityAcceleration(data: CommitDataPoint[]) {
    if (data.length < 3) return null;

    // Calculate rolling velocity (commits per window)
    const windowSize = Math.max(2, Math.floor(data.length / 3));

    // Current window velocity (last N points)
    const currentWindow = data.slice(-windowSize);
    const currentVelocity = currentWindow.reduce((sum, d) => sum + d.commits, 0) / windowSize;

    // Previous window velocity
    const prevWindow = data.slice(-windowSize * 2, -windowSize);
    if (prevWindow.length === 0) return null;
    const prevVelocity = prevWindow.reduce((sum, d) => sum + d.commits, 0) / prevWindow.length;

    // Acceleration = current / previous
    if (prevVelocity === 0) return null;
    const acceleration = currentVelocity / prevVelocity;

    return {
        value: Math.round(acceleration * 10) / 10,
        currentVelocity: Math.round(currentVelocity * 10) / 10,
        prevVelocity: Math.round(prevVelocity * 10) / 10,
        trend: acceleration > 1 ? 'accelerating' : acceleration < 1 ? 'decelerating' : 'stable'
    };
}

// Compute fragility trajectory from commit data
function computeFragilityTrajectory(data: CommitDataPoint[]) {
    if (data.length === 0) return [];

    // If fragility is already provided, use it
    if (data[0]?.fragility !== undefined) {
        return data.map(d => ({
            date: d.date,
            fragility: d.fragility || 0,
            commits: d.commits
        }));
    }

    // Otherwise compute fragility from commit velocity changes
    const maxCommits = Math.max(...data.map(d => d.commits));
    return data.map((d, i) => {
        // Fragility increases with high commit velocity (indicates churn)
        const velocityFactor = maxCommits > 0 ? (d.commits / maxCommits) * 50 : 0;
        // Add some baseline fragility that grows over time
        const timeFactor = (i / data.length) * 30;
        return {
            date: d.date,
            fragility: Math.round(velocityFactor + timeFactor + 20),
            commits: d.commits
        };
    });
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black text-muted uppercase mb-3 tracking-widest">{label}</p>
                <div className="space-y-3">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex flex-col">
                            <span className="text-[9px] text-muted font-bold uppercase">{entry.name}</span>
                            <span className="text-xl font-mono font-bold text-white">
                                {entry.value}{entry.name === 'Fragility Index' ? '%' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function HistoryView({ commitHistory = [], annotations = [], isLoading = false }: Props) {
    const trajectoryData = useMemo(() => computeFragilityTrajectory(commitHistory), [commitHistory]);
    const acceleration = useMemo(() => computeVelocityAcceleration(commitHistory), [commitHistory]);

    const hasData = commitHistory.length >= 3;

    return (
        <div className="space-y-12">
            <div className="max-w-3xl space-y-4">
                <h2 className="text-3xl font-bold text-white leading-tight">Risk Trajectory</h2>
                <p className="text-muted text-lg leading-relaxed">
                    The longitudinal progression of system fragility. This view captures the <span className="text-white font-bold italic">rate of change</span> - which is a more reliable predictor of failure than absolute debt values.
                </p>
            </div>

            <div className="glass-panel p-10 rounded-[2.5rem] h-[550px] flex flex-col relative overflow-hidden">
                {/* Background Grids */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Computing trajectory...</p>
                        </div>
                    </div>
                ) : !hasData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <AlertTriangle size={24} className="text-white/20 mx-auto" />
                            <p className="text-xs font-bold text-white/40">Insufficient commit history</p>
                            <p className="text-[10px] text-white/30 max-w-xs">
                                At least 3 data points are required to compute velocity acceleration.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trajectoryData}>
                                    <defs>
                                        <linearGradient id="colorFrag" x1="0" y1="0" x2="0" y2="100%">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={15}
                                        fontWeight="black"
                                    />
                                    <YAxis
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        name="Fragility Index"
                                        type="monotone"
                                        dataKey="fragility"
                                        stroke="#ef4444"
                                        fillOpacity={1}
                                        fill="url(#colorFrag)"
                                        strokeWidth={4}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Temporal Annotations */}
                        {annotations.length > 0 && (
                            <div className="mt-8 space-y-4 relative z-10">
                                {annotations.map((a, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-risk-high shadow-[0_0_8px_#f97316]" />
                                        <span className="text-[10px] font-mono text-muted uppercase font-bold">{a.date}</span>
                                        <span className="text-xs text-white/80">{a.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl border border-border bg-surface/30 space-y-4">
                    <h4 className="text-sm font-black uppercase text-muted tracking-widest">Velocity Context</h4>
                    {acceleration ? (
                        <>
                            <p className="text-2xl font-bold text-white">Acceleration: {acceleration.value}x</p>
                            <p className="text-xs text-muted leading-relaxed">
                                {acceleration.trend === 'accelerating'
                                    ? `Commit velocity is ${acceleration.value}x higher than the previous period. This indicates increasing development intensity.`
                                    : acceleration.trend === 'decelerating'
                                        ? `Commit velocity has slowed to ${acceleration.value}x of the previous period. Development pace is decreasing.`
                                        : 'Commit velocity is stable compared to the previous period.'
                                }
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-white/40">Velocity unavailable</p>
                            <p className="text-xs text-muted leading-relaxed">
                                Insufficient commit history to compute velocity acceleration. At least 3 time periods are required.
                            </p>
                        </>
                    )}
                </div>
                <div className="p-8 rounded-3xl border border-border bg-surface/30 space-y-4">
                    <h4 className="text-sm font-black uppercase text-muted tracking-widest">Data Summary</h4>
                    <p className="text-2xl font-bold text-white">{commitHistory.length} data points</p>
                    <p className="text-xs text-muted leading-relaxed">
                        {hasData
                            ? `Analyzed ${commitHistory.reduce((sum, d) => sum + d.commits, 0)} total commits across ${commitHistory.length} time periods.`
                            : 'No commit data available for trajectory analysis.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
