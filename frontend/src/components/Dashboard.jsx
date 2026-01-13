import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { analyticsAPI } from '../services/api';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [performance, setPerformance] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [metricsRes, perfRes] = await Promise.all([
                analyticsAPI.dashboard(),
                analyticsAPI.performance(30)
            ]);
            setMetrics(metricsRes.data);
            setPerformance(perfRes.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Chart data
    const performanceChart = {
        x: performance.map(d => d.date),
        y: performance.map(d => d.qualified),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Qualified Leads',
        line: { color: '#10b981', width: 3 },
        marker: { size: 8 }
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1>AI SDR Performance Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Real-time AI agent operations and performance metrics
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="kpi-card" style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                }}>
                    <div className="kpi-value">{metrics?.total_leads || 0}</div>
                    <div className="kpi-label">Total Leads</div>
                </div>

                <div className="kpi-card" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}>
                    <div className="kpi-value">{metrics?.qualified_leads || 0}</div>
                    <div className="kpi-label">Qualified Leads</div>
                </div>

                <div className="kpi-card" style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                }}>
                    <div className="kpi-value">
                        {metrics?.reply_rate ? `${(metrics.reply_rate * 100).toFixed(1)}%` : '0%'}
                    </div>
                    <div className="kpi-label">Reply Rate</div>
                </div>

                <div className="kpi-card" style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                }}>
                    <div className="kpi-value">
                        {metrics?.meeting_rate ? `${(metrics.meeting_rate * 100).toFixed(1)}%` : '0%'}
                    </div>
                    <div className="kpi-label">Meeting Rate</div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">Performance Trend (Last 30 Days)</div>
                {performance.length > 0 ? (
                    <Plot
                        data={[performanceChart]}
                        layout={{
                            autosize: true,
                            margin: { l: 50, r: 30, t: 30, b: 50 },
                            xaxis: { title: 'Date' },
                            yaxis: { title: 'Qualified Leads' },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                        }}
                        style={{ width: '100%', height: '400px' }}
                        config={{ responsive: true, displayModeBar: false }}
                    />
                ) : (
                    <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No performance data available yet
                    </p>
                )}
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header flex justify-between items-center" style={{ border: 'none', paddingBottom: 0 }}>
                    <span>Recent Agent Activity</span>
                    <button onClick={loadDashboard} className="btn btn-secondary btn-sm">
                        🔄 Refresh
                    </button>
                </div>

                {metrics?.recent_interactions && metrics.recent_interactions.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Company</th>
                                <th>Action</th>
                                <th>Decision</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.recent_interactions.map((interaction) => (
                                <tr key={interaction.id}>
                                    <td className="text-sm">
                                        {new Date(interaction.timestamp).toLocaleString()}
                                    </td>
                                    <td>{interaction.company_name}</td>
                                    <td className="text-sm">{interaction.action_type}</td>
                                    <td>
                                        <span className={`badge ${interaction.decision === 'qualified' ? 'badge-success' : 'badge-warning'
                                            }`}>
                                            {interaction.decision}
                                        </span>
                                    </td>
                                    <td>
                                        {interaction.escalated ? (
                                            <span className="badge badge-error">⚠️ Escalated</span>
                                        ) : (
                                            <span className="badge badge-success">✓ Automated</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No recent activity
                    </p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
