import type {
  ArchitecturePattern,
  BestPractice,
  BestPracticeDomain,
  KnowledgeTraceabilityChain,
  LearningRecommendation,
  LessonCategory,
  LessonLearned,
  PatternCategory,
  PlaybookType,
  RcaArticleSource,
  RcaKnowledgeArticle,
  ReusableControl,
  SdlcPlaybook,
} from '../types/knowledgeCenter';
import { telemetryScore } from './enterpriseTelemetry';

const DOMAINS = ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'] as const;
const APPS = ['UPI Gateway', 'Payment Switch', 'Fraud Engine', 'Mobile SDK', 'Net Banking Portal', 'Card Processor', 'AML Engine', 'KYC Service'];
const OWNERS = ['Architect', 'QA Lead', 'Release Manager', 'Compliance Officer', 'Application Owner', 'CISO', 'Audit Head'];
const TAGS = ['UPI', 'timeout', 'regression', 'NFR', 'audit', 'release', 'security', 'resilience', 'monitoring', 'compliance'];

const LESSON_CATEGORIES: readonly LessonCategory[] = ['incident', 'audit', 'release', 'defect', 'architecture', 'copilot', 'security'];
const BP_DOMAINS: readonly BestPracticeDomain[] = [
  'requirements', 'architecture', 'development', 'testing', 'release', 'governance', 'audit', 'operations', 'ai-governance',
];
const PATTERN_CATS: readonly PatternCategory[] = [
  'microservices', 'event-driven', 'api-security', 'authentication', 'authorization', 'resilience', 'caching',
  'monitoring', 'observability', 'banking-integration', 'payments', 'upi', 'cards', 'kyc', 'aml',
];
const RCA_SOURCES: readonly RcaArticleSource[] = [
  'production-rca', 'audit-finding', 'control-failure', 'release-failure', 'security-incident',
];
const PLAYBOOK_TYPES: readonly PlaybookType[] = [
  'requirement-review', 'architecture-review', 'secure-coding', 'test-planning', 'release-readiness',
  'audit-readiness', 'production-readiness', 'ai-model-governance',
];
const CONTROL_TYPES = ['preventive', 'detective', 'corrective', 'compensating'] as const;
const FRAMEWORKS = ['RBI', 'PCI-DSS', 'ISO 27001', 'SOC 2', 'DPSC', 'Internal'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
}

export const LESSONS_LEARNED: LessonLearned[] = Array.from({ length: 200 }, (_, i) => {
  const cat = pick(LESSON_CATEGORIES, i);
  return {
    id: `LL-${String(i + 1).padStart(4, '0')}`,
    title: pick([
      'UPI timeout handling during peak load',
      'Mobile SDK regression after biometric change',
      'Audit evidence gap for release gate',
      'Ambiguous NFR caused production defect',
      'Third-party gateway SLA breach pattern',
      'Config drift in payment switch deployment',
    ], i),
    category: cat,
    domain: pick(DOMAINS, i),
    application: pick(APPS, i),
    rootCause: pick([
      'Insufficient regression coverage',
      'Missing circuit breaker on external API',
      'Weak acceptance criteria for NFRs',
      'Release pipeline config not validated',
      'Inadequate soak testing before go-live',
    ], i),
    resolution: pick([
      'Added automated regression pack for payment flows',
      'Implemented circuit breaker and retry with backoff',
      'Clarified Given/When/Then acceptance criteria',
      'Introduced config validation gate in CI/CD',
      'Extended soak test window to 72 hours',
    ], i),
    businessImpact: pick(['High — customer payment failures', 'Medium — support ticket surge', 'Low — isolated branch impact'], i),
    owner: pick(OWNERS, i),
    date: daysAgo(i * 2),
    tags: [pick(TAGS, i), pick(TAGS, i + 3)],
    relatedIncident: i % 3 === 0 ? `PIN-${String((i % 300) + 1).padStart(4, '0')}` : undefined,
    relatedAuditFinding: i % 4 === 0 ? `AF-${String((i % 50) + 1).padStart(3, '0')}` : undefined,
    relatedRelease: `REL-${String((i % 100) + 1).padStart(3, '0')}`,
    relatedRequirement: `BR-${String((i % 4) + 1).padStart(3, '0')}`,
    reuseCount: 1 + (i % 25),
  };
});

export const BEST_PRACTICES: BestPractice[] = Array.from({ length: 150 }, (_, i) => {
  const domain = pick(BP_DOMAINS, i);
  return {
    id: `BP-${String(i + 1).padStart(4, '0')}`,
    title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} — ${pick(['validation', 'review gate', 'automation', 'evidence', 'monitoring'], i)} best practice`,
    domain,
    summary: `Institutional guidance for ${domain} quality in ${pick(DOMAINS, i)} portfolio.`,
    guidance: pick([
      'Define acceptance criteria before architecture sign-off',
      'Use threat modeling for all external API integrations',
      'Maintain 80%+ regression automation for payment flows',
      'Attach audit evidence to every release gate',
      'Run architecture review for cross-domain changes',
    ], i),
    owner: pick(OWNERS, i),
    adoptionRate: telemetryScore(`kc:bp-adopt:${i}`),
    tags: [domain, pick(TAGS, i)],
  };
});

export const ARCHITECTURE_PATTERNS: ArchitecturePattern[] = Array.from({ length: 100 }, (_, i) => {
  const cat = pick(PATTERN_CATS, i);
  return {
    id: `PAT-${String(i + 1).padStart(4, '0')}`,
    name: `${cat.replace('-', ' ')} pattern — ${pick(APPS, i)}`,
    category: cat,
    description: `Enterprise pattern for ${cat} in banking SDLC context.`,
    whenToUse: pick([
      'High-volume payment processing with external gateways',
      'Mobile banking apps with biometric authentication',
      'Cross-domain event propagation for audit trail',
      'Regulatory reporting with strict data residency',
    ], i),
    antiPatterns: pick([
      'Synchronous chaining without timeout controls',
      'Shared database across bounded contexts',
      'Missing idempotency on payment APIs',
    ], i),
    relatedControls: [`CTL-${String((i % 100) + 1).padStart(4, '0')}`, `CTL-${String(((i + 5) % 100) + 1).padStart(4, '0')}`],
    adoptionCount: 3 + (i % 40),
  };
});

export const RCA_KNOWLEDGE_ARTICLES: RcaKnowledgeArticle[] = Array.from({ length: 100 }, (_, i) => {
  const source = pick(RCA_SOURCES, i);
  return {
    id: `RKA-${String(i + 1).padStart(4, '0')}`,
    title: `RCA knowledge — ${source.replace('-', ' ')} ${i + 1}`,
    source,
    rootCause: pick([
      'Missing timeout handling on payment API',
      'Insufficient test coverage for edge cases',
      'Control design gap in approval workflow',
      'Release artifact mismatch in production',
      'Credential rotation not automated',
    ], i),
    correctiveAction: pick([
      'Deploy hotfix with retry logic',
      'Expand regression automation pack',
      'Add compensating control for SOD violation',
      'Rollback and patch release pipeline',
      'Rotate credentials and update vault policy',
    ], i),
    preventiveAction: pick([
      'Add architecture review gate',
      'Strengthen NFR acceptance criteria',
      'Automate control effectiveness testing',
      'Implement blue-green deployment',
      'Schedule quarterly access reviews',
    ], i),
    domain: pick(DOMAINS, i),
    application: pick(APPS, i),
    linkedIncident: source === 'production-rca' ? `PIN-${String((i % 300) + 1).padStart(4, '0')}` : undefined,
    linkedAuditFinding: source === 'audit-finding' ? `AF-${String((i % 50) + 1).padStart(3, '0')}` : undefined,
    tags: [pick(TAGS, i), source],
  };
});

export const SDLC_PLAYBOOKS: SdlcPlaybook[] = Array.from({ length: 75 }, (_, i) => {
  const type = pick(PLAYBOOK_TYPES, i);
  return {
    id: `PB-${String(i + 1).padStart(3, '0')}`,
    title: `${type.replace('-', ' ')} playbook v${1 + (i % 3)}`,
    type,
    description: `Step-by-step institutional playbook for ${type.replace('-', ' ')} in enterprise banking SDLC.`,
    steps: [
      'Initiate review with stakeholder sign-off',
      'Execute checklist against domain standards',
      'Document findings and remediation actions',
      'Link evidence to traceability matrix',
      'Obtain approval gate clearance',
    ],
    owner: pick(OWNERS, i),
    reuseCount: 5 + (i % 35),
    lastUsed: daysAgo(i % 30),
  };
});

export const REUSABLE_CONTROLS: ReusableControl[] = Array.from({ length: 100 }, (_, i) => ({
  id: `CTL-${String(i + 1).padStart(4, '0')}`,
  name: pick([
    'Payment API timeout guard',
    'Release evidence attestation',
    'SOD approval for production config',
    'Biometric auth regression gate',
    'AML transaction monitoring threshold',
    'Audit log immutability check',
  ], i),
  type: pick(CONTROL_TYPES, i),
  domain: pick(DOMAINS, i),
  description: `Reusable ${pick(CONTROL_TYPES, i)} control for ${pick(DOMAINS, i)} domain.`,
  framework: pick(FRAMEWORKS, i),
  reuseCount: 8 + (i % 45),
  effectiveness: telemetryScore(`kc:ctrl-eff:${i}`),
}));

export const LEARNING_RECOMMENDATIONS: LearningRecommendation[] = Array.from({ length: 60 }, (_, i) => {
  const types = ['article', 'control', 'playbook', 'pattern'] as const;
  const type = pick(types, i);
  const sources = [
    'Audit Center', 'Production Intelligence', 'AI Delivery Copilot',
    'Notification Center', 'Workflow Lifecycle', 'Event Bus',
  ];
  return {
    id: `LR-${String(i + 1).padStart(3, '0')}`,
    type,
    title: pick([
      'Review UPI timeout lesson learned',
      'Apply payment API circuit breaker pattern',
      'Execute release readiness playbook',
      'Adopt audit evidence control CTL-0042',
      'Study mobile SDK regression RCA article',
    ], i),
    reason: `Rule-based match from ${pick(sources, i)} signal — recurring theme detected.`,
    source: pick(sources, i),
    targetId: type === 'article' ? pick(RCA_KNOWLEDGE_ARTICLES, i).id
      : type === 'control' ? pick(REUSABLE_CONTROLS, i).id
        : type === 'playbook' ? pick(SDLC_PLAYBOOKS, i).id
          : pick(ARCHITECTURE_PATTERNS, i).id,
    priority: pick(['critical', 'high', 'medium', 'low'] as const, i),
    relatedTheme: pick(['Testing gap', 'Requirement quality', 'Release error', 'Control weakness', 'Security incident'], i),
  };
});

export const KNOWLEDGE_TRACEABILITY_CHAINS: KnowledgeTraceabilityChain[] = Array.from({ length: 25 }, (_, i) => {
  const lesson = LESSONS_LEARNED[i * 8];
  const bp = BEST_PRACTICES[i * 6];
  const pb = SDLC_PLAYBOOKS[i % SDLC_PLAYBOOKS.length];
  return {
    requirement: lesson.relatedRequirement ?? `BR-${String((i % 4) + 1).padStart(3, '0')}`,
    architecture: `ARCH-${String((i % 10) + 1).padStart(3, '0')}`,
    development: `DEV-${String((i % 15) + 1).padStart(3, '0')}`,
    testing: `TC-${String((i % 20) + 1).padStart(3, '0')}`,
    release: lesson.relatedRelease ?? `REL-${String((i % 100) + 1).padStart(3, '0')}`,
    incident: lesson.relatedIncident ?? `PIN-${String((i % 300) + 1).padStart(4, '0')}`,
    rca: `RKA-${String((i % 100) + 1).padStart(4, '0')}`,
    lessonLearned: lesson.id,
    bestPractice: bp.id,
    playbook: pb.id,
  };
});

export const KNOWLEDGE_CENTER_EXEC_SUMMARY =
  'Knowledge & Learning Center catalogs 725 institutional artifacts with 78% knowledge coverage across SDLC domains. ' +
  'Top risk themes: testing gaps, requirement quality, release errors. ' +
  'UPI timeout playbook reused 34 times — highest adoption. 60 learning recommendations generated from Audit, Production, Copilot, and Workflow signals.';
