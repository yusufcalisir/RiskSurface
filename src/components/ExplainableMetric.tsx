import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, Database, Clock, Target } from 'lucide-react';

export interface MetricExplanation {
    dataSources: string[];      // commits, files, manifests
    commitRange?: string;       // e.g., "abc123..def456"
    measurement: string;        // What was measured
    significance: string;       // Why it matters
    limitations?: string;       // Known gaps
}

interface Props {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    explanation: MetricExplanation;
    className?: string;
}

export default function ExplainableMetric({ label, value, trend, explanation, className = '' }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`relative group ${className}`}>
            {/* Main Metric Display */}
            <div
                className="cursor-help"
                onClick={() => setIsExpanded(!isExpanded)}
                onMouseEnter={() => !('ontouchstart' in window) && setIsExpanded(true)}
                onMouseLeave={() => !('ontouchstart' in window) && setIsExpanded(false)}
            >
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        {label}
                    </span>
                    <Info size={10} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-2xl font-black text-white">
                    {value}
                </div>
            </div>

            {/* Explanation Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="absolute z-50 left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[200px]"
                    >
                        <div className="space-y-2 text-[10px]">
                            {/* Data Sources */}
                            <div className="flex items-start gap-2">
                                <Database size={10} className="text-purple-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-white/40 uppercase font-bold">Data: </span>
                                    <span className="text-white/70">{explanation.dataSources.join(', ')}</span>
                                </div>
                            </div>

                            {/* Commit Range */}
                            {explanation.commitRange && (
                                <div className="flex items-start gap-2">
                                    <Clock size={10} className="text-blue-400 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="text-white/40 uppercase font-bold">Range: </span>
                                        <span className="text-white/70 font-mono text-[8px]">{explanation.commitRange}</span>
                                    </div>
                                </div>
                            )}

                            {/* Measurement */}
                            <div className="flex items-start gap-2">
                                <Target size={10} className="text-green-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-white/40 uppercase font-bold">Measured: </span>
                                    <span className="text-white/70">{explanation.measurement}</span>
                                </div>
                            </div>

                            {/* Significance */}
                            <div className="pt-2 border-t border-white/10 text-white/50 leading-relaxed">
                                {explanation.significance}
                            </div>

                            {/* Limitations */}
                            {explanation.limitations && (
                                <div className="text-yellow-400/60 italic">
                                    ⚠ {explanation.limitations}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
