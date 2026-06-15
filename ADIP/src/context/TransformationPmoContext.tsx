import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TransformationAiInsight, TransformationPmoKpis } from '../types/transformationPmo';
import {
  atRiskPrograms,
  benefitsByCategory,
  businessUnitPerformanceChart,
  commitmentsAtRisk,
  commitmentsByStatus,
  computeTransformationPmoKpis,
  generateTransformationAiInsights,
  milestonesByStatus,
  objectivesSummary,
  programsByBusinessUnit,
  programsByStatus,
  riskyDependencies,
  topBenefits,
  topInitiatives,
  topPrograms,
  topTransformationRisks,
  transformationIntegrationLinks,
  upcomingCriticalMilestones,
} from '../data/transformationPmoEngine';
import {
  TPMO_BENEFITS,
  TPMO_BUSINESS_UNITS,
  TPMO_COMMITMENTS,
  TPMO_DEPENDENCIES,
  TPMO_HISTORY,
  TPMO_INITIATIVES,
  TPMO_MILESTONES,
  TPMO_OBJECTIVES,
  TPMO_PROGRAMS,
  TPMO_RISKS,
  TPMO_TRACEABILITY_CHAINS,
  TRANSFORMATION_PMO_EXEC_SUMMARY,
} from '../data/transformationPmoMock';

interface TransformationPmoContextValue {
  kpis: TransformationPmoKpis;
  execSummary: string;
  programs: typeof TPMO_PROGRAMS;
  initiatives: typeof TPMO_INITIATIVES;
  milestones: typeof TPMO_MILESTONES;
  commitments: typeof TPMO_COMMITMENTS;
  benefits: typeof TPMO_BENEFITS;
  dependencies: typeof TPMO_DEPENDENCIES;
  risks: typeof TPMO_RISKS;
  objectives: typeof TPMO_OBJECTIVES;
  businessUnits: typeof TPMO_BUSINESS_UNITS;
  history: typeof TPMO_HISTORY;
  traceabilityChains: typeof TPMO_TRACEABILITY_CHAINS;
  progByStatus: ReturnType<typeof programsByStatus>;
  progByUnit: ReturnType<typeof programsByBusinessUnit>;
  topProgs: ReturnType<typeof topPrograms>;
  atRiskProgs: ReturnType<typeof atRiskPrograms>;
  topInits: ReturnType<typeof topInitiatives>;
  objSummary: ReturnType<typeof objectivesSummary>;
  msByStatus: ReturnType<typeof milestonesByStatus>;
  criticalMilestones: ReturnType<typeof upcomingCriticalMilestones>;
  benByCategory: ReturnType<typeof benefitsByCategory>;
  topBens: ReturnType<typeof topBenefits>;
  commitsAtRisk: ReturnType<typeof commitmentsAtRisk>;
  commitByStatus: ReturnType<typeof commitmentsByStatus>;
  riskyDeps: ReturnType<typeof riskyDependencies>;
  topRisks: ReturnType<typeof topTransformationRisks>;
  buChart: ReturnType<typeof businessUnitPerformanceChart>;
  aiInsights: TransformationAiInsight[];
  hubIntegrations: ReturnType<typeof transformationIntegrationLinks>;
}

const TransformationPmoContext = createContext<TransformationPmoContextValue | null>(null);

export function TransformationPmoProvider({ children }: { children: ReactNode }) {
  const value = useMemo<TransformationPmoContextValue>(() => ({
    kpis: computeTransformationPmoKpis(),
    execSummary: TRANSFORMATION_PMO_EXEC_SUMMARY,
    programs: TPMO_PROGRAMS,
    initiatives: TPMO_INITIATIVES,
    milestones: TPMO_MILESTONES,
    commitments: TPMO_COMMITMENTS,
    benefits: TPMO_BENEFITS,
    dependencies: TPMO_DEPENDENCIES,
    risks: TPMO_RISKS,
    objectives: TPMO_OBJECTIVES,
    businessUnits: TPMO_BUSINESS_UNITS,
    history: TPMO_HISTORY,
    traceabilityChains: TPMO_TRACEABILITY_CHAINS,
    progByStatus: programsByStatus(),
    progByUnit: programsByBusinessUnit(),
    topProgs: topPrograms(),
    atRiskProgs: atRiskPrograms(),
    topInits: topInitiatives(),
    objSummary: objectivesSummary(),
    msByStatus: milestonesByStatus(),
    criticalMilestones: upcomingCriticalMilestones(),
    benByCategory: benefitsByCategory(),
    topBens: topBenefits(),
    commitsAtRisk: commitmentsAtRisk(),
    commitByStatus: commitmentsByStatus(),
    riskyDeps: riskyDependencies(),
    topRisks: topTransformationRisks(),
    buChart: businessUnitPerformanceChart(),
    aiInsights: generateTransformationAiInsights(),
    hubIntegrations: transformationIntegrationLinks(),
  }), []);

  return (
    <TransformationPmoContext.Provider value={value}>
      {children}
    </TransformationPmoContext.Provider>
  );
}

export function useTransformationPmo(): TransformationPmoContextValue {
  const ctx = useContext(TransformationPmoContext);
  if (!ctx) throw new Error('useTransformationPmo must be used within TransformationPmoProvider');
  return ctx;
}
