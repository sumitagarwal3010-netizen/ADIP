import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Chip, Collapse, FormControl, Grid, IconButton, InputLabel, MenuItem, Select,
  Typography, LinearProgress, Paper, TextField, CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HubIcon from '@mui/icons-material/Hub';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { CenterErrorBoundary } from '../components/common/CenterErrorBoundary';
import { EnterpriseArtifactWorkspace } from '../components/workflow/EnterpriseArtifactWorkspace';
import { colors } from '../theme/colors';
import {
  ECS_EVIDENCE_PROVIDER,
  EVIDENCE_COLLECTION_SUMMARY,
  EVIDENCE_HUB_LAST_SYNC,
  EVIDENCE_SOURCES,
  buildEvidencePackageBody,
  sourcesAfterCollection,
  type EvidenceSourceDetail,
} from '../data/enterpriseEvidenceHubData';

export type WorkflowActionId =
  | 'collect-evidence'
  | 'validate-evidence'
  | 'notify-owner'
  | 'submit-auditor'
  | 'prepare-framework'
  | 'executive-summary';

export interface WorkflowActionDef {
  id: WorkflowActionId;
  label: string;
  buttonLabel: string;
  completedTitle: string;
  steps: string[];
  intervalMs: number;
}

export const MAX_WORKFLOW_TIMELINE_STEPS = 5;

export const WORKFLOW_ACTIONS: WorkflowActionDef[] = [
  {
    id: 'collect-evidence',
    label: 'Collect Evidence',
    buttonLabel: 'Collect Evidence',
    completedTitle: 'Collect Evidence — Completed',
    intervalMs: 500,
    steps: [
      'Connect to enterprise sources',
      'Collect requirements and architecture evidence',
      'Collect code, security and test evidence',
      'Collect approvals and operational evidence',
      'Evidence collection completed',
    ],
  },
  {
    id: 'validate-evidence',
    label: 'Validate Evidence',
    buttonLabel: 'Validate Evidence',
    completedTitle: 'Validate Evidence — Completed',
    intervalMs: 520,
    steps: [
      'Load collected evidence',
      'Validate metadata and freshness',
      'Detect duplicates and missing attestations',
      'Map evidence to controls',
      'Validation completed',
    ],
  },
  {
    id: 'notify-owner',
    label: 'Notify Application Owner',
    buttonLabel: 'Send Notification',
    completedTitle: 'Notify Application Owner — Completed',
    intervalMs: 480,
    steps: [
      'Identify application owner and gaps',
      'Prepare evidence exception notification',
      'Send Outlook and Teams notification',
      'Assign response due date and escalation owner',
      'Notification delivered',
    ],
  },
  {
    id: 'submit-auditor',
    label: 'Submit for Internal Auditor Review',
    buttonLabel: 'Submit to Auditor',
    completedTitle: 'Submit for Internal Auditor Review — Completed',
    intervalMs: 550,
    steps: [
      'Assemble validated evidence package',
      'Attach owner responses and exceptions',
      'Attach control matrix and evidence index',
      'Assign submission ID and reviewer',
      'Submitted for auditor review',
    ],
  },
  {
    id: 'prepare-framework',
    label: 'Prepare Framework Submission',
    buttonLabel: 'Prepare Submission Pack',
    completedTitle: 'Prepare Framework Submission — Completed',
    intervalMs: 600,
    steps: [
      'Load validated evidence and framework catalogues',
      'Map evidence across CSITE, DPSC, PCI DSS, ITPP, RAF, VAPT and baselines',
      'Reuse evidence and identify control gaps',
      'Generate cross-framework submission packs',
      'Submit applicable packs for auditor review',
    ],
  },
  {
    id: 'executive-summary',
    label: 'Generate Executive Summary',
    buttonLabel: 'Generate Executive Summary',
    completedTitle: 'Generate Executive Summary — Completed',
    intervalMs: 500,
    steps: [
      'Consolidate evidence and framework status',
      'Calculate completeness and evidence reuse',
      'Summarize observations and owner actions',
      'Assess readiness and top risks',
      'Executive summary generated',
    ],
  },
];

/** @deprecated use WORKFLOW_ACTIONS submit-auditor steps in new tests */
export const SUBMIT_TIMELINE_STEPS = WORKFLOW_ACTIONS.find((a) => a.id === 'submit-auditor')!.steps;

export const FRAMEWORK_OPTIONS = [
  'CSITE',
  'DPSC',
  'PCI DSS',
  'ITPP',
  'RAF',
  'VAPT',
  'OS Baseline',
  'DB Baseline',
  'Middleware Baseline',
  'Internal Audit',
] as const;

export type FrameworkOption = (typeof FRAMEWORK_OPTIONS)[number];

export interface FrameworkResult {
  name: string;
  rows: [string, string][];
}

export const PREPARE_FRAMEWORK_TIMELINE_STEPS =
  WORKFLOW_ACTIONS.find((a) => a.id === 'prepare-framework')!.steps;

const GROUPED_EVIDENCE = [
  {
    group: 'Requirements',
    items: [
      { name: 'BRD_Biometric_Login_Mobile_Banking_v2.1.docx', count: 1 },
      { name: 'FRD_Authentication_Orchestrator_v1.4.docx', count: 1 },
      { name: 'Jira_UserStories_UPI_Release_24.6.xlsx', count: 14 },
      { name: 'Jira_Epics_Mobile_Banking_Q3.xlsx', count: 8 },
    ],
  },
  {
    group: 'Architecture',
    items: [
      { name: 'HLD_UPI_Switch_Resilience_v3.0.docx', count: 1 },
      { name: 'LLD_Fraud_Engine_Integration_v2.2.docx', count: 1 },
      { name: 'ADR-042_Circuit_Breaker_Pattern.pdf', count: 1 },
      { name: 'SharePoint_Target_Architecture_Baseline.pdf', count: 1 },
    ],
  },
  {
    group: 'Development',
    items: [
      { name: 'GitHub_PR_Merge_Approvals_UPI_24.6.csv', count: 13 },
      { name: 'GitHub_Commit_Lineage_Release_24.6.csv', count: 83 },
      { name: 'CICD_Build_Manifest_mobile-banking-9.2.json', count: 4 },
    ],
  },
  {
    group: 'Testing',
    items: [
      { name: 'Test_Execution_Summary_SIT_Biometric_Login.xlsx', count: 1 },
      { name: 'Regression_Pack_Payments_Core_v24.6.xlsx', count: 1 },
      { name: 'SonarQube_Code_Quality_Report_2026-07-11.pdf', count: 1 },
    ],
  },
  {
    group: 'Security',
    items: [
      { name: 'Prisma_Cloud_Scan_Summary_UPI_Switch.pdf', count: 1 },
      { name: 'Branch_Protection_Policy_Mobile_Banking.json', count: 3 },
      { name: 'Privileged_Access_Review_Q2_2026.xlsx', count: 1 },
    ],
  },
  {
    group: 'Operations',
    items: [
      { name: 'CICD_Deployment_Log_Prod_Mumbai_2026-07-10.log', count: 5 },
      { name: 'Rollback_Package_UPI_24.6.tar.gz', count: 2 },
      { name: 'ServiceNow_CAB_Approval_CHG-88421.pdf', count: 4 },
    ],
  },
  {
    group: 'Compliance',
    items: [
      { name: 'RBI_Cyber_Framework_Control_Matrix.xlsx', count: 42 },
      { name: 'PCI_DSS_Evidence_Rotation_Report.pdf', count: 1 },
      { name: 'Owner_Attestation_Gap_Register.xlsx', count: 5 },
      { name: 'ECS_Reusable_Audit_Baseline_Pack_v12.zip', count: 1 },
    ],
  },
];

export interface VisibleWorkflowPanel {
  actionId: WorkflowActionId;
  steps: string[];
  stepIndex: number;
  phase: 'running' | 'completed';
  completedTitle?: string;
  summary?: [string, string][];
  nextRecommended?: string;
  packBody?: string;
  packTitle?: string;
  frameworkResults?: FrameworkResult[];
  executiveStatement?: string;
}

export interface PersistedActionRun {
  actionId: WorkflowActionId;
  steps: string[];
  stepIndex: number;
  done: boolean;
  completedTitle: string;
  summary: [string, string][];
  nextRecommended?: string;
  packBody?: string;
  packTitle?: string;
  frameworkResults?: FrameworkResult[];
  executiveStatement?: string;
}

export interface WorkflowFlags {
  collectionDone: boolean;
  validationDone: boolean;
  notificationDone: boolean;
  auditorSubmissionDone: boolean;
  frameworkPackDone: boolean;
  executiveSummaryDone: boolean;
}

export function getPrimaryButtonLabel(actionId: WorkflowActionId): string {
  return WORKFLOW_ACTIONS.find((a) => a.id === actionId)?.buttonLabel ?? 'Run Action';
}

export function checkPrerequisite(
  actionId: WorkflowActionId,
  flags: WorkflowFlags,
): { ok: boolean; message?: string; recommended?: string } {
  switch (actionId) {
    case 'collect-evidence':
      return { ok: true };
    case 'validate-evidence':
      if (!flags.collectionDone) {
        return { ok: false, message: 'Complete Collect Evidence before validation.', recommended: 'Collect Evidence' };
      }
      return { ok: true };
    case 'notify-owner':
      if (!flags.validationDone) {
        return { ok: false, message: 'Run Validate Evidence to identify gaps before notifying the owner.', recommended: 'Validate Evidence' };
      }
      return { ok: true };
    case 'submit-auditor':
      if (!flags.collectionDone || !flags.validationDone) {
        return {
          ok: false,
          message: 'Submit to Auditor requires completed collection and validation.',
          recommended: !flags.collectionDone ? 'Collect Evidence' : 'Validate Evidence',
        };
      }
      return { ok: true };
    case 'prepare-framework':
      if (!flags.auditorSubmissionDone) {
        return {
          ok: false,
          message: 'Prepare Framework Submission requires auditor submission or approval.',
          recommended: 'Submit for Internal Auditor Review',
        };
      }
      return { ok: true };
    case 'executive-summary':
      return { ok: true };
    default:
      return { ok: true };
  }
}

export function buildPrepareFrameworkSummary(): {
  summary: [string, string][];
  frameworkResults: FrameworkResult[];
  executiveStatement: string;
  packBody: string;
  packTitle: string;
} {
  const s = EVIDENCE_COLLECTION_SUMMARY;
  const frameworksEvaluated = FRAMEWORK_OPTIONS.length;
  const controlsEvaluated = 184;
  const controlsMapped = 176;
  const controlsWithGaps = 8;
  const evidenceReused = s.ecsReusableRecords;
  const reusePct = Math.round((evidenceReused / s.recordsCollected) * 100);

  const summary: [string, string][] = [
    ['Frameworks evaluated', String(frameworksEvaluated)],
    ['Controls mapped', String(controlsMapped)],
    ['Evidence reused', String(evidenceReused)],
    ['Controls with gaps', String(controlsWithGaps)],
    ['Packs submitted', 'CSITE · DPSC · PCI DSS · ITPP'],
    ['Readiness score', `${s.validationScore}%`],
  ];

  const frameworkResults: FrameworkResult[] = [
    {
      name: 'CSITE',
      rows: [
        ['Controls mapped', '28'],
        ['Evidence reused', '42'],
        ['Observations', '6'],
        ['Status', 'Submitted for Auditor Review'],
      ],
    },
    {
      name: 'DPSC',
      rows: [
        ['Controls mapped', '24'],
        ['Evidence reused', '38'],
        ['Observations', '5'],
        ['Status', 'Submitted for Auditor Review'],
      ],
    },
    {
      name: 'PCI DSS',
      rows: [
        ['Controls mapped', '32'],
        ['Evidence reused', '45'],
        ['Status', 'Submitted for Auditor Review'],
      ],
    },
    {
      name: 'ITPP',
      rows: [
        ['Controls mapped', '22'],
        ['Evidence reused', '35'],
        ['Status', 'Submitted for Auditor Review'],
      ],
    },
    {
      name: 'RAF',
      rows: [
        ['Readiness score', '87%'],
        ['Gaps identified', '3'],
        ['Status', 'Prepared'],
      ],
    },
    {
      name: 'VAPT',
      rows: [
        ['Findings mapped', '18'],
        ['Closure evidence attached', '14'],
        ['Status', 'Submitted for Review'],
      ],
    },
    {
      name: 'OS Baseline',
      rows: [
        ['Controls mapped', '16'],
        ['Status', 'Ready'],
      ],
    },
    {
      name: 'DB Baseline',
      rows: [
        ['Controls mapped', '14'],
        ['Status', 'Ready'],
      ],
    },
    {
      name: 'Middleware Baseline',
      rows: [
        ['Controls mapped', '12'],
        ['Status', 'Ready'],
      ],
    },
    {
      name: 'Internal Audit',
      rows: [
        ['Observations mapped', '11'],
        ['Evidence attached', '28'],
        ['Status', 'Submitted for Auditor Review'],
      ],
    },
  ];

  const executiveStatement =
    `${s.recordsCollected} evidence records were mapped across ${frameworksEvaluated} frameworks and ${controlsEvaluated} controls. ` +
    `${evidenceReused} reusable evidence items supported multiple frameworks. ` +
    'Submission packs were prepared for CSITE, DPSC, PCI DSS and ITPP and submitted for auditor review.';

  const packBody = [
    'Cross-Framework Submission Pack',
    `Generated: ${EVIDENCE_HUB_LAST_SYNC}`,
    '',
    'Outputs:',
    '- Evidence Index — Cross_Framework_Evidence_Index_2026-07-11.xlsx',
    '- Cross-Framework Control Matrix — Cross_Framework_Control_Matrix_v3.xlsx',
    '- Evidence Reuse Matrix — Evidence_Reuse_Matrix_2026-07-11.xlsx',
    '- Observation Mapping Register — Observation_Mapping_Register_2026-07-11.xlsx',
    '- Exception Register — Cross_Framework_Exception_Register.xlsx',
    '- Owner Attestation Report — Owner_Attestation_Report_2026-07-11.pdf',
    '- Auditor Review Note — Auditor_Review_Note_Framework_Submission.pdf',
    '- Framework Submission Summary — Framework_Submission_Summary_2026-07-11.pdf',
    '',
    executiveStatement,
    '',
    `Evidence collected: ${s.recordsCollected} · Controls mapped: ${controlsMapped} · Reuse: ${reusePct}%`,
  ].join('\n');

  return {
    summary,
    frameworkResults,
    executiveStatement,
    packBody,
    packTitle: 'Cross-Framework Submission Pack',
  };
}

export function buildActionSummary(
  actionId: WorkflowActionId,
  _flags: WorkflowFlags,
): { summary: [string, string][]; nextRecommended?: string; packBody?: string; packTitle?: string; frameworkResults?: FrameworkResult[]; executiveStatement?: string } {
  const s = EVIDENCE_COLLECTION_SUMMARY;
  switch (actionId) {
    case 'collect-evidence':
      return {
        summary: [
          ['Records collected', String(s.recordsCollected)],
          ['Sources processed', String(s.sourcesProcessed)],
          ['Reusable evidence', String(s.reusableRecords)],
          ['Missing evidence', `${s.missingOwnerAttestations} attestations · 3 stale links`],
        ],
        nextRecommended: 'Validate Evidence',
      };
    case 'validate-evidence':
      return {
        summary: [
          ['Records validated', String(s.recordsCollected)],
          ['Controls mapped', String(s.controlsMapped)],
          ['Stale evidence', '3 links'],
          ['Missing attestations', String(s.missingOwnerAttestations)],
          ['Validation score', `${s.validationScore}%`],
        ],
        nextRecommended: 'Notify Application Owner',
      };
    case 'notify-owner':
      return {
        summary: [
          ['Owner', 'Priya Mehta — Mobile Banking'],
          ['Notification status', 'Sent via Outlook / Teams'],
          ['Missing items', '5 attestations · 1 DR sign-off'],
          ['Response due date', '18 Jul 2026'],
          ['Escalation owner', 'Release Governance Lead'],
        ],
        nextRecommended: 'Submit for Internal Auditor Review',
      };
    case 'submit-auditor':
      return {
        summary: [
          ['Submission ID', 'EVP-2026-07-11-001'],
          ['Reviewer', 'Internal Audit — Enterprise Technology'],
          ['Evidence count', String(s.recordsCollected)],
          ['Exceptions', '5 attestations · 1 stale sign-off'],
          ['Status', 'Submitted for Auditor Review'],
        ],
        nextRecommended: 'Prepare Framework Submission',
        packTitle: 'Internal Auditor Evidence Pack',
        packBody: buildEvidencePackageBody(s),
      };
    case 'prepare-framework': {
      const built = buildPrepareFrameworkSummary();
      return {
        summary: built.summary,
        frameworkResults: built.frameworkResults,
        executiveStatement: built.executiveStatement,
        nextRecommended: 'Generate Executive Summary',
        packTitle: built.packTitle,
        packBody: built.packBody,
      };
    }
    case 'executive-summary':
      return {
        summary: [
          ['Applications covered', '4'],
          ['Evidence collected', String(s.recordsCollected)],
          ['Evidence reuse', `${Math.round((s.ecsReusableRecords / s.recordsCollected) * 100)}%`],
          ['Frameworks covered', '10'],
          ['Open observations', '7'],
          ['Readiness score', `${s.validationScore}%`],
          ['Top risks', 'Owner attestations, DR sign-off, CAB timing'],
          ['Recommended action', 'Close exceptions and complete auditor review'],
        ],
      };
    default:
      return { summary: [] };
  }
}

export function flagsAfterAction(actionId: WorkflowActionId, prev: WorkflowFlags): WorkflowFlags {
  const next = { ...prev };
  switch (actionId) {
    case 'collect-evidence':
      return { collectionDone: true, validationDone: false, notificationDone: false, auditorSubmissionDone: false, frameworkPackDone: false, executiveSummaryDone: false };
    case 'validate-evidence':
      next.validationDone = true;
      return next;
    case 'notify-owner':
      next.notificationDone = true;
      return next;
    case 'submit-auditor':
      next.auditorSubmissionDone = true;
      return next;
    case 'prepare-framework':
      next.frameworkPackDone = true;
      return next;
    case 'executive-summary':
      next.executiveSummaryDone = true;
      return next;
    default:
      return next;
  }
}

export function resetSubmissionWorkflowState(setters: {
  setSubmitting: (v: boolean) => void;
  setSubmitDone: (v: boolean) => void;
  setSubmitStepIndex: (v: number) => void;
  setSubmission: (v: null) => void;
  setPackViewerOpen: (v: boolean) => void;
}) {
  setters.setSubmitting(false);
  setters.setSubmitDone(false);
  setters.setSubmitStepIndex(-1);
  setters.setSubmission(null);
  setters.setPackViewerOpen(false);
}

type TimelineStatus = 'pending' | 'active' | 'done';

function CompactSummaryGrid({ rows }: { rows: [string, string][] }) {
  return (
    <Grid container spacing={0.5} sx={{ mt: 0.5 }} data-testid="compact-workflow-summary">
      {rows.map(([label, value]) => (
        <Grid key={label} size={{ xs: 6 }}>
          <Box
            sx={{
              p: 0.5,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${colors.border.subtle}`,
              height: '100%',
            }}
            data-testid={`executive-summary-field-${label.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', lineHeight: 1.2 }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', display: 'block', lineHeight: 1.25, mt: 0.15 }}>
              {value}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

function CompactSummary({ rows }: { rows: [string, string][] }) {
  return (
    <Box sx={{ mt: 0.75 }} data-testid="compact-workflow-summary">
      {rows.map(([label, value]) => (
        <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'right', fontSize: '0.65rem', maxWidth: '62%' }}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function TimelineList({
  steps,
  activeIndex,
  completed = false,
}: {
  steps: string[];
  activeIndex: number;
  completed?: boolean;
}) {
  return (
    <Box sx={{ mt: 0.5, pl: 0.25, minHeight: 108, maxHeight: 108, overflow: 'hidden' }} data-testid="workflow-timeline">
      {steps.map((label, i) => {
        const status: TimelineStatus = completed || i < activeIndex
          ? 'done'
          : i === activeIndex
            ? 'active'
            : 'pending';
        const isLast = i === steps.length - 1;
        return (
          <Box key={`${label}-${i}`} sx={{ display: 'flex', gap: 0.75 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              <Box
                data-testid={
                  status === 'done'
                    ? `timeline-step-done-${i}`
                    : status === 'active'
                      ? `timeline-step-active-${i}`
                      : `timeline-step-pending-${i}`
                }
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 20 }}
              >
                {status === 'done' ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
                ) : status === 'active' ? (
                  <CircularProgress size={14} thickness={5} sx={{ color: colors.primary }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                )}
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 12,
                    bgcolor: status === 'done' ? colors.success : colors.border.subtle,
                    opacity: status === 'pending' ? 0.35 : 1,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: status === 'active' ? 700 : 500,
                color: status === 'done' ? colors.success : status === 'active' ? colors.primary : colors.text.secondary,
                flex: 1,
                pb: isLast ? 0 : 0.35,
                opacity: status === 'pending' ? 0.5 : 1,
                fontSize: '0.65rem',
                lineHeight: 1.3,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function FrameworkResultsGrid({ results }: { results: FrameworkResult[] }) {
  return (
    <Grid container spacing={1} sx={{ mt: 1.5 }}>
      {results.map((fw) => (
        <Grid key={fw.name} size={{ xs: 12, sm: 6, md: 4 }}>
          <Box
            sx={{ p: 0.75, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border.subtle}` }}
            data-testid={`framework-result-${fw.name.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{fw.name}</Typography>
            {fw.rows.map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'right', fontSize: '0.65rem' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

function SummaryGrid({ rows }: { rows: [string, string][] }) {
  return <CompactSummary rows={rows} />;
}

export function ConnectorArtifactWorkbench() {
  const [selectedAction, setSelectedAction] = useState<WorkflowActionId>('collect-evidence');
  const [workflowFlags, setWorkflowFlags] = useState<WorkflowFlags>({
    collectionDone: false,
    validationDone: false,
    notificationDone: false,
    auditorSubmissionDone: false,
    frameworkPackDone: false,
    executiveSummaryDone: false,
  });
  const [visiblePanel, setVisiblePanel] = useState<VisibleWorkflowPanel | null>(null);
  const [frameworkDetailResults, setFrameworkDetailResults] = useState<FrameworkResult[] | null>(null);
  const [frameworkExecutiveStatement, setFrameworkExecutiveStatement] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<WorkflowActionId | null>(null);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requirement, setRequirement] = useState('');
  const defaultRequirement = 'Describe the requirement for the evidence pack';
  const [copied, setCopied] = useState(false);
  const [packViewerOpen, setPackViewerOpen] = useState(false);
  const [viewerPack, setViewerPack] = useState<{ title: string; body: string } | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const packViewerRef = useRef<HTMLDivElement | null>(null);
  const actionTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const sources: EvidenceSourceDetail[] = useMemo(
    () => (workflowFlags.collectionDone ? sourcesAfterCollection() : EVIDENCE_SOURCES),
    [workflowFlags.collectionDone],
  );

  const collectionSummary = workflowFlags.collectionDone ? EVIDENCE_COLLECTION_SUMMARY : null;
  const primaryLabel = getPrimaryButtonLabel(selectedAction);
  const isRunning = runningAction !== null;
  const activeActionDef = visiblePanel
    ? WORKFLOW_ACTIONS.find((a) => a.id === visiblePanel.actionId)
    : null;
  const progressValue = visiblePanel && activeActionDef
    ? Math.min(100, Math.round((visiblePanel.stepIndex / activeActionDef.steps.length) * 100))
    : 0;

  useEffect(() => () => {
    if (actionTimer.current) clearInterval(actionTimer.current);
  }, []);

  const cancelWorkflowTimer = () => {
    if (actionTimer.current) {
      clearInterval(actionTimer.current);
      actionTimer.current = null;
    }
    setRunningAction(null);
  };

  const handleCopy = async () => {
    if (!viewerPack?.body) return;
    await navigator.clipboard.writeText(viewerPack.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (body: string, filename: string) => {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewPack = (title: string, body: string) => {
    setViewerPack({ title, body });
    setPackViewerOpen(true);
    requestAnimationFrame(() => {
      packViewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const resetDownstreamFrom = (actionId: WorkflowActionId) => {
    const order: WorkflowActionId[] = [
      'collect-evidence',
      'validate-evidence',
      'notify-owner',
      'submit-auditor',
      'prepare-framework',
      'executive-summary',
    ];
    const idx = order.indexOf(actionId);
    if (idx <= order.indexOf('prepare-framework')) {
      setFrameworkDetailResults(null);
      setFrameworkExecutiveStatement(null);
    }
    setWorkflowFlags((prev) => {
      const next = { ...prev };
      if (actionId === 'collect-evidence') {
        return { collectionDone: false, validationDone: false, notificationDone: false, auditorSubmissionDone: false, frameworkPackDone: false, executiveSummaryDone: false };
      }
      if (idx < order.indexOf('validate-evidence')) next.validationDone = false;
      if (idx < order.indexOf('notify-owner')) next.notificationDone = false;
      if (idx < order.indexOf('submit-auditor')) next.auditorSubmissionDone = false;
      if (idx < order.indexOf('prepare-framework')) next.frameworkPackDone = false;
      if (idx < order.indexOf('executive-summary')) next.executiveSummaryDone = false;
      return next;
    });
  };

  const runTimeline = (
    action: WorkflowActionDef,
    onComplete: () => void,
  ) => {
    cancelWorkflowTimer();
    setRunningAction(action.id);
    setVisiblePanel({
      actionId: action.id,
      steps: action.steps,
      stepIndex: 0,
      phase: 'running',
    });

    let step = 0;
    actionTimer.current = setInterval(() => {
      step += 1;
      if (step >= action.steps.length) {
        if (actionTimer.current) clearInterval(actionTimer.current);
        actionTimer.current = null;
        onComplete();
        return;
      }
      setVisiblePanel((prev) => (prev ? { ...prev, stepIndex: step } : prev));
    }, action.intervalMs);
  };

  const handlePrimaryAction = () => {
    const action = WORKFLOW_ACTIONS.find((a) => a.id === selectedAction)!;
    const prereq = checkPrerequisite(selectedAction, workflowFlags);
    if (!prereq.ok) {
      setError(`${prereq.message} Recommended prior action: ${prereq.recommended}.`);
      return;
    }
    if (isRunning) return;

    cancelWorkflowTimer();
    setError(null);
    setVisiblePanel(null);

    if (selectedAction === 'collect-evidence') {
      resetDownstreamFrom('collect-evidence');
    }

    runTimeline(action, () => {
      const prompt = requirement.trim() || defaultRequirement;
      setWorkflowFlags((prev) => {
        const next = flagsAfterAction(selectedAction, prev);
        const built = buildActionSummary(selectedAction, next);
        const packBody = built.packBody
          ? `${built.packBody}\n\nRequirement / prompt\n- ${prompt}`
          : undefined;

        setVisiblePanel({
          actionId: selectedAction,
          steps: action.steps,
          stepIndex: action.steps.length,
          phase: 'completed',
          completedTitle: action.completedTitle,
          summary: built.summary,
          nextRecommended: built.nextRecommended,
          packBody,
          packTitle: built.packTitle,
        });
        if (built.frameworkResults) {
          setFrameworkDetailResults(built.frameworkResults);
          setFrameworkExecutiveStatement(built.executiveStatement ?? null);
        }
        return next;
      });
      setRunningAction(null);
      setActiveStep(Math.min(4, WORKFLOW_ACTIONS.findIndex((a) => a.id === selectedAction) + 1));
    });
  };

  const handleActionSelect = (actionId: WorkflowActionId) => {
    cancelWorkflowTimer();
    setSelectedAction(actionId);
    setError(null);
    setVisiblePanel(null);
  };

  return (
    <CenterErrorBoundary title="Enterprise Evidence Hub">
      <Box>
        <EnterpriseArtifactWorkspace pillar="Enterprise AI" submenu="Enterprise Evidence Hub" />

        <GlassCard sx={{ p: 2, mb: 1.5, mt: 0.5 }} glow="blue" hover={false}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
            Enterprise Sources → ECS (reusable evidence) → ADIP Enterprise Evidence Hub → AI SDLC / Governance outputs
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '0.68rem' }}>
            ADIP aggregates and reuses evidence for AI SDLC workflows. ECS remains a separately deployable evidence platform — evidence supplied by ECS is consumed here, not owned by ADIP.
          </Typography>
          <Alert severity="info" sx={{ mb: 1, py: 0.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Enterprise Demo Mode</Typography>
            Using enterprise connector simulation. Production deployment uses live enterprise connectors.
          </Alert>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip size="small" color="success" label="enterprise demo" />
            <Chip size="small" label={`${sources.length + 1} provider(s)`} />
            <Chip size="small" label={['Enterprise Sources', 'Evidence Collection', 'AI Validation', 'Generated Pack', 'Approval / Publish'][activeStep]} />
          </Box>
          {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}

          <Box
            sx={{
              mb: 1,
              p: 1,
              minHeight: 248,
              maxHeight: 248,
              borderRadius: 1,
              bgcolor: colors.bg.glass,
              border: `1px solid ${colors.border.subtle}`,
              overflow: 'hidden',
            }}
            data-testid="active-workflow-panel"
            data-action-id={visiblePanel?.actionId ?? ''}
          >
            {!visiblePanel || !activeActionDef ? (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                Select an action and run the primary button to begin.
              </Typography>
            ) : (
              <>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }} data-testid="workflow-panel-title">
                  {visiblePanel.phase === 'completed'
                    ? visiblePanel.completedTitle
                    : `${activeActionDef.label} — In Progress`}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.5 }} data-testid="workflow-panel-status">
                  {visiblePanel.phase === 'completed' ? 'Completed' : `Step ${Math.min(visiblePanel.stepIndex + 1, activeActionDef.steps.length)} of ${activeActionDef.steps.length}`}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{ mb: 0.75, height: 5, borderRadius: 1 }}
                  data-testid="workflow-progress-bar"
                />
                {visiblePanel.phase !== 'completed' && (
                  <TimelineList
                    steps={visiblePanel.steps}
                    activeIndex={visiblePanel.stepIndex}
                  />
                )}
                {visiblePanel.phase === 'completed' && visiblePanel.summary && (
                  <Box
                    data-testid={`action-result-${visiblePanel.actionId}`}
                    sx={visiblePanel.actionId === 'executive-summary' ? { mt: 0.25, overflow: 'visible' } : undefined}
                  >
                    {visiblePanel.actionId === 'executive-summary' ? (
                      <CompactSummaryGrid rows={visiblePanel.summary} />
                    ) : (
                      <SummaryGrid rows={visiblePanel.summary} />
                    )}
                    {visiblePanel.nextRecommended && visiblePanel.actionId !== 'executive-summary' && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.75, fontWeight: 600, color: colors.secondary, fontSize: '0.65rem' }}>
                        Next: {visiblePanel.nextRecommended}
                      </Typography>
                    )}
                    {visiblePanel.packBody && visiblePanel.actionId !== 'executive-summary' && (
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.75 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewPack(visiblePanel.packTitle ?? 'Evidence Pack', visiblePanel.packBody!)}
                        >
                          View Evidence Pack
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(visiblePanel.packBody!, `${visiblePanel.actionId}_pack.txt`)}
                        >
                          Download Evidence Pack
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        </GlassCard>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="1. Evidence Action" subtitle="Select workflow action — one primary button drives execution" />
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={selectedAction}
                  label="Action"
                  data-testid="workflow-action-select"
                  onChange={(e) => handleActionSelect(e.target.value as WorkflowActionId)}
                >
                  {WORKFLOW_ACTIONS.map((uc) => (
                    <MenuItem key={uc.id} value={uc.id}>{uc.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={3}
                sx={{ mb: 1.5 }}
                label="Requirement / prompt"
                value={requirement}
                placeholder={defaultRequirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
              <Button
                size="small"
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                onClick={handlePrimaryAction}
                disabled={isRunning}
                data-testid="primary-action-button"
              >
                {primaryLabel}
              </Button>
            </GlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="2. ECS Evidence Provider" subtitle="External reusable evidence platform" />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <HubIcon sx={{ fontSize: 18, color: colors.secondary }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{ECS_EVIDENCE_PROVIDER.provider} — {ECS_EVIDENCE_PROVIDER.providerType}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.75 }}>
                ECS collects, validates, stores, versions and governs enterprise evidence. ADIP consumes reusable packs — ECS is separately deployable.
              </Typography>
              {[
                ['Mode', 'Enterprise connector simulation'],
                ['Status', ECS_EVIDENCE_PROVIDER.status],
                ['Authentication', 'Enterprise SSO (simulated)'],
                ['Evidence packs', String(ECS_EVIDENCE_PROVIDER.evidencePacksAvailable)],
                ['Last sync', ECS_EVIDENCE_PROVIDER.lastSync],
                ['Reuse scope', ECS_EVIDENCE_PROVIDER.reuseScope.join(', ')],
                ['Source ownership', ECS_EVIDENCE_PROVIDER.sourceOwnership],
                ['Consumer', ECS_EVIDENCE_PROVIDER.consumer],
              ].map(([k, v]) => (
                <Box key={k} sx={{ py: 0.35, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">{k}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'right' }}>{v}</Typography>
                </Box>
              ))}
              <Chip size="small" sx={{ mt: 1 }} label="Powered by reusable evidence from ECS" color="secondary" variant="outlined" />
            </GlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="3. Collection Summary" subtitle={collectionSummary ? collectionSummary.title : 'Run Collect Evidence to populate'} />
              {collectionSummary ? (
                <Box sx={{ fontSize: '0.7rem', color: colors.text.secondary }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>Collected: {collectionSummary.collectedAt}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>Sources processed: {collectionSummary.sourcesProcessed}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>Records collected: {collectionSummary.recordsCollected}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>Reusable records: {collectionSummary.reusableRecords}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>New records: {collectionSummary.newRecords}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>Controls mapped: {collectionSummary.controlsMapped}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>Missing owner attestations: {collectionSummary.missingOwnerAttestations}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mt: 0.5 }}>Validation score: {collectionSummary.validationScore}%</Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No collection run yet. Select Collect Evidence and run the primary action.</Typography>
              )}
            </GlassCard>
          </Grid>

          {frameworkDetailResults && frameworkDetailResults.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <GlassCard sx={{ p: 2 }} data-testid="framework-detail-section">
                <ModuleHeader title="Framework Submission Results" subtitle="Detailed framework mapping — expand manually as needed" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1, fontSize: '0.65rem', fontStyle: 'italic' }}
                  data-testid="framework-executive-statement"
                >
                  {frameworkExecutiveStatement}
                </Typography>
                <FrameworkResultsGrid results={frameworkDetailResults} />
              </GlassCard>
            </Grid>
          )}

          {workflowFlags.collectionDone && (
            <Grid size={{ xs: 12 }}>
              <GlassCard sx={{ p: 2 }}>
                <ModuleHeader title="Collected Evidence by SDLC Group" subtitle="Grouped inventory with filenames and counts" />
                <Grid container spacing={1.5}>
                  {GROUPED_EVIDENCE.map((section) => (
                    <Grid key={section.group} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}`, height: '100%' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary, display: 'block', mb: 0.75 }}>
                          {section.group}
                        </Typography>
                        {section.items.map((item) => (
                          <Box key={item.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.35 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', wordBreak: 'break-word' }}>
                              {item.name}
                            </Typography>
                            <Chip size="small" label={item.count} sx={{ height: 18, fontSize: '0.6rem', flexShrink: 0 }} />
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </GlassCard>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <GlassCard sx={{ p: 2 }}>
              <ModuleHeader title="Connected Evidence Sources" subtitle="What was collected · provider · reuse · ADIP consumer workflows" />
              {sources.map((source) => {
                const open = expandedSource === source.id;
                return (
                  <Box key={source.id} sx={{ borderBottom: `1px solid ${colors.border.subtle}`, py: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <IconButton size="small" onClick={() => setExpandedSource(open ? null : source.id)} aria-label={`Expand ${source.name}`}>
                        <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', fontSize: 18 }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 100 }}>{source.name}</Typography>
                      <Chip size="small" label={source.status} color={source.status === 'Collected' ? 'success' : 'default'} />
                      <Chip size="small" variant="outlined" label={source.providerMode} />
                      <Chip size="small" variant="outlined" label={`${source.totalRecords} records`} />
                      <Chip size="small" label={source.reuseStatus} />
                    </Box>
                    <Collapse in={open}>
                      <Box sx={{ pl: 4, pt: 0.75, pb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Collection: {source.collectionMethod} · Last collected: {source.lastCollected}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.25 }}>
                          ADIP workflows: {source.consumerWorkflows.join(' · ')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                          {source.counts.map((c) => (
                            <Chip key={c.label} size="small" label={`${c.count} ${c.label}`} />
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </GlassCard>
          </Grid>

          {viewerPack && packViewerOpen && (
            <Grid size={{ xs: 12 }} ref={packViewerRef}>
              <GlassCard sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <ModuleHeader title={viewerPack.title} subtitle="Evidence pack preview" />
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(viewerPack.body, `${viewerPack.title.replace(/\s+/g, '_')}.txt`)}
                  >
                    Download
                  </Button>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 360, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 13 }}>
                  {viewerPack.body}
                </Paper>
              </GlassCard>
            </Grid>
          )}
        </Grid>
      </Box>
    </CenterErrorBoundary>
  );
}
