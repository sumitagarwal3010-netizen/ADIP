import type {
  AiReadinessAssessment,
  ApmBusinessUnit,
  ApmDomain,
  ApmPortfolio,
  ApmTraceabilityChain,
  ApplicationIntegration,
  ApplicationRecord,
  CloudAssessment,
  LifecycleHistoryPoint,
  ModernizationOpportunity,
  TechnicalDebtItem,
  TechnologyRisk,
  TechnologyStack,
} from '../types/applicationPortfolio';

const BU_NAMES = ['Retail Banking', 'Corporate Banking', 'Digital Channels', 'Payments', 'Enterprise Technology'] as const;
const PORTFOLIO_NAMES = [
  'Payments Modernization', 'Mobile Transformation', 'Core Banking Renewal', 'Regulatory Compliance',
  'AI & Analytics', 'Cloud Migration', 'Security Hardening', 'Customer Experience', 'Operations Excellence', 'Data Platform',
];
const DOMAIN_NAMES = [
  'Payments', 'Lending', 'Cards', 'Wealth', 'Trade Finance', 'Treasury', 'Risk & Compliance',
  'Customer Channels', 'Core Banking', 'Data & Analytics', 'Integration', 'Security',
  'Operations', 'HR & Finance', 'Marketing', 'Collections', 'Fraud', 'AML', 'Regulatory Reporting', 'Enterprise Architecture',
];
const APP_PREFIXES = [
  'Core', 'Mobile', 'API', 'Portal', 'Gateway', 'Engine', 'Hub', 'Platform', 'Service', 'Manager',
  'Ledger', 'Settlement', 'Clearing', 'Origination', 'Underwriting', 'Reporting', 'Monitoring', 'Admin',
];
const VENDORS = ['In-house', 'TCS', 'Infosys', 'Oracle', 'IBM', 'Microsoft', 'SAP', 'FIS', 'Temenos', 'Finastra'];
const STACK_NAMES = [
  'Java 8 / Spring', 'Java 17 / Spring Boot', '.NET Framework 4.8', '.NET 8', 'Node.js 18', 'Python 3.11',
  'Angular 15', 'React 18', 'Vue 3', 'Oracle DB 19c', 'PostgreSQL 15', 'MongoDB 6', 'Kafka 3.5',
  'IBM MQ', 'RabbitMQ', 'Kubernetes', 'OpenShift', 'AWS Lambda', 'Azure Functions', 'Mainframe COBOL',
  'Mainframe CICS', 'DB2 z/OS', 'Sybase ASE', 'SQL Server 2019', 'Redis 7', 'Elasticsearch 8',
  'Spark 3.4', 'Hadoop', 'MuleSoft', 'Apigee', 'Kong', 'Istio', 'Terraform', 'Ansible',
  'Jenkins', 'GitLab CI', 'SonarQube', 'Dynatrace', 'Splunk', 'Prometheus', 'Grafana',
  'WebLogic 12', 'WebSphere 9', 'Tomcat 9', 'WildFly', 'PHP 8', 'Ruby on Rails', 'Go 1.21', 'Rust',
  'Flutter', 'Swift/iOS', 'Kotlin/Android',
];
const CRITICALITY = ['tier-1', 'tier-2', 'tier-3', 'tier-4'] as const;
const LIFECYCLE = ['emerging', 'growth', 'mature', 'declining', 'retiring', 'retired'] as const;
const COMPLIANCE = ['compliant', 'partial', 'non-compliant', 'remediation'] as const;
const AUDIT = ['passed', 'findings', 'in-progress', 'not-audited'] as const;
const RISK = ['low', 'medium', 'high', 'critical'] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const APM_BUSINESS_UNITS: ApmBusinessUnit[] = BU_NAMES.map((name, i) => ({
  id: `APM-BU-${String(i + 1).padStart(2, '0')}`,
  name,
  head: pick(['CIO', 'CTO', 'COO', 'CISO', 'Head of Digital'], i),
  applicationCount: 50 + i * 12,
  annualCost: 28_000_000 + i * 14_000_000,
}));

export const APM_PORTFOLIOS: ApmPortfolio[] = Array.from({ length: 10 }, (_, i) => {
  const bu = APM_BUSINESS_UNITS[i % APM_BUSINESS_UNITS.length];
  return {
    id: `APM-PF-${String(i + 1).padStart(3, '0')}`,
    name: PORTFOLIO_NAMES[i],
    businessUnitId: bu.id,
    applicationCount: 25 + i * 3,
    avgHealth: 62 + (i % 30),
  };
});

export const APM_DOMAINS: ApmDomain[] = DOMAIN_NAMES.map((name, i) => ({
  id: `DOM-${String(i + 1).padStart(2, '0')}`,
  name,
  applicationCount: 10 + (i % 8) * 3,
  avgCriticality: 1 + (i % 4),
}));

export const APM_TECH_STACKS: TechnologyStack[] = STACK_NAMES.map((name, i) => ({
  id: `STK-${String(i + 1).padStart(3, '0')}`,
  name,
  category: pick(['runtime', 'database', 'middleware', 'frontend', 'infrastructure', 'legacy'], i),
  obsolescenceRisk: pick(RISK, i + 2),
  applicationCount: 2 + (i % 18),
}));

export const APM_APPLICATIONS: ApplicationRecord[] = Array.from({ length: 300 }, (_, i) => {
  const portfolio = APM_PORTFOLIOS[i % APM_PORTFOLIOS.length];
  const domain = APM_DOMAINS[i % APM_DOMAINS.length];
  const stack = APM_TECH_STACKS[i % APM_TECH_STACKS.length];
  const debt = 15 + (i % 75);
  const cloud = 30 + (i % 65);
  const ai = 25 + (i % 70);
  const risk = 20 + (i % 70);
  return {
    id: `APP-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(APP_PREFIXES, i)} ${domain.name} ${(i % 20) + 1}`,
    businessOwner: pick(['VP Retail', 'Head of Payments', 'CIO Office', 'COO Operations', 'CISO'], i),
    technologyOwner: pick(['Lead Architect', 'Platform Owner', 'Dev Manager', 'SRE Lead', 'App Owner'], i),
    domainId: domain.id,
    portfolioId: portfolio.id,
    businessUnitId: portfolio.businessUnitId,
    criticality: pick(CRITICALITY, i),
    availability: 95 + (i % 5) - (i % 3),
    technologyStackId: stack.id,
    interfaceCount: 1 + (i % 12),
    supportCost: 80_000 + (i % 40) * 12_000,
    annualCost: 200_000 + (i % 50) * 35_000,
    vendor: pick(VENDORS, i),
    lifecycleStage: pick(LIFECYCLE, i),
    technicalDebtScore: debt,
    cloudReadinessScore: cloud,
    aiReadinessScore: ai,
    riskScore: risk,
    complianceStatus: pick(COMPLIANCE, i),
    auditStatus: pick(AUDIT, i),
    productionHealth: 58 + (i % 40),
    linkedProjectId: i % 3 === 0 ? `PRJ-${String((i % 100) + 1).padStart(4, '0')}` : undefined,
    linkedDemandId: i % 4 === 0 ? `DM-${String((i % 200) + 1).padStart(4, '0')}` : undefined,
    linkedWorkflowId: i % 5 === 0 ? `WF-${String((i % 50) + 1).padStart(4, '0')}` : undefined,
    linkedIncidentCount: i % 8,
    valueRealized: 50_000 + (i % 30) * 15_000,
  };
});

export const APM_INTEGRATIONS: ApplicationIntegration[] = Array.from({ length: 100 }, (_, i) => {
  const src = APM_APPLICATIONS[i % APM_APPLICATIONS.length];
  const tgt = APM_APPLICATIONS[(i + 17) % APM_APPLICATIONS.length];
  return {
    id: `INT-${String(i + 1).padStart(4, '0')}`,
    sourceAppId: src.id,
    targetAppId: tgt.id,
    type: pick(['api', 'batch', 'event', 'file'] as const, i),
    criticality: src.criticality,
  };
});

export const APM_TECH_RISKS: TechnologyRisk[] = Array.from({ length: 200 }, (_, i) => {
  const app = APM_APPLICATIONS[i % APM_APPLICATIONS.length];
  return {
    id: `TR-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    title: pick(['EOL runtime', 'Unpatched CVE', 'Single point of failure', 'No DR test', 'Weak auth', 'Data residency gap'], i),
    category: pick(['security', 'availability', 'compliance', 'architecture', 'operations'], i),
    severity: pick(RISK, i + 1),
    status: pick(['open', 'mitigated', 'accepted'] as const, i),
  };
});

export const APM_TECHNICAL_DEBT: TechnicalDebtItem[] = Array.from({ length: 150 }, (_, i) => {
  const app = APM_APPLICATIONS[i % APM_APPLICATIONS.length];
  return {
    id: `TD-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    title: pick(['Legacy framework upgrade', 'Missing test coverage', 'Monolith decomposition', 'API standardization', 'Documentation gap'], i),
    category: pick(['code', 'architecture', 'testing', 'documentation', 'infrastructure'], i),
    score: 20 + (i % 70),
    effortDays: 10 + (i % 90),
    priority: pick(['high', 'medium', 'low'] as const, i),
  };
});

export const APM_MODERNIZATION: ModernizationOpportunity[] = Array.from({ length: 100 }, (_, i) => {
  const app = APM_APPLICATIONS[i % APM_APPLICATIONS.length];
  return {
    id: `MOD-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    title: pick(['Cloud-native refactor', 'API-first redesign', 'Container migration', 'Microservices split', 'Platform consolidation'], i),
    approach: pick(['replatform', 'refactor', 'rehost', 'replace'], i),
    savingsEstimate: 150_000 + (i % 25) * 80_000,
    readinessScore: 40 + (i % 55),
  };
});

export const APM_CLOUD_ASSESSMENTS: CloudAssessment[] = Array.from({ length: 100 }, (_, i) => {
  const app = APM_APPLICATIONS[i % APM_APPLICATIONS.length];
  return {
    id: `CLD-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    readinessScore: app.cloudReadinessScore,
    targetState: pick(['rehost', 'replatform', 'refactor', 'retain', 'retire'] as const, i),
    blockers: [pick(['Mainframe dependency', 'License constraint', 'Data gravity', 'Regulatory hold', 'Skills gap'], i)],
  };
});

export const APM_AI_ASSESSMENTS: AiReadinessAssessment[] = Array.from({ length: 100 }, (_, i) => {
  const app = APM_APPLICATIONS[i % APM_APPLICATIONS.length];
  return {
    id: `AIR-${String(i + 1).padStart(4, '0')}`,
    applicationId: app.id,
    readinessScore: app.aiReadinessScore,
    dataQuality: 50 + (i % 45),
    apiMaturity: 45 + (i % 50),
    governanceScore: 55 + (i % 40),
    useCases: [pick(['Fraud detection', 'Chatbot', 'Document AI', 'Predictive analytics', 'Process automation'], i)],
  };
});

export const APM_LIFECYCLE_HISTORY: LifecycleHistoryPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  applicationCount: 280 + i * 8,
  avgHealth: 62 + i * 5,
  technicalDebt: 58 - i * 4,
  cloudReadiness: 35 + i * 10,
  aiReadiness: 28 + i * 12,
  annualCost: 95_000_000 + i * 12_000_000,
  rationalizationSavings: 2_500_000 + i * 3_200_000,
}));

export const APM_TRACEABILITY_CHAINS: ApmTraceabilityChain[] = [
  { stage: 'Application', entity: 'APP-0042 Mobile Payments Hub', link: 'Demand', outcome: 'DM-0088 UPI 2.0 Enhancement linked' },
  { stage: 'Demand', entity: 'DM-0088', link: 'Project', outcome: 'PRJ-0024 active delivery' },
  { stage: 'Project', entity: 'PRJ-0024', link: 'Workflow', outcome: 'WF-0012 SDLC gates in progress' },
  { stage: 'Workflow', entity: 'WF-0012', link: 'Approval', outcome: 'Architecture + Security approved' },
  { stage: 'Approval', entity: 'APR-4421', link: 'Release', outcome: 'Release candidate v3.2.1' },
  { stage: 'Release', entity: 'REL-8842', link: 'Production', outcome: 'Deployed to prod cluster' },
  { stage: 'Production', entity: 'PI-442', link: 'Incident', outcome: '2 incidents · 0 critical' },
  { stage: 'Incident', entity: 'INC-2284', link: 'Value', outcome: '₹420K value realized' },
  { stage: 'Value', entity: 'VP-088', link: 'Executive', outcome: 'Tracked in Value Realization Center' },
];

export const APPLICATION_PORTFOLIO_EXEC_SUMMARY =
  'Application Portfolio Management Center is the single system of record for 300 banking applications across 20 domains. ' +
  'Application health: 74% · 48 tier-1 critical apps · Technical debt index: 42 · Cloud readiness: 68% · AI readiness: 61%. ' +
  'Annual portfolio cost: ₹143M · Rationalization savings opportunity: ₹14.1M · 38 obsolete technology stacks flagged. ' +
  'AI advisors recommend retiring 12 apps, consolidating 8 duplicate capabilities, and prioritizing 24 modernization candidates.';
