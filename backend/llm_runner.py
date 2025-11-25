"""
File: llm_runner.py
Purpose: LLM runner using llama.cpp for Phi-3 Medium model execution
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from llama_cpp import Llama
import os
from datetime import datetime

from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMRunner:
    """LLM runner class for handling Phi-3 Medium model operations"""
    
    def __init__(self, model_path: str):
        """
        Initialize LLM runner
        
        Args:
            model_path: Path to the GGUF model file
        """
        self.model_path = model_path
        self.llm: Optional[Llama] = None
        self.is_initialized = False
        self.config = Config()
        
    async def initialize(self):
        """Initialize the LLM model"""
        try:
            logger.info(f"🔄 Initializing LLM from: {self.model_path}")
            
            # Validate model path
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Initialize llama.cpp - disable Metal for faster startup (can enable later)
            logger.info("🔄 Creating Llama instance (this may take 30-60 seconds)...")
            self.llm = Llama(
                model_path=self.model_path,
                n_ctx=self.config.MODEL_CONTEXT_SIZE,
                n_threads=self.config.MODEL_N_THREADS,
                verbose=False,
                # Disable Metal acceleration to avoid long compilation on first run
                # Can enable later with: n_gpu_layers=1 if os.uname().sysname == "Darwin" else 0,
                n_gpu_layers=0,  # CPU only for now
            )
            logger.info("🔄 Llama instance created, verifying...")
            
            self.is_initialized = True
            logger.info("✅ LLM initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM: {str(e)}")
            raise
    
    async def generate_response(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        repeat_penalty: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate response from the LLM
        
        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            top_p: Top-p sampling parameter
            repeat_penalty: Repeat penalty parameter
            
        Returns:
            Dictionary containing response and metadata
        """
        if not self.is_initialized or not self.llm:
            raise RuntimeError("LLM not initialized")
        
        try:
            start_time = datetime.now()
            
            # Use config defaults if not provided
            max_tokens = max_tokens or self.config.MAX_TOKENS
            temperature = temperature or self.config.TEMPERATURE
            top_p = top_p or self.config.TOP_P
            repeat_penalty = repeat_penalty or self.config.REPEAT_PENALTY
            
            logger.info(f"🤖 Generating response for prompt: {prompt[:50]}...")
            
            # Generate response
            response = self.llm(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                repeat_penalty=repeat_penalty,
                stop=["</s>", "[INST]", "[/INST]"],
                echo=False
            )
            
            end_time = datetime.now()
            generation_time = (end_time - start_time).total_seconds()
            
            # Extract text from response
            generated_text = response["choices"][0]["text"].strip()
            
            result = {
                "response": generated_text,
                "metadata": {
                    "generation_time": generation_time,
                    "tokens_generated": len(generated_text.split()),
                    "model_path": self.model_path,
                    "parameters": {
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        "top_p": top_p,
                        "repeat_penalty": repeat_penalty
                    }
                }
            }
            
            logger.info(f"✅ Generated response in {generation_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error generating response: {str(e)}")
            raise
    
    async def cleanup(self):
        """Cleanup LLM resources"""
        try:
            if self.llm:
                # llama.cpp doesn't have explicit cleanup, but we can clear the reference
                self.llm = None
                self.is_initialized = False
                logger.info("🧹 LLM cleanup completed")
        except Exception as e:
            logger.error(f"❌ Error during cleanup: {str(e)}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status of the LLM runner"""
        return {
            "initialized": self.is_initialized,
            "model_path": self.model_path,
            "model_exists": os.path.exists(self.model_path) if self.model_path else False,
            "config": {
                "context_size": self.config.MODEL_CONTEXT_SIZE,
                "n_threads": self.config.MODEL_N_THREADS,
                "max_tokens": self.config.MAX_TOKENS,
                "temperature": self.config.TEMPERATURE
            }
        }
