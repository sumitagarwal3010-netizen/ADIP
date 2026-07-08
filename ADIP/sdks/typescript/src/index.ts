/**
 * ADIP TypeScript SDK
 *
 * A lightweight, fetch-based client for the ADIP REST API. Works in the browser
 * and in Node 18+ (global `fetch`).
 *
 * ```ts
 * import { ADIPClient } from "@adip/sdk";
 * const client = new ADIPClient({ baseUrl: "http://localhost:8000" });
 * const projects = await client.listProjects();
 * const artifact = await client.generateArtifact(1, "BRD");
 * ```
 */

export interface ADIPClientOptions {
  baseUrl?: string;
  apiPrefix?: string;
  token?: string;
  timeoutMs?: number;
}

export class ADIPError extends Error {
  status?: number;
  body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = "ADIPError";
    this.status = status;
    this.body = body;
  }
}

export class ADIPClient {
  private baseUrl: string;
  private apiPrefix: string;
  private token?: string;
  private timeoutMs: number;

  constructor(options: ADIPClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:8000").replace(/\/$/, "");
    this.apiPrefix = options.apiPrefix ?? "/api/v1";
    this.token = options.token;
    this.timeoutMs = options.timeoutMs ?? 30000;
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    opts: { params?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<T> {
    let url = `${this.baseUrl}${this.apiPrefix}${path}`;
    if (opts.params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(opts.params)) {
        if (v !== undefined && v !== null) qs.append(k, String(v));
      }
      const q = qs.toString();
      if (q) url += `?${q}`;
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });
      const ctype = res.headers.get("Content-Type") ?? "";
      const payload = ctype.includes("application/json")
        ? await res.json()
        : await res.text();
      if (!res.ok) {
        throw new ADIPError(
          `HTTP ${res.status} for ${method} ${path}`,
          res.status,
          typeof payload === "string" ? payload : JSON.stringify(payload),
        );
      }
      return payload as T;
    } catch (err) {
      if (err instanceof ADIPError) throw err;
      throw new ADIPError(`Cannot reach ADIP at ${url}: ${(err as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  // --- health & meta ---
  health = () => this.request("GET", "/health");
  llmHealth = () => this.request("GET", "/llm/health");
  llmRuntime = () => this.request("GET", "/llm/runtime");

  // --- projects ---
  listProjects = (page = 1, size = 50) =>
    this.request("GET", "/projects", { params: { page, size } });
  getProject = (id: number) => this.request("GET", `/projects/${id}`);

  // --- SDLC ---
  sdlcSummary = (projectId: number, phase: string) =>
    this.request("GET", `/sdlc/projects/${projectId}/${phase}/summary`);

  // --- orchestration ---
  orchestrate = (prompt: string, options: Record<string, unknown> = {}) =>
    this.request("POST", "/orchestrator/run", { body: { prompt, ...options } });

  // --- artifacts ---
  generateArtifact = (projectId: number, artifactType: string) =>
    this.request("GET", `/artifact-generation/projects/${projectId}/generate`, {
      params: { artifact_type: artifactType },
    });
  exportArtifact = (
    projectId: number,
    artifactType: string,
    format = "markdown",
    watermark?: string,
  ) =>
    this.request("GET", `/artifact-export/projects/${projectId}`, {
      params: { artifact_type: artifactType, format, watermark },
    });
  scoreArtifactQuality = (projectId: number, artifactType: string) =>
    this.request("POST", "/artifact-quality/score", {
      body: { project_id: projectId, artifact_type: artifactType },
    });

  // --- prompt studio ---
  createPrompt = (name: string, content: string, extra: Record<string, unknown> = {}) =>
    this.request("POST", "/prompt-workbench/prompts", { body: { name, content, ...extra } });
  searchPrompts = (q: string) => this.request("GET", "/prompt-studio/search", { params: { q } });
  favoritePrompt = (promptId: number, value = true) =>
    this.request("PUT", `/prompt-studio/prompts/${promptId}/favorite`, {
      body: { is_favorite: value },
    });

  // --- benchmark & regression ---
  benchmark = (versions: string[], project?: string) =>
    this.request("POST", "/prompt-benchmark/benchmark", { body: { versions, project } });
  regressionCompare = (baseline: string, candidate: string) =>
    this.request("POST", "/prompt-regression/compare", {
      body: { baseline_prompt: baseline, candidate_prompt: candidate },
    });

  // --- prompt templates ---
  listTemplates = () => this.request("GET", "/prompt-templates");
  listMatrixPrompts = () => this.request("GET", "/prompt-templates/matrix");
}

export default ADIPClient;
