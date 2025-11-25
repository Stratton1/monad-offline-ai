# Model Setup Instructions

## Download Phi-3 Medium 128K Instruct Model

To run MONAD, you need to download the Phi-3 Medium model file. Here are the steps:

### Option 1: Using Provided Script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Make script executable
chmod +x download_model.sh

# Run the download script
./download_model.sh
```

The script will:
- Create the models directory if it doesn't exist (`~/Library/Application Support/ai.monad.offline/models/`)
- Download Phi-3 Medium 128K Instruct (Q4_K_M quantization) from Hugging Face
- Verify the download
- Display model information

**Expected download time:** 15-30 minutes depending on your internet connection  
**File size:** ~8.5GB

### Option 2: Direct Download

```bash
# Create models directory (if not exists)
mkdir -p ~/Library/Application\ Support/ai.monad.offline/models

# Download Phi-3 Medium model (Q4_K_M quantization - optimal balance of size/quality)
cd ~/Library/Application\ Support/ai.monad.offline/models
curl -L -o phi-3-medium-128k-instruct-q4_k_m.gguf \
  "https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-gguf/resolve/main/Phi-3-medium-128k-instruct-Q4_K_M.gguf"
```

### Option 3: Using Hugging Face CLI

```bash
# Install huggingface-hub if not already installed
pip install huggingface-hub

# Download the model
python -c "
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='microsoft/Phi-3-medium-128k-instruct-gguf',
    filename='Phi-3-medium-128k-instruct-Q4_K_M.gguf',
    local_dir='~/Library/Application Support/ai.monad.offline/models',
    local_dir_use_symlinks=False
)
"
```

### Option 4: Manual Download

1. Visit: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-gguf
2. Download `Phi-3-medium-128k-instruct-Q4_K_M.gguf`
3. Place it in `~/Library/Application Support/ai.monad.offline/models/`

## Verify Installation

After downloading, verify the model file:

```bash
ls -lh ~/Library/Application\ Support/ai.monad.offline/models/phi-3-medium-128k-instruct-q4_k_m.gguf
```

The file should be approximately **8.5GB** in size.

You can also verify the model loads correctly:

```bash
cd backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:monad-backend:🚀 Starting MONAD backend...
INFO:monad-backend:📦 Loading model from: .../phi-3-medium-128k-instruct-q4_k_m.gguf
INFO:llm_runner:🔄 Initializing LLM from: .../phi-3-medium-128k-instruct-q4_k_m.gguf
INFO:llm_runner:✅ LLM initialized successfully
INFO:monad-backend:✅ Model loaded successfully
```

## Model Specifications

**Phi-3 Medium 128K Instruct (Q4_K_M)**

- **Parameters:** 14 billion (4-bit quantized)
- **Context Window:** 128,000 tokens
- **Quantization:** Q4_K_M (4-bit mixed quantization)
- **File Size:** ~8.5GB
- **RAM Required:** Minimum 8GB (16GB+ recommended)
- **Inference Speed:** ~5-15 tokens/second on modern CPUs
- **Use Case:** Strong reasoning, writing, analysis, and general conversation

## Model Paths

MONAD expects the model in these locations (platform-dependent):

- **macOS:** `~/Library/Application Support/ai.monad.offline/models/`
- **Windows:** `%APPDATA%\ai.monad.offline\models\`
- **Linux:** `~/.local/share/ai.monad.offline/models/`

The backend will automatically detect the correct path for your platform.

## Troubleshooting

### Model Not Found

If you see "Model file not found" errors:

1. Verify the model exists in the correct directory
2. Check file permissions: `chmod 644 <model_file>`
3. Ensure the filename is correct (lowercase, no spaces)
4. Restart the backend after downloading

### Out of Memory

If the model fails to load due to memory:

1. Close other applications to free RAM
2. Ensure you have at least 8GB RAM available
3. Consider using TinyLlama (1.1B) for lower-end hardware (not recommended for production)

### Slow Inference

If generation is very slow:

1. Reduce `MODEL_N_THREADS` in `backend/env.example`
2. Ensure no other CPU-intensive processes are running
3. Consider upgrading RAM or CPU

## Alternative Models

While MONAD is optimized for Phi-3 Medium, you can use other GGUF models by setting the `MODEL_PATH` environment variable:

```bash
export MODEL_PATH="/path/to/your/model.gguf"
```

Compatible formats:
- Any GGUF quantized model
- Context size should be at least 2048 tokens
- Q4_K_M or Q5_K_M quantization recommended

## Support

For model-related issues:
- Check the [Troubleshooting Guide](../README.md#-troubleshooting)
- Open a [GitHub Issue](https://github.com/Stratton1/monad-offline-ai/issues)
- Join [GitHub Discussions](https://github.com/Stratton1/monad-offline-ai/discussions)
