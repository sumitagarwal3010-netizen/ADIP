/**
 * AI Workspace session persistence.
 *
 * Stores prompt history and recent sessions per module in localStorage so the
 * AI-first experience survives reloads (demo persistence). No backend.
 */

import type { AIWorkspaceModule } from '../config/aiWorkspaceConfig';
import type { RequirementArtifactPackage } from '../types/copilot';

export interface AISession {
  id: string;
  module: AIWorkspaceModule;
  prompt: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Human-readable timestamp for display. */
  displayTime: string;
  /** Whether artifacts were generated in this session. */
  generatedArtifacts: boolean;
  /** Count of artifacts generated (0 if analysis only). */
  artifactCount: number;
}

const KEY_PREFIX = 'adip.aiSessions.';
const REQ_PACKAGE_KEY = 'adip.reqArtifactPackages';
const MAX_SESSIONS = 12;

function storageKey(module: AIWorkspaceModule): string {
  return `${KEY_PREFIX}${module}`;
}

export function loadSessions(module: AIWorkspaceModule): AISession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(module));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AISession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSession(module: AIWorkspaceModule, session: AISession): AISession[] {
  const existing = loadSessions(module);
  // de-dupe identical consecutive prompts; newest first; cap length
  const filtered = existing.filter((s) => s.id !== session.id);
  const next = [session, ...filtered].slice(0, MAX_SESSIONS);
  try {
    window.localStorage.setItem(storageKey(module), JSON.stringify(next));
  } catch {
    /* ignore quota / access errors */
  }
  return next;
}

export function clearSessions(module: AIWorkspaceModule): AISession[] {
  try {
    window.localStorage.removeItem(storageKey(module));
  } catch {
    /* ignore */
  }
  return [];
}

export function createSessionId(): string {
  return `S-${Date.now().toString(36).toUpperCase()}`;
}

export function nowDisplay(): string {
  return new Date().toLocaleString('en-IN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function normalizeRequirement(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function requirementSessionKey(normalizedRequirement: string): string {
  // Deterministic FNV-1a hash.
  let hash = 2166136261;
  for (let i = 0; i < normalizedRequirement.length; i += 1) {
    hash ^= normalizedRequirement.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `REQ-${(hash >>> 0).toString(16)}`;
}

export function loadRequirementPackage(
  normalizedRequirement: string,
): RequirementArtifactPackage | null {
  if (typeof window === 'undefined' || !normalizedRequirement) return null;
  try {
    const raw = window.localStorage.getItem(REQ_PACKAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, RequirementArtifactPackage>;
    return parsed[normalizedRequirement] ?? null;
  } catch {
    return null;
  }
}

export function saveRequirementPackage(
  normalizedRequirement: string,
  pkg: RequirementArtifactPackage,
): void {
  if (typeof window === 'undefined' || !normalizedRequirement) return;
  try {
    const raw = window.localStorage.getItem(REQ_PACKAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, RequirementArtifactPackage>) : {};
    parsed[normalizedRequirement] = pkg;
    window.localStorage.setItem(REQ_PACKAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}
