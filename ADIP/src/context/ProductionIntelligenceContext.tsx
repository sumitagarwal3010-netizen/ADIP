import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductionIntelligenceKpis } from '../types/productionIntelligence';
import {
  bestReleases,
  computeProductionIntelligenceKpis,
  feedbackByDomain,
  getApplicationById,
  getIncidentsForApplication,
  incidentTrend7d,
  leakageByStage,
  leakageTrend,
  mostImpactedApplications,
  rcaPatternChart,
  sentimentTrend,
  topLeakageApplications,
  topPainPoints,
  topRecurringCauses,
  predictedFutureRisks,
  worstReleases,
} from '../data/productionIntelligenceEngine';
import {
  CUSTOMER_SIGNALS,
  FEEDBACK_RECOMMENDATIONS,
  PRODUCTION_APPLICATIONS,
  PRODUCTION_DEFECTS,
  PRODUCTION_INCIDENTS,
  PRODUCTION_INTEL_EXEC_SUMMARY,
  RCA_RECORDS,
  RELEASE_EVENTS,
  TRACEABILITY_CHAINS,
} from '../data/productionIntelligenceMock';

interface ProductionIntelligenceContextValue {
  kpis: ProductionIntelligenceKpis;
  execSummary: string;
  applications: typeof PRODUCTION_APPLICATIONS;
  incidents: typeof PRODUCTION_INCIDENTS;
  defects: typeof PRODUCTION_DEFECTS;
  customerSignals: typeof CUSTOMER_SIGNALS;
  releaseEvents: typeof RELEASE_EVENTS;
  rcaRecords: typeof RCA_RECORDS;
  feedbackRecommendations: typeof FEEDBACK_RECOMMENDATIONS;
  traceabilityChains: typeof TRACEABILITY_CHAINS;
  selectedApplicationId: string;
  setSelectedApplicationId: (id: string) => void;
  selectedApplication: (typeof PRODUCTION_APPLICATIONS)[0];
  applicationIncidents: ReturnType<typeof getIncidentsForApplication>;
  leakageByStage: ReturnType<typeof leakageByStage>;
  leakageTrend: ReturnType<typeof leakageTrend>;
  topLeakageApps: ReturnType<typeof topLeakageApplications>;
  sentimentTrend: ReturnType<typeof sentimentTrend>;
  topPainPoints: ReturnType<typeof topPainPoints>;
  mostImpactedApps: ReturnType<typeof mostImpactedApplications>;
  incidentTrend: ReturnType<typeof incidentTrend7d>;
  rcaPatterns: ReturnType<typeof rcaPatternChart>;
  recurringCauses: ReturnType<typeof topRecurringCauses>;
  futureRisks: ReturnType<typeof predictedFutureRisks>;
  bestReleases: ReturnType<typeof bestReleases>;
  worstReleases: ReturnType<typeof worstReleases>;
  feedbackByDomain: ReturnType<typeof feedbackByDomain>;
}

const ProductionIntelligenceContext = createContext<ProductionIntelligenceContextValue | null>(null);

export function ProductionIntelligenceProvider({ children }: { children: ReactNode }) {
  const [selectedApplicationId, setSelectedApplicationId] = useState(PRODUCTION_APPLICATIONS[0].id);

  const selectedApplication = useMemo(
    () => getApplicationById(selectedApplicationId) ?? PRODUCTION_APPLICATIONS[0],
    [selectedApplicationId],
  );
  const applicationIncidents = useMemo(
    () => getIncidentsForApplication(selectedApplicationId),
    [selectedApplicationId],
  );
  const kpis = useMemo(() => computeProductionIntelligenceKpis(), []);

  const value = useMemo<ProductionIntelligenceContextValue>(() => ({
    kpis,
    execSummary: PRODUCTION_INTEL_EXEC_SUMMARY,
    applications: PRODUCTION_APPLICATIONS,
    incidents: PRODUCTION_INCIDENTS,
    defects: PRODUCTION_DEFECTS,
    customerSignals: CUSTOMER_SIGNALS,
    releaseEvents: RELEASE_EVENTS,
    rcaRecords: RCA_RECORDS,
    feedbackRecommendations: FEEDBACK_RECOMMENDATIONS,
    traceabilityChains: TRACEABILITY_CHAINS,
    selectedApplicationId,
    setSelectedApplicationId,
    selectedApplication,
    applicationIncidents,
    leakageByStage: leakageByStage(),
    leakageTrend: leakageTrend(),
    topLeakageApps: topLeakageApplications(),
    sentimentTrend: sentimentTrend(),
    topPainPoints: topPainPoints(),
    mostImpactedApps: mostImpactedApplications(),
    incidentTrend: incidentTrend7d(),
    rcaPatterns: rcaPatternChart(),
    recurringCauses: topRecurringCauses(),
    futureRisks: predictedFutureRisks(),
    bestReleases: bestReleases(),
    worstReleases: worstReleases(),
    feedbackByDomain: feedbackByDomain(),
  }), [kpis, selectedApplicationId, selectedApplication, applicationIncidents]);

  return (
    <ProductionIntelligenceContext.Provider value={value}>
      {children}
    </ProductionIntelligenceContext.Provider>
  );
}

export function useProductionIntelligence(): ProductionIntelligenceContextValue {
  const ctx = useContext(ProductionIntelligenceContext);
  if (!ctx) throw new Error('useProductionIntelligence must be used within ProductionIntelligenceProvider');
  return ctx;
}

export { ProductionIntelligenceContext };
