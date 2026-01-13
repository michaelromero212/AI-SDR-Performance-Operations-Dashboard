import React, { useState, useEffect } from 'react';
import { healthCheck } from '../services/api';

function AgentMonitor() {
    const [agentStatus, setAgentStatus] = useState(null);
    const [config, setConfig] = useState({
        variant: 'A',
        maxRetries: 3,
        timeout: 30
    });

    useEffect(() => {
        checkAgentHealth();
        const interval = setInterval(checkAgentHealth, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    const checkAgentHealth = async () => {
        try {
            const response = await healthCheck();
            setAgentStatus(response.data);
        } catch (error) {
            console.error('Health check failed:', error);
            setAgentStatus({ status: 'error', llm_service: { status: 'disconnected' } });
        }
    };

    const getStatusColor = () => {
        if (!agentStatus) return 'var(--text-secondary)';
        if (agentStatus.status === 'healthy' && agentStatus.llm_service?.enabled) {
            return 'var(--success)';
        } else if (agentStatus.status === 'healthy') {
            return 'var(--warning)';
        }
        return 'var(--error)';
    };

    const getStatusText = () => {
        if (!agentStatus) return 'Checking...';
        if (agentStatus.status === 'healthy' && agentStatus.llm_service?.enabled) {
            return '🟢 Online & Ready';
        } else if (agentStatus.status === 'healthy') {
            return '🟡 Online (LLM Disabled)';
        }
        return '🔴 Offline';
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1>AI Agent Monitor</h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Real-time agent status and configuration
                </p>
            </div>

            {/* Status Card */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">Agent Status</div>

                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: 700,
                        color: getStatusColor(),
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {getStatusText()}
                    </div>

                    {agentStatus && (
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            Last checked: {new Date().toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {agentStatus?.llm_service && (
                    <div className="grid grid-3 gap-md" style={{ paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
                        <div>
                            <div className="text-sm text-secondary mb-sm">LLM Service</div>
                            <div style={{ fontWeight: 600 }}>
                                {agentStatus.llm_service.enabled ? '✅ Enabled' : '⚠️ Disabled'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-secondary mb-sm">Model</div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                {agentStatus.llm_service.model || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-secondary mb-sm">API Status</div>
                            <div style={{ fontWeight: 600 }}>
                                {agentStatus.llm_service.api_configured ? '✅ Configured' : '❌ Not Configured'}
                            </div>
                        </div>
                    </div>
                )}

                {!agentStatus?.llm_service?.api_configured && (
                    <div style={{
                        marginTop: 'var(--spacing-lg)',
                        padding: 'var(--spacing-md)',
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        <strong>⚠️ Configuration Required:</strong> Add your Hugging Face API token to the .env file to enable LLM features.
                    </div>
                )}
            </div>

            {/* Configuration Card */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">Agent Configuration</div>

                <div className="grid grid-3 gap-md">
                    <div className="form-group mb-0">
                        <label className="form-label">Prompt Variant (A/B Test)</label>
                        <select
                            value={config.variant}
                            onChange={(e) => setConfig({ ...config, variant: e.target.value })}
                        >
                            <option value="A">Variant A (Detailed)</option>
                            <option value="B">Variant B (Concise)</option>
                        </select>
                    </div>

                    <div className="form-group mb-0">
                        <label className="form-label">Max Retries</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={config.maxRetries}
                            onChange={(e) => setConfig({ ...config, maxRetries: e.target.value })}
                        />
                    </div>

                    <div className="form-group mb-0">
                        <label className="form-label">Timeout (seconds)</label>
                        <input
                            type="number"
                            min="10"
                            max="60"
                            value={config.timeout}
                            onChange={(e) => setConfig({ ...config, timeout: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <button className="btn btn-primary">
                        💾 Save Configuration
                    </button>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="card">
                <div className="card-header">Live Activity Feed</div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }}></div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Monitoring active</div>
                            <div className="text-sm text-secondary">Agent interactions will appear here in real-time</div>
                        </div>
                    </div>

                    <div style={{ padding: 'var(--spacing-lg)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No recent activity. Run lead qualification to see agent actions.
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
        </div>
    );
}

export default AgentMonitor;
