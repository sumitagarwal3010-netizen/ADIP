import type { PersonaId } from '../config/personaConfig';
import type { CopilotDomain, CopilotRecommendation } from '../types/copilot';
import type {
  FeedbackDomain,
  LeakageStage,
  ProductionIntelligenceKpis,
  RcaPattern,
  TraceabilityChain,
} from '../types/productionIntelligence';
import { PRODUCTION_INTEL_ALLOWED_PERSONAS } from '../types/productionIntelligence';
import {
  CUSTOMER_SIGNALS,
  FEEDBACK_RECOMMENDATIONS,
  PRODUCTION_APPLICATIONS,
  PRODUCTION_DEFECTS,
  PRODUCTION_INCIDENTS,
  RCA_RECORDS,
  RELEASE_EVENTS,
  TRACEABILITY_CHAINS,
} from './productionIntelligenceMock';

export function canAccessProductionIntelligence(personaId: PersonaId): boolean {
  return PRODUCTION_INTEL_ALLOWED_PERSONAS.includes(personaId);
}

export function computeProductionIntelligenceKpis(): ProductionIntelligenceKpis {
  const openIncidents = PRODUCTION_INCIDENTS.filter((i) => i.status === 'open');
  const critical = PRODUCTION_INCIDENTS.filter((i) => i.severity === 'critical' || i.severity === 'high');
  const escaped = PRODUCTION_DEFECTS.filter((d) => d.escapedToProduction);
  const negativeSignals = CUSTOMER_SIGNALS.filter((s) => s.sentiment === 'negative');
  const avgAvail = PRODUCTION_APPLICATIONS.length
    ? Math.round(
      PRODUCTION_APPLICATIONS.reduce((s, a) => s + a.availability, 0) / PRODUCTION_APPLICATIONS.length * 10,
    ) / 10
    : 0;
  const avgRisk = PRODUCTION_APPLICATIONS.length
    ? Math.round(PRODUCTION_APPLICATIONS.reduce((s, a) => s + a.riskScore, 0) / PRODUCTION_APPLICATIONS.length)
    : 0;
  const leakageRate = PRODUCTION_DEFECTS.length
    ? Math.round((escaped.length / PRODUCTION_DEFECTS.length) * 100)
    : 0;
  const customerImpact = Math.min(100, Math.round(negativeSignals.length / CUSTOMER_SIGNALS.length * 100));

  return {
    productionRisk: avgRisk,
    customerImpact,
    defectLeakage: leakageRate,
    incidentTrend: openIncidents.length,
    feedbackRecommendations: FEEDBACK_RECOMMENDATIONS.length,
    openIncidents: openIncidents.length,
    criticalIncidents: critical.length,
    totalApplications: PRODUCTION_APPLICATIONS.length,
    avgAvailability: avgAvail,
    escapedDefects: escaped.length,
    customerComplaints: CUSTOMER_SIGNALS.filter((c) => c.channel === 'complaint').length,
  };
}

export function leakageByStage() {
  const stages: LeakageStage[] = ['requirements', 'architecture', 'development', 'testing', 'release', 'production'];
  return stages.map((stage) => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    value: PRODUCTION_DEFECTS.filter((d) => d.leakageStage === stage).length,
  }));
}

export function leakageTrend() {
  return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map((week, i) => ({
    week,
    escapes: 8 + (i % 5) + Math.floor(i / 2),
    caught: 12 + (i % 4),
  }));
}

export function topLeakageApplications(limit = 8) {
  const counts = new Map<string, number>();
  for (const d of PRODUCTION_DEFECTS.filter((x) => x.escapedToProduction)) {
    counts.set(d.application, (counts.get(d.application) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function sentimentTrend() {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    negative: 20 + (i % 8),
    neutral: 15 + (i % 5),
    positive: 30 + (i % 10),
  }));
}

export function topPainPoints(limit = 6) {
  const counts = new Map<string, number>();
  for (const s of CUSTOMER_SIGNALS) {
    counts.set(s.painPoint, (counts.get(s.painPoint) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function mostImpactedApplications(limit = 8) {
  const counts = new Map<string, number>();
  for (const s of CUSTOMER_SIGNALS.filter((x) => x.sentiment === 'negative')) {
    counts.set(s.application, (counts.get(s.application) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function incidentTrend7d() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    count: 12 + (i % 6) + Math.floor(i / 2),
    critical: 2 + (i % 3),
  }));
}

export function rcaPatternChart() {
  const patterns: RcaPattern[] = [
    'requirement-quality', 'architecture-design', 'coding-defect', 'testing-gap',
    'release-error', 'operational-issue', 'third-party-issue',
  ];
  const labels: Record<RcaPattern, string> = {
    'requirement-quality': 'Requirement Quality',
    'architecture-design': 'Architecture Design',
    'coding-defect': 'Coding Defect',
    'testing-gap': 'Testing Gap',
    'release-error': 'Release Error',
    'operational-issue': 'Operational Issue',
    'third-party-issue': 'Third Party Issue',
  };
  return patterns.map((p) => ({
    name: labels[p],
    value: RCA_RECORDS.filter((r) => r.pattern === p).length,
  }));
}

export function topRecurringCauses(limit = 6) {
  const counts = new Map<string, number>();
  for (const r of RCA_RECORDS) {
    counts.set(r.rootCause, (counts.get(r.rootCause) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cause, count]) => ({ cause, count }));
}

export function predictedFutureRisks() {
  return [
    { risk: 'UPI peak-window timeout recurrence', probability: 72, domain: 'Payments' },
    { risk: 'Mobile SDK regression after next release', probability: 58, domain: 'Mobile Banking' },
    { risk: 'Third-party gateway SLA breach', probability: 45, domain: 'Payments' },
    { risk: 'Settlement batch delay during month-end', probability: 41, domain: 'Cards' },
  ];
}

export function bestReleases(limit = 5) {
  return [...RELEASE_EVENTS]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, limit);
}

export function worstReleases(limit = 5) {
  return [...RELEASE_EVENTS]
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, limit);
}

export function getTraceabilityChain(incidentId: string): TraceabilityChain | undefined {
  return TRACEABILITY_CHAINS.find((c) => c.incident === incidentId);
}

export function getApplicationById(id: string) {
  return PRODUCTION_APPLICATIONS.find((a) => a.id === id);
}

export function getIncidentsForApplication(appId: string) {
  return PRODUCTION_INCIDENTS.filter((i) => i.applicationId === appId);
}

export function feedbackByDomain() {
  const domains = ['requirements', 'architecture', 'development', 'testing', 'release', 'governance', 'audit'] as const;
  return domains.map((d) => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    value: FEEDBACK_RECOMMENDATIONS.filter((r) => r.domain === d).length,
  }));
}

function toCopilotDomain(domain: FeedbackDomain): CopilotDomain {
  if (domain === 'governance' || domain === 'audit') return 'audit';
  if (domain === 'requirements' || domain === 'architecture' || domain === 'development' || domain === 'testing' || domain === 'release') {
    return domain;
  }
  return 'improvement';
}

export function mapFeedbackToCopilotRecommendations(): CopilotRecommendation[] {
  return FEEDBACK_RECOMMENDATIONS.map((r, i) => ({
    id: `PI-${r.id}`,
    projectId: `PRJ-${String((i % 50) + 1).padStart(3, '0')}`,
    domain: toCopilotDomain(r.domain),
    category: 'Production Feedback',
    title: r.title,
    insight: r.insight,
    suggestedAction: r.suggestedAction,
    priority: r.priority,
    status: 'open' as const,
    impact: r.predictedImpact,
    lifecycleStage: 'production',
    createdAt: new Date().toISOString(),
  }));
}
