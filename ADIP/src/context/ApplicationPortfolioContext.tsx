import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ApmAiInsight, ApplicationPortfolioKpis } from '../types/applicationPortfolio';
import {
  aiReadinessSummary,
  apmIntegrationLinks,
  applicationRisks,
  applicationsByDomain,
  applicationsByPortfolio,
  cloudReadinessSummary,
  computeApplicationPortfolioKpis,
  criticalityDistribution,
  dependencyGraph,
  generateApmAiInsights,
  inventorySample,
  lifecycleDistribution,
  rationalizationCandidates,
  technologyHealthByStack,
  topModernizationOpportunities,
  topTechnicalDebt,
} from '../data/applicationPortfolioEngine';
import {
  APM_AI_ASSESSMENTS,
  APM_APPLICATIONS,
  APM_BUSINESS_UNITS,
  APM_CLOUD_ASSESSMENTS,
  APM_DOMAINS,
  APM_INTEGRATIONS,
  APM_LIFECYCLE_HISTORY,
  APM_MODERNIZATION,
  APM_PORTFOLIOS,
  APM_TECH_RISKS,
  APM_TECH_STACKS,
  APM_TECHNICAL_DEBT,
  APM_TRACEABILITY_CHAINS,
  APPLICATION_PORTFOLIO_EXEC_SUMMARY,
} from '../data/applicationPortfolioMock';

interface ApplicationPortfolioContextValue {
  kpis: ApplicationPortfolioKpis;
  execSummary: string;
  businessUnits: typeof APM_BUSINESS_UNITS;
  portfolios: typeof APM_PORTFOLIOS;
  domains: typeof APM_DOMAINS;
  applications: typeof APM_APPLICATIONS;
  techStacks: typeof APM_TECH_STACKS;
  appIntegrations: typeof APM_INTEGRATIONS;
  techRisks: typeof APM_TECH_RISKS;
  technicalDebt: typeof APM_TECHNICAL_DEBT;
  modernization: typeof APM_MODERNIZATION;
  cloudAssessments: typeof APM_CLOUD_ASSESSMENTS;
  aiAssessments: typeof APM_AI_ASSESSMENTS;
  lifecycleHistory: typeof APM_LIFECYCLE_HISTORY;
  traceabilityChains: typeof APM_TRACEABILITY_CHAINS;
  byDomain: ReturnType<typeof applicationsByDomain>;
  byPortfolio: ReturnType<typeof applicationsByPortfolio>;
  criticalityDist: ReturnType<typeof criticalityDistribution>;
  techHealth: ReturnType<typeof technologyHealthByStack>;
  topDebt: ReturnType<typeof topTechnicalDebt>;
  topModernization: ReturnType<typeof topModernizationOpportunities>;
  cloudSummary: ReturnType<typeof cloudReadinessSummary>;
  aiSummary: ReturnType<typeof aiReadinessSummary>;
  risks: ReturnType<typeof applicationRisks>;
  dependencies: ReturnType<typeof dependencyGraph>;
  lifecycleDist: ReturnType<typeof lifecycleDistribution>;
  rationalization: ReturnType<typeof rationalizationCandidates>;
  inventory: ReturnType<typeof inventorySample>;
  aiInsights: ApmAiInsight[];
  hubIntegrations: ReturnType<typeof apmIntegrationLinks>;
}

const ApplicationPortfolioContext = createContext<ApplicationPortfolioContextValue | null>(null);

export function ApplicationPortfolioProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ApplicationPortfolioContextValue>(() => ({
    kpis: computeApplicationPortfolioKpis(),
    execSummary: APPLICATION_PORTFOLIO_EXEC_SUMMARY,
    businessUnits: APM_BUSINESS_UNITS,
    portfolios: APM_PORTFOLIOS,
    domains: APM_DOMAINS,
    applications: APM_APPLICATIONS,
    techStacks: APM_TECH_STACKS,
    appIntegrations: APM_INTEGRATIONS,
    techRisks: APM_TECH_RISKS,
    technicalDebt: APM_TECHNICAL_DEBT,
    modernization: APM_MODERNIZATION,
    cloudAssessments: APM_CLOUD_ASSESSMENTS,
    aiAssessments: APM_AI_ASSESSMENTS,
    lifecycleHistory: APM_LIFECYCLE_HISTORY,
    traceabilityChains: APM_TRACEABILITY_CHAINS,
    byDomain: applicationsByDomain(),
    byPortfolio: applicationsByPortfolio(),
    criticalityDist: criticalityDistribution(),
    techHealth: technologyHealthByStack(),
    topDebt: topTechnicalDebt(),
    topModernization: topModernizationOpportunities(),
    cloudSummary: cloudReadinessSummary(),
    aiSummary: aiReadinessSummary(),
    risks: applicationRisks(),
    dependencies: dependencyGraph(),
    lifecycleDist: lifecycleDistribution(),
    rationalization: rationalizationCandidates(),
    inventory: inventorySample(),
    aiInsights: generateApmAiInsights(),
    hubIntegrations: apmIntegrationLinks(),
  }), []);

  return (
    <ApplicationPortfolioContext.Provider value={value}>
      {children}
    </ApplicationPortfolioContext.Provider>
  );
}

export function useApplicationPortfolio(): ApplicationPortfolioContextValue {
  const ctx = useContext(ApplicationPortfolioContext);
  if (!ctx) throw new Error('useApplicationPortfolio must be used within ApplicationPortfolioProvider');
  return ctx;
}
