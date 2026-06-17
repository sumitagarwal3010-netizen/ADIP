export type ApprovalStatus = 'Approved' | 'Pending Review' | 'Draft' | 'Rejected';

export type ArtifactFileType = 'docx' | 'xlsx' | 'yaml' | 'png';

export interface ArtifactSection {
  title: string;
  content: string;
  riskRating?: string;
}

export interface GenerationHistoryEntry {
  version: string;
  generatedDate: string;
  generatedBy: string;
  modelUsed: string;
  changeSummary: string;
}

export interface Artifact {
  id: string;
  name: string;
  generatedBy: string;
  modelUsed: string;
  version: string;
  generatedDate: string;
  timestamp?: string;
  approvalStatus: ApprovalStatus;
  fileType: ArtifactFileType;
  previewContent: string;
  executiveSummary?: string;
  riskRating?: string;
  sections?: ArtifactSection[];
  generationHistory: GenerationHistoryEntry[];
  /** Source hub/center that generated the artifact (e.g. "ai-copilot", "portfolio-governance"). */
  sourceHub?: string;
  /** Human-readable label for the source (e.g. "Requirements Copilot", "Portfolio Governance"). */
  sourceLabel?: string;
}

export type GenerationRunStatus = 'Completed' | 'In Progress' | 'Failed';

export interface GenerationRun {
  runId: string;
  timestamp: string;
  generatedBy: string;
  status: GenerationRunStatus;
}
