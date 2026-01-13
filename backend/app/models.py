"""
Pydantic data models for AI SDR Operations Platform
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class LeadStatus(str, Enum):
    NEW = "new"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    CONTACTED = "contacted"
    REPLIED = "replied"
    MEETING_SCHEDULED = "meeting_scheduled"


class CampaignStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


# Lead models
class LeadBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    industry: Optional[str] = Field(None, max_length=100)
    company_size: Optional[str] = Field(None, max_length=50)
    contact_email: EmailStr
    contact_name: Optional[str] = Field(None, max_length=200)


class LeadCreate(LeadBase):
    pass


class Lead(LeadBase):
    id: int
    status: LeadStatus = LeadStatus.NEW
    score: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Campaign models
class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    prompt_template: Optional[str] = None
    prompt_variant: str = Field(default="A", pattern="^[A-Z]$")


class CampaignCreate(CampaignBase):
    pass


class Campaign(CampaignBase):
    id: int
    status: CampaignStatus = CampaignStatus.DRAFT
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Agent interaction models
class AgentInteractionCreate(BaseModel):
    lead_id: int
    campaign_id: Optional[int] = None
    action_type: str
    decision: Optional[str] = None
    email_content: Optional[str] = None
    reasoning: Optional[str] = None
    escalated: bool = False


class AgentInteraction(AgentInteractionCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# Test scenario models
class TestScenarioBase(BaseModel):
    scenario_name: str
    category: str
    input_data: str
    expected_behavior: str


class TestScenario(TestScenarioBase):
    id: int
    result: Optional[str] = None
    passed: Optional[bool] = None
    executed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Performance metrics models
class PerformanceMetric(BaseModel):
    id: int
    date: str
    campaign_id: Optional[int] = None
    variant: Optional[str] = None
    leads_processed: int = 0
    emails_sent: int = 0
    replies_received: int = 0
    meetings_scheduled: int = 0
    false_positives: int = 0
    data_quality_score: float = 0.0

    class Config:
        from_attributes = True


# Request/Response schemas
class LeadQualifyRequest(BaseModel):
    lead_id: int
    use_variant: str = "A"


class LeadQualifyResponse(BaseModel):
    lead_id: int
    qualified: bool
    score: int
    reasoning: str
    email_content: Optional[str] = None
    escalated: bool = False


class CampaignRunRequest(BaseModel):
    campaign_id: int
    lead_ids: Optional[List[int]] = None
    filters: Optional[dict] = None


class ValidationResult(BaseModel):
    valid: bool
    quality_score: float
    issues: List[dict]
    summary: str


class AnalyticsResponse(BaseModel):
    total_leads: int
    qualified_leads: int
    reply_rate: float
    meeting_rate: float
    recent_interactions: List[dict]
