"""
File: main.py
Purpose: FastAPI server entry point for MONAD offline AI backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
import logging

from routes.generate import router as generate_router
from routes.health import router as health_router
from routes.context import router as context_router
from llm_runner import LLMRunner
from dependencies import set_llm_runner
from config import Config

# Load environment variables
load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s"
)
logger = logging.getLogger("monad-backend")

# Global LLM runner instance
llm_runner = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    global llm_runner
    
    # Startup
    logger.info("🚀 Starting MONAD backend...")
    model_path = Config.MODEL_PATH
    if not model_path:
        logger.warning("⚠️ MODEL_PATH not configured, LLM features will be unavailable")
        set_llm_runner(None)
    else:
        logger.info("📦 Loading model from: %s", model_path)
        try:
            llm_runner = LLMRunner(model_path)
            await llm_runner.initialize()
            set_llm_runner(llm_runner)
            logger.info("✅ Model loaded successfully")
        except FileNotFoundError:
            logger.warning(f"⚠️ Model file not found: {model_path}")
            logger.warning("⚠️ Please download the model following MODEL_SETUP.md instructions")
            logger.warning("⚠️ Backend will start in degraded mode (health checks will work, but generation will fail)")
            set_llm_runner(None)
        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM: {str(e)}")
            logger.warning("⚠️ Backend will start in degraded mode")
            set_llm_runner(None)
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down MONAD backend...")
    if llm_runner:
        await llm_runner.cleanup()
    logger.info("✅ Backend shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="MONAD Offline AI Backend",
    description="FastAPI backend for running TinyLlama locally",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate_router, prefix="/api")
app.include_router(health_router, prefix="/api")
app.include_router(context_router, prefix="/api/context")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "MONAD Offline AI Backend", "status": "running"}

# Remove the old get_llm_runner function since we're using dependencies.py

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5005,
        reload=True,
        log_level="info"
    )
