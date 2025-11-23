"""
File: dependencies.py
Purpose: Dependency injection for FastAPI routes
"""

from fastapi import HTTPException
from llm_runner import LLMRunner
from typing import Optional

# Global LLM runner instance
_llm_runner: Optional[LLMRunner] = None

def set_llm_runner(llm_runner: Optional[LLMRunner]):
    """Set the global LLM runner instance"""
    global _llm_runner
    _llm_runner = llm_runner

def get_llm_runner() -> Optional[LLMRunner]:
    """Get the global LLM runner instance (returns None if not initialized)"""
    return _llm_runner
