"""
Data validation service for quality checks
"""
import re
from typing import List, Dict, Any
from datetime import datetime


class ValidationService:
    """Service for running data quality checks on leads."""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_lead(lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a single lead record.
        
        Returns dict with:
        - valid: bool
        - issues: list of issue dicts
        """
        issues = []
        
        # Check required fields
        if not lead_data.get('company_name'):
            issues.append({
                'field': 'company_name',
                'issue': 'missing_required_field',
                'severity': 'critical'
            })
        
        if not lead_data.get('contact_email'):
            issues.append({
                'field': 'contact_email',
                'issue': 'missing_required_field',
                'severity': 'critical'
            })
        elif not ValidationService.validate_email(lead_data['contact_email']):
            issues.append({
                'field': 'contact_email',
                'issue': 'invalid_email_format',
                'severity': 'critical'
            })
        
        # Check optional fields quality
        if lead_data.get('company_size'):
            valid_sizes = ['1-50', '50-500', '500-2000', '2000+']
            if lead_data['company_size'] not in valid_sizes:
                issues.append({
                    'field': 'company_size',
                    'issue': 'invalid_value',
                    'severity': 'warning',
                    'detail': f'Expected one of: {valid_sizes}'
                })
        
        return {
            'valid': len([i for i in issues if i['severity'] == 'critical']) == 0,
            'issues': issues
        }
    
    @staticmethod
    def check_duplicates(leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find duplicate leads by email."""
        seen_emails = {}
        duplicates = []
        
        for idx, lead in enumerate(leads):
            email = lead.get('contact_email', '').lower()
            if email in seen_emails:
                duplicates.append({
                    'email': email,
                    'indices': [seen_emails[email], idx],
                    'issue': 'duplicate_email'
                })
            else:
                seen_emails[email] = idx
        
        return duplicates
    
    @staticmethod
    def calculate_quality_score(validation_results: List[Dict[str, Any]]) -> float:
        """
        Calculate overall data quality score (0-100).
        
        Based on:
        - % of records passing validation
        - Severity of issues found
        - Presence of duplicates
        """
        if not validation_results:
            return 0.0
        
        valid_count = sum(1 for r in validation_results if r.get('valid', False))
        total_count = len(validation_results)
        
        # Base score: % of valid records
        base_score = (valid_count / total_count) * 100
        
        # Deduct for warnings
        total_warnings = sum(
            len([i for i in r.get('issues', []) if i['severity'] == 'warning'])
            for r in validation_results
        )
        warning_penalty = min(total_warnings * 0.5, 20)  # Max 20 points penalty
        
        final_score = max(0, base_score - warning_penalty)
        return round(final_score, 2)
    
    @staticmethod
    def run_validation_suite(leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Run complete validation suite on a list of leads.
        
        Returns comprehensive validation report.
        """
        # Validate each lead
        validation_results = [
            ValidationService.validate_lead(lead) for lead in leads
        ]
        
        # Check for duplicates
        duplicates = ValidationService.check_duplicates(leads)
        
        # Calculate quality score
        quality_score = ValidationService.calculate_quality_score(validation_results)
        
        # Count issues by severity
        critical_count = sum(
            len([i for i in r.get('issues', []) if i['severity'] == 'critical'])
            for r in validation_results
        )
        warning_count = sum(
            len([i for i in r.get('issues', []) if i['severity'] == 'warning'])
            for r in validation_results
        )
        
        # Generate summary
        valid_leads = sum(1 for r in validation_results if r.get('valid', False))
        summary = f"{valid_leads}/{len(leads)} leads passed validation. "
        summary += f"Quality score: {quality_score}. "
        summary += f"Critical issues: {critical_count}, Warnings: {warning_count}, Duplicates: {len(duplicates)}"
        
        return {
            'valid': critical_count == 0 and len(duplicates) == 0,
            'quality_score': quality_score,
            'issues': validation_results,
            'duplicates': duplicates,
            'summary': summary,
            'stats': {
                'total_leads': len(leads),
                'valid_leads': valid_leads,
                'critical_issues': critical_count,
                'warnings': warning_count,
                'duplicates': len(duplicates)
            }
        }
