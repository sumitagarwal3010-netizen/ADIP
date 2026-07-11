import type {
  ApprovalStatus,
  Artifact,
  ArtifactFileType,
  ArtifactSection,
  GenerationHistoryEntry,
} from '../types/artifacts';

export function createRunId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  return `${prefix}-${ts}`;
}

export function formatTimestamp(): string {
  return new Date().toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export interface ArtifactContext {
  source?: string;
  normalizedRequirement?: unknown;
  sessionKey?: string;
  feature?: string;
  domain?: string;
  subject?: string;
}

export interface CreateArtifactInput {
  id: string;
  name: string;
  generatedBy: string;
  modelUsed?: string;
  version?: string;
  approvalStatus?: ApprovalStatus;
  fileType: ArtifactFileType;
  previewContent: string;
  executiveSummary?: string;
  riskRating?: string;
  sections?: ArtifactSection[];
  changeSummary?: string;
  context?: ArtifactContext;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildSections(
  executiveSummary: string,
  findings: string[],
  recommendations: string[],
  approvalNote?: string,
  extraSections?: ArtifactSection[],
): ArtifactSection[] {
  const sections: ArtifactSection[] = [
    { title: 'Executive Summary', content: executiveSummary },
    { title: 'Key Findings', content: findings.map((f) => `• ${f}`).join('\n') },
    { title: 'Recommendations', content: recommendations.map((r) => `• ${r}`).join('\n') },
  ];
  if (approvalNote) {
    sections.push({ title: 'Approval & Sign-off', content: approvalNote });
  }
  if (extraSections) sections.push(...extraSections);
  return sections;
}

export function createArtifact(input: CreateArtifactInput): Artifact {
  const date = today();
  const timestamp = formatTimestamp();
  const history: GenerationHistoryEntry[] = [
    {
      version: input.version ?? '1.0',
      generatedDate: date,
      generatedBy: input.generatedBy,
      modelUsed: input.modelUsed ?? 'Gemini',
      changeSummary: input.changeSummary ?? `AI-generated ${input.name}`,
    },
  ];

  const executiveSummary =
    input.executiveSummary ??
    `AI analysis for ${input.context?.feature ?? input.context?.subject ?? 'banking initiative'} completed with ${input.riskRating ?? 'Medium'} residual risk.`;

  const sections =
    input.sections ??
    buildSections(
      executiveSummary,
      [
        'Regulatory alignment validated against RBI retail payment guidelines.',
        'Cross-channel impact assessed for UPI, Mobile Banking, and Net Banking.',
        'Operational readiness and control coverage reviewed.',
      ],
      [
        'Proceed with stakeholder review and formal approval workflow.',
        'Address open gaps before production or audit sign-off.',
        'Schedule follow-up assessment within 30 days.',
      ],
      `Status: ${input.approvalStatus ?? 'Pending Review'}\nReviewer: Enterprise AI Governance\nTimestamp: ${timestamp}`,
    );

  return {
    id: input.id,
    name: input.name,
    generatedBy: input.generatedBy,
    modelUsed: input.modelUsed ?? 'Gemini',
    version: input.version ?? '1.0',
    generatedDate: date,
    timestamp,
    approvalStatus: input.approvalStatus ?? 'Pending Review',
    fileType: input.fileType,
    previewContent: input.previewContent,
    executiveSummary,
    riskRating: input.riskRating ?? 'Medium',
    sections,
    generationHistory: history,
  };
}

export function enrichArtifacts(artifacts: Artifact[], context: ArtifactContext): Artifact[] {
  return artifacts.map((artifact) => ({
    ...artifact,
    timestamp: artifact.timestamp ?? formatTimestamp(),
    executiveSummary:
      artifact.executiveSummary ??
      `AI-generated deliverable for ${context.feature ?? context.subject ?? 'banking program'}.`,
    riskRating: artifact.riskRating ?? 'Medium',
    sections:
      artifact.sections ??
      buildSections(
        artifact.executiveSummary ?? `Deliverable: ${artifact.name}`,
        ['Content validated against enterprise banking standards.', 'Compliance checkpoints embedded in workflow.'],
        ['Review artifact in governance workflow.', 'Archive approved version in evidence repository.'],
        `Status: ${artifact.approvalStatus}\nGenerated: ${artifact.timestamp ?? formatTimestamp()}`,
      ),
  }));
}
