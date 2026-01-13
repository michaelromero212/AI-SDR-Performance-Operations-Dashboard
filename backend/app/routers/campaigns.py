"""
Campaigns API Router
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Campaign, CampaignCreate, CampaignRunRequest
from ..agents.sdr_agent import SDRAgent

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.get("/", response_model=List[dict])
async def list_campaigns(limit: int = 50):
    """List all campaigns."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM campaigns ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        campaigns = [dict(row) for row in cursor.fetchall()]
    
    return campaigns


@router.post("/", response_model=dict)
async def create_campaign(campaign: CampaignCreate):
    """Create a new campaign."""
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO campaigns (name, prompt_template, prompt_variant, status)
            VALUES (?, ?, ?, 'draft')
            """,
            (campaign.name, campaign.prompt_template, campaign.prompt_variant)
        )
        campaign_id = cursor.lastrowid
        
        cursor = conn.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
        created_campaign = dict(cursor.fetchone())
    
    return created_campaign


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: int):
    """Get campaign details and status."""
    with get_db() as conn:
        # Get campaign
        cursor = conn.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
        campaign = cursor.fetchone()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign_data = dict(campaign)
        
        # Get interaction stats
        cursor = conn.execute(
            """
            SELECT 
                COUNT(*) as total_interactions,
                SUM(CASE WHEN decision = 'qualified' THEN 1 ELSE 0 END) as qualified_count,
                SUM(CASE WHEN escalated = 1 THEN 1 ELSE 0 END) as escalated_count
            FROM agent_interactions
            WHERE campaign_id = ?
            """,
            (campaign_id,)
        )
        stats = dict(cursor.fetchone())
        campaign_data['stats'] = stats
    
    return campaign_data


@router.post("/{campaign_id}/run")
async def run_campaign(campaign_id: int, request: CampaignRunRequest):
    """Run a campaign against specified leads."""
    with get_db() as conn:
        # Get campaign
        cursor = conn.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
        campaign = cursor.fetchone()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign_data = dict(campaign)
        
        # Get leads to process
        if request.lead_ids:
            placeholders = ','.join('?' * len(request.lead_ids))
            query = f"SELECT * FROM leads WHERE id IN ({placeholders})"
            cursor = conn.execute(query, request.lead_ids)
        else:
            # Process all new leads
            cursor = conn.execute("SELECT * FROM leads WHERE status = 'new' LIMIT 50")
        
        leads = [dict(row) for row in cursor.fetchall()]
        
        # Update campaign status
        conn.execute(
            "UPDATE campaigns SET status = 'active' WHERE id = ?",
            (campaign_id,)
        )
    
    # Process leads
    agent = SDRAgent(variant=campaign_data.get('prompt_variant', 'A'))
    results = []
    
    for lead in leads:
        try:
            result = agent.qualify_lead(lead)
            
            # Update lead
            new_status = 'qualified' if result['qualified'] else 'disqualified'
            with get_db() as conn:
                conn.execute(
                    "UPDATE leads SET status = ?, score = ? WHERE id = ?",
                    (new_status, result['score'], lead['id'])
                )
                
                # Log interaction
                conn.execute(
                    """
                    INSERT INTO agent_interactions 
                    (lead_id, campaign_id, action_type, decision, reasoning, escalated)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (lead['id'], campaign_id, 'qualification', new_status, result['reasoning'], result['escalated'])
                )
            
            results.append({
                'lead_id': lead['id'],
                'company_name': lead['company_name'],
                'qualified': result['qualified'],
                'score': result['score'],
                'escalated': result['escalated']
            })
        except Exception as e:
            results.append({
                'lead_id': lead['id'],
                'error': str(e)
            })
    
    return {
        'campaign_id': campaign_id,
        'leads_processed': len(results),
        'results': results
    }


@router.patch("/{campaign_id}/status")
async def update_campaign_status(campaign_id: int, status: str):
    """Update campaign status."""
    valid_statuses = ['draft', 'active', 'paused', 'completed']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    with get_db() as conn:
        cursor = conn.execute(
            "UPDATE campaigns SET status = ? WHERE id = ?",
            (status, campaign_id)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
    
    return {"message": f"Campaign status updated to {status}"}
