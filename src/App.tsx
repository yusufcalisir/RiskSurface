import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Map,
    History,
    Files,
    GitBranch,
    Activity,
    Clock,
    ChevronLeft,
    ChevronRight,
    Settings,
    Github,
    LogOut,
    FolderKanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SkeletonInstrument from './components/SkeletonInstrument';

// Components
import RiskMap from './components/RiskMap';
import HistoryView from './components/HistoryView';
import ImpactSurface from './components/ImpactSurface';
import DependencyGraph from './components/DependencyGraph';
import { AnalysisStatus } from './components/SignalBadge';
import MetricCluster from './components/MetricCluster';
import SnapshotNavigator from './components/SnapshotNavigator';
import ScopeIndicator from './components/ScopeIndicator';
import SettingsPanel from './components/SettingsPanel';
import ExportDropdown from './components/ExportDropdown';
import RealDashboard from './components/RealDashboard';
import GitHubConnectModal from './components/GitHubConnectModal';
import ProjectsGrid from './components/ProjectsGrid';
import RealTopology from './components/RealTopology';
import RealTrajectory from './components/RealTrajectory';
import RealImpact from './components/RealImpact';
import RealDependencies from './components/RealDependencies';
import RealConcentration from './components/RealConcentration';
import RealTemporal from './components/RealTemporal';

import { API_BASE } from './config';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GitHubConnection {
    isConnected: boolean;
    username: string;
    avatarUrl: string;
    name: string;
    organization?: string;
    repoCount: number;
}

interface DiscoveredRepo {
    id: number;
    fullName: string;
    name: string;
    owner: string;
    description: string;
    defaultBranch: string;
    language: string;
    stars: number;
    private: boolean;
    updatedAt: string;
    analysisState: string;
}

const navItems = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'overview', label: 'Analysis', icon: LayoutDashboard },
    { id: 'risk-map', label: 'System Topology', icon: Map },
    { id: 'history', label: 'Risk Trajectory', icon: History },
    { id: 'impact', label: 'Impact Surface', icon: Files },
    { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
    { id: 'concentration', label: 'Concentration', icon: Activity },
    { id: 'temporal', label: 'Temporal Hotspots', icon: Clock },
];

export default function App() {
    console.log('[DEBUG] App component rendering...')
    // Connection state
    const [connection, setConnection] = useState<GitHubConnection | null>(null);
    const [isCheckingConnection, setIsCheckingConnection] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);

    // Projects state
    const [projects, setProjects] = useState<DiscoveredRepo[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [analyzingProject, setAnalyzingProject] = useState<string | null>(null);

    // Project isolation: version counter increments on every project switch
    // This forces all child components to refetch their data
    const [projectVersion, setProjectVersion] = useState(0);

    // UI state
    const [activeTab, setActiveTab] = useState('projects');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isAnalysisReady, setIsAnalysisReady] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Check GitHub connection on mount
    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        setIsCheckingConnection(true);
        try {
            const res = await fetch(`${API_BASE}/api/github/status`);
            const data = await res.json();
            if (data.isConnected) {
                setConnection(data);
                fetchProjects();
            } else {
                setConnection(null);
            }
        } catch (err) {
            setConnection(null);
        }
        setIsCheckingConnection(false);
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/projects`);
            const data = await res.json();
            setProjects(data || []);
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const handleConnect = (username: string, repoCount: number, organization?: string) => {
        setConnection({
            isConnected: true,
            username,
            avatarUrl: '',
            name: username,
            organization,
            repoCount
        });
        setShowConnectModal(false);
        fetchProjects();
    };

    const handleDisconnect = async () => {
        try {
            await fetch(`${API_BASE}/api/github/disconnect`, { method: 'POST' });
            setConnection(null);
            setProjects([]);
            setSelectedProject(null);
            setActiveTab('projects');
        } catch (err) {
            console.error('Failed to disconnect');
        }
    };

    const handleSelectProject = async (fullName: string) => {
        // CRITICAL: Invalidate all stale data immediately
        setIsAnalysisReady(false);
        setProjectVersion(v => v + 1);

        setAnalyzingProject(fullName);
        setSelectedProject(fullName);

        // Check if project is already analyzed
        const project = projects.find(p => p.fullName === fullName);
        if (project?.analysisState === 'ready') {
            // Project already analyzed, but we MUST tell the backend we selected it
            // so that subsequent fetch calls (like /api/projects/selected) return the correct project.
            try {
                await fetch(`${API_BASE}/api/projects/selected`, {
                    method: 'POST',
                    body: JSON.stringify({ fullName }),
                    headers: { 'Content-Type': 'application/json' }
                });

                // Re-fetch projects to sync any state
                await fetchProjects();

                // Switch to overview immediately after backend is synced
                setActiveTab('overview');
            } catch (err) {
                console.error('Failed to select project on backend', err);
                // Fallback: try to switch anyway, though data might be stale/wrong
                setActiveTab('overview');
            }
            setAnalyzingProject(null);
            setIsAnalysisReady(true);
            return;
        }

        try {
            const [owner, repo] = fullName.split('/');
            const res = await fetch(`${API_BASE}/api/projects/${owner}/${repo}/analyze`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.success) {
                // Re-fetch projects to sync with backend
                await fetchProjects();
                setActiveTab('overview');
            }
        } catch (err) {
            console.error('Failed to analyze project');
        }
        setAnalyzingProject(null);
        setIsAnalysisReady(true);
    };

    // Loading state
    if (isCheckingConnection) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="text-muted">Loading...</div>
            </div>
        );
    }

    // Get selected project details
    const currentProject = projects.find(p => p.fullName === selectedProject);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-[#e1e2e4] font-sans">
            {/* GitHub Connect Modal - Only shown when user explicitly requests */}
            <AnimatePresence>
                {showConnectModal && (
                    <GitHubConnectModal
                        onConnect={handleConnect}
                        onClose={() => setShowConnectModal(false)}
                    />
                )}
            </AnimatePresence>
            {/* Sidebar Desktop */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 260 }}
                className="hidden md:flex flex-col h-screen border-r border-border bg-surface/30 backdrop-blur-xl shrink-0 z-50"
            >
                <div className="p-6 flex items-center justify-between">
                    {!isSidebarCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold tracking-tight text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                        >
                            RISKSURFACE
                        </motion.span>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-1.5 rounded-md hover:bg-white/5 transition-colors border border-border/50"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        // Disable analysis tabs if no project selected
                        const isDisabled = item.id !== 'projects' && !selectedProject;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (isDisabled) return;
                                    if (activeTab === item.id) return;
                                    setIsAnalysisReady(false);
                                    setActiveTab(item.id);
                                    setTimeout(() => setIsAnalysisReady(true), 400);
                                }}
                                disabled={isDisabled}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                                    activeTab === item.id ? "bg-white/10 text-white" : "text-muted hover:text-white hover:bg-white/5",
                                    isDisabled && "opacity-40 cursor-not-allowed"
                                )}
                            >
                                <item.icon size={20} className={cn(activeTab === item.id ? "text-risk-high" : "text-muted group-hover:text-white")} />
                                {!isSidebarCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-bold tracking-tight text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute left-0 w-1 h-6 bg-risk-high rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border space-y-4">
                    {/* GitHub Connection */}
                    {!connection ? (
                        // Not connected - Show Connect Button
                        <button
                            onClick={() => setShowConnectModal(true)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all"
                        >
                            <Github size={20} />
                            {!isSidebarCollapsed && <span>Connect GitHub</span>}
                        </button>
                    ) : (
                        // Connected - Show User Info
                        <>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                                <Github size={20} className="text-green-400" />
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-white truncate">{connection.username}</div>
                                        {connection.organization && (
                                            <div className="text-[10px] text-risk-high font-mono pt-0.5">{connection.organization}</div>
                                        )}
                                        <div className="text-[10px] text-muted">{projects.length} repos</div>
                                    </div>
                                )}
                            </div>

                            {/* Selected Project */}
                            {currentProject && !isSidebarCollapsed && (
                                <ScopeIndicator
                                    organization={connection?.organization || currentProject.owner}
                                    repository={currentProject.fullName}
                                    accessLevel="full"
                                    isExpanded={true}
                                />
                            )}

                            {/* Settings */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={`w-full h-10 flex items-center gap-3 px-3 rounded-xl transition-all ${isSettingsOpen ? 'text-white bg-white/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                                >
                                    <Settings size={20} />
                                    {!isSidebarCollapsed && <span className="text-sm font-bold">Settings</span>}
                                </button>
                                <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                            </div>

                            {/* Disconnect */}
                            <button
                                onClick={handleDisconnect}
                                className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <LogOut size={20} />
                                {!isSidebarCollapsed && <span className="text-sm font-bold">Disconnect</span>}
                            </button>
                        </>
                    )}
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0 z-50 relative" style={{ backgroundColor: '#0a0a0a' }}>
                    <div className="flex items-center gap-6">
                        <h2 className="text-sm font-bold text-white capitalize">
                            {(!connection && activeTab === 'projects') ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-yellow-500/80 uppercase tracking-widest">Awaiting Feed</span>
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Signal Status: Pending Connection</span>
                                </div>
                            ) : (activeTab === 'projects' ? 'Projects' : currentProject?.name || 'Select a project')}
                        </h2>
                        {currentProject && activeTab !== 'projects' && (
                            <>
                                <div className="h-4 w-px bg-border hidden sm:block" />
                                <span className="text-xs text-muted">{currentProject.fullName}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {(!connection && activeTab === 'projects') ? (
                            <div className="md:hidden">
                                <button
                                    onClick={() => setShowConnectModal(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold"
                                >
                                    <Github size={14} />
                                    Connect
                                </button>
                            </div>
                        ) : activeTab !== 'projects' && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className={`text-xs font-black px-4 py-2 rounded-lg transition-all tracking-tight uppercase ${isExportOpen ? 'bg-[#e1e2e4] text-black' : 'bg-white text-black hover:bg-[#e1e2e4]'}`}
                                >
                                    Export Report
                                </button>
                                <ExportDropdown isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {(isAnalysisReady || activeTab === 'projects') ? (
                            <motion.div
                                key={activeTab + (selectedProject || '')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "max-w-[1600px] mx-auto",
                                    (connection || activeTab !== 'projects') ? "space-y-12 pb-32" : "h-full flex items-center"
                                )}
                            >
                                {activeTab === 'projects' && (
                                    <ProjectsGrid
                                        projects={projects}
                                        selectedProject={selectedProject}
                                        analyzingProject={analyzingProject}
                                        isConnected={!!connection}
                                        onSelectProject={handleSelectProject}
                                        onConnect={() => setShowConnectModal(true)}
                                    />
                                )}
                                {activeTab === 'overview' && selectedProject && (
                                    <RealDashboard key={`dashboard-${projectVersion}`} projectId={selectedProject} />
                                )}
                                {activeTab === 'risk-map' && selectedProject && (
                                    <RealTopology key={`topology-${projectVersion}`} projectId={selectedProject} />
                                )}
                                {activeTab === 'history' && selectedProject && (
                                    <RealTrajectory key={`trajectory-${projectVersion}`} projectId={selectedProject} />
                                )}
                                {activeTab === 'impact' && selectedProject && (
                                    <RealImpact key={`impact-${projectVersion}`} projectId={selectedProject} />
                                )}
                                {activeTab === 'dependencies' && selectedProject && (
                                    <RealDependencies key={`deps-${projectVersion}`} projectId={selectedProject} />
                                )}
                                {activeTab === 'concentration' && selectedProject && (
                                    <RealConcentration key={`concentration-${projectVersion}`} projectId={selectedProject} />
                                )}
                                {activeTab === 'temporal' && selectedProject && (
                                    <RealTemporal key={`temporal-${projectVersion}`} projectId={selectedProject} />
                                )}
                            </motion.div>
                        ) : (
                            <div className="max-w-[1600px] mx-auto space-y-12 pb-32">
                                <SkeletonInstrument count={1} height={120} className="w-2/3" />
                                <div className="grid grid-cols-3 gap-6">
                                    <SkeletonInstrument count={1} height={180} />
                                    <SkeletonInstrument count={1} height={180} />
                                    <SkeletonInstrument count={1} height={180} />
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-4 z-50">
                {navItems.slice(0, 4).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id !== 'projects' && !selectedProject) return;
                            setActiveTab(item.id);
                        }}
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                            activeTab === item.id ? "text-risk-high" : "text-muted"
                        )}
                    >
                        <item.icon size={20} />
                        <span className="text-[10px] uppercase tracking-tighter font-bold">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

// ==================== HELPER COMPONENTS ====================

function ContextIndicator({ label, value, status }: { label: string; value: string; status: 'good' | 'caution' | 'stable' }) {
    const statusColors = {
        good: 'bg-health-good/20 text-health-good',
        caution: 'bg-risk-medium/20 text-risk-medium',
        stable: 'bg-white/10 text-muted'
    };
    return (
        <div className={`px-3 py-1.5 rounded-lg ${statusColors[status]} text-[10px] uppercase tracking-widest font-bold`}>
            <span className="opacity-70">{label}:</span> {value}
        </div>
    );
}

function TrajectoryCard({
    label,
    value,
    sub,
    status,
    signalState
}: {
    label: string;
    value: string;
    sub: string;
    status: 'caution' | 'warning' | 'danger';
    signalState: 'complete' | 'pending';
}) {
    const statusColors = {
        caution: 'border-risk-medium/30 bg-risk-medium/5',
        warning: 'border-risk-high/30 bg-risk-high/5',
        danger: 'border-risk-critical/30 bg-risk-critical/5'
    };
    const statusTextColors = {
        caution: 'text-risk-medium',
        warning: 'text-risk-high',
        danger: 'text-risk-critical'
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel rounded-2xl p-6 border ${statusColors[status]} relative overflow-hidden group hover:scale-[1.02] transition-transform`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 ${status === 'danger' ? 'bg-risk-critical' : status === 'warning' ? 'bg-risk-high' : 'bg-risk-medium'}`} />
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-muted font-black">{label}</span>
                    <div className={`w-2 h-2 rounded-full ${signalState === 'complete' ? 'bg-health-good' : 'bg-risk-medium animate-pulse'}`} />
                </div>
                <h3 className={`text-2xl font-bold ${statusTextColors[status]} mb-1`}>{value}</h3>
                <p className="text-[11px] text-muted">{sub}</p>
            </div>
        </motion.div>
    );
}
