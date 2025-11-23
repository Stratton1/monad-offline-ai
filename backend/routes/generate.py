"""
File: generate.py
Purpose: API endpoint for text generation using the LLM
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
import logging

from dependencies import get_llm_runner
from config import Config

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Define MONAD's behaviour and identity
SYSTEM_PROMPT = """You are MONAD — a fully offline AI assistant running locally on this user's device.
You never use the internet, you never send data externally, and you always respond directly and clearly.
Your responses should be concise, factual, and grounded.
If asked "who are you", explain that you are MONAD, a local AI model operating entirely offline.
If asked simple arithmetic (like "what is 2+2"), answer with the exact result only.
Avoid phrases such as "in the given material" or "in the article".
Do not use filler words or defer questions. You are confident, precise, and local.
"""

class GenerateRequest(BaseModel):
    """Request model for text generation"""
    prompt: str = Field(..., description="Input prompt for generation", min_length=1, max_length=2000)
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate", ge=1, le=1024)
    temperature: Optional[float] = Field(None, description="Sampling temperature", ge=0.0, le=2.0)
    top_p: Optional[float] = Field(None, description="Top-p sampling parameter", ge=0.0, le=1.0)
    repeat_penalty: Optional[float] = Field(None, description="Repeat penalty", ge=0.0, le=2.0)

class GenerateResponse(BaseModel):
    """Response model for text generation"""
    response: str
    metadata: dict

@router.post("/generate", response_model=GenerateResponse)
async def generate_text(
    request: GenerateRequest,
    llm_runner = Depends(get_llm_runner)
):
    """
    Generate text using the loaded LLM model
    
    Args:
        request: Generation request parameters
        llm_runner: LLM runner instance
        
    Returns:
        Generated text response with metadata
    """
    try:
        logger.info("📝 Received generation request (prompt length: %s chars)", len(request.prompt))
        
        # Validate LLM runner
        if not llm_runner or not llm_runner.is_initialized:
            model_path = Config.MODEL_PATH
            raise HTTPException(
                status_code=503, 
                detail=f"LLM model not loaded. Model file expected at: {model_path}. Please download the model following MODEL_SETUP.md instructions."
            )
        
        # Construct structured prompt with system message
        combined_prompt = f"{SYSTEM_PROMPT}\n\nUser: {request.prompt.strip()}\nAssistant:"
        
        # Generate response
        result = await llm_runner.generate_response(
            prompt=combined_prompt,
            max_tokens=min(request.max_tokens or Config.MAX_TOKENS, Config.MAX_TOKENS),
            temperature=request.temperature,
            top_p=request.top_p,
            repeat_penalty=request.repeat_penalty
        )
        
        logger.info("✅ Generation completed successfully")
        return GenerateResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )

@router.get("/generate/status")
async def get_generation_status(
    llm_runner = Depends(get_llm_runner)
):
    """
    Get the current status of the generation service
    
    Returns:
        Status information about the LLM runner
    """
    try:
        if not llm_runner:
            return {
                "status": "not_initialized",
                "message": "LLM runner not available"
            }
        
        status = llm_runner.get_status()
        return {
            "status": "ready" if status["initialized"] else "not_ready",
            "details": status
        }
        
    except Exception as e:
        logger.error(f"❌ Status check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Status check failed: {str(e)}"
        )
