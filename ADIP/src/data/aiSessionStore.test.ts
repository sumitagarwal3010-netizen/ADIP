import { describe, expect, it } from 'vitest';
import {
  loadRequirementPackage,
  normalizeRequirement,
  requirementSessionKey,
  saveRequirementPackage,
} from './aiSessionStore';

describe('aiSessionStore requirement package cache', () => {
  it('normalizes requirement and reuses same cache key', () => {
    const a = normalizeRequirement('  Enable   passkeys  for Mobile Banking ');
    const b = normalizeRequirement('enable passkeys for mobile banking');
    expect(a).toBe('enable passkeys for mobile banking');
    expect(requirementSessionKey(a)).toBe(requirementSessionKey(b));
  });

  it('reuses cached package for same normalized requirement', () => {
    const normalized = normalizeRequirement('Enable passkeys for mobile banking');
    const pkg = {
      session_key: 'REQ-abc',
      normalized_requirement: normalized,
      source: 'llm',
      requirement_profile: { feature: normalized },
      artifacts: {
        brd: { name: 'BRD.docx', file_type: 'docx', content: `BRD ${normalized}` },
      },
    };
    saveRequirementPackage(normalized, pkg as never);
    const loaded = loadRequirementPackage(normalized);
    expect(loaded?.session_key).toBe('REQ-abc');
    expect(loaded?.artifacts?.brd?.content).toContain('passkeys');
  });
});

