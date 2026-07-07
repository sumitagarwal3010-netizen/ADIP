/**
 * Typed ADIP backend API client (Phase 10).
 *
 * A thin, dependency-free fetch wrapper over the FastAPI REST API. It is
 * ADDITIVE: existing pages continue to use the mock layer unless they opt into
 * backend mode via {@link isBackendMode}. Nothing here modifies existing pages.
 */
import { getApiBaseUrl } from './apiConfig';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

/** Options for the Prompt Execution Engine orchestration call. */
export interface OrchestrationOptions {
  metadata?: {
    project?: string;
    application?: string;
    priority?: string;
    complexity?: string;
    regulation?: string;
  };
  artifact_types?: string[];
  include_markdown?: boolean;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.append(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
  } catch (err) {
    throw new ApiError(0, `Network error calling ${url}: ${(err as Error).message}`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = (body && (body.detail as string)) || detail;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Generic CRUD + business endpoint access. */
export const apiClient = {
  health(): Promise<{ status: string }> {
    return request('/health');
  },

  // --- generic CRUD ---
  list<T>(resource: string, params?: ListParams): Promise<Page<T>> {
    return request<Page<T>>(`/${resource}${buildQuery(params)}`);
  },
  get<T>(resource: string, id: number): Promise<T> {
    return request<T>(`/${resource}/${id}`);
  },
  create<T>(resource: string, payload: unknown): Promise<T> {
    return request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  update<T>(resource: string, id: number, payload: unknown): Promise<T> {
    return request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  remove(resource: string, id: number): Promise<void> {
    return request<void>(`/${resource}/${id}`, { method: 'DELETE' });
  },

  // --- Phase 3 business summaries ---
  requirementSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/requirements/summary`);
  },
  architectureSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/architecture/summary`);
  },
  developmentSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/development/summary`);
  },
  testingSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/testing/summary`);
  },
  releaseSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/release/summary`);
  },
  goLiveSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/go-live/summary`);
  },
  auditSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/sdlc/projects/${projectId}/audit/summary`);
  },

  // --- Phase 4 copilots ---
  copilot<T = unknown>(slug: string, projectId: number): Promise<T> {
    return request<T>(`/copilots/${slug}/projects/${projectId}`);
  },

  // --- Executive + analytics ---
  executiveSummary<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/executive/projects/${projectId}/summary`);
  },
  portfolioExecutive<T = unknown>(): Promise<T> {
    return request<T>('/executive/portfolio');
  },
  portfolioHealth<T = unknown>(): Promise<T> {
    return request<T>('/analytics/portfolio-health');
  },
  riskRollup<T = unknown>(): Promise<T> {
    return request<T>('/analytics/risk-rollup');
  },
  engineeringKpis<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/analytics/projects/${projectId}/engineering-kpis`);
  },
  executiveTrend<T = unknown>(projectId: number, metric = 'overall_score'): Promise<T> {
    return request<T>(`/analytics/projects/${projectId}/trend?metric=${encodeURIComponent(metric)}`);
  },

  // --- Artifacts ---
  artifactCatalog<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/artifact-catalog/projects/${projectId}`);
  },
  generateArtifact<T = unknown>(projectId: number, artifactType: string): Promise<T> {
    return request<T>(
      `/artifact-generation/projects/${projectId}/generate?artifact_type=${encodeURIComponent(artifactType)}`,
    );
  },

  // --- Traceability ---
  traceabilityChain<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/traceability/projects/${projectId}/chain`);
  },
  traceabilityMatrix<T = unknown>(projectId: number): Promise<T> {
    return request<T>(`/traceability/projects/${projectId}/matrix`);
  },

  // --- Prompt Execution Engine (orchestration) ---
  orchestrate<T = unknown>(prompt: string, options?: OrchestrationOptions): Promise<T> {
    return request<T>('/orchestrator/execute', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...(options ?? {}) }),
    });
  },
  orchestratorCapabilities<T = unknown>(): Promise<T> {
    return request<T>('/orchestrator/capabilities');
  },

  // --- Knowledge + transformation ---
  knowledgeOverview<T = unknown>(): Promise<T> {
    return request<T>('/knowledge/overview');
  },
  knowledgeSearch<T = unknown>(query: string): Promise<T> {
    return request<T>(`/knowledge/search?q=${encodeURIComponent(query)}`);
  },
  transformationPortfolio<T = unknown>(): Promise<T> {
    return request<T>('/transformation/portfolio');
  },
  transformationRoi<T = unknown>(): Promise<T> {
    return request<T>('/transformation/roi');
  },
};

export type ApiClient = typeof apiClient;
