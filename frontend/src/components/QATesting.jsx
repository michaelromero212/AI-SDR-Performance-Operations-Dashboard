import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

function QATesting() {
    const [scenarios, setScenarios] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScenarios();
    }, []); // Only load once on mount

    const loadScenarios = async () => {
        try {
            setLoading(true);
            // Always fetch ALL scenarios (no filter on API)
            const response = await analyticsAPI.testScenarios();
            setScenarios(response.data);
        } catch (error) {
            console.error('Failed to load scenarios from API, using mock data:', error);
            // Use mock data when API is not available
            setScenarios(getMockScenarios());
        } finally {
            setLoading(false);
        }
    };

    const runTest = async (scenarioId) => {
        try {
            const response = await analyticsAPI.runTest(scenarioId);
            alert(`Test ${response.data.passed ? 'passed' : 'failed'}!\n${response.data.result}`);
            loadScenarios();
        } catch (error) {
            alert('Failed to run test: ' + error.message);
        }
    };

    const getMockScenarios = () => [
        {
            id: 1,
            scenario_name: 'Valid Lead - SaaS Company',
            category: 'data_quality',
            expected_behavior: 'Should pass all validation checks',
            passed: true,
            executed_at: new Date().toISOString()
        },
        {
            id: 2,
            scenario_name: 'Missing Required Field - Email',
            category: 'data_quality',
            expected_behavior: 'Should flag missing email as critical issue',
            passed: true,
            executed_at: new Date().toISOString()
        },
        {
            id: 3,
            scenario_name: 'Lead Qualification - High Score',
            category: 'agent_behavior',
            expected_behavior: 'Should qualify lead with score >= 70',
            passed: true,
            executed_at: new Date().toISOString()
        },
        {
            id: 4,
            scenario_name: 'Governance - Pricing Mention',
            category: 'governance',
            expected_behavior: 'Should escalate if pricing is discussed',
            passed: true,
            executed_at: new Date().toISOString()
        },
        {
            id: 5,
            scenario_name: 'Edge Case - Competitor Mention',
            category: 'edge_cases',
            expected_behavior: 'Should escalate to human review',
            passed: true,
            executed_at: null
        },
        {
            id: 6,
            scenario_name: 'Invalid Email Format',
            category: 'data_quality',
            expected_behavior: 'Should reject invalid email',
            passed: false,
            executed_at: new Date().toISOString()
        }
    ];

    // Filter scenarios on the frontend
    const filteredScenarios = filter === 'all'
        ? scenarios
        : scenarios.filter(s => s.category === filter);

    const categories = [
        { value: 'all', label: 'All Categories', count: scenarios.length },
        { value: 'data_quality', label: 'Data Quality', count: scenarios.filter(s => s.category === 'data_quality').length },
        { value: 'agent_behavior', label: 'Agent Behavior', count: scenarios.filter(s => s.category === 'agent_behavior').length },
        { value: 'governance', label: 'Governance', count: scenarios.filter(s => s.category === 'governance').length },
        { value: 'edge_cases', label: 'Edge Cases', count: scenarios.filter(s => s.category === 'edge_cases').length },
    ];

    const passedTests = scenarios.filter(s => s.passed === 1 || s.passed === true).length;
    const failedTests = scenarios.filter(s => s.passed === 0 || s.passed === false).length;
    const notRunTests = scenarios.filter(s => s.passed === null).length;
    const passRate = scenarios.length > 0 ? (passedTests / scenarios.length * 100).toFixed(1) : 0;

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1>QA Testing</h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Automated test scenarios and validation
                </p>
            </div>

            {/* Test Results Summary */}
            <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card">
                    <div className="text-sm text-secondary mb-sm">Total Tests</div>
                    <div style={{ fontSize: '32px', fontWeight: 700 }}>{scenarios.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="text-sm text-secondary mb-sm">Passed</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success)' }}>{passedTests}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                    <div className="text-sm text-secondary mb-sm">Failed</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--error)' }}>{failedTests}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="text-sm text-secondary mb-sm">Pass Rate</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--primary)' }}>{passRate}%</div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilter(cat.value)}
                            className={`btn ${filter === cat.value ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ borderRadius: '20px' }}
                        >
                            {cat.label} ({cat.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Test Scenarios Table */}
            <div className="card">
                <div className="card-header flex justify-between items-center" style={{ border: 'none', paddingBottom: 0 }}>
                    <span>Test Scenarios</span>
                    <button onClick={loadScenarios} className="btn btn-secondary btn-sm">
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : filteredScenarios.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Scenario</th>
                                <th>Category</th>
                                <th>Expected Behavior</th>
                                <th>Last Run</th>
                                <th>Result</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScenarios.map((scenario) => (
                                <tr key={scenario.id}>
                                    <td style={{ fontWeight: 600 }}>{scenario.scenario_name}</td>
                                    <td>
                                        <span className="badge badge-info">
                                            {scenario.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="text-sm">{scenario.expected_behavior}</td>
                                    <td className="text-sm">
                                        {scenario.executed_at
                                            ? new Date(scenario.executed_at).toLocaleDateString()
                                            : 'Not run'}
                                    </td>
                                    <td>
                                        {scenario.passed === null ? (
                                            <span className="badge" style={{ background: '#e5e7eb', color: '#6b7280' }}>
                                                Not Run
                                            </span>
                                        ) : scenario.passed ? (
                                            <span className="badge badge-success">✓ Passed</span>
                                        ) : (
                                            <span className="badge badge-error">✗ Failed</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => runTest(scenario.id)}
                                            className="btn btn-primary btn-sm"
                                        >
                                            ▶️ Run
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No test scenarios found for this category.
                    </p>
                )}
            </div>
        </div>
    );
}

export default QATesting;
