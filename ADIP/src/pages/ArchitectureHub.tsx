import { Box, Grid, Typography, Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { DependencyGraph } from '../components/charts/DependencyGraph';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { DesignIntakeWorkflow } from '../components/architecture/DesignIntakeWorkflow';
import { AIWorkspacePanel } from '../components/workflow/AIWorkspacePanel';
import { EnterpriseArtifactWorkspace } from '../components/workflow/EnterpriseArtifactWorkspace';
import { colors } from '../theme/colors';

export function ArchitectureHub() {
  const { architecture } = useFilteredSimulation();

  return (
    <Box>
      <EnterpriseArtifactWorkspace pillar="AI SDLC" submenu="Design & Architecture" />
      <Box sx={{ mt: 0.5 }}>
        <AIWorkspacePanel module="architecture" number={1} hideFlowGuide />
      </Box>

      <DesignIntakeWorkflow>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Architecture Readiness" value={architecture.readiness} trend={1.5} /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Integration Risks" value={architecture.integrationRisks} suffix="" /></Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <GlassCard sx={{ p: 2 }} glow="blue">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <ModuleHeader number={3} title="UPI & Payments Dependency Map" />
                <Tooltip title="Circuit breaker: a software resilience pattern that prevents repeated calls to a failing downstream service.">
                  <IconButton size="small" aria-label="Circuit breaker definition">
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: colors.text.muted }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <DependencyGraph nodes={architecture.services} edges={architecture.edges} height={280} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: colors.primary, mr: 0.5 }} />
                  Blue: Core Banking System
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: colors.warning, mr: 0.5 }} />
                  Orange: Supporting Service
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: colors.critical, mr: 0.5 }} />
                  Red: Critical or High-Risk Dependency
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  <Box component="span" sx={{ display: 'inline-block', width: 16, borderTop: `2px dashed ${colors.border.glow}`, mr: 0.5, verticalAlign: 'middle' }} />
                  Dotted line: Runtime dependency
                </Typography>
              </Box>
            </GlassCard>
          </Grid>
        </Grid>

        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="AI Design Recommendation" insight={architecture.recommendations[0]} />
        </Box>
      </DesignIntakeWorkflow>
    </Box>
  );
}
