import { Box, Grid, Typography } from '@mui/material';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { StatusDot } from '../components/common/StatusDot';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { colors } from '../theme/colors';

export function Administration() {
  const { administration } = useFilteredSimulation();
  const sections = [
    {
      title: 'Users',
      rows: ['428 active enterprise users', '17 pending access requests', 'MFA adoption: 98%'],
    },
    {
      title: 'Roles',
      rows: ['CIO / CTO / CISO governance roles mapped', 'Least-privilege templates applied', 'Quarterly role review scheduled'],
    },
    {
      title: 'Integrations',
      rows: administration.integrations.map((i) => `${i.name} (${i.status})`),
    },
    {
      title: 'Models',
      rows: ['8 governed models in registry', '2 models under review', '0 expired model approvals'],
    },
    {
      title: 'Audit Logs',
      rows: ['Last 24h events: 12,482', 'Critical admin events: 3', 'Retention policy: 365 days immutable'],
    },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        {sections.map((section) => (
          <Grid key={section.title} size={{ xs: 12, md: 6 }}>
            <GlassCard sx={{ p: 2 }}>
              <ModuleHeader title={section.title} />
              {section.rows.map((row) => (
                <Box key={row} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <StatusDot status="healthy" />
                  <Typography variant="caption" sx={{ flex: 1 }}>{row}</Typography>
                </Box>
              ))}
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
