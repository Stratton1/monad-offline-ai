#!/bin/bash
# Download TinyLlama model for MONAD

MODELS_DIR="$HOME/Library/Application Support/ai.monad.offline/models"
MODEL_FILE="tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"

echo "📦 Downloading TinyLlama model for MONAD..."
echo "📁 Target directory: $MODELS_DIR"
echo "📄 Model file: $MODEL_FILE"
echo ""

# Create directory if it doesn't exist
mkdir -p "$MODELS_DIR"

# Download the model
echo "⬇️  Downloading model (this may take a few minutes, file is ~637MB)..."
curl -L -o "$MODELS_DIR/$MODEL_FILE" "$MODEL_URL"

# Check if download was successful
if [ -f "$MODELS_DIR/$MODEL_FILE" ]; then
    FILE_SIZE=$(du -h "$MODELS_DIR/$MODEL_FILE" | cut -f1)
    echo ""
    echo "✅ Model downloaded successfully!"
    echo "   Location: $MODELS_DIR/$MODEL_FILE"
    echo "   Size: $FILE_SIZE"
    echo ""
    echo "🚀 You can now restart MONAD and the backend will load the model."
else
    echo ""
    echo "❌ Download failed. Please check your internet connection and try again."
    exit 1
fi
