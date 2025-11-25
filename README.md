# MONAD — Offline AI Assistant

**Fully private. Runs locally. Zero cloud. Zero tracking.**

> **"Untethered Intelligence"** — A production-grade, self-contained, cross-platform offline AI assistant that runs entirely on your device using local large language models.

**Brand Promise:** "0 bytes leave your device. No subscription. Works on a plane, in a cabin, in an air-gapped lab. Yours. Not rented."

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Project Structure](#-project-structure)
5. [Local Model](#-local-model)
6. [Installation & Setup](#-installation--setup)
7. [Building for Production](#-building-for-production)
8. [Running the Application](#-running-the-application)
9. [Testing](#-testing)
10. [Security & Privacy](#-security--privacy)
11. [Troubleshooting](#-troubleshooting)
12. [Documentation](#-documentation)
13. [Contributing](#-contributing)
14. [Roadmap](#-roadmap)

---

## 🎯 Overview

MONAD is a **standalone offline AI assistant** that runs entirely on your computer without contacting any servers. It uses **Phi-3 Medium Instruct (Q4_K_M)** as the default model — a powerful, modern language model capable of reasoning, writing, analysis, and conversation.

Everything takes place on-device:
- ✅ Model inference
- ✅ Prompt processing
- ✅ Chat history
- ✅ Encryption
- ✅ Local-only storage

The backend manages model loading and inference via llama.cpp.  
The frontend delivers a polished desktop experience via Tauri v2.

## ✨ Key Features

### 1. **100% Offline Execution**
No network calls. No cloud APIs. The entire AI engine runs with llama.cpp locally.

### 2. **Local LLM (Phi-3 Medium)**
- 128k context window
- Strong reasoning ability
- Lightweight enough for laptops
- Quantized for efficient CPU inference

### 3. **Desktop Application (Tauri v2)**
- Native macOS app bundle (`MONAD.app`)
- Secure sandboxed webview
- Fast startup with backend auto-launch
- Hardware-accelerated UI
- Cross-platform support (macOS, Windows, Linux)

### 4. **FastAPI Backend**
- Model loading & lifecycle management
- Chat completion endpoints
- System & health monitoring
- Graceful degradation if model missing

### 5. **Cinematic User Experience**
- **3D Boot Sequence** - Animated Three.js logo with progress tracking
- **Smooth Animations** - Framer Motion powered transitions
- **Premium UI** - Glass morphism, gradients, and professional polish
- **Dark Theme** - Four professional dark variants

### 6. **Security & Privacy**
- **Password Protection** - PBKDF2-based encryption
- **Privacy Badge** - Real-time security status indicator
- **Local Storage** - All data stays on your device
- **No Telemetry** - Zero tracking, zero analytics, zero cloud calls

### 7. **Intelligent Chat Features**
- **Personalized Greetings** - Remembers your name and preferences
- **Typing Indicator** - "MONAD is typing..." with animations
- **Reasoning Toggle** - Standard ⇄ Deep reasoning modes
- **Answer Style Controls** - Concise, Detailed, Creative, Technical
- **Context Meter** - Visual progress bar for conversation length
- **Command Palette** - Ctrl+K/Cmd+K for advanced commands

### 8. **Four Starter Chats**
- **Everyday** - General conversations and tasks
- **Journal** (Secure) - Password-protected, encrypted personal journal
- **Pro Studio A & B** - Professional assistance with guided composer
- **Dispatch** - News digest and current affairs (offline mode)

### 9. **File Management & Context**
- Import PDF, DOCX, TXT files
- Export conversations as text files
- Secure library with encryption
- Autosave and session management

### 10. **Professional Controls**
- Phi-3 Medium 128K model (14B parameters)
- 20+ personalization options
- Keyboard shortcuts for power users
- Dashboard with chat grid and search

## 🤖 Local Model

### Default Model

**Phi-3 Medium 128k Instruct (Q4_K_M quantization)**

- **Size**: ~6.4GB
- **Context**: 128k tokens
- **Parameters**: 14B (quantized to 4-bit)
- **Format**: GGUF
- **Performance**: Strong reasoning, writing, and analysis capabilities
- **Hardware**: Runs efficiently on modern CPUs

### Model Storage Location

macOS:
```
~/Library/Application Support/ai.monad.offline/models/
```

Windows:
```
%APPDATA%\ai.monad.offline\models\
```

Linux:
```
~/.local/share/ai.monad.offline/models/
```

### Download Model

```bash
cd backend
chmod +x download_model.sh
./download_model.sh
```

The script will download Phi-3 Medium to the appropriate directory.

**Note**: If the model is missing, the backend runs in **degraded mode** and the UI displays a clear message with instructions.

---

## 🚀 Installation & Setup

### TL;DR
```bash
cd frontend
npm install && npm run build && npm run tauri:build
```

### Prerequisites

| Component | Requirement                        |
| --------- | ---------------------------------- |
| macOS     | 12+ (Monterey or later)            |
| Node.js   | v18+                               |
| Python    | 3.10–3.12                          |
| Rust      | Latest stable (required for Tauri) |
| RAM       | 8GB+ (16GB+ recommended)           |
| Storage   | 10GB+ free space                   |

### Step-by-Step Installation

#### 1. Install Rust (Required for Tauri)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

On macOS, also install dependencies:
```bash
brew install pkg-config openssl
```

#### 2. Clone the Repository

```bash
git clone https://github.com/Stratton1/monad-offline-ai.git
cd monad-offline-ai
```

#### 3. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 4. Download AI Model (Recommended)

```bash
./download_model.sh
```

This downloads Phi-3 Medium (~6.4GB) to the appropriate location.

**Optional**: Skip this step to run without a model initially (degraded mode).

#### 5. Test Backend (Optional)

```bash
python main.py
```

Backend should start on `http://127.0.0.1:5005`

Press `Ctrl+C` to stop.

#### 6. Setup Frontend

```bash
cd ../frontend
npm install
```

#### 7. Run Development Build

```bash
npm run tauri dev
```

This will:
- Start Vite dev server
- Launch MONAD.app window
- Auto-launch backend (if not already running)

Complete the setup wizard and start chatting!

---

## 🏭 Building for Production

### Build macOS App

```bash
cd frontend
npm run build
npm run tauri build
```

**Output**:
```
frontend/src-tauri/target/release/bundle/macos/MONAD.app
```

This `.app` file is **self-contained** — no server required.

### Build for Other Platforms

**Windows**:
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

**Linux**:
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Distribution Files

After building, you'll find:

| Platform | Output |
|----------|--------|
| macOS | `MONAD.app` (app bundle) + `.dmg` (installer) |
| Windows | `MONAD.exe` + `.msi` (installer) |
| Linux | `monad` (binary) + `.deb` / `.AppImage` |

### Code Signing (macOS)

For public distribution, sign the app:

```bash
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" MONAD.app
```

For notarization and App Store distribution, see [`docs/DISTRIBUTION_PLAN.md`](docs/DISTRIBUTION_PLAN.md).

---

## 🎮 Running the Application

### Development Mode

```bash
cd frontend
npm run tauri dev
```

The desktop app automatically:
- ✅ Launches the Python backend on startup
- ✅ Hot-reloads frontend changes
- ✅ Provides diagnostic logs via Cmd+Shift+D (Debug Overlay)
- ✅ Opens dev tools for debugging

### Production Mode

Double-click `MONAD.app` (or equivalent on Windows/Linux).

The production app:
- ✅ Bundles all required resources (frontend + backend)
- ✅ Works fully offline (no internet required)
- ✅ Auto-launches backend on startup
- ✅ Minimizes to system tray
- ✅ Persists user configuration and chat history

## 🏗️ Architecture

```
┌───────────────────────────────────────────────┐
│                  Tauri Shell                   │
│     (macOS App, Window Manager, Runtimes)      │
└───────────────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────┐
│                 Frontend (React)               │
│ UI, setup wizard, unlock screen, dashboard     │
│ Talks to backend on http://127.0.0.1:5005      │
└───────────────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────┐
│        Backend (FastAPI + llama.cpp)           │
│ Loads Phi-3 Medium model in local RAM          │
│ Handles generation and system health           │
└───────────────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────┐
│          Local Model Files (.gguf)             │
│ Stored under OS app-data folder                │
└───────────────────────────────────────────────┘
```

### Component Details

#### Frontend (React + TypeScript)
- **Components**: Modular React components with TypeScript strict mode
- **State Management**: Zustand for chat and configuration
- **Animations**: Framer Motion for smooth transitions
- **3D Graphics**: Three.js for boot sequence
- **Styling**: Tailwind CSS with custom themes
- **Build System**: Vite for fast development and optimized builds

#### Backend (Python + FastAPI)
- **API**: FastAPI with async support
- **AI Engine**: Phi-3 Medium integration via llama.cpp
- **File Processing**: PDF/DOCX/TXT support
- **Security**: PBKDF2 encryption and password protection
- **Storage**: Local file system with JSON persistence
- **Port**: Runs on `http://127.0.0.1:5005`

#### Desktop (Tauri v2)
- **Native App**: Cross-platform desktop application
- **Auto-Launch**: Python FastAPI server starts automatically
- **System Tray**: Minimize to system tray
- **Platforms**: macOS, Windows, Linux
- **Bundling**: Self-contained `.app` file with all resources

### Data Flow
```
User Input → Frontend → Backend API → AI Model → Response → Frontend → User
     ↓
Local Storage ← Configuration ← Setup Wizard ← User Preferences
```

## ⚙️ Configuration

### Backend Configuration

The backend is configured via environment variables or `backend/config.py`:

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | Auto-detected | Path to GGUF model file |
| `MODEL_CONTEXT_SIZE` | `4096` | Model context window size (Phi-3: 128k capable) |
| `MODEL_N_THREADS` | `4` | Number of CPU threads for inference |
| `MAX_TOKENS` | `512` | Maximum tokens to generate per request |
| `TEMPERATURE` | `0.7` | Sampling temperature (0.0–2.0) |
| `TOP_P` | `0.9` | Top-p (nucleus) sampling parameter |
| `REPEAT_PENALTY` | `1.1` | Repeat penalty to reduce repetition |
| `PORT` | `5005` | Backend server port |
| `HOST` | `127.0.0.1` | Backend server host (localhost only) |

### Frontend Configuration

User preferences are managed through the Setup Wizard and stored locally:

- **Name**: Personalized greeting
- **Role**: Professional Assistant, Creative Partner, Developer Companion, etc.
- **Tone**: Professional, Friendly, Technical, Creative, Concise
- **Language**: English (default), with roadmap for multi-language support
- **Theme**: Dark, Dim, Midnight, Light variants
- **Security Level**: Standard (fast) vs Secure (password-protected)
- **Save Mode**: Always, Ask, or Never save conversations

### Advanced Settings

Access via Settings modal (Cmd+, or click profile icon):

- **Autosave**: Automatic conversation persistence
- **Typing Indicator**: Show AI typing status
- **Privacy Badge**: Display security status
- **Reasoning Mode**: Standard vs Deep reasoning
- **Answer Style**: Concise, Detailed, Creative, Technical
- **Context Meter**: Show conversation length indicator

## 📁 Project Structure

```
monad-offline-ai/
│
├── backend/                 # FastAPI backend + llama.cpp runner
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration management
│   ├── llm_runner.py       # LLM execution engine
│   ├── paths.py            # Path resolution
│   ├── dependencies.py     # Dependency injection
│   ├── routes/             # API endpoints
│   │   ├── generate.py     # Text generation
│   │   ├── health.py       # Health checks
│   │   └── context.py      # Context management
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── download_model.sh   # Model download script
│
├── frontend/               # React UI + Tauri desktop app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── BootScreen.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SetupWizard.tsx
│   │   │   ├── UnlockScreen.tsx
│   │   │   └── chat/       # Chat components
│   │   ├── chats/          # Chat interfaces
│   │   │   ├── everyday/   # General chat
│   │   │   ├── journal/    # Secure journal
│   │   │   ├── pro/        # Pro Studio A/B
│   │   │   └── dispatch/   # News digest
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and config
│   │   │   ├── auth.ts     # Authentication
│   │   │   ├── crypto/     # Encryption (PBKDF2)
│   │   │   └── config.ts   # Configuration
│   │   ├── store/          # Zustand state management
│   │   │   ├── chatStore.ts
│   │   │   └── appSessionStore.ts
│   │   ├── utils/          # Utility functions
│   │   └── main.tsx        # Application entry
│   ├── src-tauri/          # Tauri desktop app
│   │   ├── src/
│   │   │   ├── main.rs     # Rust entry point
│   │   │   └── lib.rs      # Tauri setup
│   │   ├── Cargo.toml      # Rust dependencies
│   │   ├── tauri.conf.json # Tauri configuration
│   │   └── icons/          # App icons
│   ├── public/             # Static assets
│   ├── tests/              # Frontend tests (Vitest + Playwright)
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
│
├── docs/                   # Documentation
│   ├── USER_GUIDE.md
│   ├── QA_STATUS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── RELEASE_NOTES.md
│   └── SECURITY.md
│
├── scripts/                # Utility scripts
│   └── cleanup_project.sh
│
├── INVESTMENT DOCS/        # Business documentation
│
├── README.md               # This document
├── NEXT_ACTIONS.md         # Roadmap and tasks
└── BUILD_READINESS_REPORT.md
```

## 🔌 API Endpoints

### Backend API (http://127.0.0.1:5005)

#### Health & Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with API info |
| `/api/health` | GET | Detailed health check with system info |
| `/api/health/simple` | GET | Simple health check (200 OK) |
| `/api/generate/status` | GET | Generation service status and model info |

#### Text Generation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate text response from prompt |

**Request Body**:
```json
{
  "prompt": "Your prompt here",
  "max_tokens": 512,
  "temperature": 0.7,
  "top_p": 0.9,
  "repeat_penalty": 1.1,
  "stream": false
}
```

**Response**:
```json
{
  "response": "Generated text response",
  "tokens_generated": 42,
  "generation_time_ms": 1234.56
}
```

#### Context Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/context/upload` | POST | Upload file for context (PDF/DOCX/TXT) |
| `/api/context/list` | GET | List uploaded context files |
| `/api/context/clear` | DELETE | Clear context memory |

### Example API Usage

```bash
# Check if backend is running
curl http://127.0.0.1:5005/api/health/simple

# Get detailed system info
curl http://127.0.0.1:5005/api/health

# Generate text
curl -X POST http://127.0.0.1:5005/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing in simple terms",
    "max_tokens": 200,
    "temperature": 0.7
  }'

# Check model status
curl http://127.0.0.1:5005/api/generate/status
```

## 🎨 User Interface

MONAD features a **premium, cinematic desktop experience**:

- **Glassmorphic Design** - Modern glass-like UI with blur effects and gradients
- **Dark Theme** - Professional dark color scheme (4 variants: Dark, Dim, Midnight, Light)
- **3D Boot Sequence** - Animated Three.js logo with progress tracking
- **Smooth Animations** - Framer Motion powered transitions throughout
- **Chat Dashboard** - Grid layout with chat tiles, search, and library
- **Responsive Layout** - Adapts to different window sizes (1280x820+ optimal)
- **Real-time Status** - Live backend connection monitoring
- **Privacy Badge** - Visible security status indicator
- **Settings Modal** - Profile, security, theme, and about tabs
- **Command Palette** - Ctrl+K/Cmd+K for power users
- **System Tray Integration** - Minimize to system tray
- **Keyboard Shortcuts** - Global and chat-specific shortcuts
- **Activity Indicators** - Connection, encryption, and idle status

## 💬 Starter Chats

MONAD includes **four pre-configured chat modes**:

### 1. Everyday Chat
General-purpose AI assistant for everyday conversations and tasks.

**Features**:
- Save and export conversations
- Tag management
- Folder organization
- Quick access shortcuts

### 2. Journal (Secure)
Password-protected personal journal with encryption.

**Features**:
- Separate passcode required
- Auto-save with AES-GCM encryption
- 7-day browsing history
- Mood tracking
- Memory glimpses (3/day default)
- Private and secure

### 3. Pro Studio A & B
Professional assistance for work and projects.

**Features**:
- Guided Composer for persona setup
- Sector/sub-sector/role configuration
- Structured responses
- A/B testing different approaches

### 4. Dispatch
Current affairs and news digest (offline mode).

**Features**:
- Interest onboarding (min 10 tags required)
- Source bias slider (mainstream ↔ independent)
- Good news lane (always 3+ positive stories)
- Daily, Deep Dives, Good News, and My Brief tabs
- Personalized news summaries

## 🧪 Testing

MONAD includes **comprehensive test coverage** with automated QA:

### Test Results

✅ **100% Pass Rate** — All automated tests passing

- **Unit Tests**: 43/43 passing (100%)
- **E2E Tests**: 12/12 passing (100%)
- **Total**: 55/55 passing (100%)

### Test Suites

#### Unit Tests (Vitest)
- Setup Wizard flow and validation
- Authentication and encryption
- Library and context management
- Journal, Pro Studio, Dispatch features
- Dashboard and navigation
- Security (CSP, IPC allowlist, clipboard scrubbing)

#### E2E Tests (Playwright)
- Complete user flows across Chromium, Firefox, WebKit
- Onboarding and setup wizard
- Dashboard navigation
- Journal lock/unlock
- Chat save/export
- Settings and configuration

### Running Tests

```bash
cd frontend

# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run with coverage report
npm run test:coverage

# Install Playwright browsers (first time only)
npx playwright install --with-deps
```

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/qa.yml`) runs on every push/PR:

- ✅ **Test Job**: Unit tests + E2E tests
- ✅ **Lint Job**: ESLint checks
- ✅ **Type Check Job**: TypeScript strict validation
- ✅ **Artifacts**: Test results and coverage reports

### Documentation

- **[QA Status](docs/QA_STATUS.md)** - Detailed test status and coverage
- **[Testing Guide](docs/TESTING.md)** - Writing and running tests
- **[Security](docs/SECURITY.md)** - Security testing and best practices

## 🔐 Security & Privacy

MONAD is built for **maximum local privacy** and security.

### Core Privacy Guarantees

✅ **No Cloud Calls**  
There are **zero outbound network requests**. All AI processing happens locally.

✅ **No Telemetry**  
No analytics, no crash reports, no tracking, no metrics collection.

✅ **No User Accounts**  
No sign-up, no login servers, no cloud sync (by default).

✅ **Fully Offline LLM**  
All inference done on CPU/GPU locally using llama.cpp.

### Security Features

#### 1. **Password Protection**
- Optional password lock for secure mode
- PBKDF2-HMAC-SHA256 key derivation
- 100,000 iterations for strong security

#### 2. **Local Encryption**
- AES-GCM encryption for sensitive data
- Encrypted journal entries
- Secure library storage
- All keys derived locally, never transmitted

#### 3. **Content Security Policy (CSP)**
- Strict CSP headers prevent XSS attacks
- No inline scripts or styles
- No external resource loading

#### 4. **IPC Allowlist**
- Tauri IPC commands use strict allowlist
- Only authorized frontend ↔ backend communication
- Sandboxed webview environment

#### 5. **Clipboard Scrubbing**
- Sensitive data cleared from clipboard after use
- No persistent clipboard history
- Optional clipboard access controls

#### 6. **Secure Storage**
- All user data stored locally on device
- Atomic writes prevent data corruption
- File permissions restricted to user only

### Privacy in Practice

| Feature | Privacy Impact |
|---------|----------------|
| Chat History | Stored locally, never synced |
| User Profile | Local storage only |
| File Uploads | Processed locally, never transmitted |
| Model Inference | 100% on-device, no API calls |
| Configuration | Local JSON files, not cloud-synced |
| Search Queries | Never logged or transmitted |

### Threat Model

MONAD protects against:
- ✅ Network surveillance (no data leaves device)
- ✅ Cloud provider access (no cloud storage)
- ✅ Third-party tracking (no telemetry)
- ✅ Data breaches (local-only storage)
- ✅ Unauthorized access (password protection)

MONAD **does not** protect against:
- ❌ Physical device access (if unlocked)
- ❌ Keyloggers or malware on the host system
- ❌ Screen capture by other applications
- ❌ Full-disk encryption (use OS-level encryption like FileVault)

### Best Practices

For maximum security:
1. Enable **Secure Mode** during setup wizard
2. Use a **strong password** for journal and secure chats
3. Enable **FileVault** (macOS) or **BitLocker** (Windows) for full-disk encryption
4. Keep your OS and security updates current
5. Set **Save Mode** to "Ask" or "Never" for sensitive conversations

See [`docs/SECURITY.md`](docs/SECURITY.md) for complete security documentation.

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Model Not Found

**Symptoms**: Backend starts but shows "Model not loaded" or degraded mode message.

**Solutions**:
```bash
cd backend
./download_model.sh
```

Or manually download model and place in:
- macOS: `~/Library/Application Support/ai.monad.offline/models/`
- Windows: `%APPDATA%\ai.monad.offline\models\`
- Linux: `~/.local/share/ai.monad.offline/models/`

Check file permissions:
```bash
chmod 644 ~/Library/Application\ Support/ai.monad.offline/models/*.gguf
```

#### 2. Backend Won't Start

**Symptoms**: Frontend shows "Backend not available" or connection errors.

**Solutions**:

Check Python version (must be 3.10–3.12):
```bash
python3 --version
```

Verify virtual environment is activated:
```bash
source backend/venv/bin/activate  # macOS/Linux
# or
backend\venv\Scripts\activate     # Windows
```

Reinstall dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Check if port 5005 is available:
```bash
lsof -i :5005  # macOS/Linux
netstat -ano | findstr :5005  # Windows
```

#### 3. Frontend Build Fails

**Symptoms**: `npm run build` or `npm run tauri build` fails.

**Solutions**:

Clear caches and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json dist
npm install
```

Check Node.js version (must be 18+):
```bash
node --version
```

Update TypeScript and Vite:
```bash
npm install --save-dev typescript vite
```

#### 4. Tauri Build Fails

**Symptoms**: Build fails with Rust or Cargo errors.

**Solutions**:

Ensure Rust is installed and up to date:
```bash
rustup --version
rustup update stable
```

Install Tauri dependencies (macOS):
```bash
brew install pkg-config openssl
```

Add Cargo to PATH:
```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

Clean and rebuild:
```bash
cd frontend/src-tauri
cargo clean
cd ../..
npm run tauri build
```

#### 5. Tests Fail

**Symptoms**: `npm run test` or `npm run test:e2e` fails.

**Solutions**:

Install Playwright browsers (first time):
```bash
npx playwright install --with-deps
```

Clear test caches:
```bash
npm run test -- --clearCache
```

Run tests individually to isolate issues:
```bash
npm run test -- wizard.spec.ts
```

#### 6. White Screen on Launch

**Symptoms**: App launches but shows blank white screen.

**Solutions**:

Clear localStorage:
```bash
# macOS
rm -rf ~/Library/Application\ Support/ai.monad.offline/
# Windows
rd /s /q %APPDATA%\ai.monad.offline\
# Linux
rm -rf ~/.local/share/ai.monad.offline/
```

Check browser console (Development mode):
```bash
npm run tauri dev
# Then press Cmd+Shift+I (macOS) or F12 (Windows/Linux)
```

#### 7. App Won't Close

**Symptoms**: App minimizes to tray but won't fully quit.

**Solutions**:

Force quit the app:
- macOS: Cmd+Q or right-click tray icon → Quit
- Windows: Right-click tray icon → Exit
- Linux: `killall monad` or `pkill -9 monad`

Kill backend process:
```bash
# macOS/Linux
pkill -f "python.*main.py"
# Windows
taskkill /F /IM python.exe
```

### Logs & Debugging

#### Backend Logs
```bash
cd backend
source venv/bin/activate
python main.py
# Logs appear in terminal
```

#### Frontend Logs

**Development**:
```bash
npm run tauri dev
# Open dev tools: Cmd+Shift+I (macOS) or F12 (Windows/Linux)
```

**Production**:
Enable Debug Overlay: `Cmd+Shift+D` (macOS) or `Ctrl+Shift+D` (Windows/Linux)

#### Desktop Logs

- **macOS**: `/Users/[username]/Library/Logs/ai.monad.offline/`
- **Windows**: `%LOCALAPPDATA%\ai.monad.offline\logs\`
- **Linux**: `~/.local/share/ai.monad.offline/logs/`

#### Test Logs
```bash
# Unit test output
npm run test

# E2E test reports
open playwright-report/index.html  # macOS
start playwright-report/index.html # Windows
xdg-open playwright-report/index.html # Linux
```

### Getting Help

If issues persist:

1. **Check documentation**: See [`docs/`](docs/) directory
2. **GitHub Issues**: [Report bugs](https://github.com/Stratton1/monad-offline-ai/issues)
3. **GitHub Discussions**: [Ask questions](https://github.com/Stratton1/monad-offline-ai/discussions)
4. **Debug Overlay**: Use Cmd+Shift+D for real-time diagnostics

## ✅ Current Status

**Version 1.0.0 — Production Ready**

MONAD Desktop Application is **fully functional and ready for production deployment**.

### Completed Features

- ✅ **Tauri v2 Integration** - Complete desktop app transformation
- ✅ **Backend Auto-Launch** - Python FastAPI server starts automatically
- ✅ **Phi-3 Medium Support** - Default model with 128k context window
- ✅ **Refined Onboarding** - Streamlined 11-step setup wizard
- ✅ **Four Starter Chats** - Everyday, Journal (secure), Pro Studio A/B, Dispatch
- ✅ **Secure Library** - Encrypted save/export with atomic writes
- ✅ **Dashboard Integration** - Chat grid with secure routing and search
- ✅ **Security Hardening** - CSP, IPC allowlist, clipboard scrubbing
- ✅ **Cross-Platform** - macOS, Windows, Linux support
- ✅ **100% Offline** - Complete local AI processing
- ✅ **Professional UI** - Modern, responsive glassmorphic interface
- ✅ **PBKDF2 Encryption** - Secure key derivation (replaced Argon2)
- ✅ **Stable Backend** - CORS fixed, robust health checks
- ✅ **Full Test Coverage** - 55/55 tests passing (100%)
- ✅ **CI/CD Pipeline** - Automated testing and validation

### Production Readiness

| Area | Status | Notes |
|------|--------|-------|
| Core Functionality | ✅ Ready | All features working |
| Security | ✅ Ready | Full encryption, no telemetry |
| Testing | ✅ Ready | 100% test pass rate |
| Documentation | ✅ Ready | Comprehensive docs |
| Build System | ✅ Ready | Automated builds for all platforms |
| Performance | ✅ Ready | <3s response times |
| Offline Mode | ✅ Ready | Zero network dependencies |

### Known Limitations

- **Model Size**: Phi-3 Medium requires ~8GB RAM minimum (16GB+ recommended)
- **Context Length**: Long conversations may hit context limits
- **Multi-Language**: Currently English-only (roadmap item)
- **Voice Input**: Not yet implemented (roadmap item)
- **Cloud Sync**: Not available (by design, but optional roadmap item)

See [`BUILD_READINESS_REPORT.md`](BUILD_READINESS_REPORT.md) for detailed deployment analysis.

## 🤝 Contributing

We welcome contributions to MONAD! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/monad-offline-ai.git
   cd monad-offline-ai
   ```

2. **Follow the installation steps** in [Installation & Setup](#-installation--setup)

3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes** following our coding standards (see [.cursorrules](.cursorrules))

5. **Run tests**
   ```bash
   cd frontend
   npm run test
   npm run test:e2e
   npm run lint
   ```

6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

8. **Open a Pull Request** with a clear description of your changes

### Contribution Guidelines

- **Follow .cursorrules** - Our comprehensive development rules
- **Write tests** - All new features must include tests
- **Document changes** - Update docs as needed
- **Privacy first** - No telemetry, no cloud calls, no tracking
- **Offline-first** - All features must work offline
- **TypeScript strict mode** - Enable and follow strict typing
- **No `any` types** - Use proper TypeScript types
- **Lint before commit** - Run `npm run lint` and fix all issues

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize privacy and security
- Embrace offline-first philosophy

### What to Contribute

**High Priority**:
- Bug fixes and stability improvements
- Performance optimizations
- Documentation improvements
- Test coverage expansions

**Medium Priority**:
- New chat modes or templates
- UI/UX enhancements
- Additional model support
- Accessibility improvements

**Low Priority**:
- Nice-to-have features
- Experimental capabilities
- Research and prototypes

See [`NEXT_ACTIONS.md`](NEXT_ACTIONS.md) for current roadmap and priorities.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### Getting Started
- **[User Guide](docs/USER_GUIDE.md)** - Complete usage instructions
- **[Model Setup](docs/MODEL_SETUP.md)** - Downloading and configuring AI models
- **[Installation](docs/PROJECT_STRUCTURE.md)** - Detailed installation guide

### Development
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Codebase organization
- **[Testing Guide](docs/TESTING.md)** - Running and writing tests
- **[Build Verification](docs/BUILD_VERIFICATION_REPORT.md)** - Build and packaging

### Deployment
- **[Distribution Plan](docs/DISTRIBUTION_PLAN.md)** - Distribution strategy
- **[Packaging Readiness](docs/PACKAGING_READINESS.md)** - Production packaging
- **[Build Readiness](BUILD_READINESS_REPORT.md)** - Deployment checklist

### Quality & Security
- **[QA Status](docs/QA_STATUS.md)** - Test results and coverage
- **[Security Guide](docs/SECURITY.md)** - Security features and best practices
- **[Project Audit](docs/PROJECT_AUDIT_REPORT.md)** - Comprehensive audit report

### Reference
- **[Release Notes](docs/RELEASE_NOTES.md)** - Version history and changelog
- **[Design System](docs/DESIGN_SYSTEM_PREVIEW.md)** - UI/UX guidelines
- **[Brand Guide](docs/BRAND_GUIDE.md)** - Brand identity and messaging

### Additional Resources
- **[White Screen Analysis](docs/WHITE_SCREEN_ANALYSIS.md)** - Troubleshooting guide
- **[Index](docs/INDEX.md)** - Complete documentation index

---

## 🎯 Roadmap

### Phase 4: UI/UX Polish (Current)
- [ ] Unified design system refinement
- [ ] Animation smoothing and performance
- [ ] Chat layout improvements
- [ ] Settings redesign
- [ ] Multi-agent role support
- [ ] Brand consistency and new icons

### Phase 5: Extended LLM Capabilities
- [ ] Background task processing
- [ ] Document ingestion pipeline
- [ ] Long-context memory system
- [ ] Embedding-based semantic search
- [ ] Voice input support
- [ ] Image understanding (optional offline module)
- [ ] Plugin system for custom AI models

### Phase 6: Distribution & Signing
- [ ] macOS code signing and notarization
- [ ] Windows and Linux production builds
- [ ] Auto-updater implementation
- [ ] Installer packaging (.dmg, .msi, .deb)
- [ ] App Store distribution

### Future Considerations
- [ ] Multi-user support and collaboration
- [ ] Mobile app companion (iOS/Android)
- [ ] Cloud sync (optional, privacy-preserving)
- [ ] Multi-language support
- [ ] Advanced encryption features

See [`NEXT_ACTIONS.md`](NEXT_ACTIONS.md) for detailed tasks and priorities.

---

## 📞 Support

Need help? We're here for you:

- **📖 Documentation**: Check the [`docs/`](docs/) directory
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Stratton1/monad-offline-ai/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/Stratton1/monad-offline-ai/discussions)
- **🔍 Troubleshooting**: See [Troubleshooting](#-troubleshooting) section above
- **🎯 Debug Overlay**: Press Cmd+Shift+D (macOS) or Ctrl+Shift+D (Windows/Linux)

---

## 📝 License

This project is licensed under the MIT License.

**Private development build** — All rights reserved.  
Not licensed for public redistribution.

See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

MONAD is built on the shoulders of giants:

- **[TinyLlama](https://github.com/jzhang38/TinyLlama)** - Community project that inspired our approach
- **[Phi-3](https://azure.microsoft.com/en-us/blog/introducing-phi-3/)** - Microsoft's efficient 14B parameter model
- **[llama.cpp](https://github.com/ggerganov/llama.cpp)** - Fast CPU inference engine
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[React](https://react.dev/)** - Frontend UI library
- **[Tauri](https://tauri.app/)** - Desktop application framework
- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

Special thanks to the open-source community for making private, offline AI accessible to everyone.

---

## 🌟 Star This Repository

If you find MONAD useful, please consider starring the repository to show your support!

[![GitHub stars](https://img.shields.io/github/stars/Stratton1/monad-offline-ai?style=social)](https://github.com/Stratton1/monad-offline-ai/stargazers)

---

<div align="center">

**MONAD v1.0.0 — "Untethered Intelligence"**

*Your AI. Your device. Your privacy.*

**Built with ❤️ for privacy, performance, and personalization.**

[Get Started](#-installation--setup) · [Documentation](docs/) · [Report Bug](https://github.com/Stratton1/monad-offline-ai/issues) · [Request Feature](https://github.com/Stratton1/monad-offline-ai/discussions)

</div>
