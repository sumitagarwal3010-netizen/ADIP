import { useState, type ReactNode } from 'react';
import { Box, Grid } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LayersIcon from '@mui/icons-material/Layers';
import { GlassCard } from '../common/GlassCard';
import { KpiCard } from '../common/KpiCard';
import { colors } from '../../theme/colors';

export interface OutcomeKpi {
  label: string;
  value: string | number;
  suffix?: string;
  chartId?: string;
}

interface ExecutiveOutcomePageProps {
  icon: SvgIconComponent;
  title: string;
  subtitle: string;
  /** Exactly the curated executive KPIs (max 4) shown on the Overview tab. */
  kpis: OutcomeKpi[];
  /** Full module surface shown under the secondary "Details" tab. */
  details: ReactNode;
}

/**
 * Executive Outcome layout: a focused Overview showing only the curated headline
 * KPIs, with every remaining metric available behind a secondary "Details" tab.
 * No new data or engines — values are passed in from existing engine KPIs.
 */
export function ExecutiveOutcomePage({ icon: Icon, title, subtitle, kpis, details }: ExecutiveOutcomePageProps) {
  const [tab, setTab] = useState<'overview' | 'details'>('overview');

  const tabs: { key: 'overview' | 'details'; label: string; icon: SvgIconComponent }[] = [
    { key: 'overview', label: 'Overview', icon: DashboardIcon },
    { key: 'details', label: 'Details', icon: LayersIcon },
  ];

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <Icon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{title}</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>{subtitle}</Box>
        </Box>
      </GlassCard>

      <GlassCard sx={{ p: 1, mb: 1.5 }} hover={false}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {tabs.map((t) => {
            const active = t.key === tab;
            const TabIcon = t.icon;
            return (
              <Box
                key={t.key}
                role="button"
                tabIndex={0}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(t.key); } }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.7, borderRadius: 1.5, cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                  color: active ? colors.text.primary : colors.text.secondary,
                  bgcolor: active ? `${colors.primary}1f` : 'transparent',
                  border: `1px solid ${active ? colors.primary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.primary}12` },
                }}
              >
                <TabIcon sx={{ fontSize: 16, color: active ? colors.primary : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'overview' && (
        <Grid container spacing={1.5}>
          {kpis.slice(0, 4).map((kpi, i) => (
            <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
              <KpiCard
                label={kpi.label}
                value={kpi.value}
                suffix={kpi.suffix ?? ''}
                chartId={kpi.chartId}
                delay={i * 0.05}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 'details' && <Box>{details}</Box>}
    </Box>
  );
}
