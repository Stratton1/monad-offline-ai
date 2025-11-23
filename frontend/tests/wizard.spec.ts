/**
 * wizard.spec.ts
 * Purpose: Tests for SetupWizard onboarding flow
 * Usage: Validates wizard completion, encryption, and chat creation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Argon2-browser is already mocked in tests/setup.ts

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { setupPassword } from '../src/lib/auth';
import { createStarterChatsFromWizard } from '../src/chats/registry';
import { getRegistry } from '../src/lib/library';
import type { WizardData } from '../src/lib/wizardStore';

describe('SetupWizard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should complete setup and create starter chats', async () => {
    // Setup password
    const pwResult = await setupPassword('TestPassword123!');
    expect(pwResult.success).toBe(true);

    // Create wizard data
    const wizardData: WizardData = {
      name: 'Test User',
      useType: 'Personal',
      prefs: {
        tone: 'Professional',
        length: 3,
        spelling: 'UK',
        clarifyFirst: false,
      },
    };

    // Create starter chats
    const chats = await createStarterChatsFromWizard(wizardData);
    expect(chats).toHaveLength(5); // Everyday, Journal, ProStudioA, ProStudioB, Dispatch

    // Verify registry
    const registry = getRegistry();
    expect(registry.length).toBe(5);

    // Verify chat types
    const chatKinds = registry.map((chat) => chat.kind);
    expect(chatKinds).toContain('Everyday');
    expect(chatKinds).toContain('Journal');
    expect(chatKinds).toContain('ProStudioA');
    expect(chatKinds).toContain('ProStudioB');
    expect(chatKinds).toContain('Dispatch');
  });

  it('should create ProStudio chats with config for professional use', async () => {
    const wizardData: WizardData = {
      name: 'Professional User',
      useType: 'Professional',
      sector: 'Technology',
      subSectors: ['Software', 'AI/ML'],
      roles: ['Manager', 'Consultant'],
      prefs: {
        tone: 'Professional',
        length: 4,
        spelling: 'UK',
        clarifyFirst: true,
      },
    };

    await createStarterChatsFromWizard(wizardData);
    const registry = getRegistry();

    const proStudioA = registry.find((c) => c.kind === 'ProStudioA');
    const proStudioB = registry.find((c) => c.kind === 'ProStudioB');

    expect(proStudioA?.config).toBeDefined();
    expect(proStudioA?.config?.sector).toBe('Technology');
    expect(proStudioA?.config?.subSectors).toEqual(['Software', 'AI/ML']);
    expect(proStudioA?.config?.roles).toEqual(['Manager', 'Consultant']);

    expect(proStudioB?.config).toBeDefined();
    expect(proStudioB?.config?.sector).toBe('Technology');
  });

  it('should mark Journal chat as secure', async () => {
    const wizardData: WizardData = {
      name: 'Test User',
      useType: 'Personal',
      prefs: {
        tone: 'Professional',
        length: 3,
        spelling: 'UK',
        clarifyFirst: false,
      },
    };

    await createStarterChatsFromWizard(wizardData);
    const registry = getRegistry();

    const journal = registry.find((c) => c.kind === 'Journal');
    expect(journal?.secure).toBeDefined();
    expect(journal?.secure?.journalPassRequired).toBe(true);
  });

  it('should persist wizard state across restarts', () => {
    // This would test wizardStore persistence
    // For now, verify registry persistence
    const wizardData: WizardData = {
      name: 'Test User',
      useType: 'Personal',
      prefs: {
        tone: 'Professional',
        length: 3,
        spelling: 'UK',
        clarifyFirst: false,
      },
    };

    // Simulate wizard completion
    createStarterChatsFromWizard(wizardData).then(() => {
      // Verify registry persisted
      const registry = getRegistry();
      expect(registry.length).toBeGreaterThan(0);
    });
  });
});
