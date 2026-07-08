import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getDataSource, isBackendMode } from './apiConfig';

describe('apiConfig', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('defaults to mock mode', () => {
    expect(getDataSource()).toBe('mock');
    expect(isBackendMode()).toBe(false);
  });

  it('respects localStorage backend toggle', () => {
    localStorage.setItem('adip.dataSource', 'backend');
    expect(getDataSource()).toBe('backend');
    expect(isBackendMode()).toBe(true);
  });

  it('respects VITE_DATA_SOURCE env', () => {
    vi.stubEnv('VITE_DATA_SOURCE', 'backend');
    expect(getDataSource()).toBe('backend');
  });
});
