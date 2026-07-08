import type { SimulationConfig } from '../hooks/useGenerationSimulation';
import type { Artifact } from '../types/artifacts';
import { buildSections, createArtifact } from './artifactBuilder';
import { createHubDocArtifact, hubSimulation, HUB_FEATURE } from './hubArtifactFactory';

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
  | 'workflow-orchestration'
  | 'audit-center'
  | 'notification-center'
  | 'persistence'
  | 'activity-center'
  | 'abac'
  | 'ai-copilot'
  | 'production-intelligence'
  | 'knowledge-center'
  | 'value-realization'
  | 'portfolio-governance'
  | 'application-portfolio'
  | 'architecture-repository'
  | 'technology-strategy'
  | 'transformation-pmo'
  | 'enterprise-risk';

export interface HubArtifactConfig {
  title: string;
  subtitle: string;
  generateLabel: string;
  generatedBy: string;
  glow?: 'blue' | 'purple';
  simulation: SimulationConfig;
  build: (runId: string) => Artifact[];
}

const FEATURE = HUB_FEATURE;

function sim(initial: string, activities: string[]): SimulationConfig {
  return hubSimulation(initial, activities);
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

function abacArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-assessment`,
      name: 'ABAC_Assessment_Report.docx',
      generatedBy: 'Security AI',
      fileType: 'docx',
      previewContent: `ABAC ASSESSMENT REPORT\n\nPolicies: 8 enabled\nCoverage: 100%\nRow filters: Active on 6 resource types\nViolations: 2 mock denials`,
      context: { subject: 'ABAC Assessment' },
    }),
    createArtifact({
      id: `${runId}-scope`,
      name: 'Access_Scope_Report.docx',
      generatedBy: 'Security AI',
      fileType: 'docx',
      previewContent: `ACCESS SCOPE REPORT\n\nGlobal: CIO, Auditor\nApplication: Application Owner\nPortfolio: Vertical Head\nDomain: Compliance Officer\nSecurity: CISO`,
      context: { subject: 'Access Scope' },
    }),
    createArtifact({
      id: `${runId}-ownership`,
      name: 'Domain_Ownership_Report.docx',
      generatedBy: 'Security AI',
      fileType: 'docx',
      previewContent: `DOMAIN OWNERSHIP REPORT\n\nPayments: Application Owner\nMobile/Net Banking: Vertical Head\nEnterprise: Compliance\nAll security domains: CISO`,
      context: { subject: 'Domain Ownership' },
    }),
    createArtifact({
      id: `${runId}-governance`,
      name: 'Security_Governance_Report.docx',
      generatedBy: 'Security AI',
      fileType: 'docx',
      previewContent: `SECURITY GOVERNANCE REPORT\n\nRBAC + ABAC hybrid model\nAttribute resolver: Active\nPolicy engine: 8 policies\nProduction readiness: 82%`,
      executiveSummary: 'Enterprise ABAC extends RBAC with domain-scoped row filters and attribute-based policy evaluation.',
      context: { subject: 'Security Governance' },
    }),
  ];
}

function activityCenterArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-activity`,
      name: 'Activity_Report.docx',
      generatedBy: 'Activity AI',
      fileType: 'docx',
      previewContent: `ACTIVITY REPORT\n\nTotal events: 250\nActivity records: 100\nCritical events: 18\nWorkflow events: 42\nAudit events: 38`,
      context: { subject: 'Platform Activity' },
    }),
    createArtifact({
      id: `${runId}-volume`,
      name: 'Event_Volume_Report.docx',
      generatedBy: 'Activity AI',
      fileType: 'docx',
      previewContent: `EVENT VOLUME REPORT\n\n7-day trend: stable\nPeak source: WorkflowOrchestration\n24h volume: 34 events\nUnique sources: 10`,
      context: { subject: 'Event Volume' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Activity_Summary.docx',
      generatedBy: 'Activity AI',
      fileType: 'docx',
      previewContent: `EXECUTIVE ACTIVITY SUMMARY\n\nPlatform event health: 94%\nCritical governance events: 6 open\nApproval activity: 28 events\nAudit lineage coverage: 87%`,
      executiveSummary: 'Enterprise event bus is operational with cross-linked workflow, notification, and audit lineage.',
      context: { subject: 'Executive Activity' },
    }),
    createArtifact({
      id: `${runId}-health`,
      name: 'Platform_Event_Health_Report.docx',
      generatedBy: 'Activity AI',
      fileType: 'docx',
      previewContent: `PLATFORM EVENT HEALTH REPORT\n\nEvent bus: In-memory (production-ready architecture)\nPublishers: 10 sources\nSubscribers: Notification bridge active\nFuture broker stubs: Ready`,
      context: { subject: 'Event Health' },
    }),
  ];
}

function persistenceArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-health`,
      name: 'Persistence_Health_Report.docx',
      generatedBy: 'Persistence AI',
      fileType: 'docx',
      previewContent: `PERSISTENCE HEALTH REPORT\n\nHealth Score: 96%\nActive Adapter: LocalStorage\nRepositories: 8 healthy\nTotal Records: 250+\nErrors: 0`,
      context: { subject: 'Persistence Health' },
    }),
    createArtifact({
      id: `${runId}-activity`,
      name: 'Repository_Activity_Report.docx',
      generatedBy: 'Persistence AI',
      fileType: 'docx',
      previewContent: `REPOSITORY ACTIVITY REPORT\n\nAuthRepository: 24 ops\nWorkflowRepository: 18 ops\nNotificationRepository: 12 ops\nAuditRepository: read-only mock\nTotal operations: 86`,
      context: { subject: 'Repository Activity' },
    }),
    createArtifact({
      id: `${runId}-storage`,
      name: 'Storage_Utilization_Report.docx',
      generatedBy: 'Persistence AI',
      fileType: 'docx',
      previewContent: `STORAGE UTILIZATION REPORT\n\nTotal storage: ~48 KB\nWorkflows: 18 KB\nNotifications: 22 KB\nAuthentication: 4 KB\nUtilization: 12% of demo quota`,
      context: { subject: 'Storage Utilization' },
    }),
    createArtifact({
      id: `${runId}-readiness`,
      name: 'Platform_Readiness_Report.docx',
      generatedBy: 'Persistence AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `PLATFORM READINESS REPORT\n\nPersistence abstraction: Complete\nAdapter pattern: Implemented\nFuture API/DB stubs: Ready\nMigration from direct localStorage: Complete\nProduction cutover readiness: 78%`,
      executiveSummary: 'Enterprise persistence layer is production-ready architecturally with LocalStorage demo adapter and future API/DB stubs for cutover.',
      context: { subject: 'Platform Readiness' },
    }),
  ];
}

function notificationCenterArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-summary`,
      name: 'Notification_Summary_Report.docx',
      generatedBy: 'Notification AI',
      fileType: 'docx',
      previewContent: `NOTIFICATION SUMMARY REPORT\n\nTotal notifications: 100\nOpen: 42 · Critical: 18 · Escalated: 12\nUnread: 28 · Resolved: 35\nDelivery rate (mock): 94%`,
      context: { subject: 'Notification Summary' },
    }),
    createArtifact({
      id: `${runId}-escalation`,
      name: 'Escalation_Report.docx',
      generatedBy: 'Notification AI',
      fileType: 'docx',
      riskRating: 'High',
      previewContent: `ESCALATION REPORT\n\nActive escalations: 30\nExecutive level: 4\nTriggers: SLA Breach (8), Critical Finding (6), Workflow Blocker (5)\nAvg time to escalate: 18h`,
      context: { subject: 'Escalation' },
    }),
    createArtifact({
      id: `${runId}-trend`,
      name: 'Alert_Trend_Report.docx',
      generatedBy: 'Notification AI',
      fileType: 'docx',
      previewContent: `ALERT TREND REPORT\n\n6-month escalation trend: +100%\nTop sources: Approval Workflow, Audit Findings, AI Governance\nSeverity mix: 18 critical, 24 high, 35 medium`,
      context: { subject: 'Alert Trend' },
    }),
    createArtifact({
      id: `${runId}-exec-risk`,
      name: 'Executive_Risk_Report.docx',
      generatedBy: 'Notification AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `EXECUTIVE RISK REPORT\n\nRisk hotspots: Payments, Mobile Banking, AI/ML\nPending executive actions: 6\nSLA breaches requiring CIO attention: 3`,
      executiveSummary: 'Enterprise notification posture reflects elevated risk in approval bottlenecks and AI governance incidents with targeted executive escalations.',
      context: { subject: 'Executive Risk' },
    }),
  ];
}

function auditCenterArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-findings`,
      name: 'Audit_Findings_Report.docx',
      generatedBy: 'Audit Center AI',
      fileType: 'docx',
      previewContent: `AUDIT FINDINGS REPORT\n\nTotal findings: 40\nOpen: 18 · Critical: 3 · High: 6 · Overdue: 4\n\nTop domains: Payments, Mobile Banking, KYC/AML\nRemediation ETA: 45 days`,
      riskRating: 'High',
      context: { subject: 'Audit Findings' },
    }),
    createArtifact({
      id: `${runId}-coverage`,
      name: 'Evidence_Coverage_Report.docx',
      generatedBy: 'Audit Center AI',
      fileType: 'docx',
      previewContent: `EVIDENCE COVERAGE REPORT\n\nTotal evidence: 75\nApproved: 65% · Pending Review: 22%\nLifecycle stages with gaps: Architecture, Production\nCoverage score: 87%`,
      context: { subject: 'Evidence Coverage' },
    }),
    createArtifact({
      id: `${runId}-compliance`,
      name: 'Compliance_Assessment_Report.docx',
      generatedBy: 'Audit Center AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `COMPLIANCE ASSESSMENT REPORT\n\nCompliance coverage: 78%\nControl coverage: 91%\nRegulatory domains: RBI, PCI-DSS, ISO 27001, DPSC\nOpen observations: 12`,
      context: { subject: 'Compliance Assessment' },
    }),
    createArtifact({
      id: `${runId}-readiness`,
      name: 'Audit_Readiness_Package.zip',
      generatedBy: 'Audit Center AI',
      fileType: 'xlsx',
      previewContent: `AUDIT READINESS PACKAGE\n\nReadiness score: 82%\nEvidence packs: 75\nFindings register: 40\nObservations: 25\nTimeline events: 64`,
      context: { subject: 'Audit Readiness' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Audit_Summary.docx',
      generatedBy: 'Audit Center AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `EXECUTIVE AUDIT SUMMARY\n\nAudit health: 82% · Compliance risk: Elevated (Payments)\nEvidence gaps: PCI key rotation, KYC retention\nControl gaps: Segregation of duties, AI bias testing\nRecommended: Close 4 overdue findings, complete WF-001 evidence`,
      executiveSummary: 'Enterprise audit posture supports regulatory exams with focused remediation on payment card and data privacy controls.',
      context: { subject: 'Executive Audit' },
    }),
  ];
}

function auditArtifacts(runId: string): Artifact[] {
  return [
    createHubDocArtifact({
      runId,
      suffix: 'ready',
      name: 'Audit_Readiness_Report.docx',
      generatedBy: 'Audit AI',
      approvalStatus: 'Pending Review',
      previewContent: `AUDIT READINESS REPORT\n\nScope: IT General Controls · Payments · AML/KYC\nReadiness Score: 88%\nOpen observations: 7 · Critical: 0 · High: 2`,
      contextSubject: 'Audit Readiness',
    }),
    createHubDocArtifact({
      runId,
      suffix: 'obs',
      name: 'Audit_Observation_Summary.docx',
      generatedBy: 'Audit AI',
      riskRating: 'High',
      previewContent: `AUDIT OBSERVATION SUMMARY\n\nOBS-001: Privileged access review lag (High)\nOBS-002: KYC document retention incomplete (Medium)\nOBS-003: PCI key rotation evidence gap (High)\n\nRemediation ETA: 45 days`,
      contextSubject: 'Audit Observations',
    }),
    createHubDocArtifact({
      runId,
      suffix: 'controls',
      name: 'Control_Effectiveness_Report.docx',
      generatedBy: 'Audit AI',
      previewContent: `CONTROL EFFECTIVENESS REPORT\n\nControls tested: 64\nEffective: 58 · Partially effective: 4 · Ineffective: 2\n\nAML transaction monitoring control rated Effective with enhancement recommendation.`,
      contextSubject: 'Control Effectiveness',
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
  return workflowOrchestrationArtifacts(runId);
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
      id: `${runId}-lifecycle-approval`,
      name: 'Lifecycle_Approval_Report.docx',
      generatedBy: 'Unified Lifecycle AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `LIFECYCLE APPROVAL REPORT\n\nUnified model: workflow + approval gates\nActive gates: 5 · Under Review: 2 · Escalated: 1\nEmbedded approval IDs linked to workflow instances\nSLA breaches: 2`,
      executiveSummary: 'Single lifecycle model embeds approval state in workflow instances with synchronized gate transitions.',
      context: { subject: 'Lifecycle Approval' },
    }),
    createArtifact({
      id: `${runId}-delivery-ready`,
      name: 'Delivery_Readiness_Report.docx',
      generatedBy: 'Unified Lifecycle AI',
      fileType: 'docx',
      previewContent: `DELIVERY READINESS REPORT\n\nDelivery risk: 2 high/critical\nReady for next stage: 1\nBlocked/Escalated: 1\nAverage completion: 68%`,
      context: { subject: 'Delivery Readiness' },
    }),
    createArtifact({
      id: `${runId}-release-ready`,
      name: 'Release_Readiness_Report.docx',
      generatedBy: 'Unified Lifecycle AI',
      fileType: 'docx',
      previewContent: `RELEASE READINESS REPORT\n\nUPI Release 24.6: Under Review (CIO)\nGo/No-Go evidence: RBI notification attached\nTraceability: linked BR-001 → REL-246`,
      context: { subject: 'Release Readiness' },
    }),
    createArtifact({
      id: `${runId}-exec-gov`,
      name: 'Executive_Governance_Report.docx',
      generatedBy: 'Unified Lifecycle AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE GOVERNANCE REPORT\n\nApproval bottlenecks: 1 (Release)\nWorkflow bottlenecks: Architecture (72h)\nUnified SLA breaches: 2\nDelivery risk items: 2\nRecommendation: Escalate WF-002, unblock WF-003`,
      executiveSummary: 'Executive governance posture reflects unified approval-workflow lifecycle with targeted escalations.',
      context: { subject: 'Executive Governance' },
    }),
  ];
}

function aiCopilotArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-exec-advisory`,
      name: 'Executive_Advisory_Report.docx',
      generatedBy: 'Delivery Copilot AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE ADVISORY REPORT\n\nPortfolio health: 78%\nActive recommendations: 100\nCritical risks: 12\nGovernance hotspots: 3\nDelivery bottlenecks: Architecture (72h), Release approvals\nCIO summary: Focus on UPI release readiness and audit evidence gaps`,
      executiveSummary: 'AI Delivery Copilot synthesizes portfolio health, risks, and governance hotspots into executive advisory actions.',
      context: { subject: 'Executive Advisory' },
    }),
    createArtifact({
      id: `${runId}-project-health`,
      name: 'Project_Health_Report.docx',
      generatedBy: 'Delivery Copilot AI',
      fileType: 'docx',
      previewContent: `PROJECT HEALTH REPORT\n\nProjects analyzed: 50\nAverage health score: 76%\nAt-risk projects: 14\nTop risk domains: Testing, Release\nRecommendation: Prioritize regression automation for Payments portfolio`,
      context: { subject: 'Project Health' },
    }),
    createArtifact({
      id: `${runId}-delivery-risk`,
      name: 'Delivery_Risk_Assessment.docx',
      generatedBy: 'Delivery Copilot AI',
      fileType: 'docx',
      previewContent: `DELIVERY RISK ASSESSMENT\n\nHigh delivery risk: 8 projects\nTesting risk elevated: 11\nAudit risk: 6\nRelease risk: 5\nMitigation: Escalate blocked workflows, close evidence gaps`,
      context: { subject: 'Delivery Risk' },
    }),
    createArtifact({
      id: `${runId}-release-ready`,
      name: 'Release_Readiness_Report.docx',
      generatedBy: 'Delivery Copilot AI',
      fileType: 'docx',
      previewContent: `RELEASE READINESS REPORT\n\nGo recommendations: 32\nConditional go: 12\nNo-go: 6\nAvg readiness score: 74%\nRollback readiness: 81%\nProduction risk score: 28% (lower is better)`,
      context: { subject: 'Release Readiness' },
    }),
    createArtifact({
      id: `${runId}-improvement`,
      name: 'Continuous_Improvement_Plan.docx',
      generatedBy: 'Delivery Copilot AI',
      fileType: 'docx',
      previewContent: `CONTINUOUS IMPROVEMENT PLAN\n\nImprovement actions: 75\nPredicted quality gain: +18%\nPredicted risk reduction: -22%\nTop themes: Test automation, NFR coverage, Architecture resiliency\nBacklog prioritized by impact × effort`,
      executiveSummary: 'Continuous improvement plan derived from SDLC learning patterns and copilot rule analysis.',
      context: { subject: 'Continuous Improvement' },
    }),
  ];
}

function productionIntelligenceArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-health`,
      name: 'Production_Health_Report.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      previewContent: `PRODUCTION HEALTH REPORT\n\nApplications monitored: 50\nAverage availability: 99.2%\nOpen incidents: 60\nCritical incidents: 150\nProduction risk score: 42%\nTop at-risk: UPI Gateway, Fraud Engine, Mobile SDK`,
      context: { subject: 'Production Health' },
    }),
    createArtifact({
      id: `${runId}-incidents`,
      name: 'Incident_Analysis_Report.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      previewContent: `INCIDENT ANALYSIS REPORT\n\nTotal incidents: 300\nOpen: 60 · Resolved: 180 · Mitigated: 60\nTop domains: Payments, Mobile Banking\nAvg financial impact: ₹62,500 per incident\nLinked requirements: BR-001 through BR-004`,
      context: { subject: 'Incident Analysis' },
    }),
    createArtifact({
      id: `${runId}-leakage`,
      name: 'Defect_Leakage_Assessment.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      previewContent: `DEFECT LEAKAGE ASSESSMENT\n\nTotal defects: 200\nEscaped to production: 133\nLeakage rate: 67%\nTop escape stage: Testing (42)\nTop applications: UPI Gateway, Payment Switch\nRecommendation: Expand regression automation`,
      context: { subject: 'Defect Leakage' },
    }),
    createArtifact({
      id: `${runId}-customer`,
      name: 'Customer_Impact_Report.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      previewContent: `CUSTOMER IMPACT REPORT\n\nCustomer signals: 150\nFormal complaints: 30\nTop pain points: Reliability, Performance\nMost impacted: UPI Gateway, Mobile SDK\nNPS trend: declining in Payments domain`,
      context: { subject: 'Customer Impact' },
    }),
    createArtifact({
      id: `${runId}-exec-review`,
      name: 'Executive_Production_Review.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE PRODUCTION REVIEW\n\nProduction risk elevated in Payments portfolio\n42 open incidents require war-room coordination\n100 feedback recommendations generated for SDLC improvement\nCIO action: Prioritize UPI timeout remediation and release gate strengthening`,
      executiveSummary: 'Executive production review connecting incidents, customer impact, and SDLC improvement recommendations.',
      context: { subject: 'Executive Production Review' },
    }),
    createArtifact({
      id: `${runId}-rca`,
      name: 'RCA_Summary_Report.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      previewContent: `RCA SUMMARY REPORT\n\nRCA records: 100\nTop patterns: Testing gap (28%), Requirement quality (22%), Release error (18%)\nRecurring causes: Missing timeout handling, Insufficient regression coverage\nPredicted risks: UPI peak-window recurrence (72%)`,
      context: { subject: 'RCA Summary' },
    }),
    createArtifact({
      id: `${runId}-improvement`,
      name: 'Continuous_Improvement_Report.docx',
      generatedBy: 'Production Intelligence AI',
      fileType: 'docx',
      previewContent: `CONTINUOUS IMPROVEMENT REPORT\n\nFeedback recommendations: 100\nDomains: Requirements, Architecture, Development, Testing, Release, Governance, Audit\nFed into AI Delivery Copilot for cross-hub action tracking\nTop action: Strengthen NFR acceptance criteria for payment flows`,
      executiveSummary: 'Production feedback loop generates SDLC improvement recommendations integrated with AI Delivery Copilot.',
      context: { subject: 'Continuous Improvement' },
    }),
  ];
}

function knowledgeCenterArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-coverage`,
      name: 'Knowledge_Coverage_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `KNOWLEDGE COVERAGE REPORT\n\nTotal artifacts: 725\nLessons learned: 200\nBest practices: 150\nArchitecture patterns: 100\nRCA articles: 100\nPlaybooks: 75\nControls: 100\nCoverage: 97%`,
      context: { subject: 'Knowledge Coverage' },
    }),
    createArtifact({
      id: `${runId}-lessons`,
      name: 'Lessons_Learned_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `LESSONS LEARNED REPORT\n\n200 institutional lessons cataloged\nTop categories: incident (42), audit (35), release (28)\nHighest reuse: UPI timeout lesson (34×)\nLinked to production incidents and audit findings`,
      context: { subject: 'Lessons Learned' },
    }),
    createArtifact({
      id: `${runId}-patterns`,
      name: 'Architecture_Pattern_Catalog.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `ARCHITECTURE PATTERN CATALOG\n\n100 patterns across microservices, event-driven, API security, resilience, payments, UPI, KYC, AML\nTop adoption: circuit breaker pattern (38×)\nAnti-patterns documented for each entry`,
      context: { subject: 'Architecture Patterns' },
    }),
    createArtifact({
      id: `${runId}-controls`,
      name: 'Control_Library_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `CONTROL LIBRARY REPORT\n\n100 reusable controls\nFrameworks: RBI, PCI-DSS, ISO 27001, SOC 2, DPSC\nMost reused: Payment API timeout guard (52×)\nAvg effectiveness: 84%`,
      context: { subject: 'Control Library' },
    }),
    createArtifact({
      id: `${runId}-rca`,
      name: 'RCA_Knowledge_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `RCA KNOWLEDGE REPORT\n\n100 RCA articles from production, audit, control failures, release failures, security incidents\nTop root cause: insufficient test coverage\nPreventive actions linked to playbooks`,
      context: { subject: 'RCA Knowledge' },
    }),
    createArtifact({
      id: `${runId}-adoption`,
      name: 'Learning_Adoption_Report.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      previewContent: `LEARNING ADOPTION REPORT\n\nAvg best practice adoption: 67%\nPlaybook reuse trend: +18% QoQ\n60 learning recommendations from integrated hubs\nTop playbook: release readiness (39×)`,
      context: { subject: 'Learning Adoption' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Knowledge_Summary.docx',
      generatedBy: 'Knowledge AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE KNOWLEDGE SUMMARY\n\nKnowledge coverage: 97%\nKnowledge reuse index: 12\nTop risk themes: testing gaps, requirement quality\nInstitutional mandate: never solve the same problem twice\n60 active learning recommendations`,
      executiveSummary: 'Enterprise knowledge center transforms every SDLC signal into reusable organizational intelligence.',
      context: { subject: 'Executive Knowledge Summary' },
    }),
  ];
}

function valueRealizationArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-roi`,
      name: 'Executive_ROI_Report.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE ROI REPORT\n\nAnnual value: ₹12.4M\n3-year projected: ₹38.6M\nROI: 247%\nPayback: 8 months\nHours saved: 84,200\nFTE equivalent: 44.1`,
      executiveSummary: 'ADIP delivers 247% ROI with measurable productivity, quality, and governance improvements.',
      context: { subject: 'Executive ROI' },
    }),
    createArtifact({
      id: `${runId}-scorecard`,
      name: 'Transformation_Scorecard.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      previewContent: `TRANSFORMATION SCORECARD\n\nOverall enterprise score: 77/100\nSDLC: 78 · Governance: 82 · Audit: 75\nAI: 71 · Operational: 80 · Transformation: 76`,
      context: { subject: 'Transformation Scorecard' },
    }),
    createArtifact({
      id: `${runId}-value`,
      name: 'Value_Realization_Report.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      previewContent: `VALUE REALIZATION REPORT\n\n100 programs · 500 projects · 10 portfolios · 5 business units\nAnnual value realized across all SDLC domains\nCost avoidance: ₹4.2M`,
      context: { subject: 'Value Realization' },
    }),
    createArtifact({
      id: `${runId}-business-case`,
      name: 'AI_SDLC_Business_Case.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `AI SDLC BUSINESS CASE\n\nExecutive narrative: ADIP transforms banking software delivery\nBenefits: 38% productivity · 62% risk reduction · 61% faster approvals\nFinancial: ₹12.4M annual · ₹38.6M 3-year`,
      executiveSummary: 'Complete business case for AI-powered SDLC transformation.',
      context: { subject: 'AI SDLC Business Case' },
    }),
    createArtifact({
      id: `${runId}-productivity`,
      name: 'Productivity_Improvement_Report.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      previewContent: `PRODUCTIVITY IMPROVEMENT REPORT\n\nTesting: 38% gain · Development: 35% · Knowledge: 45%\n84,200 hours saved across 9 SDLC domains`,
      context: { subject: 'Productivity Improvement' },
    }),
    createArtifact({
      id: `${runId}-governance`,
      name: 'Governance_Efficiency_Report.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      previewContent: `GOVERNANCE EFFICIENCY REPORT\n\nApproval cycle: -61% · Control coverage: 82%\nEvidence readiness: 74% · Compliance: 78%`,
      context: { subject: 'Governance Efficiency' },
    }),
    createArtifact({
      id: `${runId}-audit`,
      name: 'Audit_Efficiency_Report.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      previewContent: `AUDIT EFFICIENCY REPORT\n\nAudit prep: -58% · Evidence collection: -60%\nObservations: -42% · Finding closure: +55% faster`,
      context: { subject: 'Audit Efficiency' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Presentation_Summary.docx',
      generatedBy: 'Value Realization AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BOARD PRESENTATION SUMMARY\n\nADIP: Executive business case engine for AI SDLC\nProven ROI · Transformation maturity 77/100\nRecommendation: Expand AI SDLC coverage to 85%`,
      executiveSummary: 'Board-ready summary of ADIP value realization and transformation progress.',
      context: { subject: 'Board Presentation' },
    }),
  ];
}

function portfolioGovernanceArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-portfolio-review`,
      name: 'Portfolio_Review_Report.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `PORTFOLIO REVIEW REPORT\n\n10 portfolios · 25 programs · 100 active projects\nPortfolio health: 74% · Strategic alignment: 78%\nDemand backlog: 142 requests · Funding utilization: 84%`,
      executiveSummary: 'Quarterly portfolio review with health scores, alignment gaps, and rebalancing recommendations.',
      context: { subject: 'Portfolio Review' },
    }),
    createArtifact({
      id: `${runId}-investment-gov`,
      name: 'Investment_Governance_Report.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      previewContent: `INVESTMENT GOVERNANCE REPORT\n\n120 funding requests · ₹142M approved\nSteering committee decisions · ROI thresholds · Kill/hold recommendations`,
      context: { subject: 'Investment Governance' },
    }),
    createArtifact({
      id: `${runId}-capacity`,
      name: 'Capacity_Planning_Report.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      previewContent: `CAPACITY PLANNING REPORT\n\n500 resources · 82% avg utilization\nQ3 bottleneck forecast: architects, data engineers\n14% capacity gap in Digital Channels`,
      context: { subject: 'Capacity Planning' },
    }),
    createArtifact({
      id: `${runId}-demand-priority`,
      name: 'Demand_Prioritization_Report.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      previewContent: `DEMAND PRIORITIZATION REPORT\n\n200 demands ranked by strategic alignment and ROI\n11 duplicates flagged · Top 15 fast-track candidates`,
      context: { subject: 'Demand Prioritization' },
    }),
    createArtifact({
      id: `${runId}-roadmap`,
      name: 'Strategic_Roadmap.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `STRATEGIC ROADMAP\n\n25 programs across 8 strategic objectives\n2025-2027 delivery timeline · Dependencies mapped`,
      context: { subject: 'Strategic Roadmap' },
    }),
    createArtifact({
      id: `${runId}-benefits`,
      name: 'Benefits_Realization_Report.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      previewContent: `BENEFITS REALIZATION REPORT\n\nBenefits realization: 38% of forecast\n8 projects below threshold · ₹6.8M recovery opportunity`,
      context: { subject: 'Benefits Realization' },
    }),
    createArtifact({
      id: `${runId}-steering`,
      name: 'Executive_Steering_Pack.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE STEERING PACK\n\nPortfolio health · Funding decisions · Capacity risks\nAI recommendations · Kill candidates · Duplicate initiatives`,
      executiveSummary: 'Steering committee pack for investment governance decisions.',
      context: { subject: 'Executive Steering Pack' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Portfolio_Summary.docx',
      generatedBy: 'Portfolio Governance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BOARD PORTFOLIO SUMMARY\n\nTransformation progress: 72%\nIdea → Demand → Funding → Portfolio → SDLC → Production → Value\nRecommendation: Approve ₹4.2M incremental for Regulatory Compliance`,
      executiveSummary: 'Board-ready portfolio summary with investment efficiency and transformation progress.',
      context: { subject: 'Board Portfolio Summary' },
    }),
  ];
}

function applicationPortfolioArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-portfolio`,
      name: 'Application_Portfolio_Report.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `APPLICATION PORTFOLIO REPORT\n\n300 applications · 20 domains · 10 portfolios · 5 business units\nApplication health: 74% · 48 critical apps · Annual cost: ₹143M`,
      executiveSummary: 'Complete application portfolio inventory and health assessment for CIO review.',
      context: { subject: 'Application Portfolio Report' },
    }),
    createArtifact({
      id: `${runId}-tech-health`,
      name: 'Technology_Health_Assessment.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      previewContent: `TECHNOLOGY HEALTH ASSESSMENT\n\n50 technology stacks · 38% obsolescence risk\nEOL runtimes: Java 8, .NET 4.8, Mainframe COBOL flagged`,
      context: { subject: 'Technology Health Assessment' },
    }),
    createArtifact({
      id: `${runId}-debt`,
      name: 'Technical_Debt_Report.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      previewContent: `TECHNICAL DEBT REPORT\n\n150 debt items · Portfolio index: 42/100\n14 tier-1 apps with debt >60 · Prioritized remediation plan`,
      context: { subject: 'Technical Debt Report' },
    }),
    createArtifact({
      id: `${runId}-modernization`,
      name: 'Modernization_Roadmap.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `MODERNIZATION ROADMAP\n\n100 opportunities · ₹14.1M rationalization savings\n24 priority candidates for cloud-native refactor`,
      context: { subject: 'Modernization Roadmap' },
    }),
    createArtifact({
      id: `${runId}-cloud`,
      name: 'Cloud_Readiness_Assessment.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      previewContent: `CLOUD READINESS ASSESSMENT\n\n100 assessments · Enterprise score: 68%\n42 rehost · 28 replatform · 18 refactor candidates`,
      context: { subject: 'Cloud Readiness Assessment' },
    }),
    createArtifact({
      id: `${runId}-ai`,
      name: 'AI_Readiness_Assessment.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      previewContent: `AI READINESS ASSESSMENT\n\n100 assessments · Enterprise score: 61%\nTop use cases: fraud detection, document AI, chatbot`,
      context: { subject: 'AI Readiness Assessment' },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Application_Risk_Report.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      previewContent: `APPLICATION RISK REPORT\n\n200 technology risks · 38 critical\nCore Banking Renewal highest risk density`,
      context: { subject: 'Application Risk Report' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_APM_Summary.docx',
      generatedBy: 'APM AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE APM SUMMARY\n\nSingle system of record for 300 banking applications\nRetire 12 apps · Consolidate 8 duplicates · Modernize 24 candidates\nRecommendation: Board approval for ₹4.2M modernization wave`,
      executiveSummary: 'Board-ready application portfolio summary with rationalization and modernization recommendations.',
      context: { subject: 'Executive APM Summary' },
    }),
  ];
}

function architectureRepositoryArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-review`,
      name: 'Architecture_Review_Report.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `ARCHITECTURE REVIEW REPORT\n\n100 reviews · 24 in queue · 31 open findings\nARB throughput improving · Conditional approvals: 12`,
      executiveSummary: 'Architecture Review Board summary of reviews, decisions, and findings.',
      context: { subject: 'Architecture Review Report' },
    }),
    createArtifact({
      id: `${runId}-compliance`,
      name: 'Architecture_Compliance_Report.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      previewContent: `ARCHITECTURE COMPLIANCE REPORT\n\nStandards compliance: 72% · 14 active exceptions\nNon-compliant apps prioritized for remediation`,
      context: { subject: 'Architecture Compliance Report' },
    }),
    createArtifact({
      id: `${runId}-standards`,
      name: 'Technology_Standards_Assessment.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      previewContent: `TECHNOLOGY STANDARDS ASSESSMENT\n\n100 standards · 8 architecture principles\nAPI-first 78% · Secure-by-Design 82% adherence`,
      context: { subject: 'Technology Standards Assessment' },
    }),
    createArtifact({
      id: `${runId}-debt`,
      name: 'Architecture_Debt_Report.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      previewContent: `ARCHITECTURE DEBT REPORT\n\n150 debt items · 18 platforms EOS/EOL\nMainframe and middleware obsolescence prioritized`,
      context: { subject: 'Architecture Debt Report' },
    }),
    createArtifact({
      id: `${runId}-modernization`,
      name: 'Modernization_Roadmap.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `MODERNIZATION ROADMAP\n\n22 platforms flagged for modernization wave\nConsolidate 8 integration platforms to 2 strategic gateways`,
      context: { subject: 'Modernization Roadmap' },
    }),
    createArtifact({
      id: `${runId}-cloud`,
      name: 'Cloud_Architecture_Assessment.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      previewContent: `CLOUD ARCHITECTURE ASSESSMENT\n\nCloud readiness: 66% · 50 cloud services catalogued\n38 apps ready for cloud-native refactor (REF-02)`,
      context: { subject: 'Cloud Architecture Assessment' },
    }),
    createArtifact({
      id: `${runId}-ai`,
      name: 'AI_Architecture_Assessment.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      previewContent: `AI ARCHITECTURE ASSESSMENT\n\nAI readiness: 60% · Responsible-AI aligned\nFraud/AML align to REF-05 streaming reference`,
      context: { subject: 'AI Architecture Assessment' },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Architecture_Risk_Assessment.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      previewContent: `ARCHITECTURE RISK ASSESSMENT\n\n200 integrations assessed · high-risk point-to-point flows\nReplace batch/file flows with event-driven patterns`,
      context: { subject: 'Architecture Risk Assessment' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Architecture_Summary.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE ARCHITECTURE SUMMARY\n\nAuthoritative EA system of record · 100 capabilities · 300 apps\nArchitecture health 78% · Reference adoption 62%`,
      executiveSummary: 'Board-ready enterprise architecture posture summary.',
      context: { subject: 'Executive Architecture Summary' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Architecture_Report.docx',
      generatedBy: 'Architecture AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BOARD ARCHITECTURE REPORT\n\nStrategic architecture posture, debt reduction, and modernization\nRecommendation: approve modernization wave and obsolescence retirement`,
      executiveSummary: 'Board pack covering architecture strategy, debt, and modernization investment.',
      context: { subject: 'Board Architecture Report' },
    }),
  ];
}

function technologyStrategyArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-strategy`,
      name: 'Technology_Strategy_Report.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `TECHNOLOGY STRATEGY REPORT\n\n200 technologies · 50 strategic platforms · 100 vendor products\nTechnology health: 76% · Standards adoption: 71%`,
      executiveSummary: 'Executive technology strategy and posture for CIO/CTO review.',
      context: { subject: 'Technology Strategy Report' },
    }),
    createArtifact({
      id: `${runId}-standards`,
      name: 'Technology_Standards_Catalog.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      previewContent: `TECHNOLOGY STANDARDS CATALOG\n\n100 standards across 10 categories\nMandatory API, security, cloud, and AI standards`,
      context: { subject: 'Technology Standards Catalog' },
    }),
    createArtifact({
      id: `${runId}-roadmap`,
      name: 'Technology_Roadmap.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `TECHNOLOGY ROADMAP\n\n5-year roadmap · 100 modernization initiatives across 3 waves\nModernization progress: 58%`,
      context: { subject: 'Technology Roadmap' },
    }),
    createArtifact({
      id: `${runId}-cloud`,
      name: 'Cloud_Strategy_Assessment.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      previewContent: `CLOUD STRATEGY ASSESSMENT\n\nCloud adoption: 62% · 50 cloud platforms\nStandardize on 2 strategic providers · optimize spend`,
      context: { subject: 'Cloud Strategy Assessment' },
    }),
    createArtifact({
      id: `${runId}-ai`,
      name: 'AI_Platform_Strategy.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      previewContent: `AI PLATFORM STRATEGY\n\nAI platform adoption: 48% · 50 AI platforms\nGoverned LLM + vector-DB + ML-Ops stack`,
      context: { subject: 'AI Platform Strategy' },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Technology_Risk_Assessment.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      previewContent: `TECHNOLOGY RISK ASSESSMENT\n\n150 technology risks · obsolescence, lock-in, security, skills\nTechnology debt index: 34`,
      context: { subject: 'Technology Risk Assessment' },
    }),
    createArtifact({
      id: `${runId}-modernization`,
      name: 'Modernization_Roadmap.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `MODERNIZATION ROADMAP\n\n22 technologies flagged · 3 waves · ₹4.2B investment\nMainframe decomposition and Java/cloud uplift prioritized`,
      context: { subject: 'Modernization Roadmap' },
    }),
    createArtifact({
      id: `${runId}-vendor`,
      name: 'Vendor_Risk_Assessment.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      previewContent: `VENDOR RISK ASSESSMENT\n\nVendor concentration: 38% (top 3) · 100 products\nExit strategy for 5 high-lock-in vendors`,
      context: { subject: 'Vendor Risk Assessment' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Technology_Summary.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE TECHNOLOGY SUMMARY\n\nExecutive technology planning posture\nConsolidate 8 platforms · retire 18 technologies · invest in strategic stack`,
      executiveSummary: 'Board-ready technology strategy posture and investment priorities.',
      context: { subject: 'Executive Technology Summary' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Technology_Presentation.docx',
      generatedBy: 'Technology Strategy AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BOARD TECHNOLOGY PRESENTATION\n\nTechnology strategy, roadmap, cloud and AI posture, modernization investment\nRecommendation: approve ₹4.2B FY26–FY28 modernization program`,
      executiveSummary: 'Board presentation covering technology strategy, roadmap, and investment.',
      context: { subject: 'Board Technology Presentation' },
    }),
  ];
}

function transformationPmoArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-health`,
      name: 'Transformation_Health_Report.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `TRANSFORMATION HEALTH REPORT\n\n50 programs · 200 initiatives · 5 business units\nTransformation health: 74% · Program delivery: 68%`,
      executiveSummary: 'Enterprise transformation health and delivery posture for executive review.',
      context: { subject: 'Transformation Health Report' },
    }),
    createArtifact({
      id: `${runId}-steering`,
      name: 'Executive_Steering_Report.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE STEERING REPORT\n\n9 at-risk programs · 14 blocked dependencies · 11 at-risk commitments\nDecisions required for recovery and re-sequencing`,
      executiveSummary: 'Steering committee pack with decisions, risks, and escalations.',
      context: { subject: 'Executive Steering Report' },
    }),
    createArtifact({
      id: `${runId}-program`,
      name: 'Program_Status_Report.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      previewContent: `PROGRAM STATUS REPORT\n\n50 transformation programs · status, health, completion, benefit\nMilestone completion: 71%`,
      context: { subject: 'Program Status Report' },
    }),
    createArtifact({
      id: `${runId}-objective`,
      name: 'Strategic_Objective_Report.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      previewContent: `STRATEGIC OBJECTIVE REPORT\n\n20 objectives across 5 strategic pillars\nObjective achievement: 62% · OKR key-result tracking`,
      context: { subject: 'Strategic Objective Report' },
    }),
    createArtifact({
      id: `${runId}-benefits`,
      name: 'Benefits_Realization_Report.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BENEFITS REALIZATION REPORT\n\n100 benefits · realization 58% · ₹2.4B unrealized\nRevenue, cost, risk, CX, and efficiency benefits tracked`,
      context: { subject: 'Benefits Realization Report' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Transformation_Pack.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BOARD TRANSFORMATION PACK\n\nBoard readiness: 78% · transformation ROI: 182%\nStrategy-to-value narrative with commitments and benefits`,
      executiveSummary: 'Board-ready transformation pack covering health, benefits, risks, and commitments.',
      context: { subject: 'Board Transformation Pack' },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Transformation_Risk_Report.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      previewContent: `TRANSFORMATION RISK REPORT\n\n50 risks · 100 dependencies · dependency risk 32%\nDelivery, financial, resource, and adoption risks`,
      context: { subject: 'Transformation Risk Report' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Summary.docx',
      generatedBy: 'Transformation PMO AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE SUMMARY\n\nEnterprise transformation oversight across all initiatives\nRecover 6 programs · re-sequence 8 dependencies · escalate 11 commitments`,
      executiveSummary: 'Concise executive transformation summary with priority actions.',
      context: { subject: 'Executive Summary' },
    }),
  ];
}

function enterpriseRiskArtifacts(runId: string): Artifact[] {
  return [
    createArtifact({
      id: `${runId}-erm`,
      name: 'Enterprise_Risk_Report.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `ENTERPRISE RISK REPORT\n\n500 enterprise risks · 300 controls · 200 audit findings\nRisk exposure: 51 · Residual: 38 · Control effectiveness: 74%`,
      executiveSummary: 'Enterprise-wide risk posture across all categories for board review.',
      context: { subject: 'Enterprise Risk Report' },
    }),
    createArtifact({
      id: `${runId}-board`,
      name: 'Board_Risk_Pack.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `BOARD RISK PACK\n\nOpen critical risks: 42 · Appetite breaches: 3 categories\nRegulatory exposure: ₹1.8B · Assurance coverage: 79%`,
      executiveSummary: 'Board-ready risk pack with critical risks, appetite, and assurance.',
      context: { subject: 'Board Risk Pack' },
    }),
    createArtifact({
      id: `${runId}-appetite`,
      name: 'Risk_Appetite_Report.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      previewContent: `RISK APPETITE REPORT\n\nExposure vs appetite vs tolerance across 8 risk categories\n3 categories breached — escalation to Risk Committee`,
      context: { subject: 'Risk Appetite Report' },
    }),
    createArtifact({
      id: `${runId}-control`,
      name: 'Control_Effectiveness_Assessment.xlsx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'xlsx',
      previewContent: `CONTROL EFFECTIVENESS ASSESSMENT\n\n300 controls · effectiveness 74%\nIneffective/untested controls mapped to open findings`,
      context: { subject: 'Control Effectiveness Assessment' },
    }),
    createArtifact({
      id: `${runId}-assurance`,
      name: 'Integrated_Assurance_Report.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      previewContent: `INTEGRATED ASSURANCE REPORT\n\nThree lines of defense · 100 reviews · coverage 79%\nUnder-assured domains: AI and third-party`,
      context: { subject: 'Integrated Assurance Report' },
    }),
    createArtifact({
      id: `${runId}-audit-corr`,
      name: 'Audit_Risk_Correlation_Report.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      previewContent: `AUDIT RISK CORRELATION REPORT\n\n200 audit findings correlated to risks and controls\n28 control gaps linked to overdue findings`,
      context: { subject: 'Audit Risk Correlation Report' },
    }),
    createArtifact({
      id: `${runId}-cyber`,
      name: 'Cyber_Risk_Assessment.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      previewContent: `CYBER RISK ASSESSMENT\n\n150 cyber risks · cyber risk score 56\nRansomware and unpatched vulnerabilities highest`,
      context: { subject: 'Cyber Risk Assessment' },
    }),
    createArtifact({
      id: `${runId}-ai`,
      name: 'AI_Risk_Assessment.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      previewContent: `AI RISK ASSESSMENT\n\n100 AI risks · AI risk score 49\nBias, explainability, and drift across fraud/credit models`,
      context: { subject: 'AI Risk Assessment' },
    }),
    createArtifact({
      id: `${runId}-exec`,
      name: 'Executive_Risk_Summary.docx',
      generatedBy: 'Enterprise Risk AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `EXECUTIVE RISK SUMMARY\n\nClose 42 critical risks · remediate 28 control gaps\nApprove assurance plan for under-assured domains`,
      executiveSummary: 'Concise executive risk summary with priority board actions.',
      context: { subject: 'Executive Risk Summary' },
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
  'audit-center': auditCenterArtifacts,
  'notification-center': notificationCenterArtifacts,
  persistence: persistenceArtifacts,
  'activity-center': activityCenterArtifacts,
  abac: abacArtifacts,
  'ai-copilot': aiCopilotArtifacts,
  'production-intelligence': productionIntelligenceArtifacts,
  'knowledge-center': knowledgeCenterArtifacts,
  'value-realization': valueRealizationArtifacts,
  'portfolio-governance': portfolioGovernanceArtifacts,
  'application-portfolio': applicationPortfolioArtifacts,
  'architecture-repository': architectureRepositoryArtifacts,
  'technology-strategy': technologyStrategyArtifacts,
  'transformation-pmo': transformationPmoArtifacts,
  'enterprise-risk': enterpriseRiskArtifacts,
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
    simulation: sim('Unified Lifecycle AI analyzing embedded approval gates...', ['Lifecycle Approval', 'Delivery Readiness', 'Release Readiness', 'Executive Governance']),
    build: workflowOrchestrationArtifacts,
  },
  'audit-center': {
    title: 'AI Audit Center Reports',
    subtitle: 'Findings, evidence coverage, compliance assessment, and executive audit summary',
    generateLabel: 'Generate Audit Center Reports',
    generatedBy: 'Audit Center AI',
    glow: 'purple',
    simulation: sim('Audit Center AI assembling enterprise evidence packages...', ['Findings Report', 'Evidence Coverage', 'Compliance Assessment', 'Readiness Package', 'Executive Summary']),
    build: auditCenterArtifacts,
  },
  'notification-center': {
    title: 'AI Notification Reports',
    subtitle: 'Alert summary, escalation analysis, trends, and executive risk',
    generateLabel: 'Generate Notification Reports',
    generatedBy: 'Notification AI',
    glow: 'purple',
    simulation: sim('Notification AI analyzing alert patterns...', ['Summary Report', 'Escalation Analysis', 'Alert Trends', 'Executive Risk']),
    build: notificationCenterArtifacts,
  },
  persistence: {
    title: 'AI Persistence Reports',
    subtitle: 'Health, repository activity, storage utilization, and platform readiness',
    generateLabel: 'Generate Persistence Reports',
    generatedBy: 'Persistence AI',
    glow: 'blue',
    simulation: sim('Persistence AI analyzing repository layer...', ['Health Report', 'Activity Report', 'Storage Utilization', 'Platform Readiness']),
    build: persistenceArtifacts,
  },
  'activity-center': {
    title: 'AI Activity Center Reports',
    subtitle: 'Activity, event volume, executive summary, and platform event health',
    generateLabel: 'Generate Activity Reports',
    generatedBy: 'Activity AI',
    glow: 'purple',
    simulation: sim('Activity AI correlating platform events...', ['Activity Report', 'Event Volume', 'Executive Summary', 'Event Health']),
    build: activityCenterArtifacts,
  },
  abac: {
    title: 'AI ABAC Reports',
    subtitle: 'Assessment, access scope, domain ownership, and security governance',
    generateLabel: 'Generate ABAC Reports',
    generatedBy: 'Security AI',
    glow: 'purple',
    simulation: sim('Security AI evaluating attribute policies...', ['ABAC Assessment', 'Access Scope', 'Domain Ownership', 'Security Governance']),
    build: abacArtifacts,
  },
  'ai-copilot': {
    title: 'AI Delivery Copilot Reports',
    subtitle: 'Executive advisory, project health, delivery risk, release readiness, and continuous improvement',
    generateLabel: 'Generate Copilot Reports',
    generatedBy: 'Delivery Copilot AI',
    glow: 'purple',
    simulation: sim('Delivery Copilot AI synthesizing SDLC insights...', ['Executive Advisory', 'Project Health', 'Delivery Risk', 'Release Readiness', 'Improvement Plan']),
    build: aiCopilotArtifacts,
  },
  'production-intelligence': {
    title: 'AI Production Intelligence Reports',
    subtitle: 'Production health, incidents, defect leakage, customer impact, RCA, and improvement',
    generateLabel: 'Generate Production Intelligence Reports',
    generatedBy: 'Production Intelligence AI',
    glow: 'blue',
    simulation: sim('Production Intelligence AI analyzing production signals...', ['Production Health', 'Incident Analysis', 'Defect Leakage', 'Customer Impact', 'Executive Review', 'RCA Summary', 'Continuous Improvement']),
    build: productionIntelligenceArtifacts,
  },
  'knowledge-center': {
    title: 'AI Knowledge Center Reports',
    subtitle: 'Coverage, lessons learned, patterns, controls, RCA knowledge, adoption, and executive summary',
    generateLabel: 'Generate Knowledge Reports',
    generatedBy: 'Knowledge AI',
    glow: 'blue',
    simulation: sim('Knowledge AI synthesizing organizational learning...', ['Knowledge Coverage', 'Lessons Learned', 'Pattern Catalog', 'Control Library', 'RCA Knowledge', 'Learning Adoption', 'Executive Summary']),
    build: knowledgeCenterArtifacts,
  },
  'value-realization': {
    title: 'AI Value Realization Reports',
    subtitle: 'ROI, transformation scorecard, business case, productivity, governance, audit, and board summary',
    generateLabel: 'Generate Value Reports',
    generatedBy: 'Value Realization AI',
    glow: 'blue',
    simulation: sim('Value Realization AI computing business case...', ['Executive ROI', 'Transformation Scorecard', 'Value Realization', 'Business Case', 'Productivity', 'Governance', 'Audit', 'Board Summary']),
    build: valueRealizationArtifacts,
  },
  'portfolio-governance': {
    title: 'Portfolio Governance Reports',
    subtitle: 'Portfolio review, investment governance, capacity planning, demand prioritization, roadmap, benefits, steering pack, and board summary',
    generateLabel: 'Generate Portfolio Reports',
    generatedBy: 'Portfolio Governance AI',
    glow: 'blue',
    simulation: sim('Portfolio Governance AI analyzing demand and capacity...', ['Portfolio Review', 'Investment Governance', 'Capacity Planning', 'Demand Prioritization', 'Strategic Roadmap', 'Benefits Realization', 'Steering Pack', 'Board Summary']),
    build: portfolioGovernanceArtifacts,
  },
  'application-portfolio': {
    title: 'Application Portfolio Reports',
    subtitle: 'Portfolio report, technology health, technical debt, modernization roadmap, cloud and AI readiness, risk report, and executive summary',
    generateLabel: 'Generate APM Reports',
    generatedBy: 'APM AI',
    glow: 'blue',
    simulation: sim('APM AI analyzing application portfolio...', ['Portfolio Report', 'Technology Health', 'Technical Debt', 'Modernization Roadmap', 'Cloud Readiness', 'AI Readiness', 'Risk Report', 'Executive Summary']),
    build: applicationPortfolioArtifacts,
  },
  'architecture-repository': {
    title: 'Architecture Repository Reports',
    subtitle: 'Architecture review, compliance, standards, debt, modernization roadmap, cloud and AI architecture, risk, executive and board summaries',
    generateLabel: 'Generate Architecture Reports',
    generatedBy: 'Architecture AI',
    glow: 'blue',
    simulation: sim('Architecture AI analyzing enterprise architecture...', ['Architecture Review', 'Compliance Report', 'Standards Assessment', 'Architecture Debt', 'Modernization Roadmap', 'Cloud Assessment', 'AI Assessment', 'Risk Assessment', 'Executive Summary', 'Board Report']),
    build: architectureRepositoryArtifacts,
  },
  'technology-strategy': {
    title: 'Technology Strategy Reports',
    subtitle: 'Technology strategy, standards catalog, roadmap, cloud and AI strategy, technology and vendor risk, modernization, executive and board summaries',
    generateLabel: 'Generate Technology Reports',
    generatedBy: 'Technology Strategy AI',
    glow: 'blue',
    simulation: sim('Technology Strategy AI analyzing the technology estate...', ['Strategy Report', 'Standards Catalog', 'Technology Roadmap', 'Cloud Strategy', 'AI Platform Strategy', 'Risk Assessment', 'Modernization Roadmap', 'Vendor Risk', 'Executive Summary', 'Board Presentation']),
    build: technologyStrategyArtifacts,
  },
  'transformation-pmo': {
    title: 'Transformation PMO Reports',
    subtitle: 'Transformation health, executive steering, program status, strategic objectives, benefits realization, board pack, risk report, and executive summary',
    generateLabel: 'Generate Transformation Reports',
    generatedBy: 'Transformation PMO AI',
    glow: 'blue',
    simulation: sim('Transformation PMO AI analyzing programs and benefits...', ['Transformation Health', 'Executive Steering', 'Program Status', 'Strategic Objectives', 'Benefits Realization', 'Board Pack', 'Risk Report', 'Executive Summary']),
    build: transformationPmoArtifacts,
  },
  'enterprise-risk': {
    title: 'Enterprise Risk Reports',
    subtitle: 'Enterprise risk, board risk pack, risk appetite, control effectiveness, integrated assurance, audit correlation, cyber risk, AI risk, and executive summary',
    generateLabel: 'Generate Risk Reports',
    generatedBy: 'Enterprise Risk AI',
    glow: 'purple',
    simulation: sim('Enterprise Risk AI analyzing risks, controls, and assurance...', ['Enterprise Risk Report', 'Board Risk Pack', 'Risk Appetite', 'Control Effectiveness', 'Integrated Assurance', 'Audit Correlation', 'Cyber Risk', 'AI Risk', 'Executive Summary']),
    build: enterpriseRiskArtifacts,
  },
};

export function buildHubArtifacts(hubKey: HubKey, runId: string): Artifact[] {
  return BUILDERS[hubKey](runId);
}

export function getDemoArtifacts(hubKey: HubKey): Artifact[] {
  return BUILDERS[hubKey](`DEMO-${hubKey}`);
}
