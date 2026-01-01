import React from 'react';
import { motion } from 'framer-motion';
import { Shield, GitBranch, Terminal } from 'lucide-react';


interface Props {
    title: string;
    projectId: string;
    className?: string;
    isAnalysisReady?: boolean;
    analysisContext?: {
        commitCount?: number;
        lastComputedAt?: string;
        commitRange?: string;
    };
}

export default function ProjectContextHeader({ title, projectId, className, isAnalysisReady = true, analysisContext }: Props) {
    const [owner, repo] = projectId.split('/');

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "glass-panel rounded-2xl p-3 md:p-6 border border-white/5 mb-6 overflow-hidden relative",
                className
            )}
        >
            {/* Background Decorative Element */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

            <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                            src="/ra-logo.png"
                            alt="RepoAnalyst"
                            className="w-5 h-5 md:w-6 md:h-6 object-contain invert opacity-80"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                            <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-white/30 truncate max-w-[120px] md:max-w-none">
                                {owner}
                            </span>
                            <span className="text-[9px] md:text-xs text-white/10">/</span>
                            <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-white truncate max-w-[150px] md:max-w-none">
                                {repo}
                            </span>
                        </div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none break-words">
                            {title}
                        </h1>
                        {/* Analysis Context Metadata */}
                        {analysisContext && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[8px] md:text-[9px] font-medium uppercase tracking-wider text-white/30">
                                {analysisContext.commitCount && (
                                    <span>Analyzed from {analysisContext.commitCount} commits</span>
                                )}
                                {analysisContext.lastComputedAt && (
                                    <span className="hidden sm:inline">• Last computed: {analysisContext.lastComputedAt}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden xs:flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <Shield size={10} className="text-health-good md:w-3 md:h-3" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">Secure Analysis</span>
                    </div>
                    {isAnalysisReady && (
                        <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-health-good/10 border border-health-good/20">
                            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-health-good animate-pulse" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-health-good">Live</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Simple cn fallback if not available
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
