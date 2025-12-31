import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DependencyNode {
    id: string;
    type: 'entry' | 'critical_path' | 'service' | 'fragile_point' | 'infra';
    fanIn: number;
    fanOut: number;
    centralityScore: number;
    transitiveDepth: number;
}

interface DependencyLink {
    from: string;
    to: string;
    risk: 'Neutral' | 'Caution' | 'Critical' | 'Extreme';
    weight: number;
}

interface Props {
    nodes?: DependencyNode[];
    links?: DependencyLink[];
    isLoading?: boolean;
}

// Compute node positions based on index
function computeNodePositions(nodes: DependencyNode[]) {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerY = 250;
    const startX = 100;
    const stepX = 150;

    nodes.forEach((node, i) => {
        positions[node.id] = {
            x: startX + (i % 4) * stepX,
            y: centerY + (i % 2 === 0 ? -75 : 75) * (Math.floor(i / 4) + 1)
        };
    });

    return positions;
}

// Compute fragility score for a node
function computeFragilityScore(node: DependencyNode): number {
    const fanWeight = (node.fanIn + node.fanOut) * 5;
    const centralityWeight = node.centralityScore * 50;
    const depthWeight = node.transitiveDepth * 10;
    return Math.min(100, fanWeight + centralityWeight + depthWeight);
}

// Find highest-risk node and compute cascading probability
function computeVulnerabilityInsight(nodes: DependencyNode[], links: DependencyLink[]) {
    if (nodes.length === 0) return null;

    // Score all nodes
    const scoredNodes = nodes.map(node => ({
        ...node,
        fragilityScore: computeFragilityScore(node)
    }));

    // Find highest risk node
    const highestRiskNode = scoredNodes.reduce((max, node) =>
        node.fragilityScore > max.fragilityScore ? node : max
    );

    // Find downstream nodes from highest risk
    const downstreamLinks = links.filter(l => l.from === highestRiskNode.id);
    const downstreamCount = downstreamLinks.length;
    const totalNodes = nodes.length;

    // Compute cascading probability based on downstream reach
    const cascadingProbability = totalNodes > 1
        ? Math.round((downstreamCount / (totalNodes - 1)) * 100)
        : 0;

    // Find most impacted downstream node
    const mostImpactedLink = downstreamLinks.sort((a, b) => b.weight - a.weight)[0];

    return {
        sourceNode: highestRiskNode.id,
        fragilityScore: Math.round(highestRiskNode.fragilityScore),
        cascadingProbability,
        targetNode: mostImpactedLink?.to || null,
        downstreamCount
    };
}

export default function DependencyGraph({ nodes = [], links = [], isLoading = false }: Props) {
    const positions = useMemo(() => computeNodePositions(nodes), [nodes]);
    const vulnerability = useMemo(() => computeVulnerabilityInsight(nodes, links), [nodes, links]);

    // Check if data is available
    const hasData = nodes.length > 0 && links.length > 0;

    return (
        <div className="space-y-10 h-full flex flex-col">
            <div className="max-w-2xl space-y-2">
                <h2 className="text-3xl font-bold text-white">Architectural Risk</h2>
                <p className="text-muted text-lg leading-relaxed">
                    Visualizing structural dependencies that amplify fragility. The lines represent "Inherited Risk" rather than technical connections.
                </p>
            </div>

            <div className="flex-1 glass-panel rounded-[2.5rem] relative overflow-hidden bg-black/40 border-dashed min-h-[600px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Computing dependency graph...</p>
                        </div>
                    </div>
                ) : !hasData ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <AlertTriangle size={24} className="text-white/20 mx-auto" />
                            <p className="text-xs font-bold text-white/40">Insufficient dependency data</p>
                            <p className="text-[10px] text-white/30 max-w-xs">
                                No dependency manifests or import relationships found in this repository.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <svg className="w-full h-full" viewBox="0 0 700 500">
                            {/* Links */}
                            {links.map((link, i) => {
                                const from = positions[link.from];
                                const to = positions[link.to];
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
                            {nodes.map((n, i) => {
                                const pos = positions[n.id];
                                const risk = computeFragilityScore(n);
                                if (!pos) return null;

                                return (
                                    <motion.g
                                        key={n.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.15 }}
                                        className="cursor-crosshair"
                                    >
                                        <circle
                                            cx={pos.x} cy={pos.y} r={risk / 2 + 10}
                                            className={`fill-surface border-2 ${risk > 80 ? 'stroke-risk-crit shadow-[0_0_20px_#ef4444]' : 'stroke-border'}`}
                                            strokeWidth={2}
                                        />
                                        <text
                                            x={pos.x} y={pos.y + 45}
                                            textAnchor="middle"
                                            className="fill-muted font-black text-[9px] uppercase tracking-[0.2em]"
                                        >
                                            {n.id.length > 15 ? n.id.slice(0, 12) + '...' : n.id}
                                        </text>
                                        {risk > 80 && (
                                            <circle cx={pos.x} cy={pos.y} r={risk / 2 + 15} className="fill-none stroke-risk-crit/30" strokeWidth={1}>
                                                <animate attributeName="r" from={risk / 2 + 10} to={risk / 2 + 30} dur="3s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" from="1" to="0" dur="3s" repeatCount="indefinite" />
                                            </circle>
                                        )}
                                    </motion.g>
                                );
                            })}
                        </svg>

                        {/* Strategic Context Panel */}
                        <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                            <div className="flex-1 p-6 rounded-2xl bg-surface/80 border border-border backdrop-blur-xl">
                                <h4 className="text-[10px] font-black uppercase text-risk-crit mb-2 tracking-widest">Identified Vulnerability</h4>
                                {vulnerability && vulnerability.cascadingProbability > 0 ? (
                                    <p className="text-xs text-white font-bold leading-relaxed">
                                        The "{vulnerability.sourceNode}" serves as a high-fragility junction (score: {vulnerability.fragilityScore}).
                                        {vulnerability.targetNode && ` Any change here has a ${vulnerability.cascadingProbability}% cascading impact probability on "${vulnerability.targetNode}".`}
                                    </p>
                                ) : (
                                    <p className="text-xs text-white/50">No high-risk cascade paths detected in current dependency graph.</p>
                                )}
                            </div>
                            <div className="flex-1 p-6 rounded-2xl bg-surface/80 border border-border backdrop-blur-xl">
                                <h4 className="text-[10px] font-black uppercase text-health-good mb-2 tracking-widest">Graph Metrics</h4>
                                <p className="text-xs text-white font-bold leading-relaxed">
                                    {nodes.length} nodes analyzed with {links.length} dependency relationships.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
