import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, RefreshCw } from 'lucide-react';

import { API_BASE } from '../config';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}


export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const [notifications, setNotifications] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState('30');


    const handleSave = () => {
        localStorage.setItem('risksurface_notifications', String(notifications));
        localStorage.setItem('risksurface_autorefresh', String(autoRefresh));
        localStorage.setItem('risksurface_refreshinterval', refreshInterval);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute left-full bottom-0 ml-2 w-72 bg-surface border border-border rounded-xl shadow-2xl z-50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="text-sm font-bold text-white">Settings</h3>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                            <X size={14} className="text-muted" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">

                        {/* Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {notifications ? <Bell size={16} className="text-health-good" /> : <BellOff size={16} className="text-muted" />}
                                <div>
                                    <span className="text-xs font-bold text-white block">Notifications</span>
                                    <span className="text-[9px] text-muted">Email alerts for risk changes</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-10 h-5 rounded-full transition-all relative ${notifications ? 'bg-health-good/30' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notifications ? 'left-5' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Auto Refresh */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <RefreshCw size={16} className={autoRefresh ? 'text-risk-low' : 'text-muted'} />
                                <div>
                                    <span className="text-xs font-bold text-white block">Auto-Refresh</span>
                                    <span className="text-[9px] text-muted">Update dashboard automatically</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`w-10 h-5 rounded-full transition-all relative ${autoRefresh ? 'bg-risk-low/30' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${autoRefresh ? 'left-5' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Refresh Interval */}
                        {autoRefresh && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="pl-7"
                            >
                                <label className="text-[9px] text-muted uppercase tracking-widest block mb-1">Interval</label>
                                <select
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-border rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-risk-low"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="15" className="bg-[#1a1a1a] text-white">Every 15 min</option>
                                    <option value="30" className="bg-[#1a1a1a] text-white">Every 30 min</option>
                                    <option value="60" className="bg-[#1a1a1a] text-white">Every hour</option>
                                </select>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
                        <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-bold text-muted hover:text-white transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#e1e2e4] transition-all">
                            Save
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
