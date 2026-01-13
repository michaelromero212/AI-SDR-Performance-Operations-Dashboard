#!/bin/bash
# AI SDR Performance Operations Dashboard - Setup Script

set -e  # Exit on error

echo "🚀 Setting up AI SDR Performance Operations Dashboard..."

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env and add your Hugging Face API token"
else
    echo "✅ .env file already exists"
fi

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "
import sqlite3
import os

db_path = 'ai_sdr.db'
sql_path = 'data/init_db.sql'

if os.path.exists(sql_path):
    conn = sqlite3.connect(db_path)
    with open(sql_path, 'r') as f:
        conn.executescript(f.read())
    conn.close()
    print('✅ Database initialized')
else:
    print('⚠️  Database schema file not found, will create later')
" || echo "⚠️  Database initialization skipped (will be created by app)"

# Install Node dependencies if frontend exists
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "📥 Installing Node.js dependencies..."
    cd frontend
    npm install --silent
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "ℹ️  Frontend not ready yet, skipping npm install"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Hugging Face API token"
echo "2. Start the backend: source venv/bin/activate && cd backend && uvicorn app.main:app --reload"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Start the dashboard: source venv/bin/activate && cd dashboard && python app.py"
echo ""
echo "Access points:"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo "- React App: http://localhost:3000"
echo "- Dash Dashboard: http://localhost:8050"
