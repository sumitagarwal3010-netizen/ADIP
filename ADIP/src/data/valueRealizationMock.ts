import type {
  BenchmarkMetric,
  BusinessCaseSummary,
  BusinessUnit,
  MaturityScore,
  Portfolio,
  ProductivityGain,
  Program,
  TraceabilityValueChain,
  ValueProject,
  ValueTrendPoint,
} from '../types/valueRealization';

const BU_NAMES = ['Retail Banking', 'Corporate Banking', 'Digital Channels', 'Payments', 'Enterprise Technology'] as const;
const PORTFOLIO_NAMES = [
  'Payments Modernization', 'Mobile Transformation', 'Core Banking Renewal', 'Regulatory Compliance',
  'AI & Analytics', 'Cloud Migration', 'Security Hardening', 'Customer Experience', 'Operations Excellence', 'Data Platform',
];
const DOMAINS = ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const BUSINESS_UNITS: BusinessUnit[] = BU_NAMES.map((name, i) => ({
  id: `BU-${String(i + 1).padStart(2, '0')}`,
  name,
  head: pick(['CIO', 'CTO', 'COO', 'CISO', 'Head of Digital'], i),
  programs: 15 + i * 4,
  projects: 80 + i * 20,
  annualValue: 2_500_000 + i * 1_200_000,
}));

export const PORTFOLIOS: Portfolio[] = Array.from({ length: 10 }, (_, i) => {
  const bu = BUSINESS_UNITS[i % BUSINESS_UNITS.length];
  return {
    id: `PF-${String(i + 1).padStart(3, '0')}`,
    name: PORTFOLIO_NAMES[i],
    businessUnitId: bu.id,
    programs: 8 + (i % 6),
    projects: 40 + i * 5,
    valueRealized: 800_000 + i * 350_000,
    roi: 180 + (i % 120),
  };
});

export const PROGRAMS: Program[] = Array.from({ length: 100 }, (_, i) => {
  const portfolio = PORTFOLIOS[i % PORTFOLIOS.length];
  return {
    id: `PGM-${String(i + 1).padStart(4, '0')}`,
    name: `${portfolio.name} Program ${(i % 10) + 1}`,
    portfolioId: portfolio.id,
    businessUnitId: portfolio.businessUnitId,
    projects: 3 + (i % 8),
    hoursSaved: 500 + (i % 40) * 25,
    valueRealized: 50_000 + (i % 30) * 8_000,
    status: pick(['active', 'completed', 'planned'] as const, i),
  };
});

export const VALUE_PROJECTS: ValueProject[] = Array.from({ length: 500 }, (_, i) => {
  const program = PROGRAMS[i % PROGRAMS.length];
  const portfolio = PORTFOLIOS.find((p) => p.id === program.portfolioId) ?? PORTFOLIOS[0];
  return {
    id: `VP-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(DOMAINS, i)} Initiative ${(i % 50) + 1}`,
    programId: program.id,
    portfolioId: portfolio.id,
    businessUnitId: program.businessUnitId,
    domain: pick(DOMAINS, i),
    hoursSaved: 40 + (i % 60),
    fteSavings: 0.1 + (i % 10) / 10,
    defectsPrevented: i % 5,
    cycleTimeReduction: 5 + (i % 25),
    valueRealized: 8_000 + (i % 20) * 2_500,
  };
});

export const VALUE_TREND_HISTORY: ValueTrendPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  hoursSaved: 12000 + i * 8500,
  valueRealized: 3_200_000 + i * 2_100_000,
  productivityGain: 12 + i * 6,
  riskReduction: 8 + i * 5,
  roi: 95 + i * 35,
}));

export const PRODUCTIVITY_GAINS: ProductivityGain[] = [
  { domain: 'requirements', hoursSaved: 12400, productivityPercent: 32, fteEquivalent: 6.2 },
  { domain: 'architecture', hoursSaved: 9800, productivityPercent: 28, fteEquivalent: 4.9 },
  { domain: 'development', hoursSaved: 18600, productivityPercent: 35, fteEquivalent: 9.3 },
  { domain: 'testing', hoursSaved: 15200, productivityPercent: 38, fteEquivalent: 7.6 },
  { domain: 'release', hoursSaved: 8600, productivityPercent: 30, fteEquivalent: 4.3 },
  { domain: 'governance', hoursSaved: 7200, productivityPercent: 26, fteEquivalent: 3.6 },
  { domain: 'audit', hoursSaved: 6400, productivityPercent: 42, fteEquivalent: 3.2 },
  { domain: 'operations', hoursSaved: 5800, productivityPercent: 22, fteEquivalent: 2.9 },
  { domain: 'knowledge', hoursSaved: 4200, productivityPercent: 45, fteEquivalent: 2.1 },
];

export const MATURITY_SCORES: MaturityScore[] = [
  { dimension: 'sdlc', label: 'SDLC Maturity', score: 78, target: 90, trend: 8 },
  { dimension: 'governance', label: 'Governance Maturity', score: 82, target: 92, trend: 6 },
  { dimension: 'audit', label: 'Audit Maturity', score: 75, target: 88, trend: 9 },
  { dimension: 'ai', label: 'AI Maturity', score: 71, target: 85, trend: 14 },
  { dimension: 'operational', label: 'Operational Maturity', score: 80, target: 90, trend: 5 },
  { dimension: 'transformation', label: 'Transformation Maturity', score: 76, target: 88, trend: 11 },
];

export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  { metric: 'Cycle Time (days)', current: 42, traditional: 68, target: 30, aiSdlc: 28, unit: 'days' },
  { metric: 'Defect Leakage (%)', current: 12, traditional: 28, target: 8, aiSdlc: 7, unit: '%' },
  { metric: 'Approval Time (hrs)', current: 36, traditional: 72, target: 18, aiSdlc: 14, unit: 'hrs' },
  { metric: 'Audit Prep (days)', current: 18, traditional: 35, target: 10, aiSdlc: 8, unit: 'days' },
  { metric: 'Release Velocity', current: 24, traditional: 14, target: 30, aiSdlc: 32, unit: '/yr' },
  { metric: 'Evidence Collection (hrs)', current: 48, traditional: 120, target: 24, aiSdlc: 18, unit: 'hrs' },
  { metric: 'Productivity Index', current: 72, traditional: 48, target: 85, aiSdlc: 88, unit: '%' },
  { metric: 'Risk Exposure', current: 28, traditional: 52, target: 18, aiSdlc: 15, unit: '%' },
];

export const VALUE_TRACEABILITY_CHAINS: TraceabilityValueChain[] = [
  { capability: 'AI Delivery Copilot', benefit: 'Faster requirement analysis', metric: 'Hours saved', kpi: 'Productivity Gain', value: '₹2.4M annual', outcome: '32% faster requirements cycle' },
  { capability: 'Production Intelligence', benefit: 'Defect prevention', metric: 'Defects prevented', kpi: 'Quality Improvement', value: '₹1.8M cost avoidance', outcome: '45% fewer production incidents' },
  { capability: 'Audit Center', benefit: 'Evidence automation', metric: 'Evidence collection reduction', kpi: 'Audit Efficiency', value: '₹1.2M audit savings', outcome: '60% faster audit readiness' },
  { capability: 'Knowledge Center', benefit: 'Institutional learning', metric: 'Knowledge reuse', kpi: 'Learning Adoption', value: '₹900K productivity', outcome: 'Never solve same problem twice' },
  { capability: 'Unified Lifecycle', benefit: 'Approval acceleration', metric: 'Approval time reduction', kpi: 'Delivery Acceleration', value: '₹1.5M cycle savings', outcome: '61% faster release gates' },
  { capability: 'ABAC + RBAC', benefit: 'Governance automation', metric: 'Control coverage', kpi: 'Governance Efficiency', value: '₹700K compliance savings', outcome: '82% governance maturity' },
];

export const BUSINESS_CASE: BusinessCaseSummary = {
  executiveNarrative:
    'ADIP delivers measurable enterprise value across the full SDLC — transforming banking software delivery from tracking to active intelligence. ' +
    'Annual value realized: ₹12.4M with 247% ROI and 8-month payback.',
  benefitsSummary:
    '84,200 hours saved · 44.1 FTE equivalent · 38% productivity gain · 1,240 defects prevented · 62% risk reduction · 61% faster approvals',
  financialSummary:
    'Annual savings: ₹12.4M · 3-year projected: ₹38.6M · Cost avoidance: ₹4.2M · Transformation value: ₹15.8M',
  riskReductionSummary:
    'Audit findings prevented: 186 · Production incidents reduced 45% · Defect leakage down 57% · RCA recurrence down 38%',
  transformationSummary:
    'Overall enterprise maturity: 77/100 · AI SDLC coverage: 71% · Transformation progress: 68% toward target state',
  boardPresentationSummary:
    'ADIP is the executive business case engine — proving ROI, accelerating delivery, reducing risk, and institutionalizing learning across the bank.',
};

export const VALUE_REALIZATION_EXEC_SUMMARY = BUSINESS_CASE.executiveNarrative;
