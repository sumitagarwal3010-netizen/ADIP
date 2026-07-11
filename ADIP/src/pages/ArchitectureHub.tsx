import { Box, Grid } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { DependencyGraph } from '../components/charts/DependencyGraph';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { DesignIntakeWorkflow } from '../components/architecture/DesignIntakeWorkflow';
import { AIWorkspacePanel } from '../components/workflow/AIWorkspacePanel';

export function ArchitectureHub() {
  const { architecture } = useFilteredSimulation();

  return (
    <Box>
      <AIWorkspacePanel module="architecture" number={1} hideFlowGuide />

      <DesignIntakeWorkflow>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Architecture Readiness" value={architecture.readiness} trend={1.5} /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Integration Risks" value={architecture.integrationRisks} suffix="" /></Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <GlassCard sx={{ p: 2 }} glow="blue">
              <ModuleHeader number={3} title="UPI & Payments Dependency Map" />
              <DependencyGraph nodes={architecture.services} edges={architecture.edges} height={280} />
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
