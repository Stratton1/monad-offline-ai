# MONAD Test Suite

**Version:** 3.7.0  
**Date:** 2025-01-27

---

## Overview

Comprehensive test suite for MONAD covering unit tests, integration tests, E2E tests, and security validation.

---

## Test Structure

```
tests/
  setup.ts              # Test setup and mocks
  wizard.spec.ts        # Setup wizard tests
  auth.spec.ts          # Authentication tests
  library.spec.ts       # Library save/export tests
  journal.spec.ts       # Journal chat tests
  prostudio.spec.ts     # ProStudio chat tests
  dispatch.spec.ts      # Dispatch chat tests
  dashboard.spec.ts     # Dashboard navigation tests
  security.spec.ts      # Security validation tests

e2e/
  setup-and-dashboard.spec.ts  # E2E user flows
```

---

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Specific browser
npx playwright test --project=chromium
```

---

## Test Coverage

### Current Coverage

- **Wizard Tests**: Setup flow, chat creation, encryption
- **Auth Tests**: Password hashing, lock/unlock, encryption
- **Library Tests**: Save/export, hashtag indexing, search
- **Journal Tests**: Passcode, autosave, 7-day limit
- **ProStudio Tests**: Guided Composer, preset generation
- **Dispatch Tests**: Interest onboarding, digest generation
- **Dashboard Tests**: Navigation, gating, keyboard shortcuts
- **Security Tests**: Encryption, CSP, IPC, clipboard

### Coverage Goals

- **Unit Coverage**: ≥90%
- **Integration Coverage**: ≥85%
- **E2E Path Coverage**: 100% for critical flows

---

## Test Data

All tests use isolated test data:
- **localStorage**: Cleared before each test
- **Mocks**: Tauri APIs, crypto, clipboard
- **Fixtures**: Test passwords, chat descriptors, messages

---

## CI/CD

GitHub Actions workflow (`.github/workflows/qa.yml`) runs:
- Unit tests on push/PR
- E2E tests with Playwright
- Linting and type checking
- Test result artifacts

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('http://localhost:1420');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

---

## Notes

- Tests are designed to run in CI/CD environments
- E2E tests require dev server running (`npm run dev`)
- Security tests verify no plaintext data leaks
- All tests use isolated environments (localStorage cleared)

---

**Last Updated:** 2025-01-27  
**Version:** 3.7.0

---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"
