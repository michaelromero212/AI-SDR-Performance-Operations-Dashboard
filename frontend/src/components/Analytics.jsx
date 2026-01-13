import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { analyticsAPI } from '../services/api';

function Analytics() {
    const [abTest, setAbTest] = useState([]);
    const [funnel, setFunnel] = useState(null);
    const [cohorts, setCohorts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [abTestRes, funnelRes, cohortsRes] = await Promise.all([
                analyticsAPI.abTest(),
                analyticsAPI.funnel(),
                analyticsAPI.cohorts()
            ]);
            setAbTest(abTestRes.data);
            setFunnel(funnelRes.data);
            setCohorts(cohortsRes.data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
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

    // A/B Test Chart
    const abTestChart = {
        data: [
            {
                x: abTest.map(d => `Variant ${d.variant}`),
                y: abTest.map(d => d.avg_score || 0),
                type: 'bar',
                marker: { color: ['#3b82f6', '#10b981'] },
                text: abTest.map(d => `${(d.avg_score || 0).toFixed(1)}`),
                textposition: 'auto',
            }
        ],
        layout: {
            title: 'A/B Test - Average Qualification Score',
            yaxis: { title: 'Score' },
            showlegend: false,
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
        }
    };

    // Funnel Chart
    const funnelData = funnel ? [
        { stage: 'Total Leads', count: funnel.total_leads || 0 },
        { stage: 'Qualified', count: funnel.qualified || 0 },
        { stage: 'Contacted', count: funnel.contacted || 0 },
        { stage: 'Replied', count: funnel.replied || 0 },
        { stage: 'Meetings', count: funnel.meetings || 0 },
    ] : [];

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1>Advanced Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Deep insights and performance analysis
                </p>
            </div>

            {/* A/B Testing Results */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">A/B Test Results</div>

                <div className="grid grid-2 gap-lg" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {abTest.map((variant) => (
                        <div key={variant.variant} className="card" style={{ background: 'var(--bg-secondary)' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: 'var(--spacing-md)', color: variant.variant === 'A' ? '#3b82f6' : '#10b981' }}>
                                Variant {variant.variant}
                            </div>

                            <div className="grid grid-2 gap-sm">
                                <div>
                                    <div className="text-sm text-secondary">Interactions</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{variant.total_interactions || 0}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary">Qualified</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{variant.qualified_count || 0}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary">Avg Score</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{(variant.avg_score || 0).toFixed(1)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary">Escalated</div>
                                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{variant.escalated_count || 0}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {abTest.length > 0 && (
                    <Plot
                        data={abTestChart.data}
                        layout={abTestChart.layout}
                        style={{ width: '100%', height: '400px' }}
                        config={{ responsive: true, displayModeBar: false }}
                    />
                )}
            </div>

            {/* Conversion Funnel */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">Conversion Funnel</div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    {funnelData.map((stage, index) => {
                        const percentage = funnelData[0].count > 0
                            ? ((stage.count / funnelData[0].count) * 100).toFixed(1)
                            : 0;

                        return (
                            <div key={stage.stage} style={{ marginBottom: 'var(--spacing-md)' }}>
                                <div className="flex justify-between mb-sm">
                                    <span style={{ fontWeight: 600 }}>{stage.stage}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {stage.count} ({percentage}%)
                                    </span>
                                </div>
                                <div style={{
                                    height: '40px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        background: `linear-gradient(135deg, #3b82f6 0%, #10b981 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 600,
                                        transition: 'width 1s ease'
                                    }}>
                                        {stage.count > 0 && stage.count}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cohort Analysis */}
            <div className="grid grid-2 gap-lg">
                <div className="card">
                    <div className="card-header">Performance by Industry</div>

                    {cohorts?.by_industry && cohorts.by_industry.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Industry</th>
                                    <th>Leads</th>
                                    <th>Avg Score</th>
                                    <th>Qualified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cohorts.by_industry.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: 600 }}>{item.industry}</td>
                                        <td>{item.total_leads}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: item.avg_score >= 70 ? 'var(--success)' : item.avg_score >= 50 ? 'var(--warning)' : 'var(--error)'
                                            }}>
                                                {item.avg_score ? item.avg_score.toFixed(1) : '0'}
                                            </span>
                                        </td>
                                        <td>{item.qualified_count || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                            No industry data available
                        </p>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">Performance by Company Size</div>

                    {cohorts?.by_company_size && cohorts.by_company_size.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Size</th>
                                    <th>Leads</th>
                                    <th>Avg Score</th>
                                    <th>Qualified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cohorts.by_company_size.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: 600 }}>{item.company_size}</td>
                                        <td>{item.total_leads}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: item.avg_score >= 70 ? 'var(--success)' : item.avg_score >= 50 ? 'var(--warning)' : 'var(--error)'
                                            }}>
                                                {item.avg_score ? item.avg_score.toFixed(1) : '0'}
                                            </span>
                                        </td>
                                        <td>{item.qualified_count || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                            No company size data available
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Analytics;
