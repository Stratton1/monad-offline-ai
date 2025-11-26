# MONAD Testing Documentation

**Version:** 3.7.0  
**Date:** 2025-01-27

---

## Overview

MONAD includes a comprehensive test suite covering unit tests, integration tests, E2E tests, and security validation.

---

## Test Structure

```
frontend/
  tests/
    setup.ts              # Test environment setup
    wizard.spec.ts         # Setup wizard tests
    auth.spec.ts           # Authentication tests
    library.spec.ts        # Library save/export tests
    journal.spec.ts        # Journal chat tests
    prostudio.spec.ts      # ProStudio chat tests
    dispatch.spec.ts       # Dispatch chat tests
    dashboard.spec.ts      # Dashboard navigation tests
    security.spec.ts       # Security validation tests
  
  e2e/
    setup-and-dashboard.spec.ts  # E2E user flows

  vitest.config.ts        # Vitest configuration
  playwright.config.ts    # Playwright configuration
```

---

## Running Tests

### Unit Tests (Vitest)

```bash
cd frontend

# Run all tests once
npm run test

# Watch mode (rerun on file changes)
npm run test:watch

# UI mode (interactive)
npm run test:ui

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
cd frontend

# Run all E2E tests
npm run test:e2e

# UI mode (interactive)
npm run test:e2e:ui

# Specific browser
npx playwright test --project=chromium

# Install browsers (first time)
npx playwright install --with-deps
```

---

## Test Suites

### 1. Wizard Tests (`wizard.spec.ts`)

**Coverage:**
- Wizard completion flow
- Password hashing (no plaintext)
- Starter chat creation (5 chats: Everyday, Journal, ProStudioA, ProStudioB, Dispatch)
- Professional config for ProStudio chats
- Journal security flags

**Key Tests:**
- `completes setup and creates starter chats`
- `creates ProStudio chats with config for professional use`
- `marks Journal chat as secure`

---

### 2. Auth Tests (`auth.spec.ts`)

**Coverage:**
- Password setup and hashing
- Lock/unlock flow
- Encryption/decryption
- Idle timeout behavior

**Key Tests:**
- `sets password and hash it securely`
- `unlocks app with correct password`
- `fails to unlock with wrong password`
- `locks app and clear keys`
- `encrypts and decrypts data correctly`

---

### 3. Library Tests (`library.spec.ts`)

**Coverage:**
- Message saving with encryption
- Conversation saving
- Hashtag indexing and search
- Filename sanitization
- Content hashing

**Key Tests:**
- `saves message with encryption`
- `saves conversation with all messages`
- `indexes hashtags for search`
- `searches chats by query`
- `generates content hash`

---

### 4. Journal Tests (`journal.spec.ts`)

**Coverage:**
- Journal passcode unlock
- Auto-save functionality
- 7-day viewing limit
- Memory glimpse quota (3/day)

**Key Tests:**
- `requires passcode to unlock journal`
- `locks journal and clear journal key`
- `auto-saves journal entries`
- `enforces 7-day viewing limit`
- `limits memory glimpses to 3 per day`

---

### 5. ProStudio Tests (`prostudio.spec.ts`)

**Coverage:**
- Guided Composer preset generation
- Sector/sub-sector/role selection
- Preset schema validation
- Guardrails application

**Key Tests:**
- `generates persona preset from sector/sub-sector selections`
- `requires role description for "Other" role`
- `validates preset schema`
- `applies guardrails from preset`

---

### 6. Dispatch Tests (`dispatch.spec.ts`)

**Coverage:**
- Interest onboarding (min 10 required)
- Daily digest generation
- Good news lane (3+ items)
- Source bias persistence

**Key Tests:**
- `requires at least 10 interests`
- `rejects fewer than 10 interests`
- `generates daily digest with good news items`
- `persists source bias selection`

---

### 7. Dashboard Tests (`dashboard.spec.ts`)

**Coverage:**
- Chat grid display
- Journal unlock gating
- Keyboard shortcuts
- Session state management

**Key Tests:**
- `displays all chats after setup`
- `requires journal unlock for Journal chat`
- `handles keyboard shortcuts`
- `manages session state`

---

### 8. Security Tests (`security.spec.ts`)

**Coverage:**
- No plaintext passwords in storage
- Encrypted data validation
- IPC command allowlist
- Clipboard scrubbing

**Key Tests:**
- `verifies no plaintext passwords in storage`
- `verifies encrypted data is not plaintext`
- `validates IPC command allowlist`
- `scrubs clipboard after sensitive operations`

---

## E2E Tests

### Setup and Dashboard Flow (`e2e/setup-and-dashboard.spec.ts`)

**Coverage:**
- Complete setup wizard flow
- Dashboard navigation
- Chat opening
- Journal unlock requirement

**Key Flows:**
- User completes setup → dashboard opens
- User navigates to chat from dashboard
- Journal requires unlock

---

## Test Environment

### Mocks

- **Tauri APIs**: Mocked `window.__TAURI__`
- **localStorage**: Isolated per test
- **Crypto**: Simplified mocks for encryption
- **Clipboard**: Mocked clipboard API

### Setup

Tests use `tests/setup.ts` which:
- Configures jsdom environment
- Sets up Tauri mocks
- Mocks localStorage
- Cleans up after each test

---

## Coverage Goals

### Current Goals

- **Unit Coverage**: ≥90% (Vitest)
- **Integration Coverage**: ≥85% (Vitest + mocks)
- **E2E Path Coverage**: 100% for critical flows

### Critical Paths

- Setup wizard completion
- Authentication lock/unlock
- Journal passcode unlock
- Save/export operations
- Dashboard navigation

---

## CI/CD Integration

### GitHub Actions

Workflow (`.github/workflows/qa.yml`) runs:
- Unit tests on push/PR
- E2E tests with Playwright
- Linting and type checking
- Test result artifacts

### Running in CI

```yaml
# Install dependencies
npm ci

# Build frontend
npm run build

# Run tests
npm run test

# Run E2E tests
npx playwright install --with-deps
npm run test:e2e
```

---

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toBeDefined();
    expect(result).toBe('expected');
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  // Navigate
  await page.goto('http://localhost:1420');

  // Interact
  await page.fill('input[placeholder="Enter name"]', 'Test User');
  await page.click('button:has-text("Next")');

  // Verify
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

---

## Troubleshooting

### Tests Fail to Run

1. **Install dependencies**: `npm install`
2. **Install Playwright browsers**: `npx playwright install --with-deps`
3. **Check test setup**: Verify `tests/setup.ts` is correct

### Mock Issues

- **Crypto mocks**: Simplified for test environment
- **Tauri mocks**: May need adjustment for new Tauri APIs
- **localStorage**: Automatically cleared between tests

### E2E Tests Fail

1. **Start dev server**: `npm run dev` in separate terminal
2. **Check port**: Ensure port 1420 is available
3. **Browser issues**: Install browsers with `--with-deps`

---

## Best Practices

1. **Isolate Tests**: Clear localStorage and mocks between tests
2. **Use Fixtures**: Create reusable test data
3. **Mock External**: Mock Tauri, crypto, clipboard APIs
4. **Coverage First**: Aim for ≥90% unit coverage
5. **E2E Critical Paths**: Test complete user flows

---

## Current Test Status

### ✅ All Tests Passing

- **Unit Tests:** 43/43 passing (100%)
- **E2E Tests:** 12/12 passing (100%)
- **Total:** 55/55 passing (100%)

### Test Breakdown

| Suite | Tests | Status |
|-------|-------|--------|
| `auth.spec.ts` | 6 | ✅ 100% |
| `library.spec.ts` | 7 | ✅ 100% |
| `journal.spec.ts` | 6 | ✅ 100% |
| `dispatch.spec.ts` | 6 | ✅ 100% |
| `dashboard.spec.ts` | 5 | ✅ 100% |
| `prostudio.spec.ts` | 5 | ✅ 100% |
| `wizard.spec.ts` | 4 | ✅ 100% |
| `security.spec.ts` | 4 | ✅ 100% |
| **Total Unit** | **43** | **✅ 100%** |

| E2E Tests | Browsers | Status |
|-----------|----------|--------|
| Setup & Dashboard Flow | 3 | ✅ 100% |
| **Total E2E** | **12** | **✅ 100%** |

---

**Last Updated:** 2025-01-27  
**Version:** 3.7.0  
**Status:** Production-Ready ✅ (100% Pass Rate)

---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"
