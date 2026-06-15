import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useApplicationPortfolio } from '../../context/ApplicationPortfolioContext';
import { colors } from '../../theme/colors';

export function ApplicationInventoryPanel() {
  const { applications, inventory, kpis } = useApplicationPortfolio();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Application Inventory" subtitle={`${applications.length} applications · system of record`} />
        {inventory.map((a) => (
          <Box key={a.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.id} — {a.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {a.criticality} · {a.lifecycleStage} · Health {a.productionHealth}% · Owner: {a.businessOwner} / {a.technologyOwner} ·
              ₹{(a.annualCost / 1_000_000).toFixed(2)}M/yr
            </Typography>
          </Box>
        ))}
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Portfolio Summary" subtitle={`Annual cost: ₹${(kpis.annualCost / 1_000_000).toFixed(0)}M`} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          5 business units · 10 portfolios · 20 domains · 50 technology stacks · 100 integrations
        </Typography>
      </GlassCard>
    </Box>
  );
}

export function TechnologyHealthPanel() {
  const { techHealth, techStacks } = useApplicationPortfolio();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Health" subtitle={`${techStacks.length} technology stacks`} />
        <HorizontalBarChart chartId="application-portfolio.technology-obsolescence" data={techHealth} height={220} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Obsolescence Risk Stacks" />
        {techStacks.filter((s) => s.obsolescenceRisk === 'high' || s.obsolescenceRisk === 'critical').slice(0, 15).map((s) => (
          <Box key={s.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{s.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {s.category} · {s.applicationCount} apps · Risk: {s.obsolescenceRisk}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function BusinessCriticalityPanel() {
  const { criticalityDist, applications } = useApplicationPortfolio();
  const tier1 = applications.filter((a) => a.criticality === 'tier-1').slice(0, 15);

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Criticality Distribution" />
        <HorizontalBarChart chartId="application-portfolio.critical-applications" data={criticalityDist} height={180} barColor={colors.critical} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Tier-1 Critical Applications" />
        {tier1.map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Availability: {a.availability}% · Health: {a.productionHealth}% · Audit: {a.auditStatus} · Compliance: {a.complianceStatus}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
