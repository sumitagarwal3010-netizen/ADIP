import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { RoleActionCenter } from '../components/persona/RoleActionCenter';
import { usePersona } from '../context/PersonaContext';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { HUB_ARTIFACT_CONFIGS } from '../data/hubArtifactDefinitions';
import type { TraceNode } from '../data/traceabilityModel';
import { colors } from '../theme/colors';

export function PersonaLanding() {
  const { persona } = usePersona();
  const state = useFilteredSimulation();
  const navigate = useNavigate();

  // Clicking an action item jumps to Traceability Impact Analysis for that node.
  const handleSelectNode = (node: TraceNode) => {
    navigate(`/traceability/impact?node=${encodeURIComponent(node.id)}`);
  };

  return (
    <Box>
      {/* Persona header / mission */}
      <GlassCard sx={{ p: 2, mb: 1.5 }} glow="purple" hover={false}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: colors.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#fff',
              boxShadow: `0 0 18px ${colors.secondary}55`,
            }}
          >
            {persona.initials}
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
              {persona.label} Workspace
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {persona.title} · {persona.mission}
            </Typography>
          </Box>
        </Box>
      </GlassCard>

      {/* Role metrics — live from simulation state */}
      <Grid container spacing={1.5}>
        {persona.metrics.map((m, i) => (
          <Grid key={m.label} size={{ xs: 6, md: 3 }}>
            <KpiCard label={m.label} value={m.value(state)} suffix={m.suffix ?? ''} trend={m.trend} delay={i * 0.05} compact />
          </Grid>
        ))}
      </Grid>

      {/* Quick links to the persona's most-used existing modules */}
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Quick Access" subtitle={`${persona.label} priority modules`} />
        <Grid container spacing={1}>
          {persona.quickLinks.map((link) => (
            <Grid key={link.to} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate(link.to)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(link.to); } }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: colors.bg.glass,
                  border: `1px solid ${colors.border.subtle}`,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  '&:hover': { borderColor: colors.primary, bgcolor: `${colors.primary}12` },
                  '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 1 },
                }}
              >
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 600, fontSize: '0.75rem' }}>
                  {link.label}
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 15, color: colors.text.muted }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </GlassCard>

      {/* Role-based action center / work queue */}
      <RoleActionCenter persona={persona} onSelectNode={handleSelectNode} />

      {/* Role-based reports — reuse existing hub artifact generators */}
      {persona.reportHubs.map((hubKey) => (
        <HubArtifactGenerator key={`${persona.id}-${hubKey}`} hubKey={hubKey} />
      ))}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontSize: '0.68rem' }}>
        Persona Mode composes existing ADIP dashboards, traceability, and AI report generators for the{' '}
        {persona.label} role. Reports above:{' '}
        {persona.reportHubs.map((h) => HUB_ARTIFACT_CONFIGS[h].title).join(' · ') || 'n/a'}.
      </Typography>
    </Box>
  );
}
