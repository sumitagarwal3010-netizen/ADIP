import type {
  CopilotDomain,
  CopilotProject,
  CopilotRecommendation,
  ImprovementAction,
  RecommendationPriority,
  RecommendationStatus,
  RequirementInsight,
  RiskObservation,
} from '../types/copilot';
import { WORKFLOW_ORCHESTRATION_MOCK } from './workflowOrchestrationMock';

const DOMAINS = ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'];
const STAGES = ['requirements', 'architecture', 'development', 'testing', 'release', 'production'];
const MODULES = ['UPI Gateway', 'Auth Service', 'Payment API', 'Mobile SDK', 'AML Engine', 'KYC Service', 'Card Processor', 'Notification Hub'];
const CATEGORIES = ['Testing', 'Requirements', 'Architecture', 'Controls', 'Monitoring', 'Approval', 'Evidence', 'Automation'];
const ISSUES: RequirementInsight['issue'][] = ['ambiguous', 'missing-ac', 'missing-nfr', 'missing-control', 'frequently-changing'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export const COPILOT_PROJECTS: CopilotProject[] = Array.from({ length: 50 }, (_, i) => {
  const wf = WORKFLOW_ORCHESTRATION_MOCK[i % WORKFLOW_ORCHESTRATION_MOCK.length];
  const health = 55 + (i % 40);
  const deliveryRisk = Math.max(10, 100 - health + (i % 15));
  return {
    id: `PRJ-${String(i + 1).padStart(3, '0')}`,
    name: i < WORKFLOW_ORCHESTRATION_MOCK.length ? wf.title : `${pick(DOMAINS, i)} Initiative ${i + 1}`,
    domain: wf?.domain ?? pick(DOMAINS, i),
    workflowId: wf?.id ?? `WF-${String((i % 6) + 1).padStart(3, '0')}`,
    owner: wf?.owner ?? 'Application Owner',
    stage: pick(STAGES, i),
    healthScore: health,
    deliveryRisk,
    testingRisk: Math.min(95, 30 + (i % 50)),
    auditRisk: Math.min(95, 25 + ((i * 3) % 55)),
    releaseRisk: Math.min(95, 20 + ((i * 5) % 60)),
    executiveSummary: `Project health at ${health}% with elevated ${deliveryRisk > 60 ? 'delivery' : 'testing'} risk in ${pick(DOMAINS, i)}.`,
    deliveryRecommendation: deliveryRisk > 65
      ? 'Defer release gate — strengthen testing and audit evidence before promotion.'
      : 'Proceed with standard lifecycle gates; monitor integration hotspots.',
  };
});

export const COPILOT_RECOMMENDATIONS: CopilotRecommendation[] = Array.from({ length: 100 }, (_, i) => {
  const project = COPILOT_PROJECTS[i % COPILOT_PROJECTS.length];
  const domains: readonly CopilotDomain[] = ['requirements', 'architecture', 'development', 'testing', 'release', 'audit', 'executive', 'improvement'];
  const domain = pick(domains, i);
  const priorities: readonly RecommendationPriority[] = ['critical', 'high', 'medium', 'low'];
  const statuses: readonly RecommendationStatus[] = ['open', 'open', 'open', 'accepted', 'implemented'];
  const actions = [
    'Add UPI timeout regression test case',
    'Clarify acceptance criteria for limit enhancement',
    'Add circuit breaker on payment API',
    'Increase monitoring on auth service',
    'Add architecture review gate',
    'Strengthen audit evidence for release',
    'Automate regression pack for mobile SDK',
    'Add API validation controls',
  ];
  return {
    id: `REC-${String(i + 1).padStart(4, '0')}`,
    projectId: project.id,
    domain,
    category: pick(CATEGORIES, i),
    title: `${pick(CATEGORIES, i)} — ${pick(MODULES, i)} improvement`,
    insight: `Rule-based analysis detected ${pick(['repeated defect pattern', 'test gap', 'control weakness', 'ambiguous requirement'], i)} in ${project.domain}.`,
    suggestedAction: pick(actions, i),
    priority: pick(priorities, i),
    status: pick(statuses, i),
    impact: `${5 + (i % 20)}% quality uplift potential`,
    lifecycleStage: pick(STAGES, i),
    createdAt: hoursAgo(i * 2),
  };
});

export const COPILOT_RISK_OBSERVATIONS: RiskObservation[] = Array.from({ length: 100 }, (_, i) => {
  const project = COPILOT_PROJECTS[i % COPILOT_PROJECTS.length];
  const domains: readonly CopilotDomain[] = ['requirements', 'architecture', 'development', 'testing', 'release', 'audit'];
  return {
    id: `RISK-${String(i + 1).padStart(4, '0')}`,
    projectId: project.id,
    domain: pick(domains, i),
    module: pick(MODULES, i),
    observation: `Repeated ${pick(['timeout failures', 'validation gaps', 'missing retries', 'weak logging', 'SOD violations'], i)} detected in ${pick(MODULES, i)}.`,
    severity: pick(['critical', 'high', 'medium', 'low'] as const, i),
    rootCause: pick(['Insufficient test coverage', 'Ambiguous NFR', 'Missing control', 'Integration coupling', 'Config drift'], i),
    linkedEntity: `REQ-${String((i % 30) + 1).padStart(3, '0')}`,
  };
});

export const COPILOT_IMPROVEMENT_ACTIONS: ImprovementAction[] = Array.from({ length: 75 }, (_, i) => {
  const project = COPILOT_PROJECTS[i % COPILOT_PROJECTS.length];
  const statuses: readonly RecommendationStatus[] = ['open', 'open', 'accepted', 'implemented'];
  const titles = [
    'Add UPI timeout test case',
    'Improve API validation controls',
    'Add architecture review gate',
    'Strengthen audit evidence package',
    'Automate mobile regression pack',
    'Add circuit breaker pattern',
    'Clarify payment limit NFRs',
    'Increase auth monitoring coverage',
  ];
  return {
    id: `IMP-${String(i + 1).padStart(4, '0')}`,
    projectId: project.id,
    title: pick(titles, i),
    description: `Continuous improvement action derived from ${pick(['production incident', 'audit finding', 'escaped defect', 'RCA record'], i)}.`,
    source: pick(['SDLC Learning Center', 'Audit Finding', 'Production Incident', 'Defect Intelligence'], i),
    status: pick(statuses, i),
    predictedQualityGain: 3 + (i % 12),
    predictedRiskReduction: 5 + (i % 18),
    owner: pick(['QA Lead', 'Architect', 'Release Manager', 'Compliance Officer', 'Application Owner'], i),
  };
});

export const COPILOT_REQUIREMENT_INSIGHTS: RequirementInsight[] = Array.from({ length: 40 }, (_, i) => {
  const project = COPILOT_PROJECTS[i % COPILOT_PROJECTS.length];
  const issue = pick(ISSUES, i);
  return {
    id: `RQI-${String(i + 1).padStart(3, '0')}`,
    requirementId: `REQ-${String((i % 30) + 1).padStart(3, '0')}`,
    title: `${project.domain} requirement ${(i % 30) + 1}`,
    issue,
    detail: `Requirement exhibits ${issue.replace('-', ' ')} pattern linked to ${pick(MODULES, i)}.`,
    suggestion: issue === 'missing-ac'
      ? 'Add Given/When/Then acceptance criteria for payment limit scenarios.'
      : issue === 'missing-nfr'
        ? 'Define latency, throughput, and availability NFRs with measurable thresholds.'
        : 'Refine wording and add traceability to architecture component.',
    projectId: project.id,
  };
});

export const COPILOT_EXEC_SUMMARY =
  'AI Delivery Copilot analyzed 50 active projects and generated 100 rule-based recommendations with 18 critical delivery risks. ' +
  'Portfolio delivery health is 78% with predicted 12% quality improvement if open improvement actions are adopted. ' +
  'Top hotspots: UPI Gateway timeouts, missing regression automation, and audit evidence gaps before release gates.';
