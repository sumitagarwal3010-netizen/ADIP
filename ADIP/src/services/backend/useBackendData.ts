/**
 * Optional data-source hook (Phase 10).
 *
 * Lets any page fetch from the FastAPI backend when backend mode is enabled,
 * while transparently falling back to its existing mock value otherwise. This
 * is purely additive — a page adopts it only if/when desired; nothing forces a
 * redesign or replaces the mock layer.
 *
 * Usage:
 *   const { data, loading, error, source } = useBackendData(
 *     () => apiClient.executiveSummary(projectId),
 *     mockExecutiveSummary,      // existing mock value
 *     [projectId],
 *   );
 */
import { useEffect, useState } from 'react';
import { isBackendMode } from './apiConfig';

export interface BackendDataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  source: 'mock' | 'backend';
}

export function useBackendData<T>(
  fetcher: () => Promise<T>,
  mockValue: T,
  deps: ReadonlyArray<unknown> = [],
): BackendDataState<T> {
  const backend = isBackendMode();
  const [data, setData] = useState<T>(mockValue);
  const [loading, setLoading] = useState<boolean>(backend);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!backend) {
      setData(mockValue);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          // On error, degrade gracefully to the mock value.
          setData(mockValue);
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, source: backend ? 'backend' : 'mock' };
}
