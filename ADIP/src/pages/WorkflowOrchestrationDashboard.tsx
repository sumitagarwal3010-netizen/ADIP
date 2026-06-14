import { useMemo } from 'react';
import {
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { WorkflowStatusPanel } from '../components/workflow/WorkflowStatusPanel';
import { useWorkflow } from '../context/WorkflowContext';
import { usePersona } from '../context/PersonaContext';
import { WORKFLOW_EXEC_SUMMARY, WORKFLOW_STAGE_DURATION_MOCK } from '../data/workflowOrchestrationMock';
import { WORKFLOW_STAGE_LABEL } from '../data/workflowOrchestrationEngine';
import { colors } from '../theme/colors';

const CHART_COLORS = [colors.primary, colors.secondary, colors.warning, colors.success, '#6366f1', '#ec4899', '#14b8a6'];

export function WorkflowOrchestrationDashboard() {
  const { workflows, kpis, history, selectedWorkflowId, setSelectedWorkflowId, getVisibleWorkflows } = useWorkflow();
  const { persona } = usePersona();
  const visible = useMemo(() => getVisibleWorkflows(), [getVisibleWorkflows]);

  const bottleneckData = kpis.bottlenecks.map((b) => ({
    name: WORKFLOW_STAGE_LABEL[b.stage],
    value: b.avgHours,
  }));

  const completionData = workflows.map((w, i) => ({
    name: w.title.length > 18 ? `${w.title.slice(0, 16)}…` : w.title,
    value: w.completionPct,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const slaData = [
    { name: 'On Track', value: workflows.filter((w) => !w.slaBreached).length, color: colors.success },
    { name: 'SLA Breach', value: kpis.slaBreaches, color: colors.warning },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Active Workflows" value={kpis.activeWorkflows} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Avg Completion" value={kpis.avgCompletionPct} suffix="%" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Approval Delays" value={kpis.approvalDelays} suffix="" trend={-12} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Completion Rate" value={kpis.completionRate} suffix="%" trend={8} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="SLA Breaches" value={kpis.slaBreaches} suffix="" trend={kpis.slaBreaches > 0 ? -100 : 0} compact />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Lifecycle Bottlenecks" subtitle={`Average stage duration (hours) — ${persona.label} view`} />
            <HorizontalBarChart data={bottleneckData.length > 0 ? bottleneckData : WORKFLOW_STAGE_DURATION_MOCK} height={220} chartId="workflow.bottlenecks" />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="SLA Status" subtitle="On-track vs breached workflows" />
            <DonutChart data={slaData} height={200} chartId="workflow.sla-breaches" centerLabel="Breaches" centerValue={kpis.slaBreaches} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Workflow Registry" subtitle={`${visible.length} workflows visible to ${persona.label}`} />
            <TableContainer sx={{ maxHeight: 280 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Workflow</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Stage</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visible.map((w) => (
                    <TableRow
                      key={w.id}
                      hover
                      selected={w.id === selectedWorkflowId}
                      onClick={() => setSelectedWorkflowId(w.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{w.title}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>{WORKFLOW_STAGE_LABEL[w.currentStage]}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>{w.owner}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>{w.completionPct}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Completion Rates" subtitle="Per-workflow lifecycle progress" />
            <DonutChart data={completionData} height={220} chartId="workflow.completion" centerLabel="Avg" centerValue={`${kpis.avgCompletionPct}%`} />
          </GlassCard>
        </Grid>
      </Grid>

      {selectedWorkflowId && <WorkflowStatusPanel workflowId={selectedWorkflowId} />}

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Orchestration Events" subtitle="Stage transitions and approval actions" />
        <TableContainer sx={{ maxHeight: 200 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Actor</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(history.length > 0 ? history : [
                { id: 'seed-1', action: 'submit_for_approval' as const, actor: 'Release Manager', timestamp: 'Jun 4, 2026 15:00', comment: 'UPI Release submitted for Go/No-Go' },
                { id: 'seed-2', action: 'submit_for_review' as const, actor: 'Test Lead', timestamp: 'Jun 5, 2026 10:00', comment: 'Biometric login testing submitted for review' },
              ]).map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>
                    <Chip label={e.action.replace(/_/g, ' ')} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.72rem' }}>{e.actor}</TableCell>
                  <TableCell sx={{ fontSize: '0.68rem', color: colors.text.secondary }}>{e.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Orchestration — Executive Summary" insight={WORKFLOW_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <HubArtifactGenerator hubKey="workflow-orchestration" />
      </Box>
    </Box>
  );
}
