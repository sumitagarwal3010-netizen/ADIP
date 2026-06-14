import { Box, Chip, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { SeverityChip } from '../common/SeverityChip';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

export function IncidentAnalyticsPanel() {
  const { incidents } = useProductionIntelligence();
  const open = incidents.filter((i) => i.status === 'open').slice(0, 15);
  const recent = incidents.slice(0, 20);

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Open Production Incidents" subtitle={`${open.length} active · ${incidents.length} total in catalog`} />
        {open.map((inc) => (
          <Box key={inc.id} sx={{ p: 1, mb: 0.75, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{inc.id} — {inc.title}</Typography>
              <SeverityChip severity={inc.severity} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {inc.application} · {inc.businessDomain} · Release {inc.introducedRelease} · Req {inc.linkedRequirement}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              {inc.customerImpact} · ₹{inc.financialImpact.toLocaleString()} impact
            </Typography>
          </Box>
        ))}
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Recent Incident Catalog" subtitle="Full production incident model with traceability links" />
        {recent.map((inc) => (
          <Box key={inc.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 70 }}>{inc.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1 }}>{inc.application}</Typography>
            <Chip label={inc.rcaPattern.replace('-', ' ')} size="small" sx={{ fontSize: '0.6rem', height: 20 }} />
            <Chip label={inc.status} size="small" color={inc.status === 'open' ? 'error' : 'default'} sx={{ fontSize: '0.6rem', height: 20 }} />
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
