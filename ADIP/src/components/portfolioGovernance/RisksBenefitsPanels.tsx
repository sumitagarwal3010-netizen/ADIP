import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import { colors } from '../../theme/colors';

export function PortfolioRisksPanel() {
  const { risks, kpis } = usePortfolioGovernance();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Portfolio Risks" subtitle={`Risk exposure: ${kpis.riskExposure}% · ${risks.length} elevated items`} />
      {risks.map((r) => (
        <Box key={r.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            Risk: {r.risk} · Confidence: {r.confidence}% · Status: {r.status}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function BenefitsTrackingPanel() {
  const { benefits, kpis } = usePortfolioGovernance();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Benefits Tracking" subtitle={`Benefits realization: ${kpis.benefitsRealization}%`} />
      {benefits.map((b) => (
        <Box key={b.projectId} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{b.projectName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            Forecast: ₹{(b.forecast / 1_000_000).toFixed(2)}M · Realized: ₹{(b.realized / 1_000_000).toFixed(2)}M ·
            {b.quarter} · Confidence: {b.confidence}%
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
