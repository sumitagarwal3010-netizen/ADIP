/**
 * ADIP backend integration layer (Phase 10) — public surface.
 *
 * Additive backend access with a mock/backend feature flag. Import from here:
 *   import { apiClient, isBackendMode, useBackendData } from '@/services/backend';
 */
export { apiClient, ApiError } from './apiClient';
export type { ApiClient, ListParams, OrchestrationOptions, Page } from './apiClient';
export {
  getApiBaseUrl,
  getDataSource,
  isBackendMode,
  setDataSource,
} from './apiConfig';
export type { DataSource } from './apiConfig';
export { useBackendData } from './useBackendData';
export type { BackendDataState } from './useBackendData';
