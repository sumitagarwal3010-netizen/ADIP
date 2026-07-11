import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CloudIcon from '@mui/icons-material/Cloud';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';
import { Box, CircularProgress } from '@mui/material';
import { ExecutiveOutcomePage, OutcomeKpiGrid, type OutcomeKpi, type OutcomeTab } from '../components/executive/ExecutiveOutcomePage';
import { ModernizationWavesPanel } from '../components/technologyStrategy/InvestmentRiskPanels';
import { CloudStrategyPanel } from '../components/technologyStrategy/PlatformStrategyPanels';
import { TechnologyStandardsPanel } from '../components/technologyStrategy/StandardsLifecyclePanels';
import { useTechnologyStrategy } from '../context/TechnologyStrategyContext';
import { useArchitectureRepository } from '../context/ArchitectureRepositoryContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessTechnologyStrategy } from '../data/technologyStrategyEngine';
import { EnterpriseArtifactWorkspace } from '../components/workflow/EnterpriseArtifactWorkspace';

const TechnologyStrategyCenter = lazy(() =>
  import('./TechnologyStrategyCenter').then((m) => ({ default: m.TechnologyStrategyCenter })),
);

function LazyCenterFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
      <CircularProgress size={24} />
    </Box>
  );
}

export function TechnologyHealthOutcome() {
  const { personaId } = usePersona();
  const { kpis: techKpis } = useTechnologyStrategy();
  const { kpis: archKpis } = useArchitectureRepository();

  if (!canAccessTechnologyStrategy(personaId)) {
    return <Navigate to="/" replace />;
  }

  const kpis: OutcomeKpi[] = [
    { label: 'Technical Debt', value: techKpis.technologyDebt, suffix: '%', chartId: 'technology-strategy.technology-debt' },
    { label: 'Modernization Progress', value: techKpis.modernizationProgress, suffix: '%', chartId: 'technology-strategy.modernization-progress' },
    { label: 'Cloud Adoption', value: techKpis.cloudAdoption, suffix: '%', chartId: 'technology-strategy.cloud-adoption' },
    { label: 'Architecture Compliance', value: archKpis.standardsCompliance, suffix: '%', chartId: 'architecture-repository.standards-compliance' },
  ];

  const tabs: OutcomeTab[] = [
    { key: 'overview', label: 'Overview', icon: DashboardIcon, content: <OutcomeKpiGrid kpis={kpis} /> },
    { key: 'modernization', label: 'Modernization', icon: UpgradeIcon, content: <ModernizationWavesPanel /> },
    { key: 'cloud', label: 'Cloud', icon: CloudIcon, content: <CloudStrategyPanel /> },
    { key: 'architecture', label: 'Architecture', icon: AccountTreeIcon, content: <TechnologyStandardsPanel /> },
    { key: 'more', label: 'More', icon: LayersIcon, content: (
      <Suspense fallback={<LazyCenterFallback />}>
        <TechnologyStrategyCenter initialTab="standards" />
      </Suspense>
    ) },
  ];

  return (
    <Box>
      <EnterpriseArtifactWorkspace pillar="Executive AI" submenu="Technology Advisor" />
      <ExecutiveOutcomePage
        icon={RocketLaunchIcon}
        title="Overview"
        subtitle="Modernization, cloud adoption, and architecture compliance — full technology strategy under More"
        tabs={tabs}
      />
    </Box>
  );
}
