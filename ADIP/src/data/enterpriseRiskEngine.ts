import type { PersonaId } from '../config/personaConfig';
import type { EnterpriseRiskKpis, RiskAiInsight } from '../types/enterpriseRisk';
import { ENTERPRISE_RISK_ALLOWED_PERSONAS } from '../types/enterpriseRisk';
import {
  ERM_AI_RISKS,
  ERM_ASSURANCE_REVIEWS,
  ERM_AUDIT_FINDINGS,
  ERM_CONTROLS,
  ERM_CYBER_RISKS,
  ERM_ENTERPRISE_RISKS,
  ERM_REGULATORY_RISKS,
  ERM_RISK_APPETITE,
  ERM_TECHNOLOGY_RISKS,
  ERM_TRACEABILITY_CHAINS,
} from './enterpriseRiskMock';

export function canAccessEnterpriseRisk(personaId: PersonaId): boolean {
  return ENTERPRISE_RISK_ALLOWED_PERSONAS.includes(personaId);
}

export function computeEnterpriseRiskKpis(): EnterpriseRiskKpis {
  const enterpriseRiskExposure = Math.round(ERM_ENTERPRISE_RISKS.reduce((s, r) => s + r.inherentScore, 0) / ERM_ENTERPRISE_RISKS.length);
  const residualRisk = Math.round(ERM_ENTERPRISE_RISKS.reduce((s, r) => s + r.residualScore, 0) / ERM_ENTERPRISE_RISKS.length);
  const effective = ERM_CONTROLS.filter((c) => c.effectiveness === 'effective').length;
  const controlEffectiveness = Math.round((effective / ERM_CONTROLS.length) * 100);
  const openCriticalRisks = ERM_ENTERPRISE_RISKS.filter((r) => r.severity === 'critical' && (r.status === 'open' || r.status === 'mitigating' || r.status === 'monitoring')).length;
  const riskAppetiteBreaches = ERM_RISK_APPETITE.filter((a) => a.status === 'breached').length;
  const regulatoryExposure = Math.round(ERM_REGULATORY_RISKS.reduce((s, r) => s + r.exposureValue, 0) / 1_000_000);
  const cyberRiskScore = Math.round(ERM_CYBER_RISKS.reduce((s, r) => s + r.exposureScore, 0) / ERM_CYBER_RISKS.length);
  const aiRiskScore = Math.round(ERM_AI_RISKS.reduce((s, r) => s + r.residualScore, 0) / ERM_AI_RISKS.length);
  const openFindings = ERM_AUDIT_FINDINGS.filter((f) => f.status !== 'closed').length;
  const auditRiskScore = Math.round((openFindings / ERM_AUDIT_FINDINGS.length) * 100);
  const completedAssurance = ERM_ASSURANCE_REVIEWS.filter((a) => a.status === 'completed' || a.status === 'in-progress').length;
  const assuranceCoverage = Math.round((completedAssurance / ERM_ASSURANCE_REVIEWS.length) * 100);

  return {
    enterpriseRiskExposure,
    residualRisk,
    controlEffectiveness,
    openCriticalRisks,
    riskAppetiteBreaches,
    regulatoryExposure,
    cyberRiskScore,
    aiRiskScore,
    auditRiskScore,
    assuranceCoverage,
  };
}

export function risksByCategory() {
  const counts = new Map<string, number>();
  for (const r of ERM_ENTERPRISE_RISKS) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function risksBySeverity() {
  const counts = new Map<string, number>();
  for (const r of ERM_ENTERPRISE_RISKS) counts.set(r.severity, (counts.get(r.severity) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function risksByBusinessUnit() {
  const counts = new Map<string, number>();
  for (const r of ERM_ENTERPRISE_RISKS) counts.set(r.businessUnit, (counts.get(r.businessUnit) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function topEnterpriseRisks(limit = 20) {
  return [...ERM_ENTERPRISE_RISKS].sort((a, b) => b.residualScore - a.residualScore).slice(0, limit);
}

export function criticalOpenRisks(limit = 20) {
  return ERM_ENTERPRISE_RISKS.filter((r) => r.severity === 'critical' && r.status !== 'closed' && r.status !== 'accepted').slice(0, limit);
}

export function topTechnologyRisks(limit = 18) {
  return [...ERM_TECHNOLOGY_RISKS].sort((a, b) => b.residualScore - a.residualScore).slice(0, limit);
}

export function technologyRiskByCategory() {
  const counts = new Map<string, number>();
  for (const r of ERM_TECHNOLOGY_RISKS) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function topCyberRisks(limit = 18) {
  return [...ERM_CYBER_RISKS].sort((a, b) => b.exposureScore - a.exposureScore).slice(0, limit);
}

export function cyberRiskByThreat() {
  const counts = new Map<string, number>();
  for (const r of ERM_CYBER_RISKS) counts.set(r.threatType, (counts.get(r.threatType) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function topAiRisks(limit = 18) {
  return [...ERM_AI_RISKS].sort((a, b) => b.residualScore - a.residualScore).slice(0, limit);
}

export function aiRiskByCategory() {
  const counts = new Map<string, number>();
  for (const r of ERM_AI_RISKS) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

export function topRegulatoryRisks(limit = 18) {
  return [...ERM_REGULATORY_RISKS].sort((a, b) => b.exposureValue - a.exposureValue).slice(0, limit);
}

export function regulatoryExposureByRegulator() {
  const by = new Map<string, number>();
  for (const r of ERM_REGULATORY_RISKS) by.set(r.regulator, (by.get(r.regulator) ?? 0) + Math.round(r.exposureValue / 1_000_000));
  return Array.from(by.entries()).map(([name, value]) => ({ name, value }));
}

export function openAuditFindings(limit = 20) {
  return ERM_AUDIT_FINDINGS.filter((f) => f.status !== 'closed')
    .slice(0, limit)
    .map((f) => {
      const risk = ERM_ENTERPRISE_RISKS.find((r) => r.id === f.riskId);
      return { ...f, riskTitle: risk?.title ?? f.riskId };
    });
}

export function findingsBySource() {
  const counts = new Map<string, number>();
  for (const f of ERM_AUDIT_FINDINGS) counts.set(f.source, (counts.get(f.source) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function controlEffectivenessDistribution() {
  const counts = new Map<string, number>();
  for (const c of ERM_CONTROLS) counts.set(c.effectiveness, (counts.get(c.effectiveness) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function ineffectiveControls(limit = 18) {
  return ERM_CONTROLS.filter((c) => c.effectiveness === 'ineffective' || c.effectiveness === 'not-tested').slice(0, limit);
}

export function appetiteChart() {
  return ERM_RISK_APPETITE.map((a) => ({ name: a.category, value: a.currentExposure }));
}

export function assuranceByLine() {
  const counts = new Map<string, number>();
  for (const a of ERM_ASSURANCE_REVIEWS) counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
}

export function assuranceReviews(limit = 18) {
  return [...ERM_ASSURANCE_REVIEWS].slice(0, limit);
}

export function generateRiskAiInsights(): RiskAiInsight[] {
  const kpis = computeEnterpriseRiskKpis();
  const critical = criticalOpenRisks(5);
  const gaps = ineffectiveControls(5);
  const cyber = topCyberRisks(3);
  const ai = topAiRisks(3);
  const reg = topRegulatoryRisks(3);

  return [
    {
      id: 'erm-ai-001',
      capability: 'risk-hotspot',
      title: 'Risk Hotspot Advisor',
      recommendation: `${kpis.openCriticalRisks} open critical risks; enterprise risk exposure ${kpis.enterpriseRiskExposure}. Hotspots concentrated in cyber, AI, and payments — prioritize ${critical[0]?.title ?? 'top risk'}.`,
      confidence: 89,
      impact: 'high',
      relatedIds: critical.map((r) => r.id),
    },
    {
      id: 'erm-ai-002',
      capability: 'emerging-risk',
      title: 'Emerging Risk Advisor',
      recommendation: `AI risk score ${kpis.aiRiskScore} and cyber risk score ${kpis.cyberRiskScore} are trending up. Emerging risks: model drift, ransomware, and third-party concentration.`,
      confidence: 84,
      impact: 'high',
      relatedIds: [...ai.map((r) => r.id), ...cyber.map((r) => r.id)],
    },
    {
      id: 'erm-ai-003',
      capability: 'control-gap',
      title: 'Control Gap Advisor',
      recommendation: `Control effectiveness ${kpis.controlEffectiveness}%. ${gaps.length}+ ineffective/untested controls map to open audit findings — prioritize automation and testing.`,
      confidence: 86,
      impact: 'high',
      relatedIds: gaps.map((c) => c.id),
    },
    {
      id: 'erm-ai-004',
      capability: 'audit-correlation',
      title: 'Audit Correlation Advisor',
      recommendation: `Audit risk score ${kpis.auditRiskScore}%. 28 control gaps correlate with overdue findings — cluster remediation by control owner to reduce residual risk fastest.`,
      confidence: 83,
      impact: 'medium',
      relatedIds: openAuditFindings(5).map((f) => f.id),
    },
    {
      id: 'erm-ai-005',
      capability: 'regulatory-exposure',
      title: 'Regulatory Exposure Advisor',
      recommendation: `Regulatory exposure ₹${kpis.regulatoryExposure}M. 11 exposures approaching deadlines (${reg.map((r) => r.regulator).join(', ')}). Prioritize filings and remediation.`,
      confidence: 85,
      impact: 'high',
      relatedIds: reg.map((r) => r.id),
    },
    {
      id: 'erm-ai-006',
      capability: 'cyber-threat',
      title: 'Cyber Threat Advisor',
      recommendation: `Cyber risk score ${kpis.cyberRiskScore}. Ransomware and unpatched-vulnerability exposures are highest; accelerate patching and tabletop exercises for payments assets.`,
      confidence: 87,
      impact: 'high',
      relatedIds: cyber.map((r) => r.id),
    },
    {
      id: 'erm-ai-007',
      capability: 'ai-governance-risk',
      title: 'AI Governance Risk Advisor',
      recommendation: `AI risk score ${kpis.aiRiskScore}. Bias, explainability, and drift risks dominate fraud/credit models — enforce model governance gates and monitoring.`,
      confidence: 82,
      impact: 'medium',
      relatedIds: ai.map((r) => r.id),
    },
    {
      id: 'erm-ai-008',
      capability: 'risk-appetite',
      title: 'Risk Appetite Advisor',
      recommendation: `${kpis.riskAppetiteBreaches} risk categories breached appetite. Escalate breached categories to the Risk Committee and re-baseline tolerances.`,
      confidence: 84,
      impact: 'high',
      relatedIds: ERM_RISK_APPETITE.filter((a) => a.status === 'breached').map((a) => a.id),
    },
    {
      id: 'erm-ai-009',
      capability: 'assurance-planning',
      title: 'Assurance Planning Advisor',
      recommendation: `Assurance coverage ${kpis.assuranceCoverage}%. Under-assured domains: AI and third-party. Schedule second/third-line reviews to close coverage gaps.`,
      confidence: 81,
      impact: 'medium',
      relatedIds: ERM_ASSURANCE_REVIEWS.filter((a) => a.status === 'planned' || a.status === 'deferred').slice(0, 5).map((a) => a.id),
    },
    {
      id: 'erm-ai-010',
      capability: 'executive-summary',
      title: 'Executive Risk Summary Advisor',
      recommendation: `Residual risk ${kpis.residualRisk} vs exposure ${kpis.enterpriseRiskExposure}. Board priorities: close ${kpis.openCriticalRisks} critical risks, remediate control gaps, and approve assurance plan.`,
      confidence: 88,
      impact: 'high',
      relatedIds: critical.map((r) => r.id),
    },
  ];
}

export function riskIntegrationLinks() {
  return [
    { hub: 'Audit Center', path: '/governance/audit-center', description: 'Audit findings and remediation' },
    { hub: 'AI Governance', path: '/governance/ai-governance', description: 'AI model risk and controls' },
    { hub: 'Production Intelligence', path: '/production', description: 'Production incidents into operational risk' },
    { hub: 'Application Portfolio', path: '/executive/application-portfolio', description: 'Application-level technology risk' },
    { hub: 'Architecture Repository', path: '/executive/architecture-repository', description: 'Architecture risk and exceptions' },
    { hub: 'Technology Strategy', path: '/executive/technology-strategy', description: 'Technology obsolescence and vendor risk' },
    { hub: 'Portfolio Governance', path: '/executive/portfolio-governance', description: 'Investment and delivery risk' },
    { hub: 'Transformation PMO', path: '/executive/transformation-pmo', description: 'Transformation and dependency risk' },
    { hub: 'Knowledge Center', path: '/knowledge-center', description: 'Risk policies and playbooks' },
    { hub: 'Value Realization', path: '/executive/value-realization', description: 'Risk-avoidance value' },
    { hub: 'Notification Center', path: '/operations/notifications', description: 'Risk and breach alerts' },
    { hub: 'Event Bus', path: '/governance/activity-center', description: 'Risk state change events' },
    { hub: 'Executive Control Tower', path: '/executive', description: 'Enterprise risk KPIs' },
  ];
}

export { ERM_TRACEABILITY_CHAINS };
