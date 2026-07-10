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
  const {
    requirementInsights,
    selectedProject,
    orchestrationActive,
    orchestration,
    requirementArtifactPackage,
  } = useCopilot();

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


  const packageArtifacts = requirementArtifactPackage?.artifacts as Record<
    string,
    { name: string; content: string; metadata?: Record<string, string> }
  > | undefined;
  const packagePreview = (key: string) => packageArtifacts?.[key]?.content ?? '';
  const packageName = (key: string, fallback: string) =>
    packageArtifacts?.[key]?.name?.trim() ? packageArtifacts[key].name : fallback;
  const packageGeneratedBy = (key: string) =>
    packageArtifacts?.[key]?.metadata?.generated_by ?? 'Requirements Copilot (Deterministic Demo)';
  const canGenerateDeterministic =
    !!requirementArtifactPackage && requirementArtifactPackage.source !== 'failed';

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'sa-1', priority: 'P1', owner: 'Product Owner — UPI', label: 'Resolve REQ-2014 ambiguity on UPI auto-refund window', detail: 'Confirm the 5-minute SLA against NPCI reversal rules and lock acceptance criteria before sprint commit.' },
    { id: 'sa-2', priority: 'P1', owner: 'BA — Payments', label: 'Add missing controls to NEFT/RTGS evidence requirements', detail: 'Map REQ-2055 to RBI-MO-12.4 so audit pulls are zero-touch.' },
    { id: 'sa-3', priority: 'P2', owner: 'BA — Cards', label: 'Define NFRs for Cards tokenization latency & throughput', detail: 'No performance thresholds captured for the card-on-file tokenization story.' },
    { id: 'sa-4', priority: 'P2', owner: 'Product Owner — Loans', label: 'Stabilize frequently-changing Loans eligibility rules', detail: 'Freeze the personal-loan eligibility requirement for this sprint to stop downstream rework.' },
    { id: 'sa-5', priority: 'P3', owner: 'Scrum Master', label: 'Adopt the generated user stories & AC pack into the backlog', detail: 'Import the Copilot-drafted stories for Mobile Banking and Net Banking journeys.' },
  ];

  // When a prompt is active, show prompt-relevant requirements from the shared
  // orchestration; otherwise fall back to the project's requirement insights.
  const reqPhase = orchestration.phases.requirements;
  const shownFindings = orchestrationActive ? reqPhase.findings : findings;
  const shownRecommendations = orchestrationActive ? reqPhase.recommendations : recommendations;
  const shownSubtitle = orchestrationActive
    ? reqPhase.analyzedSubtitle
    : `AI scanned ${requirementInsights.length + 18} requirements across ${selectedProject.name} for ambiguity, missing acceptance criteria, missing non-functional requirements and weak controls.`;
  const shownScope = orchestrationActive
    ? [`Prompt: ${orchestration.scenario.label}`, ...reqPhase.analyzedScope, `${reqPhase.scoreLabel}: ${reqPhase.score}/100`]
    : [`${selectedProject.name}`, `${requirementInsights.length + 18} requirements`, `${requirementInsights.length} issues found`];
  const shownReasoning = orchestrationActive
    ? { steps: reqPhase.reasoning.steps.map((s) => s.text), confidence: reqPhase.reasoning.confidence }
    : undefined;

  return (
    <CopilotSection
      title="Requirements Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Requirements Copilot"
      analyzedSubtitle={shownSubtitle}
      analyzedScope={shownScope}
      reasoning={shownReasoning}
      findings={shownFindings}
      recommendations={shownRecommendations}
      generationActions={[
        {
          id: 'brd',
          label: 'Generate BRD',
          artifactName: packageName('brd', 'BRD.docx'),
          icon: ArticleIcon,
          generatedBy: packageGeneratedBy('brd'),
          preview: packagePreview('brd'),
        },
        {
          id: 'frd',
          label: 'Generate FRD',
          artifactName: packageName('frd', 'FRD.docx'),
          icon: DescriptionIcon,
          generatedBy: packageGeneratedBy('frd'),
          preview: packagePreview('frd'),
        },
        {
          id: 'user-stories',
          label: 'Generate User Stories',
          artifactName: packageName('user_stories', 'User_Stories.docx'),
          icon: AssignmentTurnedInIcon,
          generatedBy: packageGeneratedBy('user_stories'),
          preview: packagePreview('user_stories'),
        },
        {
          id: 'acceptance-criteria',
          label: 'Generate Acceptance Criteria',
          artifactName: packageName('acceptance_criteria', 'Acceptance_Criteria.docx'),
          icon: ChecklistIcon,
          generatedBy: packageGeneratedBy('acceptance_criteria'),
          preview: packagePreview('acceptance_criteria'),
        },
        {
          id: 'test-scenarios',
          label: 'Generate Test Scenarios',
          artifactName: packageName('test_scenarios', 'Test_Scenarios.docx'),
          icon: ScienceIcon,
          generatedBy: packageGeneratedBy('test_scenarios'),
          preview: packagePreview('test_scenarios'),
        },
        {
          id: 'traceability',
          label: 'Generate Traceability Matrix',
          artifactName: packageName('traceability_matrix', 'Requirement_Traceability_Matrix.xlsx'),
          icon: AccountTreeIcon,
          generatedBy: packageGeneratedBy('traceability_matrix'),
          preview: packagePreview('traceability_matrix'),
        },
        {
          id: 'requirement-review',
          label: 'Generate Requirement Review',
          artifactName: packageName('requirement_review', 'Requirement_Review_Report.docx'),
          icon: RateReviewIcon,
          generatedBy: packageGeneratedBy('requirement_review'),
          preview: packagePreview('requirement_review'),
        },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[]}
      canGenerate={canGenerateDeterministic}
      generationDisabledMessage="No approved deterministic template exists for this request."
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
