# MONAD Smoke Test Checklist

**Version:** 1.0.0  
**Date:** 2025-01-27  
**Purpose:** Manual verification of built application

---

## Pre-Test Setup

- [ ] Build completed successfully
- [ ] Distribution package available (DMG/MSI/DEB)
- [ ] Test environment ready
- [ ] Test data prepared (if needed)

---

## macOS Smoke Test

### Installation

- [ ] Mount DMG successfully
- [ ] Drag MONAD.app to Applications
- [ ] App launches from Applications
- [ ] No security warnings (if signed)

### Boot Sequence

- [ ] Boot screen displays (3-5 seconds)
- [ ] Animation smooth
- [ ] No errors in console

### Setup Wizard (First Run)

- [ ] Wizard displays correctly
- [ ] Step 1: Welcome screen
- [ ] Step 2: Name input
- [ ] Step 3: Password setup (12+ chars required)
- [ ] Step 4: Password confirmation
- [ ] Step 5: Password hint (optional)
- [ ] Step 6: Use type selection (Personal/Professional/Both)
- [ ] Step 7-11: Preferences configuration
- [ ] Summary screen displays correctly
- [ ] "Start" button creates 4 starter chats

### Unlock Screen

- [ ] Unlock screen appears on restart
- [ ] Password input works
- [ ] Wrong password rejected
- [ ] Correct password unlocks app
- [ ] Dashboard displays after unlock

### Dashboard

- [ ] Dashboard displays correctly
- [ ] All 4 chat tiles visible:
  - [ ] Everyday
  - [ ] Journal (locked icon)
  - [ ] ProStudioA
  - [ ] ProStudioB
  - [ ] Dispatch
- [ ] Privacy badge displays ("Offline / Private / Local Model Active")
- [ ] Activity indicators visible
- [ ] Keyboard shortcuts work:
  - [ ] Cmd+K: Command palette
  - [ ] Cmd+F: Search
  - [ ] Cmd+,: Settings
  - [ ] Cmd+L: Lock app

### Everyday Chat

- [ ] Chat opens successfully
- [ ] Message input works
- [ ] Send button works
- [ ] Messages display correctly
- [ ] Save dialog works
- [ ] Export (PDF/RTF) works
- [ ] Tags can be added/removed
- [ ] Folder link works

### Journal Chat

- [ ] Journal tile requires unlock
- [ ] Passcode prompt displays
- [ ] Wrong passcode rejected
- [ ] Correct passcode unlocks journal
- [ ] Journal opens successfully
- [ ] Mood slider works
- [ ] Daily prompt displays
- [ ] Auto-save works
- [ ] 7-day view limit enforced
- [ ] Memory glimpses limited to 3/day

### Pro Studio Chat

- [ ] ProStudioA opens successfully
- [ ] ProStudioB opens successfully
- [ ] Guided Composer displays
- [ ] Sector/sub-sector selection works
- [ ] Role selection works
- [ ] Preset generation works
- [ ] Chat-scoped memory works

### Dispatch Chat

- [ ] Interest onboarding displays (first run)
- [ ] Minimum 10 interests required
- [ ] Selection works
- [ ] Daily digest generates
- [ ] Good news lane displays (3+ items)
- [ ] Source bias slider works

### Save/Export Operations

- [ ] Save dialog opens
- [ ] Title input works
- [ ] Tags can be added
- [ ] Save button works
- [ ] Export PDF works
- [ ] Export RTF works
- [ ] Files saved to correct location

### Security Features

- [ ] Idle auto-lock triggers (≥10 min)
- [ ] Clipboard scrubbing works
- [ ] No plaintext passwords in storage
- [ ] Encrypted data verified
- [ ] IPC allowlist enforced

### Performance

- [ ] App launches in <5 seconds
- [ ] Dashboard loads in <2 seconds
- [ ] Chat switching in <1 second
- [ ] No memory leaks observed
- [ ] No console errors

---

## Windows Smoke Test

### Installation

- [ ] MSI installer runs successfully
- [ ] App installs to Program Files
- [ ] App launches from Start Menu
- [ ] No security warnings (if signed)

### Functionality

- [ ] All macOS functionality tests pass
- [ ] Windows-specific features work
- [ ] Path handling works correctly
- [ ] File associations work (if configured)

---

## Linux Smoke Test

### Installation

- [ ] DEB package installs successfully
- [ ] App launches from terminal: `monad`
- [ ] App launches from application menu
- [ ] No dependency errors

### Functionality

- [ ] All macOS functionality tests pass
- [ ] Linux-specific features work
- [ ] Permissions handled correctly
- [ ] File system operations work

---

## Cross-Platform Verification

### Feature Parity

- [ ] All features work identically across platforms
- [ ] No platform-specific bugs
- [ ] UI consistent across platforms
- [ ] Performance similar across platforms

---

## Issues Found

### Critical Issues

```
[Record any critical issues that block release]
```

### High Priority Issues

```
[Record high-priority issues that should be fixed before release]
```

### Medium Priority Issues

```
[Record medium-priority issues that can be fixed in next release]
```

### Low Priority Issues

```
[Record low-priority issues or enhancement requests]
```

---

## Test Results Summary

### macOS

- **Installation:** [PASS/FAIL]
- **Boot Sequence:** [PASS/FAIL]
- **Setup Wizard:** [PASS/FAIL]
- **Unlock Screen:** [PASS/FAIL]
- **Dashboard:** [PASS/FAIL]
- **Everyday Chat:** [PASS/FAIL]
- **Journal Chat:** [PASS/FAIL]
- **Pro Studio Chat:** [PASS/FAIL]
- **Dispatch Chat:** [PASS/FAIL]
- **Save/Export:** [PASS/FAIL]
- **Security:** [PASS/FAIL]
- **Performance:** [PASS/FAIL]

**Overall:** [PASS/FAIL]

### Windows

**Overall:** [PASS/FAIL]

### Linux

**Overall:** [PASS/FAIL]

---

## Sign-Off

- **Tester:** [Name]
- **Date:** [Date]
- **Platform Tested:** [macOS/Windows/Linux]
- **Overall Status:** [PASS/FAIL]
- **Recommendation:** [APPROVE/REJECT]

---

**Note:** Complete this checklist after building the application. Mark each item as [PASS/FAIL] and provide notes for any failures.


---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"
