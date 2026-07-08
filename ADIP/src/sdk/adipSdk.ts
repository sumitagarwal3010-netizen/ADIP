/**
 * Typed SDK facade over `apiClient` — additive, no duplicate endpoints.
 */
import { apiClient, type OrchestrationOptions } from '../services/backend/apiClient';
import { getDataSource, isBackendMode } from '../services/backend/apiConfig';

export interface HealthStatus {
  status: string;
  environment?: string;
}

export interface OrchestrateResult {
  [key: string]: unknown;
}

export class AdipSdk {
  readonly mode = getDataSource();

  get isBackendMode(): boolean {
    return isBackendMode();
  }

  health(): Promise<HealthStatus> {
    return apiClient.health() as Promise<HealthStatus>;
  }

  orchestrate(prompt: string, options?: OrchestrationOptions): Promise<OrchestrateResult> {
    return apiClient.orchestrate<OrchestrateResult>(prompt, options);
  }

  portfolioHealth<T = unknown>(): Promise<T> {
    return apiClient.portfolioHealth<T>();
  }

  traceabilityMatrix<T = unknown>(projectId: number): Promise<T> {
    return apiClient.traceabilityMatrix<T>(projectId);
  }

  executiveSummary<T = unknown>(projectId: number): Promise<T> {
    return apiClient.executiveSummary<T>(projectId);
  }

  analyzeWithAiEngine(prompt: string): Promise<Record<string, unknown>> {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    return fetch(`${base}/ai-engine/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, strategy: 'chain_of_thought' }),
    }).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    });
  }
}

export const adipSdk = new AdipSdk();
