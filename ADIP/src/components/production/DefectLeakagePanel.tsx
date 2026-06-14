import { Box, Grid } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

export function DefectLeakagePanel() {
  const { leakageByStage, leakageTrend, topLeakageApps, defects, kpis } = useProductionIntelligence();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Leakage by SDLC Stage" subtitle="Where defects escaped before production" />
            <HorizontalBarChart chartId="prod-intel.leakage-by-stage" data={leakageByStage} height={220} barColor={colors.warning} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Leakage Trend (7 weeks)" />
            <MultiLineChart
              data={leakageTrend}
              series={[
                { key: 'escapes', name: 'Escapes', color: colors.critical },
                { key: 'caught', name: 'Caught Pre-Prod', color: colors.success },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Top Leakage Applications" subtitle={`${kpis.escapedDefects} escaped defects · ${kpis.defectLeakage}% leakage rate`} />
        <HorizontalBarChart chartId="prod-intel.top-leakage-apps" data={topLeakageApps} height={160} barColor={colors.critical} />
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Defect Escape Heatmap" subtitle="Stage × severity distribution (top 12)" />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {defects.filter((d) => d.escapedToProduction).slice(0, 24).map((d) => (
            <Box
              key={d.id}
              sx={{
                px: 1, py: 0.5, borderRadius: 1, fontSize: '0.62rem',
                bgcolor: d.severity === 'critical' ? `${colors.critical}33` : d.severity === 'high' ? `${colors.warning}33` : `${colors.info}22`,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              {d.application} · {d.leakageStage}
            </Box>
          ))}
        </Box>
      </GlassCard>
    </Box>
  );
}
