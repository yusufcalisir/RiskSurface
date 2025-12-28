import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const trajectoryData = [
    { date: 'SEP', fragility: 42, acceleration: 1.2 },
    { date: 'OCT', fragility: 48, acceleration: 1.5 },
    { date: 'NOV', fragility: 62, acceleration: 2.1 },
    { date: 'DEC', fragility: 78, acceleration: 2.8 },
    { date: 'JAN', fragility: 92, acceleration: 3.4 },
];

const annotations = [
    { date: 'NOV', text: 'Q3 Feature Freeze - Technical Debt Accrual' },
    { date: 'JAN', text: 'Legacy DB Migration - Peak Complexity' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-border p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] font-black text-muted uppercase mb-3 tracking-widest">{label} 2025</p>
                <div className="space-y-3">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex flex-col">
                            <span className="text-[9px] text-muted font-bold uppercase">{entry.name}</span>
                            <span className="text-xl font-mono font-bold text-white">
                                {entry.value}{entry.name === 'Fragility Index' ? '%' : 'x'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function HistoryView() {
    return (
        <div className="space-y-12">
            <div className="max-w-3xl space-y-4">
                <h2 className="text-3xl font-bold text-white leading-tight">Risk Trajectory</h2>
                <p className="text-muted text-lg leading-relaxed">
                    The longitudinal progression of system fragility. This view captures the <span className="text-white font-bold italic">rate of change</span>—which is a more reliable predictor of failure than absolute debt values.
                </p>
            </div>

            <div className="glass-panel p-10 rounded-[2.5rem] h-[550px] flex flex-col relative overflow-hidden">
                {/* Background Grids */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

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
                <div className="mt-8 space-y-4 relative z-10">
                    {annotations.map((a, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-risk-high shadow-[0_0_8px_#f97316]" />
                            <span className="text-[10px] font-mono text-muted uppercase font-bold">{a.date}</span>
                            <span className="text-xs text-white/80">{a.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl border border-border bg-surface/30 space-y-4">
                    <h4 className="text-sm font-black uppercase text-muted tracking-widest">Velocity Context</h4>
                    <p className="text-2xl font-bold text-white">Acceleration: 2.8x</p>
                    <p className="text-xs text-muted leading-relaxed">
                        System complexity is growing twice as fast as deployment velocity. This implies a "Fragility Debt" that will manifest as increasing MTTR (Mean Time To Repair) in upcoming cycles.
                    </p>
                </div>
                <div className="p-8 rounded-3xl border border-border bg-surface/30 space-y-4">
                    <h4 className="text-sm font-black uppercase text-muted tracking-widest">Predictive Alert</h4>
                    <p className="text-2xl font-bold text-risk-crit">Critical Threshold: Mar 2026</p>
                    <p className="text-xs text-muted leading-relaxed">
                        At current trajectories, the "Identity Service" will reach a critical maintenance threshold by late Q1. Refactoring is advised before the next major release.
                    </p>
                </div>
            </div>
        </div>
    );
}
