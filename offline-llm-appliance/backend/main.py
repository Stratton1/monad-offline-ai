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

from routes.generate import router as generate_router
from routes.health import router as health_router
from routes.context import router as context_router
from llm_runner import LLMRunner
from dependencies import set_llm_runner

# Load environment variables
load_dotenv()

# Global LLM runner instance
llm_runner = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    global llm_runner
    
    # Startup
    print("🚀 Starting MONAD backend...")
    model_path = os.getenv("MODEL_PATH")
    if not model_path:
        raise ValueError("MODEL_PATH environment variable is required")
    
    print(f"📦 Loading model from: {model_path}")
    llm_runner = LLMRunner(model_path)
    await llm_runner.initialize()
    set_llm_runner(llm_runner)
    print("✅ Model loaded successfully")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down MONAD backend...")
    if llm_runner:
        await llm_runner.cleanup()
    print("✅ Backend shutdown complete")

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
    allow_origins=["http://localhost:1420", "tauri://localhost"],  # Tauri dev and production
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
        port=8000,
        reload=True,
        log_level="info"
    )
