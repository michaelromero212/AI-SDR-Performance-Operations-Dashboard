"""
Database configuration and connection management
"""
import sqlite3
import os
from contextlib import contextmanager
from typing import Generator


DATABASE_PATH = os.getenv("DATABASE_URL", "sqlite:///./ai_sdr.db").replace("sqlite:///", "")


def get_db_connection():
    """Get a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for database connections."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    """Initialize the database with schema from init_db.sql."""
    schema_path = "data/init_db.sql"
    
    if not os.path.exists(schema_path):
        # Create basic schema if file doesn't exist
        with get_db() as conn:
            conn.executescript("""
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
                
                CREATE TABLE IF NOT EXISTS campaigns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    prompt_template TEXT,
                    prompt_variant TEXT DEFAULT 'A',
                    status TEXT DEFAULT 'draft',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS agent_interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    lead_id INTEGER NOT NULL,
                    campaign_id INTEGER,
                    action_type TEXT NOT NULL,
                    decision TEXT,
                    email_content TEXT,
                    reasoning TEXT,
                    escalated BOOLEAN DEFAULT 0,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
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
                    data_quality_score REAL DEFAULT 0
                );
            """)
        print("✅ Database initialized with basic schema")
    else:
        with open(schema_path, 'r') as f:
            schema = f.read()
        
        with get_db() as conn:
            conn.executescript(schema)
        print(f"✅ Database initialized from {schema_path}")


if __name__ == "__main__":
    init_database()
