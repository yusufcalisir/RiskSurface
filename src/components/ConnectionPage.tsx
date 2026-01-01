import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, GitBranch, Loader2, Check, AlertCircle, ArrowRight } from 'lucide-react';

import { API_BASE } from '../config';

interface Organization {
    id: string;
    name: string;
}

interface Repository {
    id: string;
    url: string;
    name: string;
    owner: string;
    status: string;
    connectedAt: string;
}

interface ConnectionPageProps {
    onConnected: () => void;
}

export default function ConnectionPage({ onConnected }: ConnectionPageProps) {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [orgName, setOrgName] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');
    const [isOrgSaving, setIsOrgSaving] = useState(false);
    const [orgSaved, setOrgSaved] = useState(false);
    const [connectionSuccess, setConnectionSuccess] = useState(false);
    const [connectedRepo, setConnectedRepo] = useState<Repository | null>(null);

    // Load organization on mount
    useEffect(() => {
        fetch(`${API_BASE}/api/organization`)
            .then(res => res.json())
            .then(data => {
                setOrganization(data);
                setOrgName(data.name);
            })
            .catch(err => console.error('Failed to load organization:', err));
    }, []);

    // Check for existing repositories
    useEffect(() => {
        fetch(`${API_BASE}/api/repositories`)
            .then(res => res.json())
            .then((repos: Repository[]) => {
                if (repos && repos.length > 0) {
                    const readyRepo = repos.find(r => r.status === 'ready');
                    if (readyRepo) {
                        setConnectedRepo(readyRepo);
                        setConnectionSuccess(true);
                    }
                }
            })
            .catch(err => console.error('Failed to load repositories:', err));
    }, []);

    // Save organization name
    const handleOrgNameBlur = async () => {
        if (!orgName || orgName === organization?.name) return;

        setIsOrgSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/organization`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: orgName })
            });
            const data = await res.json();
            setOrganization(data);
            setOrgSaved(true);
            setTimeout(() => setOrgSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save organization:', err);
        }
        setIsOrgSaving(false);
    };

    // Validate GitHub URL
    const isValidGithubUrl = (url: string): boolean => {
        return /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(url);
    };

    // Connect repository
    const handleConnect = async () => {
        setError('');

        if (!repoUrl) {
            setError('Please enter a repository URL');
            return;
        }

        if (!isValidGithubUrl(repoUrl)) {
            setError('Invalid GitHub URL. Expected: https://github.com/owner/repo');
            return;
        }

        setIsConnecting(true);

        try {
            const res = await fetch(`${API_BASE}/api/repositories/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: repoUrl })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Connection failed');
                setIsConnecting(false);
                return;
            }

            setConnectedRepo(data.repository);
            setConnectionSuccess(true);

            // Poll for analysis completion
            const pollAnalysis = setInterval(async () => {
                const repoRes = await fetch(`${API_BASE}/api/repositories`);
                const repos: Repository[] = await repoRes.json();
                const currentRepo = repos.find(r => r.id === data.repository.id);

                if (currentRepo?.status === 'ready') {
                    clearInterval(pollAnalysis);
                    setConnectedRepo(currentRepo);
                }
            }, 1000);

        } catch (err) {
            setError('Server connection failed. Is the Go server running?');
        }

        setIsConnecting(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: 520,
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: 16,
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '32px 32px 24px',
                    borderBottom: '1px solid #222',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #111 100%)'
                }}>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: '#fff',
                        margin: 0,
                        letterSpacing: -1
                    }}>REPOANALYST</h1>
                    <p style={{ fontSize: 14, color: '#666', margin: '8px 0 0' }}>
                        Connect your repository to begin analysis
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: 32 }}>
                    {/* Organization Section */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#888',
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: 1
                        }}>
                            <Building2 size={14} />
                            Organization Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                onBlur={handleOrgNameBlur}
                                placeholder="Enter organization name"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    fontSize: 15,
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: 10,
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                            {isOrgSaving && (
                                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                                    <Loader2 size={16} color="#888" className="animate-spin" />
                                </div>
                            )}
                            {orgSaved && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    <Check size={16} color="#10b981" />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Repository Section */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#888',
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: 1
                        }}>
                            <GitBranch size={14} />
                            Repository URL
                        </label>
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => {
                                setRepoUrl(e.target.value);
                                setError('');
                            }}
                            placeholder="https://github.com/owner/repository"
                            disabled={connectionSuccess}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: 15,
                                backgroundColor: connectionSuccess ? '#1a2a1a' : '#1a1a1a',
                                border: `1px solid ${error ? '#dc3545' : connectionSuccess ? '#10b981' : '#333'}`,
                                borderRadius: 10,
                                color: connectionSuccess ? '#10b981' : '#fff',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginTop: 10,
                                    padding: '10px 14px',
                                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                    border: '1px solid rgba(220, 53, 69, 0.3)',
                                    borderRadius: 8,
                                    color: '#dc3545',
                                    fontSize: 13
                                }}
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </div>

                    {/* Connection Success State */}
                    {connectionSuccess && connectedRepo && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: 20,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 12,
                                marginBottom: 24
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                {connectedRepo.status === 'analyzing' ? (
                                    <Loader2 size={20} color="#fcd34d" className="animate-spin" />
                                ) : (
                                    <Check size={20} color="#10b981" />
                                )}
                                <span style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: connectedRepo.status === 'analyzing' ? '#fcd34d' : '#10b981'
                                }}>
                                    {connectedRepo.status === 'analyzing' ? 'Analysis in progress...' : 'Analysis complete!'}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: '#888' }}>
                                <strong style={{ color: '#fff' }}>{connectedRepo.owner}/{connectedRepo.name}</strong>
                                <br />
                                Connected {new Date(connectedRepo.connectedAt).toLocaleString()}
                            </div>
                        </motion.div>
                    )}

                    {/* Connect Button */}
                    {!connectionSuccess ? (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting || !repoUrl}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                fontSize: 14,
                                fontWeight: 700,
                                backgroundColor: isConnecting || !repoUrl ? '#333' : '#fff',
                                color: isConnecting || !repoUrl ? '#666' : '#000',
                                border: 'none',
                                borderRadius: 10,
                                cursor: isConnecting || !repoUrl ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <GitBranch size={18} />
                                    Connect Repository
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={onConnected}
                            disabled={connectedRepo?.status === 'analyzing'}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                fontSize: 14,
                                fontWeight: 700,
                                backgroundColor: connectedRepo?.status === 'analyzing' ? '#333' : '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                cursor: connectedRepo?.status === 'analyzing' ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                transition: 'all 0.2s'
                            }}
                        >
                            {connectedRepo?.status === 'analyzing' ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Waiting for analysis...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 32px',
                    borderTop: '1px solid #222',
                    backgroundColor: '#0a0a0a',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: 12, color: '#444' }}>
                        Secure • Read-only access • Data isolated
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
