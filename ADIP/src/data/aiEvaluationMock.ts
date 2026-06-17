/**
 * AI Evaluation Center mock data.
 *
 * Executive-first: landing surfaces only the five summary scores. Detailed
 * per-use-case evaluation results live in `AI_EVALUATIONS` and are revealed
 * through drilldowns (resolver: `ai-evaluation.*`).
 *
 * No backend — static enterprise-realistic banking mock data.
 */

export type EvalRegressionStatus = 'Pass' | 'Watch' | 'Fail';

export interface AIEvaluationEntry {
  id: string;
  useCase: string;
  model: string;
  qualityScore: number;
  hallucinationScore: number; // higher = safer (fewer hallucinations)
  safetyScore: number;
  groundingScore: number;
  regressionStatus: EvalRegressionStatus;
  lastEvaluated: string;
  owner: string;
}

export const AI_EVALUATIONS: AIEvaluationEntry[] = [
  { id: 'EVL-001', useCase: 'Customer Service Copilot', model: 'gpt-4o-2026-04', qualityScore: 88, hallucinationScore: 91, safetyScore: 94, groundingScore: 86, regressionStatus: 'Watch', lastEvaluated: 'Jun 5, 2026', owner: 'Digital CX' },
  { id: 'EVL-002', useCase: 'Fraud Detection Model', model: 'FraudScorer v3.2.1', qualityScore: 93, hallucinationScore: 97, safetyScore: 95, groundingScore: 92, regressionStatus: 'Pass', lastEvaluated: 'Jun 5, 2026', owner: 'Payments Risk' },
  { id: 'EVL-003', useCase: 'Credit Scoring Model', model: 'Experian AI v5.1.0', qualityScore: 84, hallucinationScore: 95, safetyScore: 82, groundingScore: 88, regressionStatus: 'Fail', lastEvaluated: 'May 30, 2026', owner: 'Retail Credit' },
  { id: 'EVL-004', useCase: 'Collections Assistant', model: 'gpt-4o-mini-2026-03', qualityScore: 86, hallucinationScore: 89, safetyScore: 90, groundingScore: 83, regressionStatus: 'Watch', lastEvaluated: 'Jun 3, 2026', owner: 'Collections' },
  { id: 'EVL-005', useCase: 'KYC Verification AI', model: 'Onfido v4.3.0', qualityScore: 90, hallucinationScore: 96, safetyScore: 93, groundingScore: 91, regressionStatus: 'Pass', lastEvaluated: 'Jun 4, 2026', owner: 'Compliance' },
  { id: 'EVL-006', useCase: 'Transaction Anomaly Detection', model: 'AnomalyNet v2.8.4', qualityScore: 91, hallucinationScore: 98, safetyScore: 94, groundingScore: 90, regressionStatus: 'Pass', lastEvaluated: 'Jun 5, 2026', owner: 'Financial Crime' },
  { id: 'EVL-007', useCase: 'Compliance Monitoring AI', model: 'Foundry v2.1.5', qualityScore: 82, hallucinationScore: 93, safetyScore: 88, groundingScore: 79, regressionStatus: 'Watch', lastEvaluated: 'Jun 2, 2026', owner: 'Regulatory Affairs' },
  { id: 'EVL-008', useCase: 'Document Classification', model: 'Google Doc AI v1.9.2', qualityScore: 89, hallucinationScore: 94, safetyScore: 92, groundingScore: 87, regressionStatus: 'Pass', lastEvaluated: 'Jun 1, 2026', owner: 'Operations Automation' },
];

export interface AIEvaluationScores {
  quality: number;
  hallucination: number;
  safety: number;
  grounding: number;
  regressionPassRate: number;
  regressionPass: number;
  regressionWatch: number;
  regressionFail: number;
  evaluated: number;
}

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

export function computeEvaluationScores(rows: AIEvaluationEntry[] = AI_EVALUATIONS): AIEvaluationScores {
  const pass = rows.filter((r) => r.regressionStatus === 'Pass').length;
  const watch = rows.filter((r) => r.regressionStatus === 'Watch').length;
  const fail = rows.filter((r) => r.regressionStatus === 'Fail').length;
  return {
    quality: avg(rows.map((r) => r.qualityScore)),
    hallucination: avg(rows.map((r) => r.hallucinationScore)),
    safety: avg(rows.map((r) => r.safetyScore)),
    grounding: avg(rows.map((r) => r.groundingScore)),
    regressionPassRate: rows.length ? Math.round((pass / rows.length) * 100) : 0,
    regressionPass: pass,
    regressionWatch: watch,
    regressionFail: fail,
    evaluated: rows.length,
  };
}

/** Executive evaluation narrative shown on the landing footer. */
export const AI_EVALUATION_EXEC_SUMMARY =
  'AI evaluation posture is healthy with an average quality of 87% and hallucination safety of 94%. Grounding is the weakest dimension (87%), concentrated in the Compliance Monitoring assistant. One model (Credit Scoring) failed regression on a fairness slice and is blocked from promotion. Recommended executive action: hold Credit Scoring release and prioritize grounding improvements for regulatory assistants.';
