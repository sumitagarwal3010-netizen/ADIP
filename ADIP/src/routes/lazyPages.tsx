import { lazy, type ComponentType } from 'react';

/** Lazy-loaded route pages — reduces initial bundle size. */
function lazyNamed<T extends ComponentType<unknown>>(
  loader: () => Promise<Record<string, T>>,
  name: string,
) {
  return lazy(() => loader().then((mod) => ({ default: mod[name] as T })));
}

export const ExecutiveControlTower = lazyNamed(
  () => import('../pages/ExecutiveControlTower'),
  'ExecutiveControlTower',
);
export const AiDeliveryCopilotCenter = lazyNamed(
  () => import('../pages/AiDeliveryCopilotCenter'),
  'AiDeliveryCopilotCenter',
);
export const TransformationPmoCenter = lazyNamed(
  () => import('../pages/TransformationPmoCenter'),
  'TransformationPmoCenter',
);
export const UniversalArtifactsRepository = lazyNamed(
  () => import('../pages/UniversalArtifactsRepository'),
  'UniversalArtifactsRepository',
);
export const AIGovernanceCenter = lazyNamed(
  () => import('../pages/AIGovernanceCenter'),
  'AIGovernanceCenter',
);
export const TraceabilityCenter = lazyNamed(
  () => import('../pages/TraceabilityCenter'),
  'TraceabilityCenter',
);
export const PortfolioGovernanceCenter = lazyNamed(
  () => import('../pages/PortfolioGovernanceCenter'),
  'PortfolioGovernanceCenter',
);
export const ApplicationPortfolioCenter = lazyNamed(
  () => import('../pages/ApplicationPortfolioCenter'),
  'ApplicationPortfolioCenter',
);
export const ArchitectureRepositoryCenter = lazyNamed(
  () => import('../pages/ArchitectureRepositoryCenter'),
  'ArchitectureRepositoryCenter',
);
export const TechnologyStrategyCenter = lazyNamed(
  () => import('../pages/TechnologyStrategyCenter'),
  'TechnologyStrategyCenter',
);
export const EnterpriseRiskCenter = lazyNamed(
  () => import('../pages/EnterpriseRiskCenter'),
  'EnterpriseRiskCenter',
);
export const ValueRealizationCenter = lazyNamed(
  () => import('../pages/ValueRealizationCenter'),
  'ValueRealizationCenter',
);
export const ProductionIntelligenceCenter = lazyNamed(
  () => import('../pages/ProductionIntelligenceCenter'),
  'ProductionIntelligenceCenter',
);
export const RequirementsHub = lazyNamed(() => import('../pages/RequirementsHub'), 'RequirementsHub');
export const ArchitectureHub = lazyNamed(() => import('../pages/ArchitectureHub'), 'ArchitectureHub');
export const DevelopmentHub = lazyNamed(() => import('../pages/DevelopmentHub'), 'DevelopmentHub');
export const TestingHub = lazyNamed(() => import('../pages/TestingHub'), 'TestingHub');
export const ReleaseCenter = lazyNamed(() => import('../pages/ReleaseCenter'), 'ReleaseCenter');
