import React from 'react';
import { motion } from 'framer-motion';

const clusters = [
    { id: 1, name: 'Identity & Access', risk: 82, density: 'High', status: 'Fragile', domains: 12 },
    { id: 2, name: 'Ledger Operations', risk: 45, density: 'Medium', status: 'Stable', domains: 8 },
    { id: 3, name: 'Analytics Pipeline', risk: 94, density: 'Extreme', status: 'Degrading', domains: 15 },
    { id: 4, name: 'Frontend Gateway', risk: 61, density: 'Medium', status: 'Caution', domains: 5 },
    { id: 5, name: 'External Integrations', risk: 32, density: 'Low', status: 'Healthy', domains: 22 },
];

export default function RiskMap() {
    return (
        <div className="space-y-10">
            <div className="max-w-2xl space-y-2">
                <h2 className="text-3xl font-bold text-white">System Topology</h2>
                <p className="text-muted text-lg leading-relaxed">
                    Mapping high-density risk clusters across the system architecture. This is not a file tree; it is an interpretation of structural stability.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {clusters.map((c, i) => (
                    <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-10 rounded-[2rem] space-y-8 relative overflow-hidden group hover:border-border transition-all"
                    >
                        {/* Background Heat Wave */}
                        <div
                            className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"
                            style={{ background: c.risk > 80 ? '#ef4444' : c.risk > 60 ? '#f97316' : '#3b82f6' }}
                        />

                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-white">{c.name}</h3>
                                <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">{c.domains} Sub-Domains Tracked</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'Degrading' ? 'bg-risk-crit/20 text-risk-crit border border-risk-crit/30' :
                                    c.status === 'Fragile' ? 'bg-risk-high/20 text-risk-high border border-risk-high/30' : 'bg-health-good/10 text-health-good border border-health-good/20'
                                }`}>
                                {c.status}
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted font-medium">Regional Risk Index</span>
                                <span className="text-xs font-mono font-bold text-white">{c.risk}/100</span>
                            </div>
                            <div className="h-2 w-full bg-border/30 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${c.risk}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${c.risk > 80 ? 'bg-risk-crit' : c.risk > 60 ? 'bg-risk-high' : 'bg-health-good'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 relative z-10">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] text-muted uppercase font-bold mb-1">Entropy Density</p>
                                <p className="text-sm font-bold text-white">{c.density}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] text-muted uppercase font-bold mb-1">Cascading Debt</p>
                                <p className="text-sm font-bold text-white">{c.risk > 70 ? 'Active' : 'Neutral'}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
