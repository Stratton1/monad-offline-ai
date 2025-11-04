/**
 * chats/registry.ts
 * Purpose: Create and persist initial chat descriptors + persona configs
 * Usage: Called by SetupWizard on completion to create starter chats
 * Privacy: All operations are local, no external calls
 */

// Simple UUID generator (replaces uuid package for now)
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import type { WizardData } from '../lib/wizardStore';
import {
  everydayPersona,
  journalPersona,
  proStudioPersona,
  dispatchPersona,
} from '../lib/core/personalities';
import { ensureChatFolder, setRegistry } from '../lib/library';

export type ChatKind = 'Everyday' | 'Journal' | 'ProStudioA' | 'ProStudioB' | 'Dispatch';

export interface ChatDescriptor {
  id: string;
  kind: ChatKind;
  title: string;
  createdAt: number;
  personaKey: 'everyday' | 'journal' | 'proStudio' | 'dispatch';
  secure?: { journalPassRequired: boolean };
  storagePath: string; // Path under app data for this chat
  config?: {
    sector?: string;
    subSectors?: string[];
    roles?: string[];
    roleOther?: string;
  };
}

/**
 * Create starter chats from wizard data
 */
export async function createStarterChatsFromWizard(
  wizardData: WizardData
): Promise<ChatDescriptor[]> {
  const descriptors: ChatDescriptor[] = [];
  const basePath = 'chats'; // Base path in app data directory

  // 1. Everyday Chat
  const everyday: ChatDescriptor = {
    id: uuidv4(),
    kind: 'Everyday',
    title: 'Everyday',
    createdAt: Date.now(),
    personaKey: 'everyday',
    storagePath: `${basePath}/everyday/${uuidv4()}`,
  };
  descriptors.push(everyday);

  // 2. Journal Chat (secure, passcode required)
  const journal: ChatDescriptor = {
    id: uuidv4(),
    kind: 'Journal',
    title: 'Journal',
    createdAt: Date.now(),
    personaKey: 'journal',
    secure: { journalPassRequired: true },
    storagePath: `${basePath}/journal/${uuidv4()}`,
  };
  descriptors.push(journal);

  // 3. Pro Studio A
  const proStudioA: ChatDescriptor = {
    id: uuidv4(),
    kind: 'ProStudioA',
    title: 'Pro Studio A',
    createdAt: Date.now(),
    personaKey: 'proStudio',
    storagePath: `${basePath}/prostudio/a/${uuidv4()}`,
    config: wizardData.useType === 'Professional' || wizardData.useType === 'Both'
      ? {
          sector: wizardData.sector,
          subSectors: wizardData.subSectors,
          roles: wizardData.roles,
          roleOther: wizardData.roleOther,
        }
      : undefined,
  };
  descriptors.push(proStudioA);

  // 4. Pro Studio B
  const proStudioB: ChatDescriptor = {
    id: uuidv4(),
    kind: 'ProStudioB',
    title: 'Pro Studio B',
    createdAt: Date.now(),
    personaKey: 'proStudio',
    storagePath: `${basePath}/prostudio/b/${uuidv4()}`,
    config: wizardData.useType === 'Professional' || wizardData.useType === 'Both'
      ? {
          sector: wizardData.sector,
          subSectors: wizardData.subSectors,
          roles: wizardData.roles,
          roleOther: wizardData.roleOther,
        }
      : undefined,
  };
  descriptors.push(proStudioB);

  // 5. Dispatch Chat (Current Affairs)
  const dispatch: ChatDescriptor = {
    id: uuidv4(),
    kind: 'Dispatch',
    title: 'Dispatch',
    createdAt: Date.now(),
    personaKey: 'dispatch',
    storagePath: `${basePath}/dispatch/${uuidv4()}`,
  };
  descriptors.push(dispatch);

  // Ensure folders exist for each chat
  for (const descriptor of descriptors) {
    await ensureChatFolder(descriptor);
  }

  // Save registry
  await setRegistry(descriptors);

  console.log('[Registry] Created starter chats:', descriptors.map((d) => d.kind));

  return descriptors;
}

/**
 * Get persona for a chat kind
 */
export function getPersonaForChat(kind: ChatKind) {
  switch (kind) {
    case 'Everyday':
      return everydayPersona;
    case 'Journal':
      return journalPersona;
    case 'ProStudioA':
    case 'ProStudioB':
      return proStudioPersona;
    case 'Dispatch':
      return dispatchPersona;
    default:
      return everydayPersona;
  }
}

/**
 * Check if chat registry exists
 */
export function hasRegistry(): boolean {
  try {
    const stored = localStorage.getItem('monad_chat_registry');
    return !!stored;
  } catch {
    return false;
  }
}
