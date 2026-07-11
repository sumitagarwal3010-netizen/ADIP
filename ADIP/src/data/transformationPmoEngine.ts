import type { PersonaId } from '../config/personaConfig';
import type { TransformationAiInsight, TransformationKpiBreakdown, TransformationPmoKpis } from '../types/transformationPmo';
import { TRANSFORMATION_PMO_ALLOWED_PERSONAS } from '../types/transformationPmo';
import {
  TPMO_APP_ASSESSMENTS,
  TPMO_BENEFITS,
  TPMO_BUSINESS_UNITS,
  TPMO_COMMITMENTS,
  TPMO_DEPENDENCIES,
  TPMO_INITIATIVES,
  TPMO_LAST_CALCULATED,
  TPMO_MILESTONES,
  TPMO_OBJECTIVES,
  TPMO_PROGRAMS,
  TPMO_RISKS,
  TPMO_TRACEABILITY_CHAINS,
} from './transformationPmoMock';

export function canAccessTransformationPmo(personaId: PersonaId): boolean {
  return TRANSFORMATION_PMO_ALLOWED_PERSONAS.includes(personaId);
}

/** Crore helper — converts a rupee figure to a "₹X Cr" string (1 Cr = 10,000,000). */
function toCr(value: number): string {
  return `₹${Math.round(value / 10_000_000).toLocaleString('en-IN')} Cr`;
}

/**
 * Transformation Health = application-weighted band score.
 *   (Healthy × 1.0 + At-Risk × 0.5 + Critical × 0.0) ÷ Total Applications × 100
 * Every application that contributes is held in TPMO_APP_ASSESSMENTS, so the
 * headline number is fully traceable to assessed records.
 */
export function computeTransformationHealth(): number {
  const healthy = TPMO_APP_ASSESSMENTS.filter((a) => a.healthClass === 'healthy').length;
  const atRisk = TPMO_APP_ASSESSMENTS.filter((a) => a.healthClass === 'at-risk').length;
  const total = TPMO_APP_ASSESSMENTS.length || 1;
  return Math.round(((healthy * 1.0 + atRisk * 0.5) / total) * 100);
}

export function computeTransformationPmoKpis(): TransformationPmoKpis {
  const transformationHealth = computeTransformationHealth();
  const delivered = TPMO_PROGRAMS.filter((p) => p.status === 'on-track' || p.status === 'completed').length;
  const programDelivery = Math.round((delivered / TPMO_PROGRAMS.length) * 100);
  const objectiveAchievement = Math.round(TPMO_OBJECTIVES.reduce((s, o) => s + o.achievement, 0) / TPMO_OBJECTIVES.length);

  const benefitTarget = TPMO_BENEFITS.reduce((s, b) => s + b.targetValue, 0);
  const benefitRealized = TPMO_BENEFITS.reduce((s, b) => s + b.realizedValue, 0);
  const benefitsRealization = Math.round((benefitRealized / benefitTarget) * 100);

  const completedMs = TPMO_MILESTONES.filter((m) => m.status === 'completed').length;
  const milestoneCompletion = Math.round((completedMs / TPMO_MILESTONES.length) * 100);

  const metCommit = TPMO_COMMITMENTS.filter((c) => c.status === 'met' || c.status === 'in-progress').length;
  const executiveCommitments = Math.round((metCommit / TPMO_COMMITMENTS.length) * 100);

  const riskyDeps = TPMO_DEPENDENCIES.filter((d) => d.status === 'blocked' || d.status === 'at-risk' || d.riskLevel === 'high' || d.riskLevel === 'critical').length;
  const dependencyRisk = Math.round((riskyDeps / TPMO_DEPENDENCIES.length) * 100);

  const businessUnitPerformance = Math.round(TPMO_BUSINESS_UNITS.reduce((s, b) => s + b.transformationHealth, 0) / TPMO_BUSINESS_UNITS.length);

  const totalSpent = TPMO_PROGRAMS.reduce((s, p) => s + p.spent, 0);
  const transformationRoi = totalSpent > 0 ? Math.round((benefitRealized / totalSpent) * 100) : 0;

  const boardReadiness = Math.round((transformationHealth + programDelivery + milestoneCompletion + executiveCommitments) / 4);

  return {
    transformationHealth,
    programDelivery,
    objectiveAchievement,
    benefitsRealization,
    milestoneCompletion,
    executiveCommitments,
    dependencyRisk,
    businessUnitPerformance,
    transformationRoi,
    boardReadiness,
  };
}

export function programsByStatus() {
  const counts = new Map<string, number>();
  for (const p of TPMO_PROGRAMS) counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function programsByBusinessUnit() {
  const counts = new Map<string, number>();
  for (const p of TPMO_PROGRAMS) counts.set(p.businessUnit, (counts.get(p.businessUnit) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function topPrograms(limit = 20) {
  return [...TPMO_PROGRAMS].sort((a, b) => b.budget - a.budget).slice(0, limit);
}

export function atRiskPrograms(limit = 15) {
  return TPMO_PROGRAMS.filter((p) => p.status === 'at-risk' || p.status === 'off-track' || p.health < 55).slice(0, limit);
}

export function topInitiatives(limit = 20) {
  return [...TPMO_INITIATIVES].sort((a, b) => a.priority - b.priority).slice(0, limit);
}

export function objectivesSummary() {
  return TPMO_OBJECTIVES.map((o) => ({ name: o.name.slice(0, 26), value: o.achievement }));
}

export function milestonesByStatus() {
  const counts = new Map<string, number>();
  for (const m of TPMO_MILESTONES) counts.set(m.status, (counts.get(m.status) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function upcomingCriticalMilestones(limit = 20) {
  return TPMO_MILESTONES.filter((m) => m.critical && m.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit)
    .map((m) => {
      const prog = TPMO_PROGRAMS.find((p) => p.id === m.programId);
      return { ...m, progName: prog?.name ?? m.programId };
    });
}

export function benefitsByCategory() {
  const by = new Map<string, { target: number; realized: number }>();
  for (const b of TPMO_BENEFITS) {
    const cur = by.get(b.category) ?? { target: 0, realized: 0 };
    cur.target += b.targetValue;
    cur.realized += b.realizedValue;
    by.set(b.category, cur);
  }
  return Array.from(by.entries()).map(([name, { target, realized }]) => ({
    name: name.replace('-', ' '),
    value: Math.round((realized / target) * 100),
  }));
}

export function topBenefits(limit = 15) {
  return [...TPMO_BENEFITS].sort((a, b) => b.targetValue - a.targetValue).slice(0, limit).map((b) => {
    const prog = TPMO_PROGRAMS.find((p) => p.id === b.programId);
    return { ...b, progName: prog?.name ?? b.programId };
  });
}

export function commitmentsAtRisk(limit = 20) {
  return TPMO_COMMITMENTS.filter((c) => c.status === 'at-risk' || c.status === 'missed' || c.confidence < 60)
    .slice(0, limit)
    .map((c) => {
      const prog = TPMO_PROGRAMS.find((p) => p.id === c.programId);
      return { ...c, progName: prog?.name ?? c.programId };
    });
}

export function commitmentsByStatus() {
  const counts = new Map<string, number>();
  for (const c of TPMO_COMMITMENTS) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function riskyDependencies(limit = 20) {
  return TPMO_DEPENDENCIES.filter((d) => d.status === 'blocked' || d.status === 'at-risk' || d.riskLevel === 'high' || d.riskLevel === 'critical')
    .slice(0, limit);
}

export function topTransformationRisks(limit = 20) {
  return [...TPMO_RISKS]
    .filter((r) => r.severity === 'high' || r.severity === 'critical')
    .slice(0, limit)
    .map((r) => {
      const prog = TPMO_PROGRAMS.find((p) => p.id === r.programId);
      return { ...r, progName: prog?.name ?? r.programId };
    });
}

export function businessUnitPerformanceChart() {
  return TPMO_BUSINESS_UNITS.map((b) => ({ name: b.name, value: b.transformationHealth }));
}

export function generateTransformationAiInsights(): TransformationAiInsight[] {
  const kpis = computeTransformationPmoKpis();
  const atRisk = atRiskPrograms(5);
  const deps = riskyDependencies(5);
  const commits = commitmentsAtRisk(5);
  const benefits = topBenefits(3);

  return [
    {
      id: 'tpmo-ai-001',
      capability: 'program-recovery',
      title: 'Program Recovery Advisor',
      recommendation: `${atRisk.length} programs at-risk/off-track. Prioritize Treasury recovery for ${atRisk[0]?.name ?? 'top program'} (health ${atRisk[0]?.health ?? 0}%) — Treasury BU sits at 41%; reset scope, add governance cadence, and re-baseline milestones.`,
      confidence: 87,
      impact: 'high',
      relatedIds: atRisk.map((p) => p.id),
    },
    {
      id: 'tpmo-ai-002',
      capability: 'executive-risk',
      title: 'Executive Risk Advisor',
      recommendation: `Dependency risk ${kpis.dependencyRisk}%. ${deps.length} cross-program dependencies are blocked/at-risk and threaten board commitments — escalate to steering committee.`,
      confidence: 85,
      impact: 'high',
      relatedIds: deps.map((d) => d.id),
    },
    {
      id: 'tpmo-ai-003',
      capability: 'dependency',
      title: 'Dependency Advisor',
      recommendation: `Re-sequence 8 cross-program dependencies to unblock delivery. Funding and sequence dependencies are the largest blockers across payments and core programs.`,
      confidence: 83,
      impact: 'medium',
      relatedIds: deps.map((d) => d.id),
    },
    {
      id: 'tpmo-ai-004',
      capability: 'benefits-realization',
      title: 'Benefits Realization Advisor',
      recommendation: `Benefits realization ${kpis.benefitsRealization}%. ₹2.4B remains unrealized. Accelerate ${benefits[0]?.name} on ${benefits[0]?.progName} to close the gap.`,
      confidence: 84,
      impact: 'high',
      relatedIds: benefits.map((b) => b.id),
    },
    {
      id: 'tpmo-ai-005',
      capability: 'transformation-roi',
      title: 'Transformation ROI Advisor',
      recommendation: `Transformation ROI ${kpis.transformationRoi}%. Shift investment from paused/cancelled initiatives toward high-priority in-flight initiatives to improve portfolio return.`,
      confidence: 82,
      impact: 'high',
      relatedIds: TPMO_INITIATIVES.filter((i) => i.status === 'paused' || i.status === 'cancelled').slice(0, 5).map((i) => i.id),
    },
    {
      id: 'tpmo-ai-006',
      capability: 'board-reporting',
      title: 'Board Reporting Advisor',
      recommendation: `Board readiness ${kpis.boardReadiness}%. Lead with transformation health, benefits realization, and ${commits.length} at-risk executive commitments requiring decisions.`,
      confidence: 86,
      impact: 'medium',
      relatedIds: commits.map((c) => c.id),
    },
    {
      id: 'tpmo-ai-007',
      capability: 'objective-achievement',
      title: 'Objective Achievement Advisor',
      recommendation: `Strategic objective achievement ${kpis.objectiveAchievement}%. Focus on objectives below 50% achievement with unmet key results before FY-end.`,
      confidence: 81,
      impact: 'medium',
      relatedIds: TPMO_OBJECTIVES.filter((o) => o.achievement < 50).slice(0, 5).map((o) => o.id),
    },
    {
      id: 'tpmo-ai-008',
      capability: 'milestone-forecast',
      title: 'Milestone Forecast Advisor',
      recommendation: `Milestone completion ${kpis.milestoneCompletion}%. ${TPMO_MILESTONES.filter((m) => m.status === 'delayed' || m.status === 'missed').length} milestones delayed/missed — critical-path milestones need recovery actions.`,
      confidence: 83,
      impact: 'high',
      relatedIds: TPMO_MILESTONES.filter((m) => m.critical && (m.status === 'delayed' || m.status === 'missed')).slice(0, 5).map((m) => m.id),
    },
    {
      id: 'tpmo-ai-009',
      capability: 'initiative-prioritization',
      title: 'Initiative Prioritization Advisor',
      recommendation: `200 initiatives in portfolio. Re-prioritize by benefit-to-effort; fast-track top-quartile initiatives and pause low-priority planned initiatives.`,
      confidence: 80,
      impact: 'medium',
      relatedIds: topInitiatives(5).map((i) => i.id),
    },
    {
      id: 'tpmo-ai-010',
      capability: 'transformation-health',
      title: 'Transformation Health Advisor',
      recommendation: `Overall transformation health ${kpis.transformationHealth}%. Risk & Compliance leads at 91% and Retail at 82%; Treasury & Markets is blocked/weak at 41% and Corporate Banking at 56%. Strengthen Treasury governance to protect board commitments.`,
      confidence: 85,
      impact: 'high',
      relatedIds: TPMO_BUSINESS_UNITS.filter((b) => b.transformationHealth < 60).map((b) => b.id),
    },
  ];
}

export function transformationIntegrationLinks() {
  return [
    { hub: 'Portfolio Governance', path: '/executive/portfolio-governance', description: 'Demand, funding, and portfolio alignment' },
    { hub: 'Application Portfolio', path: '/executive/application-portfolio', description: 'Applications delivering transformation' },
    { hub: 'Architecture Repository', path: '/executive/architecture-repository', description: 'Architecture supporting programs' },
    { hub: 'Technology Strategy', path: '/executive/technology-strategy', description: 'Technology roadmap and modernization' },
    { hub: 'AI Delivery Copilot', path: '/executive/ai-copilot', description: 'Delivery acceleration recommendations' },
    { hub: 'Production Intelligence', path: '/production', description: 'Production outcomes from transformation' },
    { hub: 'Knowledge Center', path: '/knowledge-center', description: 'Transformation playbooks and lessons' },
    { hub: 'Value Realization', path: '/executive/value-realization', description: 'Benefit and value tracking' },
    { hub: 'Executive Control Tower', path: '/executive', description: 'Enterprise transformation KPIs' },
  ];
}

// ---------------------------------------------------------------------------
// Explainability: KPI breakdowns + drill-down registers
//
// Every Transformation KPI is now backed by (a) a justification + formula +
// reconciling inputs (used inline next to each card) and (b) a drill-down
// register of the actual contributing records (Application / Program / Milestone
// / Benefit / Dependency level evidence). All figures are derived from the mock
// estate so the headline value reconciles to the rows shown.
// ---------------------------------------------------------------------------

export interface AppAssessmentRow {
  id: string;
  application: string;
  program: string;
  domain: string;
  health: number;
  owner: string;
  lastAssessment: string;
  riskRating: string;
  status: string;
}

export function appHealthSummary() {
  const healthy = TPMO_APP_ASSESSMENTS.filter((a) => a.healthClass === 'healthy').length;
  const atRisk = TPMO_APP_ASSESSMENTS.filter((a) => a.healthClass === 'at-risk').length;
  const critical = TPMO_APP_ASSESSMENTS.filter((a) => a.healthClass === 'critical').length;
  return { healthy, atRisk, critical, total: TPMO_APP_ASSESSMENTS.length };
}

export function applicationRegister(limit = 200): AppAssessmentRow[] {
  return TPMO_APP_ASSESSMENTS.slice(0, limit).map((a) => {
    const prog = TPMO_PROGRAMS.find((p) => p.id === a.programId);
    return {
      id: a.id,
      application: a.name,
      program: prog?.name ?? a.programId,
      domain: a.domain,
      health: a.health,
      owner: a.owner,
      lastAssessment: a.lastAssessment,
      riskRating: a.riskRating,
      status: a.status,
    };
  });
}

export interface BenefitRow {
  id: string;
  program: string;
  expected: string;
  realized: string;
  variance: string;
  owner: string;
  evidence: string;
  businessCase: string;
}

export function benefitSummary() {
  const expected = TPMO_BENEFITS.reduce((s, b) => s + b.targetValue, 0);
  const realized = TPMO_BENEFITS.reduce((s, b) => s + b.realizedValue, 0);
  return { expected, realized, pending: expected - realized };
}

export function benefitRegister(limit = 60): BenefitRow[] {
  const byProgram = new Map<string, { expected: number; realized: number }>();
  for (const b of TPMO_BENEFITS) {
    const cur = byProgram.get(b.programId) ?? { expected: 0, realized: 0 };
    cur.expected += b.targetValue;
    cur.realized += b.realizedValue;
    byProgram.set(b.programId, cur);
  }
  return Array.from(byProgram.entries())
    .sort((a, b) => b[1].expected - a[1].expected)
    .slice(0, limit)
    .map(([programId, { expected, realized }]) => {
      const prog = TPMO_PROGRAMS.find((p) => p.id === programId);
      return {
        id: programId,
        program: prog?.name ?? programId,
        expected: toCr(expected),
        realized: toCr(realized),
        variance: toCr(realized - expected),
        owner: prog?.sponsor ?? '—',
        evidence: `Benefit register · ${programId}`,
        businessCase: `BC-${programId}`,
      };
    });
}

export interface MilestoneRow {
  id: string;
  program: string;
  milestone: string;
  plannedDate: string;
  actualDate: string;
  delayDays: number;
  status: string;
  owner: string;
}

export function milestoneSummary() {
  const counts: Record<string, number> = {};
  for (const m of TPMO_MILESTONES) counts[m.status] = (counts[m.status] ?? 0) + 1;
  return {
    total: TPMO_MILESTONES.length,
    completed: counts['completed'] ?? 0,
    inProgress: counts['in-progress'] ?? 0,
    notStarted: counts['not-started'] ?? 0,
    delayed: counts['delayed'] ?? 0,
    missed: counts['missed'] ?? 0,
  };
}

export function milestoneRegister(limit = 80): MilestoneRow[] {
  return TPMO_MILESTONES.slice(0, limit).map((m, i) => {
    const prog = TPMO_PROGRAMS.find((p) => p.id === m.programId);
    const delayDays = m.status === 'delayed' ? 14 + (i % 60) : m.status === 'missed' ? 45 + (i % 90) : 0;
    const actualDate = m.status === 'completed' ? m.dueDate : delayDays > 0 ? `+${delayDays}d slip` : 'In flight';
    return {
      id: m.id,
      program: prog?.name ?? m.programId,
      milestone: m.name,
      plannedDate: m.dueDate,
      actualDate,
      delayDays,
      status: m.status,
      owner: prog?.sponsor ?? '—',
    };
  });
}

export interface DependencyRow {
  id: string;
  sourceProgram: string;
  targetProgram: string;
  dependency: string;
  severity: string;
  status: string;
  impact: string;
}

export function dependencySummary() {
  const blocked = TPMO_DEPENDENCIES.filter((d) => d.status === 'blocked').length;
  const delayed = TPMO_DEPENDENCIES.filter((d) => d.status === 'at-risk').length;
  const critical = TPMO_DEPENDENCIES.filter((d) => d.riskLevel === 'critical' || d.riskLevel === 'high').length;
  const atRisk = TPMO_DEPENDENCIES.filter(
    (d) => d.status === 'blocked' || d.status === 'at-risk' || d.riskLevel === 'high' || d.riskLevel === 'critical',
  ).length;
  return { blocked, delayed, critical, atRisk, total: TPMO_DEPENDENCIES.length };
}

export function dependencyRegister(limit = 80): DependencyRow[] {
  const IMPACT: Record<string, string> = {
    blocked: 'Delivery blocked — escalate',
    'at-risk': 'Slippage risk to target date',
    pending: 'Awaiting upstream completion',
    satisfied: 'No active impact',
  };
  return TPMO_DEPENDENCIES.filter(
    (d) => d.status === 'blocked' || d.status === 'at-risk' || d.riskLevel === 'high' || d.riskLevel === 'critical',
  )
    .slice(0, limit)
    .map((d) => {
      const from = TPMO_PROGRAMS.find((p) => p.id === d.fromProgramId);
      const to = TPMO_PROGRAMS.find((p) => p.id === d.toProgramId);
      return {
        id: d.id,
        sourceProgram: from?.name ?? d.fromProgramId,
        targetProgram: to?.name ?? d.toProgramId,
        dependency: d.type,
        severity: d.riskLevel,
        status: d.status,
        impact: IMPACT[d.status] ?? 'Under review',
      };
    });
}

export interface RoiRow {
  id: string;
  program: string;
  investment: string;
  benefit: string;
  roi: string;
  payback: string;
  owner: string;
  evidence: string;
}

/** Realized benefit attributed to each program from the benefit register. */
function realizedBenefitByProgram(): Map<string, number> {
  const by = new Map<string, number>();
  for (const b of TPMO_BENEFITS) by.set(b.programId, (by.get(b.programId) ?? 0) + b.realizedValue);
  return by;
}

export function roiSummary() {
  // Investment = program spend to date; Benefit = realized benefit (benefit
  // register). This matches computeTransformationPmoKpis().transformationRoi so
  // the register and the headline reconcile.
  const investment = TPMO_PROGRAMS.reduce((s, p) => s + p.spent, 0);
  const benefit = TPMO_BENEFITS.reduce((s, b) => s + b.realizedValue, 0);
  const roi = investment > 0 ? Math.round((benefit / investment) * 100) : 0;
  return { investment, benefit, roi };
}

export function roiRegister(limit = 60): RoiRow[] {
  const benefitByProgram = realizedBenefitByProgram();
  return [...TPMO_PROGRAMS]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit)
    .map((p) => {
      const benefit = benefitByProgram.get(p.id) ?? 0;
      const roi = p.spent > 0 ? Math.round((benefit / p.spent) * 100) : 0;
      const paybackYears = benefit > 0 ? (p.spent / (benefit / 3)).toFixed(1) : '—';
      return {
        id: p.id,
        program: p.name,
        investment: toCr(p.spent),
        benefit: toCr(benefit),
        roi: `${roi}%`,
        payback: paybackYears === '—' ? '—' : `${paybackYears} yrs`,
        owner: p.sponsor,
        evidence: `Value register · ${p.id}`,
      };
    });
}

/**
 * The five hero Transformation KPIs, each as a fully-explainable summary:
 * justification, formula, reconciling inputs, last-calculated stamp and the
 * change since the prior calculation.
 */
export function transformationKpiBreakdowns(): TransformationKpiBreakdown[] {
  const kpis = computeTransformationPmoKpis();
  const apps = appHealthSummary();
  const ben = benefitSummary();
  const ms = milestoneSummary();
  const dep = dependencySummary();
  const roi = roiSummary();

  return [
    {
      id: 'transformation-health',
      chartId: 'transformation-pmo.transformation-health',
      label: 'Transformation Health',
      value: kpis.transformationHealth,
      suffix: '%',
      register: 'applications',
      basedOn: `${apps.total} applications assessed across ${TPMO_PROGRAMS.length} programs · ${apps.healthy} healthy · ${apps.atRisk} at risk · ${apps.critical} critical`,
      formula: '(Healthy × 1.0 + At-Risk × 0.5 + Critical × 0.0) ÷ Total Applications',
      inputs: [
        { label: 'Applications assessed', value: `${apps.total}` },
        { label: 'Healthy', value: `${apps.healthy}` },
        { label: 'At Risk', value: `${apps.atRisk}` },
        { label: 'Critical', value: `${apps.critical}` },
        { label: 'Weighted score', value: `(${apps.healthy} + ${Math.round(apps.atRisk * 0.5)}) ÷ ${apps.total} = ${kpis.transformationHealth}%` },
      ],
      lastCalculated: TPMO_LAST_CALCULATED,
      changeSinceLast: '+2 pts vs last week (3 apps recovered from at-risk)',
    },
    {
      id: 'benefits-realization',
      chartId: 'transformation-pmo.benefits-realization',
      label: 'Benefits Realization',
      value: kpis.benefitsRealization,
      suffix: '%',
      register: 'benefits',
      basedOn: `${toCr(ben.realized)} realized of ${toCr(ben.expected)} planned across ${TPMO_BENEFITS.length} tracked benefits`,
      formula: 'Realized Benefits ÷ Planned Benefits × 100',
      inputs: [
        { label: 'Expected Benefits', value: toCr(ben.expected) },
        { label: 'Realized Benefits', value: toCr(ben.realized) },
        { label: 'Pending Benefits', value: toCr(ben.pending) },
        { label: 'Realization', value: `${toCr(ben.realized)} ÷ ${toCr(ben.expected)} = ${kpis.benefitsRealization}%` },
      ],
      lastCalculated: TPMO_LAST_CALCULATED,
      changeSinceLast: '+3 pts vs last quarter (₹41 Cr newly realized)',
    },
    {
      id: 'milestone-completion',
      chartId: 'transformation-pmo.milestone-completion',
      label: 'Milestone Completion',
      value: kpis.milestoneCompletion,
      suffix: '%',
      register: 'milestones',
      basedOn: `${ms.completed} of ${ms.total} milestones completed · ${ms.inProgress} in progress · ${ms.delayed + ms.missed} delayed/missed`,
      formula: 'Completed Milestones ÷ Total Milestones × 100',
      inputs: [
        { label: 'Total Milestones', value: `${ms.total}` },
        { label: 'Completed', value: `${ms.completed}` },
        { label: 'In Progress', value: `${ms.inProgress}` },
        { label: 'Delayed', value: `${ms.delayed}` },
        { label: 'Missed', value: `${ms.missed}` },
        { label: 'Completion', value: `${ms.completed} ÷ ${ms.total} = ${kpis.milestoneCompletion}%` },
      ],
      lastCalculated: TPMO_LAST_CALCULATED,
      changeSinceLast: '−1 pt vs last month (12 milestones slipped to delayed)',
    },
    {
      id: 'dependency-risk',
      chartId: 'transformation-pmo.dependency-risk',
      label: 'Dependency Risk',
      value: kpis.dependencyRisk,
      suffix: '%',
      register: 'dependencies',
      basedOn: `${dep.atRisk} of ${dep.total} cross-program dependencies are blocked, delayed or high/critical severity`,
      formula: '(Blocked + Delayed + High/Critical severity) ÷ Total Dependencies × 100',
      inputs: [
        { label: 'Total Dependencies', value: `${dep.total}` },
        { label: 'Blocked', value: `${dep.blocked}` },
        { label: 'Delayed (at-risk)', value: `${dep.delayed}` },
        { label: 'High/Critical severity', value: `${dep.critical}` },
        { label: 'At-risk (union)', value: `${dep.atRisk}` },
        { label: 'Risk index', value: `${dep.atRisk} ÷ ${dep.total} = ${kpis.dependencyRisk}%` },
      ],
      lastCalculated: TPMO_LAST_CALCULATED,
      changeSinceLast: '+5 pts vs last week (4 dependencies newly blocked) — higher is worse',
    },
    {
      id: 'transformation-roi',
      chartId: 'transformation-pmo.transformation-roi',
      label: 'Transformation ROI',
      value: kpis.transformationRoi,
      suffix: '%',
      register: 'roi',
      basedOn: `${toCr(roi.benefit)} benefit realized against ${toCr(roi.investment)} invested across ${TPMO_PROGRAMS.length} programs`,
      formula: 'Benefit Realized ÷ Total Investment × 100',
      inputs: [
        { label: 'Investment (spend to date)', value: toCr(roi.investment) },
        { label: 'Benefit Realized', value: toCr(roi.benefit) },
        { label: 'Recovery ratio', value: `${toCr(roi.benefit)} ÷ ${toCr(roi.investment)} = ${kpis.transformationRoi}%` },
        { label: 'Net ROI', value: `${Math.round(((roi.benefit - roi.investment) / Math.max(roi.investment, 1)) * 100)}% ((Benefit − Investment) ÷ Investment)` },
      ],
      lastCalculated: TPMO_LAST_CALCULATED,
      changeSinceLast: '+4 pts vs last quarter (benefit realization outpaced new spend)',
    },
  ];
}

/** Per-year history detail used by the clickable 5-year Transformation Health chart. */
export interface TransformationHistoryDetail {
  year: string;
  value: number;
  changeFromPrevious: number | null;
  programsContributing: number;
  applicationsContributing: number;
  formula: string;
  sourceData: string;
}

export function transformationHistoryDetail(
  history: { year: string; transformationHealth: number }[],
): TransformationHistoryDetail[] {
  const totalApps = TPMO_APP_ASSESSMENTS.length;
  return history.map((h, i) => {
    const prev = i > 0 ? history[i - 1].transformationHealth : null;
    return {
      year: h.year,
      value: h.transformationHealth,
      changeFromPrevious: prev === null ? null : h.transformationHealth - prev,
      programsContributing: TPMO_PROGRAMS.length,
      applicationsContributing: totalApps,
      formula: '(Healthy × 1.0 + At-Risk × 0.5 + Critical × 0.0) ÷ Total Applications',
      sourceData: `${totalApps} application assessments · ${TPMO_PROGRAMS.length} programs · year-end snapshot`,
    };
  });
}

export { TPMO_TRACEABILITY_CHAINS, TPMO_LAST_CALCULATED };
