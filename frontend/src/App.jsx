import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LeadManager from './components/LeadManager';
import AgentMonitor from './components/AgentMonitor';
import QATesting from './components/QATesting';
import Analytics from './components/Analytics';
import './index.css';

function App() {
    const [darkMode, setDarkMode] = React.useState(false);

    React.useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [darkMode]);

    const navigation = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'Leads', path: '/leads', icon: '👥' },
        { name: 'Agent Monitor', path: '/agent', icon: '🤖' },
        { name: 'QA Testing', path: '/qa', icon: '✅' },
        { name: 'Analytics', path: '/analytics', icon: '📈' },
    ];

    return (
        <Router>
            <div className="app" style={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <aside className="sidebar" style={{
                    width: '250px',
                    background: 'var(--bg-primary)',
                    borderRight: '1px solid var(--border)',
                    padding: 'var(--spacing-lg)',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto'
                }}>
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>🎯 AI SDR Ops</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                            Performance Operations
                        </p>
                    </div>

                    <nav>
                        {navigation.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    padding: 'var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    textDecoration: 'none',
                                    color: 'var(--text-primary)',
                                    marginBottom: 'var(--spacing-sm)',
                                    transition: 'var(--transition)',
                                    fontWeight: 500,
                                }}
                                className="nav-link"
                            >
                                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-xl)' }}>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="btn btn-secondary w-full"
                            style={{ justifyContent: 'center' }}
                        >
                            {darkMode ? '☀️ Light' : '🌙 Dark'} Mode
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main style={{ flex: 1, overflow: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/leads" element={<LeadManager />} />
                        <Route path="/agent" element={<AgentMonitor />} />
                        <Route path="/qa" element={<QATesting />} />
                        <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                </main>
            </div>

            <style>{`
        .nav-link:hover {
          background-color: var(--bg-secondary);
        }
        
        .nav-link.active {
          background-color: var(--primary);
          color: white;
        }
      `}</style>
        </Router>
    );
}

export default App;
