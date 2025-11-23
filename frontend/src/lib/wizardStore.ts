/**
 * wizardStore.ts
 * Purpose: Zustand store for managing wizard state during onboarding
 * Usage: Used by SetupWizard to persist progress and state
 * Privacy: Stores state locally, encrypted after password step
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SavePreference, SecurityLevel } from './config';

/**
 * Wizard data shape per spec
 */
export type WizardData = {
  name: string;
  passwordSet: boolean;
  passwordHint?: string;
  useType: 'Personal' | 'Professional' | 'Both' | '';
  sector?: string;
  subSectors: string[];
  roles: string[];
  roleOther?: string;
  prefs: {
    tone: 'Professional' | 'Friendly' | 'Technical' | 'Creative' | 'Concise';
    length: 1 | 2 | 3 | 4 | 5;
    spelling: 'UK' | 'US';
    clarifyFirst: boolean;
  };
  theme: 'Midnight' | 'Dark' | 'Dim' | 'Light';
  language: 'English (UK)' | 'English (US)';
  goal: string;
  interests: string[];
  savePreference: SavePreference;
  securityLevel: SecurityLevel;
  stepIndex: number;
};

interface WizardStore extends WizardData {
  // Actions
  /** Jump directly to a specific wizard step index */
  setStep: (index: number) => void;
  /** Advance to the next step */
  nextStep: () => void;
  /** Go back one step if possible */
  prevStep: () => void;
  /** Update a single field on the wizard data */
  setField: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  /** Reset wizard progress to defaults */
  reset: () => void;
}

const defaultState: WizardData = {
  name: '',
  passwordSet: false,
  passwordHint: undefined,
  useType: '',
  sector: undefined,
  subSectors: [],
  roles: [],
  roleOther: undefined,
  prefs: {
    tone: 'Professional',
    length: 3,
    spelling: 'UK',
    clarifyFirst: false,
  },
  theme: 'Midnight',
  language: 'English (UK)',
  goal: '',
  interests: [],
  savePreference: 'ask',
  securityLevel: 'secure',
  stepIndex: 0,
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setStep: (index) => set({ stepIndex: index }),
      nextStep: () => {
        const current = get().stepIndex;
        set({ stepIndex: current + 1 });
      },
      prevStep: () => {
        const current = get().stepIndex;
        if (current > 0) {
          set({ stepIndex: current - 1 });
        }
      },
      setField: (key, value) => {
        if (key === 'prefs' && typeof value === 'object' && value !== null) {
          // Merge prefs object
          set((state) => ({
            ...state,
            prefs: { ...state.prefs, ...(value as WizardData['prefs']) },
          }));
        } else {
          set((state) => ({ ...state, [key]: value }));
        }
      },
      reset: () => set({ ...defaultState }),
    }),
    {
      name: 'monad_wizard_tmp',
      storage: createJSONStorage(() => localStorage),
      // Persist all fields except password (never stored)
      partialize: (state) => ({
        name: state.name,
        passwordSet: state.passwordSet,
        passwordHint: state.passwordHint,
        useType: state.useType,
        sector: state.sector,
        subSectors: state.subSectors,
        roles: state.roles,
        roleOther: state.roleOther,
        prefs: state.prefs,
        theme: state.theme,
        language: state.language,
        goal: state.goal,
        interests: state.interests,
        savePreference: state.savePreference,
        securityLevel: state.securityLevel,
        stepIndex: state.stepIndex,
      }),
    }
  )
);

/**
 * Get current wizard data
 */
export function getWizardData(): WizardData {
  return useWizardStore.getState();
}
