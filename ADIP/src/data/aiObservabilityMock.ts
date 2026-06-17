/**
 * AI Observability Center mock data.
 *
 * Executive-first: landing surfaces only top-level metrics (usage, tokens,
 * cost, latency, error rate). Per-model detail lives in `AI_OBSERVABILITY`
 * and is revealed via drilldown (resolver: `ai-observability.*`).
 *
 * No backend — static enterprise-realistic banking mock data.
 */

export interface AIObservabilityEntry {
  id: string;
  model: string;
  application: string;
  callsPerDay: number;
  tokensPerDayM: number; // millions of tokens / day
  monthlyCostUsd: number;
  p95LatencyMs: number;
  errorRatePct: number;
  owner: string;
}

export const AI_OBSERVABILITY: AIObservabilityEntry[] = [
  { id: 'OBS-001', model: 'Customer Service Copilot (gpt-4o)', application: 'Customer Service', callsPerDay: 184000, tokensPerDayM: 142.0, monthlyCostUsd: 86400, p95LatencyMs: 1820, errorRatePct: 0.9, owner: 'Digital CX' },
  { id: 'OBS-002', model: 'Fraud Detection Model', application: 'Payments', callsPerDay: 1240000, tokensPerDayM: 6.2, monthlyCostUsd: 21500, p95LatencyMs: 140, errorRatePct: 0.2, owner: 'Payments Risk' },
  { id: 'OBS-003', model: 'Collections Assistant (gpt-4o-mini)', application: 'Collections', callsPerDay: 52000, tokensPerDayM: 28.5, monthlyCostUsd: 9800, p95LatencyMs: 760, errorRatePct: 0.6, owner: 'Collections' },
  { id: 'OBS-004', model: 'KYC Verification AI', application: 'Onboarding', callsPerDay: 38000, tokensPerDayM: 4.1, monthlyCostUsd: 14200, p95LatencyMs: 980, errorRatePct: 1.1, owner: 'Compliance' },
  { id: 'OBS-005', model: 'Transaction Anomaly Detection', application: 'Financial Crime', callsPerDay: 920000, tokensPerDayM: 3.4, monthlyCostUsd: 12600, p95LatencyMs: 110, errorRatePct: 0.3, owner: 'Financial Crime' },
  { id: 'OBS-006', model: 'Document Classification', application: 'Operations', callsPerDay: 67000, tokensPerDayM: 9.8, monthlyCostUsd: 5400, p95LatencyMs: 540, errorRatePct: 0.5, owner: 'Operations Automation' },
  { id: 'OBS-007', model: 'Compliance Monitoring AI', application: 'Regulatory', callsPerDay: 14000, tokensPerDayM: 18.2, monthlyCostUsd: 11900, p95LatencyMs: 2100, errorRatePct: 1.4, owner: 'Regulatory Affairs' },
  { id: 'OBS-008', model: 'Merchant Recommendation Engine', application: 'Merchant Banking', callsPerDay: 210000, tokensPerDayM: 2.1, monthlyCostUsd: 4300, p95LatencyMs: 220, errorRatePct: 0.4, owner: 'Merchant Banking' },
];

export interface AIObservabilityScores {
  activeModels: number;
  callsPerDayM: number; // millions of calls / day
  tokensPerDayM: number; // millions of tokens / day
  monthlyCostUsd: number;
  p95LatencyMs: number; // weighted-ish (max of heavy services) — executive headline
  avgErrorRatePct: number;
}

export function computeObservabilityScores(rows: AIObservabilityEntry[] = AI_OBSERVABILITY): AIObservabilityScores {
  const totalCalls = rows.reduce((a, r) => a + r.callsPerDay, 0);
  const totalTokens = rows.reduce((a, r) => a + r.tokensPerDayM, 0);
  const totalCost = rows.reduce((a, r) => a + r.monthlyCostUsd, 0);
  // Call-weighted average error rate for an executive-meaningful headline.
  const weightedErr = totalCalls
    ? rows.reduce((a, r) => a + r.errorRatePct * r.callsPerDay, 0) / totalCalls
    : 0;
  const p95 = rows.length ? Math.max(...rows.map((r) => r.p95LatencyMs)) : 0;
  return {
    activeModels: rows.length,
    callsPerDayM: Math.round((totalCalls / 1_000_000) * 10) / 10,
    tokensPerDayM: Math.round(totalTokens),
    monthlyCostUsd: totalCost,
    p95LatencyMs: p95,
    avgErrorRatePct: Math.round(weightedErr * 100) / 100,
  };
}

/** Executive observability narrative shown on the landing footer. */
export const AI_OBSERVABILITY_EXEC_SUMMARY =
  'AI platform is serving ~2.9M calls/day across 8 production models at a run-rate of ~$166K/month. Call-weighted error rate is healthy at 0.4%, dominated by high-volume fraud and anomaly models. Latency outliers are the GenAI assistants (Compliance Monitoring p95 ~2.1s, Customer Service Copilot ~1.8s). Recommended executive action: optimize GenAI context windows and confirm cost guardrails before scaling the copilot to new channels.';
