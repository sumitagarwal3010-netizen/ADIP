import type { Artifact } from '../types/artifacts';
import { createRunId, enrichArtifacts, formatTimestamp } from './artifactBuilder';

export { createRunId, formatTimestamp };

export interface RequirementIntake {
  domain: string;
  featureName: string;
  businessObjective: string;
  requirementDescription: string;
  complianceNotes: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildRequirementArtifacts(intake: RequirementIntake, runId: string): Artifact[] {
  const date = today();
  const feature = intake.featureName || 'Untitled Feature';
  const domain = intake.domain || 'General';

  const artifacts: Artifact[] = [
    {
      id: `${runId}-brd`,
      name: 'BRD.docx',
      generatedBy: 'Requirement AI',
      modelUsed: 'Gemini',
      version: '1.0',
      generatedDate: date,
      approvalStatus: 'Pending Review',
      fileType: 'docx',
      previewContent: `BUSINESS REQUIREMENTS DOCUMENT
${feature}

Domain: ${domain}

1. Executive Summary
   ${intake.businessObjective || 'Business objective to be defined.'}

2. Requirement Description
   ${intake.requirementDescription || 'No detailed description provided.'}

3. Compliance Notes
   ${intake.complianceNotes || 'No compliance constraints specified.'}`,
      generationHistory: [
        { version: '1.0', generatedDate: date, generatedBy: 'Requirement AI', modelUsed: 'Gemini', changeSummary: `Generated from intake run ${runId}` },
      ],
    },
    {
      id: `${runId}-frd`,
      name: 'FRD.docx',
      generatedBy: 'Requirement AI',
      modelUsed: 'Gemini',
      version: '1.0',
      generatedDate: date,
      approvalStatus: 'Draft',
      fileType: 'docx',
      previewContent: `FUNCTIONAL REQUIREMENTS DOCUMENT
${feature}

FR-001: Core Capability
  System shall implement ${feature} within the ${domain} domain.

FR-002: Business Objective Alignment
  ${intake.businessObjective || 'Align delivery to stated business goals.'}

FR-003: Compliance Controls
  ${intake.complianceNotes || 'Apply standard regulatory controls.'}`,
      generationHistory: [
        { version: '1.0', generatedDate: date, generatedBy: 'Requirement AI', modelUsed: 'Gemini', changeSummary: `Derived from BRD for ${feature}` },
      ],
    },
    {
      id: `${runId}-stories`,
      name: 'UserStories.xlsx',
      generatedBy: 'Requirement AI',
      modelUsed: 'Gemini',
      version: '1.0',
      generatedDate: date,
      approvalStatus: 'Draft',
      fileType: 'xlsx',
      previewContent: `Sheet: User Stories — ${feature}

| ID       | Epic        | Story                                              | Points |
|----------|-------------|----------------------------------------------------|--------|
| US-001   | ${feature}  | As a user, I want ${feature.toLowerCase()}...      | 5      |
| US-002   | ${feature}  | As ops, I want monitoring for ${domain}...         | 3      |
| US-003   | Compliance  | As compliance, I want audit trail for changes...   | 3      |`,
      generationHistory: [
        { version: '1.0', generatedDate: date, generatedBy: 'Requirement AI', modelUsed: 'Gemini', changeSummary: `Story breakdown from FRD — ${feature}` },
      ],
    },
    {
      id: `${runId}-ac`,
      name: 'AcceptanceCriteria.docx',
      generatedBy: 'Requirement AI',
      modelUsed: 'Gemini',
      version: '1.0',
      generatedDate: date,
      approvalStatus: 'Draft',
      fileType: 'docx',
      previewContent: `ACCEPTANCE CRITERIA
${feature}

AC-001: Feature Delivery
  GIVEN valid ${domain} configuration
  WHEN ${feature} is activated
  THEN business objective is measurable within 30 days

AC-002: Compliance
  GIVEN regulatory constraints
  WHEN feature processes transactions
  THEN ${intake.complianceNotes || 'standard compliance checks apply'}`,
      generationHistory: [
        { version: '1.0', generatedDate: date, generatedBy: 'Requirement AI', modelUsed: 'Gemini', changeSummary: `Acceptance criteria from user stories — ${feature}` },
      ],
    },
    {
      id: `${runId}-rtm`,
      name: 'Requirements_Traceability_Matrix.xlsx',
      generatedBy: 'Requirement AI',
      modelUsed: 'Gemini',
      version: '1.0',
      generatedDate: date,
      approvalStatus: 'Draft',
      fileType: 'xlsx',
      previewContent: `Sheet: Requirements Traceability Matrix — ${feature}

| Req ID | BRD Section | FRD Ref | User Story | Test Case | Status    |
|--------|-------------|---------|------------|-----------|-----------|
| REQ-01 | Exec Summary| FR-001  | US-001     | TC-001    | Mapped    |
| REQ-02 | Compliance  | FR-003  | US-003     | TC-004    | Mapped    |
| REQ-03 | ${domain}   | FR-002  | US-002     | TC-002    | In Review |

Coverage: 94% requirements traced to test cases`,
      generationHistory: [
        { version: '1.0', generatedDate: date, generatedBy: 'Requirement AI', modelUsed: 'Gemini', changeSummary: `RTM linking BRD/FRD/stories for ${feature}` },
      ],
    },
  ];

  return enrichArtifacts(artifacts, { feature, domain });
}

export const DEMO_REQUIREMENT_INTAKE: RequirementIntake = {
  domain: 'Payments',
  featureName: 'UPI Limit Enhancement',
  businessObjective: 'Increase verified customer daily UPI limits to ₹2L for KYC Level 2 accounts while reducing limit-related support tickets by 35%.',
  requirementDescription: 'Tiered UPI limit model with self-service upgrade, NPCI compliance checks, and audit trail for limit changes across Mobile Banking and Net Banking.',
  complianceNotes: 'RBI retail payment limits; AML monitoring for limit upgrades; PCI-DSS for card-linked UPI wallets.',
};

export function getDemoRequirementArtifacts(): Artifact[] {
  return buildRequirementArtifacts(DEMO_REQUIREMENT_INTAKE, 'DEMO-REQ');
}
