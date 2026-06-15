import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { EnterpriseRiskKpis, RiskAiInsight } from '../types/enterpriseRisk';
import {
  aiRiskByCategory,
  appetiteChart,
  assuranceByLine,
  assuranceReviews,
  computeEnterpriseRiskKpis,
  controlEffectivenessDistribution,
  criticalOpenRisks,
  cyberRiskByThreat,
  findingsBySource,
  generateRiskAiInsights,
  ineffectiveControls,
  openAuditFindings,
  regulatoryExposureByRegulator,
  riskIntegrationLinks,
  risksByBusinessUnit,
  risksByCategory,
  risksBySeverity,
  technologyRiskByCategory,
  topAiRisks,
  topCyberRisks,
  topEnterpriseRisks,
  topRegulatoryRisks,
  topTechnologyRisks,
} from '../data/enterpriseRiskEngine';
import {
  ENTERPRISE_RISK_EXEC_SUMMARY,
  ERM_AI_RISKS,
  ERM_ASSURANCE_REVIEWS,
  ERM_AUDIT_FINDINGS,
  ERM_CONTROLS,
  ERM_CYBER_RISKS,
  ERM_ENTERPRISE_RISKS,
  ERM_EXCEPTIONS,
  ERM_HISTORY,
  ERM_REGULATORY_RISKS,
  ERM_RISK_APPETITE,
  ERM_TECHNOLOGY_RISKS,
  ERM_TRACEABILITY_CHAINS,
} from '../data/enterpriseRiskMock';

interface EnterpriseRiskContextValue {
  kpis: EnterpriseRiskKpis;
  execSummary: string;
  enterpriseRisks: typeof ERM_ENTERPRISE_RISKS;
  technologyRisks: typeof ERM_TECHNOLOGY_RISKS;
  cyberRisks: typeof ERM_CYBER_RISKS;
  aiRisks: typeof ERM_AI_RISKS;
  regulatoryRisks: typeof ERM_REGULATORY_RISKS;
  controls: typeof ERM_CONTROLS;
  auditFindings: typeof ERM_AUDIT_FINDINGS;
  exceptions: typeof ERM_EXCEPTIONS;
  assuranceReviewsAll: typeof ERM_ASSURANCE_REVIEWS;
  riskAppetite: typeof ERM_RISK_APPETITE;
  history: typeof ERM_HISTORY;
  traceabilityChains: typeof ERM_TRACEABILITY_CHAINS;
  byCategory: ReturnType<typeof risksByCategory>;
  bySeverity: ReturnType<typeof risksBySeverity>;
  byBusinessUnit: ReturnType<typeof risksByBusinessUnit>;
  topRisks: ReturnType<typeof topEnterpriseRisks>;
  criticalRisks: ReturnType<typeof criticalOpenRisks>;
  topTechRisks: ReturnType<typeof topTechnologyRisks>;
  techByCategory: ReturnType<typeof technologyRiskByCategory>;
  topCyber: ReturnType<typeof topCyberRisks>;
  cyberByThreat: ReturnType<typeof cyberRiskByThreat>;
  topAi: ReturnType<typeof topAiRisks>;
  aiByCategory: ReturnType<typeof aiRiskByCategory>;
  topRegulatory: ReturnType<typeof topRegulatoryRisks>;
  regByRegulator: ReturnType<typeof regulatoryExposureByRegulator>;
  openFindings: ReturnType<typeof openAuditFindings>;
  findingsSrc: ReturnType<typeof findingsBySource>;
  controlDist: ReturnType<typeof controlEffectivenessDistribution>;
  weakControls: ReturnType<typeof ineffectiveControls>;
  appetite: ReturnType<typeof appetiteChart>;
  assuranceLines: ReturnType<typeof assuranceByLine>;
  assuranceList: ReturnType<typeof assuranceReviews>;
  aiInsights: RiskAiInsight[];
  hubIntegrations: ReturnType<typeof riskIntegrationLinks>;
}

const EnterpriseRiskContext = createContext<EnterpriseRiskContextValue | null>(null);

export function EnterpriseRiskProvider({ children }: { children: ReactNode }) {
  const value = useMemo<EnterpriseRiskContextValue>(() => ({
    kpis: computeEnterpriseRiskKpis(),
    execSummary: ENTERPRISE_RISK_EXEC_SUMMARY,
    enterpriseRisks: ERM_ENTERPRISE_RISKS,
    technologyRisks: ERM_TECHNOLOGY_RISKS,
    cyberRisks: ERM_CYBER_RISKS,
    aiRisks: ERM_AI_RISKS,
    regulatoryRisks: ERM_REGULATORY_RISKS,
    controls: ERM_CONTROLS,
    auditFindings: ERM_AUDIT_FINDINGS,
    exceptions: ERM_EXCEPTIONS,
    assuranceReviewsAll: ERM_ASSURANCE_REVIEWS,
    riskAppetite: ERM_RISK_APPETITE,
    history: ERM_HISTORY,
    traceabilityChains: ERM_TRACEABILITY_CHAINS,
    byCategory: risksByCategory(),
    bySeverity: risksBySeverity(),
    byBusinessUnit: risksByBusinessUnit(),
    topRisks: topEnterpriseRisks(),
    criticalRisks: criticalOpenRisks(),
    topTechRisks: topTechnologyRisks(),
    techByCategory: technologyRiskByCategory(),
    topCyber: topCyberRisks(),
    cyberByThreat: cyberRiskByThreat(),
    topAi: topAiRisks(),
    aiByCategory: aiRiskByCategory(),
    topRegulatory: topRegulatoryRisks(),
    regByRegulator: regulatoryExposureByRegulator(),
    openFindings: openAuditFindings(),
    findingsSrc: findingsBySource(),
    controlDist: controlEffectivenessDistribution(),
    weakControls: ineffectiveControls(),
    appetite: appetiteChart(),
    assuranceLines: assuranceByLine(),
    assuranceList: assuranceReviews(),
    aiInsights: generateRiskAiInsights(),
    hubIntegrations: riskIntegrationLinks(),
  }), []);

  return (
    <EnterpriseRiskContext.Provider value={value}>
      {children}
    </EnterpriseRiskContext.Provider>
  );
}

export function useEnterpriseRisk(): EnterpriseRiskContextValue {
  const ctx = useContext(EnterpriseRiskContext);
  if (!ctx) throw new Error('useEnterpriseRisk must be used within EnterpriseRiskProvider');
  return ctx;
}
