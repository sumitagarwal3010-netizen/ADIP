import type { PersonaId } from '../config/personaConfig';
import type { ApmAiInsight, ApplicationPortfolioKpis } from '../types/applicationPortfolio';
import { APPLICATION_PORTFOLIO_ALLOWED_PERSONAS } from '../types/applicationPortfolio';
import {
  APM_AI_ASSESSMENTS,
  APM_APPLICATIONS,
  APM_CLOUD_ASSESSMENTS,
  APM_DOMAINS,
  APM_INTEGRATIONS,
  APM_LIFECYCLE_HISTORY,
  APM_MODERNIZATION,
  APM_PORTFOLIOS,
  APM_TECH_RISKS,
  APM_TECH_STACKS,
  APM_TECHNICAL_DEBT,
  APM_TRACEABILITY_CHAINS,
} from './applicationPortfolioMock';

export function canAccessApplicationPortfolio(personaId: PersonaId): boolean {
  return APPLICATION_PORTFOLIO_ALLOWED_PERSONAS.includes(personaId);
}

export function computeApplicationPortfolioKpis(): ApplicationPortfolioKpis {
  const avgHealth = Math.round(APM_APPLICATIONS.reduce((s, a) => s + a.productionHealth, 0) / APM_APPLICATIONS.length);
  const critical = APM_APPLICATIONS.filter((a) => a.criticality === 'tier-1' || a.criticality === 'tier-2').length;
  const avgDebt = Math.round(APM_APPLICATIONS.reduce((s, a) => s + a.technicalDebtScore, 0) / APM_APPLICATIONS.length);
  const avgCloud = Math.round(APM_APPLICATIONS.reduce((s, a) => s + a.cloudReadinessScore, 0) / APM_APPLICATIONS.length);
  const avgAi = Math.round(APM_APPLICATIONS.reduce((s, a) => s + a.aiReadinessScore, 0) / APM_APPLICATIONS.length);
  const avgRisk = Math.round(APM_APPLICATIONS.reduce((s, a) => s + a.riskScore, 0) / APM_APPLICATIONS.length);
  const annualCost = APM_APPLICATIONS.reduce((s, a) => s + a.annualCost, 0);
  const modReady = Math.round(APM_MODERNIZATION.reduce((s, m) => s + m.readinessScore, 0) / APM_MODERNIZATION.length);
  const obsoleteStacks = APM_TECH_STACKS.filter((s) => s.obsolescenceRisk === 'high' || s.obsolescenceRisk === 'critical').length;
  const latest = APM_LIFECYCLE_HISTORY[APM_LIFECYCLE_HISTORY.length - 1];

  return {
    applicationHealth: avgHealth,
    criticalApplications: critical,
    technicalDebt: avgDebt,
    modernizationReadiness: modReady,
    cloudReadiness: avgCloud,
    aiReadiness: avgAi,
    riskExposure: avgRisk,
    annualCost,
    rationalizationSavings: latest.rationalizationSavings,
    technologyObsolescence: Math.round((obsoleteStacks / APM_TECH_STACKS.length) * 100),
  };
}

export function applicationsByDomain() {
  return APM_DOMAINS.map((d) => ({ name: d.name, value: d.applicationCount }));
}

export function applicationsByPortfolio() {
  return APM_PORTFOLIOS.map((p) => ({ name: p.name, value: p.applicationCount }));
}

export function criticalityDistribution() {
  const counts = new Map<string, number>();
  for (const a of APM_APPLICATIONS) counts.set(a.criticality, (counts.get(a.criticality) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('tier-', 'Tier '), value }));
}

export function technologyHealthByStack() {
  return APM_TECH_STACKS.slice(0, 15).map((s) => ({
    name: s.name.length > 18 ? `${s.name.slice(0, 16)}…` : s.name,
    value: s.applicationCount,
    risk: s.obsolescenceRisk,
  }));
}

export function topTechnicalDebt(limit = 15) {
  return [...APM_TECHNICAL_DEBT].sort((a, b) => b.score - a.score).slice(0, limit).map((d) => {
    const app = APM_APPLICATIONS.find((a) => a.id === d.applicationId);
    return { ...d, appName: app?.name ?? d.applicationId };
  });
}

export function topModernizationOpportunities(limit = 15) {
  return [...APM_MODERNIZATION].sort((a, b) => b.savingsEstimate - a.savingsEstimate).slice(0, limit).map((m) => {
    const app = APM_APPLICATIONS.find((a) => a.id === m.applicationId);
    return { ...m, appName: app?.name ?? m.applicationId };
  });
}

export function cloudReadinessSummary() {
  const counts = new Map<string, number>();
  for (const c of APM_CLOUD_ASSESSMENTS) counts.set(c.targetState, (counts.get(c.targetState) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function aiReadinessSummary() {
  return APM_AI_ASSESSMENTS.slice(0, 15).map((a) => {
    const app = APM_APPLICATIONS.find((x) => x.id === a.applicationId);
    return { name: app?.name?.slice(0, 24) ?? a.applicationId, value: a.readinessScore };
  });
}

export function applicationRisks(limit = 20) {
  return APM_TECH_RISKS.filter((r) => r.severity === 'high' || r.severity === 'critical')
    .slice(0, limit)
    .map((r) => {
      const app = APM_APPLICATIONS.find((a) => a.id === r.applicationId);
      return { ...r, appName: app?.name ?? r.applicationId };
    });
}

export function dependencyGraph(limit = 20) {
  return APM_INTEGRATIONS.slice(0, limit).map((i) => {
    const src = APM_APPLICATIONS.find((a) => a.id === i.sourceAppId);
    const tgt = APM_APPLICATIONS.find((a) => a.id === i.targetAppId);
    return { ...i, sourceName: src?.name ?? i.sourceAppId, targetName: tgt?.name ?? i.targetAppId };
  });
}

export function lifecycleDistribution() {
  const counts = new Map<string, number>();
  for (const a of APM_APPLICATIONS) counts.set(a.lifecycleStage, (counts.get(a.lifecycleStage) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function rationalizationCandidates() {
  return APM_APPLICATIONS.filter(
    (a) => a.lifecycleStage === 'declining' || a.lifecycleStage === 'retiring' || a.productionHealth < 55,
  ).slice(0, 20);
}

export function inventorySample(limit = 20) {
  return APM_APPLICATIONS.slice(0, limit);
}

export function generateApmAiInsights(): ApmAiInsight[] {
  const kpis = computeApplicationPortfolioKpis();
  const retire = rationalizationCandidates().slice(0, 5);
  const mod = topModernizationOpportunities(3);
  const debt = topTechnicalDebt(3);
  const obsolete = APM_TECH_STACKS.filter((s) => s.obsolescenceRisk === 'critical').slice(0, 3);

  return [
    {
      id: 'apm-ai-001',
      capability: 'rationalization',
      title: 'Application Rationalization Advisor',
      recommendation: `Consolidate 8 overlapping payment apps into 3 platforms. Estimated savings: ₹${(kpis.rationalizationSavings / 1_000_000).toFixed(1)}M annually.`,
      confidence: 87,
      impact: 'high',
      relatedIds: retire.map((a) => a.id),
    },
    {
      id: 'apm-ai-002',
      capability: 'duplicate-capability',
      title: 'Duplicate Capability Detection',
      recommendation: 'Detected 6 duplicate customer notification capabilities across Retail and Digital Channels. Recommend single Notification Hub.',
      confidence: 91,
      impact: 'high',
      relatedIds: ['APP-0012', 'APP-0045', 'APP-0088'],
    },
    {
      id: 'apm-ai-003',
      capability: 'obsolescence',
      title: 'Technology Obsolescence Advisor',
      recommendation: `${obsolete.length} critical EOL stacks: ${obsolete.map((s) => s.name).join(', ')}. Upgrade within 6 months to avoid compliance exposure.`,
      confidence: 89,
      impact: 'high',
      relatedIds: obsolete.map((s) => s.id),
    },
    {
      id: 'apm-ai-004',
      capability: 'cloud-migration',
      title: 'Cloud Migration Advisor',
      recommendation: `42 apps ready for rehost, 28 for replatform. GCP cloud readiness lags at 48% vs AWS at 89%. Prioritize high-readiness apps for Q3 migration wave; defer GCP-heavy estates until Observability (49%) improves.`,
      confidence: 84,
      impact: 'high',
      relatedIds: APM_CLOUD_ASSESSMENTS.filter((c) => c.readinessScore > 80).slice(0, 5).map((c) => c.applicationId),
    },
    {
      id: 'apm-ai-005',
      capability: 'ai-readiness',
      title: 'AI Readiness Advisor',
      recommendation: `Enterprise AI readiness ${kpis.aiReadiness}%. Top candidates: fraud scoring, document extraction. Data quality and Observability (49%) gaps block 18 apps; Security posture at 93% is not the constraint.`,
      confidence: 82,
      impact: 'medium',
      relatedIds: APM_AI_ASSESSMENTS.filter((a) => a.readinessScore > 75).slice(0, 5).map((a) => a.applicationId),
    },
    {
      id: 'apm-ai-006',
      capability: 'debt-prioritization',
      title: 'Technical Debt Prioritization',
      recommendation: `Prioritize ${debt[0]?.title} on ${debt[0]?.appName} (score ${debt[0]?.score}). Tier-1 apps with debt >60: 14 applications.`,
      confidence: 86,
      impact: 'high',
      relatedIds: debt.map((d) => d.id),
    },
    {
      id: 'apm-ai-007',
      capability: 'risk-hotspot',
      title: 'Risk Hotspot Detection',
      recommendation: `Core Banking Renewal and Treasury domains have highest risk density: ${APM_TECH_RISKS.filter((r) => r.severity === 'critical').length} critical technology risks open. Treasury transformation health sits at 41% — escalate board remediation.`,
      confidence: 88,
      impact: 'high',
      relatedIds: APM_TECH_RISKS.filter((r) => r.severity === 'critical').slice(0, 5).map((r) => r.id),
    },
    {
      id: 'apm-ai-008',
      capability: 'cost-optimization',
      title: 'Cost Optimization Advisor',
      recommendation: `Annual portfolio cost ₹${(kpis.annualCost / 1_000_000).toFixed(0)}M. Retire 12 declining apps to save ₹8.4M support costs. Renegotiate 4 vendor contracts.`,
      confidence: 80,
      impact: 'high',
      relatedIds: retire.map((a) => a.id),
    },
    {
      id: 'apm-ai-009',
      capability: 'retirement',
      title: 'Application Retirement Recommendation',
      recommendation: `12 apps in declining/retiring lifecycle with <55% health. Recommend retirement: ${retire.slice(0, 3).map((a) => a.name).join(', ')}.`,
      confidence: 85,
      impact: 'medium',
      relatedIds: retire.map((a) => a.id),
    },
    {
      id: 'apm-ai-010',
      capability: 'modernization',
      title: 'Modernization Recommendation Engine',
      recommendation: `Top modernization: ${mod[0]?.title} for ${mod[0]?.appName} — ₹${((mod[0]?.savingsEstimate ?? 0) / 1_000_000).toFixed(1)}M savings, readiness ${mod[0]?.readinessScore}%.`,
      confidence: 83,
      impact: 'high',
      relatedIds: mod.map((m) => m.id),
    },
  ];
}

export function apmIntegrationLinks() {
  return [
    { hub: 'Portfolio Governance', path: '/executive/portfolio-governance', description: 'Demand and funding linked to applications' },
    { hub: 'Production Intelligence', path: '/production', description: 'Production health and incident linkage' },
    { hub: 'Audit Center', path: '/governance/audit-center', description: 'Application audit status and findings' },
    { hub: 'Knowledge Center', path: '/knowledge-center', description: 'Architecture patterns and lessons learned' },
    { hub: 'AI Delivery Copilot', path: '/executive/ai-copilot', description: 'Delivery recommendations for app projects' },
    { hub: 'Workflow Orchestration', path: '/executive/workflow-orchestration', description: 'SDLC workflows per application' },
    { hub: 'Approval Workflow', path: '/governance/approval-workflow', description: 'Modernization and retirement approvals' },
    { hub: 'Value Realization', path: '/executive/value-realization', description: 'Application value metrics' },
    { hub: 'Traceability Center', path: '/traceability', description: 'End-to-end application lineage' },
    { hub: 'Notification Center', path: '/operations/notifications', description: 'Risk and obsolescence alerts' },
    { hub: 'Event Bus', path: '/governance/activity-center', description: 'Portfolio state change events' },
  ];
}

export { APM_TRACEABILITY_CHAINS };
