import type { PersonaId } from '../config/personaConfig';
import type {
  AiInsight,
  PortfolioGovernanceKpis,
} from '../types/portfolioGovernance';
import { PORTFOLIO_GOVERNANCE_ALLOWED_PERSONAS } from '../types/portfolioGovernance';
import {
  PG_BENEFIT_FORECASTS,
  PG_CAPACITY_PLANS,
  PG_DEMAND_REQUESTS,
  PG_PORTFOLIO_HISTORY,
  PG_PORTFOLIOS,
  PG_PROJECTS,
  PG_RESOURCES,
  PG_STRATEGIC_OBJECTIVES,
  PG_STRATEGIC_PROGRAMS,
  PG_TRACEABILITY_CHAINS,
} from './portfolioGovernanceMock';

export function canAccessPortfolioGovernance(personaId: PersonaId): boolean {
  return PORTFOLIO_GOVERNANCE_ALLOWED_PERSONAS.includes(personaId);
}

export function computePortfolioGovernanceKpis(): PortfolioGovernanceKpis {
  const activeProjects = PG_PROJECTS.filter((p) => p.status === 'active' || p.status === 'at-risk');
  const backlog = PG_DEMAND_REQUESTS.filter((d) =>
    ['submitted', 'under-review', 'business-case', 'funding-pending'].includes(d.status),
  ).length;
  const avgHealth = Math.round(PG_PORTFOLIOS.reduce((s, p) => s + p.healthScore, 0) / PG_PORTFOLIOS.length);
  const avgAlignment = Math.round(PG_PORTFOLIOS.reduce((s, p) => s + p.strategicAlignment, 0) / PG_PORTFOLIOS.length);
  const avgFunding = Math.round(PG_PORTFOLIOS.reduce((s, p) => s + p.fundingUtilization, 0) / PG_PORTFOLIOS.length);
  const avgCapacity = Math.round(PG_CAPACITY_PLANS.reduce((s, c) => s + c.utilization, 0) / PG_CAPACITY_PLANS.length);
  const avgConfidence = activeProjects.length
    ? Math.round(activeProjects.reduce((s, p) => s + p.deliveryConfidence, 0) / activeProjects.length)
    : 0;
  const totalForecast = PG_PROJECTS.reduce((s, p) => s + p.benefitsForecast, 0);
  const totalRealized = PG_PROJECTS.reduce((s, p) => s + p.benefitsRealized, 0);
  const benefitsPct = totalForecast ? Math.round((totalRealized / totalForecast) * 100) : 0;
  const highRisk = PG_PROJECTS.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
  const riskExposure = Math.round((highRisk / PG_PROJECTS.length) * 100);
  const latest = PG_PORTFOLIO_HISTORY[PG_PORTFOLIO_HISTORY.length - 1];

  return {
    portfolioHealth: avgHealth,
    strategicAlignment: avgAlignment,
    fundingUtilization: avgFunding,
    capacityUtilization: avgCapacity,
    deliveryConfidence: avgConfidence,
    benefitsRealization: benefitsPct,
    riskExposure,
    demandBacklog: backlog,
    investmentEfficiency: 76,
    transformationProgress: Math.round((latest.portfolioHealth + latest.strategicAlignment) / 2),
  };
}

export function demandPipelineByStatus() {
  const counts = new Map<string, number>();
  for (const d of PG_DEMAND_REQUESTS) {
    counts.set(d.status, (counts.get(d.status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }));
}

export function demandTopPrioritized(limit = 15) {
  return [...PG_DEMAND_REQUESTS]
    .sort((a, b) => b.prioritizationScore - a.prioritizationScore)
    .slice(0, limit)
    .map((d) => ({
      id: d.id,
      title: d.title,
      score: d.prioritizationScore,
      alignment: d.strategicAlignment,
      cost: d.estimatedCost,
      status: d.status,
    }));
}

export function portfolioHealthByPortfolio() {
  return PG_PORTFOLIOS.map((p) => ({ name: p.name, value: p.healthScore }));
}

export function capacityByQuarter() {
  return PG_CAPACITY_PLANS.slice(0, 12).map((c) => ({
    quarter: c.quarter,
    utilization: c.utilization,
    demand: c.demandHours,
    available: c.availableHours,
  }));
}

export function resourceUtilizationBySkill() {
  const bySkill = new Map<string, { total: number; count: number }>();
  for (const r of PG_RESOURCES) {
    const cur = bySkill.get(r.skill) ?? { total: 0, count: 0 };
    cur.total += r.utilization;
    cur.count += 1;
    bySkill.set(r.skill, cur);
  }
  return Array.from(bySkill.entries()).map(([name, { total, count }]) => ({
    name: name.replace(/-/g, ' '),
    value: Math.round(total / count),
  }));
}

export function strategicAlignmentByObjective() {
  return PG_STRATEGIC_OBJECTIVES.map((o) => ({ name: o.name, value: o.alignmentScore }));
}

export function roadmapByQuarter() {
  return PG_STRATEGIC_PROGRAMS.filter((p) => p.status === 'active' || p.status === 'planned')
    .slice(0, 12)
    .map((p, i) => ({
      id: p.id,
      name: p.name,
      quarter: `Q${(i % 4) + 1} 2025`,
      health: p.healthScore,
      benefits: p.benefitsForecast,
    }));
}

export function portfolioRisks() {
  return PG_PROJECTS.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical' || p.status === 'at-risk')
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      name: p.name,
      risk: p.riskLevel,
      confidence: p.deliveryConfidence,
      status: p.status,
    }));
}

export function benefitsTrackingSummary() {
  return PG_BENEFIT_FORECASTS.slice(0, 15);
}

export function fundingUtilizationByPortfolio() {
  return PG_PORTFOLIOS.map((p) => ({ name: p.name, value: p.fundingUtilization }));
}

export function generateAiInsights(): AiInsight[] {
  const kpis = computePortfolioGovernanceKpis();
  const killCandidates = PG_PROJECTS.filter((p) => p.status === 'kill-candidate' || (p.deliveryConfidence < 55 && p.benefitsRealized < p.benefitsForecast * 0.15));
  const duplicates = PG_DEMAND_REQUESTS.filter((d) => d.duplicateOf);
  const bottlenecks = PG_RESOURCES.filter((r) => r.bottleneckRisk === 'critical' || r.bottleneckRisk === 'high').slice(0, 5);
  const topDemand = demandTopPrioritized(3);

  return [
    {
      id: 'ai-001',
      capability: 'demand-prioritization',
      title: 'Demand Prioritization Copilot',
      recommendation: `Top 3 demands by score: ${topDemand.map((d) => d.title).join('; ')}. Recommend fast-track DM-${topDemand[0]?.id.slice(3)} for steering committee review.`,
      confidence: 88,
      impact: 'high',
      relatedIds: topDemand.map((d) => d.id),
    },
    {
      id: 'ai-002',
      capability: 'portfolio-optimization',
      title: 'Portfolio Optimization Advisor',
      recommendation: `Rebalance ${PG_PORTFOLIOS[2].name} — health at ${PG_PORTFOLIOS[2].healthScore}% vs portfolio avg ${kpis.portfolioHealth}%. Shift 2 programs to ${PG_PORTFOLIOS[7].name}.`,
      confidence: 82,
      impact: 'high',
      relatedIds: [PG_PORTFOLIOS[2].id, PG_PORTFOLIOS[7].id],
    },
    {
      id: 'ai-003',
      capability: 'funding-recommendation',
      title: 'Funding Recommendation Engine',
      recommendation: `Approve ₹4.2M incremental for Regulatory Compliance portfolio — funding utilization at ${PG_PORTFOLIOS[3].fundingUtilization}% with highest strategic alignment gap.`,
      confidence: 79,
      impact: 'high',
      relatedIds: [PG_PORTFOLIOS[3].id],
    },
    {
      id: 'ai-004',
      capability: 'resource-bottleneck',
      title: 'Resource Bottleneck Predictor',
      recommendation: `Critical bottleneck: ${bottlenecks[0]?.skill ?? 'architect'} at ${bottlenecks[0]?.utilization ?? 92}% utilization in ${PG_PORTFOLIOS[0].name}. Add 3 FTE or defer 2 lower-priority demands.`,
      confidence: 91,
      impact: 'high',
      relatedIds: bottlenecks.map((b) => b.id),
    },
    {
      id: 'ai-005',
      capability: 'capacity-forecast',
      title: 'Capacity Forecasting',
      recommendation: `Q3 2025 capacity exceeds available hours by 14% across Digital Channels. Forecast shows 3-week delivery slip without reallocation.`,
      confidence: 85,
      impact: 'medium',
      relatedIds: PG_CAPACITY_PLANS.slice(8, 11).map((c) => c.id),
    },
    {
      id: 'ai-006',
      capability: 'benefits-predictor',
      title: 'Benefits Realization Predictor',
      recommendation: `Benefits realization at ${kpis.benefitsRealization}% — 8 projects trending below 40% of forecast. Recommend value realization review for PRJ-0024, PRJ-0056.`,
      confidence: 77,
      impact: 'medium',
      relatedIds: ['PRJ-0024', 'PRJ-0056'],
    },
    {
      id: 'ai-007',
      capability: 'alignment-scoring',
      title: 'Strategic Alignment Scoring',
      recommendation: `Enterprise alignment ${kpis.strategicAlignment}% — "Innovation & AI" objective under-funded vs weight. 4 demands misaligned below 55% should be deprioritized.`,
      confidence: 84,
      impact: 'medium',
      relatedIds: PG_STRATEGIC_OBJECTIVES.filter((o) => o.name.includes('AI')).map((o) => o.id),
    },
    {
      id: 'ai-008',
      capability: 'kill-recommendation',
      title: 'Project Kill Recommendation',
      recommendation: `${killCandidates.length} projects recommended for kill/hold: low confidence and <15% benefits realized. Estimated recovery: ₹6.8M funding.`,
      confidence: 86,
      impact: 'high',
      relatedIds: killCandidates.slice(0, 5).map((p) => p.id),
    },
    {
      id: 'ai-009',
      capability: 'duplicate-detection',
      title: 'Duplicate Initiative Detection',
      recommendation: `${duplicates.length} duplicate demands detected. Merge DM-0017/DM-0034 (UPI Enhancement) and DM-0051/DM-0068 (API Gateway) to reduce backlog ${Math.round(duplicates.length / PG_DEMAND_REQUESTS.length * 100)}%.`,
      confidence: 93,
      impact: 'medium',
      relatedIds: duplicates.slice(0, 6).map((d) => d.id),
    },
  ];
}

export function integrationLinks() {
  return [
    { hub: 'Workflow Orchestration', path: '/executive/workflow-orchestration', description: 'SDLC stage gates for approved projects' },
    { hub: 'Approval Workflow', path: '/governance/approval-workflow', description: 'Funding and business case approvals' },
    { hub: 'Audit Center', path: '/governance/audit-center', description: 'Investment governance audit trail' },
    { hub: 'Knowledge Center', path: '/knowledge-center', description: 'Lessons from prior portfolio decisions' },
    { hub: 'Production Intelligence', path: '/production', description: 'Production feedback into demand pipeline' },
    { hub: 'AI Delivery Copilot', path: '/executive/ai-copilot', description: 'Delivery recommendations for portfolio projects' },
    { hub: 'Value Realization', path: '/executive/value-realization', description: 'Benefits tracking and ROI validation' },
    { hub: 'Traceability Center', path: '/traceability', description: 'End-to-end demand-to-value lineage' },
    { hub: 'Notification Center', path: '/operations/notifications', description: 'Steering committee escalations' },
    { hub: 'Event Bus', path: '/governance/activity-center', description: 'Real-time portfolio state changes' },
  ];
}

export { PG_TRACEABILITY_CHAINS };
