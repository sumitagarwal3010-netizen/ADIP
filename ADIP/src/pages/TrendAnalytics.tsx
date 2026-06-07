import { Box, Grid } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { MultiLineChart } from '../components/charts/MultiLineChart';
import { colors } from '../theme/colors';

const monthlyLabels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const incidentTrendSeries = [28, 26, 25, 24, 22, 20, 19, 18, 17, 16, 15, 14];
const releaseVelocitySeries = [18, 19, 19, 20, 20, 21, 22, 22, 23, 24, 24, 25];
const technicalDebtSeries = [41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30];
const aiAdoptionSeries = [48, 51, 55, 58, 62, 65, 69, 72, 75, 78, 81, 84];

const trendData = monthlyLabels.map((month, index) => ({
  month,
  incidents: incidentTrendSeries[index],
  releaseVelocity: releaseVelocitySeries[index],
  technicalDebt: technicalDebtSeries[index],
  aiAdoption: aiAdoptionSeries[index],
}));

const deliveryReliabilityData = monthlyLabels.map((month, index) => ({
  month,
  changeFailureRate: [8.2, 7.9, 7.6, 7.4, 7.1, 6.9, 6.6, 6.4, 6.1, 5.9, 5.7, 5.4][index],
  mttrHours: [4.9, 4.8, 4.7, 4.6, 4.4, 4.3, 4.1, 4.0, 3.8, 3.7, 3.6, 3.4][index],
}));

const kpis = [
  {
    label: 'Incident Trend',
    value: 14,
    suffix: '',
    trend: -11.2,
    data: monthlyLabels.map((month, index) => ({ day: month, value: incidentTrendSeries[index] })),
  },
  {
    label: 'Release Velocity',
    value: 25,
    suffix: '',
    trend: 9.3,
    data: monthlyLabels.map((month, index) => ({ day: month, value: releaseVelocitySeries[index] })),
  },
  {
    label: 'Technical Debt',
    value: 30,
    suffix: '',
    trend: -7.7,
    data: monthlyLabels.map((month, index) => ({ day: month, value: technicalDebtSeries[index] })),
  },
  {
    label: 'AI Adoption',
    value: 84,
    trend: 12.6,
    data: monthlyLabels.map((month, index) => ({ day: month, value: aiAdoptionSeries[index] })),
  },
];

export function TrendAnalytics() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {kpis.map((kpi, index) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard
              label={kpi.label}
              value={kpi.value}
              suffix={kpi.suffix}
              trend={kpi.trend}
              data={kpi.data}
              delay={index * 0.05}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Engineering Trend Index (12 Months)" subtitle="Incidents · Release Velocity · Technical Debt · AI Adoption" />
            <MultiLineChart
              data={trendData}
              series={[
                { key: 'incidents', color: colors.critical, name: 'Incident Trend' },
                { key: 'releaseVelocity', color: colors.primary, name: 'Release Velocity' },
                { key: 'technicalDebt', color: colors.warning, name: 'Technical Debt' },
                { key: 'aiAdoption', color: colors.success, name: 'AI Adoption' },
              ]}
              height={260}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Delivery Reliability Trend (12 Months)" subtitle="Change Failure Rate (%) · Mean Time to Recovery (hours)" />
            <MultiLineChart
              data={deliveryReliabilityData}
              series={[
                { key: 'changeFailureRate', color: colors.info, name: 'Change Failure Rate' },
                { key: 'mttrHours', color: colors.secondary, name: 'MTTR (Hours)' },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
