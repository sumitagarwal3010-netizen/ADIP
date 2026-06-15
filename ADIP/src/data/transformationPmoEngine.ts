import type { PersonaId } from '../config/personaConfig';
import type { TransformationAiInsight, TransformationPmoKpis } from '../types/transformationPmo';
import { TRANSFORMATION_PMO_ALLOWED_PERSONAS } from '../types/transformationPmo';
import {
  TPMO_BENEFITS,
  TPMO_BUSINESS_UNITS,
  TPMO_COMMITMENTS,
  TPMO_DEPENDENCIES,
  TPMO_INITIATIVES,
  TPMO_MILESTONES,
  TPMO_OBJECTIVES,
  TPMO_PROGRAMS,
  TPMO_RISKS,
  TPMO_TRACEABILITY_CHAINS,
} from './transformationPmoMock';

export function canAccessTransformationPmo(personaId: PersonaId): boolean {
  return TRANSFORMATION_PMO_ALLOWED_PERSONAS.includes(personaId);
}

export function computeTransformationPmoKpis(): TransformationPmoKpis {
  const transformationHealth = Math.round(TPMO_PROGRAMS.reduce((s, p) => s + p.health, 0) / TPMO_PROGRAMS.length);
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
      recommendation: `${atRisk.length} programs at-risk/off-track. Prioritize recovery for ${atRisk[0]?.name ?? 'top program'} (health ${atRisk[0]?.health ?? 0}%) — reset scope, add governance cadence, and re-baseline milestones.`,
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
      recommendation: `Overall transformation health ${kpis.transformationHealth}%. Retail and Digital units lead; strengthen governance on units below 60% health to protect board commitments.`,
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

export { TPMO_TRACEABILITY_CHAINS };
