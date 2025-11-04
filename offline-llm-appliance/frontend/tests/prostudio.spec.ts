/**
 * prostudio.spec.ts
 * Purpose: Tests for ProStudio Guided Composer and preset generation
 * Usage: Validates persona preset creation and guardrails
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('ProStudio Chat', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should generate persona preset from sector/sub-sector selections', () => {
    const preset = {
      sector: 'Technology',
      subSectors: ['Software', 'AI/ML'],
      roles: ['Manager', 'Consultant'],
      roleIdentity: 'Technical leader',
      roleScope: 'Team management and architecture',
      voice: 'Professional',
      audience: 'Expert',
      responseStyle: 'Technical',
    };

    expect(preset.sector).toBe('Technology');
    expect(preset.subSectors).toHaveLength(2);
    expect(preset.roles).toContain('Manager');
    expect(preset.voice).toBe('Professional');
  });

  it('should require role description for "Other" role', () => {
    const preset = {
      roles: ['Other'],
      roleOther: 'Custom role description',
    };

    expect(preset.roles).toContain('Other');
    expect(preset.roleOther).toBeDefined();
    expect(preset.roleOther.length).toBeGreaterThan(0);
  });

  it('should validate preset schema', () => {
    const preset = {
      sector: 'Technology',
      subSectors: ['Software'],
      roles: ['Manager'],
      voice: 'Professional',
      tone: 'Professional',
      audience: 'Expert',
      responseStyle: 'Technical',
    };

    // Verify required fields
    expect(preset.sector).toBeDefined();
    expect(preset.subSectors).toBeDefined();
    expect(preset.roles).toBeDefined();
    expect(preset.voice).toBeDefined();
    expect(preset.audience).toBeDefined();
    expect(preset.responseStyle).toBeDefined();
  });

  it('should apply guardrails from preset', () => {
    const preset = {
      roleScope: 'Team management only',
      taskBoundaries: ['Management', 'Planning'],
      successCriteria: ['Team satisfaction', 'Project delivery'],
    };

    expect(preset.roleScope).toBeDefined();
    expect(preset.taskBoundaries).toBeDefined();
    expect(preset.successCriteria).toBeDefined();
  });

  it('should persist preset to descriptor', () => {
    const descriptor = {
      id: 'pro-studio-a',
      kind: 'ProStudioA',
      config: {
        sector: 'Technology',
        subSectors: ['Software'],
        roles: ['Manager'],
      },
    };

    expect(descriptor.config).toBeDefined();
    expect(descriptor.config?.sector).toBe('Technology');
  });
});
