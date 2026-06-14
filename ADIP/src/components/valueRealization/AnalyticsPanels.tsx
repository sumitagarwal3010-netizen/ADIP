import { Box, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useValueRealization } from '../../context/ValueRealizationContext';
import { colors } from '../../theme/colors';

function MetricPanel({ title, subtitle, data, chartId, barColor }: {
  title: string; subtitle: string;
  data: { name: string; value?: number; reduction?: number }[];
  chartId: string; barColor: string;
}) {
  const chartData = data.map((d) => ({ name: d.name, value: d.value ?? d.reduction ?? 0 }));
  return (
    <GlassCard sx={{ p: 2, mb: 1.5 }}>
      <ModuleHeader title={title} subtitle={subtitle} />
      <HorizontalBarChart chartId={chartId} data={chartData} height={200} barColor={barColor} />
    </GlassCard>
  );
}

export function ProductivityAnalyticsPanel() {
  const { productivityGains } = useValueRealization();
  return (
    <Box>
      <MetricPanel
        title="Productivity Gains by SDLC Domain"
        subtitle="Requirements · Architecture · Development · Testing · Release · Governance · Audit · Operations · Knowledge"
        data={productivityGains.map((p) => ({ name: p.domain, value: p.productivityPercent }))}
        chartId="value-realization.productivity"
        barColor={colors.success}
      />
      <Grid container spacing={1.5}>
        {productivityGains.map((p) => (
          <Grid key={p.domain} size={{ xs: 6, md: 4 }}>
            <GlassCard sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{p.domain}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                {p.hoursSaved.toLocaleString()} hrs · {p.productivityPercent}% gain · {p.fteEquivalent} FTE
              </Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function DeliveryAccelerationPanel() {
  const { deliveryMetrics } = useValueRealization();
  return (
    <MetricPanel
      title="Delivery Acceleration"
      subtitle="Cycle time reduction across SDLC stages"
      data={deliveryMetrics}
      chartId="value-realization.delivery-acceleration"
      barColor={colors.primary}
    />
  );
}

export function QualityImprovementPanel() {
  const { qualityMetrics } = useValueRealization();
  return (
    <MetricPanel
      title="Quality Improvement"
      subtitle="Defect reduction · leakage · escaped defects · RCA recurrence · incidents · customer impact"
      data={qualityMetrics}
      chartId="value-realization.quality"
      barColor={colors.critical}
    />
  );
}

export function GovernanceEfficiencyPanel() {
  const { governanceMetrics } = useValueRealization();
  return (
    <MetricPanel
      title="Governance Efficiency"
      subtitle="Approval · controls · evidence · compliance · cost reduction"
      data={governanceMetrics}
      chartId="value-realization.governance"
      barColor={colors.secondary}
    />
  );
}

export function AuditEfficiencyPanel() {
  const { auditMetrics, kpis } = useValueRealization();
  return (
    <Box>
      <MetricPanel
        title="Audit Efficiency"
        subtitle={`${kpis.auditEfficiency}% overall audit efficiency improvement`}
        data={auditMetrics}
        chartId="value-realization.audit-efficiency"
        barColor={colors.warning}
      />
    </Box>
  );
}

export function AiAdoptionImpactPanel() {
  const { aiMetrics } = useValueRealization();
  return (
    <MetricPanel
      title="AI Adoption & Impact"
      subtitle="Copilot · recommendations · knowledge · learning · AI SDLC · AI governance coverage"
      data={aiMetrics}
      chartId="value-realization.ai-adoption"
      barColor={colors.info}
    />
  );
}
