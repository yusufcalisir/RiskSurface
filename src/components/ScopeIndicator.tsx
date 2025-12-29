import React from 'react';
import { Building2, GitBranch, Shield, Eye, Lock } from 'lucide-react';

interface ScopeIndicatorProps {
    organization: string;
    repository: string;
    accessLevel: 'read-only' | 'scoped' | 'full';
    isExpanded?: boolean;
}

const accessConfig = {
    'read-only': {
        icon: Eye,
        label: 'Read-Only',
        color: 'text-health-good',
        bg: 'bg-health-good/10',
        border: 'border-health-good/20',
    },
    'scoped': {
        icon: Shield,
        label: 'Scoped Access',
        color: 'text-risk-low',
        bg: 'bg-risk-low/10',
        border: 'border-risk-low/20',
    },
    'full': {
        icon: Lock,
        label: 'Full Access',
        color: 'text-risk-med',
        bg: 'bg-risk-med/10',
        border: 'border-risk-med/20',
    },
};

export default function ScopeIndicator({ organization, repository, accessLevel, isExpanded = true }: ScopeIndicatorProps) {
    const access = accessConfig[accessLevel];
    const AccessIcon = access.icon;

    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center gap-2 py-2">
                <div className={`w-8 h-8 rounded-lg ${access.bg} flex items-center justify-center`}>
                    <AccessIcon size={14} className={access.color} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Organization */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-border/30">
                <Building2 size={14} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black text-muted uppercase tracking-widest block">Organization</span>
                    <span className="text-xs font-bold text-white truncate block">{organization}</span>
                </div>
            </div>

            {/* Repository */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-border/30">
                <GitBranch size={14} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black text-muted uppercase tracking-widest block">Connected Repository</span>
                    <span className="text-[10px] font-mono text-white/80 truncate block">{repository}</span>
                </div>
            </div>

        </div>
    );
}

// Security Event Log Item
interface SecurityEventProps {
    timestamp: string;
    event: string;
    type: 'grant' | 'revoke' | 'info';
}

export function SecurityEventItem({ timestamp, event, type }: SecurityEventProps) {
    const colors = {
        grant: 'text-health-good',
        revoke: 'text-risk-med',
        info: 'text-muted',
    };

    return (
        <div className="flex items-start gap-3 px-3 py-2 hover:bg-white/[0.02] transition-all">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${colors[type].replace('text-', 'bg-')}`} />
            <div className="flex-1">
                <span className="text-[10px] text-white block">{event}</span>
                <span className="text-[9px] text-muted font-mono">{timestamp}</span>
            </div>
        </div>
    );
}
