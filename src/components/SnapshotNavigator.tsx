import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Archive, Clock, GitCommit } from 'lucide-react';

interface Snapshot {
    id: string;
    timestamp: string;
    isCurrent: boolean;
}

const mockSnapshots: Snapshot[] = [
    { id: 'SNAP-2024Q4-03', timestamp: '2024-12-28T02:15:00Z', isCurrent: true },
    { id: 'SNAP-2024Q4-02', timestamp: '2024-12-21T14:32:07Z', isCurrent: false },
    { id: 'SNAP-2024Q4-01', timestamp: '2024-12-14T09:45:22Z', isCurrent: false },
    { id: 'SNAP-2024Q3-12', timestamp: '2024-09-28T16:20:00Z', isCurrent: false },
    { id: 'SNAP-2024Q3-11', timestamp: '2024-09-21T11:05:33Z', isCurrent: false },
];

interface SnapshotNavigatorProps {
    onSnapshotChange?: (snapshot: Snapshot) => void;
}

export default function SnapshotNavigator({ onSnapshotChange }: SnapshotNavigatorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const currentSnapshot = mockSnapshots[currentIndex];
    const isViewingHistory = currentIndex > 0;

    const navigatePrev = () => {
        if (currentIndex < mockSnapshots.length - 1) {
            setCurrentIndex(currentIndex + 1);
            onSnapshotChange?.(mockSnapshots[currentIndex + 1]);
        }
    };

    const navigateNext = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            onSnapshotChange?.(mockSnapshots[currentIndex - 1]);
        }
    };

    const formatTimestamp = (iso: string) => {
        const date = new Date(iso);
        return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    };

    return (
        <div className="relative">
            {/* Main Control */}
            <div
                className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer ${isViewingHistory
                        ? 'bg-risk-med/10 border-risk-med/30'
                        : 'bg-white/[0.02] border-border/50 hover:border-border'
                    }`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isViewingHistory && (
                    <Archive size={14} className="text-risk-med" />
                )}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                            {currentSnapshot.id}
                        </span>
                        {currentSnapshot.isCurrent && (
                            <span className="text-[8px] font-bold text-health-good uppercase px-1.5 py-0.5 rounded bg-health-good/10">
                                Current
                            </span>
                        )}
                        {isViewingHistory && (
                            <span className="text-[8px] font-bold text-risk-med uppercase px-1.5 py-0.5 rounded bg-risk-med/10">
                                Archived
                            </span>
                        )}
                    </div>
                    <span className="text-[9px] text-muted font-mono">
                        {formatTimestamp(currentSnapshot.timestamp)}
                    </span>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-1 ml-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                        disabled={currentIndex >= mockSnapshots.length - 1}
                        className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <span className="text-[9px] text-muted font-mono w-8 text-center">
                        {currentIndex + 1}/{mockSnapshots.length}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                        disabled={currentIndex <= 0}
                        className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Expanded Snapshot List */}
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl overflow-hidden z-50 shadow-2xl"
                >
                    <div className="p-3 border-b border-border">
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">Snapshot Archive</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {mockSnapshots.map((snap, i) => (
                            <button
                                key={snap.id}
                                onClick={() => { setCurrentIndex(i); setIsExpanded(false); onSnapshotChange?.(snap); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all ${i === currentIndex ? 'bg-white/[0.03]' : ''
                                    }`}
                            >
                                <GitCommit size={14} className={i === 0 ? 'text-health-good' : 'text-muted'} />
                                <div className="flex-1 text-left">
                                    <div className="text-[10px] font-bold text-white">{snap.id}</div>
                                    <div className="text-[9px] text-muted font-mono">{formatTimestamp(snap.timestamp)}</div>
                                </div>
                                {i === 0 && (
                                    <span className="text-[8px] font-bold text-health-good uppercase">Current</span>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Archival Banner for historical views
export function ArchivalBanner({ snapshotId, timestamp }: { snapshotId: string; timestamp: string }) {
    return (
        <div className="bg-risk-med/5 border-b border-risk-med/20 px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Archive size={14} className="text-risk-med" />
                <span className="text-[10px] font-bold text-risk-med uppercase tracking-wider">
                    Viewing Archived Snapshot
                </span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-muted">{snapshotId}</span>
                <span className="text-[9px] text-muted">{timestamp}</span>
                <button className="text-[9px] font-bold text-white bg-risk-med/20 px-3 py-1 rounded hover:bg-risk-med/30 transition-all">
                    Return to Current
                </button>
            </div>
        </div>
    );
}
