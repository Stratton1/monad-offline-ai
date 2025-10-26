# MONAD - Offline AI Desktop Application

MONAD is a powerful offline AI desktop application that runs a local LLM (TinyLlama) completely offline with a professional desktop chat UI. Built with Tauri + React + FastAPI.

## 🚀 Features

- **100% Offline**: Runs completely offline using TinyLlama model
- **Professional UI**: Modern glassmorphic design with dark theme
- **Desktop App**: Native desktop application using Tauri
- **Fast Performance**: Optimized for local inference with Metal acceleration
- **Real-time Chat**: Smooth chat interface with typing indicators
- **System Monitoring**: Built-in system status and health monitoring

## 🏗️ Architecture

### Components

1. **Backend** (`/backend`) - FastAPI server handling LLM inference
   - `main.py` - FastAPI application entry point
   - `config.py` - Configuration management
   - `llm_runner.py` - LLM execution using llama.cpp
   - `routes/` - API endpoints for generation and health

2. **Frontend** (`/frontend`) - React + TypeScript + Vite interface
   - Premium glassmorphic UI with dark theme
   - Real-time chat interface
   - System status monitoring
   - Responsive design

3. **Desktop** (`/desktop`) - Tauri wrapper
   - Native desktop application
   - Automatic backend management
   - System tray integration
   - Cross-platform support

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Rust** (for Tauri)
- **TinyLlama Model**: Download the GGUF model file to `/Users/joseph/OfflineLLM/models/`

## 🛠️ Installation

1. **Clone and setup**:
   ```bash
   cd ~/OfflineLLM/offline-llm-appliance
   npm run install:all
   ```

2. **Download TinyLlama model**:
   ```bash
   mkdir -p /Users/joseph/OfflineLLM/models
   # Download tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf to the models directory
   ```

3. **Configure environment**:
   ```bash
   cp env .env
   # Edit .env if needed to adjust model path or settings
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Start the desktop app in development mode
npm run tauri:dev
```

### Production Build
```bash
# Build the frontend
npm run build

# Build the desktop application
npm run tauri:build
```

### Backend Only
```bash
# Run just the FastAPI backend
npm run start:backend
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | `/Users/joseph/OfflineLLM/models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf` | Path to GGUF model file |
| `MODEL_CONTEXT_SIZE` | `2048` | Model context window size |
| `MODEL_N_THREADS` | `4` | Number of CPU threads for inference |
| `MAX_TOKENS` | `512` | Maximum tokens to generate |
| `TEMPERATURE` | `0.7` | Sampling temperature |
| `TOP_P` | `0.9` | Top-p sampling parameter |
| `REPEAT_PENALTY` | `1.1` | Repeat penalty |

### Model Requirements

- **Format**: GGUF (recommended: Q4_K_M quantization)
- **Size**: ~1.1B parameters
- **Memory**: ~2GB RAM minimum
- **Storage**: ~1GB disk space

## 📁 Project Structure

```
offline-llm-appliance/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration
│   ├── llm_runner.py       # LLM execution
│   ├── routes/             # API endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # State management
│   │   └── utils/          # Utilities
│   └── package.json        # Frontend dependencies
├── desktop/                # Tauri desktop app
│   └── src-tauri/          # Rust source
└── package.json            # Root package.json
```

## 🔌 API Endpoints

### Backend API (http://localhost:8000)

- `GET /` - Root endpoint
- `POST /api/generate` - Generate text response
- `GET /api/health` - Detailed health check
- `GET /api/health/simple` - Simple health check
- `GET /api/generate/status` - Generation service status

### Example API Usage

```bash
# Generate text
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?", "max_tokens": 100}'

# Check health
curl http://localhost:8000/api/health/simple
```

## 🎨 UI Features

- **Glassmorphic Design**: Modern glass-like UI with blur effects
- **Dark Theme**: Professional dark color scheme
- **Responsive Layout**: Adapts to different window sizes
- **Real-time Status**: Live backend connection monitoring
- **System Tray**: Minimize to system tray
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

## 🐛 Troubleshooting

### Common Issues

1. **Model not found**:
   - Ensure the model file exists at the specified path
   - Check file permissions

2. **Backend won't start**:
   - Verify Python dependencies: `pip install -r backend/requirements.txt`
   - Check port 8000 is available

3. **Frontend build fails**:
   - Clear node_modules: `npm run clean`
   - Reinstall dependencies: `npm run install:all`

4. **Tauri build fails**:
   - Ensure Rust is installed: `rustup --version`
   - Install Tauri CLI: `npm install -g @tauri-apps/cli`

### Logs

- **Backend logs**: Check terminal output when running `npm run start:backend`
- **Frontend logs**: Browser developer tools (F12)
- **Desktop logs**: System console or terminal output

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the logs for error messages
- Ensure all prerequisites are met
- Verify model file is correctly placed

---

**MONAD v1.0.0** - Your offline AI companion
