import type {
  ComplaintChannel,
  CustomerSignal,
  FeedbackDomain,
  FeedbackRecommendation,
  IncidentSeverity,
  LeakageStage,
  ProductionApplication,
  ProductionDefect,
  ProductionIncident,
  RcaPattern,
  RcaRecord,
  ReleaseEvent,
  TraceabilityChain,
} from '../types/productionIntelligence';

const DOMAINS = ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'] as const;
const APP_NAMES = [
  'UPI Gateway', 'Payment Switch', 'Fraud Engine', 'Mobile SDK', 'Net Banking Portal',
  'Card Processor', 'AML Engine', 'KYC Service', 'Notification Hub', 'Auth Service',
];
const ENVIRONMENTS = ['Production', 'DR', 'UAT'] as const;
const RCA_PATTERNS: readonly RcaPattern[] = [
  'requirement-quality', 'architecture-design', 'coding-defect', 'testing-gap',
  'release-error', 'operational-issue', 'third-party-issue',
];
const LEAKAGE_STAGES: readonly LeakageStage[] = [
  'requirements', 'architecture', 'development', 'testing', 'release', 'production',
];
const FEEDBACK_DOMAINS: readonly FeedbackDomain[] = [
  'requirements', 'architecture', 'development', 'testing', 'release', 'governance', 'audit',
];
const CHANNELS: readonly ComplaintChannel[] = ['call-center', 'branch', 'complaint', 'app-store', 'nps'];
const SEVERITIES: readonly IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];
const COMPLIANCE = ['compliant', 'at-risk', 'non-compliant'] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export const PRODUCTION_APPLICATIONS: ProductionApplication[] = Array.from({ length: 50 }, (_, i) => {
  const name = i < APP_NAMES.length ? APP_NAMES[i] : `${pick(DOMAINS, i)} App ${i + 1}`;
  const incidents = 2 + (i % 12);
  const defects = 1 + (i % 8);
  return {
    id: `APP-${String(i + 1).padStart(3, '0')}`,
    name,
    domain: pick(DOMAINS, i),
    owner: pick(['Application Owner', 'Operations Manager', 'Head of Payments'], i),
    availability: 98.5 + (i % 15) / 10,
    reliability: 95 + (i % 40) / 10,
    performance: 88 + (i % 10),
    incidentCount: incidents,
    defectCount: defects,
    auditFindings: i % 5,
    complianceStatus: pick(COMPLIANCE, i),
    riskScore: Math.min(95, 20 + incidents * 4 + defects * 3 + (i % 20)),
  };
});

export const PRODUCTION_INCIDENTS: ProductionIncident[] = Array.from({ length: 300 }, (_, i) => {
  const app = PRODUCTION_APPLICATIONS[i % PRODUCTION_APPLICATIONS.length];
  const reqId = `BR-${String((i % 4) + 1).padStart(3, '0')}`;
  const relId = `REL-${String((i % 100) + 1).padStart(3, '0')}`;
  const detected = hoursAgo(i * 3 + 1);
  const resolved = i % 4 === 0 ? null : hoursAgo(i * 3);
  const pattern = pick(RCA_PATTERNS, i);
  return {
    id: `PIN-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    application: app.name,
    businessDomain: app.domain,
    severity: pick(SEVERITIES, i),
    environment: pick(ENVIRONMENTS, i),
    detectionTime: detected,
    resolutionTime: resolved,
    rootCause: pick([
      'Missing timeout handling on payment API',
      'Ambiguous NFR for transaction limits',
      'Insufficient regression coverage',
      'Config drift in release pipeline',
      'Third-party gateway latency spike',
      'Operational capacity threshold exceeded',
    ], i),
    rcaPattern: pattern,
    introducedRelease: relId,
    linkedRequirement: reqId,
    linkedTestCycle: `TC-${String((i % 20) + 1).padStart(3, '0')}`,
    linkedApproval: `APR-${String((i % 15) + 1).padStart(3, '0')}`,
    linkedWorkflow: `WF-${String((i % 6) + 1).padStart(3, '0')}`,
    businessImpact: pick(['High — payment delays', 'Medium — degraded UX', 'Low — isolated branch'], i),
    customerImpact: pick(['12K customers affected', '450 complaints logged', 'Minimal — auto-recovered'], i),
    financialImpact: 5000 + (i % 50) * 2500,
    title: pick([
      'UPI timeout during peak window',
      'Mobile login failure spike',
      'Settlement batch delay',
      'Fraud rule false positive surge',
      'Card authorization latency',
    ], i),
    status: i % 5 === 0 ? 'open' : i % 3 === 0 ? 'mitigated' : 'resolved',
  };
});

export const PRODUCTION_DEFECTS: ProductionDefect[] = Array.from({ length: 200 }, (_, i) => {
  const app = PRODUCTION_APPLICATIONS[i % PRODUCTION_APPLICATIONS.length];
  return {
    id: `DEF-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    application: app.name,
    title: `Defect in ${app.name} — ${pick(['validation', 'integration', 'performance', 'security'], i)} gap`,
    leakageStage: pick(LEAKAGE_STAGES, i),
    severity: pick(SEVERITIES, i),
    introducedRelease: `REL-${String((i % 100) + 1).padStart(3, '0')}`,
    linkedRequirement: `BR-${String((i % 4) + 1).padStart(3, '0')}`,
    escapedToProduction: i % 3 !== 0,
    detectedAt: hoursAgo(i * 4),
  };
});

export const CUSTOMER_SIGNALS: CustomerSignal[] = Array.from({ length: 150 }, (_, i) => {
  const app = PRODUCTION_APPLICATIONS[i % PRODUCTION_APPLICATIONS.length];
  const channel = pick(CHANNELS, i);
  const sentiment = pick(['negative', 'neutral', 'positive'] as const, i);
  return {
    id: `CSG-${String(i + 1).padStart(4, '0')}`,
    channel,
    applicationId: app.id,
    application: app.name,
    summary: pick([
      'Payment failed during checkout',
      'App crashes on biometric login',
      'Slow fund transfer confirmation',
      'Incorrect balance displayed',
      'Branch staff reported system slowness',
    ], i),
    sentiment,
    rating: channel === 'app-store' ? 2 + (i % 4) : undefined,
    npsScore: channel === 'nps' ? 20 + (i % 60) : undefined,
    reportedAt: hoursAgo(i * 6),
    painPoint: pick(['Reliability', 'Performance', 'Usability', 'Trust', 'Support response'], i),
  };
});

export const RELEASE_EVENTS: ReleaseEvent[] = Array.from({ length: 100 }, (_, i) => {
  const app = PRODUCTION_APPLICATIONS[i % PRODUCTION_APPLICATIONS.length];
  const success = 70 + (i % 28);
  const rollback = i % 8 === 0 ? 15 + (i % 20) : i % 5;
  return {
    id: `REL-${String(i + 1).padStart(3, '0')}`,
    name: `${app.name} Release ${24 + (i % 6)}.${i % 10}`,
    applicationId: app.id,
    application: app.name,
    deployedAt: hoursAgo(i * 24),
    successRate: success,
    rollbackRate: rollback,
    incidentCreationRate: Math.min(40, 5 + (i % 15)),
    defectLeakageRate: Math.min(35, 3 + (i % 12)),
    customerImpact: Math.min(90, 10 + (i % 30)),
    businessImpact: Math.min(85, 8 + (i % 25)),
    goNoGo: success >= 85 ? 'Go' : success >= 70 ? 'Conditional Go' : 'No-Go',
  };
});

export const RCA_RECORDS: RcaRecord[] = Array.from({ length: 100 }, (_, i) => {
  const incident = PRODUCTION_INCIDENTS[i % PRODUCTION_INCIDENTS.length];
  const pattern = pick(RCA_PATTERNS, i);
  return {
    id: `RCA-${String(i + 1).padStart(4, '0')}`,
    incidentId: incident.id,
    pattern,
    summary: `RCA for ${incident.title}`,
    rootCause: incident.rootCause,
    correctiveAction: pick([
      'Deploy hotfix with timeout retry logic',
      'Add monitoring alert on error rate threshold',
      'Expand regression pack for payment flows',
      'Rollback release and patch config',
    ], i),
    preventiveAction: pick([
      'Add architecture review gate for integration changes',
      'Strengthen NFR acceptance criteria',
      'Automate soak test before production promotion',
      'Implement circuit breaker on external APIs',
    ], i),
    linkedRequirement: incident.linkedRequirement,
    linkedRelease: incident.introducedRelease,
    createdAt: hoursAgo(i * 8),
  };
});

export const FEEDBACK_RECOMMENDATIONS: FeedbackRecommendation[] = Array.from({ length: 100 }, (_, i) => {
  const app = PRODUCTION_APPLICATIONS[i % PRODUCTION_APPLICATIONS.length];
  const incident = PRODUCTION_INCIDENTS[i % PRODUCTION_INCIDENTS.length];
  const domain = pick(FEEDBACK_DOMAINS, i);
  return {
    id: `FBR-${String(i + 1).padStart(4, '0')}`,
    domain,
    applicationId: app.id,
    application: app.name,
    title: `${domain} improvement — ${app.name}`,
    insight: `Production feedback loop identified ${pick(['recurring incident pattern', 'customer pain point', 'defect escape', 'release regression'], i)} linked to ${incident.linkedRequirement}.`,
    suggestedAction: pick([
      'Clarify acceptance criteria for payment timeout scenarios',
      'Add circuit breaker on UPI gateway integration',
      'Expand mobile regression automation pack',
      'Strengthen release evidence package before go-live',
      'Add audit control for config change approvals',
    ], i),
    priority: pick(SEVERITIES, i),
    source: 'Production Intelligence Center',
    linkedIncidentId: incident.id,
    linkedRequirement: incident.linkedRequirement,
    predictedImpact: `${5 + (i % 15)}% incident reduction potential`,
  };
});

export const TRACEABILITY_CHAINS: TraceabilityChain[] = Array.from({ length: 30 }, (_, i) => {
  const incident = PRODUCTION_INCIDENTS[i * 10];
  const rca = RCA_RECORDS[i % RCA_RECORDS.length];
  const rec = FEEDBACK_RECOMMENDATIONS[i % FEEDBACK_RECOMMENDATIONS.length];
  return {
    requirement: incident.linkedRequirement,
    architecture: `ARCH-${String((i % 10) + 1).padStart(3, '0')}`,
    development: `DEV-${String((i % 15) + 1).padStart(3, '0')}`,
    testing: incident.linkedTestCycle,
    release: incident.introducedRelease,
    incident: incident.id,
    rca: rca.id,
    recommendation: rec.id,
  };
});

export const PRODUCTION_INTEL_EXEC_SUMMARY =
  'Production Intelligence Center detected 42 open incidents across 50 applications with elevated defect leakage in Payments. ' +
  'Top root causes: testing gaps (28%), requirement quality (22%), release errors (18%). ' +
  '100 feedback recommendations generated for AI Delivery Copilot — prioritize UPI Gateway timeout remediation and mobile regression automation.';
