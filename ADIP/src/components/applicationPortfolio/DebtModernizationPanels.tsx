import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useApplicationPortfolio } from '../../context/ApplicationPortfolioContext';
import { colors } from '../../theme/colors';

export function TechnicalDebtPanel() {
  const { topDebt, kpis } = useApplicationPortfolio();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Technical Debt Center" subtitle={`Portfolio debt index: ${kpis.technicalDebt}/100 · 150 items`} />
      {topDebt.map((d) => (
        <Box key={d.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.appName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {d.title} · Score: {d.score} · {d.effortDays} days · Priority: {d.priority}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function ModernizationPanel() {
  const { topModernization, kpis } = useApplicationPortfolio();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Modernization Opportunities" subtitle={`Readiness: ${kpis.modernizationReadiness}% · 100 opportunities`} />
      {topModernization.map((m) => (
        <Box key={m.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{m.appName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {m.title} · {m.approach} · Savings: ₹{(m.savingsEstimate / 1_000_000).toFixed(2)}M · Readiness: {m.readinessScore}%
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function CloudReadinessPanel() {
  const { cloudSummary, cloudAssessments, kpis } = useApplicationPortfolio();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Cloud Readiness" subtitle={`Enterprise score: ${kpis.cloudReadiness}%`} />
        <HorizontalBarChart chartId="application-portfolio.cloud-readiness" data={cloudSummary} height={180} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Cloud Assessments" subtitle="100 assessments" />
        {cloudAssessments.slice(0, 15).map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.applicationId} — {c.targetState}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Readiness: {c.readinessScore}% · Blockers: {c.blockers.join(', ')}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AiReadinessPanel() {
  const { aiSummary, aiAssessments, kpis } = useApplicationPortfolio();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="AI Readiness Assessment" subtitle={`Enterprise score: ${kpis.aiReadiness}%`} />
        <HorizontalBarChart chartId="application-portfolio.ai-readiness" data={aiSummary} height={200} barColor={colors.secondary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="AI Assessment Details" />
        {aiAssessments.slice(0, 12).map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.applicationId} — {a.readinessScore}%</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Data: {a.dataQuality}% · API: {a.apiMaturity}% · Gov: {a.governanceScore}% · Use cases: {a.useCases.join(', ')}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
