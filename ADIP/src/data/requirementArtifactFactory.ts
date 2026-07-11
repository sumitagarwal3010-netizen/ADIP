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

function normalize(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toFeatureCode(feature: string): string {
  const alnum = feature.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  return (alnum.slice(0, 6) || 'FEATURE').padEnd(6, 'X');
}

function toStoryClauses(requirementDescription: string): string[] {
  const clauses = requirementDescription
    .split(/[.;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (clauses.length === 0) return ['Implement the requirement behavior as specified'];
  return clauses.slice(0, 3);
}

export function buildRequirementArtifacts(intake: RequirementIntake, runId: string): Artifact[] {
  const date = today();
  const feature = normalize(intake.featureName, 'Untitled Feature');
  const domain = normalize(intake.domain, 'General');
  const businessObjective = normalize(intake.businessObjective, `Deliver ${feature} outcomes for ${domain}.`);
  const requirementDescription = normalize(
    intake.requirementDescription,
    `${feature} implementation requirements for ${domain}.`,
  );
  const complianceNotes = normalize(intake.complianceNotes, `Apply ${domain} compliance controls for ${feature}.`);
  const storyClauses = toStoryClauses(requirementDescription);
  const featureCode = toFeatureCode(feature);
  const reqIds = storyClauses.map((_, i) => `REQ-${featureCode}-${String(i + 1).padStart(2, '0')}`);

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
   The ${feature} initiative in ${domain} targets: ${businessObjective}

2. Requirement Description
   ${requirementDescription}

3. Compliance Notes
   ${complianceNotes}`,
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
  System shall implement ${feature} within the ${domain} domain according to: ${requirementDescription}

FR-002: Business Objective Alignment
  ${businessObjective}

FR-003: Compliance Controls
  ${complianceNotes}`,
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
| US-001   | ${feature}  | As a ${domain} user, I want ${feature} so that ${storyClauses[0] || requirementDescription}. | 5 |
| US-002   | ${feature}  | As a product owner, I want ${feature} behavior to satisfy: ${storyClauses[1] || requirementDescription}. | 3 |
| US-003   | Compliance  | As a compliance officer, I want ${feature} to enforce ${complianceNotes}. | 3 |`,
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
  GIVEN ${domain} configuration for ${feature}
  WHEN users execute the capability described as "${storyClauses[0] || requirementDescription}"
  THEN the system fulfills: ${businessObjective}

AC-002: Compliance
  GIVEN compliance constraints "${complianceNotes}"
  WHEN ${feature} processes ${domain} workflows
  THEN all compliance checks in the intake notes are enforced`,
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
| ${reqIds[0] || `REQ-${featureCode}-01`} | Exec Summary | FR-001 | US-001 | TC-001 | Mapped |
| ${reqIds[1] || `REQ-${featureCode}-02`} | Compliance   | FR-003 | US-003 | TC-004 | Mapped |
| ${reqIds[2] || `REQ-${featureCode}-03`} | ${domain}    | FR-002 | US-002 | TC-002 | Mapped |

Feature: ${feature}
Requirement Basis: ${requirementDescription}
Coverage: 100% generated requirements traced to test cases`,
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
