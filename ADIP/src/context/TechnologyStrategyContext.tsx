import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TechAiInsight, TechnologyStrategyKpis } from '../types/technologyStrategy';
import {
  aiPlatformsByCategory,
  cloudAdoptionByProvider,
  computeTechnologyStrategyKpis,
  generateTechAiInsights,
  investmentByStance,
  lifecycleDistribution,
  modernizationByWave,
  modernizationInitiatives,
  retirementCandidates,
  stanceDistribution,
  standardsAdoptionByCategory,
  strategicPlatformAdoptionChart,
  technologiesByCategory,
  techIntegrationLinks,
  topAiPlatforms,
  topCloudPlatforms,
  topInvestments,
  topStrategicPlatforms,
  topTechnologyRisks,
  topVendorRisks,
  vendorConcentrationChart,
} from '../data/technologyStrategyEngine';
import {
  AI_PLATFORMS,
  CLOUD_PLATFORMS,
  MODERNIZATION_INITIATIVES,
  STRATEGIC_PLATFORMS,
  TECH_INVESTMENTS,
  TECH_RISKS,
  TECH_ROADMAP,
  TECH_STANDARDS,
  TECH_TRACEABILITY_CHAINS,
  TECHNOLOGIES,
  TECHNOLOGY_STRATEGY_EXEC_SUMMARY,
  VENDOR_PRODUCTS,
} from '../data/technologyStrategyMock';

interface TechnologyStrategyContextValue {
  kpis: TechnologyStrategyKpis;
  execSummary: string;
  technologies: typeof TECHNOLOGIES;
  strategicPlatforms: typeof STRATEGIC_PLATFORMS;
  vendorProducts: typeof VENDOR_PRODUCTS;
  standards: typeof TECH_STANDARDS;
  risks: typeof TECH_RISKS;
  modernization: typeof MODERNIZATION_INITIATIVES;
  cloudPlatforms: typeof CLOUD_PLATFORMS;
  aiPlatforms: typeof AI_PLATFORMS;
  roadmap: typeof TECH_ROADMAP;
  investments: typeof TECH_INVESTMENTS;
  traceabilityChains: typeof TECH_TRACEABILITY_CHAINS;
  byCategory: ReturnType<typeof technologiesByCategory>;
  lifecycleDist: ReturnType<typeof lifecycleDistribution>;
  stanceDist: ReturnType<typeof stanceDistribution>;
  standardsAdoption: ReturnType<typeof standardsAdoptionByCategory>;
  topPlatforms: ReturnType<typeof topStrategicPlatforms>;
  platformAdoptionChart: ReturnType<typeof strategicPlatformAdoptionChart>;
  cloudByProvider: ReturnType<typeof cloudAdoptionByProvider>;
  topClouds: ReturnType<typeof topCloudPlatforms>;
  aiByCategory: ReturnType<typeof aiPlatformsByCategory>;
  topAis: ReturnType<typeof topAiPlatforms>;
  vendorChart: ReturnType<typeof vendorConcentrationChart>;
  vendorRisks: ReturnType<typeof topVendorRisks>;
  techRisks: ReturnType<typeof topTechnologyRisks>;
  modByWave: ReturnType<typeof modernizationByWave>;
  modInitiatives: ReturnType<typeof modernizationInitiatives>;
  topInvest: ReturnType<typeof topInvestments>;
  investByStance: ReturnType<typeof investmentByStance>;
  retirements: ReturnType<typeof retirementCandidates>;
  aiInsights: TechAiInsight[];
  hubIntegrations: ReturnType<typeof techIntegrationLinks>;
}

const TechnologyStrategyContext = createContext<TechnologyStrategyContextValue | null>(null);

export function TechnologyStrategyProvider({ children }: { children: ReactNode }) {
  const value = useMemo<TechnologyStrategyContextValue>(() => ({
    kpis: computeTechnologyStrategyKpis(),
    execSummary: TECHNOLOGY_STRATEGY_EXEC_SUMMARY,
    technologies: TECHNOLOGIES,
    strategicPlatforms: STRATEGIC_PLATFORMS,
    vendorProducts: VENDOR_PRODUCTS,
    standards: TECH_STANDARDS,
    risks: TECH_RISKS,
    modernization: MODERNIZATION_INITIATIVES,
    cloudPlatforms: CLOUD_PLATFORMS,
    aiPlatforms: AI_PLATFORMS,
    roadmap: TECH_ROADMAP,
    investments: TECH_INVESTMENTS,
    traceabilityChains: TECH_TRACEABILITY_CHAINS,
    byCategory: technologiesByCategory(),
    lifecycleDist: lifecycleDistribution(),
    stanceDist: stanceDistribution(),
    standardsAdoption: standardsAdoptionByCategory(),
    topPlatforms: topStrategicPlatforms(),
    platformAdoptionChart: strategicPlatformAdoptionChart(),
    cloudByProvider: cloudAdoptionByProvider(),
    topClouds: topCloudPlatforms(),
    aiByCategory: aiPlatformsByCategory(),
    topAis: topAiPlatforms(),
    vendorChart: vendorConcentrationChart(),
    vendorRisks: topVendorRisks(),
    techRisks: topTechnologyRisks(),
    modByWave: modernizationByWave(),
    modInitiatives: modernizationInitiatives(),
    topInvest: topInvestments(),
    investByStance: investmentByStance(),
    retirements: retirementCandidates(),
    aiInsights: generateTechAiInsights(),
    hubIntegrations: techIntegrationLinks(),
  }), []);

  return (
    <TechnologyStrategyContext.Provider value={value}>
      {children}
    </TechnologyStrategyContext.Provider>
  );
}

export function useTechnologyStrategy(): TechnologyStrategyContextValue {
  const ctx = useContext(TechnologyStrategyContext);
  if (!ctx) throw new Error('useTechnologyStrategy must be used within TechnologyStrategyProvider');
  return ctx;
}
