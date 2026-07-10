/** Deterministic CIO-level insight produced by Executive / Technology / Investment advisors. */

export type CioAdvisorKind = 'executive' | 'technology' | 'investment';

export interface ExecutiveInsight {
  id: string;
  advisor: CioAdvisorKind;
  prompt: string;
  executiveSummary: string;
  keyRisks: string[];
  businessImpact: string;
  recommendedActions: string[];
  decisionRequired: string;
  financialImpact: string;
  ownerTimeline: string;
  confidenceScore: number;
}

export interface CioAdvisorPromptDef {
  id: string;
  label: string;
}
