import { describe, expect, it } from 'vitest';
import { MOCK_CONNECTORS } from './useConnectors';

describe('useConnectors mock data', () => {
  it('provides stable mock connector rows', () => {
    expect(MOCK_CONNECTORS.length).toBeGreaterThan(0);
    expect(MOCK_CONNECTORS[0].mock_mode).toBe(true);
  });
});
