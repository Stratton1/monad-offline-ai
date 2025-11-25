#!/bin/bash
# Download Phi-3 Medium 128K Instruct model for MONAD

MODELS_DIR="$HOME/Library/Application Support/ai.monad.offline/models"
MODEL_FILE="phi-3-medium-128k-instruct-q4_k_m.gguf"
MODEL_URL="https://huggingface.co/microsoft/Phi-3-medium-128k-instruct-gguf/resolve/main/Phi-3-medium-128k-instruct-Q4_K_M.gguf"

echo "📦 Downloading Phi-3 Medium 128K Instruct (Q4_K_M) model for MONAD..."
echo "📁 Target directory: $MODELS_DIR"
echo "📄 Model file: $MODEL_FILE"
echo ""
echo "ℹ️  This is a 14B parameter model quantized to 4-bit."
echo "ℹ️  File size: ~8.5GB - This download may take 15-30 minutes depending on your connection."
echo ""

# Create directory if it doesn't exist
mkdir -p "$MODELS_DIR"

# Download the model with progress indicator
echo "⬇️  Starting download..."
echo ""
curl -L --progress-bar -o "$MODELS_DIR/$MODEL_FILE" "$MODEL_URL"

# Check if download was successful
if [ -f "$MODELS_DIR/$MODEL_FILE" ]; then
    FILE_SIZE=$(du -h "$MODELS_DIR/$MODEL_FILE" | cut -f1)
    echo ""
    echo "✅ Model downloaded successfully!"
    echo "   Location: $MODELS_DIR/$MODEL_FILE"
    echo "   Size: $FILE_SIZE"
    echo ""
    echo "🚀 You can now restart MONAD and the backend will load Phi-3 Medium."
    echo ""
    echo "📊 Model Specs:"
    echo "   • Parameters: 14 billion (4-bit quantized)"
    echo "   • Context: 128K tokens"
    echo "   • RAM Required: ~8GB minimum"
    echo ""
else
    echo ""
    echo "❌ Download failed. Please check your internet connection and try again."
    echo "   You can also manually download from:"
    echo "   $MODEL_URL"
    exit 1
fi
