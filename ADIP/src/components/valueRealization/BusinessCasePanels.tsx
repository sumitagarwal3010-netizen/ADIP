import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { useValueRealization } from '../../context/ValueRealizationContext';
import { colors } from '../../theme/colors';

const SECTIONS = [
  { key: 'executiveNarrative', title: 'Executive Narrative' },
  { key: 'benefitsSummary', title: 'Benefits Summary' },
  { key: 'financialSummary', title: 'Financial Summary' },
  { key: 'riskReductionSummary', title: 'Risk Reduction Summary' },
  { key: 'transformationSummary', title: 'Transformation Summary' },
  { key: 'boardPresentationSummary', title: 'Board Presentation Summary' },
] as const;

export function BusinessCaseGeneratorPanel() {
  const { businessCase } = useValueRealization();

  return (
    <Box>
      {SECTIONS.map((s) => (
        <Box key={s.key} sx={{ mb: 1.5 }}>
          <AIInsightBox title={s.title} insight={businessCase[s.key]} />
        </Box>
      ))}
    </Box>
  );
}

export function BenchmarkingPanel() {
  const { benchmarkMetrics, benchmarkGaps } = useValueRealization();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Benchmarking — Gap Analysis" subtitle="Current State vs Traditional SDLC vs Target vs AI SDLC" />
        {benchmarkGaps.map((g) => (
          <Box key={g.metric} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{g.metric}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              AI SDLC improvement: {g.gap}% vs traditional · Transformation progress: {g.progress}%
            </Typography>
          </Box>
        ))}
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Detailed Benchmark Comparison" />
        {benchmarkMetrics.map((m) => (
          <Box key={m.metric} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{m.metric}</Typography>
            <Typography variant="caption" color="text.secondary">Current: {m.current}{m.unit}</Typography>
            <Typography variant="caption" color="text.secondary">Traditional: {m.traditional}{m.unit}</Typography>
            <Typography variant="caption" color="info.main">Target: {m.target}{m.unit}</Typography>
            <Typography variant="caption" color="success.main">AI SDLC: {m.aiSdlc}{m.unit}</Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ValueTraceabilityPanel() {
  const { traceabilityChains } = useValueRealization();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Value Traceability" subtitle="Capability → Benefit → Metric → KPI → Value → Executive Outcome" />
      {traceabilityChains.map((c) => (
        <Box key={c.capability} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: `${colors.primary}08`, border: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.8 }}>
            <strong>{c.capability}</strong> → {c.benefit} → {c.metric} → <strong>{c.kpi}</strong> → {c.value} → <em>{c.outcome}</em>
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
