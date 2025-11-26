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
        self.is_initializing = False
        self.last_error: Optional[str] = None
        self.config = Config()
        self.last_inference_time: Optional[datetime] = None
        
    async def initialize(self, max_retries: int = 2):
        """
        Initialize the LLM model with retry logic
        
        Args:
            max_retries: Maximum number of retry attempts
        """
        if self.is_initializing:
            logger.warning("⚠️ Model initialization already in progress")
            return
            
        self.is_initializing = True
        
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"🔄 Initializing LLM (attempt {attempt}/{max_retries})")
                logger.info(f"   Model: {self.model_path}")
                
                # Validate model path
                if not os.path.exists(self.model_path):
                    raise FileNotFoundError(f"Model file not found: {self.model_path}")
                
                # Log memory before load
                import psutil
                mem_before = psutil.virtual_memory()
                logger.info(f"   Memory before load: {mem_before.percent:.1f}% used ({mem_before.available / (1024**3):.1f} GB available)")
                
                # Check if we have enough memory (need at least 8GB free for Phi-3 Medium)
                if mem_before.available < 6 * 1024**3:  # 6GB minimum
                    logger.warning(f"⚠️ Low memory: {mem_before.available / (1024**3):.1f} GB available")
                    logger.warning("⚠️ Phi-3 Medium requires ~8GB RAM. Model load may fail or be slow.")
                
                # Initialize llama.cpp
                logger.info("🔄 Creating Llama instance (this may take 30-120 seconds for Phi-3 Medium)...")
                load_start = datetime.now()
                
                self.llm = Llama(
                    model_path=self.model_path,
                    n_ctx=self.config.MODEL_CONTEXT_SIZE,
                    n_threads=self.config.MODEL_N_THREADS,
                    verbose=False,
                    n_gpu_layers=0,  # CPU only for stability
                )
                
                load_duration = (datetime.now() - load_start).total_seconds()
                logger.info(f"🔄 Llama instance created in {load_duration:.1f}s, verifying...")
                
                # Log memory after load
                mem_after = psutil.virtual_memory()
                logger.info(f"   Memory after load: {mem_after.percent:.1f}% used ({mem_after.available / (1024**3):.1f} GB available)")
                logger.info(f"   Memory delta: {(mem_before.available - mem_after.available) / (1024**3):.1f} GB")
                
                self.is_initialized = True
                self.is_initializing = False
                self.last_error = None
                logger.info(f"✅ LLM initialized successfully in {load_duration:.1f}s")
                return
                
            except MemoryError as e:
                self.last_error = f"Out of memory: {str(e)}"
                logger.error(f"❌ Memory error during initialization: {e}")
                logger.error("⚠️ Insufficient RAM for Phi-3 Medium. Close other applications and try again.")
                
                if attempt < max_retries:
                    logger.info(f"⏳ Retrying in 5 seconds... (attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(5)
                else:
                    logger.error("❌ Max retries reached. Starting in degraded mode (no LLM).")
                    self.is_initializing = False
                    return
                    
            except FileNotFoundError as e:
                self.last_error = f"Model file not found: {str(e)}"
                logger.error(f"❌ Model file error: {e}")
                logger.error("⚠️ Run: cd backend && ./download_model.sh")
                self.is_initializing = False
                return
                
            except Exception as e:
                self.last_error = str(e)
                logger.error(f"❌ Failed to initialize LLM: {str(e)}")
                
                if attempt < max_retries:
                    logger.info(f"⏳ Retrying in 5 seconds... (attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(5)
                else:
                    logger.error("❌ Max retries reached. Starting in degraded mode (no LLM).")
                    self.is_initializing = False
                    return
        
        self.is_initializing = False
    
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
            
            # Update last inference time
            self.last_inference_time = datetime.now()
            
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
        status = {
            "initialized": self.is_initialized,
            "is_initializing": self.is_initializing,
            "model_path": self.model_path,
            "model_exists": os.path.exists(self.model_path) if self.model_path else False,
            "config": {
                "context_size": self.config.MODEL_CONTEXT_SIZE,
                "n_threads": self.config.MODEL_N_THREADS,
                "max_tokens": self.config.MAX_TOKENS,
                "temperature": self.config.TEMPERATURE
            }
        }
        
        # Add error if exists
        if self.last_error:
            status["error"] = self.last_error
            
        # Add last inference time if available
        if self.last_inference_time:
            status["last_inference"] = self.last_inference_time.isoformat()
            
        return status
