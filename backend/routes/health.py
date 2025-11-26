"""
File: health.py
Purpose: Health check endpoint for monitoring backend status
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
import logging
import psutil
import os
from datetime import datetime

from dependencies import get_llm_runner

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    uptime: float
    system_info: Dict[str, Any]
    llm_status: Dict[str, Any]

@router.get("/health", response_model=HealthResponse)
async def health_check(
    llm_runner = Depends(get_llm_runner)
):
    """
    Comprehensive health check endpoint
    
    Returns:
        Health status with system and LLM information
    """
    try:
        # Get system information (non-blocking)
        system_info = {
            "cpu_percent": psutil.cpu_percent(interval=0.1),  # Faster check
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "process_count": len(psutil.pids()),
            "platform": os.uname().sysname if hasattr(os, 'uname') else "unknown"
        }
        
        # Get LLM status with defensive error handling
        llm_status = {}
        overall_status = "healthy"
        
        if llm_runner:
            try:
                llm_status = llm_runner.get_status()
                
                # Check if model is still initializing
                if hasattr(llm_runner, 'is_initializing') and llm_runner.is_initializing:
                    overall_status = "booting"
                    llm_status["message"] = "Loading Phi-3 Medium… this may take several minutes."
                elif not llm_status.get("initialized", False):
                    overall_status = "degraded"
                    llm_status["message"] = "Model not loaded. Backend is operational but inference is unavailable."
                    
            except Exception as status_error:
                logger.warning(f"⚠️ Error getting LLM status: {status_error}")
                llm_status = {
                    "initialized": False,
                    "model_path": None,
                    "model_exists": False,
                    "error": str(status_error),
                    "message": "LLM status check failed"
                }
                overall_status = "degraded"
        else:
            llm_status = {
                "initialized": False,
                "model_path": None,
                "model_exists": False,
                "error": "LLM runner not available",
                "message": "Backend started in degraded mode"
            }
            overall_status = "degraded"
        
        # System health overrides
        if system_info["memory_percent"] > 90:
            overall_status = "warning"
        if system_info["cpu_percent"] > 95:
            overall_status = "critical"
        
        return HealthResponse(
            status=overall_status,
            timestamp=datetime.now().isoformat(),
            uptime=psutil.boot_time(),
            system_info=system_info,
            llm_status=llm_status
        )
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        return HealthResponse(
            status="error",
            timestamp=datetime.now().isoformat(),
            uptime=0,
            system_info={"error": str(e)},
            llm_status={"error": str(e), "message": "Health check error"}
        )

@router.get("/health/simple")
async def simple_health_check():
    """
    Simple health check endpoint for basic monitoring
    
    Returns:
        Simple status response
    """
    return {
        "status": "ok",
        "message": "MONAD backend is running",
        "timestamp": datetime.now().isoformat()
    }
