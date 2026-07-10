import { useState } from 'react';
import { Box, Button, Collapse, FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { IntakeTextField } from '../workflow/IntakeTextField';
import { IntakeSelectField } from '../workflow/IntakeSelectField';
import { GenerationSimulationPanel } from '../workflow/GenerationSimulationPanel';
import { ArtifactViewerPanel } from '../workflow/ArtifactViewerPanel';
import { useGenerationSimulation } from '../../hooks/useGenerationSimulation';
import type { SimulationConfig } from '../../hooks/useGenerationSimulation';
import {
  buildRequirementArtifacts,
  createRunId,
  formatTimestamp,
  getDemoRequirementArtifacts,
  type RequirementIntake,
} from '../../data/requirementArtifactFactory';
import type { Artifact, GenerationRun } from '../../types/artifacts';
import { DOMAINS } from '../../services/mockDataEngine.js';
import { colors } from '../../theme/colors';

const EMPTY_INTAKE: RequirementIntake = {
  domain: '',
  featureName: '',
  businessObjective: '',
  requirementDescription: '',
  complianceNotes: '',
};

const REQUIREMENT_SIMULATION: SimulationConfig = {
  initialStatus: 'Requirement Agent reading business input...',
  steps: [
    { progress: 25, activity: 'Requirement Analysis', delayMs: 700 },
    { progress: 50, activity: 'BRD Generation', delayMs: 700 },
    { progress: 75, activity: 'FRD Generation', delayMs: 700 },
    { progress: 75, activity: 'User Story Generation', delayMs: 500 },
    { progress: 100, activity: 'Acceptance Criteria Generation', delayMs: 700 },
  ],
};

const domainOptions = DOMAINS.filter((d) => d.id !== 'all').map((d) => ({
  value: d.label,
  label: d.label,
}));

export function RequirementIntakeWorkflow() {
  const [intake, setIntake] = useState<RequirementIntake>(EMPTY_INTAKE);
  const [artifacts, setArtifacts] = useState<Artifact[]>(() => getDemoRequirementArtifacts());
  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  const { isRunning, progress, statusMessage, activityLog, run, reset } =
    useGenerationSimulation(REQUIREMENT_SIMULATION);

  const updateField = (field: keyof RequirementIntake, value: string) => {
    setIntake((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    const runId = createRunId('REQ');
    const timestamp = formatTimestamp();

    setShowSimulation(true);
    setRuns((prev) => [
      { runId, timestamp, generatedBy: 'Requirement AI', status: 'In Progress' },
      ...prev,
    ]);

    run(() => {
      setArtifacts(buildRequirementArtifacts(intake, runId));
      setRuns((prev) =>
        prev.map((r) => (r.runId === runId ? { ...r, status: 'Completed' } : r)),
      );
    });
  };

  const handleClear = () => {
    setIntake(EMPTY_INTAKE);
    reset();
    setShowSimulation(false);
  };

  return (
    <Box>
      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
        <ModuleHeader title="Requirement Intake" subtitle="Capture business input for AI artifact generation" />
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <IntakeSelectField
              label="Domain"
              options={domainOptions}
              value={intake.domain}
              onChange={(e) => updateField('domain', e.target.value as string)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <IntakeTextField
              label="Feature Name"
              value={intake.featureName}
              onChange={(e) => updateField('featureName', e.target.value)}
              placeholder="e.g. UPI Limit Enhancement"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <IntakeTextField
              label="Business Objective"
              value={intake.businessObjective}
              onChange={(e) => updateField('businessObjective', e.target.value)}
              multiline
              rows={2}
              placeholder="Describe the business goal and expected outcome"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <IntakeTextField
              label="Requirement Description"
              value={intake.requirementDescription}
              onChange={(e) => updateField('requirementDescription', e.target.value)}
              multiline
              rows={3}
              placeholder="Detailed functional and non-functional requirements"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <IntakeTextField
              label="Compliance Notes"
              value={intake.complianceNotes}
              onChange={(e) => updateField('complianceNotes', e.target.value)}
              multiline
              rows={2}
              placeholder="RBI, PCI-DSS, or internal policy constraints"
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            disabled={isRunning}
            onClick={handleGenerate}
            sx={{ minWidth: 160, bgcolor: colors.secondary }}
          >
            Generate Artifacts
          </Button>
          <Button variant="outlined" disabled={isRunning} onClick={handleClear}>
            Clear
          </Button>
        </Box>
      </GlassCard>

      <GlassCard sx={{ p: 1.5, mt: 1.25 }} hover={false}>
        <ModuleHeader title="AI Delivery Snapshot" subtitle="Requirement assessment summary" />
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Completeness</Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>87%</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">Compliance</Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>UPI/NPCI, RBI Digital Lending</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="caption" color="text.secondary">Risk</Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Medium</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Next step</Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Generate BRD + acceptance criteria</Typography>
          </Grid>
        </Grid>
        <FormControlLabel
          sx={{ mt: 0.75 }}
          control={<Switch size="small" checked={showAssessment} onChange={(e) => setShowAssessment(e.target.checked)} />}
          label={<Typography variant="caption" sx={{ fontWeight: 600 }}>View AI assessment</Typography>}
        />
        <Collapse in={showAssessment} timeout="auto" unmountOnExit>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ display: 'block' }}>Score: <strong>87%</strong></Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>Gaps: <strong>3</strong></Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Suggested action: Generate BRD + acceptance criteria, then resolve compliance mapping gaps.
            </Typography>
          </Box>
        </Collapse>
      </GlassCard>

      <GenerationSimulationPanel
        visible={showSimulation}
        statusMessage={statusMessage}
        progress={progress}
        activityLog={activityLog}
        agentLabel="Requirement Agent"
      />

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader
          title="Generated Artifact Pack"
          subtitle="AI-generated requirement deliverables"
        />
        {artifacts.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, textAlign: 'center' }}>
            No artifacts generated yet. Complete the intake form and click Generate Artifacts.
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 2,
                py: 0.5,
                borderBottom: `1px solid ${colors.border.subtle}`,
                mb: 0.5,
              }}
            >
              {['Artifact', 'Status', 'Model', ''].map((col) => (
                <Typography
                  key={col || 'action'}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    minWidth: col === 'Artifact' ? 220 : col === 'Status' ? 110 : col === 'Model' ? 100 : 100,
                    ml: col === '' ? 'auto' : undefined,
                  }}
                >
                  {col}
                </Typography>
              ))}
            </Box>
            {artifacts.map((artifact) => (
              <Box
                key={artifact.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="caption" sx={{ minWidth: 220, fontWeight: 700 }}>{artifact.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>{artifact.approvalStatus}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{artifact.modelUsed}</Typography>
                <Button
                  size="small"
                  sx={{ ml: 'auto', fontSize: '0.7rem', minWidth: 100 }}
                  onClick={() => setSelectedArtifact(artifact)}
                >
                  View Artifact
                </Button>
              </Box>
            ))}
          </>
        )}
      </GlassCard>

      <ArtifactViewerPanel
        artifact={selectedArtifact}
        open={selectedArtifact !== null}
        onClose={() => setSelectedArtifact(null)}
      />
    </Box>
  );
}
