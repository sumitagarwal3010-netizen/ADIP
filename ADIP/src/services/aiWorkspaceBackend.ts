/**
 * Maps AI Engine API responses into the AnalysisResult shape used by AIWorkspacePanel.
 */
import type { AnalysisPhase, AnalysisResult } from '../data/aiAnalysisMockData';
import { generateAnalysisResult } from '../data/aiAnalysisMockData';
import { adipSdk } from '../sdk/adipSdk';
import { isBackendMode } from './backend/apiConfig';

interface AiEngineResponse {
  classification?: Record<string, unknown>;
  steps?: string[];
  confidence?: number;
  plan?: Array<{ phase?: string; action?: string; artifact?: string }>;
  reflection?: { improvements?: string[]; issues?: string[]; adjusted_confidence?: number };
}

export function mapAiEngineToAnalysisResult(
  phase: AnalysisPhase,
  prompt: string,
  response: AiEngineResponse,
): AnalysisResult {
  const classification = response.classification ?? {};
  const planSteps = (response.plan ?? []).map(
    (p) => `${p.phase ?? 'Phase'}: ${p.action ?? ''}${p.artifact ? ` → ${p.artifact}` : ''}`.trim(),
  );
  const improvements = response.reflection?.improvements ?? [];
  const issues = response.reflection?.issues ?? [];
  const confidence = response.reflection?.adjusted_confidence ?? response.confidence ?? 70;

  const base: AnalysisResult = {
    'Confidence Score': Math.round(confidence),
    Recommendations: [...planSteps, ...improvements].filter(Boolean),
    'Risk Flags': issues,
    Summary: (response.steps ?? []).join(' · ') || String(classification.summary ?? 'AI analysis complete'),
  };

  for (const [key, value] of Object.entries(classification)) {
    if (key !== 'summary' && value != null) {
      base[key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())] = value as string | number;
    }
  }

  if (Object.keys(base).length <= 4) {
    return { ...generateAnalysisResult(phase, prompt), ...base };
  }
  return base;
}

export async function analyzePromptWithBackend(
  phase: AnalysisPhase,
  prompt: string,
): Promise<AnalysisResult | null> {
  if (!isBackendMode()) return null;
  try {
    const response = (await adipSdk.analyzeWithAiEngine(prompt)) as AiEngineResponse;
    return mapAiEngineToAnalysisResult(phase, prompt, response);
  } catch {
    return null;
  }
}
