import { Navigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CloudIcon from '@mui/icons-material/Cloud';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';
import { ExecutiveOutcomePage, OutcomeKpiGrid, type OutcomeKpi, type OutcomeTab } from '../components/executive/ExecutiveOutcomePage';
import { TechnologyStrategyCenter } from './TechnologyStrategyCenter';
import { ModernizationWavesPanel } from '../components/technologyStrategy/InvestmentRiskPanels';
import { CloudStrategyPanel } from '../components/technologyStrategy/PlatformStrategyPanels';
import { TechnologyStandardsPanel } from '../components/technologyStrategy/StandardsLifecyclePanels';
import { useTechnologyStrategy } from '../context/TechnologyStrategyContext';
import { useArchitectureRepository } from '../context/ArchitectureRepositoryContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessTechnologyStrategy } from '../data/technologyStrategyEngine';

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
    { key: 'more', label: 'More', icon: LayersIcon, content: <TechnologyStrategyCenter initialTab="standards" /> },
  ];

  return (
    <ExecutiveOutcomePage
      icon={RocketLaunchIcon}
      title="Technology Health"
      subtitle="Modernization, cloud adoption, and architecture compliance — full technology strategy under More"
      tabs={tabs}
    />
  );
}
