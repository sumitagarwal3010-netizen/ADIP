import { useMemo } from 'react';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ScienceIcon from '@mui/icons-material/Science';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import { CopilotSection, type CopilotFinding, type CopilotRecommendation, type CopilotSuggestedAction } from './CopilotSection';
import { useCopilot } from '../../context/CopilotContext';

const ISSUE_LABEL: Record<string, string> = {
  ambiguous: 'Ambiguous',
  'missing-ac': 'Missing AC',
  'missing-nfr': 'Missing NFR',
  'missing-control': 'Missing Control',
  'frequently-changing': 'Frequently Changing',
};

const ISSUE_SEVERITY: Record<string, CopilotFinding['severity']> = {
  ambiguous: 'medium',
  'missing-ac': 'high',
  'missing-nfr': 'high',
  'missing-control': 'critical',
  'frequently-changing': 'medium',
};

export function RequirementCopilotPanel() {
  const { requirementInsights, selectedProject } = useCopilot();

  const findings: CopilotFinding[] = useMemo(
    () =>
      requirementInsights.map((r) => ({
        id: r.id,
        badge: `${r.requirementId} · ${ISSUE_LABEL[r.issue] ?? r.issue}`,
        severity: ISSUE_SEVERITY[r.issue] ?? 'medium',
        title: r.title,
        detail: r.detail,
      })),
    [requirementInsights],
  );

  const recommendations: CopilotRecommendation[] = useMemo(
    () =>
      requirementInsights.map((r) => ({
        id: `rec-${r.id}`,
        badge: r.requirementId,
        title: r.suggestion,
        rationale:
          r.issue === 'missing-ac'
            ? 'Without acceptance criteria the requirement cannot be tested or signed off.'
            : r.issue === 'missing-nfr'
              ? 'Performance, availability or security thresholds are missing — risk to release readiness.'
              : r.issue === 'missing-control'
                ? 'Regulatory control reference is missing — flagged for audit.'
                : r.issue === 'ambiguous'
                  ? 'Ambiguous wording will create downstream rework in design and test.'
                  : 'Frequent change pattern indicates unstable scope; consider freezing for the sprint.',
      })),
    [requirementInsights],
  );

  const counts = useMemo(() => {
    const by: Record<string, number> = {};
    requirementInsights.forEach((r) => {
      by[r.issue] = (by[r.issue] ?? 0) + 1;
    });
    return by;
  }, [requirementInsights]);

  const userStoriesPreview = `# Generated User Stories — ${selectedProject.name}

US-1  As a UPI customer, I want failed P2P transfers to auto-refund within 5 minutes
       so I can trust the payment experience during NPCI outages.

US-2  As a fraud analyst, I want every high-value transfer to expose the rule trace
       so I can defend decisions in dispute reviews.

US-3  As a compliance officer, I want NEFT batches to record the regulator-mandated
       evidence fields so audit pulls are zero-touch.

(Generated from ${requirementInsights.length} AI findings on ${selectedProject.name}.)
`;

  const acceptanceCriteriaPreview = `# Acceptance Criteria Pack

REQ-2014 · Auto-refund flow
  Given a UPI debit succeeded but credit failed
  When  reversal window > 60s
  Then  refund initiated automatically and customer notified within 5 min

REQ-2031 · Fraud rule trace
  Given a transaction scored ≥80 by fraud engine
  When  decision is recorded
  Then  rule chain (id, version, input, score) is persisted to audit store

(${(counts['missing-ac'] ?? 0)} requirements were missing AC — all now drafted.)
`;

  const traceabilityPreview = `# Traceability Matrix

Requirement     ↔ Design     ↔ Test            ↔ Control
REQ-2014        ↔ DSN-411    ↔ TC-PAY-2014-*   ↔ RBI-MO-12.4
REQ-2031        ↔ DSN-418    ↔ TC-FRD-2031-*   ↔ AML-Rule-7.2
REQ-2055        ↔ DSN-422    ↔ TC-AUD-2055-*   ↔ SOX-CCM-3

Coverage: ${100 - Math.min(20, requirementInsights.length * 2)}% — gaps highlighted in red downstream.
`;

  const brdPreview = `# Business Requirements Document (BRD)

Project: ${selectedProject.name}
Sponsor: Head of Digital Banking
Business owner: Payments & Channels

1. Background
   The bank is consolidating real-time refund and fraud-trace flows across
   UPI, IMPS, NEFT and RTGS to reduce dispute hand-time and improve
   regulator-grade auditability.

2. Business objectives
   · Auto-refund debit-success / credit-fail UPI within 5 minutes
   · Persist fraud rule lineage for every score ≥80 transaction
   · Record regulator-mandated evidence for every NEFT/RTGS batch

3. Scope
   IN  : UPI refund engine · Fraud rule trace · NEFT/RTGS evidence store
   OUT : Cards reconciliation rebuild (tracked separately)

4. Stakeholders
   Product Owner (UPI/Cards/Loans) · BA team · Compliance · Risk
   · Operations · Internal Audit

(Generated from ${requirementInsights.length + 18} requirements analyzed by AI.)`;

  const frdPreview = `# Functional Requirements Document (FRD)

Module: Auto-Refund + Fraud Trace + Evidence Store
Project: ${selectedProject.name}

FR-1  Auto-Refund Engine
      The system shall initiate a refund automatically when a UPI debit
      succeeded but the credit leg failed, within 60s of the failed leg.

FR-2  Reversal Window Configuration
      The reversal window shall be configurable per product (default 60s,
      max 300s) by Treasury Operations.

FR-3  Fraud Rule Trace
      The system shall persist a complete trace (rule id, version,
      inputs, score, decision) for every fraud-engine evaluation with a
      score ≥ 80.

FR-4  Evidence Persistence
      The NEFT/RTGS batch run shall persist regulator-mandated evidence
      fields atomically with the settlement record.

(Coverage: ${100 - Math.min(20, requirementInsights.length * 2)}% of in-scope BRD items have a corresponding FR.)`;

  const reviewPreview = `# Requirement Review — ${selectedProject.name}

Total requirements analyzed: ${requirementInsights.length + 18}
AI-detected issues: ${requirementInsights.length}
  · Ambiguous: ${counts.ambiguous ?? 0}
  · Missing AC: ${counts['missing-ac'] ?? 0}
  · Missing NFR: ${counts['missing-nfr'] ?? 0}
  · Missing Control: ${counts['missing-control'] ?? 0}

Quality verdict: ${requirementInsights.length > 5 ? 'Below standard — rework recommended' : 'Acceptable — minor cleanup'}
Estimated rework hours saved by Copilot: ${requirementInsights.length * 4}h
`;

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'sa-1', priority: 'P1', owner: 'Product Owner — UPI', label: 'Resolve REQ-2014 ambiguity on UPI auto-refund window', detail: 'Confirm the 5-minute SLA against NPCI reversal rules and lock acceptance criteria before sprint commit.' },
    { id: 'sa-2', priority: 'P1', owner: 'BA — Payments', label: 'Add missing controls to NEFT/RTGS evidence requirements', detail: 'Map REQ-2055 to RBI-MO-12.4 so audit pulls are zero-touch.' },
    { id: 'sa-3', priority: 'P2', owner: 'BA — Cards', label: 'Define NFRs for Cards tokenization latency & throughput', detail: 'No performance thresholds captured for the card-on-file tokenization story.' },
    { id: 'sa-4', priority: 'P2', owner: 'Product Owner — Loans', label: 'Stabilize frequently-changing Loans eligibility rules', detail: 'Freeze the personal-loan eligibility requirement for this sprint to stop downstream rework.' },
    { id: 'sa-5', priority: 'P3', owner: 'Scrum Master', label: 'Adopt the generated user stories & AC pack into the backlog', detail: 'Import the Copilot-drafted stories for Mobile Banking and Net Banking journeys.' },
  ];

  const testScenariosPreview = `# Test Scenarios

POSITIVE
  TS-1  UPI refund completes within 5 min for 95% of cases
  TS-2  Fraud trace recorded for every score ≥80 transaction

NEGATIVE
  TS-3  NPCI timeout triggers retry-with-backoff, no double debit
  TS-4  Fraud engine unavailable → conservative decline + alert

EDGE
  TS-5  Refund triggered concurrently with manual reversal (idempotent)
`;

  return (
    <CopilotSection
      title="Requirements Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Requirements Copilot"
      analyzedSubtitle={`AI scanned ${requirementInsights.length + 18} requirements across ${selectedProject.name} for ambiguity, missing acceptance criteria, missing non-functional requirements and weak controls.`}
      analyzedScope={[
        `${selectedProject.name}`,
        `${requirementInsights.length + 18} requirements`,
        `${requirementInsights.length} issues found`,
      ]}
      findings={findings}
      recommendations={recommendations}
      generationActions={[
        {
          id: 'brd',
          label: 'Generate BRD',
          artifactName: 'BRD.docx',
          icon: ArticleIcon,
          generatedBy: 'Requirements AI',
          preview: brdPreview,
        },
        {
          id: 'frd',
          label: 'Generate FRD',
          artifactName: 'FRD.docx',
          icon: DescriptionIcon,
          generatedBy: 'Requirements AI',
          preview: frdPreview,
        },
        {
          id: 'user-stories',
          label: 'Generate User Stories',
          artifactName: 'User_Stories.docx',
          icon: AssignmentTurnedInIcon,
          generatedBy: 'Requirements AI',
          preview: userStoriesPreview,
        },
        {
          id: 'acceptance-criteria',
          label: 'Generate Acceptance Criteria',
          artifactName: 'Acceptance_Criteria.docx',
          icon: ChecklistIcon,
          generatedBy: 'Requirements AI',
          preview: acceptanceCriteriaPreview,
        },
        {
          id: 'test-scenarios',
          label: 'Generate Test Scenarios',
          artifactName: 'Test_Scenarios.docx',
          icon: ScienceIcon,
          generatedBy: 'Requirements AI',
          preview: testScenariosPreview,
        },
        {
          id: 'traceability',
          label: 'Generate Traceability Matrix',
          artifactName: 'Requirement_Traceability_Matrix.xlsx',
          icon: AccountTreeIcon,
          generatedBy: 'Requirements AI',
          preview: traceabilityPreview,
        },
        {
          id: 'requirement-review',
          label: 'Generate Requirement Review',
          artifactName: 'Requirement_Review_Report.docx',
          icon: RateReviewIcon,
          generatedBy: 'Requirements AI',
          preview: reviewPreview,
        },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[
        {
          actionId: 'user-stories',
          artifactName: 'User_Stories.md',
          generatedAt: '09:24',
          generatedBy: 'Requirements AI',
          preview: userStoriesPreview,
        },
        {
          actionId: 'acceptance-criteria',
          artifactName: 'Acceptance_Criteria.md',
          generatedAt: '09:25',
          generatedBy: 'Requirements AI',
          preview: acceptanceCriteriaPreview,
        },
      ]}
      secondaryKpis={[
        { label: 'Issues Found', value: requirementInsights.length },
        { label: 'Ambiguous', value: counts.ambiguous ?? 0 },
        { label: 'Missing AC', value: counts['missing-ac'] ?? 0 },
        { label: 'Missing NFR', value: counts['missing-nfr'] ?? 0 },
        { label: 'Missing Control', value: counts['missing-control'] ?? 0 },
      ]}
    />
  );
}
