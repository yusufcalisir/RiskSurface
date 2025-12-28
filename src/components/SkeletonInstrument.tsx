import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    count?: number;
    height?: string | number;
}

export default function SkeletonInstrument({ className, count = 1, height = '100%' }: SkeletonProps) {
    return (
        <div className="space-y-4 w-full h-full">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0.05 }}
                    animate={{ opacity: 0.1 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                    className={`bg-white rounded-xl ${className}`}
                    style={{ height }}
                />
            ))}
        </div>
    );
}

export function SkeletonGrid({ items = 4, className = "grid-cols-4" }: { items?: number; className?: string }) {
    return (
        <div className={`grid gap-6 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="h-48 glass-panel rounded-2xl animate-pulse opacity-20" />
            ))}
        </div>
    );
}
