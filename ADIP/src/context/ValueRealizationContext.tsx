import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RoiInputs, RoiOutputs, ValueRealizationKpis } from '../types/valueRealization';
import {
  aiAdoptionMetrics,
  auditEfficiencyMetrics,
  benchmarkGapAnalysis,
  calculateRoi,
  computeValueRealizationKpis,
  deliveryAccelerationMetrics,
  getBusinessCase,
  governanceEfficiencyMetrics,
  overallMaturityScore,
  qualityImprovementMetrics,
  valueByPortfolio,
} from '../data/valueRealizationEngine';
import {
  BENCHMARK_METRICS,
  BUSINESS_UNITS,
  MATURITY_SCORES,
  PORTFOLIOS,
  PRODUCTIVITY_GAINS,
  PROGRAMS,
  VALUE_PROJECTS,
  VALUE_REALIZATION_EXEC_SUMMARY,
  VALUE_TREND_HISTORY,
  VALUE_TRACEABILITY_CHAINS,
} from '../data/valueRealizationMock';

const DEFAULT_ROI_INPUTS: RoiInputs = {
  projectsPerYear: 120,
  developers: 450,
  testers: 180,
  architects: 45,
  auditors: 25,
  complianceStaff: 35,
  applications: 50,
};

interface ValueRealizationContextValue {
  kpis: ValueRealizationKpis;
  execSummary: string;
  businessUnits: typeof BUSINESS_UNITS;
  portfolios: typeof PORTFOLIOS;
  programs: typeof PROGRAMS;
  projects: typeof VALUE_PROJECTS;
  trendHistory: typeof VALUE_TREND_HISTORY;
  productivityGains: typeof PRODUCTIVITY_GAINS;
  maturityScores: typeof MATURITY_SCORES;
  benchmarkMetrics: typeof BENCHMARK_METRICS;
  traceabilityChains: typeof VALUE_TRACEABILITY_CHAINS;
  deliveryMetrics: ReturnType<typeof deliveryAccelerationMetrics>;
  qualityMetrics: ReturnType<typeof qualityImprovementMetrics>;
  governanceMetrics: ReturnType<typeof governanceEfficiencyMetrics>;
  auditMetrics: ReturnType<typeof auditEfficiencyMetrics>;
  aiMetrics: ReturnType<typeof aiAdoptionMetrics>;
  benchmarkGaps: ReturnType<typeof benchmarkGapAnalysis>;
  portfolioValues: ReturnType<typeof valueByPortfolio>;
  businessCase: ReturnType<typeof getBusinessCase>;
  overallMaturity: number;
  roiInputs: RoiInputs;
  setRoiInputs: (inputs: RoiInputs) => void;
  roiOutputs: RoiOutputs;
}

const ValueRealizationContext = createContext<ValueRealizationContextValue | null>(null);

export function ValueRealizationProvider({ children }: { children: ReactNode }) {
  const [roiInputs, setRoiInputs] = useState<RoiInputs>(DEFAULT_ROI_INPUTS);
  const kpis = useMemo(() => computeValueRealizationKpis(), []);
  const roiOutputs = useMemo(() => calculateRoi(roiInputs), [roiInputs]);

  const value = useMemo<ValueRealizationContextValue>(() => ({
    kpis,
    execSummary: VALUE_REALIZATION_EXEC_SUMMARY,
    businessUnits: BUSINESS_UNITS,
    portfolios: PORTFOLIOS,
    programs: PROGRAMS,
    projects: VALUE_PROJECTS,
    trendHistory: VALUE_TREND_HISTORY,
    productivityGains: PRODUCTIVITY_GAINS,
    maturityScores: MATURITY_SCORES,
    benchmarkMetrics: BENCHMARK_METRICS,
    traceabilityChains: VALUE_TRACEABILITY_CHAINS,
    deliveryMetrics: deliveryAccelerationMetrics(),
    qualityMetrics: qualityImprovementMetrics(),
    governanceMetrics: governanceEfficiencyMetrics(),
    auditMetrics: auditEfficiencyMetrics(),
    aiMetrics: aiAdoptionMetrics(),
    benchmarkGaps: benchmarkGapAnalysis(),
    portfolioValues: valueByPortfolio(),
    businessCase: getBusinessCase(),
    overallMaturity: overallMaturityScore(),
    roiInputs,
    setRoiInputs,
    roiOutputs,
  }), [kpis, roiInputs, roiOutputs]);

  return (
    <ValueRealizationContext.Provider value={value}>
      {children}
    </ValueRealizationContext.Provider>
  );
}

export function useValueRealization(): ValueRealizationContextValue {
  const ctx = useContext(ValueRealizationContext);
  if (!ctx) throw new Error('useValueRealization must be used within ValueRealizationProvider');
  return ctx;
}

export { ValueRealizationContext };
