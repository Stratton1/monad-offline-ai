# Model Setup Instructions

## Download TinyLlama Model

To run MONAD, you need to download the TinyLlama model file. Here are the steps:

### Option 1: Direct Download (Recommended)

```bash
# Create models directory (if not exists)
mkdir -p /Users/joseph/OfflineLLM/models

# Download TinyLlama model (Q4_K_M quantization - good balance of size/quality)
cd /Users/joseph/OfflineLLM/models
curl -L -o tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf \
  "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
```

### Option 2: Using Hugging Face CLI

```bash
# Install huggingface-hub if not already installed
pip install huggingface-hub

# Download the model
python -c "
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF',
    filename='tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    local_dir='/Users/joseph/OfflineLLM/models'
)
"
```

### Option 3: Manual Download

1. Visit: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
2. Download `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`
3. Place it in `/Users/joseph/OfflineLLM/models/`

## Verify Installation

After downloading, verify the model file:

```bash
ls -la /Users/joseph/OfflineLLM/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
```

The file should be approximately 637MB in size.

## Alternative Models

You can also use other GGUF models by updating the `MODEL_PATH` in your `.env` file:

- **TinyLlama Q4_K_M**: `tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf` (637MB)
- **TinyLlama Q8_0**: `tinyllama-1.1b-chat-v1.0.Q8_0.gguf` (1.1GB) - Better quality
- **TinyLlama Q2_K**: `tinyllama-1.1b-chat-v1.0.Q2_K.gguf` (448MB) - Smaller size

## Troubleshooting

### Model Not Found Error
If you get a "Model file not found" error:
1. Check the file path in your `.env` file
2. Ensure the file exists: `ls -la /Users/joseph/OfflineLLM/models/`
3. Verify file permissions: `chmod 644 /Users/joseph/OfflineLLM/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`

### Download Issues
If the download fails:
1. Check your internet connection
2. Try using a VPN if in a restricted region
3. Use the manual download option from Hugging Face website
4. Try a different quantization (Q2_K for smaller size)

### Memory Issues
If you experience memory issues:
1. Use Q2_K quantization for lower memory usage
2. Reduce `MODEL_CONTEXT_SIZE` in `.env` (try 1024)
3. Reduce `MODEL_N_THREADS` in `.env` (try 2)

## Next Steps

Once the model is downloaded:
1. Copy `env` to `.env`: `cp env .env`
2. Start the application: `npm run tauri:dev`
3. The backend will automatically load the model on startup
