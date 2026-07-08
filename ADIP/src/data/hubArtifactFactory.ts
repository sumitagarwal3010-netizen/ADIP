/**
 * Shared hub artifact builders — reduces duplication in hubArtifactDefinitions.
 */
import type { SimulationConfig } from '../hooks/useGenerationSimulation';
import type { Artifact } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';

export const HUB_FEATURE = 'UPI Payments & Mobile Banking';

export function hubSimulation(initial: string, activities: string[]): SimulationConfig {
  const steps = activities.map((activity, i) => ({
    progress: Math.min(100, Math.round(((i + 1) / activities.length) * 100)),
    activity,
    delayMs: 650,
  }));
  return { initialStatus: initial, steps };
}

export interface HubDocArtifactOpts {
  runId: string;
  suffix: string;
  name: string;
  generatedBy: string;
  previewContent: string;
  fileType?: Artifact['fileType'];
  approvalStatus?: Artifact['approvalStatus'];
  riskRating?: Artifact['riskRating'];
  executiveSummary?: string;
  contextSubject?: string;
}

/** Standard docx artifact used across many hub builders. */
export function createHubDocArtifact(opts: HubDocArtifactOpts): Artifact {
  return createArtifact({
    id: `${opts.runId}-${opts.suffix}`,
    name: opts.name,
    generatedBy: opts.generatedBy,
    fileType: opts.fileType ?? 'docx',
    approvalStatus: opts.approvalStatus,
    riskRating: opts.riskRating,
    previewContent: opts.previewContent,
    executiveSummary: opts.executiveSummary,
    context: { feature: HUB_FEATURE, subject: opts.contextSubject ?? opts.name },
  });
}
