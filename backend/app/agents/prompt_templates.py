"""
Prompt templates for AI SDR agent
"""

# Lead qualification prompts
QUALIFICATION_PROMPT_A = """You are an AI Sales Development Representative evaluating a lead.

Lead Information:
- Company: {company_name}
- Industry: {industry}
- Company Size: {company_size}
- Contact: {contact_name} ({contact_email})

Your task:
1. Evaluate if this lead is qualified based on:
   - Company size (prefer 50-500 or 500-2000 employees)
   - Industry fit (SaaS, Finance, Healthcare are good fits)
   - Contact information completeness
2. Assign a qualification score (0-100)
3. Provide a brief recommendation (QUALIFIED or DISQUALIFIED)

Response format:
Score: [0-100]
Recommendation: [QUALIFIED/DISQUALIFIED]
Reasoning: [Brief explanation]
"""

QUALIFICATION_PROMPT_B = """As an AI SDR, assess this sales lead for qualification.

Lead Details:
Company: {company_name}
Industry: {industry}
Size: {company_size}
Contact: {contact_name} <{contact_email}>

Qualification Criteria:
✓ Company size 50+ employees (higher priority for 50-2000)
✓ Industry alignment (SaaS, Tech, Finance, Healthcare)
✓ Complete contact information
✓ No obvious disqualifiers

Provide:
1. Qualification score (0-100)
2. Clear QUALIFIED or DISQUALIFIED decision
3. Key reasoning points

Format:
Score: XX
Decision: QUALIFIED/DISQUALIFIED
Reasoning: [explanation]
"""

# Email generation prompts
EMAIL_PROMPT_A = """Generate a professional, personalized sales outreach email.

Lead Context:
- Company: {company_name}
- Industry: {industry}
- Contact: {contact_name}
- Qualification Score: {score}

Requirements:
- Professional but friendly tone
- Personalize based on industry
- Clear value proposition
- Specific call-to-action
- Keep under 150 words
- Include subject line

Generate the email now:
"""

EMAIL_PROMPT_B = """Create a compelling sales email for this qualified lead.

Company: {company_name}
Industry: {industry}
Contact Person: {contact_name}
Fit Score: {score}/100

Email Guidelines:
1. Catchy subject line
2. Personal greeting
3. Relevant industry insight
4. Clear value proposition  
5. Soft call-to-action (request for brief call)
6. Professional close

Write the complete email:
"""

# Governance check prompts
GOVERNANCE_CHECK_PROMPT = """Review this proposed email for governance compliance.

Email Content:
{email_content}

Check for violations:
1. Does it discuss pricing? (FORBIDDEN without approval)
2. Does it make unverified claims?
3. Does it mention competitors inappropriately?
4. Does it respect data privacy?
5. Is the tone professional and appropriate?

Response format:
Compliant: YES/NO
Issues: [list any violations]
Recommendation: APPROVE/ESCALATE
"""

# Decision template
DECISION_TEMPLATE = """
Lead: {company_name}
Action: {action}
Decision: {decision}
Score: {score}
Reasoning: {reasoning}
Escalated: {escalated}
"""


def get_qualification_prompt(variant: str = "A") -> str:
    """Get qualification prompt by variant."""
    if variant == "B":
        return QUALIFICATION_PROMPT_B
    return QUALIFICATION_PROMPT_A


def get_email_prompt(variant: str = "A") -> str:
    """Get email generation prompt by variant."""
    if variant == "B":
        return EMAIL_PROMPT_B
    return EMAIL_PROMPT_A
