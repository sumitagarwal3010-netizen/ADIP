import type {
  ArchitectureApi,
  ArchitectureApplication,
  ArchitectureDatabase,
  ArchitectureDebtItem,
  ArchitectureDecision,
  ArchitectureException,
  ArchitectureFinding,
  ArchitectureHistoryPoint,
  ArchitectureIntegration,
  ArchitecturePrinciple,
  ArchitectureReview,
  ArchitectureStandard,
  ArchitectureTraceabilityChain,
  BusinessCapability,
  CloudService,
  ReferenceArchitecture,
  TechnologyPlatform,
} from '../types/architectureRepository';

const DOMAINS = ['business', 'application', 'data', 'integration', 'technology', 'security', 'cloud', 'infrastructure', 'ai', 'reference'] as const;
const CAPABILITY_AREAS = [
  'UPI', 'Mobile Banking', 'Net Banking', 'Cards', 'Loans', 'Treasury', 'AML', 'KYC',
  'Payments', 'Fraud Management', 'Trade Finance', 'Corporate Banking',
];
const CAPABILITY_NAMES = [
  'Customer Onboarding', 'Payment Processing', 'Real-Time Settlement', 'Credit Decisioning',
  'Fraud Detection', 'Regulatory Reporting', 'Account Management', 'Transaction Monitoring',
  'Loan Origination', 'Collateral Management', 'Liquidity Management', 'Sanctions Screening',
  'Identity Verification', 'Dispute Management', 'Card Issuance', 'Statement Generation',
  'Limit Management', 'Interest Calculation', 'Reconciliation', 'Customer Servicing',
];
const TECH_PLATFORMS = [
  'Java 8 / Spring', 'Java 17 / Spring Boot', '.NET Framework 4.8', '.NET 8', 'Mainframe COBOL',
  'Oracle DB 19c', 'PostgreSQL 15', 'Kafka 3.5', 'IBM MQ', 'Kubernetes', 'OpenShift',
  'WebLogic 12', 'WebSphere 9', 'DB2 z/OS', 'MongoDB 6', 'Redis 7', 'Elasticsearch 8',
  'Apigee', 'MuleSoft', 'Kong',
];
const CLOUD_SERVICES = [
  'AWS Lambda', 'AWS EKS', 'AWS RDS', 'AWS S3', 'Azure Functions', 'Azure AKS', 'Azure SQL',
  'Azure Blob', 'GCP GKE', 'GCP BigQuery', 'Private Cloud VMware', 'AWS DynamoDB',
];
const STD_CATEGORIES = ['API Design', 'Data Modeling', 'Security Controls', 'Cloud Native', 'Integration Patterns', 'AI Governance', 'Observability'];

const LIFECYCLE = ['current', 'target', 'deprecated', 'retiring', 'end-of-support', 'end-of-life'] as const;
const COMPLIANCE = ['compliant', 'partial', 'non-compliant', 'exception'] as const;
const RISK = ['low', 'medium', 'high', 'critical'] as const;
const REVIEW_STATUS = ['queued', 'in-review', 'approved', 'rejected', 'conditional'] as const;
const FINDING_STATUS = ['open', 'in-remediation', 'accepted', 'closed'] as const;
const EXCEPTION_STATUS = ['requested', 'approved', 'waiver', 'risk-accepted', 'expired'] as const;
const DEBT_CATEGORY = ['obsolescence', 'unsupported-platform', 'violation', 'risk', 'modernization'] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const ARCH_CAPABILITIES: BusinessCapability[] = Array.from({ length: 100 }, (_, i) => ({
  id: `CAP-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(CAPABILITY_AREAS, i)} — ${pick(CAPABILITY_NAMES, i)}`,
  domainArea: pick(CAPABILITY_AREAS, i),
  maturity: 45 + (i % 50),
  applicationCount: 2 + (i % 8),
  criticality: pick(RISK, i),
  architectureHealth: 55 + (i % 42),
}));

export const ARCH_APPLICATIONS: ArchitectureApplication[] = Array.from({ length: 300 }, (_, i) => {
  const cap = ARCH_CAPABILITIES[i % ARCH_CAPABILITIES.length];
  return {
    id: `ARCH-APP-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(CAPABILITY_AREAS, i)} ${pick(['Core', 'Gateway', 'Engine', 'Hub', 'Service', 'Platform', 'Manager', 'Processor'], i)} ${(i % 25) + 1}`,
    capabilityId: cap.id,
    domain: pick(DOMAINS, i),
    complianceState: pick(COMPLIANCE, i),
    lifecycle: pick(LIFECYCLE, i),
    cloudReadiness: 30 + (i % 65),
    aiReadiness: 25 + (i % 70),
    architectureRisk: 20 + (i % 70),
    standardsAdherence: 50 + (i % 48),
  };
});

export const ARCH_INTEGRATIONS: ArchitectureIntegration[] = Array.from({ length: 200 }, (_, i) => {
  const src = ARCH_APPLICATIONS[i % ARCH_APPLICATIONS.length];
  const tgt = ARCH_APPLICATIONS[(i + 23) % ARCH_APPLICATIONS.length];
  return {
    id: `ARCH-INT-${String(i + 1).padStart(4, '0')}`,
    name: `${src.name} → ${tgt.name}`,
    sourceAppId: src.id,
    targetAppId: tgt.id,
    pattern: pick(['api', 'event', 'batch', 'file', 'streaming'] as const, i),
    complianceState: pick(COMPLIANCE, i),
    riskLevel: pick(RISK, i + 1),
  };
});

export const ARCH_APIS: ArchitectureApi[] = Array.from({ length: 100 }, (_, i) => {
  const app = ARCH_APPLICATIONS[i % ARCH_APPLICATIONS.length];
  return {
    id: `API-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(CAPABILITY_AREAS, i)} API ${(i % 20) + 1}`,
    applicationId: app.id,
    style: pick(['rest', 'graphql', 'soap', 'grpc', 'event'] as const, i),
    standardsCompliant: i % 3 !== 0,
    version: `v${(i % 4) + 1}.${i % 10}`,
  };
});

export const ARCH_DATABASES: ArchitectureDatabase[] = Array.from({ length: 100 }, (_, i) => {
  const app = ARCH_APPLICATIONS[i % ARCH_APPLICATIONS.length];
  return {
    id: `DB-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(CAPABILITY_AREAS, i)} DB ${(i % 20) + 1}`,
    applicationId: app.id,
    engine: pick(['Oracle 19c', 'PostgreSQL 15', 'DB2 z/OS', 'MongoDB 6', 'SQL Server 2019', 'Sybase ASE'], i),
    lifecycle: pick(LIFECYCLE, i),
    classification: pick(['public', 'internal', 'confidential', 'restricted'] as const, i),
  };
});

export const ARCH_PLATFORMS: TechnologyPlatform[] = TECH_PLATFORMS.map((name, i) => ({
  id: `PLT-${String(i + 1).padStart(3, '0')}`,
  name,
  category: pick(['runtime', 'database', 'middleware', 'container', 'integration', 'legacy'], i),
  lifecycle: pick(LIFECYCLE, i),
  applicationCount: 3 + (i % 22),
  obsolescenceRisk: pick(RISK, i + 2),
}));

export const ARCH_CLOUD_SERVICES: CloudService[] = Array.from({ length: 50 }, (_, i) => ({
  id: `CLDS-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(CLOUD_SERVICES, i)} ${Math.floor(i / CLOUD_SERVICES.length) + 1}`,
  provider: pick(['AWS', 'Azure', 'GCP', 'Private Cloud'] as const, i),
  category: pick(['compute', 'storage', 'database', 'serverless', 'networking', 'analytics'], i),
  adoptionLevel: 30 + (i % 65),
  approved: i % 4 !== 0,
}));

export const ARCH_STANDARDS: ArchitectureStandard[] = Array.from({ length: 100 }, (_, i) => ({
  id: `STD-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(STD_CATEGORIES, i)} Standard ${(i % 15) + 1}`,
  domain: pick(DOMAINS, i),
  category: pick(STD_CATEGORIES, i),
  adoptionRate: 50 + (i % 48),
  mandatory: i % 2 === 0,
}));

export const ARCH_PRINCIPLES: ArchitecturePrinciple[] = [
  { id: 'PRIN-01', name: 'API-First', domain: 'integration', statement: 'All capabilities exposed through standardized, versioned APIs.', adherence: 78 },
  { id: 'PRIN-02', name: 'Cloud-Native by Default', domain: 'cloud', statement: 'New workloads are designed for cloud elasticity and resilience.', adherence: 64 },
  { id: 'PRIN-03', name: 'Secure by Design', domain: 'security', statement: 'Security controls embedded from design through production.', adherence: 82 },
  { id: 'PRIN-04', name: 'Data as an Asset', domain: 'data', statement: 'Data is governed, classified, and reused across the bank.', adherence: 71 },
  { id: 'PRIN-05', name: 'Buy over Build', domain: 'application', statement: 'Prefer proven platforms over bespoke development.', adherence: 68 },
  { id: 'PRIN-06', name: 'Event-Driven Integration', domain: 'integration', statement: 'Loose coupling through events for real-time banking.', adherence: 59 },
  { id: 'PRIN-07', name: 'Reusable Reference Architectures', domain: 'reference', statement: 'Solutions align to approved reference architectures.', adherence: 66 },
  { id: 'PRIN-08', name: 'Responsible AI', domain: 'ai', statement: 'AI solutions are explainable, governed, and auditable.', adherence: 61 },
];

export const ARCH_REFERENCE_ARCHITECTURES: ReferenceArchitecture[] = [
  { id: 'REF-01', name: 'Real-Time Payments Reference', domain: 'integration', adoptionRate: 72, applicationsAligned: 28 },
  { id: 'REF-02', name: 'Cloud-Native Microservices', domain: 'cloud', adoptionRate: 61, applicationsAligned: 44 },
  { id: 'REF-03', name: 'Secure API Gateway Pattern', domain: 'security', adoptionRate: 80, applicationsAligned: 52 },
  { id: 'REF-04', name: 'Data Lakehouse Reference', domain: 'data', adoptionRate: 55, applicationsAligned: 19 },
  { id: 'REF-05', name: 'AML/Fraud Streaming Reference', domain: 'ai', adoptionRate: 48, applicationsAligned: 14 },
  { id: 'REF-06', name: 'Mobile Banking BFF Pattern', domain: 'application', adoptionRate: 69, applicationsAligned: 33 },
  { id: 'REF-07', name: 'Zero-Trust Network Reference', domain: 'infrastructure', adoptionRate: 57, applicationsAligned: 22 },
  { id: 'REF-08', name: 'GenAI Assistant Reference', domain: 'ai', adoptionRate: 41, applicationsAligned: 9 },
];

export const ARCH_REVIEWS: ArchitectureReview[] = Array.from({ length: 100 }, (_, i) => {
  const app = ARCH_APPLICATIONS[i % ARCH_APPLICATIONS.length];
  return {
    id: `REV-${String(i + 1).padStart(4, '0')}`,
    title: `${app.name} — ${pick(['Solution Review', 'Cloud Migration Review', 'Security Review', 'Integration Review', 'AI Design Review'], i)}`,
    applicationId: app.id,
    domain: app.domain,
    status: pick(REVIEW_STATUS, i),
    submittedBy: pick(['Solution Architect', 'App Owner', 'Domain Architect', 'Platform Lead'], i),
    reviewer: pick(['Chief Architect', 'Security Architect', 'Cloud Architect', 'Data Architect'], i),
    complianceScore: 50 + (i % 48),
    submittedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  };
});

export const ARCH_FINDINGS: ArchitectureFinding[] = Array.from({ length: 100 }, (_, i) => {
  const review = ARCH_REVIEWS[i % ARCH_REVIEWS.length];
  return {
    id: `FND-${String(i + 1).padStart(4, '0')}`,
    reviewId: review.id,
    applicationId: review.applicationId,
    title: pick(['Non-standard API contract', 'Unencrypted data at rest', 'Tight coupling detected', 'EOL runtime in use', 'Missing observability', 'No DR pattern'], i),
    domain: review.domain,
    severity: pick(RISK, i + 1),
    status: pick(FINDING_STATUS, i),
  };
});

export const ARCH_EXCEPTIONS: ArchitectureException[] = Array.from({ length: 100 }, (_, i) => {
  const app = ARCH_APPLICATIONS[i % ARCH_APPLICATIONS.length];
  const std = ARCH_STANDARDS[i % ARCH_STANDARDS.length];
  return {
    id: `EXC-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    standardId: std.id,
    title: `Exception: ${std.name}`,
    status: pick(EXCEPTION_STATUS, i),
    riskLevel: pick(RISK, i),
    expiresAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    approver: pick(['Chief Architect', 'CISO', 'Risk Officer', 'ARB'], i),
  };
});

export const ARCH_DECISIONS: ArchitectureDecision[] = Array.from({ length: 40 }, (_, i) => ({
  id: `ADR-${String(i + 1).padStart(4, '0')}`,
  title: `${pick(['Adopt', 'Deprecate', 'Standardize', 'Consolidate'], i)} ${pick(TECH_PLATFORMS, i)}`,
  domain: pick(DOMAINS, i),
  decision: pick(['Approved for new builds', 'Sunset by FY26', 'Mandatory for payments', 'Consolidate to single platform'], i),
  rationale: pick(['Reduce obsolescence risk', 'Improve cloud readiness', 'Align to reference architecture', 'Lower total cost of ownership'], i),
  status: pick(['proposed', 'accepted', 'superseded'] as const, i),
  decidedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

export const ARCH_DEBT_ITEMS: ArchitectureDebtItem[] = Array.from({ length: 150 }, (_, i) => {
  const app = ARCH_APPLICATIONS[i % ARCH_APPLICATIONS.length];
  return {
    id: `ADEBT-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    title: pick(['Mainframe dependency', 'Unsupported framework', 'Architecture violation', 'Point-to-point integration', 'Monolith decomposition needed', 'Manual deployment'], i),
    category: pick(DEBT_CATEGORY, i),
    domain: app.domain,
    severity: pick(RISK, i + 1),
    effortDays: 10 + (i % 90),
    remediationStatus: pick(['identified', 'planned', 'in-progress', 'resolved'] as const, i),
  };
});

export const ARCH_HISTORY: ArchitectureHistoryPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  architectureHealth: 58 + i * 5,
  standardsCompliance: 60 + i * 6,
  architectureDebt: 62 - i * 5,
  cloudReadiness: 32 + i * 11,
  aiReadiness: 24 + i * 12,
  referenceAdoption: 38 + i * 8,
}));

export const ARCH_TRACEABILITY_CHAINS: ArchitectureTraceabilityChain[] = [
  { stage: 'Business Capability', entity: 'CAP-009 UPI Payment Processing', link: 'Demand', outcome: 'DM-0088 UPI 2.0 Enhancement' },
  { stage: 'Demand', entity: 'DM-0088', link: 'Portfolio', outcome: 'Payments Modernization portfolio' },
  { stage: 'Portfolio', entity: 'PG-PF-001', link: 'Program', outcome: 'PGM-001 Real-Time Payments' },
  { stage: 'Program', entity: 'PGM-001', link: 'Project', outcome: 'PRJ-0024 active delivery' },
  { stage: 'Project', entity: 'PRJ-0024', link: 'Architecture', outcome: 'REV-0012 approved · aligns REF-01' },
  { stage: 'Architecture', entity: 'REF-01 Real-Time Payments', link: 'Application', outcome: 'ARCH-APP-0042 Payments Hub' },
  { stage: 'Application', entity: 'ARCH-APP-0042', link: 'Release', outcome: 'REL-8842 v3.2.1' },
  { stage: 'Release', entity: 'REL-8842', link: 'Production', outcome: 'Deployed · PI-442' },
  { stage: 'Production', entity: 'PI-442', link: 'Incident', outcome: '2 incidents · 0 critical' },
  { stage: 'Incident', entity: 'INC-2284', link: 'Value', outcome: '₹420K value realized · VP-088' },
];

export const ARCHITECTURE_REPOSITORY_EXEC_SUMMARY =
  'Enterprise Architecture Repository is the authoritative system of record across 100 business capabilities, 300 applications, 200 integrations, and 50 technology platforms. ' +
  'Architecture health: 78% · Standards compliance: 72% · Architecture debt index: 38 · Reference architecture adoption: 62%. ' +
  'Cloud readiness: 66% · AI readiness: 60% · 18 platforms flagged end-of-support/end-of-life. ' +
  'Architecture Review Board has 24 reviews in queue, 31 open findings, and 14 active exceptions. ' +
  'AI advisors recommend modernizing 22 platforms, retiring 9 non-compliant integrations, and aligning 28 applications to approved reference architectures.';
