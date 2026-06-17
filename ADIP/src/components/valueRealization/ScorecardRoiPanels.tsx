import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
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

interface FormulaSpec {
  label: string;
  formula: string;
  derivation: string;
}

function buildFormulas(roiInputs: Record<string, number>, blendedRate = 2500): FormulaSpec[] {
  const totalPeople = (roiInputs.developers ?? 0) + (roiInputs.testers ?? 0) + (roiInputs.architects ?? 0) + (roiInputs.auditors ?? 0) + (roiInputs.complianceStaff ?? 0);
  return [
    {
      label: 'Annual Savings',
      formula: '(hoursSaved · blendedRate) + costAvoidance + qualityUplift + riskReduction',
      derivation:
        `Estimated for ${roiInputs.applications ?? 0} apps · ${roiInputs.projectsPerYear ?? 0} projects/yr · ${totalPeople} people. ` +
        `Blended rate ₹${blendedRate.toLocaleString('en-IN')}/hr. ` +
        `Automation factor 0.40–0.65 per Copilot.`,
    },
    {
      label: '3-Year Value',
      formula: 'Σ (year_i_value − year_i_cost),  i ∈ {1, 2, 3}',
      derivation: 'Cumulative net value over years 1, 2, 3 with platform cost held flat at ₹6Cr/year baseline.',
    },
    {
      label: 'ROI %',
      formula: '(annualValue − annualPlatformCost) / annualPlatformCost · 100',
      derivation: 'Net value over investment, expressed as a percentage.',
    },
    {
      label: 'Payback (months)',
      formula: 'totalInvestment / monthlyValue',
      derivation: 'Months until cumulative value equals platform investment.',
    },
    {
      label: 'Hours Saved',
      formula: 'Σ (taskVolume · taskBaseline · automationFraction)',
      derivation: 'Sum across Requirements, Architecture, Development, Testing, Release, Audit Copilots.',
    },
    {
      label: 'FTE Saved',
      formula: 'hoursSaved / annualHoursPerFTE',
      derivation: 'Default annualHoursPerFTE = 1,800 (post-leave, post-training).',
    },
    {
      label: 'Cost Avoidance',
      formula: 'hoursSaved · blendedRate · costAvoidanceFactor',
      derivation: 'costAvoidanceFactor = 0.65 (35% of saved hours redeployed to higher-value work).',
    },
    {
      label: 'Productivity Gain',
      formula: '(currentOutputPerFTE − baselineOutputPerFTE) / baselineOutputPerFTE · 100%',
      derivation: 'Output uplift per FTE over the pre-AI baseline.',
    },
    {
      label: 'Risk Reduction',
      formula: 'baselineRiskExposure − currentRiskExposure',
      derivation: 'Difference in enterprise risk score (0..100) — lower is better.',
    },
  ];
}

export function RoiCalculatorPanel() {
  const { roiInputs, setRoiInputs, roiOutputs } = useValueRealization();
  const [formulasOpen, setFormulasOpen] = useState(false);

  const fields: { key: keyof typeof roiInputs; label: string }[] = [
    { key: 'projectsPerYear', label: 'Projects / Year' },
    { key: 'developers', label: 'Developers' },
    { key: 'testers', label: 'Testers' },
    { key: 'architects', label: 'Architects' },
    { key: 'auditors', label: 'Auditors' },
    { key: 'complianceStaff', label: 'Compliance Staff' },
    { key: 'applications', label: 'Applications' },
  ];

  const formulas = buildFormulas(roiInputs as unknown as Record<string, number>);

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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <ModuleHeader title="ROI Calculator — Outputs" />
              </Box>
              <Button
                size="small"
                startIcon={<CalculateIcon sx={{ fontSize: 16 }} />}
                onClick={() => setFormulasOpen(true)}
                sx={{ textTransform: 'none', fontSize: '0.72rem' }}
              >
                How Calculated
              </Button>
            </Box>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Annual Savings" value={`₹${(roiOutputs.annualSavings / 1_000_000).toFixed(1)}M`} chartId="value-realization.roi-annual" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="3-Year Savings" value={`₹${(roiOutputs.threeYearSavings / 1_000_000).toFixed(1)}M`} chartId="value-realization.roi-3year" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="ROI" value={roiOutputs.roi} suffix="%" chartId="value-realization.roi" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Payback" value={roiOutputs.paybackMonths} suffix=" mo" compact /></Grid>
              <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Transformation Value" value={`₹${(roiOutputs.transformationValue / 1_000_000).toFixed(1)}M`} compact /></Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.65rem' }}>
              Derivation context: {(roiInputs.applications ?? 0)} applications · {(roiInputs.projectsPerYear ?? 0)} projects/year ·{' '}
              {(roiInputs.developers ?? 0)} developers · {(roiInputs.testers ?? 0)} testers ·{' '}
              {(roiInputs.architects ?? 0)} architects · {(roiInputs.auditors ?? 0)} auditors ·{' '}
              {(roiInputs.complianceStaff ?? 0)} compliance staff. Blended rate ₹2,500/hr · 1,800 hrs/FTE · automation factor 0.40–0.65.
            </Typography>
          </GlassCard>
        </Grid>
      </Grid>

      <Dialog open={formulasOpen} onClose={() => setFormulasOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>How ROI is Calculated</DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Each metric is computed transparently from the inputs you control above and a small set of finance assumptions.
            Sensitivity ±10% on any input shifts Annual Value by ~₹2.4–2.7Cr.
          </Typography>
          {formulas.map((f) => (
            <Box key={f.label} sx={{ py: 1, borderBottom: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{f.label}</Typography>
              <Typography
                variant="caption"
                sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.72rem', color: colors.secondary, mt: 0.25 }}
              >
                {f.formula}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5, lineHeight: 1.5 }}>
                {f.derivation}
              </Typography>
            </Box>
          ))}
          <Typography variant="caption" color="text.muted" sx={{ display: 'block', mt: 1.5, fontSize: '0.65rem' }}>
            For the full ROI methodology see <code>docs/10-ADIP-ROI-Methodology.md</code>.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
