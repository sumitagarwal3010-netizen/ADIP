import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { DonutChart } from '../charts/DonutChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

const TYPE_COLOR: Record<string, string> = {
  Article: colors.info,
  Control: colors.success,
  Playbook: colors.primary,
  Pattern: colors.secondary,
};

export function LearningRecommendationsPanel() {
  const { recommendations, recommendationsByType, recommendationsBySource, traceabilityChains } = useKnowledgeCenter();

  const typeChart = recommendationsByType.map((t) => ({
    ...t,
    color: TYPE_COLOR[t.name] ?? colors.info,
  }));

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Recommendations by Type" subtitle="Articles · Controls · Playbooks · Patterns" />
            <DonutChart chartId="knowledge-center.rec-by-type" data={typeChart} height={200} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Recommendation Sources" subtitle="Audit · Production · Copilot · Notifications · Workflow · Event Bus" />
            <HorizontalBarChart chartId="knowledge-center.rec-by-source" data={recommendationsBySource} height={200} barColor={colors.secondary} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Knowledge Traceability" subtitle="Requirement → Architecture → Development → Testing → Release → Incident → RCA → Lesson → Best Practice → Playbook" />
        {traceabilityChains.slice(0, 4).map((c) => (
          <Box key={c.lessonLearned} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: `${colors.secondary}08`, border: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontSize: '0.62rem', lineHeight: 1.8 }}>
              <strong>{c.requirement}</strong> → {c.architecture} → {c.development} → {c.testing} → {c.release} → {c.incident} → {c.rca} → <strong>{c.lessonLearned}</strong> → {c.bestPractice} → {c.playbook}
            </Typography>
          </Box>
        ))}
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Learning Recommendations" subtitle={`${recommendations.length} rule-based suggestions from integrated hubs`} />
        {recommendations.slice(0, 15).map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.title}</Typography>
              <Chip label={r.type} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
              <Chip label={r.source} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
              <Chip label={r.priority} size="small" color={r.priority === 'critical' ? 'error' : 'default'} sx={{ fontSize: '0.58rem', height: 18 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{r.reason} → {r.targetId}</Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
