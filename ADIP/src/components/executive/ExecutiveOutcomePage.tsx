import { useState, type ReactNode } from 'react';
import { Box, Grid } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { GlassCard } from '../common/GlassCard';
import { KpiCard } from '../common/KpiCard';
import { colors } from '../../theme/colors';

export interface OutcomeKpi {
  label: string;
  value: string | number;
  suffix?: string;
  chartId?: string;
}

export interface OutcomeTab {
  key: string;
  label: string;
  icon: SvgIconComponent;
  content: ReactNode;
}

/** The four curated headline KPIs for an executive outcome's Overview tab. */
export function OutcomeKpiGrid({ kpis }: { kpis: OutcomeKpi[] }) {
  return (
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
  );
}

interface ExecutiveOutcomePageProps {
  icon: SvgIconComponent;
  title: string;
  subtitle: string;
  /**
   * Curated horizontal tabs for the outcome. The first tab is the Overview;
   * a trailing "More" tab can expose the full underlying center so no
   * functionality is lost while the executive view stays focused.
   */
  tabs: OutcomeTab[];
}

export function ExecutiveOutcomePage({ icon: Icon, title, subtitle, tabs }: ExecutiveOutcomePageProps) {
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

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
            const isActive = t.key === current?.key;
            const TabIcon = t.icon;
            return (
              <Box
                key={t.key}
                role="button"
                tabIndex={0}
                onClick={() => setActive(t.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(t.key); } }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.7, borderRadius: 1.5, cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? colors.text.primary : colors.text.secondary,
                  bgcolor: isActive ? `${colors.primary}1f` : 'transparent',
                  border: `1px solid ${isActive ? colors.primary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.primary}12` },
                }}
              >
                <TabIcon sx={{ fontSize: 16, color: isActive ? colors.primary : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      <Box>{current?.content}</Box>
    </Box>
  );
}
