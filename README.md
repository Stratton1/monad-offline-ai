# MONAD v1.0.0 — Secure Offline AI Platform

> **"Untethered Intelligence"** — A production-grade, secure, personalized offline AI assistant that feels like an intelligent operating system.

**Quick Links:** [User Guide](docs/USER_GUIDE.md) · [QA Status](docs/QA_STATUS.md) · [Project Structure](docs/PROJECT_STRUCTURE.md) · [Release Notes](docs/RELEASE_NOTES.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)

## 🎯 Overview

MONAD v1.0.0 is a production-grade, secure, personalized offline AI platform that transforms your computer into an intelligent operating system. It remembers you, respects your privacy, and works entirely offline while providing enterprise-grade features and a premium user experience.

**Brand Promise:** "0 bytes leave your device. No subscription. Works on a plane, in a cabin, in an air-gapped lab. Yours. Not rented."

## ✨ Key Features

### 🎬 **Cinematic Experience**
- **3D Boot Sequence** - Animated Three.js logo with progress tracking
- **Smooth Animations** - Framer Motion powered transitions throughout
- **Premium UI** - Glass morphism, gradients, and professional polish

### 🔐 **Security & Privacy**
- **Offline-First** - No network dependencies, complete privacy
- **Password Protection** - Optional encryption for sensitive data
- **Privacy Badge** - Real-time security status indicator
- **Local Storage** - All data stays on your device

### 🧠 **Intelligent Features**
- **Personalized Greetings** - "Hello, Joseph" and "Welcome back"
- **Context Awareness** - File uploads integrate into AI reasoning
- **Interest Tracking** - Dynamic tagging for personalized responses

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

### ⚙️ **Professional Controls**
- **Model Switcher** - Toggle between AI models
- **Session Management** - Resume previous conversations
- **Configuration** - 20+ personalization options
- **Keyboard Shortcuts** - Power user efficiency

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
   git clone https://github.com/yourusername/monad-v3.git
   cd monad-v3
   ```

2. **Install Backend Dependencies**
   ```bash
   cd offline-llm-appliance/backend
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
   python download_phi3.py
   ```

5. **Start the Services (Development)**
   ```bash
   # Terminal 1 - Backend
   cd offline-llm-appliance/backend
   source venv/bin/activate
   python main.py

   # Terminal 2 - Frontend
   cd offline-llm-appliance/frontend
   npm run dev
   ```

6. **Build Desktop App (Production)**
   ```bash
   cd offline-llm-appliance/frontend
   npm run build
   npm run tauri:build
   # Output: src-tauri/target/release/bundle/macos/MONAD.app
   ```

7. **Open MONAD**
   - Development: Navigate to http://localhost:1420
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
- **AI Engine**: TinyLlama and Phi-3 integration
- **File Processing**: PDF/DOCX/TXT support
- **Security**: Optional encryption and password protection
- **Storage**: Local file system with JSON persistence

### Data Flow
```
User Input → Frontend → Backend API → AI Model → Response → Frontend → User
     ↓
Local Storage ← Configuration ← Setup Wizard ← User Preferences
```

## 🎨 Customization

### Themes
- **Dark** - Professional dark theme
- **Dim** - Reduced brightness
- **Midnight** - Deep dark theme
- **Light** - Clean light theme

### AI Personalization
- **Name**: Custom AI assistant name
- **Role**: Professional, Creative, Developer, etc.
- **Tone**: Friendly, Technical, Philosophical, etc.
- **Language**: Multiple language support
- **Interests**: Dynamic tagging system
- **Emotion**: Current emotional state
- **Energy**: Energy level calibration

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
MODEL_PATH=/path/to/model.gguf
PORT=8000
SECURITY_LEVEL=standard  # or secure

# Frontend
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=MONAD
```

### Advanced Settings
- **Security Level**: Standard vs Secure mode
- **Save Mode**: Always, Ask, or Never save conversations
- **Autosave**: Automatic conversation persistence
- **Typing Indicator**: Show AI typing status
- **Privacy Badge**: Display security status

## 📁 Project Structure

```
MONAD-v3/
├── offline-llm-appliance/
│   ├── backend/
│   │   ├── routes/          # API endpoints
│   │   ├── data/           # Local data storage
│   │   └── main.py         # FastAPI server
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/ # React components
│   │   │   ├── lib/        # Utilities and config
│   │   │   ├── store/      # State management
│   │   │   └── hooks/      # Custom React hooks
│   │   └── public/         # Static assets
│   └── models/             # AI model files
├── docs/                   # Documentation
└── scripts/               # Build and deployment scripts
```

## 🛠️ Development

### Backend Development
```bash
cd offline-llm-appliance/backend
source venv/bin/activate
python main.py --reload
```

### Frontend Development
```bash
cd offline-llm-appliance/frontend
npm run dev
```

### Building for Production
```bash
# Frontend
cd offline-llm-appliance/frontend
npm run build

# Backend
cd offline-llm-appliance/backend
pip install -r requirements.txt
```

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
- **Three.js** - 3D graphics library
- **Framer Motion** - Animation library

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[User Guide](docs/USER_GUIDE.md)** - Getting started and usage instructions
- **[Testing](docs/TESTING.md)** - Test suite and quality assurance
- **[Security](docs/SECURITY.md)** - Security features and best practices
- **[Release Notes](docs/RELEASE_NOTES.md)** - Version history and changelog
- **[Build Verification](docs/BUILD_VERIFICATION_REPORT.md)** - Build and packaging instructions
- **[Distribution Plan](docs/DISTRIBUTION_PLAN.md)** - Distribution and deployment strategy
- **[QA Status](docs/QA_STATUS.md)** - Quality assurance status and test results

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/monad-v3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/monad-v3/discussions)

## 🎯 Roadmap

- [ ] **v3.1** - Advanced encryption and security features
- [ ] **v3.2** - Plugin system for custom AI models
- [ ] **v3.3** - Multi-user support and collaboration
- [ ] **v3.4** - Mobile app companion
- [ ] **v3.5** - Cloud sync (optional) for cross-device access

---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"**

*Built with ❤️ for privacy, performance, and personalization.*
