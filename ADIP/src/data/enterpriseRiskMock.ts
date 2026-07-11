import type {
  AiRiskItem,
  AssuranceReview,
  AuditFinding,
  CyberRiskItem,
  EnterpriseRisk,
  RegulatoryRiskItem,
  RiskAppetiteItem,
  RiskControl,
  RiskException,
  RiskHistoryPoint,
  RiskTraceabilityChain,
  TechnologyRiskItem,
} from '../types/enterpriseRisk';
import { generateRealisticSeries, generateRiskTelemetry, telemetryInRange, telemetryScore } from './enterpriseTelemetry';

const CATEGORIES = ['operational', 'technology', 'cyber', 'ai', 'regulatory', 'financial', 'strategic', 'third-party'] as const;
const RISK = ['low', 'medium', 'high', 'critical'] as const;
const RISK_STATUS = ['open', 'monitoring', 'mitigating', 'accepted', 'closed'] as const;
const APPETITE = ['within', 'approaching', 'breached'] as const;
const CTRL_EFF = ['effective', 'partially-effective', 'ineffective', 'not-tested'] as const;
const FINDING_STATUS = ['open', 'in-remediation', 'overdue', 'closed'] as const;
const ASSURANCE_STATUS = ['planned', 'in-progress', 'completed', 'deferred'] as const;

const BUSINESS_UNITS = ['Retail Banking', 'Corporate Banking', 'Treasury & Markets', 'Risk & Compliance', 'Digital & Payments'];
const DOMAINS = ['UPI', 'Mobile Banking', 'Net Banking', 'Cards', 'Loans', 'Treasury', 'AML', 'KYC', 'Payments', 'Fraud Management', 'Trade Finance', 'Corporate Banking'];
const OWNERS = ['CRO', 'CISO', 'CIO', 'Head of Compliance', 'Head of Audit', 'Operations Risk Lead', 'Tech Risk Lead'];
const REGULATIONS = ['RBI Cyber Framework', 'PCI-DSS', 'Basel III', 'AML/CFT', 'DPDP Act', 'PMLA', 'IT Act', 'SEBI Norms', 'KYC Master Directions'];
const REGULATORS = ['RBI', 'SEBI', 'IRDAI', 'CERT-In', 'FIU-IND'];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

export const ERM_CONTROLS: RiskControl[] = Array.from({ length: 300 }, (_, i) => ({
  id: `CTRL-${String(i + 1).padStart(4, '0')}`,
  name: `${pick(['Access', 'Encryption', 'Monitoring', 'Reconciliation', 'Segregation', 'Backup', 'Change', 'Approval'], i)} Control ${(i % 40) + 1}`,
  category: pick(CATEGORIES, i),
  type: pick(['preventive', 'detective', 'corrective'] as const, i),
  effectiveness: pick(CTRL_EFF, i),
  automated: i % 2 === 0,
  lastTested: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  coverage: telemetryScore(`erm:ctrl:${i}`),
}));

export const ERM_ENTERPRISE_RISKS: EnterpriseRisk[] = Array.from({ length: 500 }, (_, i) => {
  const inherent = telemetryInRange(`erm:inh:${i}`, 18, 94);
  const control = ERM_CONTROLS[i % ERM_CONTROLS.length];
  return {
    id: `RISK-${String(i + 1).padStart(4, '0')}`,
    title: `${pick(['Settlement failure', 'Data leakage', 'System outage', 'Fraud exposure', 'Compliance breach', 'Model failure', 'Vendor failure', 'Liquidity stress'], i)} — ${pick(DOMAINS, i)}`,
    category: pick(CATEGORIES, i),
    businessUnit: pick(BUSINESS_UNITS, i),
    inherentScore: inherent,
    residualScore: Math.max(10, Math.round(inherent * (0.35 + (telemetryScore(`erm:res:${i}`) / 100) * 0.45))),
    severity: pick(RISK, i),
    likelihood: telemetryInRange(`erm:like:${i}`, 15, 94),
    status: pick(RISK_STATUS, i),
    owner: pick(OWNERS, i),
    controlId: control.id,
    appetiteStatus: pick(APPETITE, i),
  };
});

export const ERM_TECHNOLOGY_RISKS: TechnologyRiskItem[] = Array.from({ length: 200 }, (_, i) => ({
  id: `TRISK-${String(i + 1).padStart(4, '0')}`,
  title: `${pick(['EOL platform', 'Capacity breach', 'Failed change', 'Data integrity gap', 'Single point of failure'], i)} — ${pick(DOMAINS, i)}`,
  applicationArea: pick(DOMAINS, i),
  category: pick(['obsolescence', 'availability', 'capacity', 'change', 'data-integrity'] as const, i),
  severity: pick(RISK, i + 1),
  residualScore: telemetryScore(`erm:tech:${i}`),
  status: pick(RISK_STATUS, i),
}));

export const ERM_CYBER_RISKS: CyberRiskItem[] = Array.from({ length: 150 }, (_, i) => ({
  id: `CRISK-${String(i + 1).padStart(4, '0')}`,
  title: `${pick(['Ransomware exposure', 'Phishing campaign', 'DDoS risk', 'Insider threat', 'Unpatched CVE', 'Data breach risk'], i)} — ${pick(DOMAINS, i)}`,
  threatType: pick(['malware', 'phishing', 'ddos', 'insider', 'vulnerability', 'data-breach', 'ransomware'] as const, i),
  severity: pick(RISK, i + 2),
  exposureScore: telemetryScore(`erm:cyber:${i}`),
  status: pick(RISK_STATUS, i),
  assetArea: pick(DOMAINS, i),
}));

export const ERM_AI_RISKS: AiRiskItem[] = Array.from({ length: 100 }, (_, i) => ({
  id: `AIRISK-${String(i + 1).padStart(4, '0')}`,
  title: `${pick(['Model bias', 'Low explainability', 'Model drift', 'Privacy exposure', 'Prompt injection', 'Weak governance', 'Hallucination'], i)} — ${pick(['Fraud Model', 'Credit Model', 'AML Model', 'Chatbot', 'KYC AI', 'Recommendation Engine'], i)}`,
  category: pick(['bias', 'explainability', 'drift', 'privacy', 'security', 'governance', 'hallucination'] as const, i),
  severity: pick(RISK, i + 1),
  modelArea: pick(['Fraud', 'Credit', 'AML', 'Customer Service', 'KYC', 'Marketing'], i),
  residualScore: telemetryScore(`erm:ai:${i}`),
  status: pick(RISK_STATUS, i),
}));

export const ERM_REGULATORY_RISKS: RegulatoryRiskItem[] = Array.from({ length: 150 }, (_, i) => ({
  id: `RRISK-${String(i + 1).padStart(4, '0')}`,
  title: `${pick(['Reporting gap', 'Control deficiency', 'Late filing', 'Data residency', 'Consent gap'], i)} — ${pick(REGULATIONS, i)}`,
  regulation: pick(REGULATIONS, i),
  regulator: pick(REGULATORS, i),
  severity: pick(RISK, i + 1),
  exposureValue: 5_000_000 + (i % 30) * 5_000_000,
  status: pick(RISK_STATUS, i),
  dueDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

export const ERM_AUDIT_FINDINGS: AuditFinding[] = Array.from({ length: 200 }, (_, i) => {
  const risk = ERM_ENTERPRISE_RISKS[i % ERM_ENTERPRISE_RISKS.length];
  return {
    id: `FND-${String(i + 1).padStart(4, '0')}`,
    title: `${pick(['Inadequate access review', 'Missing reconciliation', 'Weak encryption', 'Unmonitored control', 'Policy non-adherence', 'Untested DR'], i)}`,
    riskId: risk.id,
    controlId: risk.controlId,
    severity: pick(RISK, i + 1),
    status: pick(FINDING_STATUS, i),
    source: pick(['internal-audit', 'external-audit', 'regulator', 'self-assessment'] as const, i),
    dueDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    owner: pick(OWNERS, i),
  };
});

export const ERM_EXCEPTIONS: RiskException[] = Array.from({ length: 100 }, (_, i) => {
  const risk = ERM_ENTERPRISE_RISKS[i % ERM_ENTERPRISE_RISKS.length];
  return {
    id: `EXC-${String(i + 1).padStart(4, '0')}`,
    riskId: risk.id,
    title: `Risk acceptance: ${risk.title.slice(0, 28)}`,
    status: pick(['requested', 'approved', 'expired'] as const, i),
    riskLevel: pick(RISK, i),
    approver: pick(['CRO', 'CISO', 'Risk Committee', 'Board'], i),
    expiresAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  };
});

export const ERM_ASSURANCE_REVIEWS: AssuranceReview[] = Array.from({ length: 100 }, (_, i) => ({
  id: `ASR-${String(i + 1).padStart(4, '0')}`,
  name: `${pick(['Operational', 'Cyber', 'AI', 'Regulatory', 'Technology'], i)} assurance review ${(i % 20) + 1}`,
  type: pick(['first-line', 'second-line', 'third-line'] as const, i),
  category: pick(CATEGORIES, i),
  status: pick(ASSURANCE_STATUS, i),
  coverage: telemetryScore(`erm:asr:${i}`),
  scheduledFor: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

/** Risk posture by BU — uneven enterprise reality (not equal exposure). */
const RISK_BU_EXPOSURE = generateRiskTelemetry();

export const ERM_RISK_APPETITE: RiskAppetiteItem[] = CATEGORIES.map((category, i) => {
  const threshold = [72, 65, 58, 70, 68, 62, 55, 60][i] ?? 60;
  const exposure = [
    41, 58, 82, 49, 91, 66, 33, 74,
  ][i] ?? telemetryScore(`erm:app:${i}`);
  return {
    id: `APP-${String(i + 1).padStart(2, '0')}`,
    category,
    appetiteThreshold: threshold,
    currentExposure: exposure,
    status: exposure > threshold ? 'breached' : exposure > threshold - 10 ? 'approaching' : 'within',
    tolerance: threshold + 10,
  };
});

const ermExpSeries = generateRealisticSeries(5, 'erm-history-exp');
const ermResSeries = generateRealisticSeries(5, 'erm-history-res');
const ermCtrlSeries = [38, 52, 49, 77, 84];
const ermAsrSeries = generateRealisticSeries(5, 'erm-history-asr');
const ermCyberSeries = generateRealisticSeries(5, 'erm-history-cyber');
const ermAiSeries = generateRealisticSeries(5, 'erm-history-ai');

export const ERM_HISTORY: RiskHistoryPoint[] = ['2021', '2022', '2023', '2024', '2025'].map((year, i) => ({
  year,
  enterpriseRiskExposure: ermExpSeries[i],
  residualRisk: ermResSeries[i],
  controlEffectiveness: ermCtrlSeries[i],
  assuranceCoverage: ermAsrSeries[i],
  cyberRiskScore: ermCyberSeries[i],
  aiRiskScore: ermAiSeries[i],
}));

export { RISK_BU_EXPOSURE };
export const ERM_TRACEABILITY_CHAINS: RiskTraceabilityChain[] = [
  { stage: 'Risk', entity: 'RISK-0042 Data leakage — Payments', link: 'Control', outcome: 'CTRL-0118 Encryption Control' },
  { stage: 'Control', entity: 'CTRL-0118', link: 'Audit Finding', outcome: 'FND-0024 Weak encryption' },
  { stage: 'Audit Finding', entity: 'FND-0024', link: 'Action Plan', outcome: 'AP-0088 Remediation in-progress' },
  { stage: 'Action Plan', entity: 'AP-0088', link: 'Project', outcome: 'PRJ-0024 Security uplift' },
  { stage: 'Project', entity: 'PRJ-0024', link: 'Application', outcome: 'ARCH-APP-0042 Payments Hub' },
  { stage: 'Application', entity: 'ARCH-APP-0042', link: 'Release', outcome: 'REL-8842 v3.2.1' },
  { stage: 'Release', entity: 'REL-8842', link: 'Production Incident', outcome: 'INC-2284 resolved' },
  { stage: 'Production Incident', entity: 'INC-2284', link: 'Business Impact', outcome: '₹0 loss · contained' },
  { stage: 'Business Impact', entity: 'Contained', link: 'Value Realization', outcome: '₹420K risk-avoidance · VP-088' },
];

export const ENTERPRISE_RISK_EXEC_SUMMARY =
  'Enterprise Risk Management & Integrated Assurance provides the board a single view across 500 enterprise risks, 200 technology risks, 150 cyber risks, 100 AI risks, and 150 regulatory risks, governed by 300 controls and 200 audit findings. ' +
  'Retail Banking residual posture is healthy at 82% while Treasury sits weak at 41% and Corporate Banking at 56%. ' +
  'Risk & Compliance leads at 91%; Digital Payments holds 74%. ' +
  'FIU compliance remains below target at 61% while RBI is strongest at 96% and CERT-In at 94%. ' +
  'AI advisors flag Treasury modernization risk, FIU compliance lag, and cyber appetite breaches as board priorities.';
