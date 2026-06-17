/**
 * Enterprise Persona Mode configuration.
 *
 * Maps each of the 13 personas to existing ADIP functionality — no new hubs,
 * no new data. Each persona declares:
 *   - identity (label, initials, title)
 *   - which existing nav hubs are relevant (role-based navigation)
 *   - landing metrics (sourced from the live SimulationState at render time)
 *   - report hub keys (reuse HubArtifactGenerator / HUB_ARTIFACT_CONFIGS)
 *   - action-queue scope (which trace node types + a domain filter feed the
 *     Role-Based Action Center, sourced from the existing traceability graph)
 *
 * Everything here is a *selector over existing data*, so personas are pure
 * recomposition of what ADIP already renders.
 */

import type { SimulationState } from '../types/simulation';
import type { HubKey } from '../data/hubArtifactDefinitions';
import type { TraceNodeType } from '../data/traceabilityModel';

export type PersonaId =
  | 'cio'
  | 'cto'
  | 'ciso'
  | 'audit-head'
  | 'compliance-officer'
  | 'risk-officer'
  | 'enterprise-architect'
  | 'application-owner'
  | 'developer'
  | 'tester'
  | 'release-manager'
  | 'operations-manager'
  | 'model-owner';

export interface PersonaMetric {
  label: string;
  /** Selector over the live simulation state. */
  value: (s: SimulationState) => string | number;
  suffix?: string;
  trend?: number;
}

export interface PersonaActionScope {
  /** Trace node types this persona must action / monitor. */
  types: TraceNodeType[];
  /** Optional domain filter (matches TraceNode.domain). Omit for enterprise-wide. */
  domain?: string;
}

export interface PersonaConfig {
  id: PersonaId;
  label: string;
  initials: string;
  title: string;
  /** Mission statement shown on the landing header. */
  mission: string;
  /** Quick-link routes (existing app routes) surfaced on the landing. */
  quickLinks: { label: string; to: string }[];
  /** Existing nav hub ids this persona should see (role-based navigation). */
  navHubs: string[];
  /** Landing KPI strip — selectors over the live simulation state. */
  metrics: PersonaMetric[];
  /** Report generators to surface (reuse existing hub artifact configs). */
  reportHubs: HubKey[];
  /** What feeds the Role-Based Action Center work queue. */
  actionScope: PersonaActionScope;
}

const pct = (n: number) => `${Math.round(n)}%`;

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'cio',
    label: 'CIO',
    initials: 'CIO',
    title: 'Chief Information Officer',
    mission: 'Portfolio health, delivery confidence, and enterprise risk at a glance.',
    quickLinks: [
      { label: 'Executive Control Tower', to: '/' },
      { label: 'Notification Center', to: '/operations/notifications' },
      { label: 'Audit Center', to: '/governance/audit-center' },
      { label: 'Traceability Executive View', to: '/traceability/executive' },
      { label: 'Enterprise Reports', to: '/reports' },
      { label: 'Strategic Risks', to: '/executive/strategic-risks' },
      { label: 'AI Delivery Copilot', to: '/executive/ai-copilot' },
    ],
    navHubs: ['executive', 'governance', 'transformation', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Portfolio Health', value: (s) => pct(s.executive.portfolioHealth), suffix: '%', trend: 2.4 },
      { label: 'Open Risks', value: (s) => s.executive.openRisks, suffix: '', trend: -3 },
      { label: 'Open Incidents', value: (s) => s.executive.openIncidents, suffix: '', trend: -12 },
      { label: 'Business Impact', value: (s) => pct(s.executive.businessImpactScore), suffix: '%', trend: 1.2 },
    ],
    reportHubs: ['executive', 'traceability', 'audit-center', 'notification-center', 'ai-copilot', 'production-intelligence', 'knowledge-center', 'value-realization', 'portfolio-governance', 'application-portfolio', 'architecture-repository', 'technology-strategy', 'transformation-pmo', 'enterprise-risk'],
    actionScope: { types: ['risk', 'incident', 'compliance', 'release'] },
  },
  {
    id: 'cto',
    label: 'CTO',
    initials: 'CTO',
    title: 'Chief Technology Officer',
    mission: 'Engineering health, delivery throughput, and architecture readiness.',
    quickLinks: [
      { label: 'Delivery Intelligence', to: '/delivery' },
      { label: 'Development Hub', to: '/development' },
      { label: 'Architecture Hub', to: '/architecture' },
      { label: 'Release Center', to: '/release' },
      { label: 'AI Delivery Copilot', to: '/executive/ai-copilot' },
    ],
    navHubs: ['executive', 'ai-sdlc', 'operations', 'platform'],
    metrics: [
      { label: 'Delivery Health', value: (s) => pct(s.delivery.codeQualityAvg), suffix: '%', trend: 1.5 },
      { label: 'Change Failure Rate', value: (s) => `${s.delivery.changeFailureRate}`, suffix: '%', trend: -1.1 },
      { label: 'Tech Debt Items', value: (s) => s.delivery.technicalDebtItems, suffix: '', trend: -2 },
      { label: 'Release Confidence', value: (s) => pct(s.release.confidence), suffix: '%', trend: 1.8 },
    ],
    reportHubs: ['production', 'ai-copilot', 'production-intelligence', 'knowledge-center', 'value-realization', 'portfolio-governance', 'application-portfolio', 'architecture-repository', 'technology-strategy', 'transformation-pmo', 'enterprise-risk'],
    actionScope: { types: ['architecture', 'api', 'release', 'testCase'] },
  },
  {
    id: 'ciso',
    label: 'CISO',
    initials: 'CISO',
    title: 'Chief Information Security Officer',
    mission: 'Security posture, control effectiveness, and AI/security risk exposure.',
    quickLinks: [
      { label: 'Governance Risk', to: '/governance/risk' },
      { label: 'Notification Center', to: '/operations/notifications/inbox' },
      { label: 'Audit Center', to: '/governance/audit-center/findings' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'AI Risk', to: '/ai-governance-center/risks' },
      { label: 'AI Controls', to: '/ai-governance-center/controls' },
      { label: 'Evidence', to: '/governance/audit-center/evidence' },
    ],
    navHubs: ['governance', 'operations', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Governance Score', value: (s) => pct(s.governance.governanceScore), suffix: '%', trend: 1.1 },
      { label: 'Security Findings', value: (s) => s.governance.securityFindings, suffix: '', trend: -2 },
      { label: 'Policy Compliance', value: (s) => pct(s.governance.policyCompliance), suffix: '%', trend: 0.6 },
      { label: 'Open Incidents', value: (s) => s.production.activeIncidents, suffix: '', trend: -5 },
    ],
    reportHubs: ['risk', 'ai-controls', 'approval-workflow', 'audit-center', 'notification-center', 'knowledge-center', 'value-realization', 'enterprise-risk'],
    actionScope: { types: ['control', 'risk', 'incident'] },
  },
  {
    id: 'audit-head',
    label: 'Audit Head',
    initials: 'AH',
    title: 'Head of Internal Audit',
    mission: 'Audit readiness, control evidence, and observation closure.',
    quickLinks: [
      { label: 'Audit Center', to: '/governance/audit-center' },
      { label: 'Notification Inbox', to: '/operations/notifications/inbox' },
      { label: 'Audit Findings', to: '/governance/audit-center/findings' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'Audit Reports', to: '/governance/audit-center/reports' },
      { label: 'Evidence Repository', to: '/governance/audit-center/evidence' },
      { label: 'Audit Traceability', to: '/traceability/evidence' },
    ],
    navHubs: ['governance', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Audit Observations', value: (s) => s.governance.auditObservations, suffix: '', trend: -3 },
      { label: 'Baseline Compliance', value: (s) => pct(s.governance.baselineCompliance), suffix: '%', trend: 1 },
      { label: 'Policy Violations', value: (s) => s.governance.policyViolations, suffix: '', trend: -1 },
      { label: 'Governance Score', value: (s) => pct(s.governance.governanceScore), suffix: '%', trend: 1.1 },
    ],
    reportHubs: ['audit-center', 'notification-center', 'approval-workflow', 'ai-copilot', 'production-intelligence', 'knowledge-center'],
    actionScope: { types: ['evidence', 'control', 'compliance'] },
  },
  {
    id: 'compliance-officer',
    label: 'Compliance Officer',
    initials: 'CO',
    title: 'Regulatory Compliance Officer',
    mission: 'Regulatory posture across RBI, PCI-DSS, ISO 27001, and DPSC.',
    quickLinks: [
      { label: 'Audit Center — Compliance', to: '/governance/audit-center/compliance' },
      { label: 'Notification Center', to: '/operations/notifications' },
      { label: 'Audit Readiness', to: '/governance/audit-center/readiness' },
      { label: 'Governance Compliance', to: '/governance/compliance' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'Compliance Reports', to: '/reports/compliance' },
      { label: 'Evidence Repository', to: '/governance/audit-center/evidence' },
    ],
    navHubs: ['governance', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Baseline Compliance', value: (s) => pct(s.governance.baselineCompliance), suffix: '%', trend: 1 },
      { label: 'Policy Compliance', value: (s) => pct(s.governance.policyCompliance), suffix: '%', trend: 0.6 },
      { label: 'Policy Violations', value: (s) => s.governance.policyViolations, suffix: '', trend: -1 },
      { label: 'Audit Observations', value: (s) => s.governance.auditObservations, suffix: '', trend: -3 },
    ],
    reportHubs: ['compliance', 'audit-center', 'notification-center', 'approval-workflow', 'ai-copilot', 'production-intelligence', 'knowledge-center', 'enterprise-risk'],
    actionScope: { types: ['compliance', 'control', 'evidence'] },
  },
  {
    id: 'risk-officer',
    label: 'Risk Officer',
    initials: 'RO',
    title: 'Enterprise Risk Officer',
    mission: 'Enterprise and AI risk register, mitigation, and concentration.',
    quickLinks: [
      { label: 'Governance Risk', to: '/governance/risk' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'Strategic Risks', to: '/executive/strategic-risks' },
      { label: 'AI Risk', to: '/ai-governance-center/risks' },
      { label: 'Impact Analysis', to: '/traceability/impact' },
    ],
    navHubs: ['executive', 'governance', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Open Risks', value: (s) => s.executive.openRisks, suffix: '', trend: -3 },
      { label: 'VAPT Findings', value: (s) => s.governance.vaptFindings, suffix: '', trend: -2 },
      { label: 'Governance Score', value: (s) => pct(s.governance.governanceScore), suffix: '%', trend: 1.1 },
      { label: 'Business Impact', value: (s) => pct(s.executive.businessImpactScore), suffix: '%', trend: 1.2 },
    ],
    reportHubs: ['risk', 'ai-risk', 'approval-workflow', 'enterprise-risk'],
    actionScope: { types: ['risk', 'control', 'incident'] },
  },
  {
    id: 'enterprise-architect',
    label: 'Enterprise Architect',
    initials: 'EA',
    title: 'Principal Enterprise Architect',
    mission: 'End-to-end SDLC lineage, impact analysis, and architecture coverage.',
    quickLinks: [
      { label: 'Lineage Dashboard', to: '/traceability' },
      { label: 'Notification Center', to: '/operations/notifications' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'Requirement Matrix', to: '/traceability/matrix' },
      { label: 'Impact Analysis', to: '/traceability/impact' },
      { label: 'Architecture Hub', to: '/architecture' },
    ],
    navHubs: ['executive', 'governance', 'ai-sdlc', 'knowledge'],
    metrics: [
      { label: 'Architecture Risks', value: (s) => s.delivery.architectureRisks, suffix: '', trend: -1 },
      { label: 'Requirements Analysed', value: (s) => s.delivery.requirementsAnalysed, suffix: '', trend: 4 },
      { label: 'Code Quality', value: (s) => pct(s.delivery.codeQualityAvg), suffix: '%', trend: 1 },
      { label: 'Test Coverage', value: (s) => pct(s.delivery.testCoverageAvg), suffix: '%', trend: 0.8 },
    ],
    reportHubs: ['traceability', 'approval-workflow', 'notification-center', 'ai-copilot', 'knowledge-center', 'portfolio-governance', 'application-portfolio', 'architecture-repository', 'technology-strategy', 'transformation-pmo', 'enterprise-risk'],
    actionScope: { types: ['architecture', 'api', 'risk', 'control'] },
  },
  {
    id: 'application-owner',
    label: 'Application Owner',
    initials: 'AO',
    title: 'Payments Application Owner',
    mission: 'Health, incidents, and delivery for the Payments application portfolio.',
    quickLinks: [
      { label: 'Production', to: '/production' },
      { label: 'Notification Inbox', to: '/operations/notifications/inbox' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'Release Center', to: '/release' },
    ],
    navHubs: ['operations', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Service Health', value: (s) => pct(s.production.health), suffix: '%', trend: 1 },
      { label: 'Availability', value: (s) => `${s.production.availability}`, suffix: '%', trend: 0.02 },
      { label: 'Open Incidents', value: (s) => s.production.activeIncidents, suffix: '', trend: -5 },
      { label: 'MTTR (min)', value: (s) => s.production.mttrMinutes, suffix: '', trend: -4 },
    ],
    reportHubs: ['production', 'incidents', 'notification-center', 'ai-copilot', 'production-intelligence', 'knowledge-center'],
    actionScope: { types: ['incident', 'release', 'production'], domain: 'Payments' },
  },
  {
    id: 'developer',
    label: 'Developer',
    initials: 'DEV',
    title: 'Senior Engineer',
    mission: 'Code quality, API contracts, and engineering deliverables.',
    quickLinks: [
      { label: 'Development Hub', to: '/development' },
      { label: 'Architecture Hub', to: '/architecture' },
      { label: 'Requirements', to: '/requirements' },
      { label: 'Testing Hub', to: '/testing' },
    ],
    navHubs: ['ai-sdlc', 'knowledge'],
    metrics: [
      { label: 'Code Quality', value: (s) => pct(s.development.codeQuality), suffix: '%', trend: 1 },
      { label: 'Tech Debt', value: (s) => s.development.techDebt, suffix: '', trend: -2 },
      { label: 'Security Findings', value: (s) => s.development.securityFindings, suffix: '', trend: -1 },
      { label: 'Engineering Health', value: (s) => pct(s.development.health), suffix: '%', trend: 1.2 },
    ],
    reportHubs: ['best-practices', 'ai-copilot', 'knowledge-center'],
    actionScope: { types: ['api', 'architecture', 'testCase'] },
  },
  {
    id: 'tester',
    label: 'Tester',
    initials: 'QA',
    title: 'QA Lead',
    mission: 'Test coverage, automation, and release sign-off quality.',
    quickLinks: [
      { label: 'Testing Hub', to: '/testing' },
      { label: 'Requirement Matrix', to: '/traceability/matrix' },
      { label: 'Release Center', to: '/release' },
      { label: 'Development Hub', to: '/development' },
    ],
    navHubs: ['ai-sdlc', 'knowledge'],
    metrics: [
      { label: 'Coverage', value: (s) => `${s.testing.coverage}`, suffix: '%', trend: 0.6 },
      { label: 'Automation', value: (s) => `${s.testing.automation}`, suffix: '%', trend: 1 },
      { label: 'Effectiveness', value: (s) => `${s.testing.effectiveness}`, suffix: '%', trend: 0.8 },
      { label: 'Optimization', value: (s) => pct(s.testing.optimizationProgress), suffix: '%', trend: 2 },
    ],
    reportHubs: ['best-practices', 'ai-copilot', 'knowledge-center'],
    actionScope: { types: ['testCase', 'release'] },
  },
  {
    id: 'release-manager',
    label: 'Release Manager',
    initials: 'RM',
    title: 'Release Manager',
    mission: 'Release readiness, go/no-go decisions, and deployment risk.',
    quickLinks: [
      { label: 'Release Center', to: '/release' },
      { label: 'Approval Workflow', to: '/governance/approval-workflow' },
      { label: 'Production', to: '/production' },
      { label: 'Testing Hub', to: '/testing' },
      { label: 'Impact Analysis', to: '/traceability/impact' },
    ],
    navHubs: ['ai-sdlc', 'operations', 'platform'],
    metrics: [
      { label: 'Release Confidence', value: (s) => pct(s.release.confidence), suffix: '%', trend: 1.8 },
      { label: 'Deployment Readiness', value: (s) => pct(s.release.deploymentReadiness), suffix: '%', trend: 1 },
      { label: 'Rollback Readiness', value: (s) => pct(s.release.rollbackReadiness), suffix: '%', trend: 0.5 },
      { label: 'Go / No-Go', value: (s) => s.release.goNoGo, suffix: '' },
    ],
    reportHubs: ['production', 'incidents', 'approval-workflow', 'ai-copilot', 'production-intelligence', 'knowledge-center'],
    actionScope: { types: ['release', 'testCase', 'incident'] },
  },
  {
    id: 'operations-manager',
    label: 'Operations Manager',
    initials: 'OM',
    title: 'Banking Operations Control',
    mission: 'Operational health, capacity, batch, and incident response.',
    quickLinks: [
      { label: 'Operations', to: '/operations' },
      { label: 'Production', to: '/production' },
      { label: 'Availability', to: '/operations/availability' },
      { label: 'Capacity', to: '/operations/capacity' },
    ],
    navHubs: ['operations', 'executive', 'platform'],
    metrics: [
      { label: 'Operational Health', value: (s) => pct(s.operations.operationalHealth), suffix: '%', trend: 1 },
      { label: 'Capacity Utilization', value: (s) => pct(s.operations.capacityUtilization), suffix: '%', trend: 2 },
      { label: 'Batch Health', value: (s) => pct(s.operations.batchHealth), suffix: '%', trend: 0.5 },
      { label: 'Failed Jobs', value: (s) => s.operations.failedJobs, suffix: '', trend: -1 },
    ],
    reportHubs: ['production', 'availability', 'capacity', 'production-intelligence', 'knowledge-center'],
    actionScope: { types: ['incident', 'production'] },
  },
  {
    id: 'model-owner',
    label: 'Model Owner',
    initials: 'MO',
    title: 'AI Model Owner',
    mission: 'Model inventory, model risk, prompts, and AI control coverage.',
    quickLinks: [
      { label: 'Model Inventory', to: '/ai-governance-center/models' },
      { label: 'AI Risk', to: '/ai-governance-center/risks' },
      { label: 'Prompt Governance', to: '/ai-governance-center/prompts' },
      { label: 'AI Traceability', to: '/traceability/ai' },
    ],
    navHubs: ['governance', 'ai-sdlc', 'platform'],
    metrics: [
      { label: 'Governance Score', value: (s) => pct(s.governance.governanceScore), suffix: '%', trend: 1 },
      { label: 'Open Risks', value: (s) => s.executive.openRisks, suffix: '', trend: -3 },
      { label: 'Security Findings', value: (s) => s.governance.securityFindings, suffix: '', trend: -1 },
      { label: 'Business Impact', value: (s) => pct(s.executive.businessImpactScore), suffix: '%', trend: 1.2 },
    ],
    reportHubs: ['ai-model-inventory', 'ai-risk', 'ai-prompt'],
    actionScope: { types: ['model', 'prompt', 'risk', 'control'] },
  },
];

export const PERSONA_MAP: Record<PersonaId, PersonaConfig> = PERSONAS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<PersonaId, PersonaConfig>,
);

export const DEFAULT_PERSONA: PersonaId = 'cio';
