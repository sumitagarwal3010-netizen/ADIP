import type { PersonaId } from '../config/personaConfig';
import type { ArchAiInsight, ArchitectureRepositoryKpis } from '../types/architectureRepository';
import { ARCHITECTURE_REPOSITORY_ALLOWED_PERSONAS } from '../types/architectureRepository';
import {
  ARCH_APPLICATIONS,
  ARCH_CAPABILITIES,
  ARCH_CLOUD_SERVICES,
  ARCH_DEBT_ITEMS,
  ARCH_EXCEPTIONS,
  ARCH_FINDINGS,
  ARCH_INTEGRATIONS,
  ARCH_PLATFORMS,
  ARCH_REFERENCE_ARCHITECTURES,
  ARCH_REVIEWS,
  ARCH_STANDARDS,
  ARCH_TRACEABILITY_CHAINS,
} from './architectureRepositoryMock';

export function canAccessArchitectureRepository(personaId: PersonaId): boolean {
  return ARCHITECTURE_REPOSITORY_ALLOWED_PERSONAS.includes(personaId);
}

export function computeArchitectureRepositoryKpis(): ArchitectureRepositoryKpis {
  const avgHealth = Math.round(ARCH_APPLICATIONS.reduce((s, a) => s + a.standardsAdherence, 0) / ARCH_APPLICATIONS.length);
  const compliant = ARCH_APPLICATIONS.filter((a) => a.complianceState === 'compliant').length;
  const standardsCompliance = Math.round((compliant / ARCH_APPLICATIONS.length) * 100);
  const avgDebt = Math.round(ARCH_DEBT_ITEMS.reduce((s, d) => s + d.effortDays, 0) / ARCH_DEBT_ITEMS.length);
  const obsoletePlatforms = ARCH_PLATFORMS.filter((p) => p.lifecycle === 'end-of-support' || p.lifecycle === 'end-of-life' || p.obsolescenceRisk === 'critical').length;
  const avgCloud = Math.round(ARCH_APPLICATIONS.reduce((s, a) => s + a.cloudReadiness, 0) / ARCH_APPLICATIONS.length);
  const avgAi = Math.round(ARCH_APPLICATIONS.reduce((s, a) => s + a.aiReadiness, 0) / ARCH_APPLICATIONS.length);
  const avgRisk = Math.round(ARCH_APPLICATIONS.reduce((s, a) => s + a.architectureRisk, 0) / ARCH_APPLICATIONS.length);
  const activeExceptions = ARCH_EXCEPTIONS.filter((e) => e.status === 'approved' || e.status === 'waiver' || e.status === 'risk-accepted').length;
  const refAdoption = Math.round(ARCH_REFERENCE_ARCHITECTURES.reduce((s, r) => s + r.adoptionRate, 0) / ARCH_REFERENCE_ARCHITECTURES.length);
  const resolvedDebt = ARCH_DEBT_ITEMS.filter((d) => d.remediationStatus === 'resolved' || d.remediationStatus === 'in-progress').length;

  return {
    architectureHealth: avgHealth,
    standardsCompliance,
    architectureDebt: avgDebt,
    technologyObsolescence: Math.round((obsoletePlatforms / ARCH_PLATFORMS.length) * 100),
    cloudReadiness: avgCloud,
    aiReadiness: avgAi,
    architectureRisk: avgRisk,
    architectureExceptions: activeExceptions,
    referenceAdoption: refAdoption,
    modernizationProgress: Math.round((resolvedDebt / ARCH_DEBT_ITEMS.length) * 100),
  };
}

export function capabilitiesByArea() {
  const counts = new Map<string, number>();
  for (const c of ARCH_CAPABILITIES) counts.set(c.domainArea, (counts.get(c.domainArea) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function applicationsByDomain() {
  const counts = new Map<string, number>();
  for (const a of ARCH_APPLICATIONS) counts.set(a.domain, (counts.get(a.domain) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function complianceDistribution() {
  const counts = new Map<string, number>();
  for (const a of ARCH_APPLICATIONS) counts.set(a.complianceState, (counts.get(a.complianceState) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function lifecycleDistribution() {
  const counts = new Map<string, number>();
  for (const p of ARCH_PLATFORMS) counts.set(p.lifecycle, (counts.get(p.lifecycle) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }));
}

export function standardsAdoptionByDomain() {
  const byDomain = new Map<string, { total: number; count: number }>();
  for (const s of ARCH_STANDARDS) {
    const cur = byDomain.get(s.domain) ?? { total: 0, count: 0 };
    cur.total += s.adoptionRate;
    cur.count += 1;
    byDomain.set(s.domain, cur);
  }
  return Array.from(byDomain.entries()).map(([name, { total, count }]) => ({ name, value: Math.round(total / count) }));
}

export function reviewQueue(limit = 20) {
  return ARCH_REVIEWS.filter((r) => r.status === 'queued' || r.status === 'in-review' || r.status === 'conditional')
    .slice(0, limit);
}

export function openFindings(limit = 20) {
  return ARCH_FINDINGS.filter((f) => f.status === 'open' || f.status === 'in-remediation')
    .slice(0, limit)
    .map((f) => {
      const app = ARCH_APPLICATIONS.find((a) => a.id === f.applicationId);
      return { ...f, appName: app?.name ?? f.applicationId };
    });
}

export function activeExceptions(limit = 20) {
  return ARCH_EXCEPTIONS.filter((e) => e.status !== 'expired')
    .slice(0, limit)
    .map((e) => {
      const app = ARCH_APPLICATIONS.find((a) => a.id === e.applicationId);
      return { ...e, appName: app?.name ?? e.applicationId };
    });
}

export function obsoletePlatforms(limit = 20) {
  return ARCH_PLATFORMS.filter((p) => p.lifecycle === 'end-of-support' || p.lifecycle === 'end-of-life' || p.lifecycle === 'retiring' || p.obsolescenceRisk === 'high' || p.obsolescenceRisk === 'critical')
    .slice(0, limit);
}

export function topArchitectureDebt(limit = 20) {
  return [...ARCH_DEBT_ITEMS]
    .sort((a, b) => b.effortDays - a.effortDays)
    .slice(0, limit)
    .map((d) => {
      const app = ARCH_APPLICATIONS.find((a) => a.id === d.applicationId);
      return { ...d, appName: app?.name ?? d.applicationId };
    });
}

export function cloudServiceAdoption() {
  return ARCH_CLOUD_SERVICES.slice(0, 12).map((c) => ({ name: c.name, value: c.adoptionLevel }));
}

export function integrationRisks(limit = 20) {
  return ARCH_INTEGRATIONS.filter((i) => i.riskLevel === 'high' || i.riskLevel === 'critical' || i.complianceState === 'non-compliant')
    .slice(0, limit);
}

export function referenceAdoptionSummary() {
  return ARCH_REFERENCE_ARCHITECTURES.map((r) => ({ name: r.name, value: r.adoptionRate }));
}

export function modernizationCandidates(limit = 20) {
  return ARCH_DEBT_ITEMS.filter((d) => d.category === 'modernization' || d.category === 'obsolescence' || d.category === 'unsupported-platform')
    .slice(0, limit)
    .map((d) => {
      const app = ARCH_APPLICATIONS.find((a) => a.id === d.applicationId);
      return { ...d, appName: app?.name ?? d.applicationId };
    });
}

export function generateArchAiInsights(): ArchAiInsight[] {
  const kpis = computeArchitectureRepositoryKpis();
  const nonCompliant = ARCH_APPLICATIONS.filter((a) => a.complianceState === 'non-compliant').slice(0, 5);
  const obsolete = obsoletePlatforms(5);
  const debt = topArchitectureDebt(3);
  const intRisks = integrationRisks(5);

  return [
    {
      id: 'arch-ai-001',
      capability: 'compliance',
      title: 'Architecture Compliance Advisor',
      recommendation: `${nonCompliant.length} applications non-compliant with mandatory standards. Standards compliance at ${kpis.standardsCompliance}%. Prioritize ${nonCompliant[0]?.name ?? 'top app'} for ARB remediation.`,
      confidence: 88,
      impact: 'high',
      relatedIds: nonCompliant.map((a) => a.id),
    },
    {
      id: 'arch-ai-002',
      capability: 'reference-architecture',
      title: 'Reference Architecture Advisor',
      recommendation: `Reference adoption ${kpis.referenceAdoption}%. Align 28 payments applications to REF-01 Real-Time Payments Reference to reduce integration variance.`,
      confidence: 84,
      impact: 'high',
      relatedIds: ['REF-01', 'REF-02', 'REF-03'],
    },
    {
      id: 'arch-ai-003',
      capability: 'obsolescence',
      title: 'Technology Obsolescence Advisor',
      recommendation: `${obsolete.length} platforms at end-of-support/end-of-life: ${obsolete.slice(0, 3).map((p) => p.name).join(', ')}. Technology obsolescence at ${kpis.technologyObsolescence}%.`,
      confidence: 90,
      impact: 'high',
      relatedIds: obsolete.map((p) => p.id),
    },
    {
      id: 'arch-ai-004',
      capability: 'cloud-migration',
      title: 'Cloud Migration Advisor',
      recommendation: `Cloud readiness ${kpis.cloudReadiness}%. 38 applications ready for cloud-native refactor aligned to REF-02 Microservices reference.`,
      confidence: 82,
      impact: 'high',
      relatedIds: ARCH_APPLICATIONS.filter((a) => a.cloudReadiness > 80).slice(0, 5).map((a) => a.id),
    },
    {
      id: 'arch-ai-005',
      capability: 'ai-architecture',
      title: 'AI Architecture Advisor',
      recommendation: `AI readiness ${kpis.aiReadiness}%. Fraud and AML capabilities align to REF-05 streaming reference. 16 apps need data quality uplift before AI enablement.`,
      confidence: 80,
      impact: 'medium',
      relatedIds: ARCH_APPLICATIONS.filter((a) => a.aiReadiness > 75).slice(0, 5).map((a) => a.id),
    },
    {
      id: 'arch-ai-006',
      capability: 'architecture-debt',
      title: 'Architecture Debt Advisor',
      recommendation: `Architecture debt index ${kpis.architectureDebt} days avg. Top item: ${debt[0]?.title} on ${debt[0]?.appName} (${debt[0]?.effortDays} days). 150 debt items tracked.`,
      confidence: 86,
      impact: 'high',
      relatedIds: debt.map((d) => d.id),
    },
    {
      id: 'arch-ai-007',
      capability: 'security-architecture',
      title: 'Security Architecture Advisor',
      recommendation: 'Secure-by-Design adherence at 82%. 11 applications lack encryption-at-rest aligned to REF-03 Secure API Gateway pattern.',
      confidence: 85,
      impact: 'high',
      relatedIds: ARCH_FINDINGS.filter((f) => f.domain === 'security' && f.status === 'open').slice(0, 5).map((f) => f.id),
    },
    {
      id: 'arch-ai-008',
      capability: 'integration-risk',
      title: 'Integration Risk Advisor',
      recommendation: `${intRisks.length} high-risk integrations detected. Replace ${intRisks.filter((i) => i.pattern === 'batch' || i.pattern === 'file').length} point-to-point batch/file flows with event-driven patterns.`,
      confidence: 83,
      impact: 'medium',
      relatedIds: intRisks.map((i) => i.id),
    },
    {
      id: 'arch-ai-009',
      capability: 'modernization',
      title: 'Modernization Recommendation Engine',
      recommendation: `Modernization progress ${kpis.modernizationProgress}%. Prioritize mainframe decomposition for Core Banking and Cards capabilities — 22 platforms flagged for modernization wave.`,
      confidence: 81,
      impact: 'high',
      relatedIds: modernizationCandidates(5).map((d) => d.id),
    },
    {
      id: 'arch-ai-010',
      capability: 'rationalization',
      title: 'Architecture Rationalization Advisor',
      recommendation: 'Consolidate 8 overlapping integration platforms (IBM MQ, MuleSoft, Kong) into 2 strategic gateways. Estimated architecture simplification: 24%.',
      confidence: 79,
      impact: 'medium',
      relatedIds: ARCH_PLATFORMS.filter((p) => p.category === 'integration' || p.category === 'middleware').slice(0, 5).map((p) => p.id),
    },
  ];
}

export function archIntegrationLinks() {
  return [
    { hub: 'Application Portfolio', path: '/executive/application-portfolio', description: 'Applications mapped to architecture domains' },
    { hub: 'Portfolio Governance', path: '/executive/portfolio-governance', description: 'Demand and programs feeding architecture' },
    { hub: 'AI Delivery Copilot', path: '/executive/ai-copilot', description: 'Architecture-aware delivery recommendations' },
    { hub: 'Knowledge Center', path: '/knowledge-center', description: 'Reference architectures and patterns' },
    { hub: 'Production Intelligence', path: '/production', description: 'Production signals into architecture risk' },
    { hub: 'Value Realization', path: '/executive/value-realization', description: 'Architecture value and ROI' },
    { hub: 'Traceability Center', path: '/traceability', description: 'Capability-to-value lineage' },
    { hub: 'Workflow Orchestration', path: '/executive/workflow-orchestration', description: 'Architecture review workflows' },
    { hub: 'Approval Workflow', path: '/governance/approval-workflow', description: 'ARB approvals and exceptions' },
    { hub: 'Audit Center', path: '/governance/audit-center', description: 'Architecture compliance audit trail' },
    { hub: 'Notification Center', path: '/operations/notifications', description: 'Obsolescence and risk alerts' },
    { hub: 'Event Bus', path: '/governance/activity-center', description: 'Architecture state change events' },
  ];
}

export { ARCH_TRACEABILITY_CHAINS };
