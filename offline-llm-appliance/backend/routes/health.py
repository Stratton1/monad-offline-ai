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
        # Get system information
        system_info = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "process_count": len(psutil.pids()),
            "platform": os.uname().sysname if hasattr(os, 'uname') else "unknown"
        }
        
        # Get LLM status
        llm_status = {}
        if llm_runner:
            llm_status = llm_runner.get_status()
        else:
            llm_status = {
                "initialized": False,
                "model_path": None,
                "model_exists": False,
                "error": "LLM runner not available"
            }
        
        # Determine overall status
        overall_status = "healthy"
        if not llm_status.get("initialized", False):
            overall_status = "degraded"
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
            llm_status={"error": str(e)}
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
