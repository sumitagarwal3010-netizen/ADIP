import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { AiInsight, PortfolioGovernanceKpis } from '../types/portfolioGovernance';
import {
  benefitsTrackingSummary,
  capacityByQuarter,
  computePortfolioGovernanceKpis,
  demandPipelineByStatus,
  demandTopPrioritized,
  fundingUtilizationByPortfolio,
  generateAiInsights,
  integrationLinks,
  portfolioHealthByPortfolio,
  portfolioRisks,
  resourceUtilizationBySkill,
  roadmapByQuarter,
  strategicAlignmentByObjective,
} from '../data/portfolioGovernanceEngine';
import {
  PG_BENEFIT_FORECASTS,
  PG_BUSINESS_UNITS,
  PG_CAPACITY_PLANS,
  PG_DEMAND_REQUESTS,
  PG_FUNDING_REQUESTS,
  PG_PORTFOLIO_HISTORY,
  PG_PORTFOLIOS,
  PG_PROJECTS,
  PG_RESOURCES,
  PG_STRATEGIC_OBJECTIVES,
  PG_STRATEGIC_PROGRAMS,
  PG_TRACEABILITY_CHAINS,
  PORTFOLIO_GOVERNANCE_EXEC_SUMMARY,
} from '../data/portfolioGovernanceMock';

interface PortfolioGovernanceContextValue {
  kpis: PortfolioGovernanceKpis;
  execSummary: string;
  businessUnits: typeof PG_BUSINESS_UNITS;
  portfolios: typeof PG_PORTFOLIOS;
  programs: typeof PG_STRATEGIC_PROGRAMS;
  projects: typeof PG_PROJECTS;
  demands: typeof PG_DEMAND_REQUESTS;
  fundingRequests: typeof PG_FUNDING_REQUESTS;
  resources: typeof PG_RESOURCES;
  capacityPlans: typeof PG_CAPACITY_PLANS;
  objectives: typeof PG_STRATEGIC_OBJECTIVES;
  portfolioHistory: typeof PG_PORTFOLIO_HISTORY;
  benefitForecasts: typeof PG_BENEFIT_FORECASTS;
  traceabilityChains: typeof PG_TRACEABILITY_CHAINS;
  demandPipeline: ReturnType<typeof demandPipelineByStatus>;
  topDemands: ReturnType<typeof demandTopPrioritized>;
  portfolioHealth: ReturnType<typeof portfolioHealthByPortfolio>;
  capacityTrend: ReturnType<typeof capacityByQuarter>;
  resourceBySkill: ReturnType<typeof resourceUtilizationBySkill>;
  alignmentByObjective: ReturnType<typeof strategicAlignmentByObjective>;
  roadmap: ReturnType<typeof roadmapByQuarter>;
  risks: ReturnType<typeof portfolioRisks>;
  benefits: ReturnType<typeof benefitsTrackingSummary>;
  fundingByPortfolio: ReturnType<typeof fundingUtilizationByPortfolio>;
  aiInsights: AiInsight[];
  integrations: ReturnType<typeof integrationLinks>;
}

const PortfolioGovernanceContext = createContext<PortfolioGovernanceContextValue | null>(null);

export function PortfolioGovernanceProvider({ children }: { children: ReactNode }) {
  const value = useMemo<PortfolioGovernanceContextValue>(() => ({
    kpis: computePortfolioGovernanceKpis(),
    execSummary: PORTFOLIO_GOVERNANCE_EXEC_SUMMARY,
    businessUnits: PG_BUSINESS_UNITS,
    portfolios: PG_PORTFOLIOS,
    programs: PG_STRATEGIC_PROGRAMS,
    projects: PG_PROJECTS,
    demands: PG_DEMAND_REQUESTS,
    fundingRequests: PG_FUNDING_REQUESTS,
    resources: PG_RESOURCES,
    capacityPlans: PG_CAPACITY_PLANS,
    objectives: PG_STRATEGIC_OBJECTIVES,
    portfolioHistory: PG_PORTFOLIO_HISTORY,
    benefitForecasts: PG_BENEFIT_FORECASTS,
    traceabilityChains: PG_TRACEABILITY_CHAINS,
    demandPipeline: demandPipelineByStatus(),
    topDemands: demandTopPrioritized(),
    portfolioHealth: portfolioHealthByPortfolio(),
    capacityTrend: capacityByQuarter(),
    resourceBySkill: resourceUtilizationBySkill(),
    alignmentByObjective: strategicAlignmentByObjective(),
    roadmap: roadmapByQuarter(),
    risks: portfolioRisks(),
    benefits: benefitsTrackingSummary(),
    fundingByPortfolio: fundingUtilizationByPortfolio(),
    aiInsights: generateAiInsights(),
    integrations: integrationLinks(),
  }), []);

  return (
    <PortfolioGovernanceContext.Provider value={value}>
      {children}
    </PortfolioGovernanceContext.Provider>
  );
}

export function usePortfolioGovernance(): PortfolioGovernanceContextValue {
  const ctx = useContext(PortfolioGovernanceContext);
  if (!ctx) throw new Error('usePortfolioGovernance must be used within PortfolioGovernanceProvider');
  return ctx;
}
