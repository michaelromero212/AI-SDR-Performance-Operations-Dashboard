-- AI SDR Performance Operations Dashboard - Database Schema

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    contact_email TEXT NOT NULL,
    contact_name TEXT,
    status TEXT DEFAULT 'new',
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    prompt_template TEXT,
    prompt_variant TEXT DEFAULT 'A',
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Agent interactions table
CREATE TABLE IF NOT EXISTS agent_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    campaign_id INTEGER,
    action_type TEXT NOT NULL,
    decision TEXT,
    email_content TEXT,
    reasoning TEXT,
    escalated BOOLEAN DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads (id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);

-- Test scenarios table
CREATE TABLE IF NOT EXISTS test_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_name TEXT NOT NULL,
    category TEXT NOT NULL,
    input_data TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    result TEXT,
    passed BOOLEAN,
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    campaign_id INTEGER,
    variant TEXT,
    leads_processed INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    replies_received INTEGER DEFAULT 0,
    meetings_scheduled INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    data_quality_score REAL DEFAULT 0,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(contact_email);
CREATE INDEX IF NOT EXISTS idx_interactions_lead ON agent_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON agent_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON performance_metrics(date);
CREATE INDEX IF NOT EXISTS idx_metrics_campaign ON performance_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_test_category ON test_scenarios(category);
