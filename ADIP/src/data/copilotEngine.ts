import type { PersonaId } from '../config/personaConfig';
import type {
  CopilotKpis,
  CopilotProject,
  CopilotRecommendation,
  ExecutiveCopilotSummary,
  ReleaseReadiness,
} from '../types/copilot';
import { COPILOT_ALLOWED_PERSONAS } from '../types/copilot';
import {
  COPILOT_IMPROVEMENT_ACTIONS,
  COPILOT_PROJECTS,
  COPILOT_RECOMMENDATIONS,
  COPILOT_REQUIREMENT_INSIGHTS,
  COPILOT_RISK_OBSERVATIONS,
} from './copilotMockData';

export function canAccessCopilot(personaId: PersonaId): boolean {
  return COPILOT_ALLOWED_PERSONAS.includes(personaId);
}

export function computeCopilotKpis(
  projects: CopilotProject[] = COPILOT_PROJECTS,
  recommendations: CopilotRecommendation[] = COPILOT_RECOMMENDATIONS,
): CopilotKpis {
  const openRecs = recommendations.filter((r) => r.status === 'open');
  const critical = COPILOT_RISK_OBSERVATIONS.filter((r) => r.severity === 'critical' || r.severity === 'high');
  const avgHealth = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.healthScore, 0) / projects.length)
    : 0;
  const avgRisk = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.deliveryRisk, 0) / projects.length)
    : 0;
  const qualityGain = Math.round(
    COPILOT_IMPROVEMENT_ACTIONS.filter((a) => a.status !== 'implemented')
      .reduce((s, a) => s + a.predictedQualityGain, 0) / Math.max(1, COPILOT_IMPROVEMENT_ACTIONS.length),
  );

  return {
    aiRecommendations: recommendations.length,
    deliveryHealth: avgHealth,
    portfolioRisk: avgRisk,
    predictedQualityImprovement: qualityGain,
    openRecommendations: openRecs.length,
    criticalRisks: critical.length,
    improvementActions: COPILOT_IMPROVEMENT_ACTIONS.filter((a) => a.status === 'open').length,
    projectsAtRisk: projects.filter((p) => p.healthScore < 70 || p.deliveryRisk > 65).length,
  };
}

export function getProjectById(id: string): CopilotProject | undefined {
  return COPILOT_PROJECTS.find((p) => p.id === id);
}

export function getRecommendationsForProject(projectId: string): CopilotRecommendation[] {
  return COPILOT_RECOMMENDATIONS.filter((r) => r.projectId === projectId);
}

export function getRisksForProject(projectId: string) {
  return COPILOT_RISK_OBSERVATIONS.filter((r) => r.projectId === projectId);
}

export function getImprovementsForProject(projectId: string) {
  return COPILOT_IMPROVEMENT_ACTIONS.filter((a) => a.projectId === projectId);
}

export function analyzeArchitecture(projectId?: string) {
  const risks = projectId
    ? getRisksForProject(projectId).filter((r) => r.domain === 'architecture')
    : COPILOT_RISK_OBSERVATIONS.filter((r) => r.domain === 'architecture');
  return risks.map((r) => ({
    module: r.module,
    observation: r.observation,
    recommendation: `Add ${r.rootCause.includes('control') ? 'governance control' : 'resiliency pattern'} for ${r.module}`,
    pattern: r.rootCause.includes('Integration') ? 'Missing circuit breaker' : 'Missing monitoring',
  }));
}

export function analyzeDevelopment(projectId?: string) {
  const risks = projectId
    ? getRisksForProject(projectId).filter((r) => r.domain === 'development')
    : COPILOT_RISK_OBSERVATIONS.filter((r) => r.domain === 'development');
  return risks.map((r) => ({
    module: r.module,
    techDebt: r.severity === 'critical' ? 'High' : r.severity === 'high' ? 'Medium' : 'Low',
    insight: r.observation,
    refactorCandidate: r.severity !== 'low',
  }));
}

export function analyzeTesting(projectId?: string) {
  const recs = projectId
    ? getRecommendationsForProject(projectId).filter((r) => r.domain === 'testing')
    : COPILOT_RECOMMENDATIONS.filter((r) => r.domain === 'testing');
  return recs.map((r) => ({
    scenario: r.title,
    type: r.category === 'Automation' ? 'Automation candidate' : 'Regression pack',
    prediction: r.insight,
    action: r.suggestedAction,
  }));
}

export function computeReleaseReadiness(projectId: string): ReleaseReadiness {
  const project = getProjectById(projectId) ?? COPILOT_PROJECTS[0];
  const score = Math.round((project.healthScore + (100 - project.releaseRisk)) / 2);
  const go = score >= 80 ? 'Go' as const : score >= 65 ? 'Conditional Go' as const : 'No-Go' as const;
  return {
    projectId: project.id,
    projectName: project.name,
    releaseReadinessScore: score,
    productionRiskScore: project.releaseRisk,
    rollbackReadinessScore: Math.max(40, 100 - project.releaseRisk),
    defectRiskScore: project.testingRisk,
    auditRiskScore: project.auditRisk,
    operationalRiskScore: project.deliveryRisk,
    recommendation: go,
    rationale: go === 'Go'
      ? 'Risk scores within acceptable thresholds for production promotion.'
      : go === 'Conditional Go'
        ? 'Address open audit findings and complete regression pack before go-live.'
        : 'Elevated defect and audit risk — defer release until remediation complete.',
  };
}

export function analyzeAudit(projectId?: string) {
  const recs = projectId
    ? getRecommendationsForProject(projectId).filter((r) => r.domain === 'audit')
    : COPILOT_RECOMMENDATIONS.filter((r) => r.domain === 'audit');
  return recs.map((r) => ({
    finding: r.title,
    gap: r.category === 'Evidence' ? 'Missing evidence' : 'Weak control',
    recommendation: r.suggestedAction,
    complianceImpact: r.priority === 'critical' ? 'High' : 'Medium',
  }));
}

export function buildExecutiveSummary(): ExecutiveCopilotSummary {
  const kpis = computeCopilotKpis();
  const topProjects = [...COPILOT_PROJECTS].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);
  return {
    weeklyCioSummary: `Portfolio delivery health at ${kpis.deliveryHealth}% with ${kpis.openRecommendations} open AI recommendations. ` +
      `${kpis.projectsAtRisk} projects require executive attention this week.`,
    portfolioHealthSummary: `Average health ${kpis.deliveryHealth}% across ${COPILOT_PROJECTS.length} projects. ` +
      `Predicted quality improvement of ${kpis.predictedQualityImprovement}% if improvement backlog is executed.`,
    deliveryBottlenecks: topProjects.map((p) => `${p.name} — ${p.deliveryRisk}% delivery risk`),
    governanceHotspots: ['Release gate evidence gaps', 'Approval SLA breaches on Payments', 'Missing architecture sign-off'],
    riskHotspots: ['UPI Gateway timeouts', 'Mobile SDK regression gaps', 'AML control effectiveness'],
  };
}

export function getRequirementInsights(projectId?: string) {
  return projectId
    ? COPILOT_REQUIREMENT_INSIGHTS.filter((r) => r.projectId === projectId)
    : COPILOT_REQUIREMENT_INSIGHTS;
}

export function topRecurringIssues(limit = 8) {
  const counts = new Map<string, number>();
  for (const r of COPILOT_RISK_OBSERVATIONS) {
    counts.set(r.rootCause, (counts.get(r.rootCause) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([issue, count]) => ({ issue, count }));
}

export function domainRiskChart() {
  const counts = new Map<string, number>();
  for (const p of COPILOT_PROJECTS) {
    counts.set(p.domain, (counts.get(p.domain) ?? 0) + p.deliveryRisk);
  }
  return [...counts.entries()].map(([name, value]) => ({ name, value: Math.round(value / 10) }));
}

export function recommendationTrend() {
  const domains = ['Requirements', 'Architecture', 'Development', 'Testing', 'Release', 'Audit'];
  return domains.map((name, i) => ({
    name,
    value: COPILOT_RECOMMENDATIONS.filter((r) => r.domain === name.toLowerCase() || (i === 0 && r.domain === 'requirements')).length
      || COPILOT_RECOMMENDATIONS.filter((_, idx) => idx % domains.length === i).length,
  }));
}

export function filterRecommendations(query: {
  search?: string;
  domain?: string;
  priority?: string;
  projectId?: string;
}) {
  const search = query.search?.toLowerCase();
  return COPILOT_RECOMMENDATIONS.filter((r) => {
    if (query.domain && query.domain !== 'all' && r.domain !== query.domain) return false;
    if (query.priority && query.priority !== 'all' && r.priority !== query.priority) return false;
    if (query.projectId && r.projectId !== query.projectId) return false;
    if (search) {
      const hay = `${r.title} ${r.insight} ${r.suggestedAction}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}
