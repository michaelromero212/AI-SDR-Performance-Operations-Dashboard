"""
Hugging Face LLM Service
"""
import os
import time
import logging
from typing import Optional, Dict, Any
import requests


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with Hugging Face Inference API."""
    
    def __init__(self):
        self.api_token = os.getenv("HF_API_TOKEN", "")
        self.model = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
        self.max_retries = int(os.getenv("AGENT_MAX_RETRIES", "3"))
        self.timeout = int(os.getenv("AGENT_TIMEOUT", "30"))
        # Updated to use new Hugging Face router endpoint (OpenAI-compatible)
        self.base_url = "https://router.huggingface.co/v1/chat/completions"
        
        if not self.api_token or self.api_token == "your_huggingface_token_here":
            logger.warning("⚠️  Hugging Face API token not configured. LLM features will be limited.")
            self.enabled = False
        else:
            self.enabled = True
            logger.info(f"✅ LLM Service initialized with model: {self.model}")

    
    def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7,
        **kwargs
    ) -> Optional[str]:
        """
        Generate text using Hugging Face Inference API.
        
        Args:
            prompt: The input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-1)
            
        Returns:
            Generated text or None if error
        """
        if not self.enabled:
            logger.warning("LLM Service disabled - no API token")
            return self._fallback_response(prompt)
        
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        # Use OpenAI-compatible chat completions format
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"LLM request attempt {attempt + 1}/{self.max_retries}")
                
                response = requests.post(
                    self.base_url,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Handle OpenAI-compatible response format
                    if "choices" in result and len(result["choices"]) > 0:
                        generated_text = result["choices"][0]["message"]["content"]
                        logger.info("✅ LLM generation successful")
                        return generated_text.strip()
                    else:
                        logger.error(f"Unexpected response format: {result}")
                
                elif response.status_code == 503:
                    # Model is loading
                    logger.info("Model loading, waiting...")
                    time.sleep(10)
                    continue
                
                else:
                    logger.error(f"LLM API error: {response.status_code} - {response.text}")
                    if attempt < self.max_retries - 1:
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    
            except requests.Timeout:
                logger.error(f"Request timeout on attempt {attempt + 1}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                    
            except Exception as e:
                logger.error(f"LLM generation error: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
        
        logger.warning("All LLM attempts failed, using fallback")
        return self._fallback_response(prompt)
    
    def _fallback_response(self, prompt: str) -> str:
        """
        Fallback response when LLM is unavailable.
        Provides rule-based responses for demo purposes.
        """
        logger.info("Using fallback rule-based response")
        
        if "qualify" in prompt.lower() or "score" in prompt.lower():
            return """Based on the provided information:
- Company size and industry are good fit
- Contact information is complete
- Engagement signals are positive
Qualification Score: 75/100
Recommendation: QUALIFIED - Proceed with outreach"""
        
        elif "email" in prompt.lower() or "message" in prompt.lower():
            return """Subject: Quick question about [topic]

Hi [Name],

I noticed [company] is [relevant observation]. We've helped similar companies in [industry] achieve [specific benefit].

Would you be open to a brief call next week to explore if this could be valuable for your team?

Best regards"""
        
        else:
            return "Analysis complete. Proceeding with standard workflow."
    
    def health_check(self) -> Dict[str, Any]:
        """Check if LLM service is available."""
        return {
            "enabled": self.enabled,
            "model": self.model,
            "api_configured": bool(self.api_token and self.api_token != "your_huggingface_token_here"),
            "status": "ready" if self.enabled else "disabled"
        }


# Global instance
llm_service = LLMService()
