import { colors } from '../../theme/colors';
import type { TraceNodeType, TraceStatus } from '../../data/traceabilityModel';

/** Accent color per SDLC stage (reuses the existing chart palette). */
export const traceTypeColor: Record<TraceNodeType, string> = {
  businessRequirement: colors.chart.blue,
  functionalRequirement: colors.chart.blue,
  userStory: colors.info,
  aiUseCase: colors.secondary,
  prompt: colors.secondary,
  model: colors.secondary,
  architecture: colors.chart.cyan,
  api: colors.chart.cyan,
  testCase: colors.warning,
  release: colors.chart.green,
  production: colors.success,
  incident: colors.critical,
  risk: colors.critical,
  control: colors.chart.pink,
  evidence: colors.info,
  compliance: colors.success,
};

export function traceStatusColor(status: TraceStatus): string {
  switch (status) {
    case 'Approved':
    case 'Passed':
    case 'Deployed':
    case 'Resolved':
    case 'Mitigated':
    case 'Compliant':
      return colors.success;
    case 'In Progress':
    case 'Pending Review':
      return colors.warning;
    case 'Failed':
    case 'Open':
    case 'At Risk':
    case 'Gap':
      return colors.critical;
    default:
      return colors.text.muted;
  }
}
