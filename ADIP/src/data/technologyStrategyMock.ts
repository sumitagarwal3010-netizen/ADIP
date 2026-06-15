import type {
  AiPlatform,
  CloudPlatform,
  ModernizationInitiative,
  StrategicPlatform,
  TechInvestment,
  TechnologyRisk,
  TechnologyStandard,
  Technology,
  TechRoadmapPoint,
  TechTraceabilityChain,
  VendorProduct,
} from '../types/technologyStrategy';

const CATEGORIES = ['language', 'framework', 'database', 'middleware', 'integration', 'cloud', 'ai-ml', 'security', 'observability', 'infrastructure'] as const;
const LIFECYCLE = ['emerging', 'approved', 'preferred', 'strategic', 'legacy', 'deprecated', 'end-of-support', 'retired'] as const;
const STANCE = ['invest', 'maintain', 'tolerate', 'eliminate'] as const;
const RISK = ['low', 'medium', 'high', 'critical'] as const;

const TECH_NAMES = [
  'Java 17', 'Java 8', 'Spring Boot 3', 'Spring Boot 2', '.NET 8', '.NET Framework 4.8', 'Node.js 20', 'Python 3.12',
  'Go 1.22', 'Kotlin', 'React 18', 'Angular 17', 'PostgreSQL 16', 'Oracle 19c', 'DB2 z/OS', 'MongoDB 7', 'Redis 7',
  'Cassandra', 'Kafka 3.6', 'IBM MQ', 'RabbitMQ', 'Apigee', 'MuleSoft', 'Kong Gateway', 'Kubernetes', 'OpenShift',
  'WebLogic', 'WebSphere', 'Elasticsearch', 'Snowflake', 'Databricks', 'Terraform', 'Ansible', 'Vault', 'Istio',
  'Prometheus', 'Grafana', 'Splunk', 'Mainframe COBOL', 'TIBCO',
];
const VENDORS = ['Oracle', 'Microsoft', 'IBM', 'AWS', 'Google', 'Red Hat', 'VMware', 'Salesforce', 'SAP', 'Confluent', 'MongoDB Inc', 'HashiCorp', 'Databricks', 'Snowflake'];
const DOMAINS = ['UPI', 'Mobile Banking', 'Net Banking', 'Cards', 'Loans', 'Treasury', 'AML', 'KYC', 'Payments', 'Fraud Management', 'Trade Finance', 'Corporate Banking'];
const CLOUD_NAMES = ['EKS', 'Lambda', 'RDS', 'S3', 'DynamoDB', 'AKS', 'Azure Functions', 'Azure SQL', 'Blob Storage', 'GKE', 'BigQuery', 'Cloud Run'];
const AI_NAMES = ['Azure OpenAI', 'AWS Bedrock', 'Vertex AI', 'Databricks ML', 'MLflow', 'Kubeflow', 'Pinecone', 'Weaviate', 'LangChain', 'Hugging Face', 'SageMaker', 'Vector Search'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const TECHNOLOGIES: Technology[] = Array.from({ length: 200 }, (_, i) => ({
  id: `TECH-${String(i + 1).padStart(4, '0')}`,
  name: `${pick(TECH_NAMES, i)}${i >= TECH_NAMES.length ? ` v${Math.floor(i / TECH_NAMES.length) + 1}` : ''}`,
  category: pick(CATEGORIES, i),
  lifecycle: pick(LIFECYCLE, i),
  stance: pick(STANCE, i),
  adoptionRate: 20 + (i % 78),
  applicationCount: 1 + (i % 40),
  vendor: pick(VENDORS, i),
  riskLevel: pick(RISK, i),
  strategicFit: 30 + (i % 68),
}));

export const STRATEGIC_PLATFORMS: StrategicPlatform[] = Array.from({ length: 50 }, (_, i) => ({
  id: `SPLT-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(['Payments', 'Core Banking', 'Data', 'Integration', 'API', 'Cloud', 'AI', 'Security'], i)} Platform ${(i % 12) + 1}`,
  domain: pick(DOMAINS, i),
  lifecycle: pick(['preferred', 'strategic', 'approved', 'emerging'] as const, i),
  adoptionRate: 35 + (i % 55),
  targetAdoption: 80 + (i % 20),
  applicationsOnboarded: 5 + (i % 45),
  annualInvestment: 5_000_000 + (i % 20) * 2_500_000,
}));

export const VENDOR_PRODUCTS: VendorProduct[] = Array.from({ length: 100 }, (_, i) => ({
  id: `VPRD-${String(i + 1).padStart(4, '0')}`,
  vendor: pick(VENDORS, i),
  product: `${pick(VENDORS, i)} ${pick(['Suite', 'Platform', 'Engine', 'Cloud', 'DB', 'Gateway'], i)} ${(i % 10) + 1}`,
  category: pick(CATEGORIES, i),
  contractValue: 1_000_000 + (i % 30) * 1_500_000,
  renewalYear: `${2026 + (i % 4)}`,
  riskLevel: pick(RISK, i),
  lockInRisk: 20 + (i % 75),
  alternativesAvailable: i % 5,
}));

export const TECH_STANDARDS: TechnologyStandard[] = Array.from({ length: 100 }, (_, i) => ({
  id: `TSTD-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(['API', 'Data', 'Security', 'Cloud', 'Integration', 'AI', 'Observability'], i)} Standard ${(i % 15) + 1}`,
  category: pick(CATEGORIES, i),
  adoptionRate: 45 + (i % 53),
  mandatory: i % 2 === 0,
  complianceRate: 50 + (i % 48),
}));

export const TECH_RISKS: TechnologyRisk[] = Array.from({ length: 150 }, (_, i) => {
  const tech = TECHNOLOGIES[i % TECHNOLOGIES.length];
  return {
    id: `TRSK-${String(i + 1).padStart(4, '0')}`,
    technologyId: tech.id,
    title: pick(['EOL platform in production', 'Single-vendor lock-in', 'Unpatched CVE exposure', 'Critical skills gap', 'Non-compliant version', 'Vendor concentration'], i),
    category: pick(['obsolescence', 'vendor-lockin', 'security', 'skills-gap', 'compliance', 'concentration'] as const, i),
    severity: pick(RISK, i + 1),
    likelihood: 25 + (i % 70),
    mitigationStatus: pick(['open', 'planned', 'in-progress', 'mitigated'] as const, i),
  };
});

export const MODERNIZATION_INITIATIVES: ModernizationInitiative[] = Array.from({ length: 100 }, (_, i) => ({
  id: `MOD-${String(i + 1).padStart(4, '0')}`,
  name: `${pick(['Mainframe Decomposition', 'Cloud Migration', 'API Modernization', 'Database Upgrade', 'Java Upgrade', 'Event-Driven Refactor'], i)} ${(i % 18) + 1}`,
  wave: ((i % 3) + 1) as 1 | 2 | 3,
  fromTechnology: pick(['Java 8', 'Mainframe COBOL', 'Oracle 19c', 'WebLogic', '.NET Framework 4.8', 'IBM MQ'], i),
  toTechnology: pick(['Java 17', 'Spring Boot 3', 'PostgreSQL 16', 'Kubernetes', '.NET 8', 'Kafka 3.6'], i),
  status: pick(['planned', 'in-progress', 'completed', 'at-risk'] as const, i),
  applicationsImpacted: 2 + (i % 25),
  investment: 2_000_000 + (i % 20) * 1_500_000,
  expectedBenefit: 3_000_000 + (i % 20) * 2_000_000,
  targetYear: `${2026 + (i % 4)}`,
}));

export const CLOUD_PLATFORMS: CloudPlatform[] = Array.from({ length: 50 }, (_, i) => ({
  id: `CLD-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(CLOUD_NAMES, i)} ${Math.floor(i / CLOUD_NAMES.length) + 1}`,
  provider: pick(['AWS', 'Azure', 'GCP', 'Private Cloud'] as const, i),
  serviceType: pick(['compute', 'storage', 'database', 'serverless', 'networking', 'analytics'], i),
  adoptionRate: 25 + (i % 70),
  monthlySpend: 50_000 + (i % 40) * 25_000,
  approved: i % 4 !== 0,
}));

export const AI_PLATFORMS: AiPlatform[] = Array.from({ length: 50 }, (_, i) => ({
  id: `AIP-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(AI_NAMES, i)} ${Math.floor(i / AI_NAMES.length) + 1}`,
  category: pick(['llm', 'ml-ops', 'data-platform', 'vector-db', 'agent-framework', 'governance'] as const, i),
  adoptionRate: 18 + (i % 65),
  maturity: 30 + (i % 60),
  approved: i % 3 !== 0,
  useCases: i % 12,
}));

export const TECH_ROADMAP: TechRoadmapPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  technologyHealth: 56 + i * 5,
  standardsAdoption: 58 + i * 6,
  cloudAdoption: 28 + i * 12,
  aiAdoption: 18 + i * 13,
  modernizationProgress: 20 + i * 14,
  technologyDebt: 64 - i * 6,
}));

export const TECH_INVESTMENTS: TechInvestment[] = Array.from({ length: 30 }, (_, i) => ({
  id: `TINV-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(CATEGORIES, i)} investment ${(i % 12) + 1}`,
  category: pick(CATEGORIES, i),
  stance: pick(STANCE, i),
  annualSpend: 3_000_000 + (i % 20) * 2_000_000,
  efficiencyScore: 40 + (i % 58),
  strategicFit: 35 + (i % 63),
}));

export const TECH_TRACEABILITY_CHAINS: TechTraceabilityChain[] = [
  { stage: 'Technology', entity: 'TECH-0001 Java 17 (Strategic)', link: 'Architecture', outcome: 'REF-02 Microservices reference' },
  { stage: 'Architecture', entity: 'REF-02', link: 'Application', outcome: 'ARCH-APP-0042 Payments Hub' },
  { stage: 'Application', entity: 'ARCH-APP-0042', link: 'Demand', outcome: 'DM-0088 UPI 2.0 Enhancement' },
  { stage: 'Demand', entity: 'DM-0088', link: 'Portfolio', outcome: 'Payments Modernization portfolio' },
  { stage: 'Portfolio', entity: 'PG-PF-001', link: 'Project', outcome: 'PRJ-0024 active delivery' },
  { stage: 'Project', entity: 'PRJ-0024', link: 'Release', outcome: 'REL-8842 v3.2.1' },
  { stage: 'Release', entity: 'REL-8842', link: 'Production', outcome: 'Deployed · PI-442' },
  { stage: 'Production', entity: 'PI-442', link: 'Value', outcome: '₹420K value realized · VP-088' },
];

export const TECHNOLOGY_STRATEGY_EXEC_SUMMARY =
  'Technology Strategy & Roadmap establishes the executive planning layer above the Architecture Repository — governing 200 technologies, 50 strategic platforms, 100 vendor products, and a 5-year modernization roadmap. ' +
  'Technology health: 76% · Standards adoption: 71% · Strategic platform adoption: 64% · Cloud adoption: 62% · AI platform adoption: 48%. ' +
  'Technology debt index: 34 · Modernization progress: 58% · Vendor concentration: 38% (Oracle, Microsoft, IBM) · Investment efficiency: 67%. ' +
  '18 technologies flagged for retirement, 22 for modernization across 3 waves. ' +
  'AI advisors recommend consolidating 8 overlapping platforms, exiting 5 high-lock-in vendors, and prioritizing ₹4.2B modernization investment over FY26–FY28.';
