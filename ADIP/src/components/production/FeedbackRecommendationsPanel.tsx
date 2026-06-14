import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { DonutChart } from '../charts/DonutChart';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

const DOMAIN_COLOR: Record<string, string> = {
  requirements: colors.info,
  architecture: colors.secondary,
  development: colors.primary,
  testing: colors.warning,
  release: colors.critical,
  governance: colors.text.muted,
  audit: colors.success,
};

export function FeedbackRecommendationsPanel() {
  const { feedbackRecommendations, feedbackByDomain, traceabilityChains } = useProductionIntelligence();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Recommendations by Domain" subtitle="Fed into AI Delivery Copilot" />
            <DonutChart
              chartId="prod-intel.feedback-by-domain"
              data={feedbackByDomain.map((d) => ({
                ...d,
                color: DOMAIN_COLOR[d.name.toLowerCase()] ?? colors.info,
              }))}
              height={200}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Traceability Chain" subtitle="Requirement → Architecture → Development → Testing → Release → Incident → RCA → Recommendation" />
            {traceabilityChains.slice(0, 5).map((chain) => (
              <Box key={chain.incident} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: `${colors.secondary}08`, border: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', lineHeight: 1.8, display: 'block' }}>
                  <strong>{chain.requirement}</strong> → {chain.architecture} → {chain.development} → {chain.testing} → {chain.release} → <strong>{chain.incident}</strong> → {chain.rca} → {chain.recommendation}
                </Typography>
              </Box>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Feedback Recommendations" subtitle={`${feedbackRecommendations.length} improvement actions from production signals`} />
        {feedbackRecommendations.slice(0, 15).map((r) => (
          <Box key={r.id} sx={{ p: 1, mb: 0.75, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.title}</Typography>
              <Chip label={r.domain} size="small" sx={{ fontSize: '0.58rem', height: 18, bgcolor: `${DOMAIN_COLOR[r.domain] ?? colors.info}22` }} />
              <Chip label={r.priority} size="small" color={r.priority === 'critical' ? 'error' : 'default'} sx={{ fontSize: '0.58rem', height: 18 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>{r.insight}</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>→ {r.suggestedAction}</Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
