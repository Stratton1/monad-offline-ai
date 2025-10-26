#!/usr/bin/env python3
"""
File: validate_setup.py
Purpose: Validate MONAD backend setup and dependencies
"""

import sys
import os
import importlib
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} is not supported. Please use Python 3.8+")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\n📦 Checking Python dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'dotenv',
        'llama_cpp',
        'pydantic',
        'psutil'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is not installed")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install them with: pip install -r requirements.txt")
        return False
    
    return True

def check_model_file():
    """Check if the model file exists"""
    print("\n🤖 Checking model file...")
    
    # Try to load from environment
    try:
        from dotenv import load_dotenv
        load_dotenv()
        model_path = os.getenv("MODEL_PATH", "/Users/joseph/OfflineLLM/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
    except:
        model_path = "/Users/joseph/OfflineLLM/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    
    if os.path.exists(model_path):
        file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
        print(f"✅ Model file found: {model_path}")
        print(f"   Size: {file_size:.1f} MB")
        return True
    else:
        print(f"❌ Model file not found: {model_path}")
        print("   Please download the model following MODEL_SETUP.md instructions")
        return False

def check_config():
    """Check configuration files"""
    print("\n⚙️  Checking configuration...")
    
    # Check if .env exists
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if env_file.exists():
        print("✅ .env file exists")
    elif env_example.exists():
        print("⚠️  .env file not found, but env.example exists")
        print("   Copy env.example to .env: cp env.example .env")
    else:
        print("❌ No environment configuration found")
        return False
    
    return True

def check_imports():
    """Check if backend modules can be imported"""
    print("\n🔍 Checking backend modules...")
    
    try:
        from config import Config
        print("✅ config.py imports successfully")
        
        from llm_runner import LLMRunner
        print("✅ llm_runner.py imports successfully")
        
        import routes.generate
        print("✅ routes/generate.py imports successfully")
        
        import routes.health
        print("✅ routes/health.py imports successfully")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    """Main validation function"""
    print("🚀 MONAD Backend Setup Validation")
    print("=" * 40)
    
    checks = [
        check_python_version,
        check_dependencies,
        check_model_file,
        check_config,
        check_imports
    ]
    
    results = []
    for check in checks:
        results.append(check())
    
    print("\n" + "=" * 40)
    print("📊 Validation Summary")
    print("=" * 40)
    
    if all(results):
        print("🎉 All checks passed! MONAD backend is ready to run.")
        print("\nNext steps:")
        print("1. Start the backend: python main.py")
        print("2. Or run the desktop app: npm run tauri:dev")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("- Install dependencies: pip install -r requirements.txt")
        print("- Download model: Follow MODEL_SETUP.md instructions")
        print("- Copy environment: cp env.example .env")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
