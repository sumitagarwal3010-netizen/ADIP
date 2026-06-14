import type { SimulationConfig } from '../hooks/useGenerationSimulation';
import type { Artifact } from '../types/artifacts';
import { buildSections, createArtifact } from './artifactBuilder';

export type HubKey =
  | 'production'
  | 'incidents'
  | 'availability'
  | 'capacity'
  | 'audit'
  | 'compliance'
  | 'risk'
  | 'evidence'
  | 'ai-use-case'
  | 'ai-model-inventory'
  | 'ai-prompt'
  | 'ai-risk'
  | 'ai-controls'
  | 'ai-incidents'
  | 'learning'
  | 'best-practices'
  | 'reusable-assets'
  | 'lessons-learned'
  | 'executive'
  | 'traceability'
  | 'approval-workflow'
  | 'rbac'
  | 'authentication'
  | 'workflow-orchestration';

export interface HubArtifactConfig {
  title: string;
  subtitle: string;
  generateLabel: string;
  generatedBy: string;
  glow?: 'blue' | 'purple';
  simulation: SimulationConfig;
  build: (runId: string) => Artifact[];
}

const FEATURE = 'UPI Payments & Mobile Banking';

function sim(initial: string, activities: string[]): SimulationConfig {
  const steps = activities.map((activity, i) => ({
    progress: Math.min(100, Math.round(((i + 1) / activities.length) * 100)),
    activity,
    delayMs: 650,
  }));
  return { initialStatus: initial, steps };
}

function productionArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-health`,
      name: 'Production_Health_Assessment.docx',
      generatedBy: 'Operations AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      riskRating: 'Low',
      previewContent: `PRODUCTION HEALTH ASSESSMENT\n${FEATURE}\n\nOverall Health: 94%\nUPI Switch: Healthy · Core Ledger: Healthy · Mobile API: Watch\n\nSLA Compliance: 99.92% (target 99.9%)\nOpen P1 Incidents: 2 · MTTR: 42 min`,
      executiveSummary: 'Production estate remains stable with UPI and mobile channels operating within SLA. Two P1 incidents under active remediation.',
      sections: buildSections(
        'Payments production stack is healthy with minor watch items on mobile API latency during peak hours.',
        ['UPI TPS peak at 12,400 with zero settlement failures in 24h.', 'Mobile Banking API P99 latency elevated to 1.8s during 8–10 PM.', 'Card authorization success rate at 99.7%.'],
        ['Scale mobile API pods before weekend peak.', 'Complete fraud engine patch in maintenance window.'],
        'Approved by: Head of Production Operations',
      ),
      context: { feature: FEATURE, subject: 'Production Health' },
    }),
    createArtifact({
      id: `${runId}-stability`,
      name: 'Operational_Stability_Report.docx',
      generatedBy: 'Operations AI',
      fileType: 'docx',
      previewContent: `OPERATIONAL STABILITY REPORT\n\nStability Index: 91/100\nChange Failure Rate: 4.2%\nDeployment Frequency: 3.2/day\n\nTop Stability Risks:\n  1. Batch settlement retry storms\n  2. NPCI switch timeout during DR drills`,
      riskRating: 'Medium',
      context: { subject: 'Operational Stability' },
    }),
    createArtifact({
      id: `${runId}-exec-ops`,
      name: 'Executive_Operations_Summary.docx',
      generatedBy: 'Operations AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `EXECUTIVE OPERATIONS SUMMARY\n\nPortfolio availability: 99.94%\nCustomer-impacting incidents (30d): 14\nRegulatory incidents: 0\n\nExecutive Recommendation: Maintain current capacity plan; accelerate mobile channel hardening.`,
      executiveSummary: 'Operations performance supports business growth targets with focused investment needed on mobile peak resilience.',
      context: { subject: 'Executive Operations' },
    }),
  ];
}

function incidentsArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-rca`,
      name: 'AI_Root_Cause_Analysis.docx',
      generatedBy: 'Incident AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      riskRating: 'High',
      previewContent: `AI ROOT CAUSE ANALYSIS\nINC-PAY-2847 — UPI Settlement Timeout\n\nRoot Cause: NPCI acknowledgment lag caused duplicate settlement retries.\nContributing Factors: Circuit breaker threshold misconfigured.\nImpact: 2,340 merchants · ₹18.2M delayed settlements`,
      executiveSummary: 'RCA confirms infrastructure timeout combined with retry logic caused settlement delays; no data loss.',
      sections: buildSections(
        'Incident traced to NPCI switch latency spike and aggressive client retry policy.',
        ['P99 NPCI latency exceeded 8s for 12 minutes.', 'Settlement service retried without idempotency guard.', 'Merchant notifications delayed by 45 minutes.'],
        ['Deploy idempotency keys on settlement API.', 'Tune circuit breaker to 5s with half-open probe.'],
        'RCA Approved: Incident Manager · RBI notification filed',
      ),
      context: { subject: 'UPI Settlement RCA' },
    }),
    createArtifact({
      id: `${runId}-problem`,
      name: 'Problem_Record.docx',
      generatedBy: 'Incident AI',
      fileType: 'docx',
      previewContent: `PROBLEM RECORD PRB-PAY-089\n\nTitle: Recurring UPI settlement timeout under peak load\nStatus: Root Cause Identified\nWorkaround: Manual settlement batch trigger\nPermanent Fix: Retry policy + NPCI timeout handling`,
      context: { subject: 'Problem Record' },
    }),
    createArtifact({
      id: `${runId}-trend`,
      name: 'Incident_Trend_Report.docx',
      generatedBy: 'Incident AI',
      fileType: 'docx',
      previewContent: `INCIDENT TREND REPORT (90 days)\n\nPayments incidents: 47 (↑12%)\nMobile Banking: 23 (↓8%)\nNet Banking: 11 (stable)\n\nTop categories: Timeout (34%), Config (22%), Third-party (18%)`,
      context: { subject: 'Incident Trends' },
    }),
    createArtifact({
      id: `${runId}-prevent`,
      name: 'Prevention_Recommendations.docx',
      generatedBy: 'Incident AI',
      fileType: 'docx',
      previewContent: `PREVENTION RECOMMENDATIONS\n\n1. Implement chaos testing for NPCI failover monthly\n2. Add settlement idempotency across all payment rails\n3. Expand real-time merchant status dashboard\n4. Automate RBI incident classification for P1 events`,
      context: { subject: 'Prevention' },
    }),
  ];
}

function availabilityArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-sla`,
      name: 'SLA_Compliance_Report.docx',
      generatedBy: 'Availability AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `SLA COMPLIANCE REPORT\n\nUPI Platform: 99.95% (SLA 99.9%) ✓\nMobile Banking: 99.88% (SLA 99.9%) ✗\nNet Banking: 99.94% (SLA 99.5%) ✓\nCredit Card Auth: 99.97% (SLA 99.95%) ✓`,
      context: { subject: 'SLA Compliance' },
    }),
    createArtifact({
      id: `${runId}-assess`,
      name: 'Availability_Assessment.docx',
      generatedBy: 'Availability AI',
      fileType: 'docx',
      previewContent: `AVAILABILITY ASSESSMENT\n\nCritical services: 12 assessed\nAt-risk: Mobile API Gateway, Fraud Scoring Engine\nDR readiness: 96% · RTO validated for core payments`,
      riskRating: 'Medium',
      context: { subject: 'Availability' },
    }),
    createArtifact({
      id: `${runId}-reliability`,
      name: 'Service_Reliability_Report.docx',
      generatedBy: 'Availability AI',
      fileType: 'docx',
      previewContent: `SERVICE RELIABILITY REPORT\n\nError Budget Consumed (MTD):\n  UPI: 42% · Mobile: 78% · Cards: 15%\n\nRecommendation: Freeze non-critical mobile releases until error budget recovers.`,
      context: { subject: 'Service Reliability' },
    }),
  ];
}

function capacityArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-cap`,
      name: 'Capacity_Assessment.docx',
      generatedBy: 'Capacity AI',
      fileType: 'docx',
      previewContent: `CAPACITY ASSESSMENT\n\nUPI peak TPS: 12,400 / 15,000 capacity (83%)\nMobile API: 8,200 RPS / 9,000 (91%)\nCore DB CPU: 72% avg · Storage growth 8%/month`,
      riskRating: 'Medium',
      context: { subject: 'Capacity' },
    }),
    createArtifact({
      id: `${runId}-forecast`,
      name: 'Growth_Forecast.docx',
      generatedBy: 'Capacity AI',
      fileType: 'docx',
      previewContent: `GROWTH FORECAST (12 months)\n\nUPI volume: +28% projected\nMobile users: +15%\nCredit card transactions: +11%\n\nCapacity breach risk: Mobile API by Q3 if no scale-out`,
      context: { subject: 'Growth Forecast' },
    }),
    createArtifact({
      id: `${runId}-infra`,
      name: 'Infrastructure_Planning_Report.docx',
      generatedBy: 'Capacity AI',
      fileType: 'docx',
      previewContent: `INFRASTRUCTURE PLANNING REPORT\n\nRecommended actions:\n  • Add 4 mobile API nodes before festival season\n  • Expand UPI shard capacity by 20%\n  • Tier storage for 7-year AML audit retention`,
      context: { subject: 'Infrastructure Planning' },
    }),
  ];
}

function auditArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-ready`,
      name: 'Audit_Readiness_Report.docx',
      generatedBy: 'Audit AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `AUDIT READINESS REPORT\n\nScope: IT General Controls · Payments · AML/KYC\nReadiness Score: 88%\nOpen observations: 7 · Critical: 0 · High: 2`,
      context: { subject: 'Audit Readiness' },
    }),
    createArtifact({
      id: `${runId}-obs`,
      name: 'Audit_Observation_Summary.docx',
      generatedBy: 'Audit AI',
      fileType: 'docx',
      previewContent: `AUDIT OBSERVATION SUMMARY\n\nOBS-001: Privileged access review lag (High)\nOBS-002: KYC document retention incomplete (Medium)\nOBS-003: PCI key rotation evidence gap (High)\n\nRemediation ETA: 45 days`,
      riskRating: 'High',
      context: { subject: 'Audit Observations' },
    }),
    createArtifact({
      id: `${runId}-controls`,
      name: 'Control_Effectiveness_Report.docx',
      generatedBy: 'Audit AI',
      fileType: 'docx',
      previewContent: `CONTROL EFFECTIVENESS REPORT\n\nControls tested: 64\nEffective: 58 · Partially effective: 4 · Ineffective: 2\n\nAML transaction monitoring control rated Effective with enhancement recommendation.`,
      context: { subject: 'Control Effectiveness' },
    }),
  ];
}

function complianceArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-rbi`,
      name: 'RBI_Compliance_Report.docx',
      generatedBy: 'Compliance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `RBI COMPLIANCE REPORT\n\nDigital Payment Security: Compliant\nKYC/AML circular adherence: 94%\nIT Governance: Action required on DR evidence\n\nOpen gaps: 3 · Target closure: 30 days`,
      context: { subject: 'RBI Compliance' },
    }),
    createArtifact({
      id: `${runId}-pci`,
      name: 'PCI_DSS_Compliance_Report.docx',
      generatedBy: 'Compliance AI',
      fileType: 'docx',
      previewContent: `PCI-DSS 4.0 COMPLIANCE REPORT\n\nCardholder data environment: 12 systems\nCompliant controls: 89%\nGap: Encryption key rotation documentation`,
      context: { subject: 'PCI-DSS' },
    }),
    createArtifact({
      id: `${runId}-iso`,
      name: 'ISO27001_Compliance_Report.docx',
      generatedBy: 'Compliance AI',
      fileType: 'docx',
      previewContent: `ISO 27001 COMPLIANCE REPORT\n\nAnnex A controls assessed: 114\nImplemented: 108 · Planned: 6\nCertification readiness: 92%`,
      context: { subject: 'ISO27001' },
    }),
    createArtifact({
      id: `${runId}-dpsc`,
      name: 'DPSC_Compliance_Assessment.docx',
      generatedBy: 'Compliance AI',
      fileType: 'docx',
      previewContent: `DPSC COMPLIANCE ASSESSMENT\n\nData protection controls for customer PII in mobile and UPI channels reviewed.\nScore: 90% · Privacy notice updates required for biometric login.`,
      context: { subject: 'DPSC' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Compliance_Executive_Summary.docx',
      generatedBy: 'Compliance AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `COMPLIANCE EXECUTIVE SUMMARY\n\nRegulatory posture: Strong with targeted gaps in PCI evidence and DPSC notices.\nRecommendation: Prioritize card data key rotation audit trail.`,
      executiveSummary: 'Enterprise compliance health supports regulatory exams with focused remediation on payment card and data privacy controls.',
      context: { subject: 'Compliance Executive' },
    }),
  ];
}

function riskArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-enterprise`,
      name: 'Enterprise_Risk_Assessment.docx',
      generatedBy: 'Risk AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `ENTERPRISE RISK ASSESSMENT\n\nTop risks: Payments fraud surge, AML model drift, Cloud concentration\nEnterprise risk score: 72/100 (Watch band)`,
      context: { subject: 'Enterprise Risk' },
    }),
    createArtifact({
      id: `${runId}-register`,
      name: 'Risk_Register_Summary.docx',
      generatedBy: 'Risk AI',
      fileType: 'docx',
      previewContent: `RISK REGISTER SUMMARY\n\nOpen risks: 47 · Critical: 3 · High: 11\nPayments domain: 14 risks · AI/ML: 8 risks`,
      context: { subject: 'Risk Register' },
    }),
    createArtifact({
      id: `${runId}-mitigation`,
      name: 'Mitigation_Plan.docx',
      generatedBy: 'Risk AI',
      fileType: 'docx',
      previewContent: `MITIGATION PLAN\n\n1. Deploy enhanced UPI fraud scoring (Q2)\n2. Refresh AML rule set for high-value transfers\n3. Multi-region failover for core ledger\nOwner: Enterprise Risk Office`,
      context: { subject: 'Mitigation' },
    }),
  ];
}

function evidenceArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-collection`,
      name: 'Evidence_Collection_Package.zip',
      generatedBy: 'Evidence AI',
      fileType: 'xlsx',
      previewContent: `EVIDENCE COLLECTION PACKAGE\n\nArtifacts: 128 documents\nDomains: Payments, KYC, Cards, AML\nCoverage: Q1 2026 audit cycle`,
      context: { subject: 'Evidence Collection' },
    }),
    createArtifact({
      id: `${runId}-complete`,
      name: 'Evidence_Completeness_Report.docx',
      generatedBy: 'Evidence AI',
      fileType: 'docx',
      previewContent: `EVIDENCE COMPLETENESS REPORT\n\nRequired evidence items: 142\nCollected: 128 (90%)\nMissing: DR drill sign-off, PCI scan attestation`,
      context: { subject: 'Evidence Completeness' },
    }),
    createArtifact({
      id: `${runId}-validation`,
      name: 'Control_Validation_Evidence_Pack.docx',
      generatedBy: 'Evidence AI',
      fileType: 'docx',
      previewContent: `CONTROL VALIDATION EVIDENCE PACK\n\nControls validated: 45\nEvidence quality score: 87%\nAutomated collection via ECS-style evidence pipelines: 62%`,
      context: { subject: 'Control Validation' },
    }),
  ];
}

function aiUseCaseArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-assess`,
      name: 'AI_Use_Case_Assessment.docx',
      generatedBy: 'AI Governance AI',
      fileType: 'docx',
      previewContent: `AI USE CASE ASSESSMENT\nUse Case: Real-time UPI Fraud Scoring\nRisk tier: High · Data: Transaction telemetry\nHuman oversight: Required for block actions`,
      riskRating: 'High',
      context: { subject: 'AI Use Case' },
    }),
    createArtifact({
      id: `${runId}-value`,
      name: 'Business_Value_Report.docx',
      generatedBy: 'AI Governance AI',
      fileType: 'docx',
      previewContent: `BUSINESS VALUE REPORT\n\nEstimated fraud loss reduction: ₹42M/year\nCustomer friction impact: Low (false positive <0.3%)\nROI payback: 8 months`,
      context: { subject: 'Business Value' },
    }),
    createArtifact({
      id: `${runId}-approval`,
      name: 'Approval_Recommendation.docx',
      generatedBy: 'AI Governance AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `APPROVAL RECOMMENDATION\n\nRecommendation: APPROVE with conditions\nConditions: Monthly model drift review, RBI notification, human-in-loop for blocks >₹50,000`,
      executiveSummary: 'Use case delivers strong fraud ROI with manageable risk when guardrails are enforced.',
      context: { subject: 'AI Approval' },
    }),
  ];
}

function aiModelArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-inventory`,
      name: 'Model_Inventory_Report.docx',
      generatedBy: 'Model Governance AI',
      fileType: 'docx',
      previewContent: `MODEL INVENTORY REPORT\n\nTotal models: 24 · Production: 18 · In review: 4\nVendors: Gemini, internal ML, third-party fraud vendor`,
      context: { subject: 'Model Inventory' },
    }),
    createArtifact({
      id: `${runId}-factsheet`,
      name: 'Model_Fact_Sheet.docx',
      generatedBy: 'Model Governance AI',
      fileType: 'docx',
      previewContent: `MODEL FACT SHEET — FraudScorer v3.2\nOwner: Payments Risk\nTraining data: 18 months UPI transactions\nBias review: Completed · Drift monitoring: Active`,
      context: { subject: 'Model Fact Sheet' },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Model_Risk_Assessment.docx',
      generatedBy: 'Model Governance AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `MODEL RISK ASSESSMENT\n\nInherent risk: High · Residual risk: Medium\nKey risk: Adversarial pattern evolution on UPI P2M`,
      context: { subject: 'Model Risk' },
    }),
    createArtifact({
      id: `${runId}-approval`,
      name: 'Model_Approval_Summary.docx',
      generatedBy: 'Model Governance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `MODEL APPROVAL SUMMARY\n\nApproved for production with quarterly revalidation.\nNext review: Sep 2026 · Approver: Model Risk Committee`,
      context: { subject: 'Model Approval' },
    }),
  ];
}

function aiPromptArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-review`,
      name: 'Prompt_Review_Report.docx',
      generatedBy: 'Prompt Governance AI',
      fileType: 'docx',
      previewContent: `PROMPT REVIEW REPORT\n\nPrompts reviewed: 34 · Approved: 28 · Rejected: 2\nHigh-risk prompts: Customer PII extraction blocked`,
      context: { subject: 'Prompt Review' },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Prompt_Risk_Assessment.docx',
      generatedBy: 'Prompt Governance AI',
      fileType: 'docx',
      riskRating: 'Medium',
      previewContent: `PROMPT RISK ASSESSMENT\n\nInjection risk: Medium on customer support prompts\nMitigation: Output filtering + allowlist tools`,
      context: { subject: 'Prompt Risk' },
    }),
    createArtifact({
      id: `${runId}-quality`,
      name: 'Prompt_Quality_Report.docx',
      generatedBy: 'Prompt Governance AI',
      fileType: 'docx',
      previewContent: `PROMPT QUALITY REPORT\n\nQuality score: 91%\nHallucination rate in test suite: 1.2%\nBest performing: Requirement summarization prompts`,
      context: { subject: 'Prompt Quality' },
    }),
  ];
}

function aiRiskHubArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-assess`,
      name: 'AI_Risk_Assessment.docx',
      generatedBy: 'AI Risk AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `AI RISK ASSESSMENT\n\nEnterprise AI risk score: 68/100\nTop risks: Model drift, prompt injection, third-party LLM dependency`,
      context: { subject: 'AI Risk Assessment' },
    }),
    createArtifact({
      id: `${runId}-register`,
      name: 'AI_Risk_Register.docx',
      generatedBy: 'AI Risk AI',
      fileType: 'docx',
      previewContent: `AI RISK REGISTER\n\nAIR-001: LLM hallucination in credit advice (High)\nAIR-002: Training data bias in KYC OCR (Medium)\nAIR-003: Vendor API outage (Medium)`,
      context: { subject: 'AI Risk Register' },
    }),
    createArtifact({
      id: `${runId}-mitigation`,
      name: 'Mitigation_Recommendations.docx',
      generatedBy: 'AI Risk AI',
      fileType: 'docx',
      previewContent: `MITIGATION RECOMMENDATIONS\n\n1. Mandatory human review for credit limit suggestions\n2. Red-team prompts quarterly\n3. Fallback to rules engine on model timeout`,
      context: { subject: 'AI Mitigation' },
    }),
  ];
}

function aiControlsArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-validation`,
      name: 'AI_Control_Validation_Report.docx',
      generatedBy: 'AI Controls AI',
      fileType: 'docx',
      previewContent: `AI CONTROL VALIDATION REPORT\n\nControls tested: 22 · Effective: 19 · Gaps: 3\nHuman-in-the-loop control: Effective`,
      context: { subject: 'AI Control Validation' },
    }),
    createArtifact({
      id: `${runId}-coverage`,
      name: 'Control_Coverage_Assessment.docx',
      generatedBy: 'AI Controls AI',
      fileType: 'docx',
      previewContent: `CONTROL COVERAGE ASSESSMENT\n\nGuardrail coverage: 87%\nMissing: Output toxicity filter on internal chatbot`,
      context: { subject: 'Control Coverage' },
    }),
    createArtifact({
      id: `${runId}-mapping`,
      name: 'Compliance_Mapping_Report.docx',
      generatedBy: 'AI Controls AI',
      fileType: 'docx',
      previewContent: `COMPLIANCE MAPPING REPORT\n\nRBI AI guidance mapped to 18 controls\nPCI relevance: 6 controls · ISO 27001: 12 controls`,
      context: { subject: 'Compliance Mapping' },
    }),
  ];
}

function aiIncidentsArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-rca`,
      name: 'AI_Incident_RCA.docx',
      generatedBy: 'AI Incident AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `AI INCIDENT RCA\nINC-AI-012 — Hallucinated loan rate in mobile chatbot\nRoot cause: Stale prompt context · Impact: 340 customer complaints`,
      context: { subject: 'AI Incident RCA' },
    }),
    createArtifact({
      id: `${runId}-investigation`,
      name: 'AI_Incident_Investigation_Report.docx',
      generatedBy: 'AI Incident AI',
      fileType: 'docx',
      previewContent: `AI INCIDENT INVESTIGATION REPORT\n\nTimeline: 14:02 prompt deploy → 14:45 customer escalation\nData leakage: None confirmed\nRegulatory notification: Not required`,
      context: { subject: 'AI Investigation' },
    }),
    createArtifact({
      id: `${runId}-corrective`,
      name: 'Corrective_Action_Plan.docx',
      generatedBy: 'AI Incident AI',
      fileType: 'docx',
      previewContent: `CORRECTIVE ACTION PLAN\n\n1. Rollback prompt template v2.4\n2. Add rate disclaimer to all loan responses\n3. Enable automated prompt regression tests`,
      context: { subject: 'Corrective Action' },
    }),
  ];
}

function learningArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-path`,
      name: 'Learning_Path_Report.docx',
      generatedBy: 'Learning AI',
      fileType: 'docx',
      previewContent: `LEARNING PATH REPORT\n\nRecommended paths: Cloud-native payments, AML analytics, Secure API design\nCompletion rate (org): 74%`,
      context: { subject: 'Learning Path' },
    }),
    createArtifact({
      id: `${runId}-gap`,
      name: 'Skill_Gap_Assessment.docx',
      generatedBy: 'Learning AI',
      fileType: 'docx',
      previewContent: `SKILL GAP ASSESSMENT\n\nCritical gaps: Kubernetes SRE (Payments), RBI compliance for AI, PCI audit evidence\nTeams affected: Mobile Banking, Cards, Risk`,
      context: { subject: 'Skill Gap' },
    }),
  ];
}

function bestPracticesArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-guide`,
      name: 'Best_Practice_Guide.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `BEST PRACTICE GUIDE — UPI & MOBILE BANKING\n\n1. Idempotent payment APIs\n2. Circuit breakers on NPCI calls\n3. KYC re-verification on limit changes`,
      context: { subject: 'Best Practices' },
    }),
    createArtifact({
      id: `${runId}-standards`,
      name: 'Recommended_Standards_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `RECOMMENDED STANDARDS REPORT\n\nAPI: OpenAPI 3.0 + bank security headers\nTesting: 85% automation on payment regression\nDocs: BRD/FRD traceability mandatory`,
      context: { subject: 'Standards' },
    }),
  ];
}

function reusableAssetsArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-catalog`,
      name: 'Asset_Catalog_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `ASSET CATALOG REPORT\n\nReusable assets: 156\nTop reused: UPI settlement playbook, KYC OCR pipeline, PCI logging template`,
      context: { subject: 'Asset Catalog' },
    }),
    createArtifact({
      id: `${runId}-reuse`,
      name: 'Reusability_Assessment.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `REUSABILITY ASSESSMENT\n\nReuse rate: 62% on payment releases\nEstimated savings: ₹8.4M/year in delivery effort`,
      context: { subject: 'Reusability' },
    }),
  ];
}

function lessonsLearnedArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-lessons`,
      name: 'Lessons_Learned_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `LESSONS LEARNED REPORT\n\nFrom UPI Release 24.6:\n  • Early NPCI sandbox testing prevents settlement incidents\n  • Feature flags essential for limit enhancement rollout`,
      context: { subject: 'Lessons Learned' },
    }),
    createArtifact({
      id: `${runId}-improve`,
      name: 'Improvement_Recommendations.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `IMPROVEMENT RECOMMENDATIONS\n\n1. Institutionalize post-incident learning reviews\n2. Cross-publish playbooks to all payment squads\n3. Link lessons to risk register automatically`,
      context: { subject: 'Improvements' },
    }),
  ];
}

function executiveArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-summary`,
      name: 'Executive_Summary.docx',
      generatedBy: 'Executive AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE SUMMARY\n\nPortfolio health: 91% · Payments growth strong\nKey watch: Mobile availability, AML model refresh\nStrategic priority: UPI limit enhancement go-live`,
      executiveSummary: 'Enterprise delivery and operations posture supports growth with focused investment in mobile resilience and compliance evidence.',
      context: { subject: 'Executive Summary' },
    }),
    createArtifact({
      id: `${runId}-portfolio`,
      name: 'Portfolio_Health_Report.docx',
      generatedBy: 'Executive AI',
      fileType: 'docx',
      previewContent: `PORTFOLIO HEALTH REPORT\n\nNet Banking: 93% · Mobile: 91% · Payments: 88% · Cards: 90%\nDelivery velocity: 90% · Governance: 97%`,
      context: { subject: 'Portfolio Health' },
    }),
    createArtifact({
      id: `${runId}-strategic`,
      name: 'Strategic_Risk_Report.docx',
      generatedBy: 'Executive AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `STRATEGIC RISK REPORT\n\nTop strategic risks: Regulatory change on UPI limits, Fraud AI adversarial attacks, Cloud vendor concentration`,
      context: { subject: 'Strategic Risk' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Presentation_Summary.pptx',
      generatedBy: 'Executive AI',
      fileType: 'docx',
      previewContent: `BOARD PRESENTATION SUMMARY\n\nSlide 1: Portfolio KPIs · Slide 2: UPI growth & risks\nSlide 3: Compliance posture · Slide 4: AI program status\nSlide 5: Investment recommendations`,
      context: { subject: 'Board Presentation' },
    }),
  ];
}

function approvalWorkflowArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-decision`,
      name: 'Approval_Decision_Report.docx',
      generatedBy: 'Approval Workflow AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `APPROVAL DECISION REPORT\n\nDecisions this period: 32 approved · 6 rejected · 4 escalated\nCritical path: UPI Fraud Model release (APR-001) — Under Review\nModel risk: APR-004 escalated to enterprise committee`,
      executiveSummary: 'Approval decisions are concentrated in Release and AI Governance with two overdue SLA breaches requiring executive attention.',
      context: { subject: 'Approval Decision' },
    }),
    createArtifact({
      id: `${runId}-history`,
      name: 'Review_History_Report.docx',
      generatedBy: 'Approval Workflow AI',
      fileType: 'docx',
      previewContent: `REVIEW HISTORY REPORT\n\nActions logged: 124 this month\nAssign: 28 · Approve: 32 · Reject: 6 · Changes: 14 · Escalate: 4\nFull actor audit trail with status transitions attached`,
      context: { subject: 'Review History' },
    }),
    createArtifact({
      id: `${runId}-escalation`,
      name: 'Escalation_Summary.docx',
      generatedBy: 'Approval Workflow AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `ESCALATION SUMMARY\n\nOpen escalations: 2\nAPR-004: Credit scoring fairness evidence\nAPR-031: AML model retrain — regulatory hold\nTrend: ↓ 33% vs prior month`,
      context: { subject: 'Escalation Summary' },
    }),
    createArtifact({
      id: `${runId}-audit-pkg`,
      name: 'Approval_Audit_Package.docx',
      generatedBy: 'Approval Workflow AI',
      fileType: 'docx',
      previewContent: `APPROVAL AUDIT PACKAGE\n\nMaker-checker evidence: 52 records\nSLA adherence: 82%\nRegulatory mapping: RBI · PCI · ISO 27001\nReady for internal audit and board review`,
      context: { subject: 'Approval Audit Package' },
    }),
  ];
}

function authenticationArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-identity`,
      name: 'Identity_Report.docx',
      generatedBy: 'Authentication AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `IDENTITY REPORT\n\nDirectory users: 13 · Active sessions: 8\nProviders: Mock Azure AD, Okta, Ping\nProduction path: Microsoft Entra ID OIDC\n\nAll identity attributes mapped: user_id, username, display_name, email, department, role, persona, groups`,
      executiveSummary: 'Enterprise identity posture is stable with mock OIDC providers; Azure AD designated as production integration target.',
      context: { subject: 'Identity Report' },
    }),
    createArtifact({
      id: `${runId}-access-review`,
      name: 'Access_Review_Report.docx',
      generatedBy: 'Authentication AI',
      fileType: 'docx',
      previewContent: `ACCESS REVIEW REPORT\n\nUsers reviewed: 13 · Groups: 26\nPersona-to-RBAC mappings: 100% aligned\nExceptions: 0 orphaned accounts\nRecommendation: Complete Entra ID group sync before production`,
      context: { subject: 'Access Review' },
    }),
    createArtifact({
      id: `${runId}-activity`,
      name: 'Authentication_Activity_Report.docx',
      generatedBy: 'Authentication AI',
      fileType: 'docx',
      previewContent: `AUTHENTICATION ACTIVITY REPORT\n\nEvents (24h): Login 12 · Logout 9 · Session refresh 4 · Expiry 2 · Role change 1\nFailed logins: 2\nAvg session duration: 24 minutes`,
      context: { subject: 'Authentication Activity' },
    }),
  ];
}

function rbacArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-access-review`,
      name: 'Access_Review_Report.docx',
      generatedBy: 'RBAC AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `ACCESS REVIEW REPORT\n\nRoles reviewed: 12 · Personas mapped: 13\nGrants in scope: 142 · Exceptions: 2\nRecommendation: Revoke approve on approvals for platform-administrator`,
      executiveSummary: 'Quarterly access review confirms 98% alignment with least-privilege policy with two SoD exceptions flagged for remediation.',
      context: { subject: 'Access Review' },
    }),
    createArtifact({
      id: `${runId}-role-assignment`,
      name: 'Role_Assignment_Report.docx',
      generatedBy: 'RBAC AI',
      fileType: 'docx',
      previewContent: `ROLE ASSIGNMENT REPORT\n\nCIO → Executive dashboards\nAuditor → Read-only traceability + evidence\nSecurity Officer → AI controls + incidents\nPlatform Administrator → Full administer`,
      context: { subject: 'Role Assignment' },
    }),
    createArtifact({
      id: `${runId}-sod`,
      name: 'Segregation_Of_Duties_Report.docx',
      generatedBy: 'RBAC AI',
      fileType: 'docx',
      riskRating: 'Medium',
      previewContent: `SEGREGATION OF DUTIES REPORT\n\nViolations: 2\n1. Platform Admin: administer + approve on approvals\n2. Development Lead: create + approve on same artifact type\nMitigation: enforce maker-checker workflow`,
      context: { subject: 'Segregation of Duties' },
    }),
    createArtifact({
      id: `${runId}-matrix`,
      name: 'Entitlement_Matrix.docx',
      generatedBy: 'RBAC AI',
      fileType: 'docx',
      previewContent: `ENTITLEMENT MATRIX\n\n14 resource types × 9 permissions × 12 roles\nHighest privilege: Platform Administrator (126 grants)\nLowest privilege: Auditor (read-only, 42 grants)`,
      context: { subject: 'Entitlement Matrix' },
    }),
  ];
}

function traceabilityArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-rtm`,
      name: 'Requirement_Traceability_Report.docx',
      generatedBy: 'Traceability AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `REQUIREMENT TRACEABILITY REPORT\n\nScope: UPI, Mobile Banking, Cards, Net Banking\nBusiness requirements traced: 4\nFull lineage (BR→FR→US→ARC→API→TC→REL→EVD): 1 of 4\nAverage RTM coverage: 84%\n\nGaps: KYC onboarding missing Release & Evidence; Biometric login failing Test Case (TC-002).`,
      executiveSummary: 'Requirement-to-evidence lineage is largely intact for payments; mobile and onboarding threads have specific downstream gaps requiring closure before audit.',
      sections: buildSections(
        'End-to-end requirement traceability assessed across four banking initiatives.',
        ['UPI Limit Enhancement fully traced BR-001 → CMP-RBI.', 'KYC Onboarding (BR-004) has no Release/Production linkage.', 'Biometric login test case TC-002 is failing, blocking Release REL-MOB59.'],
        ['Close KYC release linkage before next audit cycle.', 'Remediate TC-002 to unblock Mobile Release 5.9.', 'Maintain RTM as part of release gate.'],
        'Approved by: Head of Delivery Assurance',
      ),
      context: { subject: 'Requirement Traceability' },
    }),
    createArtifact({
      id: `${runId}-impact`,
      name: 'Impact_Assessment_Report.docx',
      generatedBy: 'Traceability AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'High',
      previewContent: `IMPACT ASSESSMENT REPORT\n\nFocus artifact: MDL-001 Fraud Detection Model\nDownstream impact: TC-001, REL-246, PRD-001, AIR-005, CTL-001, EVD-001, CMP-RBI\nAffected releases: 1 · Affected controls: 1 · Affected compliance: 1\n\nChange to MDL-001 requires regression of UPI limit flow and RBI evidence refresh.`,
      executiveSummary: 'Changes to the UPI fraud model cascade to one production release, a human-in-loop control, and RBI compliance evidence; coordinated regression is required.',
      context: { subject: 'Impact Assessment' },
    }),
    createArtifact({
      id: `${runId}-audit`,
      name: 'Audit_Traceability_Report.docx',
      generatedBy: 'Traceability AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `AUDIT TRACEABILITY REPORT\n\nAudit readiness: 78%\nControls with evidence: 3 of 4\nEvidence packs approved: 2 of 4\n\nReady: UPI (EVD-001), PCI (EVD-003).\nPending: AI Incident (EVD-002), KYC (EVD-004).`,
      executiveSummary: 'Audit trail is traceable from control to evidence for payments and cards; mobile and KYC evidence packs remain in review.',
      sections: buildSections(
        'Control-to-evidence traceability evaluated for audit readiness.',
        ['Risk → Control → Evidence chains complete for 3 of 4 domains.', 'EVD-002 and EVD-004 are pending review.', 'All critical risks (AIR-006) have a linked control.'],
        ['Finalize pending evidence packs EVD-002 and EVD-004.', 'Attach evidence to upcoming RBI and PCI audits.'],
        'Reviewer: Internal Audit',
      ),
      context: { subject: 'Audit Traceability' },
    }),
    createArtifact({
      id: `${runId}-compliance`,
      name: 'Compliance_Traceability_Report.docx',
      generatedBy: 'Traceability AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      previewContent: `COMPLIANCE TRACEABILITY REPORT\n\nCompliance posture mapped to lineage:\n  RBI Digital Payments: Compliant (UPI chain)\n  ISO 27001: Compliant (KYC controls)\n  PCI-DSS 4.0: Gap (key rotation evidence pending)\n  DPSC: Gap (biometric privacy notice)\n\nCompliance readiness: 50% with 2 open gaps tied to controls CTL-003 and CTL-002.`,
      executiveSummary: 'Regulatory obligations are traceable to controls and evidence; two gaps (PCI key rotation, DPSC biometric privacy) are linked to specific controls for remediation.',
      context: { subject: 'Compliance Traceability' },
    }),
  ];
}

function workflowOrchestrationArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-status`,
      name: 'Workflow_Status_Report.docx',
      generatedBy: 'Orchestration AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `WORKFLOW STATUS REPORT\n\nActive workflows: 5 · Completed: 1\nStages in progress: Requirements 1, Architecture 1, Development 1, Testing 1, Release 1\nBlocked: 1 (KYC Architecture)\nSLA breaches: 2`,
      executiveSummary: 'Cross-hub orchestration shows UPI release at approval gate with two SLA breaches requiring executive attention.',
      context: { subject: 'Workflow Status' },
    }),
    createArtifact({
      id: `${runId}-lifecycle`,
      name: 'Lifecycle_Completion_Report.docx',
      generatedBy: 'Orchestration AI',
      fileType: 'docx',
      previewContent: `LIFECYCLE COMPLETION REPORT\n\nAverage completion: 68%\nFastest: UPI Limit Enhancement (85%)\nSlowest: KYC Onboarding (28%)\nBottleneck stages: Architecture (72h), Testing (52h)`,
      context: { subject: 'Lifecycle Completion' },
    }),
    createArtifact({
      id: `${runId}-approval-ready`,
      name: 'Approval_Readiness_Report.docx',
      generatedBy: 'Orchestration AI',
      fileType: 'docx',
      previewContent: `APPROVAL READINESS REPORT\n\nReady for approval: 1 (UPI Release 24.6)\nPending review: 1 (Biometric Login)\nBlocked: 1 (KYC Architecture)\nTraceability gaps: 2 workflows`,
      context: { subject: 'Approval Readiness' },
    }),
    createArtifact({
      id: `${runId}-delivery`,
      name: 'Executive_Delivery_Report.docx',
      generatedBy: 'Orchestration AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE DELIVERY REPORT\n\nPortfolio delivery health: 72%\nOn-time releases: 4 of 6\nApproval delays: 2\nRecommendation: Escalate WF-002 test remediation; unblock WF-003 NPCI integration`,
      executiveSummary: 'Executive delivery posture is stable with targeted escalations needed on mobile biometric and KYC architecture threads.',
      context: { subject: 'Executive Delivery' },
    }),
  ];
}

const BUILDERS: Record<HubKey, (runId: string) => Artifact[]> = {
  production: productionArtifacts,
  incidents: incidentsArtifacts,
  availability: availabilityArtifacts,
  capacity: capacityArtifacts,
  audit: auditArtifacts,
  compliance: complianceArtifacts,
  risk: riskArtifacts,
  evidence: evidenceArtifacts,
  'ai-use-case': aiUseCaseArtifacts,
  'ai-model-inventory': aiModelArtifacts,
  'ai-prompt': aiPromptArtifacts,
  'ai-risk': aiRiskHubArtifacts,
  'ai-controls': aiControlsArtifacts,
  'ai-incidents': aiIncidentsArtifacts,
  learning: learningArtifacts,
  'best-practices': bestPracticesArtifacts,
  'reusable-assets': reusableAssetsArtifacts,
  'lessons-learned': lessonsLearnedArtifacts,
  executive: executiveArtifacts,
  traceability: traceabilityArtifacts,
  'approval-workflow': approvalWorkflowArtifacts,
  rbac: rbacArtifacts,
  authentication: authenticationArtifacts,
  'workflow-orchestration': workflowOrchestrationArtifacts,
};

export const HUB_ARTIFACT_CONFIGS: Record<HubKey, HubArtifactConfig> = {
  production: {
    title: 'AI Production Reports',
    subtitle: 'Operational health and executive operations intelligence',
    generateLabel: 'Generate Production Reports',
    generatedBy: 'Operations AI',
    glow: 'blue',
    simulation: sim('Operations AI analyzing production telemetry...', ['Production Health Scan', 'Stability Analysis', 'Executive Summary Generation']),
    build: productionArtifacts,
  },
  incidents: {
    title: 'AI Incident Reports',
    subtitle: 'RCA, problem records, and prevention intelligence',
    generateLabel: 'Generate Incident Reports',
    generatedBy: 'Incident AI',
    glow: 'purple',
    simulation: sim('Incident AI correlating signals across payments...', ['Root Cause Analysis', 'Problem Record Creation', 'Trend Analysis', 'Prevention Recommendations']),
    build: incidentsArtifacts,
  },
  availability: {
    title: 'AI Availability Reports',
    subtitle: 'SLA compliance and service reliability',
    generateLabel: 'Generate Availability Reports',
    generatedBy: 'Availability AI',
    simulation: sim('Availability AI reviewing SLA telemetry...', ['SLA Compliance Check', 'Availability Assessment', 'Reliability Report']),
    build: availabilityArtifacts,
  },
  capacity: {
    title: 'AI Capacity Reports',
    subtitle: 'Growth forecast and infrastructure planning',
    generateLabel: 'Generate Capacity Reports',
    generatedBy: 'Capacity AI',
    simulation: sim('Capacity AI modeling UPI and mobile growth...', ['Capacity Assessment', 'Growth Forecast', 'Infrastructure Planning']),
    build: capacityArtifacts,
  },
  audit: {
    title: 'AI Audit Reports',
    subtitle: 'Audit readiness and control effectiveness',
    generateLabel: 'Generate Audit Reports',
    generatedBy: 'Audit AI',
    simulation: sim('Audit AI reviewing control evidence...', ['Readiness Assessment', 'Observation Summary', 'Control Effectiveness']),
    build: auditArtifacts,
  },
  compliance: {
    title: 'AI Compliance Reports',
    subtitle: 'RBI, PCI-DSS, ISO27001, and DPSC assessments',
    generateLabel: 'Generate Compliance Reports',
    generatedBy: 'Compliance AI',
    glow: 'purple',
    simulation: sim('Compliance AI mapping regulatory controls...', ['RBI Assessment', 'PCI-DSS Review', 'ISO27001 Mapping', 'Executive Summary']),
    build: complianceArtifacts,
  },
  risk: {
    title: 'AI Risk Reports',
    subtitle: 'Enterprise risk assessment and mitigation',
    generateLabel: 'Generate Risk Reports',
    generatedBy: 'Risk AI',
    simulation: sim('Risk AI analyzing enterprise risk register...', ['Enterprise Assessment', 'Register Summary', 'Mitigation Planning']),
    build: riskArtifacts,
  },
  evidence: {
    title: 'AI Evidence Reports',
    subtitle: 'Evidence collection and control validation',
    generateLabel: 'Generate Evidence Package',
    generatedBy: 'Evidence AI',
    simulation: sim('Evidence AI assembling audit packages...', ['Evidence Collection', 'Completeness Check', 'Control Validation']),
    build: evidenceArtifacts,
  },
  'ai-use-case': {
    title: 'AI Use Case Reports',
    subtitle: 'Assessment, value, and approval recommendations',
    generateLabel: 'Generate Use Case Reports',
    generatedBy: 'AI Governance AI',
    glow: 'purple',
    simulation: sim('AI Governance reviewing use case registry...', ['Use Case Assessment', 'Business Value Analysis', 'Approval Recommendation']),
    build: aiUseCaseArtifacts,
  },
  'ai-model-inventory': {
    title: 'AI Model Reports',
    subtitle: 'Inventory, fact sheets, and model risk',
    generateLabel: 'Generate Model Reports',
    generatedBy: 'Model Governance AI',
    simulation: sim('Model Governance AI scanning inventory...', ['Inventory Report', 'Fact Sheet Generation', 'Risk Assessment', 'Approval Summary']),
    build: aiModelArtifacts,
  },
  'ai-prompt': {
    title: 'AI Prompt Reports',
    subtitle: 'Prompt review, risk, and quality',
    generateLabel: 'Generate Prompt Reports',
    generatedBy: 'Prompt Governance AI',
    simulation: sim('Prompt Governance AI reviewing registry...', ['Prompt Review', 'Risk Assessment', 'Quality Report']),
    build: aiPromptArtifacts,
  },
  'ai-risk': {
    title: 'AI Risk Reports',
    subtitle: 'AI risk assessment and mitigation',
    generateLabel: 'Generate AI Risk Reports',
    generatedBy: 'AI Risk AI',
    simulation: sim('AI Risk agent analyzing model and prompt risks...', ['Risk Assessment', 'Risk Register Update', 'Mitigation Recommendations']),
    build: aiRiskHubArtifacts,
  },
  'ai-controls': {
    title: 'AI Controls Reports',
    subtitle: 'Control validation and compliance mapping',
    generateLabel: 'Generate AI Control Reports',
    generatedBy: 'AI Controls AI',
    simulation: sim('AI Controls agent validating guardrails...', ['Control Validation', 'Coverage Assessment', 'Compliance Mapping']),
    build: aiControlsArtifacts,
  },
  'ai-incidents': {
    title: 'AI Incident Reports',
    subtitle: 'AI incident RCA and corrective actions',
    generateLabel: 'Generate AI Incident Reports',
    generatedBy: 'AI Incident AI',
    simulation: sim('AI Incident agent investigating model incidents...', ['AI RCA', 'Investigation Report', 'Corrective Action Plan']),
    build: aiIncidentsArtifacts,
  },
  learning: {
    title: 'AI Learning Reports',
    subtitle: 'Learning paths and skill gap analysis',
    generateLabel: 'Generate Learning Reports',
    generatedBy: 'Learning AI',
    simulation: sim('Learning AI analyzing workforce skills...', ['Learning Path Analysis', 'Skill Gap Assessment']),
    build: learningArtifacts,
  },
  'best-practices': {
    title: 'AI Best Practice Reports',
    subtitle: 'Guides and recommended standards',
    generateLabel: 'Generate Best Practice Reports',
    generatedBy: 'Knowledge AI',
    simulation: sim('Knowledge AI compiling best practices...', ['Best Practice Guide', 'Standards Report']),
    build: bestPracticesArtifacts,
  },
  'reusable-assets': {
    title: 'AI Asset Reports',
    subtitle: 'Catalog and reusability assessment',
    generateLabel: 'Generate Asset Reports',
    generatedBy: 'Knowledge AI',
    simulation: sim('Knowledge AI indexing reusable assets...', ['Asset Catalog', 'Reusability Assessment']),
    build: reusableAssetsArtifacts,
  },
  'lessons-learned': {
    title: 'AI Lessons Learned Reports',
    subtitle: 'Post-incident and release learnings',
    generateLabel: 'Generate Lessons Learned Reports',
    generatedBy: 'Knowledge AI',
    simulation: sim('Knowledge AI synthesizing lessons...', ['Lessons Learned Report', 'Improvement Recommendations']),
    build: lessonsLearnedArtifacts,
  },
  executive: {
    title: 'AI Executive Reports',
    subtitle: 'Portfolio health, strategic risk, and board summaries',
    generateLabel: 'Generate Executive Reports',
    generatedBy: 'Executive AI',
    glow: 'purple',
    simulation: sim('Executive AI synthesizing portfolio intelligence...', ['Executive Summary', 'Portfolio Health', 'Strategic Risk', 'Board Summary']),
    build: executiveArtifacts,
  },
  traceability: {
    title: 'AI Traceability Reports',
    subtitle: 'Requirement, impact, audit, and compliance traceability',
    generateLabel: 'Generate Traceability Reports',
    generatedBy: 'Traceability AI',
    glow: 'purple',
    simulation: sim('Traceability AI walking the SDLC lineage graph...', ['Requirement Traceability', 'Impact Assessment', 'Audit Traceability', 'Compliance Traceability']),
    build: traceabilityArtifacts,
  },
  'approval-workflow': {
    title: 'AI Approval Workflow Reports',
    subtitle: 'Queue status, cycle metrics, and audit trail',
    generateLabel: 'Generate Approval Reports',
    generatedBy: 'Approval Workflow AI',
    glow: 'blue',
    simulation: sim('Approval Workflow AI analyzing review queue...', ['Decision Report', 'Review History', 'Escalation Summary', 'Audit Package']),
    build: approvalWorkflowArtifacts,
  },
  rbac: {
    title: 'AI RBAC Reports',
    subtitle: 'Access review, role assignments, and entitlement matrix',
    generateLabel: 'Generate RBAC Reports',
    generatedBy: 'RBAC AI',
    glow: 'purple',
    simulation: sim('RBAC AI analyzing entitlement catalog...', ['Access Review', 'Role Assignment', 'SoD Analysis', 'Entitlement Matrix']),
    build: rbacArtifacts,
  },
  authentication: {
    title: 'AI Authentication Reports',
    subtitle: 'Identity posture, access review, and authentication activity',
    generateLabel: 'Generate Authentication Reports',
    generatedBy: 'Authentication AI',
    glow: 'blue',
    simulation: sim('Authentication AI analyzing identity events...', ['Identity Report', 'Access Review', 'Activity Report']),
    build: authenticationArtifacts,
  },
  'workflow-orchestration': {
    title: 'AI Workflow Orchestration Reports',
    subtitle: 'Lifecycle status, completion, approval readiness, and executive delivery',
    generateLabel: 'Generate Orchestration Reports',
    generatedBy: 'Orchestration AI',
    glow: 'purple',
    simulation: sim('Orchestration AI analyzing cross-hub lifecycles...', ['Workflow Status', 'Lifecycle Completion', 'Approval Readiness', 'Executive Delivery']),
    build: workflowOrchestrationArtifacts,
  },
};

export function buildHubArtifacts(hubKey: HubKey, runId: string): Artifact[] {
  return BUILDERS[hubKey](runId);
}

export function getDemoArtifacts(hubKey: HubKey): Artifact[] {
  return BUILDERS[hubKey](`DEMO-${hubKey}`);
}
