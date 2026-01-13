"""
Leads API Router
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
import csv
import io
from datetime import datetime

from ..database import get_db
from ..models import Lead, LeadCreate, LeadQualifyRequest, LeadQualifyResponse
from ..agents.sdr_agent import SDRAgent

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("/", response_model=List[dict])
async def list_leads(
    status: Optional[str] = None,
    industry: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """List leads with optional filters."""
    with get_db() as conn:
        query = "SELECT * FROM leads WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        if industry:
            query += " AND industry = ?"
            params.append(industry)
        
        query += f" ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor = conn.execute(query, params)
        leads = [dict(row) for row in cursor.fetchall()]
        
    return leads


@router.get("/{lead_id}")
async def get_lead(lead_id: int):
    """Get a specific lead by ID."""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        lead = cursor.fetchone()
        
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return dict(lead)


@router.post("/", response_model=dict)
async def create_lead(lead: LeadCreate):
    """Create a new lead."""
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO leads (company_name, industry, company_size, contact_email, contact_name, status, score)
            VALUES (?, ?, ?, ?, ?, 'new', 0)
            """,
            (lead.company_name, lead.industry, lead.company_size, lead.contact_email, lead.contact_name)
        )
        lead_id = cursor.lastrowid
        
        cursor = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        created_lead = dict(cursor.fetchone())
    
    return created_lead


@router.post("/import")
async def import_leads(file: UploadFile = File(...)):
    """Import leads from CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    csv_file = io.StringIO(content.decode('utf-8'))
    reader = csv.DictReader(csv_file)
    
    imported_count = 0
    errors = []
    
    with get_db() as conn:
        for row_num, row in enumerate(reader, start=2):
            try:
                conn.execute(
                    """
                    INSERT INTO leads (company_name, industry, company_size, contact_email, contact_name, status, score)
                    VALUES (?, ?, ?, ?, ?, 'new', 0)
                    """,
                    (
                        row.get('company_name', ''),
                        row.get('industry', ''),
                        row.get('company_size', ''),
                        row.get('contact_email', ''),
                        row.get('contact_name', '')
                    )
                )
                imported_count += 1
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
    
    return {
        "imported": imported_count,
        "errors": errors[:10]  # Limit error list
    }


@router.post("/{lead_id}/qualify", response_model=LeadQualifyResponse)
async def qualify_lead(lead_id: int, request: LeadQualifyRequest):
    """Qualify a lead using AI agent."""
    # Get lead data
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        lead = cursor.fetchone()
        
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead_data = dict(lead)
    
    # Run qualification
    agent = SDRAgent(variant=request.use_variant)
    result = agent.qualify_lead(lead_data)
    
    # Generate email if qualified
    email_content = None
    if result['qualified'] and not result['escalated']:
        email_result = agent.generate_email(lead_data, result['score'])
        if email_result['governance_approved']:
            email_content = email_result['email_content']
        else:
            result['escalated'] = True
            result['escalation_reason'] = 'Email failed governance check'
    
    # Update lead in database
    new_status = 'qualified' if result['qualified'] else 'disqualified'
    with get_db() as conn:
        conn.execute(
            "UPDATE leads SET status = ?, score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_status, result['score'], lead_id)
        )
        
        # Log interaction
        conn.execute(
            """
            INSERT INTO agent_interactions (lead_id, action_type, decision, email_content, reasoning, escalated)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                lead_id,
                'qualification',
                new_status,
                email_content,
                result['reasoning'],
                result['escalated']
            )
        )
    
    return LeadQualifyResponse(
        lead_id=lead_id,
        qualified=result['qualified'],
        score=result['score'],
        reasoning=result['reasoning'],
        email_content=email_content,
        escalated=result['escalated']
    )


@router.delete("/{lead_id}")
async def delete_lead(lead_id: int):
    """Delete a lead."""
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
    
    return {"message": "Lead deleted successfully"}
