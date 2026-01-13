"""
AI SDR Agent - Core agent logic for lead qualification and email generation
"""
import logging
import re
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

from ..services.llm_service import llm_service
from .prompt_templates import (
    get_qualification_prompt,
    get_email_prompt,
    GOVERNANCE_CHECK_PROMPT
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SDRAgent:
    """AI Sales Development Representative Agent."""
    
    def __init__(self, variant: str = "A"):
        """
        Initialize SDR Agent.
        
        Args:
            variant: Prompt variant for A/B testing (A or B)
        """
        self.variant = variant
        self.llm = llm_service
        logger.info(f"SDR Agent initialized with variant {variant}")
    
    def qualify_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Qualify a lead using AI analysis.
        
        Args:
            lead_data: Dictionary with lead information
            
        Returns:
            Dictionary with qualification result
        """
        logger.info(f"Qualifying lead: {lead_data.get('company_name', 'Unknown')}")
        
        # Format prompt with lead data
        prompt = get_qualification_prompt(self.variant).format(
            company_name=lead_data.get('company_name', 'Unknown'),
            industry=lead_data.get('industry', 'Unknown'),
            company_size=lead_data.get('company_size', 'Unknown'),
            contact_name=lead_data.get('contact_name', 'Unknown'),
            contact_email=lead_data.get('contact_email', 'unknown@example.com')
        )
        
        # Get LLM response
        response = self.llm.generate(prompt, max_tokens=300, temperature=0.3)
        
        if not response:
            logger.error("Failed to get LLM response for qualification")
            return self._fallback_qualification(lead_data)
        
        # Parse response
        score, decision, reasoning = self._parse_qualification_response(response)
        
        # Apply governance rules
        escalated, escalation_reason = self._check_escalation_rules(
            lead_data, decision, reasoning
        )
        
        result = {
            'qualified': decision == 'QUALIFIED',
            'score': score,
            'reasoning': reasoning,
            'escalated': escalated,
            'escalation_reason': escalation_reason,
            'variant': self.variant,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Qualification result: {decision}, Score: {score}, Escalated: {escalated}")
        return result
    
    def generate_email(
        self,
        lead_data: Dict[str, Any],
        qualification_score: int
    ) -> Dict[str, Any]:
        """
        Generate personalized email for a qualified lead.
        
        Args:
            lead_data: Dictionary with lead information
            qualification_score: Lead's qualification score
            
        Returns:
            Dictionary with email content and metadata
        """
        logger.info(f"Generating email for: {lead_data.get('company_name', 'Unknown')}")
        
        # Format prompt
        prompt = get_email_prompt(self.variant).format(
            company_name=lead_data.get('company_name', 'Unknown'),
            industry=lead_data.get('industry', 'Unknown'),
            contact_name=lead_data.get('contact_name', 'there'),
            score=qualification_score
        )
        
        # Generate email
        email_content = self.llm.generate(prompt, max_tokens=400, temperature=0.7)
        
        if not email_content:
            logger.error("Failed to generate email")
            email_content = self._fallback_email(lead_data)
        
        # Run governance check
        governance_approved, governance_issues = self._check_governance(email_content)
        
        result = {
            'email_content': email_content,
            'governance_approved': governance_approved,
            'governance_issues': governance_issues,
            'variant': self.variant,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if not governance_approved:
            logger.warning(f"Email failed governance check: {governance_issues}")
            result['escalated'] = True
        
        return result
    
    def _parse_qualification_response(self, response: str) -> Tuple[int, str, str]:
        """
        Parse LLM qualification response.
        
        Returns:
            Tuple of (score, decision, reasoning)
        """
        # Extract score
        score_match = re.search(r'[Ss]core:\s*(\d+)', response)
        score = int(score_match.group(1)) if score_match else 50
        score = max(0, min(100, score))  # Clamp to 0-100
        
        # Extract decision
        if 'QUALIFIED' in response.upper() and 'DISQUALIFIED' not in response.upper():
            decision = 'QUALIFIED'
        elif 'DISQUALIFIED' in response.upper():
            decision = 'DISQUALIFIED'
        else:
            decision = 'QUALIFIED' if score >= 60 else 'DISQUALIFIED'
        
        # Extract reasoning
        reasoning_match = re.search(r'[Rr]easoning:\s*(.+?)(?:\n|$)', response, re.DOTALL)
        reasoning = reasoning_match.group(1).strip() if reasoning_match else response[:200]
        
        return score, decision, reasoning
    
    def _check_escalation_rules(
        self,
        lead_data: Dict[str, Any],
        decision: str,
        reasoning: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if lead should be escalated to human review.
        
        Escalation triggers:
        - Competitor mentioned
        - Missing critical data
        - Borderline qualification score
        """
        escalated = False
        reason = None
        
        # Check for competitor mentions
        competitors = ['salesforce', 'hubspot', 'outreach', 'salesloft']
        text_to_check = f"{lead_data.get('company_name', '')} {reasoning}".lower()
        
        for competitor in competitors:
            if competitor in text_to_check:
                escalated = True
                reason = f"Competitor '{competitor}' mentioned"
                break
        
        # Check for missing critical data
        if not lead_data.get('industry') or not lead_data.get('company_size'):
            escalated = True
            reason = "Missing critical lead data"
        
        return escalated, reason
    
    def _check_governance(self, email_content: str) -> Tuple[bool, list]:
        """
        Check email against governance rules.
        
        Returns:
            Tuple of (approved, list of issues)
        """
        issues = []
        
        # Check for pricing discussion (FORBIDDEN)
        pricing_keywords = ['price', 'pricing', 'cost', '$', 'dollar', 'payment', 'fee']
        if any(keyword in email_content.lower() for keyword in pricing_keywords):
            issues.append({
                'rule': 'no_pricing_discussion',
                'severity': 'critical',
                'message': 'Email discusses pricing without approval'
            })
        
        # Check length
        if len(email_content) > 1000:
            issues.append({
                'rule': 'max_length',
                'severity': 'warning',
                'message': 'Email exceeds recommended length'
            })
        
        # Check for required elements
        if not re.search(r'subject:', email_content, re.IGNORECASE):
            issues.append({
                'rule': 'missing_subject',
                'severity': 'warning',
                'message': 'Email missing subject line'
            })
        
        approved = len([i for i in issues if i['severity'] == 'critical']) == 0
        
        return approved, issues
    
    def _fallback_qualification(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback qualification using rule-based logic."""
        score = 50
        
        # Scoring logic
        if lead_data.get('company_size') in ['50-500', '500-2000']:
            score += 20
        if lead_data.get('industry') in ['SaaS', 'Finance', 'Healthcare', 'Technology']:
            score += 20
        if lead_data.get('contact_name') and lead_data.get('contact_email'):
            score += 10
        
        decision = 'QUALIFIED' if score >= 60 else 'DISQUALIFIED'
        
        return {
            'qualified': decision == 'QUALIFIED',
            'score': score,
            'reasoning': 'Rule-based qualification (LLM unavailable)',
            'escalated': False,
            'variant': self.variant,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _fallback_email(self, lead_data: Dict[str, Any]) -> str:
        """Fallback email template."""
        company = lead_data.get('company_name', 'your company')
        name = lead_data.get('contact_name', 'there')
        industry = lead_data.get('industry', 'your industry')
        
        return f"""Subject: Quick question about {company}'s growth

Hi {name},

I noticed {company} is making moves in the {industry} space. We've been helping similar companies streamline their sales operations with AI-powered tools.

Would you be open to a brief 15-minute call next week to explore if this could be valuable for your team?

Best regards,
AI SDR Team"""
