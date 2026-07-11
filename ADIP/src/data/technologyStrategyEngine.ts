import type { PersonaId } from '../config/personaConfig';
import type { TechAiInsight, TechnologyStrategyKpis } from '../types/technologyStrategy';
import { TECHNOLOGY_STRATEGY_ALLOWED_PERSONAS } from '../types/technologyStrategy';
import {
  AI_PLATFORMS,
  CLOUD_PLATFORMS,
  MODERNIZATION_INITIATIVES,
  STRATEGIC_PLATFORMS,
  TECH_INVESTMENTS,
  TECH_RISKS,
  TECH_STANDARDS,
  TECHNOLOGIES,
  TECH_TRACEABILITY_CHAINS,
  VENDOR_PRODUCTS,
} from './technologyStrategyMock';
import {
  generateCloudTelemetry,
  generateModernizationTelemetry,
  generateStandardsTelemetry,
} from './enterpriseTelemetry';

export function canAccessTechnologyStrategy(personaId: PersonaId): boolean {
  return TECHNOLOGY_STRATEGY_ALLOWED_PERSONAS.includes(personaId);
}

export function computeTechnologyStrategyKpis(): TechnologyStrategyKpis {
  const strategic = TECHNOLOGIES.filter((t) => t.lifecycle === 'strategic' || t.lifecycle === 'preferred' || t.lifecycle === 'approved').length;
  const technologyHealth = Math.round((strategic / TECHNOLOGIES.length) * 100);
  const standardsAdoption = Math.round(TECH_STANDARDS.reduce((s, t) => s + t.adoptionRate, 0) / TECH_STANDARDS.length);
  const strategicPlatformAdoption = Math.round(STRATEGIC_PLATFORMS.reduce((s, p) => s + p.adoptionRate, 0) / STRATEGIC_PLATFORMS.length);
  const cloudAdoption = Math.round(CLOUD_PLATFORMS.reduce((s, c) => s + c.adoptionRate, 0) / CLOUD_PLATFORMS.length);
  const aiPlatformAdoption = Math.round(AI_PLATFORMS.reduce((s, a) => s + a.adoptionRate, 0) / AI_PLATFORMS.length);
  const highRisks = TECH_RISKS.filter((r) => r.severity === 'high' || r.severity === 'critical').length;
  const technologyRisk = Math.round((highRisks / TECH_RISKS.length) * 100);
  const completedMod = MODERNIZATION_INITIATIVES.filter((m) => m.status === 'completed' || m.status === 'in-progress').length;
  const modernizationProgress = Math.round((completedMod / MODERNIZATION_INITIATIVES.length) * 100);
  const obsolete = TECHNOLOGIES.filter((t) => t.lifecycle === 'legacy' || t.lifecycle === 'deprecated' || t.lifecycle === 'end-of-support').length;
  const technologyDebt = Math.round((obsolete / TECHNOLOGIES.length) * 100);

  const vendorSpend = new Map<string, number>();
  let totalSpend = 0;
  for (const v of VENDOR_PRODUCTS) {
    vendorSpend.set(v.vendor, (vendorSpend.get(v.vendor) ?? 0) + v.contractValue);
    totalSpend += v.contractValue;
  }
  const topThree = Array.from(vendorSpend.values()).sort((a, b) => b - a).slice(0, 3).reduce((s, v) => s + v, 0);
  const vendorConcentration = Math.round((topThree / totalSpend) * 100);
  const investmentEfficiency = Math.round(TECH_INVESTMENTS.reduce((s, i) => s + i.efficiencyScore, 0) / TECH_INVESTMENTS.length);

  return {
    technologyHealth,
    standardsAdoption,
    strategicPlatformAdoption,
    cloudAdoption,
    aiPlatformAdoption,
    technologyRisk,
    modernizationProgress,
    technologyDebt,
    vendorConcentration,
    investmentEfficiency,
  };
}

export function technologiesByCategory() {
  const counts = new Map<string, number>();
  for (const t of TECHNOLOGIES) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function lifecycleDistribution() {
  const counts = new Map<string, number>();
  for (const t of TECHNOLOGIES) counts.set(t.lifecycle, (counts.get(t.lifecycle) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }));
}

export function stanceDistribution() {
  const counts = new Map<string, number>();
  for (const t of TECHNOLOGIES) counts.set(t.stance, (counts.get(t.stance) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function standardsAdoptionByCategory() {
  return generateStandardsTelemetry().map((c) => ({ name: c.name, value: c.value }));
}

export function topStrategicPlatforms(limit = 15) {
  return [...STRATEGIC_PLATFORMS].sort((a, b) => b.adoptionRate - a.adoptionRate).slice(0, limit);
}

export function strategicPlatformAdoptionChart() {
  return topStrategicPlatforms(10).map((p) => ({ name: p.name, value: p.adoptionRate }));
}

export function cloudAdoptionByProvider() {
  return generateCloudTelemetry().map((c) => ({ name: c.name, value: c.value }));
}

export function topCloudPlatforms(limit = 15) {
  return [...CLOUD_PLATFORMS].sort((a, b) => b.monthlySpend - a.monthlySpend).slice(0, limit);
}

export function aiPlatformsByCategory() {
  const counts = new Map<string, number>();
  for (const a of AI_PLATFORMS) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function topAiPlatforms(limit = 15) {
  return [...AI_PLATFORMS].sort((a, b) => b.adoptionRate - a.adoptionRate).slice(0, limit);
}

export function vendorConcentrationChart() {
  const by = new Map<string, number>();
  for (const v of VENDOR_PRODUCTS) by.set(v.vendor, (by.get(v.vendor) ?? 0) + v.contractValue);
  return Array.from(by.entries())
    .map(([name, value]) => ({ name, value: Math.round(value / 1_000_000) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function topVendorRisks(limit = 15) {
  return [...VENDOR_PRODUCTS]
    .filter((v) => v.riskLevel === 'high' || v.riskLevel === 'critical' || v.lockInRisk > 60)
    .sort((a, b) => b.lockInRisk - a.lockInRisk)
    .slice(0, limit);
}

export function topTechnologyRisks(limit = 20) {
  return [...TECH_RISKS]
    .filter((r) => r.severity === 'high' || r.severity === 'critical')
    .slice(0, limit)
    .map((r) => {
      const tech = TECHNOLOGIES.find((t) => t.id === r.technologyId);
      return { ...r, techName: tech?.name ?? r.technologyId };
    });
}

export function modernizationByWave() {
  return generateModernizationTelemetry().map((m) => ({ name: m.name, value: m.value }));
}

export function modernizationInitiatives(limit = 20) {
  return [...MODERNIZATION_INITIATIVES]
    .sort((a, b) => b.investment - a.investment)
    .slice(0, limit);
}

export function topInvestments(limit = 15) {
  return [...TECH_INVESTMENTS].sort((a, b) => b.annualSpend - a.annualSpend).slice(0, limit);
}

export function investmentByStance() {
  const by = new Map<string, number>();
  for (const i of TECH_INVESTMENTS) by.set(i.stance, (by.get(i.stance) ?? 0) + Math.round(i.annualSpend / 1_000_000));
  return Array.from(by.entries()).map(([name, value]) => ({ name, value }));
}

export function retirementCandidates(limit = 15) {
  return TECHNOLOGIES.filter((t) => t.lifecycle === 'deprecated' || t.lifecycle === 'end-of-support' || t.stance === 'eliminate').slice(0, limit);
}

export function generateTechAiInsights(): TechAiInsight[] {
  const kpis = computeTechnologyStrategyKpis();
  const retire = retirementCandidates(5);
  const vendorRisks = topVendorRisks(5);
  const modern = modernizationInitiatives(3);
  const cloud = generateCloudTelemetry();
  const standards = generateStandardsTelemetry();
  const mod = generateModernizationTelemetry();
  const gcp = cloud.find((c) => c.name === 'GCP');
  const aws = cloud.find((c) => c.name === 'AWS');
  const observability = standards.find((s) => s.name === 'Observability');
  const security = standards.find((s) => s.name === 'Security');
  const wave3 = mod.find((m) => m.name === 'Wave 3');
  const blocked = mod.find((m) => m.name === 'Blocked');

  return [
    {
      id: 'tech-ai-001',
      capability: 'rationalization',
      title: 'Technology Rationalization Advisor',
      recommendation: `200 technologies in estate; technology health ${kpis.technologyHealth}%. Consolidate overlapping frameworks and retire ${retire.length}+ deprecated technologies to simplify the estate.`,
      confidence: 87,
      impact: 'high',
      relatedIds: retire.map((t) => t.id),
    },
    {
      id: 'tech-ai-002',
      capability: 'obsolescence',
      title: 'Technology Obsolescence Advisor',
      recommendation: `Technology debt index ${kpis.technologyDebt}. Legacy/EOS technologies (Java 8, .NET 4.8, Mainframe COBOL, WebLogic) require retirement planning across modernization waves.`,
      confidence: 90,
      impact: 'high',
      relatedIds: retire.map((t) => t.id),
    },
    {
      id: 'tech-ai-003',
      capability: 'vendor-risk',
      title: 'Vendor Risk Advisor',
      recommendation: `Vendor concentration ${kpis.vendorConcentration}% across top 3 vendors. ${vendorRisks.length} high-lock-in products flagged; pursue exit strategy and dual-sourcing for critical platforms.`,
      confidence: 85,
      impact: 'high',
      relatedIds: vendorRisks.map((v) => v.id),
    },
    {
      id: 'tech-ai-004',
      capability: 'cloud-strategy',
      title: 'Cloud Strategy Advisor',
      recommendation: `GCP adoption is lagging at ${gcp?.value ?? 48}% while AWS remains strongest at ${aws?.value ?? 89}%. Rebalance workloads and close the Hybrid gap (${cloud.find((c) => c.name === 'Hybrid')?.value ?? 57}%).`,
      confidence: 83,
      impact: 'high',
      relatedIds: CLOUD_PLATFORMS.filter((c) => c.provider === 'GCP').slice(0, 5).map((c) => c.id),
    },
    {
      id: 'tech-ai-005',
      capability: 'ai-platform',
      title: 'AI Platform Advisor',
      recommendation: `AI platform adoption ${kpis.aiPlatformAdoption}%. Standardize on a governed LLM + vector-DB + ML-Ops stack; rationalize ${AI_PLATFORMS.filter((a) => !a.approved).length} unapproved AI tools.`,
      confidence: 81,
      impact: 'medium',
      relatedIds: AI_PLATFORMS.filter((a) => a.approved).slice(0, 5).map((a) => a.id),
    },
    {
      id: 'tech-ai-006',
      capability: 'investment',
      title: 'Technology Investment Advisor',
      recommendation: `Investment efficiency ${kpis.investmentEfficiency}%. Shift spend from 'tolerate/eliminate' technologies toward 'invest' strategic platforms to improve ROI.`,
      confidence: 84,
      impact: 'high',
      relatedIds: TECH_INVESTMENTS.filter((i) => i.stance === 'eliminate').slice(0, 5).map((i) => i.id),
    },
    {
      id: 'tech-ai-007',
      capability: 'modernization',
      title: 'Modernization Advisor',
      recommendation: `Wave 3 modernization is at ${wave3?.value ?? 38}% and blocked work sits at ${blocked?.value ?? 27}%. Unblock dependencies before expanding Wave 1 (${mod.find((m) => m.name === 'Wave 1')?.value ?? 86}%).`,
      confidence: 86,
      impact: 'high',
      relatedIds: modern.map((m) => m.id),
    },
    {
      id: 'tech-ai-008',
      capability: 'standards-compliance',
      title: 'Standards Compliance Advisor',
      recommendation: `Observability maturity dropped to ${observability?.value ?? 49}%. Security remains strongest at ${security?.value ?? 93}%; lift API (${standards.find((s) => s.name === 'API')?.value ?? 61}%) and Observability before new builds.`,
      confidence: 85,
      impact: 'medium',
      relatedIds: TECH_STANDARDS.filter((s) => s.mandatory && s.complianceRate < 70).slice(0, 5).map((s) => s.id),
    },
    {
      id: 'tech-ai-009',
      capability: 'platform-consolidation',
      title: 'Platform Consolidation Advisor',
      recommendation: 'Consolidate 8 overlapping integration/middleware platforms (IBM MQ, MuleSoft, Kong, TIBCO) into 2 strategic gateways. Estimated estate simplification: 26%.',
      confidence: 80,
      impact: 'high',
      relatedIds: TECHNOLOGIES.filter((t) => t.category === 'integration' || t.category === 'middleware').slice(0, 5).map((t) => t.id),
    },
    {
      id: 'tech-ai-010',
      capability: 'innovation',
      title: 'Innovation Opportunity Advisor',
      recommendation: `${TECHNOLOGIES.filter((t) => t.lifecycle === 'emerging').length} emerging technologies tracked. Pilot GenAI agents, real-time data streaming, and confidential computing for fraud and payments.`,
      confidence: 78,
      impact: 'medium',
      relatedIds: TECHNOLOGIES.filter((t) => t.lifecycle === 'emerging').slice(0, 5).map((t) => t.id),
    },
  ];
}

export function techIntegrationLinks() {
  return [
    { hub: 'Architecture Repository', path: '/executive/architecture-repository', description: 'Standards and reference architectures' },
    { hub: 'Application Portfolio', path: '/executive/application-portfolio', description: 'Technologies mapped to applications' },
    { hub: 'Portfolio Governance', path: '/executive/portfolio-governance', description: 'Investment and demand alignment' },
    { hub: 'AI Delivery Copilot', path: '/executive/ai-copilot', description: 'Technology-aware delivery recommendations' },
    { hub: 'Knowledge Center', path: '/knowledge-center', description: 'Technology patterns and playbooks' },
    { hub: 'Production Intelligence', path: '/production', description: 'Production signals into technology risk' },
    { hub: 'Value Realization', path: '/executive/value-realization', description: 'Technology investment ROI' },
    { hub: 'Executive Control Tower', path: '/executive', description: 'Enterprise technology KPIs' },
  ];
}

export { TECH_TRACEABILITY_CHAINS };
