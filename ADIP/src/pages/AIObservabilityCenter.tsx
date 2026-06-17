import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { colors } from '../theme/colors';
import {
  AI_OBSERVABILITY,
  AI_OBSERVABILITY_EXEC_SUMMARY,
  computeObservabilityScores,
} from '../data/aiObservabilityMock';

function latencyColor(ms: number): string {
  if (ms <= 500) return colors.success;
  if (ms <= 1500) return colors.warning;
  return colors.critical;
}

function errorColor(pct: number): string {
  if (pct <= 0.5) return colors.success;
  if (pct <= 1.0) return colors.warning;
  return colors.critical;
}

function fmtCost(usd: number): string {
  return `$${(usd / 1000).toFixed(1)}K`;
}

export function AIObservabilityCenter() {
  const s = computeObservabilityScores();

  return (
    <Box>
      {/* Top-level executive metrics only */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Model Usage" value={`${s.callsPerDayM}M`} suffix="/day" trend={6.4} chartId="ai-observability.usage" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Token Consumption" value={`${s.tokensPerDayM}M`} suffix="/day" trend={5.1} chartId="ai-observability.tokens" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Monthly Cost" value={fmtCost(s.monthlyCostUsd)} suffix="" trend={3.2} chartId="ai-observability.cost" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Active Models" value={s.activeModels} suffix="" chartId="ai-observability.models" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="P95 Latency" value={s.p95LatencyMs} suffix="ms" trend={-2.0} chartId="ai-observability.latency" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Error Rate" value={s.avgErrorRatePct} suffix="%" trend={-0.3} chartId="ai-observability.errors" />
        </Grid>
      </Grid>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox
          title="AI Platform Observability"
          insight={`Serving ~${s.callsPerDayM}M calls/day across ${s.activeModels} production models at ~${fmtCost(s.monthlyCostUsd)}/month. Call-weighted error rate is ${s.avgErrorRatePct}%. Latency outliers are the GenAI assistants — click any metric to drill into per-model detail.`}
        />
      </Box>

      {/* Per-model detail revealed via drilldown */}
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Model Observability" subtitle="Click any model for usage, cost, latency, and error detail" />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, mb: 0.5 }}>
          {[
            { label: 'Model', flex: true },
            { label: 'Calls/day', minWidth: 90 },
            { label: 'Tokens/day', minWidth: 90 },
            { label: 'Cost/mo', minWidth: 80 },
            { label: 'P95', minWidth: 70 },
            { label: 'Errors', minWidth: 70, right: true },
          ].map((c) => (
            <Typography
              key={c.label}
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: c.minWidth, flex: c.flex ? 1 : undefined, ml: c.right ? 'auto' : undefined, textAlign: c.right ? 'right' : undefined }}
            >
              {c.label}
            </Typography>
          ))}
        </Box>
        {AI_OBSERVABILITY.map((m) => (
          <DrilldownTableRow
            key={m.id}
            chartId="ai-observability.model"
            segment={m.id}
            label={m.model}
            value={fmtCost(m.monthlyCostUsd)}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{m.model}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{m.application}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90 }}>{(m.callsPerDay / 1000).toFixed(0)}K</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90 }}>{m.tokensPerDayM}M</Typography>
            <Typography variant="caption" sx={{ minWidth: 80, fontWeight: 700 }}>{fmtCost(m.monthlyCostUsd)}</Typography>
            <Typography variant="caption" sx={{ minWidth: 70, fontWeight: 700, color: latencyColor(m.p95LatencyMs) }}>{m.p95LatencyMs}ms</Typography>
            <Typography variant="caption" sx={{ minWidth: 70, fontWeight: 700, color: errorColor(m.errorRatePct), textAlign: 'right', ml: 'auto' }}>{m.errorRatePct}%</Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontSize: '0.72rem', lineHeight: 1.6 }}>
        {AI_OBSERVABILITY_EXEC_SUMMARY}
      </Typography>
    </Box>
  );
}
