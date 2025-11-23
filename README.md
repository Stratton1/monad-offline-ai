# MONAD v1.0.0 — Secure Offline AI Platform

> **"Untethered Intelligence"** — A production-grade, secure, personalized offline AI assistant that transforms your computer into an intelligent operating system.

**Brand Promise:** "0 bytes leave your device. No subscription. Works on a plane, in a cabin, in an air-gapped lab. Yours. Not rented."

**Quick Links:** [User Guide](docs/USER_GUIDE.md) · [QA Status](docs/QA_STATUS.md) · [Project Structure](docs/PROJECT_STRUCTURE.md) · [Release Notes](docs/RELEASE_NOTES.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)

## 🎯 Overview

MONAD v1.0.0 is a production-grade, secure, personalized offline AI platform that transforms your computer into an intelligent operating system. It remembers you, respects your privacy, and works entirely offline while providing enterprise-grade features and a premium user experience.

Built with Tauri v2 + React + FastAPI.

## ✨ Key Features

### 🎬 **Cinematic Experience**
- **3D Boot Sequence** - Animated Three.js logo with progress tracking
- **Smooth Animations** - Framer Motion powered transitions throughout
- **Premium UI** - Glass morphism, gradients, and professional polish

### 🔐 **Security & Privacy**
- **100% Offline** - Runs completely offline using TinyLlama/Phi-3 models
- **Password Protection** - Optional encryption for sensitive data
- **Privacy Badge** - Real-time security status indicator
- **Local Storage** - All data stays on your device
- **AES-GCM Encryption** - Complete local operation with encryption

### 🧠 **Intelligent Features**
- **Personalized Greetings** - "Hello, Joseph" and "Welcome back"
- **Context Awareness** - File uploads integrate into AI reasoning
- **Interest Tracking** - Dynamic tagging for personalized responses
- **Four Starter Chats**: Everyday, Journal (secure), Pro Studio A/B, Dispatch

### 💬 **Advanced Chat Interface**
- **Typing Indicator** - "MONAD is typing..." with animations
- **Reasoning Toggle** - Standard ⇄ Deep reasoning modes
- **Answer Style Controls** - Concise, Detailed, Creative, Technical
- **Context Meter** - Visual progress bar for conversation length
- **Command Palette** - Ctrl+K for advanced commands

### 📁 **File Management**
- **Import Support** - PDF, DOCX, TXT file processing
- **Export Conversations** - Download chats as text files
- **Context Integration** - Files become part of AI knowledge
- **Autosave** - Conversations saved automatically
- **Secure Library** - Encrypted save/export with PDF/RTF support

### ⚙️ **Professional Controls**
- **Model Switcher** - Toggle between AI models
- **Session Management** - Resume previous conversations
- **Configuration** - 20+ personalization options
- **Keyboard Shortcuts** - Power user efficiency
- **Dashboard Integration** - Chat grid with secure routing and search

## 🚀 Quick Start

### TL;DR
```bash
cd offline-llm-appliance/frontend
npm install && npm run build && npm run tauri:build
```

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- 4GB+ RAM (for AI models)
- Rust (for Tauri desktop builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Stratton1/monad-offline-ai.git
   cd monad-offline-ai/offline-llm-appliance
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Download AI Model**
   ```bash
   cd ../backend
   ./download_model.sh
   # Or manually download tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
   ```

5. **Start the Services (Development)**
   ```bash
   # Terminal 1 - Backend
   cd offline-llm-appliance/backend
   source venv/bin/activate
   python main.py

   # Terminal 2 - Frontend
   cd offline-llm-appliance/frontend
   npm run tauri dev
   ```

6. **Build Desktop App (Production)**
   ```bash
   cd offline-llm-appliance/frontend
   npm run build
   npm run tauri:build
   # Output: src-tauri/target/release/bundle/macos/MONAD.app
   ```

7. **Open MONAD**
   - Development: Tauri window opens automatically
   - Production: Launch the built .app/.dmg/.msi/.deb
   - **Backend auto-launch**: The Python FastAPI backend automatically spawns on app launch
   - Complete the setup wizard
   - Start chatting with your AI assistant!

### Running the Application

The desktop app automatically:
- ✅ Launches the Python backend on startup
- ✅ Bundles all required resources (frontend + backend)
- ✅ Works fully offline (no internet required)
- ✅ Provides diagnostic logs via Cmd+Shift+D (Debug Overlay)

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Components**: Modular React components with TypeScript
- **State Management**: Zustand for chat and configuration
- **Animations**: Framer Motion for smooth transitions
- **3D Graphics**: Three.js for boot sequence
- **Styling**: Tailwind CSS with custom themes

### Backend (Python + FastAPI)
- **API**: FastAPI with async support
- **AI Engine**: TinyLlama and Phi-3 integration via llama.cpp
- **File Processing**: PDF/DOCX/TXT support
- **Security**: Optional encryption and password protection
- **Storage**: Local file system with JSON persistence

### Desktop (Tauri v2)
- **Native Desktop App**: Cross-platform desktop application
- **Automatic Backend Management**: Python FastAPI server starts automatically
- **System Tray Integration**: Minimize to system tray
- **Cross-Platform Support**: macOS, Windows, Linux

### Data Flow
```
User Input → Frontend → Backend API → AI Model → Response → Frontend → User
     ↓
Local Storage ← Configuration ← Setup Wizard ← User Preferences
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
| `PORT` | `5005` | Backend server port |

### Model Requirements

- **Format**: GGUF (recommended: Q4_K_M quantization)
- **Size**: ~1.1B parameters
- **Memory**: ~2GB RAM minimum
- **Storage**: ~1GB disk space

### Advanced Settings
- **Security Level**: Standard vs Secure mode
- **Save Mode**: Always, Ask, or Never save conversations
- **Autosave**: Automatic conversation persistence
- **Typing Indicator**: Show AI typing status
- **Privacy Badge**: Display security status

## 📁 Project Structure

```
offline-llm-appliance/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration
│   ├── llm_runner.py       # LLM execution
│   ├── routes/             # API endpoints
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── chats/          # Chat interfaces
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities and config
│   │   ├── store/          # State management
│   │   └── utils/          # Utilities
│   ├── src-tauri/          # Tauri desktop app
│   └── package.json        # Frontend dependencies
└── package.json            # Root package.json
```

## 🔌 API Endpoints

### Backend API (http://localhost:5005)

- `GET /` - Root endpoint
- `POST /api/generate` - Generate text response
- `GET /api/health` - Detailed health check
- `GET /api/health/simple` - Simple health check
- `GET /api/generate/status` - Generation service status

### Example API Usage

```bash
# Generate text
curl -X POST http://localhost:5005/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?", "max_tokens": 100}'

# Check health
curl http://localhost:5005/api/health/simple
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
   - Run `./download_model.sh` in the backend directory

2. **Backend won't start**:
   - Verify Python dependencies: `pip install -r backend/requirements.txt`
   - Check port 5005 is available
   - Ensure virtual environment is activated

3. **Frontend build fails**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Reinstall dependencies: `npm install`

4. **Tauri build fails**:
   - Ensure Rust is installed: `rustup --version`
   - Install Tauri CLI: `npm install -g @tauri-apps/cli`
   - Check Cargo is in PATH: `export PATH="$HOME/.cargo/bin:$PATH"`

5. **Tests fail**:
   - Run `npm install` in frontend directory
   - Install Playwright browsers: `npx playwright install --with-deps`
   - Check test setup: `npm run test`

### Logs

- **Backend logs**: Check terminal output when running `python main.py`
- **Frontend logs**: Browser developer tools (F12) or Tauri console
- **Desktop logs**: System console or terminal output
- **Test logs**: Check `test-results/` and `playwright-report/` directories

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
- ✅ **Crypto Fix**: PBKDF2 key derivation (replaced Argon2 WASM)
- ✅ **CORS Fixed**: Backend connection stable
- ✅ **Model Loading**: Full offline AI integration complete

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TinyLlama** - Lightweight language model
- **Phi-3** - Microsoft's efficient language model
- **FastAPI** - Modern Python web framework
- **React** - Frontend framework
- **Tauri** - Desktop application framework
- **Three.js** - 3D graphics library
- **Framer Motion** - Animation library

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](../docs/) directory:

- **[User Guide](../docs/USER_GUIDE.md)** - Getting started and usage instructions
- **[Testing](../docs/TESTING.md)** - Test suite and quality assurance
- **[Security](../docs/SECURITY.md)** - Security features and best practices
- **[Release Notes](../docs/RELEASE_NOTES.md)** - Version history and changelog
- **[Build Verification](../docs/BUILD_VERIFICATION_REPORT.md)** - Build and packaging instructions
- **[Distribution Plan](../docs/DISTRIBUTION_PLAN.md)** - Distribution and deployment strategy
- **[QA Status](../docs/QA_STATUS.md)** - Quality assurance status and test results

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Stratton1/monad-offline-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Stratton1/monad-offline-ai/discussions)

## 🎯 Roadmap

- [ ] **v1.1** - Advanced encryption and security features
- [ ] **v1.2** - Plugin system for custom AI models
- [ ] **v1.3** - Multi-user support and collaboration
- [ ] **v1.4** - Mobile app companion
- [ ] **v1.5** - Cloud sync (optional) for cross-device access

---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"**

*Built with ❤️ for privacy, performance, and personalization.*
