import { describe, expect, it } from 'vitest';
import { MOCK_USE_CASES } from './useConnectorArtifactWorkbench';

// Re-export mock constants for testing — import from hook module internals via duplicate check
describe('Connector Artifact Workbench mocks', () => {
  it('provides artifact use cases', () => {
    expect(MOCK_USE_CASES.length).toBeGreaterThan(0);
    expect(MOCK_USE_CASES.some((u) => u.id === 'release_readiness_report')).toBe(true);
  });
});
