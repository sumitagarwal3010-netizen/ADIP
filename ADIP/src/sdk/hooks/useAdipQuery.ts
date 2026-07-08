/**
 * React Query-style hook over SDK/backend with mock fallback (Role 8).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { isBackendMode } from '../../services/backend/apiConfig';

export interface AdipQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: 'mock' | 'backend';
  retry: () => void;
}

export function useAdipQuery<T>(
  fetcher: () => Promise<T>,
  mockValue: T,
  deps: ReadonlyArray<unknown> = [],
): AdipQueryState<T> {
  const [data, setData] = useState<T | null>(isBackendMode() ? null : mockValue);
  const [loading, setLoading] = useState(isBackendMode());
  const [error, setError] = useState<string | null>(null);
  const attemptRef = useRef(0);

  const run = useCallback(() => {
    if (!isBackendMode()) {
      setData(mockValue);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err: Error) => {
        setData(mockValue);
        setError(err.message);
        setLoading(false);
      });
  }, [fetcher, mockValue]);

  useEffect(() => {
    attemptRef.current += 1;
    run();
  }, deps);

  const retry = useCallback(() => run(), [run]);

  return {
    data,
    loading,
    error,
    source: isBackendMode() ? 'backend' : 'mock',
    retry,
  };
}

export function useAdipMutation<TArg, TResult>(
  mutator: (arg: TArg) => Promise<TResult>,
): {
  mutate: (arg: TArg) => Promise<TResult | null>;
  loading: boolean;
  error: string | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (arg: TArg) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutator(arg);
      setLoading(false);
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, [mutator]);

  return { mutate, loading, error };
}
