import React from 'react';
import { motion } from 'framer-motion';

const domainData = [
    { name: 'Core Entity Layer', impact: 'System-Wide', fragility: 88, trend: 'Accelerating', exposure: 'Critical' },
    { name: 'Identity Management', impact: 'External/High', fragility: 72, trend: 'Stabilizing', exposure: 'High' },
    { name: 'Payment Processing', impact: 'Transactional', fragility: 42, trend: 'Improving', exposure: 'Moderate' },
    { name: 'Data Ingestion Pipe', impact: 'Downstream', fragility: 65, trend: 'Stagnant', exposure: 'High' },
    { name: 'Audit & Compliance', impact: 'Legal/Reporting', fragility: 25, trend: 'Improving', exposure: 'Low' },
];

export default function ImpactSurface() {
    return (
        <div className="space-y-8">
            <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-white mb-2">Impact & Exposure Surface</h2>
                <p className="text-muted text-sm leading-relaxed">
                    Concentration of fragility mapped against structural impact. This view is designed to identify where technical risk has the highest potential for cascading system failure.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {domainData.map((domain, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={domain.name}
                        className="group glass-panel rounded-2xl p-8 flex items-center justify-between border-l-4 border-l-transparent hover:border-l-risk-high transition-all"
                    >
                        <div className="flex-1 space-y-1">
                            <h3 className="text-xl font-bold text-white group-hover:text-risk-high transition-colors">{domain.name}</h3>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">{domain.impact} Scope</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-right">
                            <div>
                                <p className="text-[10px] text-muted uppercase font-bold mb-1">Fragility</p>
                                <p className={`text-2xl font-mono font-bold ${domain.fragility > 70 ? 'text-risk-crit' : 'text-white'}`}>{domain.fragility}%</p>
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-[10px] text-muted uppercase font-bold mb-1">Impact Trend</p>
                                <p className="text-sm font-bold text-white">{domain.trend}</p>
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-[10px] text-muted uppercase font-bold mb-1">Domain Exposure</p>
                                <p className={`text-[10px] font-black px-2 py-1 rounded inline-block ${domain.exposure === 'Critical' ? 'bg-risk-crit text-white' : 'bg-white/10 text-muted'
                                    }`}>
                                    {domain.exposure}
                                </p>
                            </div>
                            <div className="flex items-center justify-end">
                                <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${domain.fragility > 70 ? 'bg-risk-crit' : domain.fragility > 40 ? 'bg-risk-high' : 'bg-health-good'}`}
                                        style={{ width: `${domain.fragility}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-border/50 text-center">
                <p className="text-xs text-muted leading-loose max-w-lg mx-auto italic">
                    "The Core Entity Layer remains the primary bottleneck for system-wide stability. Until the decoupling of the UserDB entity is complete, risk in this domain is considered Inherited and non-local."
                </p>
            </div>
        </div>
    );
}
