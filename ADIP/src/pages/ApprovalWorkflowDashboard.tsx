import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { BarChartPanel } from '../components/charts/BarChartPanel';
import { RoleActionCenter } from '../components/persona/RoleActionCenter';
import { ApprovalActionDialog } from '../components/approval/ApprovalActionDialog';
import { ApprovalDetailsPanel } from '../components/approval/ApprovalDetailsPanel';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { usePersona } from '../context/PersonaContext';
import { useWorkflow } from '../context/WorkflowContext';
import { useEntitlement } from '../hooks/useEntitlement';
import { useSimulation } from '../context/SimulationContext';
import { colors } from '../theme/colors';
import type { TraceNode } from '../data/traceabilityModel';
import {
  APPROVAL_DOMAINS,
  APPROVAL_EXEC_SUMMARY,
  APPROVAL_STAGES,
  APPROVAL_TREND,
  APPROVALS_BY_STAGE,
  PENDING_STATUSES,
  actionsForStatus,
  computeApprovalKpis,
  filterApprovalRequests,
  isOverdue,
  sortApprovalRequests,
  type ApprovalSortDir,
  type ApprovalSortKey,
  type ApprovalWorkflowAction,
} from '../data/approvalWorkflowMock';
import type { ApprovalRequest } from '../data/approvalWorkflowEngine';
import type { UnifiedLifecycleAction } from '../types/workflowOrchestration';
import { computeAuditKpis } from '../data/auditCenterEngine';

const ACTION_ICONS: Record<ApprovalWorkflowAction, typeof CheckCircleIcon> = {
  Submit: SendIcon,
  'Assign Reviewer': PersonAddIcon,
  'Reassign Reviewer': SwapHorizIcon,
  Approve: CheckCircleIcon,
  Reject: CancelIcon,
  'Request Changes': EditNoteIcon,
  Escalate: TrendingUpIcon,
  Close: LockIcon,
};

const ALL_STATUSES = ['all', 'Submitted', 'Assigned', 'Under Review', 'Changes Requested', 'Escalated', 'Approved', 'Rejected', 'Closed', 'Draft'];

function statusColor(status: string): string {
  if (status === 'Approved' || status === 'Closed') return colors.success;
  if (status === 'Rejected' || status === 'Escalated') return colors.critical;
  if (status === 'Changes Requested') return colors.warning;
  if (status === 'Under Review' || status === 'Assigned') return colors.info;
  return colors.text.muted;
}

function priorityColor(priority: string): string {
  if (priority === 'critical') return colors.critical;
  if (priority === 'high') return colors.warning;
  if (priority === 'medium') return colors.info;
  return colors.text.muted;
}

export function ApprovalWorkflowDashboard() {
  const { persona } = usePersona();
  const { openKpiDrilldown } = useSimulation();
  const entitlement = useEntitlement();
  const {
    workflows,
    getApprovalRequests,
    getApprovalHistory,
    applyLifecycleAction,
    canPerformLifecycleAction,
  } = useWorkflow();
  const navigate = useNavigate();
  const requests = getApprovalRequests();
  const history = getApprovalHistory();
  const [selectedId, setSelectedId] = useState<string | null>(requests[0]?.id ?? null);
  const [dialogAction, setDialogAction] = useState<ApprovalWorkflowAction | null>(null);
  const [dialogRequest, setDialogRequest] = useState<ApprovalRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<ApprovalSortKey>('dueDate');
  const [sortDir, setSortDir] = useState<ApprovalSortDir>('asc');

  const kpis = useMemo(() => computeApprovalKpis(requests), [requests]);
  const auditKpis = useMemo(() => computeAuditKpis(), []);
  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
    [requests, selectedId],
  );

  const queue = useMemo(() => {
    const filtered = filterApprovalRequests(requests, {
      status: statusFilter,
      stage: stageFilter,
      domain: domainFilter,
      search,
    });
    return sortApprovalRequests(filtered, sortKey, sortDir);
  }, [requests, statusFilter, stageFilter, domainFilter, search, sortKey, sortDir]);

  const reviewQueue = useMemo(
    () => requests.filter((r) => PENDING_STATUSES.includes(r.status)),
    [requests],
  );

  const handleSelectNode = (node: TraceNode) => {
    navigate(`/traceability/impact?node=${encodeURIComponent(node.id)}`);
  };

  const openAction = (request: ApprovalRequest, action: ApprovalWorkflowAction, e?: MouseEvent) => {
    e?.stopPropagation();
    setDialogRequest(request);
    setDialogAction(action);
  };

  const handleConfirmAction = (comment: string, reviewer?: string) => {
    if (!dialogRequest || !dialogAction) return;
    const workflow = workflows.find((w) => w.approvalTask.approvalId === dialogRequest.id);
    if (!workflow) return;
    applyLifecycleAction(workflow.id, dialogAction as UnifiedLifecycleAction, comment, reviewer);
    setDialogAction(null);
    setDialogRequest(null);
  };

  const renderActions = (request: ApprovalRequest, compact = false) => {
    const actions = actionsForStatus(request.status).filter(
      (a) => entitlement.canPerformApprovalAction(a) && canPerformLifecycleAction(a as UnifiedLifecycleAction),
    );
    if (actions.length === 0) return null;
    return (
      <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
        {actions.map((action) => {
          const Icon = ACTION_ICONS[action];
          return compact ? (
            <Tooltip key={action} title={action}>
              <IconButton size="small" onClick={(e) => openAction(request, action, e)} sx={{ color: colors.primary }}>
                <Icon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              key={action}
              size="small"
              variant="outlined"
              startIcon={<Icon sx={{ fontSize: 14 }} />}
              onClick={(e) => openAction(request, action, e)}
              sx={{ fontSize: '0.62rem', py: 0.2, minWidth: 0 }}
            >
              {action}
            </Button>
          );
        })}
      </Stack>
    );
  };

  const kpiCards = [
    { label: 'Pending Approvals', value: kpis.pendingApprovals, suffix: '', trend: -12.5 },
    { label: 'Overdue Reviews', value: kpis.overdueReviews, suffix: '', trend: -25.0 },
    { label: 'Reviews In Progress', value: kpis.reviewsInProgress, suffix: '', trend: 4.0 },
    { label: 'Approved Items', value: kpis.approvedItems, suffix: '', trend: 14.2 },
    { label: 'Rejected Items', value: kpis.rejectedItems, suffix: '', trend: -8.0 },
    { label: 'Escalated Reviews', value: kpis.escalatedReviews, suffix: '', trend: -33.3 },
    { label: 'Average Approval Time', value: kpis.averageApprovalTime, suffix: 'd', trend: -7.7 },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        {kpiCards.map((kpi, index) => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
            <KpiCard label={kpi.label} value={kpi.value} suffix={kpi.suffix} trend={kpi.trend} delay={index * 0.04} compact />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Findings" value={auditKpis.openFindings} chartId="audit-center.open-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Evidence Coverage" value={auditKpis.evidenceCoverage} suffix="%" chartId="audit-center.evidence-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Readiness" value={auditKpis.auditReadinessScore} suffix="%" chartId="audit-center.audit-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Overdue Findings" value={auditKpis.overdueFindings} chartId="audit-center.overdue-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Compliance" value={auditKpis.complianceCoverage} suffix="%" chartId="audit-center.compliance-coverage" compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Workflow Audit Status" subtitle="Evidence, findings, and compliance per unified lifecycle instance" />
        {workflows.map((w) => (
          <Box key={w.id} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 200 }}>{w.id} — {w.title}</Typography>
            <Chip label={`${w.evidenceCount} evidence`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            <Chip label={`${w.openFindings} findings`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            <Chip label={`${w.openObservations} obs`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            <Chip label={w.auditStatus} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            <Chip label={w.complianceStatus} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
          </Box>
        ))}
      </GlassCard>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Approvals by Stage" subtitle="Pending reviews across SDLC stages" />
            <BarChartPanel
              chartId="approval-workflow.by-stage"
              data={APPROVALS_BY_STAGE}
              categoryKey="stage"
              series={[{ dataKey: 'count', name: 'Pending', fill: colors.primary, barSize: 24, radius: [4, 4, 0, 0] }]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Approval & Escalation Trend" subtitle="Monthly volume" />
            <BarChartPanel
              chartId="approval-workflow.trend"
              data={APPROVAL_TREND}
              categoryKey="month"
              series={[
                { dataKey: 'pending', name: 'Pending', fill: colors.warning, barSize: 16, radius: [4, 4, 0, 0] },
                { dataKey: 'approved', name: 'Approved', fill: colors.success, barSize: 16, radius: [4, 4, 0, 0] },
                { dataKey: 'escalated', name: 'Escalated', fill: colors.critical, barSize: 16, radius: [4, 4, 0, 0] },
              ]}
              height={220}
              showLegend
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <AIInsightBox title="Executive Summary" insight={APPROVAL_EXEC_SUMMARY} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader
              title="Enterprise Approval Queue"
              subtitle={`${queue.length} items · ${reviewQueue.length} pending · ${kpis.slaBreaches} SLA breaches`}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 140 }} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {ALL_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Stage</InputLabel>
                <Select label="Stage" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                  <MenuItem value="all">All Stages</MenuItem>
                  {APPROVAL_STAGES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Domain</InputLabel>
                <Select label="Domain" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                  <MenuItem value="all">All Domains</MenuItem>
                  {APPROVAL_DOMAINS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel>Sort</InputLabel>
                <Select label="Sort" value={sortKey} onChange={(e) => setSortKey(e.target.value as ApprovalSortKey)}>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="submittedDate">Submitted</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
              <Button size="small" variant="outlined" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </Box>

            <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, mb: 0.5 }}>
              {['ID', 'Type', 'Domain', 'Stage', 'Status', 'Reviewer', 'Submitter', 'Submitted', 'Due', 'Priority', ''].map((col) => (
                <Typography key={col} variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.62rem', flex: col === 'ID' ? 0 : col === '' ? 0 : 1, minWidth: col === 'ID' ? 64 : col === 'Priority' ? 56 : undefined, textTransform: 'uppercase' }}>
                  {col}
                </Typography>
              ))}
            </Box>

            {queue.map((request) => (
              <Box
                key={request.id}
                onClick={() => setSelectedId(request.id)}
                sx={{
                  display: 'flex',
                  gap: 1,
                  py: 1,
                  px: 0.5,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  bgcolor: selectedId === request.id ? `${colors.primary}12` : isOverdue(request) ? `${colors.critical}06` : undefined,
                  '&:hover': { bgcolor: colors.bg.glass },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, minWidth: 64, color: colors.primary }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openKpiDrilldown({ chartId: 'approval-workflow.queue', segment: request.id, label: request.title, value: request.id });
                  }}
                >
                  {request.id}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 80, fontSize: '0.65rem' }}>{request.itemType}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 72, fontSize: '0.65rem' }}>{request.domain}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 72, fontSize: '0.65rem' }}>{request.stage}</Typography>
                <Chip label={request.status} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, color: statusColor(request.status), bgcolor: `${statusColor(request.status)}18` }} />
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 100, fontSize: '0.62rem' }}>{request.assignedReviewer ?? '—'}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 80, fontSize: '0.62rem' }}>{request.submitter}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72, fontSize: '0.62rem' }}>{request.submittedDate}</Typography>
                <Typography variant="caption" sx={{ minWidth: 72, fontSize: '0.62rem', fontWeight: 700, color: isOverdue(request) ? colors.critical : colors.text.secondary }}>{request.dueDate}</Typography>
                <Typography variant="caption" sx={{ minWidth: 56, fontWeight: 700, color: priorityColor(request.priority), textTransform: 'capitalize', fontSize: '0.62rem' }}>{request.priority}</Typography>
                {renderActions(request, true)}
              </Box>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ApprovalDetailsPanel request={selectedRequest} history={history} />
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Approval History" subtitle="Complete lifecycle audit trail" />
        {history.map((entry) => (
          <DrilldownTableRow
            key={entry.id}
            chartId="approval-workflow.history"
            segment={entry.id}
            label={entry.action}
            value={entry.approvalId}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, flexWrap: 'wrap' }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{entry.timestamp}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{entry.approvalId}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 110 }}>{entry.action}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{entry.actor}</Typography>
            <Typography variant="caption" sx={{ minWidth: 140, fontSize: '0.65rem' }}>{entry.previousStatus} → {entry.newStatus}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>{entry.comment}</Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <RoleActionCenter persona={persona} onSelectNode={handleSelectNode} />

      <HubArtifactGenerator hubKey="approval-workflow" />

      <ApprovalActionDialog
        open={dialogAction !== null}
        action={dialogAction}
        request={dialogRequest}
        onClose={() => { setDialogAction(null); setDialogRequest(null); }}
        onConfirm={handleConfirmAction}
      />
    </Box>
  );
}
