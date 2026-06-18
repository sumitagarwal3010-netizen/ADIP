import type {
  AppHealthClass,
  BusinessUnitPerformance,
  CrossProgramDependency,
  ExecutiveCommitment,
  StrategicInitiative,
  StrategicObjective,
  TransformationAppAssessment,
  TransformationBenefit,
  TransformationHistoryPoint,
  TransformationMilestone,
  TransformationProgram,
  TransformationRisk,
  TransformationTraceabilityChain,
} from '../types/transformationPmo';

const BUSINESS_UNITS = ['Retail Banking', 'Corporate Banking', 'Treasury & Markets', 'Risk & Compliance', 'Digital & Payments'];
const PILLARS = ['Digital First', 'Customer Experience', 'Operational Excellence', 'Risk & Resilience', 'Growth & Innovation'];
const DOMAINS = ['UPI', 'Mobile Banking', 'Net Banking', 'Cards', 'Loans', 'Treasury', 'AML', 'KYC', 'Payments', 'Fraud Management', 'Trade Finance', 'Corporate Banking'];
const SPONSORS = ['CEO', 'CIO', 'CTO', 'COO', 'CRO', 'Head of Retail', 'Head of Digital', 'CFO'];
const PROGRAM_TYPES = ['Modernization', 'Cloud Migration', 'Digital Banking', 'Payments Transformation', 'Risk Platform', 'Data & AI', 'Core Banking Renewal', 'Customer 360'];

const PROG_STATUS = ['on-track', 'at-risk', 'off-track', 'completed', 'on-hold'] as const;
const RISK = ['low', 'medium', 'high', 'critical'] as const;
const MS_STATUS = ['not-started', 'in-progress', 'completed', 'delayed', 'missed'] as const;
const COMMIT_STATUS = ['committed', 'in-progress', 'met', 'missed', 'at-risk'] as const;
const INIT_STATUS = ['planned', 'in-flight', 'delivered', 'paused', 'cancelled'] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const TPMO_OBJECTIVES: StrategicObjective[] = Array.from({ length: 20 }, (_, i) => ({
  id: `OBJ-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(PILLARS, i)} — ${pick(['Grow digital adoption', 'Reduce cost-to-serve', 'Improve resilience', 'Modernize core', 'Accelerate payments', 'Embed AI'], i)}`,
  pillar: pick(PILLARS, i),
  targetYear: `${2026 + (i % 4)}`,
  achievement: 35 + (i % 60),
  keyResults: 3 + (i % 4),
  keyResultsMet: (i % 4),
  owner: pick(SPONSORS, i),
}));

export const TPMO_PROGRAMS: TransformationProgram[] = Array.from({ length: 50 }, (_, i) => {
  const budget = 50_000_000 + (i % 20) * 25_000_000;
  const completion = 10 + (i % 88);
  const benefitTarget = 80_000_000 + (i % 20) * 40_000_000;
  return {
    id: `TPGM-${String(i + 1).padStart(3, '0')}`,
    name: `${pick(PROGRAM_TYPES, i)} ${pick(DOMAINS, i)} ${(i % 12) + 1}`,
    businessUnit: pick(BUSINESS_UNITS, i),
    objectiveId: TPMO_OBJECTIVES[i % TPMO_OBJECTIVES.length].id,
    status: pick(PROG_STATUS, i),
    health: 45 + (i % 52),
    budget,
    spent: Math.round(budget * (0.2 + (i % 7) * 0.1)),
    completion,
    benefitTarget,
    benefitRealized: Math.round(benefitTarget * (completion / 100) * (0.5 + (i % 5) * 0.1)),
    sponsor: pick(SPONSORS, i),
    riskLevel: pick(RISK, i),
    startYear: `${2024 + (i % 2)}`,
    targetYear: `${2026 + (i % 3)}`,
  };
});

export const TPMO_INITIATIVES: StrategicInitiative[] = Array.from({ length: 200 }, (_, i) => {
  const prog = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  return {
    id: `TINI-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(['Launch', 'Migrate', 'Automate', 'Rollout', 'Integrate', 'Optimize'], i)} ${pick(DOMAINS, i)} initiative ${(i % 30) + 1}`,
    programId: prog.id,
    status: pick(INIT_STATUS, i),
    priority: (i % 100) + 1,
    completion: 5 + (i % 92),
    businessUnit: prog.businessUnit,
    expectedBenefit: 5_000_000 + (i % 20) * 3_000_000,
    owner: pick(SPONSORS, i),
  };
});

export const TPMO_MILESTONES: TransformationMilestone[] = Array.from({ length: 500 }, (_, i) => {
  const prog = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  return {
    id: `TMS-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(['Design Sign-off', 'Go-Live', 'Pilot Launch', 'UAT Complete', 'Migration Wave', 'Benefit Checkpoint'], i)} — ${prog.name.slice(0, 18)}`,
    programId: prog.id,
    status: pick(MS_STATUS, i),
    dueDate: `${2025 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    completion: 10 + (i % 90),
    critical: i % 5 === 0,
  };
});

export const TPMO_COMMITMENTS: ExecutiveCommitment[] = Array.from({ length: 100 }, (_, i) => {
  const prog = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  return {
    id: `TCMT-${String(i + 1).padStart(4, '0')}`,
    title: `${pick(['Deliver', 'Achieve', 'Launch', 'Realize'], i)} ${pick(['cost savings', 'go-live', 'benefit milestone', 'compliance target', 'adoption target'], i)}`,
    programId: prog.id,
    owner: pick(SPONSORS, i),
    stakeholder: pick(['Board', 'Executive Committee', 'Regulator', 'CEO', 'Audit Committee'], i),
    status: pick(COMMIT_STATUS, i),
    dueDate: `${2025 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    confidence: 40 + (i % 58),
  };
});

export const TPMO_BENEFITS: TransformationBenefit[] = Array.from({ length: 100 }, (_, i) => {
  const prog = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  const target = 20_000_000 + (i % 20) * 10_000_000;
  return {
    id: `TBEN-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(['Digital adoption', 'Cost-to-serve', 'STP rate', 'Fraud reduction', 'Time-to-market', 'NPS uplift'], i)} benefit ${(i % 18) + 1}`,
    programId: prog.id,
    category: pick(['revenue', 'cost-reduction', 'risk-reduction', 'customer-experience', 'efficiency'] as const, i),
    targetValue: target,
    realizedValue: Math.round(target * (0.2 + (i % 8) * 0.1)),
    status: pick(['on-track', 'at-risk', 'realized', 'behind'] as const, i),
  };
});

export const TPMO_DEPENDENCIES: CrossProgramDependency[] = Array.from({ length: 100 }, (_, i) => {
  const from = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  const to = TPMO_PROGRAMS[(i + 7) % TPMO_PROGRAMS.length];
  return {
    id: `TDEP-${String(i + 1).padStart(4, '0')}`,
    name: `${from.name.slice(0, 16)} → ${to.name.slice(0, 16)}`,
    fromProgramId: from.id,
    toProgramId: to.id,
    type: pick(['technical', 'resource', 'funding', 'sequence', 'data'] as const, i),
    status: pick(['satisfied', 'pending', 'blocked', 'at-risk'] as const, i),
    riskLevel: pick(RISK, i + 1),
  };
});

export const TPMO_RISKS: TransformationRisk[] = Array.from({ length: 50 }, (_, i) => {
  const prog = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  return {
    id: `TRSK-${String(i + 1).padStart(3, '0')}`,
    title: pick(['Delivery slippage', 'Budget overrun', 'Key resource attrition', 'Blocked dependency', 'Low adoption', 'Regulatory deadline risk'], i),
    programId: prog.id,
    category: pick(['delivery', 'financial', 'resource', 'dependency', 'adoption', 'regulatory'] as const, i),
    severity: pick(RISK, i + 1),
    likelihood: 25 + (i % 70),
    mitigationStatus: pick(['open', 'planned', 'in-progress', 'mitigated'] as const, i),
  };
});

export const TPMO_BUSINESS_UNITS: BusinessUnitPerformance[] = BUSINESS_UNITS.map((name, i) => {
  const programs = TPMO_PROGRAMS.filter((p) => p.businessUnit === name);
  const health = programs.length ? Math.round(programs.reduce((s, p) => s + p.health, 0) / programs.length) : 60;
  return {
    id: `TBU-${String(i + 1).padStart(2, '0')}`,
    name,
    programCount: programs.length,
    transformationHealth: health,
    benefitRealization: 45 + (i % 40),
    milestoneCompletion: 50 + (i % 38),
    budgetUtilization: 55 + (i % 35),
  };
});

export const TPMO_HISTORY: TransformationHistoryPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  transformationHealth: 58 + i * 5,
  programDelivery: 54 + i * 6,
  benefitsRealization: 40 + i * 9,
  milestoneCompletion: 60 + i * 6,
  transformationRoi: 110 + i * 18,
}));

/**
 * Application-level transformation assessments — 147 applications classified into
 * healthy / at-risk / critical bands. These are the contributing records behind
 * the Transformation Health KPI:
 *   89 healthy + 28 at-risk + 30 critical = 147 applications
 *   Health = (89 × 1.0 + 28 × 0.5 + 30 × 0.0) ÷ 147 × 100 = 70%
 */
const APP_HEALTH_BANDS: { cls: AppHealthClass; count: number }[] = [
  { cls: 'healthy', count: 89 },
  { cls: 'at-risk', count: 28 },
  { cls: 'critical', count: 30 },
];

function appHealthClassFor(index: number): AppHealthClass {
  let cursor = 0;
  for (const band of APP_HEALTH_BANDS) {
    cursor += band.count;
    if (index < cursor) return band.cls;
  }
  return 'healthy';
}

export const TPMO_APP_ASSESSMENTS: TransformationAppAssessment[] = Array.from({ length: 147 }, (_, i) => {
  const prog = TPMO_PROGRAMS[i % TPMO_PROGRAMS.length];
  const healthClass = appHealthClassFor(i);
  const health =
    healthClass === 'healthy' ? 72 + (i % 24) : healthClass === 'at-risk' ? 50 + (i % 18) : 18 + (i % 30);
  const riskRating: TransformationAppAssessment['riskRating'] =
    healthClass === 'critical' ? (i % 2 === 0 ? 'critical' : 'high') : healthClass === 'at-risk' ? (i % 2 === 0 ? 'high' : 'medium') : (i % 3 === 0 ? 'medium' : 'low');
  const status: TransformationAppAssessment['status'] =
    healthClass === 'critical' ? 'remediation' : healthClass === 'at-risk' ? 'in-migration' : i % 7 === 0 ? 'planned' : 'live';
  return {
    id: `TAPP-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(DOMAINS, i)} ${pick(['Platform', 'Service', 'Gateway', 'Hub', 'Engine', 'Portal'], i)} ${(i % 24) + 1}`,
    programId: prog.id,
    domain: pick(DOMAINS, i),
    owner: pick(SPONSORS, i),
    health,
    healthClass,
    riskRating,
    status,
    lastAssessment: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')}`,
  };
});

/** When the Transformation KPI snapshot was last recalculated (deterministic mock). */
export const TPMO_LAST_CALCULATED = '18 Jun 2026 · 06:00 IST';

export const TPMO_TRACEABILITY_CHAINS: TransformationTraceabilityChain[] = [
  { stage: 'Strategy', entity: 'Digital First pillar', link: 'Objective', outcome: 'OBJ-001 Grow digital adoption' },
  { stage: 'Objective', entity: 'OBJ-001', link: 'Program', outcome: 'TPGM-003 Digital Banking UPI' },
  { stage: 'Program', entity: 'TPGM-003', link: 'Initiative', outcome: 'TINI-0024 Launch UPI 2.0' },
  { stage: 'Initiative', entity: 'TINI-0024', link: 'Portfolio', outcome: 'Payments Modernization portfolio' },
  { stage: 'Portfolio', entity: 'PG-PF-001', link: 'Project', outcome: 'PRJ-0024 active delivery' },
  { stage: 'Project', entity: 'PRJ-0024', link: 'Application', outcome: 'ARCH-APP-0042 Payments Hub' },
  { stage: 'Application', entity: 'ARCH-APP-0042', link: 'Release', outcome: 'REL-8842 v3.2.1' },
  { stage: 'Release', entity: 'REL-8842', link: 'Production', outcome: 'Deployed · PI-442' },
  { stage: 'Production', entity: 'PI-442', link: 'Value Realization', outcome: '₹420K value realized · VP-088' },
];

export const TRANSFORMATION_PMO_EXEC_SUMMARY =
  'Enterprise Transformation PMO provides executive oversight across 50 transformation programs, 200 strategic initiatives, 500 milestones, and 100 executive commitments spanning 5 business units. ' +
  'Transformation health: 74% · Program delivery: 68% · Strategic objective achievement: 62% · Benefits realization: 58% · Milestone completion: 71%. ' +
  'Executive commitments met: 64% · Dependency risk: 32% · Transformation ROI: 182% · Board readiness: 78%. ' +
  '9 programs are at-risk/off-track, 14 cross-program dependencies are blocked or at-risk, and ₹2.4B benefits remain to be realized. ' +
  'AI advisors recommend recovery plans for 6 programs, re-sequencing 8 dependencies, and escalating 11 executive commitments at risk of being missed.';
