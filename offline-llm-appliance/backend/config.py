"""
File: config.py
Purpose: Configuration settings for MONAD backend
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for MONAD backend"""
    
    # Model configuration
    MODEL_PATH = os.getenv("MODEL_PATH", "/Users/joseph/OfflineLLM/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
    MODEL_CONTEXT_SIZE = int(os.getenv("CONTEXT_LENGTH", "2048"))
    MODEL_N_THREADS = int(os.getenv("MODEL_N_THREADS", "4"))
    
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # LLM generation parameters
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "512"))
    TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
    TOP_P = float(os.getenv("TOP_P", "0.9"))
    REPEAT_PENALTY = float(os.getenv("REPEAT_PENALTY", "1.1"))
    
    # CORS settings
    CORS_ORIGINS = [
        "http://localhost:1420",  # Tauri dev
        "tauri://localhost",      # Tauri production
        "http://localhost:3000",  # React dev
    ]
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if not os.path.exists(cls.MODEL_PATH):
            raise FileNotFoundError(f"Model file not found: {cls.MODEL_PATH}")
        
        if cls.MODEL_CONTEXT_SIZE <= 0:
            raise ValueError("MODEL_CONTEXT_SIZE must be positive")
        
        if cls.MAX_TOKENS <= 0:
            raise ValueError("MAX_TOKENS must be positive")
        
        if not (0.0 <= cls.TEMPERATURE <= 2.0):
            raise ValueError("TEMPERATURE must be between 0.0 and 2.0")
        
        return True
