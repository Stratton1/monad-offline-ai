"""
File: dependencies.py
Purpose: Dependency injection for FastAPI routes
"""

from fastapi import HTTPException
from llm_runner import LLMRunner

# Global LLM runner instance
_llm_runner: LLMRunner = None

def set_llm_runner(llm_runner: LLMRunner):
    """Set the global LLM runner instance"""
    global _llm_runner
    _llm_runner = llm_runner

def get_llm_runner() -> LLMRunner:
    """Get the global LLM runner instance"""
    if _llm_runner is None:
        raise HTTPException(status_code=503, detail="LLM not initialized")
    return _llm_runner
