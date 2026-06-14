import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { GaugeChart } from '../charts/GaugeChart';
import { Grid } from '@mui/material';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

export function ProjectHealthPanel() {
  const { projects } = useCopilot();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Project Health Advisor" subtitle={`${projects.length} projects analyzed`} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Project', 'Domain', 'Health', 'Delivery', 'Testing', 'Audit', 'Release', 'Recommendation'].map((h) => (
                <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, fontSize: '0.62rem' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.slice(0, 20).map((p) => (
              <TableRow key={p.id} hover>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem', fontWeight: 600 }}>{p.name}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{p.domain}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{p.healthScore}%</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem', color: p.deliveryRisk > 65 ? colors.critical : undefined }}>{p.deliveryRisk}%</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{p.testingRisk}%</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{p.auditRisk}%</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{p.releaseRisk}%</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.58rem', maxWidth: 200 }}>{p.deliveryRecommendation.slice(0, 60)}…</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
        {projects.slice(0, 3).map((p) => (
          <Grid key={p.id} size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 1.5, textAlign: 'center' }}>
              <ModuleHeader title={p.name} />
              <GaugeChart value={p.healthScore} label="Health" size={120} />
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </GlassCard>
  );
}
