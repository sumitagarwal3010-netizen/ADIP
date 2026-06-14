import { Box, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { GaugeChart } from '../components/charts/GaugeChart';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { colors } from '../theme/colors';
import { usePersistence } from '../context/PersistenceContext';
import { useEntitlement } from '../hooks/useEntitlement';
import { Navigate } from 'react-router-dom';

const STATUS_COLOR: Record<string, string> = {
  healthy: colors.success,
  degraded: colors.warning,
  offline: colors.critical,
  active: colors.success,
  standby: colors.info,
  stub: colors.text.muted,
  empty: colors.text.muted,
  warning: colors.warning,
};

export function PersistenceAdminDashboard() {
  const entitlement = useEntitlement();
  const { kpis, entities, repositories, adapters, activity, activeAdapter, setActiveAdapter, execSummary } = usePersistence();

  if (!entitlement.can('administer', 'dashboards')) {
    return <Navigate to="/" replace />;
  }

  const storageChart = entities.map((e) => ({ name: e.label, value: Math.max(1, Math.round(e.storageBytes / 1024)) }));

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Persistence Health" value={kpis.persistenceHealth} suffix="%" chartId="persistence.health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Storage Utilization" value={kpis.storageUtilization} suffix="%" chartId="persistence.storage-utilization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Total Records" value={kpis.totalRecords} chartId="persistence.repository-activity" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Repository Activity" value={kpis.repositoryActivity} compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Data Quality" value={kpis.dataQualityScore} suffix="%" chartId="persistence.data-quality" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Persistence Health" />
            <GaugeChart chartId="persistence.health" value={kpis.persistenceHealth} label="Health" size={180} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Storage by Entity (KB)" />
            <HorizontalBarChart chartId="persistence.storage-utilization" data={storageChart} height={180} barColor={colors.primary} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Storage Adapters" subtitle={`Active: ${activeAdapter}`} />
            {adapters.map((a) => (
              <Box
                key={a.kind}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, py: 0.75,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  cursor: a.kind === 'localStorage' || a.kind === 'memory' ? 'pointer' : 'default',
                  opacity: a.kind === activeAdapter ? 1 : 0.75,
                }}
                onClick={() => (a.kind === 'localStorage' || a.kind === 'memory') && setActiveAdapter(a.kind)}
              >
                <StorageIcon sx={{ fontSize: 16, color: STATUS_COLOR[a.status] ?? colors.text.muted }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{a.label}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{a.description}</Typography>
                </Box>
                <Chip label={a.status} size="small" sx={{ height: 20, fontSize: '0.58rem', color: STATUS_COLOR[a.status] }} />
              </Box>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Repository Health" />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Repository', 'Status', 'Ops', 'Errors', 'Last Write'].map((h) => (
                      <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {repositories.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{r.name}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={r.status} size="small" sx={{ height: 18, fontSize: '0.55rem', color: STATUS_COLOR[r.status] }} /></TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{r.operationCount}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{r.errorCount}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{r.lastWrite ? new Date(r.lastWrite).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Entity Store Statistics" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Entity', 'Records', 'Storage (bytes)', 'Health', 'Last Modified'].map((h) => (
                  <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {entities.map((e) => (
                <TableRow key={e.entityType}>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{e.label}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{e.recordCount}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{e.storageBytes.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={e.health} size="small" sx={{ height: 18, fontSize: '0.55rem' }} /></TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{e.lastModified ? new Date(e.lastModified).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Recent Repository Activity" />
        {activity.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No activity recorded yet — interact with workflows or notifications to generate events.</Typography>
        ) : (
          activity.slice(0, 15).map((a) => (
            <Typography key={a.id} variant="caption" sx={{ display: 'block', py: 0.25, fontSize: '0.68rem' }}>
              {new Date(a.timestamp).toLocaleTimeString()} — {a.repository} {a.operation} {a.entityType} ({a.bytes} bytes) {a.success ? '✓' : '✗'}
            </Typography>
          ))
        )}
      </GlassCard>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Persistence Executive Summary" insight={execSummary} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <HubArtifactGenerator hubKey="persistence" />
      </Box>
    </Box>
  );
}
