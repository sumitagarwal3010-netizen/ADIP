/**
 * AI Workspace configuration — the AI-first entry point for every major hub.
 *
 * Maps each module to:
 *   - analysisPhase  → reuses generateAnalysisResult() (Requirements/Gap/Recommendations)
 *   - artifactHub    → reuses buildHubArtifacts() (BRD/FRD/roadmaps/etc.)
 *   - placeholder + suggested prompts (module-specific examples)
 *   - optional structured intake fields (Transformation / Technology / EA / Portfolio)
 *   - mode: 'generate' (prompt → analysis → artifacts) or 'ask' (executive Q&A)
 *
 * Pure recomposition of existing engines — no new generation backend.
 */

import type { AnalysisPhase } from '../data/aiAnalysisMockData';
import type { HubKey } from '../data/hubArtifactDefinitions';
import type { WorkflowLifecycleStage } from '../types/workflowOrchestration';

export type AIWorkspaceModule =
  | 'ai-copilot'
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'portfolio-governance'
  | 'technology-strategy'
  | 'enterprise-architecture'
  | 'transformation'
  | 'ai-governance'
  | 'executive';

export interface WorkspaceGovernanceConfig {
  title: string;
  subtitle: string;
  checklist: string[];
  /** Route for "Open Approval Workflow" CTA. */
  approvalRoute: string;
  /** Optional SDLC stage for HubWorkflowActions integration. */
  hubStage?: WorkflowLifecycleStage;
}

export interface IntakeField {
  key: string;
  label: string;
  placeholder: string;
  rows?: number;
}

export interface AIWorkspaceConfig {
  module: AIWorkspaceModule;
  title: string;
  subtitle: string;
  /** 'generate' = INPUT→Analysis→Recommendations→Artifacts; 'ask' = executive Q&A. */
  mode: 'generate' | 'ask';
  promptLabel: string;
  placeholder: string;
  suggestedPrompts: string[];
  /** Reuse the existing analysis engine. */
  analysisPhase: AnalysisPhase;
  /** Reuse the existing artifact generation engine. */
  artifactHub: HubKey;
  /** Agent persona label shown during analysis. */
  agentLabel: string;
  glow: 'blue' | 'purple' | 'green';
  /** Names of the artifacts a generate run produces (shown in the flow guide). */
  artifactSummary: string[];
  /** Optional structured intake (Transformation / Technology / EA / Portfolio). */
  intakeFields?: IntakeField[];
  /** Governance workflow shown after artifact generation. */
  governance: WorkspaceGovernanceConfig;
}

export const AI_WORKSPACE_CONFIGS: Record<AIWorkspaceModule, AIWorkspaceConfig> = {
  'ai-copilot': {
    module: 'ai-copilot',
    title: 'Enterprise AI Authoring Studio',
    subtitle: 'Cross-SDLC artifact generation and orchestration across the delivery lifecycle',
    mode: 'generate',
    promptLabel: 'What do you want to deliver?',
    placeholder: 'e.g. Create BRD for UPI limit enhancement for KYC L2 customers',
    suggestedPrompts: [
      'Create BRD for UPI limit enhancement',
      'Generate requirements for merchant auto settlement',
      'Plan delivery for biometric login on mobile banking',
      'Assess readiness for NEFT batch modernization',
    ],
    analysisPhase: 'requirements',
    artifactHub: 'ai-copilot',
    agentLabel: 'AI SDLC Copilot',
    glow: 'purple',
    artifactSummary: ['BRD', 'FRD', 'User Stories', 'Acceptance Criteria', 'Traceability Matrix'],
    governance: {
      title: 'SDLC Governance Workflow',
      subtitle: 'Route generated artifacts through review and approval gates',
      checklist: ['Business owner sign-off', 'Compliance review', 'Architecture review', 'Traceability linked'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'requirements',
    },
  },
  requirements: {
    module: 'requirements',
    title: 'Requirements Engineering Workspace',
    subtitle: 'Requirement analysis, quality review, and traceable requirement artifact generation',
    mode: 'generate',
    promptLabel: 'Describe the business requirement',
    placeholder: 'e.g. Create BRD for UPI limit enhancement for KYC L2 customers',
    suggestedPrompts: [
      'Create BRD for UPI limit enhancement',
      'Generate FRD for recurring mandate upgrade',
      'Draft user stories for merchant settlement portal',
      'Identify compliance gaps for cross-border payments',
    ],
    analysisPhase: 'requirements',
    artifactHub: 'ai-use-case',
    agentLabel: 'Requirement Agent',
    glow: 'purple',
    artifactSummary: ['BRD', 'FRD', 'User Stories', 'Acceptance Criteria', 'Traceability Matrix'],
    governance: {
      title: 'Requirements Governance Workflow',
      subtitle: 'Submit BRD/FRD for stakeholder review and compliance sign-off',
      checklist: ['Stakeholder review complete', 'Acceptance criteria validated', 'Compliance mapping confirmed', 'Traceability matrix attached'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'requirements',
    },
  },
  architecture: {
    module: 'architecture',
    title: 'Architecture AI Workspace',
    subtitle: 'Describe a solution — generate HLD, integration, and data design',
    mode: 'generate',
    promptLabel: 'Describe the solution to design',
    placeholder: 'e.g. Design event-driven settlement for merchant auto settlement',
    suggestedPrompts: [
      'Design architecture for UPI limit enhancement',
      'Recommend integration pattern for NPCI switch',
      'Assess security design for biometric login',
      'Model data entities for merchant settlement',
    ],
    analysisPhase: 'architecture',
    artifactHub: 'architecture-repository',
    agentLabel: 'Architecture Agent',
    glow: 'blue',
    artifactSummary: ['HLD', 'LLD', 'API Specification', 'Integration Design', 'Data Model'],
    governance: {
      title: 'Architecture Governance Workflow',
      subtitle: 'Submit design artifacts to architecture review board',
      checklist: ['HLD peer review', 'Integration impact assessed', 'Security design approved', 'Standards mapping complete'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'architecture',
    },
  },
  development: {
    module: 'development',
    title: 'Development AI Workspace',
    subtitle: 'Describe build scope — get API, service, and database design artifacts',
    mode: 'generate',
    promptLabel: 'Describe what to build',
    placeholder: 'e.g. Implement settlement API and merchant limit service for UPI',
    suggestedPrompts: [
      'Design API contracts for merchant settlement service',
      'Generate service components for UPI limit enforcement',
      'Plan database migrations for settlement batch processing',
      'Run development readiness review for biometric login',
    ],
    analysisPhase: 'development',
    artifactHub: 'best-practices',
    agentLabel: 'Development AI',
    glow: 'purple',
    artifactSummary: ['API Specification', 'Service Design', 'Database Migration Plan', 'Code Review Summary'],
    governance: {
      title: 'Development Governance Workflow',
      subtitle: 'Route build artifacts through code review and security gates',
      checklist: ['API contract approved', 'Security scan passed', 'Database migration reviewed', 'Peer review complete'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'development',
    },
  },
  testing: {
    module: 'testing',
    title: 'Testing AI Workspace',
    subtitle: 'Describe scope — generate strategy, cases, and coverage plan',
    mode: 'generate',
    promptLabel: 'Describe the testing scope',
    placeholder: 'e.g. Build test strategy for UPI limit enhancement release',
    suggestedPrompts: [
      'Create test strategy for UPI limit enhancement',
      'Generate test cases for merchant settlement',
      'Assemble regression pack for payments release',
      'Identify coverage gaps for biometric login',
    ],
    analysisPhase: 'testing',
    artifactHub: 'best-practices',
    agentLabel: 'Test Planning Agent',
    glow: 'green',
    artifactSummary: ['Test Strategy', 'Test Scenarios', 'Test Cases', 'Regression Suite', 'Coverage Report'],
    governance: {
      title: 'Testing Governance Workflow',
      subtitle: 'Submit test evidence for quality gate and release readiness',
      checklist: ['SIT sign-off', 'UAT completion', 'Regression pack executed', 'Coverage threshold met'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'testing',
    },
  },
  release: {
    module: 'release',
    title: 'Release AI Workspace',
    subtitle: 'Describe a release — generate readiness, deployment, and rollback plans',
    mode: 'generate',
    promptLabel: 'Describe the release',
    placeholder: 'e.g. Plan go-live for UPI Release 24.6 to production',
    suggestedPrompts: [
      'Assess go-live readiness for UPI Release 24.6',
      'Generate deployment plan for merchant settlement',
      'Build rollback plan for biometric login release',
      'Produce go/no-go recommendation for payments release',
    ],
    analysisPhase: 'deployment',
    artifactHub: 'production-intelligence',
    agentLabel: 'Release Planning Agent',
    glow: 'green',
    artifactSummary: ['Release Readiness', 'Deployment Plan', 'Rollback Plan', 'Go-Live Checklist', 'Go/No-Go Recommendation'],
    governance: {
      title: 'Release Governance Workflow',
      subtitle: 'Route release package through CAB and go-live approval',
      checklist: ['CAB approval obtained', 'Rollback drill validated', 'Production readiness confirmed', 'Stakeholder go/no-go recorded'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'release',
    },
  },
  'portfolio-governance': {
    module: 'portfolio-governance',
    title: 'Portfolio Governance AI Workspace',
    subtitle: 'Describe an initiative — get funding, priority, and kill/accelerate guidance',
    mode: 'generate',
    promptLabel: 'Describe the initiative for governance review',
    placeholder: 'e.g. Evaluate funding for the AI fraud platform expansion',
    suggestedPrompts: [
      'Recommend funding for AI fraud platform expansion',
      'Prioritize the cross-border payments initiative',
      'Should we accelerate or stop the legacy core migration?',
      'Build a business case for the merchant onboarding revamp',
    ],
    analysisPhase: 'requirements',
    artifactHub: 'portfolio-governance',
    agentLabel: 'Portfolio Governance AI',
    glow: 'blue',
    artifactSummary: ['Funding Recommendation', 'Priority Recommendation', 'Kill/Accelerate Recommendation', 'Business Case'],
    intakeFields: [
      { key: 'initiative', label: 'Initiative', placeholder: 'e.g. AI fraud platform expansion' },
      { key: 'outcome', label: 'Expected outcome', placeholder: 'e.g. 30% fraud loss reduction', rows: 2 },
      { key: 'investment', label: 'Investment', placeholder: 'e.g. ₹12 Cr over 18 months' },
    ],
    governance: {
      title: 'Portfolio Governance Workflow',
      subtitle: 'Route funding recommendation through investment committee',
      checklist: ['Business case validated', 'Strategic alignment confirmed', 'Capacity impact assessed', 'Investment committee review'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'approval',
    },
  },
  'technology-strategy': {
    module: 'technology-strategy',
    title: 'Technology Strategy AI Workspace',
    subtitle: 'Describe a technology initiative — get standards, roadmap, and platform strategy',
    mode: 'generate',
    promptLabel: 'Describe the technology initiative',
    placeholder: 'e.g. Define a cloud-native platform strategy for payments',
    suggestedPrompts: [
      'Define technology standards for the payments platform',
      'Build a 3-year cloud modernization roadmap',
      'Analyze investment for the event streaming platform',
      'Recommend a platform strategy for GenAI services',
    ],
    analysisPhase: 'architecture',
    artifactHub: 'technology-strategy',
    agentLabel: 'Technology Strategy AI',
    glow: 'blue',
    artifactSummary: ['Technology Standards', 'Technology Roadmap', 'Investment Analysis', 'Platform Strategy'],
    intakeFields: [
      { key: 'initiative', label: 'Technology initiative', placeholder: 'e.g. Cloud-native payments platform' },
      { key: 'horizon', label: 'Planning horizon', placeholder: 'e.g. 3 years' },
    ],
    governance: {
      title: 'Technology Strategy Governance',
      subtitle: 'Submit standards and roadmap for architecture board approval',
      checklist: ['Standards alignment verified', 'Investment impact assessed', 'Vendor risk reviewed', 'Architecture board sign-off'],
      approvalRoute: '/executive/architecture-repository/review-board',
      hubStage: 'architecture',
    },
  },
  'enterprise-architecture': {
    module: 'enterprise-architecture',
    title: 'Enterprise Architecture AI Workspace',
    subtitle: 'Describe an architecture problem — get reference architecture and review',
    mode: 'generate',
    promptLabel: 'Describe the architecture problem',
    placeholder: 'e.g. Reference architecture for real-time fraud scoring across channels',
    suggestedPrompts: [
      'Generate a reference architecture for real-time fraud scoring',
      'Run an architecture review for the settlement platform',
      'Map our payments design to enterprise standards',
      'Analyze architecture risk for the core banking upgrade',
    ],
    analysisPhase: 'architecture',
    artifactHub: 'architecture-repository',
    agentLabel: 'Enterprise Architecture AI',
    glow: 'blue',
    artifactSummary: ['Reference Architecture', 'Architecture Review', 'Risk Analysis', 'Standards Mapping'],
    intakeFields: [
      { key: 'problem', label: 'Architecture problem', placeholder: 'e.g. Real-time fraud scoring across channels', rows: 2 },
      { key: 'constraints', label: 'Key constraints', placeholder: 'e.g. Sub-200ms latency, RBI data residency' },
    ],
    governance: {
      title: 'Enterprise Architecture Governance',
      subtitle: 'Route reference architecture through EA review board',
      checklist: ['Standards mapping complete', 'Architecture review board scheduled', 'Exception risks documented', 'Cross-domain impact assessed'],
      approvalRoute: '/executive/architecture-repository/review-board',
      hubStage: 'architecture',
    },
  },
  transformation: {
    module: 'transformation',
    title: 'Transformation Center AI Workspace',
    subtitle: 'Describe a transformation — get benefits model, roadmap, and ROI',
    mode: 'generate',
    promptLabel: 'Describe the transformation initiative',
    placeholder: 'e.g. Enterprise-wide GenAI adoption across delivery and operations',
    suggestedPrompts: [
      'Build a benefits realization model for GenAI adoption',
      'Generate a transformation roadmap for digital lending',
      'Analyze dependencies for the core modernization program',
      'Project ROI for the payments transformation program',
    ],
    analysisPhase: 'requirements',
    artifactHub: 'transformation-pmo',
    agentLabel: 'Transformation AI',
    glow: 'purple',
    artifactSummary: ['Benefits Realization Model', 'Transformation Roadmap', 'Dependency Analysis', 'Risk Analysis', 'ROI Projection'],
    intakeFields: [
      { key: 'initiative', label: 'Transformation initiative', placeholder: 'e.g. Enterprise GenAI adoption', rows: 2 },
      { key: 'outcomes', label: 'Expected business outcomes', placeholder: 'e.g. 25% faster delivery, 20% cost reduction', rows: 2 },
      { key: 'benefits', label: 'Expected benefits', placeholder: 'e.g. ₹40 Cr annual value, NPS +12' },
      { key: 'investment', label: 'Investment', placeholder: 'e.g. ₹35 Cr' },
      { key: 'timeline', label: 'Timeline', placeholder: 'e.g. 24 months, 3 phases' },
    ],
    governance: {
      title: 'Transformation Governance Workflow',
      subtitle: 'Route benefits model and roadmap through program steering committee',
      checklist: ['Benefits model validated', 'Dependencies mapped', 'ROI projection reviewed', 'Steering committee approval'],
      approvalRoute: '/governance/approval-workflow',
      hubStage: 'approval',
    },
  },
  'ai-governance': {
    module: 'ai-governance',
    title: 'AI Governance AI Workspace',
    subtitle: 'Describe an AI use case — get risk, controls, and governance artifacts',
    mode: 'generate',
    promptLabel: 'Describe the AI use case',
    placeholder: 'e.g. Assess real-time UPI fraud scoring model for approval',
    suggestedPrompts: [
      'Assess real-time UPI fraud scoring for governance approval',
      'Review model risk for the credit scoring model',
      'Map AI controls for the customer service copilot',
      'Generate a use-case approval recommendation',
    ],
    analysisPhase: 'requirements',
    artifactHub: 'ai-use-case',
    agentLabel: 'AI Governance AI',
    glow: 'purple',
    artifactSummary: ['Use Case Assessment', 'Business Value Report', 'Risk Assessment', 'Control Mapping', 'Approval Recommendation'],
    governance: {
      title: 'AI Governance Workflow',
      subtitle: 'Route use case assessment through model risk and control approval',
      checklist: ['Use case risk tier assigned', 'Model inventory updated', 'Controls mapped', 'AI ethics review complete'],
      approvalRoute: '/ai-governance-center',
      hubStage: 'approval',
    },
  },
  executive: {
    module: 'executive',
    title: 'Executive Ask AI',
    subtitle: 'Ask anything about portfolio health, risk, delivery, and investment',
    mode: 'ask',
    promptLabel: 'Ask the executive AI',
    placeholder: 'e.g. Why is Payments health declining?',
    suggestedPrompts: [
      'Why is Payments health declining?',
      'Show top 10 risk applications.',
      'Which programs are behind schedule?',
      'What investments should be stopped?',
    ],
    analysisPhase: 'requirements',
    artifactHub: 'executive',
    agentLabel: 'Executive AI Advisor',
    glow: 'purple',
    artifactSummary: ['Executive Summary', 'Portfolio Health Report', 'Strategic Risk Report', 'Board Presentation'],
    governance: {
      title: 'Executive Action Workflow',
      subtitle: 'Route AI insights to decision owners and board reporting',
      checklist: ['Insight validated against KPIs', 'Decision owner assigned', 'Board pack updated', 'Follow-up actions tracked'],
      approvalRoute: '/executive/board-reporting',
    },
  },
};
