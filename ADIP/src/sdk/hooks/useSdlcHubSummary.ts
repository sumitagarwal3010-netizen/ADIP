/**
 * SDLC hub backend summary — mirrors Traceability integration pattern.
 */
import { useMemo } from 'react';
import { apiClient } from '../../services/backend/apiClient';
import { useAdipQuery } from './useAdipQuery';

export type SdlcHubKey =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'delivery';

export interface SdlcHubSummaryView {
  score: number;
  readiness: string;
  totalItems?: number;
  projectName?: string;
}

const DEFAULT_PROJECT_ID = 1;

const FETCHERS: Record<SdlcHubKey, (projectId: number) => Promise<unknown>> = {
  requirements: (id) => apiClient.requirementSummary(id),
  architecture: (id) => apiClient.architectureSummary(id),
  development: (id) => apiClient.developmentSummary(id),
  testing: (id) => apiClient.testingSummary(id),
  release: (id) => apiClient.releaseSummary(id),
  delivery: (id) => apiClient.goLiveSummary(id),
};

function mapSummary(raw: unknown): SdlcHubSummaryView {
  const data = raw as Record<string, unknown>;
  const project = data.project as { name?: string } | undefined;
  const total =
    (data.total_requirements as number | undefined) ??
    (data.total_stories as number | undefined) ??
    (data.total_releases as number | undefined);
  return {
    score: Number(data.score ?? 0),
    readiness: String(data.readiness ?? 'Unknown'),
    totalItems: total,
    projectName: project?.name,
  };
}

export function useSdlcHubSummary(hub: SdlcHubKey, mock: SdlcHubSummaryView, projectId = DEFAULT_PROJECT_ID) {
  const fetcher = useMemo(
    () => () => FETCHERS[hub](projectId).then((raw) => mapSummary(raw)),
    [hub, projectId],
  );
  return useAdipQuery(fetcher, mock, [hub, projectId]);
}
