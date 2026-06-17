import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { colors } from '../theme/colors';
import {
  AI_EVALUATIONS,
  AI_EVALUATION_EXEC_SUMMARY,
  computeEvaluationScores,
  type EvalRegressionStatus,
} from '../data/aiEvaluationMock';

function scoreColor(v: number): string {
  if (v >= 90) return colors.success;
  if (v >= 80) return colors.warning;
  return colors.critical;
}

function regressionColor(status: EvalRegressionStatus): string {
  if (status === 'Pass') return colors.success;
  if (status === 'Watch') return colors.warning;
  return colors.critical;
}

export function AIEvaluationCenter() {
  const scores = computeEvaluationScores();
  const regressionLabel = `${scores.regressionPass}/${scores.evaluated} Pass`;

  return (
    <Box>
      {/* Summary scores only — detail via drilldown */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 4 }}>
          <KpiCard label="Quality Score" value={scores.quality} suffix="%" trend={1.6} chartId="ai-evaluation.quality" />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <KpiCard label="Hallucination Score" value={scores.hallucination} suffix="%" trend={0.9} chartId="ai-evaluation.hallucination" />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <KpiCard label="Safety Score" value={scores.safety} suffix="%" trend={1.2} chartId="ai-evaluation.safety" />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <KpiCard label="Grounding Score" value={scores.grounding} suffix="%" trend={-0.4} chartId="ai-evaluation.grounding" />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <KpiCard label="Regression Pass Rate" value={scores.regressionPassRate} suffix="%" trend={2.1} chartId="ai-evaluation.regression" />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <KpiCard label="Use Cases Evaluated" value={scores.evaluated} suffix="" chartId="ai-evaluation.coverage" />
        </Grid>
      </Grid>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox
          title="AI Evaluation Posture"
          insight={`${regressionLabel} on the latest regression run. Grounding (${scores.grounding}%) is the weakest dimension and one model failed a fairness slice. Click any score above to drill into per-use-case evaluation results.`}
        />
      </Box>

      {/* Detail revealed via drilldown rows (summary-first; one compact table) */}
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Evaluation by Use Case" subtitle="Click any use case for detailed evaluation results" />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, mb: 0.5 }}>
          {[
            { label: 'Use Case', flex: true },
            { label: 'Quality', minWidth: 70 },
            { label: 'Halluc.', minWidth: 70 },
            { label: 'Safety', minWidth: 70 },
            { label: 'Grounding', minWidth: 80 },
            { label: 'Regression', minWidth: 90, right: true },
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
        {AI_EVALUATIONS.map((e) => (
          <DrilldownTableRow
            key={e.id}
            chartId="ai-evaluation.use-case"
            segment={e.id}
            label={e.useCase}
            value={`${e.qualityScore}%`}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Box sx={{ flex: 1, minWidth: 160 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{e.useCase}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{e.model}</Typography>
            </Box>
            <Typography variant="caption" sx={{ minWidth: 70, fontWeight: 700, color: scoreColor(e.qualityScore) }}>{e.qualityScore}%</Typography>
            <Typography variant="caption" sx={{ minWidth: 70, fontWeight: 700, color: scoreColor(e.hallucinationScore) }}>{e.hallucinationScore}%</Typography>
            <Typography variant="caption" sx={{ minWidth: 70, fontWeight: 700, color: scoreColor(e.safetyScore) }}>{e.safetyScore}%</Typography>
            <Typography variant="caption" sx={{ minWidth: 80, fontWeight: 700, color: scoreColor(e.groundingScore) }}>{e.groundingScore}%</Typography>
            <Box sx={{ minWidth: 90, textAlign: 'right', ml: 'auto' }}>
              <Typography
                variant="caption"
                sx={{ px: 1, py: 0.25, borderRadius: 1, fontWeight: 700, fontSize: '0.62rem', bgcolor: `${regressionColor(e.regressionStatus)}22`, color: regressionColor(e.regressionStatus) }}
              >
                {e.regressionStatus}
              </Typography>
            </Box>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontSize: '0.72rem', lineHeight: 1.6 }}>
        {AI_EVALUATION_EXEC_SUMMARY}
      </Typography>
    </Box>
  );
}
