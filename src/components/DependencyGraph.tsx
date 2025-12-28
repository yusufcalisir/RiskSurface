import React from 'react';
import { motion } from 'framer-motion';

const linkages = [
    { from: 'Public Gateway', to: 'Identity Root', risk: 'Caution', impact: 'Cascading' },
    { from: 'Identity Root', to: 'Auth Engine', risk: 'Critical', impact: 'Direct' },
    { from: 'Identity Root', to: 'Legacy User DB', risk: 'Extreme', impact: 'Structural' },
    { from: 'Service Mesh', to: 'Auth Engine', risk: 'Neutral', impact: 'Stable' },
];

const systemNodes = [
    { id: 'Public Gateway', x: 100, y: 250, type: 'entry', risk: 20 },
    { id: 'Identity Root', x: 300, y: 250, type: 'critical_path', risk: 85 },
    { id: 'Auth Engine', x: 500, y: 150, type: 'service', risk: 40 },
    { id: 'Legacy User DB', x: 500, y: 350, type: 'fragile_point', risk: 92 },
    { id: 'Service Mesh', x: 300, y: 100, type: 'infra', risk: 10 },
];

export default function DependencyGraph() {
    return (
        <div className="space-y-10 h-full flex flex-col">
            <div className="max-w-2xl space-y-2">
                <h2 className="text-3xl font-bold text-white">Architectural Risk</h2>
                <p className="text-muted text-lg leading-relaxed">
                    Visualizing structural dependencies that amplify fragility. The lines represent "Inherited Risk" rather than technical connections.
                </p>
            </div>

            <div className="flex-1 glass-panel rounded-[2.5rem] relative overflow-hidden bg-black/40 border-dashed min-h-[600px]">
                <svg className="w-full h-full" viewBox="0 0 700 500">
                    {/* Gradient Lines */}
                    {linkages.map((link, i) => {
                        const from = systemNodes.find(n => n.id === link.from);
                        const to = systemNodes.find(n => n.id === link.to);
                        if (!from || !to) return null;

                        return (
                            <motion.line
                                key={i}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.3 }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 1.5 }}
                                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                stroke={link.risk === 'Extreme' ? '#ef4444' : link.risk === 'Critical' ? '#f97316' : '#3b82f6'}
                                strokeWidth={link.risk === 'Extreme' ? 4 : 2}
                                strokeDasharray={link.risk === 'Neutral' ? '5,5' : 'none'}
                            />
                        );
                    })}

                    {/* Nodes */}
                    {systemNodes.map((n, i) => (
                        <motion.g
                            key={n.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="cursor-crosshair"
                        >
                            <circle
                                cx={n.x} cy={n.y} r={n.risk / 2 + 10}
                                className={`fill-surface border-2 ${n.risk > 80 ? 'stroke-risk-crit shadow-[0_0_20px_#ef4444]' : 'stroke-border'
                                    }`}
                                strokeWidth={2}
                            />
                            <text
                                x={n.x} y={n.y + 45}
                                textAnchor="middle"
                                className="fill-muted font-black text-[9px] uppercase tracking-[0.2em]"
                            >
                                {n.id}
                            </text>
                            {n.risk > 80 && (
                                <circle cx={n.x} cy={n.y} r={n.risk / 2 + 15} className="fill-none stroke-risk-crit/30" strokeWidth={1}>
                                    <animate attributeName="r" from={n.risk / 2 + 10} to={n.risk / 2 + 30} dur="3s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="1" to="0" dur="3s" repeatCount="indefinite" />
                                </circle>
                            )}
                        </motion.g>
                    ))}
                </svg>

                {/* Strategic Context Panel */}
                <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                    <div className="flex-1 p-6 rounded-2xl bg-surface/80 border border-border backdrop-blur-xl">
                        <h4 className="text-[10px] font-black uppercase text-risk-crit mb-2 tracking-widest">Identified Vulnerability</h4>
                        <p className="text-xs text-white font-bold leading-relaxed">
                            The "Identity Root" serves as a high-fragility junction. Any change here has a 92% cascading impact probability on the "Legacy User DB".
                        </p>
                    </div>
                    <div className="flex-1 p-6 rounded-2xl bg-surface/80 border border-border backdrop-blur-xl">
                        <h4 className="text-[10px] font-black uppercase text-health-good mb-2 tracking-widest">Isolated Trajectory</h4>
                        <p className="text-xs text-white font-bold leading-relaxed">
                            The "Service Mesh" layer remains structurally isolated from degradation in the core service layer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
