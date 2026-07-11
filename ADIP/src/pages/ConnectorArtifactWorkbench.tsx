import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
  Alert, Box, Button, Chip, Collapse, FormControl, Grid, IconButton, InputLabel, MenuItem, Select,
  Typography, LinearProgress, Paper, TextField,
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

const COLLECTION_TIMELINE_STEPS = [
  'Connecting to Jira...',
  'Collecting User Stories...',
  'Connecting to Confluence...',
  'Collecting HLD...',
  'Collecting LLD...',
  'Connecting to SharePoint...',
  'Collecting BRD...',
  'Collecting FRD...',
  'Connecting to SonarQube...',
  'Collecting Code Quality...',
  'Connecting to Prisma...',
  'Collecting Security Scan...',
  'Connecting to ServiceNow...',
  'Collecting CAB Approval...',
  'Collecting Release Approval...',
];

export const SUBMIT_TIMELINE_STEPS = [
  'Packaging Evidence...',
  'Mapping Controls...',
  'Running AI Validation...',
  'Checking Completeness...',
  'Submitting Evidence Pack...',
  'Submitted Successfully.',
];
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

const SUBMIT_STEP_ELAPSED = ['0.45s', '0.40s', '0.50s', '0.42s', '0.48s', '0.35s'];

const EVIDENCE_PACK_SUBMISSION = {
  packId: 'EVP-2026-07-11-001',
  version: 'EP-2026.07.11-001',
  submittedAt: EVIDENCE_HUB_LAST_SYNC,
  status: 'Submitted for Auditor Review',
  submittedTo: 'Enterprise Audit & Compliance Review Queue',
  frameworksMapped: ['RBI Cyber Security', 'PCI-DSS 4.0', 'ISO 27001', 'SOX ITGC'],
  validationScore: EVIDENCE_COLLECTION_SUMMARY.validationScore,
  evidenceCount: EVIDENCE_COLLECTION_SUMMARY.recordsCollected,
  sourcesProcessed: EVIDENCE_COLLECTION_SUMMARY.sourcesProcessed,
  controlsMapped: EVIDENCE_COLLECTION_SUMMARY.controlsMapped,
  missingEvidence: '5 owner attestations · 1 stale DR drill sign-off',
  readyForDownstream: 'Requirements · Design · Development · Release · Compliance · AI SDLC',
};

type TimelineStatus = 'pending' | 'active' | 'done';

function TimelineList({
  steps,
  activeIndex,
  completed = false,
  stepElapsedLabels,
}: {
  steps: string[];
  activeIndex: number;
  completed?: boolean;
  stepElapsedLabels?: string[];
}) {
  return (
    <Box sx={{ mt: 1 }}>
      {steps.map((label, i) => {
        const status: TimelineStatus = completed || i < activeIndex
          ? 'done'
          : i === activeIndex
            ? 'active'
            : 'pending';
        return (
          <Box
            key={label}
            data-testid={status === 'done' ? `timeline-step-done-${i}` : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              py: 0.4,
              opacity: status === 'pending' ? 0.45 : 1,
            }}
          >
            {status === 'done' ? (
              <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
            ) : (
              <RadioButtonUncheckedIcon
                sx={{
                  fontSize: 16,
                  color: status === 'active' ? colors.primary : colors.text.muted,
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: status === 'active' ? 700 : 500,
                color: status === 'done' ? colors.success : colors.text.secondary,
                flex: 1,
              }}
            >
              {label}
            </Typography>
            {(completed || status === 'done') && stepElapsedLabels?.[i] && (
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>
                {stepElapsedLabels[i]}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
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

export function ConnectorArtifactWorkbench() {
  const useCases = [
    { id: 'collect-evidence', label: 'Collect Evidence' },
    { id: 'validate-evidence', label: 'Validate Evidence' },
    { id: 'audit-pack', label: 'Generate Audit Pack' },
    { id: 'release-pack', label: 'Generate Release Pack' },
    { id: 'architecture-pack', label: 'Generate Architecture Pack' },
    { id: 'executive-summary', label: 'Generate Executive Summary' },
  ];
  const [artifactType, setArtifactType] = useState(useCases[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collectionDone, setCollectionDone] = useState(false);
  const [collectionStepIndex, setCollectionStepIndex] = useState(-1);
  const [submitStepIndex, setSubmitStepIndex] = useState(-1);
  const [submitDone, setSubmitDone] = useState(false);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [submission, setSubmission] = useState<{
    title: string;
    summary: string;
    body: string;
    quality_score: number;
    confidence: string;
    source_connectors: string[];
    quality_checks: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requirement, setRequirement] = useState('');
  const defaultRequirement = 'Describe the requirement for the evidence pack';
  const [copied, setCopied] = useState(false);
  const [packViewerOpen, setPackViewerOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const packViewerRef = useRef<HTMLDivElement | null>(null);
  const collectionTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const sources: EvidenceSourceDetail[] = useMemo(
    () => (collectionDone ? sourcesAfterCollection() : EVIDENCE_SOURCES),
    [collectionDone],
  );

  const collectionSummary = collectionDone ? EVIDENCE_COLLECTION_SUMMARY : null;

  const packTitles: Record<string, string> = {
    'collect-evidence': 'Evidence Collection Package',
    'validate-evidence': 'Evidence Validation Package',
    'audit-pack': 'Audit Pack',
    'release-pack': 'Release Pack',
    'architecture-pack': 'Architecture Pack',
    'executive-summary': 'Executive Summary Pack',
  };

  useEffect(() => () => {
    if (collectionTimer.current) clearInterval(collectionTimer.current);
    if (submitTimer.current) clearInterval(submitTimer.current);
  }, []);

  const handleDownload = () => {
    if (!submission?.body) return;
    const blob = new Blob([submission.body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${EVIDENCE_PACK_SUBMISSION.packId}_evidence_pack.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewPack = () => {
    setPackViewerOpen(true);
    requestAnimationFrame(() => {
      packViewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleResubmit = () => {
    resetSubmissionWorkflowState({
      setSubmitting,
      setSubmitDone,
      setSubmitStepIndex,
      setSubmission,
      setPackViewerOpen,
    });
  };

  const resetSubmission = () => {
    resetSubmissionWorkflowState({
      setSubmitting,
      setSubmitDone,
      setSubmitStepIndex,
      setSubmission,
      setPackViewerOpen,
    });
  };

  const handleCopy = async () => {
    if (!submission?.body) return;
    await navigator.clipboard.writeText(submission.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTimeline = (
    steps: string[],
    setIndex: (n: number) => void,
    onComplete: () => void,
    timerRef: MutableRefObject<ReturnType<typeof setInterval> | null>,
    intervalMs = 400,
  ) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let step = 0;
    setIndex(0);
    timerRef.current = setInterval(() => {
      step += 1;
      if (step >= steps.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIndex(steps.length);
        onComplete();
        return;
      }
      setIndex(step);
    }, intervalMs);
  };

  const handleCollectEvidence = () => {
    if (collecting) return;
    setCollecting(true);
    setCollectionDone(false);
    resetSubmission();
    setError(null);
    setActiveStep(1);
    runTimeline(
      COLLECTION_TIMELINE_STEPS,
      setCollectionStepIndex,
      () => {
        setCollectionDone(true);
        setCollecting(false);
        setActiveStep(2);
      },
      collectionTimer,
      400,
    );
  };

  const handleSubmitEvidencePack = () => {
    if (!collectionDone) {
      setError('Collect evidence first to populate the enterprise source inventory.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitDone(false);
    setPackViewerOpen(false);
    setError(null);
    runTimeline(
      SUBMIT_TIMELINE_STEPS,
      setSubmitStepIndex,
      () => {
        const prompt = requirement.trim() || defaultRequirement;
        const summary = EVIDENCE_COLLECTION_SUMMARY;
        const body = buildEvidencePackageBody(summary);
        const packName = packTitles[artifactType] ?? 'Enterprise Evidence Package';
        setSubmission({
          title: packName,
          summary: `${packName} submitted for ADIP AI SDLC workflows. Requirement: ${prompt}`,
          body: `${body}\n\nRequirement / prompt\n- ${prompt}`,
          quality_score: summary.validationScore / 100,
          confidence: 'High',
          source_connectors: sources.map((s) => s.name),
          quality_checks: [
            'Traceability complete',
            'ECS pack lineage retained',
            'Owner attribution mapped',
            'Control mapping validated',
          ],
        });
        setSubmitDone(true);
        setSubmitting(false);
        setActiveStep(4);
      },
      submitTimer,
      450,
    );
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
          {(submitting || collecting) && <LinearProgress sx={{ mb: 1 }} />}
          {collecting && collectionStepIndex >= 0 && (
            <Box sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Connector collection timeline</Typography>
              <TimelineList steps={COLLECTION_TIMELINE_STEPS} activeIndex={collectionStepIndex} />
            </Box>
          )}
          {(submitting || submitDone) && submitStepIndex >= 0 && (
            <Box sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {submitDone ? 'Evidence Pack Submission — Completed' : 'Evidence pack submission'}
              </Typography>
              <TimelineList
                steps={SUBMIT_TIMELINE_STEPS}
                activeIndex={submitStepIndex}
                completed={submitDone}
                stepElapsedLabels={SUBMIT_STEP_ELAPSED}
              />
              {submitDone && (
                <>
                  <Grid container spacing={1} sx={{ mt: 1.5 }}>
                    {[
                      ['Pack ID', EVIDENCE_PACK_SUBMISSION.packId],
                      ['Version', EVIDENCE_PACK_SUBMISSION.version],
                      ['Submission date/time', EVIDENCE_PACK_SUBMISSION.submittedAt],
                      ['Status', EVIDENCE_PACK_SUBMISSION.status],
                      ['Evidence count', String(EVIDENCE_PACK_SUBMISSION.evidenceCount)],
                      ['Sources processed', String(EVIDENCE_PACK_SUBMISSION.sourcesProcessed)],
                      ['Controls mapped', String(EVIDENCE_PACK_SUBMISSION.controlsMapped)],
                      ['Validation score', `${EVIDENCE_PACK_SUBMISSION.validationScore}%`],
                      ['Frameworks mapped', EVIDENCE_PACK_SUBMISSION.frameworksMapped.join(', ')],
                      ['Missing evidence or exceptions', EVIDENCE_PACK_SUBMISSION.missingEvidence],
                      ['Submitted to', EVIDENCE_PACK_SUBMISSION.submittedTo],
                      ['Ready for downstream modules', EVIDENCE_PACK_SUBMISSION.readyForDownstream],
                    ].map(([label, value]) => (
                      <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border.subtle}` }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>{label}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                    <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={handleViewPack}>
                      View Evidence Pack
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
                      Download Evidence Pack
                    </Button>
                    <Button size="small" variant="contained" onClick={handleResubmit}>
                      Resubmit
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}
        </GlassCard>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="1. Evidence Action" subtitle="Collect enterprise evidence and submit evidence packs" />
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Action</InputLabel>
                <Select value={artifactType} label="Action" onChange={(e) => setArtifactType(e.target.value)}>
                  {useCases.map((uc) => (
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
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={handleCollectEvidence} disabled={collecting}>
                  Collect Evidence
                </Button>
                <Button size="small" variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleSubmitEvidencePack} disabled={submitting}>
                  Submit Evidence Pack
                </Button>
              </Box>
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
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.75, fontWeight: 600 }}>Provider mix</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>· Direct ADIP connectors: {collectionSummary.directConnectorRecords} records</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>· ECS reusable evidence packs: {collectionSummary.ecsReusableRecords} records</Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No collection run yet. Click Collect Evidence to run the connector timeline.</Typography>
              )}
            </GlassCard>
          </Grid>

          {collectionDone && (
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
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.25 }}>
                          Artifact types: {source.artifactTypes.join(', ')}
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

          {submission && packViewerOpen && (
            <Grid size={{ xs: 12 }} ref={packViewerRef}>
              <GlassCard sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <ModuleHeader title={`4. ${submission.title}`} subtitle={submission.summary} />
                  <Chip size="small" label={`Quality ${Math.round(submission.quality_score * 100)}%`} color="primary" />
                  <Chip size="small" label={submission.confidence} />
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 360, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 13 }}>
                  {submission.body}
                </Paper>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: colors.text.muted }}>
                  Sources: {submission.source_connectors.join(', ')} · Includes ECS-reused and direct ADIP evidence · Stage: Approval / Publish
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Quality checks</Typography>
                  {submission.quality_checks.map((c) => (
                    <Chip key={c} size="small" sx={{ mr: 0.5, mt: 0.5 }} label={c} />
                  ))}
                </Box>
              </GlassCard>
            </Grid>
          )}
        </Grid>
      </Box>
    </CenterErrorBoundary>
  );
}
