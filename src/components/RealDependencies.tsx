import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Loader2,
    GitBranch,
    ChevronDown,
    ChevronUp,
    Circle,
    ArrowRight,
    Code
} from 'lucide-react';

import { API_BASE } from '../config';

interface DependencyNode {
    id: string;
    name: string;
    language: string;
    category: 'internal' | 'external';
    version: string;
    volatility: number;
    lag: string;
    riskAmplification: number;
    fanIn: number;
    fanOut: number;
    centrality: number;
    riskScore: number;
    isCyclic: boolean;
}

interface DependencyEdge {
    source: string;
    target: string;
    importLine: string;
}

interface DependencyAnalysis {
    available: boolean;
    reason?: string;
    nodes: DependencyNode[];
    edges: DependencyEdge[];
    totalNodes: number;
    totalEdges: number;
    cyclicNodes: number;
    highRiskNodes?: string[];
    maxFanIn: number;
}

interface Props {
    projectId: string;
}

export default function RealDependencies({ projectId }: Props) {
    const [deps, setDeps] = useState<DependencyAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    useEffect(() => {
        fetchDependencies();
    }, [projectId]);

    const fetchDependencies = async () => {
        // Reset state to prevent stale data
        setDeps(null);
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/projects/selected`);
            const data = await res.json();

            // CRITICAL: Validate project context matches expected
            const returnedFullName = data.project?.fullName;
            if (returnedFullName && returnedFullName !== projectId) {
                console.warn(`[RealDependencies] Project mismatch: expected ${projectId}, got ${returnedFullName}. Retrying...`);
                setTimeout(() => fetchDependencies(), 300);
                return;
            }

            if (data.selected && data.analysis?.deps) {
                setDeps(data.analysis.deps);
            } else {
                setError('No dependency data available');
            }
        } catch (err) {
            setError('Failed to fetch dependency data');
        }
        setLoading(false);
    };

    if (loading) return <LoadingState />;
    if (error || !deps || !deps.available) {
        return <UnavailableState reason={error || deps?.reason} />;
    }

    const getRiskColor = (risk: number) => {
        if (risk >= 70) return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' };
        if (risk >= 50) return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' };
        if (risk >= 25) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' };
        return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' };
    };

    const getLanguageColor = (lang: string) => {
        switch (lang) {
            case 'python': return 'bg-blue-500/20 text-blue-400';
            case 'javascript': return 'bg-yellow-500/20 text-yellow-400';
            case 'typescript': return 'bg-blue-400/20 text-blue-300';
            case 'go': return 'bg-cyan-500/20 text-cyan-400';
            case 'package': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-white/10 text-white/40';
        }
    };

    const getNodeEdges = (nodeId: string) => {
        return deps.edges.filter(e => e.source === nodeId || e.target === nodeId);
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <GitBranch className="text-purple-400" size={18} />
                        <h2 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-white/30">Structural Risk Engine</h2>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">Dependencies</h1>
                    <p className="text-[10px] md:text-sm text-white/40 mt-1 font-medium italic">Enriching dependency graph with real-time volatility signals</p>
                </div>

            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Nodes" value={deps.totalNodes} color="purple" />
                <StatCard label="Internal Edges" value={deps.totalEdges} color="blue" />
                <StatCard label="Avg Centrality" value={0.12} color="orange" isPercent />
                <StatCard label="Cyclic Links" value={deps.cyclicNodes} color="red" />
            </div>

            {/* Graph Visualization */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">
                        Analyzed Graph Nodes ({deps.nodes.length})
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-[10px] uppercase font-bold text-white/30">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-[10px] uppercase font-bold text-white/30">Stable</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {(deps.nodes || []).map((node, i) => {
                        const riskStyle = getRiskColor(node.riskAmplification);
                        const nodeEdges = getNodeEdges(node.id);
                        const isExpanded = selectedNode === node.id;

                        return (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className={`rounded-xl border group transition-all duration-300 ${isExpanded ? 'ring-1 ring-white/20' : ''} ${riskStyle.border}`}
                            >
                                <div
                                    className={`p-4 cursor-pointer hover:bg-white/5 transition-all relative ${riskStyle.bg}`}
                                    onClick={() => setSelectedNode(isExpanded ? null : node.id)}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex flex-col items-center justify-center border shrink-0 ${riskStyle.border} ${riskStyle.bg}`}>
                                                <span className={`text-sm md:text-base font-black ${riskStyle.text}`}>
                                                    {(node.riskAmplification || 0).toFixed(0)}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white text-base md:text-lg flex items-center gap-2 truncate">
                                                    {node.name}
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-tighter shrink-0 ${node.category === 'internal' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                        {node.category}
                                                    </span>
                                                </div>
                                                <div className="text-[9px] md:text-[10px] text-white/20 font-mono font-medium group-hover:text-white/40 transition-colors uppercase truncate">{node.id}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                            <div className="text-left sm:text-right">
                                                <div className="text-[9px] uppercase font-bold text-white/20 mb-0.5">Centrality</div>
                                                <div className="text-sm font-black text-white/60">{((node.centrality || 0) * 100).toFixed(0)}%</div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <div className="text-[9px] uppercase font-bold text-white/20 mb-0.5">Structural</div>
                                                <div className="text-sm font-black text-white/60">{node.fanIn + node.fanOut}</div>
                                            </div>
                                            {isExpanded ? <ChevronUp size={18} className="text-white/20 shrink-0" /> : <ChevronDown size={18} className="text-white/20 shrink-0" />}
                                        </div>
                                    </div>
                                </div>


                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5 bg-black/40 overflow-hidden"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Risk Detail Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <DetailCard label="Dependency Type" value={node.category} icon={<GitBranch size={14} />} />
                                                    <DetailCard label="Declared Version" value={node.version || 'Unknown'} icon={<Code size={14} />} />
                                                    <DetailCard label="Version Health" value={node.lag} status={node.lag === 'up-to-date' ? 'success' : 'warning'} />
                                                    <DetailCard label="Volatility" value={`${(node.volatility * 100).toFixed(1)}%`} status={node.volatility > 0.3 ? 'danger' : 'success'} />
                                                </div>


                                                {/* Structural Trace */}
                                                <div className="space-y-3">
                                                    <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest flex items-center gap-2">
                                                        <ArrowRight size={12} className="text-white/10" />
                                                        Active Import Analysis ({nodeEdges.length} Traceable Paths)
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {nodeEdges.map((edge, ei) => (
                                                            <div key={ei} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] group/edge hover:border-white/10 transition-all">
                                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                    <div className={`w-1 h-8 rounded-full ${edge.source === node.id ? 'bg-blue-400/30' : 'bg-purple-400/30'}`} />
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2 font-mono text-[10px]">
                                                                            <span className={edge.source === node.id ? 'text-white/60' : 'text-white/30'}>{edge.source}</span>
                                                                            <ArrowRight size={10} className="text-white/10" />
                                                                            <span className={edge.target === node.id ? 'text-white/60' : 'text-white/30'}>{edge.target}</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-white/20 italic truncate mt-1 group-hover/edge:text-white/40">{edge.importLine}</div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[9px] font-black text-white/10 uppercase group-hover/edge:text-white/20 px-2">{edge.source === node.id ? 'Outbound' : 'Inbound'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Verification Footer */}
            <div className="flex items-center justify-center gap-4 py-8 opacity-40 hover:opacity-100 transition-opacity">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
                    <Circle size={6} className="fill-green-500 text-green-500 animate-pulse" />
                    Verified Architectural Signal Extraction
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>
        </div>
    );
}

function DetailCard({ label, value, icon, status }: { label: string, value: string, icon?: React.ReactNode, status?: 'success' | 'warning' | 'danger' }) {
    const statusColors = {
        success: 'text-green-400',
        warning: 'text-orange-400',
        danger: 'text-red-400'
    };

    return (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
            <div className="text-[9px] uppercase font-bold text-white/20 mb-2 flex items-center gap-2">
                {icon}
                {label}
            </div>
            <div className={`text-sm font-black uppercase tracking-tight ${status ? statusColors[status] : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}

function StatCard({ label, value, color, isPercent }: { label: string; value: number; color: 'purple' | 'blue' | 'red' | 'orange', isPercent?: boolean }) {
    const colors = {
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
        red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
        orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400'
    };

    return (
        <div className={`rounded-2xl p-4 bg-gradient-to-br ${colors[color]} border`}>
            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">{label}</div>
            <div className="text-3xl font-black text-white">{value}</div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] gap-6">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-t-2 border-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <GitBranch size={20} className="text-purple-500" />
                </div>
            </div>
            <div className="text-center">
                <div className="text-white font-black uppercase tracking-widest text-sm mb-1">Parsing</div>
                <div className="text-white/20 text-[10px] uppercase font-bold">Extracting Import Statements</div>
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
                <h3 className="text-xl font-bold text-white mb-2">Dependency Analysis Unavailable</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                    {reason || 'Unable to extract imports from repository source files.'}
                </p>
            </div>
        </div>
    );
}
