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
import {
  generateRealisticSeries,
  telemetryInRange,
  telemetryScore,
} from './enterpriseTelemetry';

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

/** Provider-level cloud adoption anchors (enterprise multi-cloud reality). */
const CLOUD_PROVIDER_ADOPTION: Record<string, number> = {
  AWS: 89,
  Azure: 66,
  GCP: 48,
  'Private Cloud': 81,
};

/** Category-level standards adoption anchors. */
const STANDARDS_CATEGORY_ADOPTION: Record<string, number> = {
  security: 93,
  infrastructure: 84,
  cloud: 72,
  language: 61,
  observability: 49,
  'ai-ml': 88,
  database: 68,
  integration: 74,
  framework: 71,
  middleware: 57,
};

export const TECHNOLOGIES: Technology[] = Array.from({ length: 200 }, (_, i) => ({
  id: `TECH-${String(i + 1).padStart(4, '0')}`,
  name: `${pick(TECH_NAMES, i)}${i >= TECH_NAMES.length ? ` v${Math.floor(i / TECH_NAMES.length) + 1}` : ''}`,
  category: pick(CATEGORIES, i),
  lifecycle: pick(LIFECYCLE, i),
  stance: pick(STANCE, i),
  adoptionRate: telemetryScore(`tech:adopt:${i}`),
  applicationCount: 1 + (i % 40),
  vendor: pick(VENDORS, i),
  riskLevel: pick(RISK, i),
  strategicFit: telemetryInRange(`tech:fit:${i}`, 22, 96),
}));

export const STRATEGIC_PLATFORMS: StrategicPlatform[] = Array.from({ length: 50 }, (_, i) => ({
  id: `SPLT-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(['Payments', 'Core Banking', 'Data', 'Integration', 'API', 'Cloud', 'AI', 'Security'], i)} Platform ${(i % 12) + 1}`,
  domain: pick(DOMAINS, i),
  lifecycle: pick(['preferred', 'strategic', 'approved', 'emerging'] as const, i),
  adoptionRate: telemetryScore(`splt:adopt:${i}`),
  targetAdoption: telemetryInRange(`splt:target:${i}`, 72, 98),
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
  lockInRisk: telemetryInRange(`vendor:lock:${i}`, 18, 94),
  alternativesAvailable: i % 5,
}));

export const TECH_STANDARDS: TechnologyStandard[] = Array.from({ length: 100 }, (_, i) => {
  const category = pick(CATEGORIES, i);
  const anchor = STANDARDS_CATEGORY_ADOPTION[category] ?? 65;
  const jitter = telemetryInRange(`tstd:j:${i}`, -18, 14);
  return {
    id: `TSTD-${String(i + 1).padStart(3, '0')}`,
    name: `${pick(['API', 'Data', 'Security', 'Cloud', 'Integration', 'AI', 'Observability'], i)} Standard ${(i % 15) + 1}`,
    category,
    adoptionRate: Math.max(12, Math.min(98, anchor + jitter)),
    mandatory: i % 2 === 0,
    complianceRate: telemetryScore(`tstd:comp:${i}`),
  };
});

export const TECH_RISKS: TechnologyRisk[] = Array.from({ length: 150 }, (_, i) => {
  const tech = TECHNOLOGIES[i % TECHNOLOGIES.length];
  return {
    id: `TRSK-${String(i + 1).padStart(4, '0')}`,
    technologyId: tech.id,
    title: pick(['EOL platform in production', 'Single-vendor lock-in', 'Unpatched CVE exposure', 'Critical skills gap', 'Non-compliant version', 'Vendor concentration'], i),
    category: pick(['obsolescence', 'vendor-lockin', 'security', 'skills-gap', 'compliance', 'concentration'] as const, i),
    severity: pick(RISK, i + 1),
    likelihood: telemetryInRange(`trsk:like:${i}`, 18, 94),
    mitigationStatus: pick(['open', 'planned', 'in-progress', 'mitigated'] as const, i),
  };
});

/** Wave mix skewed: Wave 1 heavy, Wave 3 thin — not equal thirds. */
const MOD_WAVE: Array<1 | 2 | 3> = Array.from({ length: 100 }, (_, i) => {
  const roll = telemetryScore(`mod:wave:${i}`);
  if (roll >= 72) return 1;
  if (roll >= 42) return 2;
  return 3;
});

export const MODERNIZATION_INITIATIVES: ModernizationInitiative[] = Array.from({ length: 100 }, (_, i) => ({
  id: `MOD-${String(i + 1).padStart(4, '0')}`,
  name: `${pick(['Mainframe Decomposition', 'Cloud Migration', 'API Modernization', 'Database Upgrade', 'Java Upgrade', 'Event-Driven Refactor'], i)} ${(i % 18) + 1}`,
  wave: MOD_WAVE[i],
  fromTechnology: pick(['Java 8', 'Mainframe COBOL', 'Oracle 19c', 'WebLogic', '.NET Framework 4.8', 'IBM MQ'], i),
  toTechnology: pick(['Java 17', 'Spring Boot 3', 'PostgreSQL 16', 'Kubernetes', '.NET 8', 'Kafka 3.6'], i),
  status: pick(['planned', 'in-progress', 'completed', 'at-risk'] as const, i),
  applicationsImpacted: 2 + (i % 25),
  investment: 2_000_000 + (i % 20) * 1_500_000,
  expectedBenefit: 3_000_000 + (i % 20) * 2_000_000,
  targetYear: `${2026 + (i % 4)}`,
}));

export const CLOUD_PLATFORMS: CloudPlatform[] = Array.from({ length: 50 }, (_, i) => {
  const provider = pick(['AWS', 'Azure', 'GCP', 'Private Cloud'] as const, i);
  const anchor = CLOUD_PROVIDER_ADOPTION[provider];
  const jitter = telemetryInRange(`cld:j:${i}`, -16, 11);
  return {
    id: `CLD-${String(i + 1).padStart(3, '0')}`,
    name: `${pick(CLOUD_NAMES, i)} ${Math.floor(i / CLOUD_NAMES.length) + 1}`,
    provider,
    serviceType: pick(['compute', 'storage', 'database', 'serverless', 'networking', 'analytics'], i),
    adoptionRate: Math.max(14, Math.min(97, anchor + jitter)),
    monthlySpend: 50_000 + (i % 40) * 25_000,
    approved: i % 4 !== 0,
  };
});

export const AI_PLATFORMS: AiPlatform[] = Array.from({ length: 50 }, (_, i) => ({
  id: `AIP-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(AI_NAMES, i)} ${Math.floor(i / AI_NAMES.length) + 1}`,
  category: pick(['llm', 'ml-ops', 'data-platform', 'vector-db', 'agent-framework', 'governance'] as const, i),
  adoptionRate: telemetryScore(`aip:adopt:${i}`),
  maturity: telemetryScore(`aip:mat:${i}`),
  approved: i % 3 !== 0,
  useCases: i % 12,
}));

const healthSeries = generateRealisticSeries(5, 'tech-roadmap-health');
const standardsSeries = [38, 52, 49, 77, 84];
const cloudSeries = generateRealisticSeries(5, 'tech-roadmap-cloud');
const aiSeries = generateRealisticSeries(5, 'tech-roadmap-ai');
const modSeries = generateRealisticSeries(5, 'tech-roadmap-mod');
const debtSeries = generateRealisticSeries(5, 'tech-roadmap-debt');

export const TECH_ROADMAP: TechRoadmapPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  technologyHealth: healthSeries[i],
  standardsAdoption: standardsSeries[i],
  cloudAdoption: cloudSeries[i],
  aiAdoption: aiSeries[i],
  modernizationProgress: modSeries[i],
  technologyDebt: debtSeries[i],
}));

export const TECH_INVESTMENTS: TechInvestment[] = Array.from({ length: 30 }, (_, i) => ({
  id: `TINV-${String(i + 1).padStart(3, '0')}`,
  name: `${pick(CATEGORIES, i)} investment ${(i % 12) + 1}`,
  category: pick(CATEGORIES, i),
  stance: pick(STANCE, i),
  annualSpend: 3_000_000 + (i % 20) * 2_000_000,
  efficiencyScore: telemetryScore(`tinv:eff:${i}`),
  strategicFit: telemetryScore(`tinv:fit:${i}`),
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
  'AWS leads cloud adoption at 89% while GCP lags at 48%; Private Cloud holds 81%, Azure 66%. ' +
  'Standards: Security strongest at 93%, Observability weakest at 49%, API at 61%. ' +
  'Modernization Wave 1 at 86% vs Wave 3 at 38%; blocked work at 27%. ' +
  'Roadmap health moved 38→52→49→77→84 (2021–2025) with a 2023 regression. ' +
  'AI advisors flag Observability maturity, GCP adoption, and Wave 3 / blocked modernization as priority interventions.';
