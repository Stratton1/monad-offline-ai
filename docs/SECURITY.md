# MONAD Security Policy

**Version:** 3.7.0  
**Date:** 2025-01-27  
**Status:** Production-Ready

---

## Overview

MONAD is designed with security and privacy as core principles. All data processing happens locally, and no information is transmitted externally without explicit user action.

---

## Encryption at Rest

### Password-Based Encryption
- **Algorithm:** Argon2id (key derivation) + AES-GCM (encryption)
- **Key Derivation:** Argon2id with salt, 3 iterations, 64MB memory
- **Encryption:** AES-GCM with 256-bit keys, 128-bit IV
- **Storage:** Encrypted data stored in localStorage (Tauri) or AppData

### Journal Encryption
- **Separate Passcode:** Journal uses separate passcode with HKDF key derivation
- **Journal Key:** Derived from app master key + journal passcode
- **Scope:** Journal entries encrypted separately from app data

### Data Storage
- **Sensitive Data:** Always encrypted at rest
- **Chat Messages:** Encrypted before saving
- **Conversations:** Encrypted bundles with metadata
- **Registry:** Encrypted chat registry

---

## IPC Security (Tauri)

### Command Allowlist
Only the following IPC commands are exposed to the frontend:

- `ensure_chat_folder` - Create chat folders
- `write_secure_file` - Atomic file writes
- `read_secure_file` - Secure file reads
- `export_pdf` - PDF export (local only)
- `export_rtf` - RTF export (local only)

### Capabilities Configuration
- **Default Permissions:** Minimal (core:default only)
- **Shell Access:** Limited to `open` for file manager
- **Network Access:** None (offline only)

---

## Content Security Policy (CSP)

### CSP Headers
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
font-src 'self' data:;
img-src 'self' data: blob:;
connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*;
```

### Localhost Exception
- **Backend API:** Only localhost connections allowed (backend is local)
- **WebSocket:** Localhost only for real-time features
- **External Resources:** Disallowed (offline operation)

---

## Clipboard Security

### Automatic Scrubbing
- **Sensitive Fields:** Journal entries, passwords automatically scrub clipboard
- **Scrub Delay:** 5 seconds after copy (configurable)
- **On Unmount:** Clipboard cleared when sensitive components unmount

### Clipboard API
- **Availability Check:** Graceful fallback if clipboard API unavailable
- **Error Handling:** Silent failures for clipboard operations
- **Privacy:** No clipboard monitoring or logging

---

## Idle Locking

### Auto-Lock
- **Idle Timeout:** 5 minutes (configurable)
- **Lock Action:** Clear app master key, require password re-entry
- **Journal Lock:** Separate timeout for journal (if unlocked)

### Lock Behavior
- **App Lock:** Requires app password
- **Journal Lock:** Requires journal passcode
- **State Preservation:** UI state preserved, keys cleared

---

## File Operations

### Atomic Writes
- **Process:** Write to temp file → fsync → atomic rename
- **Implementation:** Tauri Rust commands ensure atomicity
- **Error Handling:** Rollback on write failure

### File Permissions
- **Storage:** AppData directory (user-scoped)
- **Permissions:** User-only access (no global read)
- **Encryption:** All saved files encrypted

---

## Audit Logging

### What We Log
- **Operations:** File operations, encryption/decryption events
- **Errors:** Failed operations with error codes
- **Timestamps:** Operation timestamps

### What We Don't Log
- **User Messages:** Never logged (privacy)
- **Passwords/Passcodes:** Never logged (security)
- **Encrypted Content:** Never logged (security)

---

## Security Best Practices

### For Users
1. **Strong Passwords:** Use complex passwords (12+ chars, mixed case, numbers, symbols)
2. **Journal Passcode:** Use different passcode from app password
3. **Secure Storage:** Store exported files securely (unencrypted exports)
4. **Idle Locking:** Enable auto-lock for unattended sessions

### For Developers
1. **IPC Allowlist:** Never expose sensitive commands to frontend
2. **Encryption:** Always encrypt sensitive data at rest
3. **Atomic Writes:** Use atomic write operations for file operations
4. **Clipboard Scrubbing:** Scrub clipboard after sensitive operations
5. **Error Handling:** Never log sensitive data in error messages

---

## Vulnerability Reporting

If you discover a security vulnerability, please:
1. **Do not** create a public issue
2. **Contact:** security@monad.ai (placeholder)
3. **Include:** Detailed description, steps to reproduce, affected versions

---

## Compliance

### Privacy Standards
- **GDPR:** Fully offline, no personal data transmitted
- **CCPA:** No data collection, fully local operation
- **HIPAA:** Encryption at rest (note: not HIPAA-certified, consult healthcare compliance)

### Security Standards
- **OWASP:** Follows OWASP best practices
- **NIST:** Encryption follows NIST guidelines
- **FIPS:** Not FIPS-certified (future roadmap)

---

## Roadmap

### Planned Security Enhancements
- [ ] FIPS 140-2 encryption modules
- [ ] Hardware security module (HSM) support
- [ ] Biometric authentication
- [ ] Secure enclave integration (Apple/Windows)
- [ ] Zero-knowledge sync (future feature)

---

**Last Updated:** 2025-01-27  
**Version:** 3.7.0  
**Status:** Production-Ready

---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"
