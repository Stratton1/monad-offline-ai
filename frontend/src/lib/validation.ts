/**
 * validation.ts
 * Purpose: Validation schemas using Zod for wizard inputs and forms
 * Usage: Used by SetupWizard and other forms to validate user input
 * Privacy: All validation happens locally, no external calls
 */

import { z } from 'zod';

export type WizardStepId =
  | 'welcome'
  | 'name'
  | 'password'
  | 'useType'
  | 'sector'
  | 'subSectors'
  | 'roles'
  | 'prefs'
  | 'intent'
  | 'look'
  | 'privacy'
  | 'review';

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
 * Theme schema
 */
export const themeSchema = z.enum(['Midnight', 'Dark', 'Dim', 'Light']);

/**
 * Primary language schema
 */
export const languageChoiceSchema = z.enum(['English (UK)', 'English (US)']);

/**
 * Goal/intent schema
 */
export const goalSchema = z.string().min(3, 'Describe your primary intent');

/**
 * Interests schema
 */
export const interestsSchema = z.array(z.string()).max(12, 'Keep interests concise');

export const savePreferenceSchema = z.enum(['always', 'ask', 'never']);
export const securityLevelSchema = z.enum(['standard', 'secure']);

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
  theme: themeSchema,
  language: languageChoiceSchema,
  goal: goalSchema,
  interests: interestsSchema,
  savePreference: savePreferenceSchema,
  securityLevel: securityLevelSchema,
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
export function validateStep(stepId: WizardStepId, data: Partial<WizardData>): {
  valid: boolean;
  errors: string[];
} {
  switch (stepId) {
    case 'welcome':
      return { valid: true, errors: [] };
    case 'name':
      if (!data.name) {
        return { valid: false, errors: ['Name is required'] };
      }
      return validateName(data.name);
    case 'password':
      return { valid: true, errors: [] };
    case 'useType':
      return data.useType ? { valid: true, errors: [] } : { valid: false, errors: ['Use type is required'] };
    case 'sector':
      if (data.useType === 'Professional' || data.useType === 'Both') {
        if (!data.sector) {
          return { valid: false, errors: ['Sector is required'] };
        }
      }
      return { valid: true, errors: [] };
    case 'subSectors':
      if (data.useType === 'Professional' || data.useType === 'Both') {
        if (!data.subSectors || data.subSectors.length === 0) {
          return { valid: false, errors: ['At least one sub-sector is required'] };
        }
      }
      return { valid: true, errors: [] };
    case 'roles':
      if (data.useType === 'Professional' || data.useType === 'Both') {
        if (!data.roles || data.roles.length === 0) {
          return { valid: false, errors: ['At least one role is required'] };
        }
        if (data.roles.includes('Other') && (!data.roleOther || data.roleOther.trim().length === 0)) {
          return { valid: false, errors: ['Role description is required when "Other" is selected'] };
        }
      }
      return { valid: true, errors: [] };
    case 'prefs':
      return { valid: true, errors: [] };
    case 'intent':
      if (!data.goal || data.goal.trim().length < 3) {
        return { valid: false, errors: ['Please describe your primary intent'] };
      }
      return { valid: true, errors: [] };
    case 'look':
      if (!data.theme || !data.language) {
        return { valid: false, errors: ['Select a theme and language preference'] };
      }
      return { valid: true, errors: [] };
    case 'privacy':
      if (!data.savePreference || !data.securityLevel) {
        return { valid: false, errors: ['Select save preference and security level'] };
      }
      return { valid: true, errors: [] };
    case 'review':
    default:
      return { valid: true, errors: [] };
  }
}
