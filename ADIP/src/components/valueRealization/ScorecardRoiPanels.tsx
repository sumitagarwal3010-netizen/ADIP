import { Box, Grid, Typography } from '@mui/material';
import { GaugeChart } from '../charts/GaugeChart';
import { GlassCard } from '../common/GlassCard';
import { KpiCard } from '../common/KpiCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useValueRealization } from '../../context/ValueRealizationContext';
import { colors } from '../../theme/colors';

export function TransformationScorecardPanel() {
  const { maturityScores, overallMaturity } = useValueRealization();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5, textAlign: 'center' }}>
        <ModuleHeader title="Overall Enterprise Score" subtitle="Transformation maturity across six dimensions" />
        <GaugeChart value={overallMaturity} label="Enterprise Score" size={200} chartId="value-realization.transformation-score" />
      </GlassCard>
      <Grid container spacing={1.5}>
        {maturityScores.map((m) => (
          <Grid key={m.dimension} size={{ xs: 6, md: 4 }}>
            <GlassCard sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{m.label}</Typography>
              <GaugeChart value={m.score} label={`Target ${m.target}%`} size={120} />
              <Typography variant="caption" color="success.main">+{m.trend}% YoY</Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function RoiCalculatorPanel() {
  const { roiInputs, setRoiInputs, roiOutputs } = useValueRealization();

  const fields: { key: keyof typeof roiInputs; label: string }[] = [
    { key: 'projectsPerYear', label: 'Projects / Year' },
    { key: 'developers', label: 'Developers' },
    { key: 'testers', label: 'Testers' },
    { key: 'architects', label: 'Architects' },
    { key: 'auditors', label: 'Auditors' },
    { key: 'complianceStaff', label: 'Compliance Staff' },
    { key: 'applications', label: 'Applications' },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="ROI Calculator — Inputs" subtitle="Adjust parameters to model ADIP business case" />
            {fields.map((f) => (
              <Box key={f.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption">{f.label}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    role="button"
                    sx={{ cursor: 'pointer', px: 0.5, fontWeight: 700 }}
                    onClick={() => setRoiInputs({ ...roiInputs, [f.key]: Math.max(1, roiInputs[f.key] - (f.key === 'projectsPerYear' ? 10 : 5)) })}
                  >−</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{roiInputs[f.key]}</Typography>
                  <Typography
                    variant="caption"
                    role="button"
                    sx={{ cursor: 'pointer', px: 0.5, fontWeight: 700 }}
                    onClick={() => setRoiInputs({ ...roiInputs, [f.key]: roiInputs[f.key] + (f.key === 'projectsPerYear' ? 10 : 5) })}
                  >+</Typography>
                </Box>
              </Box>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="ROI Calculator — Outputs" />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Annual Savings" value={`₹${(roiOutputs.annualSavings / 1_000_000).toFixed(1)}M`} chartId="value-realization.roi-annual" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="3-Year Savings" value={`₹${(roiOutputs.threeYearSavings / 1_000_000).toFixed(1)}M`} chartId="value-realization.roi-3year" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="ROI" value={roiOutputs.roi} suffix="%" chartId="value-realization.roi" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Payback" value={roiOutputs.paybackMonths} suffix=" mo" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Transformation Value" value={`₹${(roiOutputs.transformationValue / 1_000_000).toFixed(1)}M`} compact /></Grid>
            </Grid>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
