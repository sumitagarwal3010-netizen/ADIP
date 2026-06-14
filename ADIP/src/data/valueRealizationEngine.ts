import type { PersonaId } from '../config/personaConfig';
import type {
  BusinessCaseSummary,
  RoiInputs,
  RoiOutputs,
  ValueRealizationKpis,
} from '../types/valueRealization';
import { VALUE_REALIZATION_ALLOWED_PERSONAS } from '../types/valueRealization';
import {
  BENCHMARK_METRICS,
  BUSINESS_CASE,
  MATURITY_SCORES,
  PRODUCTIVITY_GAINS,
  PROGRAMS,
  VALUE_PROJECTS,
  VALUE_TREND_HISTORY,
  VALUE_TRACEABILITY_CHAINS,
} from './valueRealizationMock';

export function canAccessValueRealization(personaId: PersonaId): boolean {
  return VALUE_REALIZATION_ALLOWED_PERSONAS.includes(personaId);
}

export function computeValueRealizationKpis(): ValueRealizationKpis {
  const hoursSaved = VALUE_PROJECTS.reduce((s, p) => s + p.hoursSaved, 0);
  const fteSavings = Math.round(VALUE_PROJECTS.reduce((s, p) => s + p.fteSavings, 0) * 10) / 10;
  const annualValue = VALUE_PROJECTS.reduce((s, p) => s + p.valueRealized, 0);
  const defectsPrevented = VALUE_PROJECTS.reduce((s, p) => s + p.defectsPrevented, 0);
  const avgCycle = VALUE_PROJECTS.length
    ? Math.round(VALUE_PROJECTS.reduce((s, p) => s + p.cycleTimeReduction, 0) / VALUE_PROJECTS.length)
    : 0;
  const maturity = Math.round(MATURITY_SCORES.reduce((s, m) => s + m.score, 0) / MATURITY_SCORES.length);
  const latest = VALUE_TREND_HISTORY[VALUE_TREND_HISTORY.length - 1];
  const threeYear = VALUE_TREND_HISTORY.reduce((s, t) => s + t.valueRealized, 0);

  return {
    hoursSaved,
    fteSavings,
    productivityGain: latest.productivityGain,
    defectsPrevented,
    auditFindingsPrevented: 186,
    riskReduction: latest.riskReduction,
    cycleTimeReduction: avgCycle,
    releaseVelocityImprovement: 128,
    approvalTimeReduction: 61,
    evidenceCollectionReduction: 60,
    costAvoidance: 4_200_000,
    annualValueRealized: annualValue,
    threeYearProjectedValue: threeYear,
    annualValue: Math.round(annualValue / 100) * 100,
    roi: latest.roi,
    transformationScore: maturity,
    auditEfficiency: 68,
  };
}

export function deliveryAccelerationMetrics() {
  return [
    { name: 'Requirement Cycle', reduction: 32 },
    { name: 'Architecture Review', reduction: 28 },
    { name: 'Testing', reduction: 38 },
    { name: 'Approval', reduction: 61 },
    { name: 'Release', reduction: 45 },
    { name: 'End-to-End', reduction: 35 },
  ];
}

export function qualityImprovementMetrics() {
  return [
    { name: 'Defect Reduction', value: 42 },
    { name: 'Leakage Reduction', value: 57 },
    { name: 'Escaped Defects', value: 48 },
    { name: 'RCA Recurrence', value: 38 },
    { name: 'Prod Incidents', value: 45 },
    { name: 'Customer Impact', value: 34 },
  ];
}

export function governanceEfficiencyMetrics() {
  return [
    { name: 'Approval Cycle', value: 61 },
    { name: 'Control Coverage', value: 82 },
    { name: 'Evidence Readiness', value: 74 },
    { name: 'Compliance Readiness', value: 78 },
    { name: 'Gov Cost Reduction', value: 35 },
  ];
}

export function auditEfficiencyMetrics() {
  return [
    { name: 'Audit Prep', value: 58 },
    { name: 'Evidence Collection', value: 60 },
    { name: 'Observations', value: 42 },
    { name: 'Finding Closure', value: 55 },
    { name: 'Audit Readiness', value: 68 },
  ];
}

export function aiAdoptionMetrics() {
  return [
    { name: 'Copilot Usage', value: 94 },
    { name: 'Recs Generated', value: 200 },
    { name: 'Recs Adopted', value: 142 },
    { name: 'Knowledge Reuse', value: 78 },
    { name: 'Learning Adoption', value: 67 },
    { name: 'AI SDLC Coverage', value: 71 },
    { name: 'AI Gov Coverage', value: 68 },
  ];
}

export function benchmarkGapAnalysis() {
  return BENCHMARK_METRICS.map((m) => ({
    metric: m.metric,
    gap: Math.round(((m.aiSdlc - m.traditional) / m.traditional) * 100),
    progress: Math.round(((m.current - m.traditional) / (m.target - m.traditional)) * 100),
  }));
}

export function valueByPortfolio() {
  return PROGRAMS.reduce((acc, p) => {
    const existing = acc.find((x) => x.portfolioId === p.portfolioId);
    if (existing) existing.value += p.valueRealized;
    else acc.push({ portfolioId: p.portfolioId, value: p.valueRealized });
    return acc;
  }, [] as { portfolioId: string; value: number }[]).slice(0, 10);
}

export function calculateRoi(inputs: RoiInputs): RoiOutputs {
  const laborRate = 4500;
  const hoursPerFte = 1800;
  const totalStaff = inputs.developers + inputs.testers + inputs.architects + inputs.auditors + inputs.complianceStaff;
  const productivityGain = 0.32;
  const annualSavings = Math.round(
    totalStaff * hoursPerFte * productivityGain * laborRate / 100
    + inputs.projectsPerYear * 120_000
    + inputs.applications * 85_000,
  );
  const threeYearSavings = Math.round(annualSavings * 2.85);
  const investment = 4_500_000;
  const roi = Math.round(((annualSavings - investment / 3) / investment) * 100);
  const paybackMonths = Math.max(6, Math.round(investment / (annualSavings / 12)));

  return {
    annualSavings,
    threeYearSavings,
    roi,
    paybackMonths,
    transformationValue: Math.round(annualSavings * 1.28),
  };
}

export function getBusinessCase(): BusinessCaseSummary {
  return BUSINESS_CASE;
}

export function overallMaturityScore(): number {
  return Math.round(MATURITY_SCORES.reduce((s, m) => s + m.score, 0) / MATURITY_SCORES.length);
}

export { VALUE_TRACEABILITY_CHAINS, VALUE_TREND_HISTORY, PRODUCTIVITY_GAINS, MATURITY_SCORES, BENCHMARK_METRICS };
