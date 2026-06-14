import { useState } from 'react';
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

interface HubArtifactGeneratorProps {
  hubKey: HubKey;
}

export function HubArtifactGenerator({ hubKey }: HubArtifactGeneratorProps) {
  const config = HUB_ARTIFACT_CONFIGS[hubKey];
  const [artifacts, setArtifacts] = useState<Artifact[]>(() => getDemoArtifacts(hubKey));
  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);

  const { isRunning, progress, statusMessage, activityLog, run, reset } =
    useGenerationSimulation(config.simulation);

  const handleGenerate = () => {
    const runId = createRunId(hubKey.toUpperCase().slice(0, 4));
    const timestamp = formatTimestamp();

    setShowSimulation(true);
    setRuns((prev) => [
      { runId, timestamp, generatedBy: config.generatedBy, status: 'In Progress' },
      ...prev,
    ]);

    run(() => {
      setArtifacts(buildHubArtifacts(hubKey, runId));
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
