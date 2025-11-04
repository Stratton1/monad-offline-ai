/**
 * validation.ts
 * Purpose: Validation schemas using Zod for wizard inputs and forms
 * Usage: Used by SetupWizard and other forms to validate user input
 * Privacy: All validation happens locally, no external calls
 */

import { z } from 'zod';

/**
 * Name validation schema
 * Requirements: min 2 chars, alpha + spaces
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces');

/**
 * Password validation schema
 * Requirements: min 12 chars, must include upper/lower/digit/symbol
 */
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol');

/**
 * Use type schema
 */
export const useTypeSchema = z.enum(['Personal', 'Professional', 'Both']);

/**
 * Sector schema (for Professional/Both)
 */
export const sectorSchema = z.string().min(1, 'Sector is required');

/**
 * Sub-sector schema (multi-select, min 1 when required)
 */
export const subSectorsSchema = z.array(z.string()).min(1, 'At least one sub-sector is required');

/**
 * Role schema (multi-select with optional free text)
 * If includes "Other", roleOther must be provided
 */
export const rolesSchema = z.array(z.string()).min(1, 'At least one role is required');

/**
 * Tone preference schema
 */
export const toneSchema = z.enum([
  'Professional',
  'Friendly',
  'Technical',
  'Creative',
  'Concise',
]);

/**
 * Response length schema (1-5 slider)
 */
export const responseLengthSchema = z.number().int().min(1).max(5);

/**
 * Language variant schema
 */
export const languageVariantSchema = z.enum(['UK', 'US']);

/**
 * Clarify-first toggle schema
 */
export const clarifyFirstSchema = z.boolean();

/**
 * Preferences schema
 */
export const prefsSchema = z.object({
  tone: toneSchema,
  length: responseLengthSchema,
  spelling: languageVariantSchema,
  clarifyFirst: clarifyFirstSchema,
});

/**
 * Complete wizard data schema for validation
 */
export const wizardDataSchema = z.object({
  name: nameSchema,
  passwordSet: z.boolean(),
  passwordHint: z.string().max(200).optional(),
  useType: useTypeSchema,
  sector: sectorSchema.optional(),
  subSectors: z.array(z.string()),
  roles: rolesSchema,
  roleOther: z.string().max(500).optional(),
  prefs: prefsSchema,
}).refine(
  (data) => {
    // If useType is Professional or Both, sector is required
    if (data.useType === 'Professional' || data.useType === 'Both') {
      return !!data.sector && data.subSectors.length > 0;
    }
    return true;
  },
  {
    message: 'Sector and sub-sectors are required for Professional/Both use types',
  }
).refine(
  (data) => {
    // If roles includes "Other", roleOther must be provided
    if (data.roles.includes('Other')) {
      return !!data.roleOther && data.roleOther.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Role description is required when "Other" is selected',
    path: ['roleOther'],
  }
);

export type WizardData = z.infer<typeof wizardDataSchema>;

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((e: { message: string }) => e.message),
  };
}

/**
 * Validate name
 */
export function validateName(name: string): {
  valid: boolean;
  errors: string[];
} {
  const result = nameSchema.safeParse(name);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((e: { message: string }) => e.message),
  };
}

/**
 * Validate wizard data at current step
 */
export function validateStep(stepIndex: number, data: Partial<WizardData>): {
  valid: boolean;
  errors: string[];
} {
  // Step 0: Welcome (no validation)
  if (stepIndex === 0) {
    return { valid: true, errors: [] };
  }

  // Step 1: Name
  if (stepIndex === 1) {
    if (!data.name) {
      return { valid: false, errors: ['Name is required'] };
    }
    return validateName(data.name);
  }

  // Step 2: Password
  if (stepIndex === 2) {
    // Password validation is handled separately in component
    return { valid: true, errors: [] };
  }

  // Step 3: Use Type
  if (stepIndex === 3) {
    if (!data.useType) {
      return { valid: false, errors: ['Use type is required'] };
    }
    return { valid: true, errors: [] };
  }

  // Step 4: Sector (conditional)
  if (stepIndex === 4) {
    if (data.useType === 'Professional' || data.useType === 'Both') {
      if (!data.sector) {
        return { valid: false, errors: ['Sector is required'] };
      }
    }
    return { valid: true, errors: [] };
  }

  // Step 5: Sub-sectors (conditional)
  if (stepIndex === 5) {
    if (data.useType === 'Professional' || data.useType === 'Both') {
      if (!data.subSectors || data.subSectors.length === 0) {
        return { valid: false, errors: ['At least one sub-sector is required'] };
      }
    }
    return { valid: true, errors: [] };
  }

  // Step 6: Roles (conditional)
  if (stepIndex === 6) {
    if (data.useType === 'Professional' || data.useType === 'Both') {
      if (!data.roles || data.roles.length === 0) {
        return { valid: false, errors: ['At least one role is required'] };
      }
      if (data.roles.includes('Other') && (!data.roleOther || data.roleOther.trim().length === 0)) {
        return { valid: false, errors: ['Role description is required when "Other" is selected'] };
      }
    }
    return { valid: true, errors: [] };
  }

  // Step 7+: Micro Prefs (always valid, defaults present)
  return { valid: true, errors: [] };
}