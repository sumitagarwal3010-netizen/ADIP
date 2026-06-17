import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { GenerationSimulationPanel } from './GenerationSimulationPanel';
import { GenerationRunHistoryPanel } from './GenerationRunHistoryPanel';
import { ArtifactRepositoryPanel } from './ArtifactRepositoryPanel';
import { useGenerationSimulation } from '../../hooks/useGenerationSimulation';
import {
  buildHubArtifacts,
  getDemoArtifacts,
  HUB_ARTIFACT_CONFIGS,
  type HubKey,
} from '../../data/hubArtifactDefinitions';
import { createRunId, formatTimestamp } from '../../data/requirementArtifactFactory';
import type { Artifact, GenerationRun } from '../../types/artifacts';
import { colors } from '../../theme/colors';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';

interface HubArtifactGeneratorProps {
  hubKey: HubKey;
}

const HUB_LABELS: Partial<Record<HubKey, string>> = {
  production: 'Production Operations',
  incidents: 'Incident Operations',
  availability: 'Availability Operations',
  capacity: 'Capacity Operations',
  audit: 'Audit Center',
  compliance: 'Compliance',
  risk: 'Enterprise Risk',
  evidence: 'Evidence Repository',
  'ai-use-case': 'AI Governance · Use Cases',
  'ai-model-inventory': 'AI Governance · Models',
  'ai-prompt': 'AI Governance · Prompts',
  'ai-risk': 'AI Governance · Risks',
  'ai-controls': 'AI Governance · Controls',
  'ai-incidents': 'AI Governance · Incidents',
  learning: 'Knowledge Center',
  'best-practices': 'Knowledge · Best Practices',
  'reusable-assets': 'Knowledge · Reusable Assets',
  'lessons-learned': 'Knowledge · Lessons Learned',
  executive: 'Executive Control Tower',
  traceability: 'Traceability Center',
  'approval-workflow': 'Approval Workflow',
  rbac: 'RBAC Administration',
  authentication: 'Authentication Health',
  'workflow-orchestration': 'Workflow Orchestration',
  'audit-center': 'Audit Center',
  'notification-center': 'Notification Center',
  persistence: 'Persistence Administration',
  'activity-center': 'Activity Center',
  abac: 'ABAC Administration',
  'ai-copilot': 'AI SDLC Copilot',
  'production-intelligence': 'Production Intelligence',
  'knowledge-center': 'Knowledge Learning Center',
  'value-realization': 'Value Realization',
  'portfolio-governance': 'Portfolio Governance',
  'application-portfolio': 'Application Portfolio',
  'architecture-repository': 'Enterprise Architecture',
  'technology-strategy': 'Technology Strategy',
  'transformation-pmo': 'Transformation PMO',
  'enterprise-risk': 'Enterprise Risk Management',
};

function tagWithSource(artifacts: Artifact[], hubKey: HubKey): Artifact[] {
  const sourceLabel = HUB_LABELS[hubKey] ?? hubKey;
  return artifacts.map((a) => ({
    ...a,
    sourceHub: hubKey,
    sourceLabel,
  }));
}

export function HubArtifactGenerator({ hubKey }: HubArtifactGeneratorProps) {
  const config = HUB_ARTIFACT_CONFIGS[hubKey];
  const [artifacts, setArtifacts] = useState<Artifact[]>(() => tagWithSource(getDemoArtifacts(hubKey), hubKey));
  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const { recordArtifacts } = useArtifactsRegistry();

  const { isRunning, progress, statusMessage, activityLog, run, reset } =
    useGenerationSimulation(config.simulation);

  // Seed the global registry on first mount with the demo artifacts so the
  // Universal Artifacts Repository is never empty for an executive demo.
  useEffect(() => {
    recordArtifacts(artifacts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    const runId = createRunId(hubKey.toUpperCase().slice(0, 4));
    const timestamp = formatTimestamp();

    setShowSimulation(true);
    setRuns((prev) => [
      { runId, timestamp, generatedBy: config.generatedBy, status: 'In Progress' },
      ...prev,
    ]);

    run(() => {
      const generated = tagWithSource(buildHubArtifacts(hubKey, runId), hubKey);
      setArtifacts(generated);
      recordArtifacts(generated);
      setRuns((prev) =>
        prev.map((r) => (r.runId === runId ? { ...r, status: 'Completed' } : r)),
      );
    });
  };

  const handleClear = () => {
    reset();
    setShowSimulation(false);
  };

  return (
    <Box>
      <GlassCard sx={{ p: 2, mt: 1.5 }} glow={config.glow ?? 'blue'}>
        <ModuleHeader title={config.title} subtitle={config.subtitle} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            disabled={isRunning}
            onClick={handleGenerate}
            sx={{ minWidth: 180, bgcolor: config.glow === 'purple' ? colors.secondary : colors.primary }}
          >
            {config.generateLabel}
          </Button>
          <Button variant="outlined" disabled={isRunning} onClick={handleClear}>
            Clear Progress
          </Button>
        </Box>
      </GlassCard>

      <GenerationSimulationPanel
        visible={showSimulation}
        statusMessage={statusMessage}
        progress={progress}
        activityLog={activityLog}
        agentLabel={config.generatedBy}
      />

      <GenerationRunHistoryPanel runs={runs} />

      <ArtifactRepositoryPanel
        artifacts={artifacts}
        title="Generated Artifacts"
        subtitle={`AI-generated deliverables · ${config.generatedBy}`}
      />
    </Box>
  );
}
