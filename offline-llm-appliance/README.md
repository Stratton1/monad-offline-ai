# MONAD v3.7 - Offline AI Desktop Application

MONAD is a production-grade, secure, personalized offline AI desktop application that transforms your computer into an intelligent operating system. Built with Tauri v2 + React + FastAPI.

## 🚀 Features

- **100% Offline**: Runs completely offline using TinyLlama/Phi-3 models
- **Desktop App**: Native cross-platform application using Tauri v2
- **Cinematic Experience**: 3D animated boot sequence with Three.js
- **Personalized AI**: Streamlined 11-step setup wizard for customization
- **Four Starter Chats**: Everyday, Journal (secure), Pro Studio A/B, Dispatch
- **Secure Library**: Encrypted save/export with PDF/RTF support
- **Dashboard Integration**: Chat grid with secure routing and search
- **Security Hardening**: CSP, IPC allowlist, clipboard scrubbing, idle locking
- **Professional UI**: Modern glassmorphic design with 4 theme options
- **Auto-Backend**: Python FastAPI server launches automatically
- **Privacy-First**: Complete local operation with AES-GCM encryption
- **Cross-Platform**: macOS, Windows, Linux support

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
cd frontend
npm run tauri
```

### Production Build
```bash
# Build production desktop application
cd frontend
npm run build
npm run tauri:build
```

The built application will be available in:
- `frontend/src-tauri/target/release/bundle/app/MONAD.app` (macOS)
- `frontend/src-tauri/target/release/bundle/dmg/MONAD_Offline_AI.dmg` (macOS installer)
- `frontend/src-tauri/target/release/bundle/msi/MONAD_Offline_AI.msi` (Windows installer)
- `frontend/src-tauri/target/release/bundle/deb/MONAD_Offline_AI.deb` (Linux installer)

## ✅ Current Status

**MONAD Desktop Application is fully functional and ready for production deployment!**

- ✅ **Tauri v2 Integration**: Complete desktop app transformation
- ✅ **Backend Auto-Launch**: Python FastAPI server starts automatically
- ✅ **Refined Onboarding**: Streamlined 11-step setup wizard
- ✅ **Four Starter Chats**: Everyday, Journal (secure), Pro Studio A/B, Dispatch
- ✅ **Secure Library**: Encrypted save/export with atomic writes
- ✅ **Dashboard Integration**: Chat grid with secure routing
- ✅ **Security Hardening**: CSP, IPC allowlist, clipboard scrubbing
- ✅ **Cross-Platform**: macOS, Windows, Linux support
- ✅ **Offline Operation**: Complete local AI processing
- ✅ **Professional UI**: Modern, responsive interface

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
- **Dark Theme**: Professional dark color scheme (4 variants)
- **Chat Dashboard**: Grid layout with chat tiles and navigation
- **Responsive Layout**: Adapts to different window sizes
- **Real-time Status**: Live backend connection monitoring
- **Search & Library**: Search across chats with tag filters
- **Settings Modal**: Profile, security, theme, and about tabs
- **Activity Indicators**: Connection, encryption, and idle status
- **System Tray**: Minimize to system tray
- **Keyboard Shortcuts**: Global and chat-specific shortcuts

## 💬 Starter Chats

### Everyday Chat
- General conversations and everyday tasks
- Save and export conversations
- Tag management
- Folder organization

### Journal Chat (Secure)
- Separate passcode required
- Auto-save with encryption
- 7-day browsing limit
- Mood tracking
- Memory glimpses (3/day default)

### Pro Studio A & B
- Professional assistance
- Guided Composer for persona setup
- Sector/sub-sector/role configuration
- Structured responses

### Dispatch Chat
- Current affairs and news digest
- Interest onboarding (min 10 required)
- Source bias slider (mainstream ↔ independent)
- Good news lane (always 3+ positive stories)
- Daily, Deep Dives, Good News, and My Brief tabs

## 🧪 Testing

MONAD includes comprehensive test coverage with automated QA:

### Test Results

✅ **100% Pass Rate** — All automated tests passing

- **Unit Tests:** 43/43 passing (100%)
- **E2E Tests:** 12/12 passing (100%)
- **Total Tests:** 55/55 passing (100%)

### Test Suites

- **Unit Tests** (Vitest): Wizard, auth, library, journal, prostudio, dispatch, dashboard, security
- **E2E Tests** (Playwright): Complete user flows across Chromium, Firefox, WebKit
- **Security Tests**: Encryption, CSP, IPC allowlist, clipboard scrubbing

### Running Tests

```bash
# Run all unit tests
cd frontend
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Test Coverage Status

- ✅ **Unit Coverage**: 100% passing (43/43 tests)
- ✅ **E2E Coverage**: 100% passing (12/12 tests)
- ✅ **E2E Path Coverage**: 100% for onboarding, dashboard, journal lock, save/export

### CI/CD

GitHub Actions workflow (`.github/workflows/qa.yml`) runs on push/PR:
- **Test Job**: Unit tests + E2E tests
- **Lint Job**: ESLint checks
- **Type Check Job**: TypeScript validation
- **Artifacts**: Test results and coverage reports

See [`docs/QA_STATUS.md`](../docs/QA_STATUS.md) for detailed test status and coverage.  
See [`docs/PACKAGING_READINESS.md`](../docs/PACKAGING_READINESS.md) for packaging instructions.

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

5. **Tests fail**:
   - Run `npm install` in frontend directory
   - Install Playwright browsers: `npx playwright install --with-deps`
   - Check test setup: `npm run test`

### Logs

- **Backend logs**: Check terminal output when running `npm run start:backend`
- **Frontend logs**: Browser developer tools (F12)
- **Desktop logs**: System console or terminal output
- **Test logs**: Check `test-results/` and `playwright-report/` directories

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
