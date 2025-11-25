"""
File: config.py
Purpose: Configuration settings for MONAD backend
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from paths import get_models_dir, get_app_data_dir, ensure_app_dirs

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for MONAD backend"""
    
    # Model configuration
    ensure_app_dirs()
    _models_dir = get_models_dir()
    MODEL_FILENAME = "phi-3-medium-128k-instruct-q4_k_m.gguf"
    _env_model = os.getenv("MODEL_PATH")
    if _env_model:
        _model_candidate = Path(_env_model)
        MODEL_PATH = str(_model_candidate if _model_candidate.is_absolute() else _models_dir / _model_candidate)
    else:
        MODEL_PATH = str(_models_dir / MODEL_FILENAME)
    MODEL_CONTEXT_SIZE = int(os.getenv("CONTEXT_LENGTH", "4096"))
    MODEL_N_THREADS = int(os.getenv("MODEL_N_THREADS", "4"))
    
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "5005"))
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
