import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-risk-crit/5 border border-risk-crit/20 text-center gap-4">
                    <AlertCircle size={48} className="text-risk-crit" />
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">View Crashed</h2>
                        <p className="text-muted text-sm max-w-md mx-auto">
                            The visualization component encountered an unexpected error while rendering.
                            This often happens when analysis data is malformed or missing required fields.
                        </p>
                    </div>
                    {this.state.error && (
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-left max-w-xl overflow-auto">
                            <code className="text-[10px] text-risk-crit/80">{this.state.error.message}</code>
                        </div>
                    )}
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#e1e2e4] transition-colors mt-4"
                    >
                        <RefreshCw size={16} />
                        Attempt Recovery
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
