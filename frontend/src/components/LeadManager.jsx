import React, { useState, useEffect } from 'react';
import { leadsAPI } from '../services/api';

function LeadManager() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', industry: '', search: '' });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadLeads();
    }, [filter.status, filter.industry]);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const response = await leadsAPI.list({
                status: filter.status || undefined,
                industry: filter.industry || undefined
            });
            setLeads(response.data);
        } catch (error) {
            console.error('Failed to load leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQualify = async (leadId) => {
        try {
            const response = await leadsAPI.qualify(leadId, 'A');
            alert(`Lead qualified!\nScore: ${response.data.score}\nReasoning: ${response.data.reasoning}`);
            loadLeads();
        } catch (error) {
            alert('Failed to qualify lead: ' + error.message);
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            const response = await leadsAPI.import(selectedFile);
            alert(`Import complete!\nImported: ${response.data.imported} leads`);
            setSelectedFile(null);
            loadLeads();
        } catch (error) {
            alert('Import failed: ' + error.message);
        }
    };

    const handleDelete = async (leadId) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;

        try {
            await leadsAPI.delete(leadId);
            loadLeads();
        } catch (error) {
            alert('Failed to delete lead: ' + error.message);
        }
    };

    const filteredLeads = leads.filter(lead => {
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            return (
                lead.company_name?.toLowerCase().includes(searchLower) ||
                lead.contact_email?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    return (
        <div className="page-content">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1>Lead Manager</h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Manage leads and run AI qualification
                </p>
            </div>

            {/* Import Section */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">Import Leads</div>
                <form onSubmit={handleImport} className="flex gap-md items-center">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
                        📤 Import CSV
                    </button>
                </form>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="grid grid-3 gap-md">
                    <div className="form-group mb-0">
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            placeholder="Company or email..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        />
                    </div>

                    <div className="form-group mb-0">
                        <label className="form-label">Status</label>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="qualified">Qualified</option>
                            <option value="disqualified">Disqualified</option>
                            <option value="contacted">Contacted</option>
                        </select>
                    </div>

                    <div className="form-group mb-0">
                        <label className="form-label">Industry</label>
                        <select
                            value={filter.industry}
                            onChange={(e) => setFilter({ ...filter, industry: e.target.value })}
                        >
                            <option value="">All Industries</option>
                            <option value="SaaS">SaaS</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Manufacturing">Manufacturing</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="card">
                <div className="card-header flex justify-between items-center" style={{ border: 'none', paddingBottom: 0 }}>
                    <span>Leads ({filteredLeads.length})</span>
                    <button onClick={loadLeads} className="btn btn-secondary btn-sm">
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : filteredLeads.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Industry</th>
                                <th>Size</th>
                                <th>Contact</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td style={{ fontWeight: 600 }}>{lead.company_name}</td>
                                    <td>{lead.industry || '-'}</td>
                                    <td className="text-sm">{lead.company_size || '-'}</td>
                                    <td>
                                        <div className="text-sm">{lead.contact_name || '-'}</div>
                                        <div className="text-sm text-secondary">{lead.contact_email}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontWeight: 600,
                                            color: lead.score >= 70 ? 'var(--success)' : lead.score >= 50 ? 'var(--warning)' : 'var(--error)'
                                        }}>
                                            {lead.score}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${lead.status === 'qualified' ? 'badge-success' :
                                            lead.status === 'disqualified' ? 'badge-error' :
                                                'badge-info'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            {lead.status === 'new' && (
                                                <button
                                                    onClick={() => handleQualify(lead.id)}
                                                    title="Qualify this lead"
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '20px',
                                                        padding: '4px 8px',
                                                        opacity: 0.7,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.opacity = '1';
                                                        e.target.style.transform = 'scale(1.15)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.opacity = '0.7';
                                                        e.target.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                title="Delete this lead"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '20px',
                                                    padding: '4px 8px',
                                                    opacity: 0.7,
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.opacity = '1';
                                                    e.target.style.transform = 'scale(1.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.opacity = '0.7';
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        No leads found. Import a CSV to get started.
                    </p>
                )}
            </div>
        </div>
    );
}

export default LeadManager;
