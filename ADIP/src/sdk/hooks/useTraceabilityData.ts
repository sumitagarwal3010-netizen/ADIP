/**
 * Traceability data hook — backend matrix with mock fallback (production wiring).
 */
import { useMemo } from 'react';
import { apiClient } from '../../services/backend/apiClient';
import { computeCoverage } from '../../data/traceabilityEngine';
import { useAdipQuery } from './useAdipQuery';

const DEFAULT_PROJECT_ID = 1;

export interface TraceabilityBackendMatrix {
  rows?: unknown[];
  coverage_pct?: number;
  [key: string]: unknown;
}

export function useTraceabilityMatrix(projectId = DEFAULT_PROJECT_ID) {
  const mockCoverage = useMemo(() => computeCoverage(), []);
  const mockMatrix: TraceabilityBackendMatrix = useMemo(
    () => ({
      coverage_pct: mockCoverage.overallCoverage,
      threads_fully_traced: mockCoverage.threadsFullyTraced,
      total_threads: mockCoverage.totalThreads,
      missing_links: mockCoverage.missingLinks.length,
    }),
    [mockCoverage],
  );

  const fetcher = useMemo(
    () => () => apiClient.traceabilityMatrix<TraceabilityBackendMatrix>(projectId),
    [projectId],
  );

  return useAdipQuery(fetcher, mockMatrix, [projectId]);
}
