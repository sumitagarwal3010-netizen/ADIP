import type {
  BenefitForecast,
  BusinessUnit,
  CapacityPlan,
  DemandRequest,
  FundingRequest,
  Portfolio,
  PortfolioHistoryPoint,
  PortfolioProject,
  PortfolioTraceabilityChain,
  Resource,
  StrategicObjective,
  StrategicProgram,
} from '../types/portfolioGovernance';
import { generateRealisticSeries, telemetryInRange, telemetryScore } from './enterpriseTelemetry';

const BU_NAMES = ['Retail Banking', 'Corporate Banking', 'Digital Channels', 'Payments', 'Enterprise Technology'] as const;
const PORTFOLIO_NAMES = [
  'Payments Modernization', 'Mobile Transformation', 'Core Banking Renewal', 'Regulatory Compliance',
  'AI & Analytics', 'Cloud Migration', 'Security Hardening', 'Customer Experience', 'Operations Excellence', 'Data Platform',
];
const DEMAND_TITLES = [
  'UPI 2.0 Enhancement', 'Mobile App Redesign', 'Core Ledger Migration', 'AML Screening Upgrade',
  'AI Fraud Detection', 'Cloud-Native Payments', 'API Gateway Modernization', 'Customer 360 Platform',
  'Regulatory Reporting Automation', 'DevSecOps Pipeline', 'Legacy Decommission', 'Open Banking APIs',
  'Real-Time Settlement', 'Branch Digitization', 'Wealth Management Portal', 'Trade Finance Platform',
  'Card Issuance Modernization', 'KYC Automation', 'Data Lake Expansion', 'Microservices Refactor',
];
const SKILLS = ['developer', 'architect', 'tester', 'business-analyst', 'project-manager', 'data-engineer', 'devops', 'security'] as const;
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
const DEMAND_STATUSES = ['submitted', 'under-review', 'business-case', 'funding-pending', 'approved', 'rejected', 'on-hold'] as const;
const PROJECT_STATUSES = ['active', 'planned', 'on-hold', 'completed', 'at-risk', 'kill-candidate'] as const;
const OBJECTIVES = [
  'Digital Transformation', 'Regulatory Compliance', 'Customer Experience', 'Cost Optimization',
  'Risk Reduction', 'Innovation & AI', 'Operational Resilience', 'Market Expansion',
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const PG_BUSINESS_UNITS: BusinessUnit[] = BU_NAMES.map((name, i) => ({
  id: `PG-BU-${String(i + 1).padStart(2, '0')}`,
  name,
  head: pick(['CIO', 'CTO', 'COO', 'CISO', 'Head of Digital'], i),
  portfolioCount: 2,
  programCount: 5 + i,
  projectCount: 20 + i * 8,
  annualBudget: 15_000_000 + i * 8_000_000,
}));

export const PG_PORTFOLIOS: Portfolio[] = Array.from({ length: 10 }, (_, i) => {
  const bu = PG_BUSINESS_UNITS[i % PG_BUSINESS_UNITS.length];
  return {
    id: `PG-PF-${String(i + 1).padStart(3, '0')}`,
    name: PORTFOLIO_NAMES[i],
    businessUnitId: bu.id,
    programCount: 2 + (i % 4),
    projectCount: 8 + i * 2,
    healthScore: telemetryScore(`pg:pf-health:${i}`),
    fundingUtilization: telemetryInRange(`pg:pf-fund:${i}`, 48, 96),
    strategicAlignment: telemetryScore(`pg:pf-align:${i}`),
  };
});

export const PG_STRATEGIC_OBJECTIVES: StrategicObjective[] = OBJECTIVES.map((name, i) => ({
  id: `OBJ-${String(i + 1).padStart(2, '0')}`,
  name,
  businessUnitId: PG_BUSINESS_UNITS[i % PG_BUSINESS_UNITS.length].id,
  weight: 10 + (i % 5) * 5,
  alignmentScore: telemetryScore(`pg:obj-align:${i}`),
  programsAligned: 2 + (i % 6),
}));

export const PG_STRATEGIC_PROGRAMS: StrategicProgram[] = Array.from({ length: 25 }, (_, i) => {
  const portfolio = PG_PORTFOLIOS[i % PG_PORTFOLIOS.length];
  return {
    id: `PGM-${String(i + 1).padStart(3, '0')}`,
    name: `${portfolio.name} Program ${(i % 5) + 1}`,
    portfolioId: portfolio.id,
    businessUnitId: portfolio.businessUnitId,
    objectiveId: PG_STRATEGIC_OBJECTIVES[i % PG_STRATEGIC_OBJECTIVES.length].id,
    projectCount: 3 + (i % 6),
    status: pick(['active', 'planned', 'completed', 'at-risk'] as const, i),
    healthScore: telemetryScore(`pg:pgm-health:${i}`),
    benefitsForecast: 500_000 + (i % 20) * 120_000,
    riskLevel: pick(RISK_LEVELS, i + 2),
  };
});

export const PG_DEMAND_REQUESTS: DemandRequest[] = Array.from({ length: 200 }, (_, i) => {
  const portfolio = PG_PORTFOLIOS[i % PG_PORTFOLIOS.length];
  const isDuplicate = i > 0 && i % 17 === 0;
  return {
    id: `DM-${String(i + 1).padStart(4, '0')}`,
    title: `${pick(DEMAND_TITLES, i)} ${(i % 10) + 1}`,
    businessUnitId: portfolio.businessUnitId,
    portfolioId: portfolio.id,
    submitter: pick(['Business Head', 'Product Owner', 'Transformation Office', 'PMO Lead', 'Domain Architect'], i),
    status: pick(DEMAND_STATUSES, i),
    prioritizationScore: telemetryScore(`pg:dm-prio:${i}`),
    strategicAlignment: telemetryScore(`pg:dm-align:${i}`),
    estimatedCost: 200_000 + (i % 30) * 85_000,
    benefitForecast: 350_000 + (i % 25) * 95_000,
    riskLevel: pick(RISK_LEVELS, i),
    submittedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    duplicateOf: isDuplicate ? `DM-${String(i).padStart(4, '0')}` : undefined,
  };
});

export const PG_FUNDING_REQUESTS: FundingRequest[] = Array.from({ length: 120 }, (_, i) => {
  const demand = PG_DEMAND_REQUESTS[i % PG_DEMAND_REQUESTS.length];
  const approved = demand.status === 'approved' || demand.status === 'funding-pending';
  return {
    id: `FR-${String(i + 1).padStart(4, '0')}`,
    demandId: demand.id,
    portfolioId: demand.portfolioId,
    amount: demand.estimatedCost,
    approvedAmount: approved ? Math.round(demand.estimatedCost * (0.7 + (i % 3) * 0.1)) : 0,
    status: approved ? pick(['approved', 'partial', 'released'] as const, i) : pick(['requested', 'denied'] as const, i),
    fiscalYear: pick(['FY24', 'FY25', 'FY26'], i),
    approver: pick(['CIO', 'CFO', 'Steering Committee', 'Transformation Board'], i),
  };
});

export const PG_PROJECTS: PortfolioProject[] = Array.from({ length: 100 }, (_, i) => {
  const program = PG_STRATEGIC_PROGRAMS[i % PG_STRATEGIC_PROGRAMS.length];
  const demand = PG_DEMAND_REQUESTS[i % PG_DEMAND_REQUESTS.length];
  return {
    id: `PRJ-${String(i + 1).padStart(4, '0')}`,
    name: `${demand.title} — Delivery`,
    programId: program.id,
    portfolioId: program.portfolioId,
    businessUnitId: program.businessUnitId,
    demandId: demand.id,
    status: pick(PROJECT_STATUSES, i),
    deliveryConfidence: telemetryScore(`pg:prj-conf:${i}`),
    prioritizationScore: demand.prioritizationScore,
    riskLevel: pick(RISK_LEVELS, i + 1),
    fundingApproved: demand.estimatedCost * (0.6 + (i % 4) * 0.1),
    benefitsRealized: Math.round(demand.benefitForecast * (0.1 + (i % 8) * 0.08)),
    benefitsForecast: demand.benefitForecast,
  };
});

PG_FUNDING_REQUESTS.forEach((fr, i) => {
  if (i < PG_PROJECTS.length && fr.status === 'approved') {
    fr.projectId = PG_PROJECTS[i].id;
  }
});

export const PG_RESOURCES: Resource[] = Array.from({ length: 500 }, (_, i) => {
  const portfolio = PG_PORTFOLIOS[i % PG_PORTFOLIOS.length];
  const utilization = telemetryInRange(`pg:res-util:${i}`, 42, 98);
  return {
    id: `RES-${String(i + 1).padStart(4, '0')}`,
    name: `Resource ${i + 1}`,
    skill: pick(SKILLS, i),
    businessUnitId: portfolio.businessUnitId,
    portfolioId: portfolio.id,
    utilization,
    capacityHours: 160,
    allocatedHours: Math.round(160 * utilization / 100),
    bottleneckRisk: utilization > 88 ? 'critical' : utilization > 78 ? 'high' : utilization > 65 ? 'medium' : 'low',
  };
});

export const PG_CAPACITY_PLANS: CapacityPlan[] = Array.from({ length: 40 }, (_, i) => {
  const portfolio = PG_PORTFOLIOS[i % PG_PORTFOLIOS.length];
  const year = 2024 + Math.floor(i / 16);
  const q = (i % 4) + 1;
  const available = 12000 + (i % 8) * 800;
  const demand = available * (0.75 + (i % 5) * 0.06);
  return {
    id: `CP-${String(i + 1).padStart(3, '0')}`,
    portfolioId: portfolio.id,
    quarter: `Q${q} ${year}`,
    demandHours: Math.round(demand),
    availableHours: available,
    utilization: Math.round((demand / available) * 100),
    bottleneckSkills: [pick(SKILLS, i), pick(SKILLS, i + 3)],
  };
});

const pgHealthSeries = generateRealisticSeries(12, 'pg-history-health');
const pgFundSeries = generateRealisticSeries(12, 'pg-history-fund');
const pgCapSeries = generateRealisticSeries(12, 'pg-history-cap');
const pgAlignSeries = generateRealisticSeries(12, 'pg-history-align');

export const PG_PORTFOLIO_HISTORY: PortfolioHistoryPoint[] = (() => {
  const points: PortfolioHistoryPoint[] = [];
  for (let y = 2023; y <= 2025; y++) {
    for (let q = 1; q <= 4; q++) {
      const idx = (y - 2023) * 4 + q - 1;
      points.push({
        quarter: `Q${q} ${y}`,
        portfolioHealth: pgHealthSeries[idx],
        fundingUtilization: pgFundSeries[idx],
        capacityUtilization: pgCapSeries[idx],
        demandBacklog: 180 - idx * 3,
        benefitsRealized: 2_500_000 + idx * 450_000,
        strategicAlignment: pgAlignSeries[idx],
      });
    }
  }
  return points;
})();

export const PG_BENEFIT_FORECASTS: BenefitForecast[] = PG_PROJECTS.slice(0, 60).map((p, i) => ({
  projectId: p.id,
  projectName: p.name,
  forecast: p.benefitsForecast,
  realized: p.benefitsRealized,
  confidence: telemetryScore(`pg:ben-conf:${i}`),
  quarter: pick(['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'], i),
}));

export const PG_TRACEABILITY_CHAINS: PortfolioTraceabilityChain[] = [
  { stage: 'Demand', entity: 'DM-0042 Mobile App Redesign', link: 'Business Case', outcome: '₹2.8M benefit forecast · 82% strategic alignment' },
  { stage: 'Business Case', entity: 'BC-0042 Approved', link: 'Funding Approval', outcome: 'FR-0038 approved ₹1.9M by Steering Committee' },
  { stage: 'Funding', entity: 'FR-0038 Released', link: 'Portfolio', outcome: 'Allocated to Mobile Transformation portfolio' },
  { stage: 'Portfolio', entity: 'PG-PF-002', link: 'Program', outcome: 'PGM-005 Digital Channels Program' },
  { stage: 'Program', entity: 'PGM-005', link: 'Project', outcome: 'PRJ-0012 active · 78% delivery confidence' },
  { stage: 'Project', entity: 'PRJ-0012', link: 'SDLC Workflow', outcome: 'Requirements → Architecture → Development in progress' },
  { stage: 'SDLC', entity: 'Workflow WF-8842', link: 'Production', outcome: 'Release candidate Q3 2025' },
  { stage: 'Production', entity: 'Prod Intel PI-442', link: 'Value Realization', outcome: '₹420K realized · 34% of forecast' },
  { stage: 'Value', entity: 'Value Realization VP-088', link: 'Executive', outcome: 'ROI tracked in Transformation Scorecard' },
];

export const PORTFOLIO_GOVERNANCE_EXEC_SUMMARY =
  'Portfolio Governance Center provides end-to-end visibility from demand intake through funding, portfolio balancing, capacity planning, and benefits realization. ' +
  '200 demand requests in pipeline · 100 active projects across 25 programs. Security Hardening and Payments Modernization lead on health; Core Banking Renewal and Cloud Migration remain weak spots. ' +
  'Funding utilization and strategic alignment are uneven across portfolios — Innovation & AI objectives under-funded vs weight. ' +
  'AI advisors flag kill candidates, duplicate initiatives, and critical resource bottlenecks where utilization exceeds 88%.';
