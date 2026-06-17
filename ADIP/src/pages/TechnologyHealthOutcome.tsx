import { Navigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { ExecutiveOutcomePage, type OutcomeKpi } from '../components/executive/ExecutiveOutcomePage';
import { TechnologyStrategyCenter } from './TechnologyStrategyCenter';
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

  return (
    <ExecutiveOutcomePage
      icon={RocketLaunchIcon}
      title="Technology Health"
      subtitle="Modernization, cloud adoption, and architecture compliance — full technology strategy under Details"
      kpis={kpis}
      details={<TechnologyStrategyCenter initialTab="dashboard" />}
    />
  );
}
