import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Key, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

import { API_BASE } from '../config';

interface GitHubConnectModalProps {
    onConnect: (username: string, repoCount: number, organization?: string) => void;
    onClose?: () => void;
}

export default function GitHubConnectModal({ onConnect, onClose }: GitHubConnectModalProps) {
    const [token, setToken] = useState('');
    const [orgName, setOrgName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConnect = async () => {
        if (!token.trim()) {
            setError('Please enter your GitHub Personal Access Token');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/api/github/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token.trim(),
                    organization: orgName.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to connect');
                setLoading(false);
                return;
            }

            onConnect(data.connection.username, data.repoCount, data.connection.organization);
        } catch (err) {
            setError('Connection failed. Check if the server is running.');
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        >
            <div className="flex items-center gap-4 lg:gap-8">
                {/* Left Side: Database Animation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden lg:flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                boxShadow: ["0 0 20px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.3)", "0 0 20px rgba(59, 130, 246, 0)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex items-center justify-center p-4 relative z-10"
                        >
                            <div className="w-full h-full rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <path d="M4 6v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6" />
                                        <ellipse cx="12" cy="6" rx="8" ry="3" />
                                        <path d="M4 12c0 1.66 3.6 3 8 3s8-1.34 8-3" opacity="0.5" />
                                    </svg>
                                </motion.div>
                            </div>

                            {/* Server Lights */}
                            <div className="absolute right-3 top-3 flex gap-1">
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                    className="w-1 h-1 rounded-full bg-blue-400"
                                />
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                    className="w-1 h-1 rounded-full bg-blue-400"
                                />
                            </div>
                        </motion.div>
                        <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full" />
                    </div>
                </motion.div>

                {/* Left Arrow --> */}
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ delay: 0.4 }}
                    className="hidden lg:block w-24 h-[2px] relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-30" />
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                        animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500/50" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md mx-4"
                >
                    <div className="glass-panel rounded-2xl p-8 relative">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-muted" />
                            </button>
                        )}

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 mb-4">
                                <Github size={32} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Connect GitHub</h1>
                            <p className="text-muted text-sm mt-2">
                                Link your account to discover and analyze all your repositories
                            </p>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            {/* Organization Input */}
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                    Organization Name (Optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="Enter organization (e.g., acme-corp)"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Token Input */}
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                                    Personal Access Token
                                </label>
                                <div className="relative">
                                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}

                            {/* Connect Button */}
                            <button
                                onClick={handleConnect}
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Connect to GitHub
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-xs text-muted leading-relaxed">
                                <span className="text-white font-bold">Need a token?</span>{' '}
                                Go to GitHub → Settings → Developer settings → Personal access tokens →
                                Generate new token. Select <span className="text-white font-mono">repo</span> scope.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Arrow --> */}
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ delay: 0.6 }}
                    className="hidden lg:block w-24 h-[2px] relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-30" />
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }}
                    />
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-500/50" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </motion.div>

                {/* Right Side: Analysis Animation */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="hidden lg:flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                boxShadow: ["0 0 20px rgba(168, 85, 247, 0)", "0 0 20px rgba(168, 85, 247, 0.3)", "0 0 20px rgba(168, 85, 247, 0)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            className="w-20 h-20 rounded-2xl bg-[#0d1117] border border-purple-500/30 flex items-center justify-center p-4 relative z-10"
                        >
                            <div className="w-full h-full rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 overflow-hidden relative">
                                <motion.div
                                    className="absolute inset-x-0 bottom-0 bg-purple-500/40"
                                    animate={{ height: ["10%", "60%", "30%", "80%", "20%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 relative z-10">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>

                            {/* Status Dot */}
                            <div className="absolute right-3 top-3">
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                                />
                            </div>
                        </motion.div>
                        <div className="absolute inset-0 bg-purple-500/5 blur-xl rounded-full" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
