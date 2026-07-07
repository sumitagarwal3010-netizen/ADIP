/**
 * Backend integration configuration + feature flag (Phase 10).
 *
 * ADIP ships with a rich mock/simulation layer. This module lets the app
 * OPTIONALLY talk to the FastAPI backend instead, controlled by a single
 * feature flag — WITHOUT redesigning any page or replacing the existing mock
 * services. Pages/hooks may consult {@link isBackendMode} and, when true, call
 * the {@link apiClient}; otherwise they keep using the current mock data.
 *
 * Flag resolution (first match wins):
 *   1. localStorage `adip.dataSource` = "backend" | "mock"   (runtime toggle)
 *   2. Vite env `VITE_DATA_SOURCE`   = "backend" | "mock"    (build-time)
 *   3. default: "mock"                                        (safe default)
 */

export type DataSource = 'mock' | 'backend';

const STORAGE_KEY = 'adip.dataSource';

/** Base URL of the ADIP FastAPI backend (override via VITE_API_BASE_URL). */
export function getApiBaseUrl(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
}

/** The currently configured data source (mock by default). */
export function getDataSource(): DataSource {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'backend' || stored === 'mock') return stored;
  } catch {
    // localStorage unavailable (SSR/tests) — fall through to env/default.
  }
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_DATA_SOURCE === 'backend' || env.VITE_DATA_SOURCE === 'mock') {
    return env.VITE_DATA_SOURCE;
  }
  return 'mock';
}

/** True when the app should read from the FastAPI backend. */
export function isBackendMode(): boolean {
  return getDataSource() === 'backend';
}

/** Runtime toggle (persisted) — lets a settings control flip data source without a rebuild. */
export function setDataSource(source: DataSource): void {
  try {
    localStorage.setItem(STORAGE_KEY, source);
  } catch {
    // no-op when storage is unavailable
  }
}
