/**
 * AI Explainability, Traceability & Lineage Framework — Type Surface
 * ----------------------------------------------------------------
 * These types describe the universal AI-context contract used by every
 * AI authoring/generation surface in the platform (AI SDLC Copilots,
 * Governance hubs, Portfolio Advisor, Risk, Compliance, Architecture,
 * Executive Reports, Knowledge, Operations and Transformation).
 *
 * The intent is that every "Generate" surface in ADIP can resolve a
 * profile keyed on either a Copilot `sourceLabel` (e.g. "Requirements
 * Copilot") or a hub key (e.g. "portfolio-governance") and render a
 * consistent five-card explainability strip without per-page code.
 */

export interface AIContextItem {
  label: string;
  value: number | string;
}

export interface AISourceContext {
  /** Headline identifier (e.g. "UPI Limit Enhancement") for the source workspace. */
  subject: string;
  /** Quantified inventory of source records the AI is operating on. */
  items: AIContextItem[];
  /** Source corpus version (e.g. "BRD v1.3"). */
  sourceVersion?: string;
  /** Standards / frameworks the AI is comparing source data against. */
  comparedAgainst?: string[];
}

export interface AIFindingsBreakdown {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface AIAnalysisSummary {
  /** Plain-English list of analyses the AI ran (e.g. "Missing Requirements", "Architecture Violations"). */
  analyzed: string[];
  findings: AIFindingsBreakdown;
}

export interface AIExplainabilityFacts {
  /** Inputs from which the recommendations were generated. */
  generatedFrom: string;
  /** Reference frameworks/standards consulted (TOGAF, NIST, RBI Master Direction, etc). */
  frameworks: string[];
  /** Analytic patterns applied (Completeness, Risk, Architecture Rules, Traceability). */
  patterns: string[];
  /** Confidence of the AI in the produced output (0-100). */
  confidence: number;
}

export interface AITraceabilityLink {
  /** Source record identifier (REQ-001, PRJ-018, C-101). */
  sourceId: string;
  /** What was found about it (Ambiguous Requirement, Funding Gap, Compliance Deviation). */
  finding: string;
  /** What was produced because of the finding (User Story Generated, Funding Memo, Risk Assessment). */
  producedArtifact: string;
}

export interface AIConfidenceBreakdown {
  /** Composite AI confidence (0-100). */
  score: number;
  /** % of recommendations backed by direct source evidence. */
  evidenceCoverage: number;
  /** % of source records with all required fields populated. */
  dataCompleteness: number;
  /** Qualitative reliability label derived from the metrics above. */
  reliability: 'High' | 'Medium' | 'Low';
}

/* ------------------------------------------------------------------ */
/* Raw source data (for the View Source Data drawer)                   */
/* ------------------------------------------------------------------ */

export interface AIInputDataset {
  /** Display category (e.g. "Requirements", "Controls", "Models"). */
  type: string;
  /** Inline records — keep small for demo (8-15 rows is enough). */
  records: Array<{
    id: string;
    title: string;
    meta?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  }>;
}

/* ------------------------------------------------------------------ */
/* Composite Profile + Lineage                                         */
/* ------------------------------------------------------------------ */

export interface AIExplainabilityProfile {
  sourceContext: AISourceContext;
  analysis: AIAnalysisSummary;
  explainability: AIExplainabilityFacts;
  traceability: AITraceabilityLink[];
  confidence: AIConfidenceBreakdown;
  /** Raw dataset(s) shown when "View Source Data" is clicked. */
  rawDatasets: AIInputDataset[];
}

export interface AIArtifactLineageMeta {
  generatedBy: string;
  generatedFrom: string;
  sourceDocuments: string[];
  analysisRun: string;
  generatedOn: string;
  confidence: number;
  evidenceCoverage: number;
}

/**
 * Full AI explainability/traceability lineage attached to a generated artifact
 * (rendered by the "How Generated" modal). Combines the explainability profile
 * with artifact-level lineage metadata.
 */
export interface ArtifactLineage extends AIArtifactLineageMeta {
  profile?: AIExplainabilityProfile;
}

export interface AIExplainabilityResolverInput {
  /** Copilot sourceLabel ("Requirements Copilot") or hub key. Either may be empty. */
  sourceLabel?: string;
  hubKey?: string;
}
