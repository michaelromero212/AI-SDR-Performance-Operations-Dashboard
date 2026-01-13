# AI SDR Performance Operations Dashboard

A production-grade AI Sales Development Representative (SDR) operations platform demonstrating end-to-end AI agent lifecycle management with governance, QA testing, real-time monitoring, and comprehensive analytics.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Project Overview

This platform simulates a real-world AI SDR system with complete operational infrastructure. It showcases:

- **AI-Powered Lead Qualification**: Using Hugging Face LLMs for intelligent lead scoring
- **Governance Framework**: Automated compliance checks with human-in-the-loop escalation
- **QA Testing Infrastructure**: 15+ automated test scenarios covering edge cases
- **Real-Time Monitoring**: Live agent status and performance dashboards
- **A/B Testing**: Prompt variant comparison and optimization
- **Analytics & Insights**: Advanced cohort analysis and conversion funnels

**Built for:** Demonstrating AI Operations/Applied AI expertise for technical portfolios and interviews

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Application Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │ LeadManager  │  │   Analytics  │     │
│  │   (React)    │  │   (React)    │  │    (Dash)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴────────────┐
│                   FastAPI Backend (REST API)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Leads Router  │  │Campaigns     │  │Analytics     │     │
│  │              │  │Router        │  │Router        │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴────────────┐
│                      Business Logic Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  AI SDR      │  │  Validation  │  │  LLM Service │     │
│  │  Agent       │  │  Service     │  │  (HF API)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴────────────┐
│                      Data Layer (SQLite)                    │
│           Leads | Campaigns | Interactions | Metrics        │
└────────────────────────────────────────────────────────────┘
```

## ✨ Features

### 1. **AI Agent Operations**
- Automated lead qualification using Hugging Face LLMs
- Personalized email generation with industry-specific messaging
- Configurable scoring criteria and thresholds
- Support for multiple prompt variants (A/B testing)

### 2. **Governance & Compliance**
- **No pricing discussion** without human approval (auto-escalation)
- **Competitor mention detection** with escalation workflow
- **Data privacy checks** on all agent outputs
- Complete audit trail of all agent decisions

### 3. **QA Testing Framework**
- 15+ test scenarios covering:
  - Data quality validation
  - Agent behavior verification
  - Governance rule compliance
  - Edge case handling
- Automated test execution and reporting
- Pass/fail tracking with historical trends

### 4. **Real-Time Monitoring**
- Live agent status dashboard
- Health check API with LLM service monitoring
- Activity feed showing recent agent actions
- Performance metrics (reply rate, meeting rate, etc.)

### 5. **Advanced Analytics**
- **A/B Testing**: Compare prompt variant performance
- **Conversion Funnel**: Track leads through qualification stages
- **Cohort Analysis**: Performance by industry and company size
- **Data Quality Scorecard**: Automated validation reporting

### 6. **Operational Documentation**
Located in `/docs`:
- Business Intent Document
- Agent Behavior SOP (with flowcharts)
- Governance Framework
- QA Test Plan
- Field Enablement Guide
- Deployment Runbook

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- Hugging Face API Token ([Get one here](https://huggingface.co/settings/tokens))

### Installation

1. **Clone and setup:**
   ```bash
   cd AI-SDR-Performance-Operations-Dashboard
   ./setup.sh
   ```

2. **Configure environment:**
   ```bash
   # Edit .env and add your Hugging Face API token
   nano .env
   # Set: HF_API_TOKEN=your_token_here
   ```

3. **Run the platform:**

   **Terminal 1 - Backend API:**
   ```bash
   source venv/bin/activate
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

   **Terminal 2 - React Frontend:**
   ```bash
   cd frontend
   npm start
   ```

   **Terminal 3 - Dash Analytics (Optional):**
   ```bash
   source venv/bin/activate
   cd dashboard
   python app.py
   ```

### Access Points
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **React Dashboard**: http://localhost:3000
- **Dash Analytics**: http://localhost:8050

## 📊 Usage Guide

### 1. Import Leads
1. Navigate to **Leads** page
2. Click **Import CSV**
3. Upload `data/sample_leads.csv` (30 sample leads included)

### 2. Qualify Leads
- Click **🤖 Qualify** on any lead
- Agent analyzes company data and assigns score
- View reasoning and generated email
- Escalated leads flagged for human review

### 3. Monitor Agent
- **Agent Monitor** page shows real-time status
- Configure prompt variants for A/B testing
- View live activity feed

### 4. Run QA Tests
- **QA Testing** page lists all test scenarios
- Filter by category (Data Quality, Agent Behavior, Governance, Edge Cases)
- Run individual tests or batch execution
- Track pass/fail rates

### 5. Analyze Performance
- **Analytics** page shows:
  - A/B test comparison charts
  - Conversion funnel visualization
  - Cohort performance breakdowns
  - Exportable reports

## 🧪 Example Workflows

### Scenario 1: Qualifying a New Lead
```python
# Via API
POST /api/leads/123/qualify
{
  "lead_id": 123,
  "use_variant": "A"
}

# Response
{
  "qualified": true,
  "score": 85,
  "reasoning": "Company size (500-2000) and SaaS industry are good fit...",
  "email_content": "Subject: Quick question about TechFlow...",
  "escalated": false
}
```

### Scenario 2: Running A/B Test
1. Create two campaigns with variants A and B
2. Run campaigns on same lead segment
3. View comparison in Analytics dashboard
4. Choose winning variant based on avg score

### Scenario 3: Handling Escalations
- Lead mentions competitor → Auto-escalated to human
- Email contains pricing → Governance check fails → Escalated
- Missing critical data → Flagged for research

## 📁 Project Structure

```
AI-SDR-Performance-Operations-Dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # Pydantic schemas
│   │   ├── database.py          # SQLite connection
│   │   ├── agents/
│   │   │   ├── sdr_agent.py     # Core AI agent
│   │   │   └── prompt_templates.py
│   │   ├── routers/             # API endpoints
│   │   │   ├── leads.py
│   │   │   ├── campaigns.py
│   │   │   └── analytics.py
│   │   └── services/
│   │       ├── llm_service.py   # Hugging Face integration
│   │       └── validation.py    # Data quality checks
│   └── tests/                   # Unit tests
├── frontend/
│   └── src/
│       ├── components/          # React pages
│       │   ├── Dashboard.jsx
│       │   ├── LeadManager.jsx
│       │   ├── Agent Monitor.jsx
│       │   ├── QATesting.jsx
│       │   └── Analytics.jsx
│       └── services/
│           └── api.js           # API client
├── dashboard/                   # Plotly Dash app
├── data/
│   ├── sample_leads.csv         # Sample data
│   ├── test_scenarios.json      # QA tests
│   └── init_db.sql              # Database schema
├── docs/                        # Operational documentation
└── .env.example                 # Environment template
```

## 🔑 Key Technologies

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - Database ORM
- Hugging Face Hub - LLM integration
- Pydantic - Data validation

**Frontend:**
- React 18 - UI framework
- React Router - Navigation
- Plotly.js - Interactive charts
- Material-UI - Component library

**AI/ML:**
- Hugging Face Inference API
- LLaMA 3.1 or Mistral 7B models
- Custom prompt engineering

**Analytics:**
- Plotly Dash - Advanced dashboards
- Pandas - Data analysis

## 🎓 Learning Highlights

This project demonstrates:

✅ **AI Operations**: Full lifecycle from qualification to escalation  
✅ **Production Patterns**: Error handling, retry logic, logging  
✅ **Governance**: Automated compliance with human oversight  
✅ **Quality Assurance**: Comprehensive testing framework  
✅ **API Design**: RESTful endpoints with OpenAPI docs  
✅ **Modern Frontend**: React hooks, responsive design, dark mode  
✅ **Data Validation**: Input sanitization and quality checks  
✅ **A/B Testing**: Statistical comparison of variants  
✅ **Documentation**: SOPs, runbooks, technical guides  

## 🔮 Future Enhancements

- [ ] Multi-model LLM support (OpenAI, Anthropic)
- [ ] Real-time WebSocket updates for activity feed
- [ ] Email integration for actual outreach
- [ ] CRM integration (Salesforce, HubSpot)
- [ ] Advanced RAG for company research
- [ ] Automated retraining based on feedback
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 License

MIT License - see LICENSE file for details

## 👤 Contact

**Michael Romero**
- LinkedIn: [Your LinkedIn]
- Portfolio: [Your Portfolio]
- GitHub: [@yourusername]

---

**Built with ❤️ to demonstrate AI Operations expertise**
