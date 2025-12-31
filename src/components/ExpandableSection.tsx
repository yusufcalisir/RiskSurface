import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    title?: string;
    primaryContent: ReactNode;        // Always visible (high-level signals)
    secondaryContent?: ReactNode;     // Expandable (supporting metrics)
    detailContent?: ReactNode;        // Deep inspection (files, commits)
    defaultExpanded?: boolean;
    mobileCollapsed?: boolean;        // Default collapsed on mobile
    className?: string;
}

export default function ExpandableSection({
    title,
    primaryContent,
    secondaryContent,
    detailContent,
    defaultExpanded = false,
    mobileCollapsed = true,
    className = ''
}: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [showDetails, setShowDetails] = useState(false);

    const hasSecondary = !!secondaryContent;
    const hasDetails = !!detailContent;
    const hasExpandable = hasSecondary || hasDetails;

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Primary Content - Always Visible */}
            <div className="relative">
                {primaryContent}

                {hasExpandable && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? (
                            <ChevronUp size={14} className="text-white/30 group-hover:text-white/60" />
                        ) : (
                            <ChevronDown size={14} className="text-white/30 group-hover:text-white/60" />
                        )}
                    </button>
                )}
            </div>

            {/* Secondary Content - Expandable */}
            <AnimatePresence>
                {isExpanded && secondaryContent && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 border-t border-white/5">
                            {secondaryContent}
                        </div>

                        {hasDetails && (
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
                            >
                                {showDetails ? (
                                    <>
                                        <ChevronUp size={10} />
                                        Hide Details
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={10} />
                                        Show Details
                                    </>
                                )}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Content - Deep Inspection */}
            <AnimatePresence>
                {showDetails && detailContent && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 border-t border-white/5 text-[10px] text-white/40">
                            {detailContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
