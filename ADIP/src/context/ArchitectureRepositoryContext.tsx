import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ArchAiInsight, ArchitectureRepositoryKpis } from '../types/architectureRepository';
import {
  activeExceptions,
  applicationsByDomain,
  archIntegrationLinks,
  capabilitiesByArea,
  cloudServiceAdoption,
  complianceDistribution,
  computeArchitectureRepositoryKpis,
  generateArchAiInsights,
  integrationRisks,
  lifecycleDistribution,
  modernizationCandidates,
  obsoletePlatforms,
  openFindings,
  referenceAdoptionSummary,
  reviewQueue,
  standardsAdoptionByDomain,
  topArchitectureDebt,
} from '../data/architectureRepositoryEngine';
import {
  ARCH_APIS,
  ARCH_APPLICATIONS,
  ARCH_CAPABILITIES,
  ARCH_CLOUD_SERVICES,
  ARCH_DATABASES,
  ARCH_DEBT_ITEMS,
  ARCH_DECISIONS,
  ARCH_EXCEPTIONS,
  ARCH_FINDINGS,
  ARCH_HISTORY,
  ARCH_INTEGRATIONS,
  ARCH_PLATFORMS,
  ARCH_PRINCIPLES,
  ARCH_REFERENCE_ARCHITECTURES,
  ARCH_REVIEWS,
  ARCH_STANDARDS,
  ARCH_TRACEABILITY_CHAINS,
  ARCHITECTURE_REPOSITORY_EXEC_SUMMARY,
} from '../data/architectureRepositoryMock';

interface ArchitectureRepositoryContextValue {
  kpis: ArchitectureRepositoryKpis;
  execSummary: string;
  capabilities: typeof ARCH_CAPABILITIES;
  applications: typeof ARCH_APPLICATIONS;
  integrations: typeof ARCH_INTEGRATIONS;
  apis: typeof ARCH_APIS;
  databases: typeof ARCH_DATABASES;
  platforms: typeof ARCH_PLATFORMS;
  cloudServices: typeof ARCH_CLOUD_SERVICES;
  standards: typeof ARCH_STANDARDS;
  principles: typeof ARCH_PRINCIPLES;
  referenceArchitectures: typeof ARCH_REFERENCE_ARCHITECTURES;
  reviews: typeof ARCH_REVIEWS;
  findings: typeof ARCH_FINDINGS;
  exceptions: typeof ARCH_EXCEPTIONS;
  decisions: typeof ARCH_DECISIONS;
  debtItems: typeof ARCH_DEBT_ITEMS;
  history: typeof ARCH_HISTORY;
  traceabilityChains: typeof ARCH_TRACEABILITY_CHAINS;
  capabilityAreas: ReturnType<typeof capabilitiesByArea>;
  appsByDomain: ReturnType<typeof applicationsByDomain>;
  complianceDist: ReturnType<typeof complianceDistribution>;
  lifecycleDist: ReturnType<typeof lifecycleDistribution>;
  standardsAdoption: ReturnType<typeof standardsAdoptionByDomain>;
  reviewQueueItems: ReturnType<typeof reviewQueue>;
  findingsList: ReturnType<typeof openFindings>;
  exceptionsList: ReturnType<typeof activeExceptions>;
  obsoletePlatformsList: ReturnType<typeof obsoletePlatforms>;
  topDebt: ReturnType<typeof topArchitectureDebt>;
  cloudAdoption: ReturnType<typeof cloudServiceAdoption>;
  intRisks: ReturnType<typeof integrationRisks>;
  refAdoption: ReturnType<typeof referenceAdoptionSummary>;
  modernization: ReturnType<typeof modernizationCandidates>;
  aiInsights: ArchAiInsight[];
  hubIntegrations: ReturnType<typeof archIntegrationLinks>;
}

const ArchitectureRepositoryContext = createContext<ArchitectureRepositoryContextValue | null>(null);

export function ArchitectureRepositoryProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ArchitectureRepositoryContextValue>(() => ({
    kpis: computeArchitectureRepositoryKpis(),
    execSummary: ARCHITECTURE_REPOSITORY_EXEC_SUMMARY,
    capabilities: ARCH_CAPABILITIES,
    applications: ARCH_APPLICATIONS,
    integrations: ARCH_INTEGRATIONS,
    apis: ARCH_APIS,
    databases: ARCH_DATABASES,
    platforms: ARCH_PLATFORMS,
    cloudServices: ARCH_CLOUD_SERVICES,
    standards: ARCH_STANDARDS,
    principles: ARCH_PRINCIPLES,
    referenceArchitectures: ARCH_REFERENCE_ARCHITECTURES,
    reviews: ARCH_REVIEWS,
    findings: ARCH_FINDINGS,
    exceptions: ARCH_EXCEPTIONS,
    decisions: ARCH_DECISIONS,
    debtItems: ARCH_DEBT_ITEMS,
    history: ARCH_HISTORY,
    traceabilityChains: ARCH_TRACEABILITY_CHAINS,
    capabilityAreas: capabilitiesByArea(),
    appsByDomain: applicationsByDomain(),
    complianceDist: complianceDistribution(),
    lifecycleDist: lifecycleDistribution(),
    standardsAdoption: standardsAdoptionByDomain(),
    reviewQueueItems: reviewQueue(),
    findingsList: openFindings(),
    exceptionsList: activeExceptions(),
    obsoletePlatformsList: obsoletePlatforms(),
    topDebt: topArchitectureDebt(),
    cloudAdoption: cloudServiceAdoption(),
    intRisks: integrationRisks(),
    refAdoption: referenceAdoptionSummary(),
    modernization: modernizationCandidates(),
    aiInsights: generateArchAiInsights(),
    hubIntegrations: archIntegrationLinks(),
  }), []);

  return (
    <ArchitectureRepositoryContext.Provider value={value}>
      {children}
    </ArchitectureRepositoryContext.Provider>
  );
}

export function useArchitectureRepository(): ArchitectureRepositoryContextValue {
  const ctx = useContext(ArchitectureRepositoryContext);
  if (!ctx) throw new Error('useArchitectureRepository must be used within ArchitectureRepositoryProvider');
  return ctx;
}
