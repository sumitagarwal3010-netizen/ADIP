/**
 * Transformation AI Workspace.
 *
 * Purpose-built AI authoring surface for the Enterprise Transformation Center.
 * Provides the two execution actions the transformation screen was missing:
 *
 *   • Ask AI            → runs Transformation / Benefit / Dependency / ROI /
 *                          Risk analysis grounded in live TransformationPmo KPIs.
 *   • Generate Artifact → produces ONLY transformation deliverables (Charter,
 *                          Business Case, ROI, Benefits, Roadmap, Investment,
 *                          Dependency, Steering Pack, Risk, KPI Matrix) — never
 *                          BRD/FRD (those belong to Requirements Engineering).
 *
 * Reuses the shared primitives — ArtifactRepositoryPanel (Generated Artifacts
 * table), GenerationSimulationPanel, useGenerationSimulation, the artifacts
 * registry and the artifact builder — so it stays consistent with the rest of
 * the platform while keeping the shared AIWorkspacePanel untouched.
 */
import { useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DescriptionIcon from '@mui/icons-material/Description';
import InsightsIcon from '@mui/icons-material/Insights';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { ArtifactRepositoryPanel } from '../workflow/ArtifactRepositoryPanel';
import { GenerationSimulationPanel } from '../workflow/GenerationSimulationPanel';
import { TransformationGovernanceWorkflow } from './TransformationGovernanceWorkflow';
import { useGenerationSimulation } from '../../hooks/useGenerationSimulation';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';
import { useTransformationPmo } from '../../context/TransformationPmoContext';
import { colors } from '../../theme/colors';
import type { Artifact } from '../../types/artifacts';
import {
  buildTransformationAnalysis,
  buildTransformationArtifacts,
  createRunId,
  type TransformationAnalysisBlock,
  type TransformationWorkspaceInput,
} from '../../data/transformationArtifactFactory';

const INTAKE_FIELDS: { key: keyof TransformationWorkspaceInput; label: string; placeholder: string; rows?: number }[] = [
  { key: 'initiative', label: 'Transformation initiative', placeholder: 'e.g. Enterprise GenAI adoption', rows: 2 },
  { key: 'outcomes', label: 'Expected business outcomes', placeholder: 'e.g. 25% faster delivery, 20% cost reduction', rows: 2 },
  { key: 'benefits', label: 'Expected benefits', placeholder: 'e.g. ₹40 Cr annual value, NPS +12' },
  { key: 'investment', label: 'Investment', placeholder: 'e.g. ₹35 Cr' },
  { key: 'timeline', label: 'Timeline', placeholder: 'e.g. 24 months, 3 phases' },
];

const SUGGESTED_PROMPTS = [
  'Build a benefits realization model for GenAI adoption',
  'Generate a transformation roadmap for digital lending',
  'Analyze dependencies for the core modernization program',
  'Project ROI for the payments transformation program',
];

const FLOW_STEPS = ['Idea', 'Ask AI', 'Recommendations', 'Generated Artifacts', 'Governance Workflow'];

const AGENT_LABEL = 'Transformation AI';

function FlowGuide({ stage }: { stage: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
      {FLOW_STEPS.map((step, i) => {
        const active = i <= stage;
        return (
          <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: 1,
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: active ? colors.text.primary : colors.text.muted,
                bgcolor: active ? `${colors.secondary}22` : colors.bg.glass,
                border: `1px solid ${active ? colors.secondary : colors.border.subtle}`,
              }}
            >
              {step}
            </Box>
            {i < FLOW_STEPS.length - 1 && (
              <ArrowForwardIcon sx={{ fontSize: 13, mx: 0.25, color: active ? colors.secondary : colors.border.glow }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function AnalysisCard({ block }: { block: TransformationAnalysisBlock }) {
  return (
    <Box
      sx={{
        flex: '1 1 280px',
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: colors.bg.glass,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.66rem', display: 'block' }}>
        {block.title}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', display: 'block', mt: 0.25, mb: 0.5 }}>
        {block.headline}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
        {block.findings.map((f) => (
          <Typography key={f} component="li" variant="caption" sx={{ fontSize: '0.7rem', color: colors.text.secondary, lineHeight: 1.4 }}>
            {f}
          </Typography>
        ))}
      </Box>
      {block.recommendation && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75, pl: 1, borderLeft: `2px solid ${colors.border.purple}`, fontSize: '0.7rem', color: colors.text.primary }}>
          <strong>Recommendation:</strong> {block.recommendation}
        </Typography>
      )}
    </Box>
  );
}

interface TransformationAiWorkspaceProps {
  number?: number;
}

export function TransformationAiWorkspace({ number }: TransformationAiWorkspaceProps) {
  const { kpis, programs } = useTransformationPmo();
  const { recordArtifacts } = useArtifactsRegistry();

  const [prompt, setPrompt] = useState('');
  const [intake, setIntake] = useState<Partial<Record<keyof TransformationWorkspaceInput, string>>>({});
  const [analysis, setAnalysis] = useState<TransformationAnalysisBlock[] | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [stage, setStage] = useState(0);
  const [showSim, setShowSim] = useState(false);
  const pendingArtifactRef = useRef(false);

  const sim = useGenerationSimulation({
    initialStatus: `${AGENT_LABEL} analyzing the transformation initiative...`,
    steps: [
      { progress: 20, activity: 'Assessing transformation health and program portfolio', delayMs: 600 },
      { progress: 40, activity: 'Modelling benefits realization and ROI', delayMs: 600 },
      { progress: 65, activity: 'Mapping cross-program dependencies', delayMs: 600 },
      { progress: 85, activity: 'Profiling delivery, financial and adoption risk', delayMs: 600 },
      { progress: 100, activity: 'Compiling transformation recommendations', delayMs: 600 },
    ],
  });

  const buildInput = (): Partial<TransformationWorkspaceInput> => ({
    initiative: intake.initiative || prompt,
    outcomes: intake.outcomes,
    benefits: intake.benefits,
    investment: intake.investment,
    timeline: intake.timeline,
    health: kpis.transformationHealth,
    benefitsRealization: kpis.benefitsRealization,
    roi: kpis.transformationRoi,
    dependencyRisk: kpis.dependencyRisk,
    milestoneCompletion: kpis.milestoneCompletion,
    programCount: programs.length,
  });

  const effectivePrompt = useMemo(() => {
    const parts: string[] = [];
    if (prompt.trim()) parts.push(prompt.trim());
    for (const f of INTAKE_FIELDS) {
      const v = intake[f.key];
      if (v?.trim()) parts.push(`${f.label}: ${v.trim()}`);
    }
    // Fall back to a representative demo prompt so the workflow is never a dead-end.
    return parts.join(' · ') || 'Enterprise transformation program';
  }, [prompt, intake]);

  const run = (thenGenerate: boolean) => {
    if (sim.isRunning) return;
    pendingArtifactRef.current = thenGenerate;
    setShowSim(true);
    setStage(1);
    setAnalysis(null);
    if (!thenGenerate) setArtifacts([]);
    const captured = effectivePrompt;
    const input = buildInput();
    sim.run(() => {
      setAnalysis(buildTransformationAnalysis(input));
      setAnalysisPrompt(captured);
      setStage(2);
      if (pendingArtifactRef.current) {
        const runId = createRunId('TRANSF');
        const generated = buildTransformationArtifacts(input, runId).map((a) => ({
          ...a,
          sourceHub: 'transformation-pmo',
          sourceLabel: 'Transformation AI Workspace',
        }));
        setArtifacts(generated);
        recordArtifacts(generated);
        setStage(4);
      }
    });
  };

  const generateFromAnalysis = () => {
    const runId = createRunId('TRANSF');
    const generated = buildTransformationArtifacts(buildInput(), runId).map((a) => ({
      ...a,
      sourceHub: 'transformation-pmo',
      sourceLabel: 'Transformation AI Workspace',
    }));
    setArtifacts(generated);
    recordArtifacts(generated);
    setStage(4);
  };

  const reset = () => {
    sim.reset();
    setPrompt('');
    setIntake({});
    setAnalysis(null);
    setAnalysisPrompt('');
    setArtifacts([]);
    setStage(0);
    setShowSim(false);
    pendingArtifactRef.current = false;
  };

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }} glow="purple" hover={false}>
        <ModuleHeader
          number={number}
          title="Transformation Center AI Workspace"
          subtitle="Ask AI for transformation, benefit, dependency, ROI and risk analysis — then generate transformation artifacts"
        />
        <FlowGuide stage={stage} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1 }}>
          {INTAKE_FIELDS.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              size="small"
              multiline={!!f.rows}
              rows={f.rows}
              value={intake[f.key] ?? ''}
              onChange={(e) => setIntake((prev) => ({ ...prev, [f.key]: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.bg.glass, fontSize: '0.8rem' } }}
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem', color: colors.text.secondary, display: 'block', mb: 0.5 }}>
          Describe the transformation initiative
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="e.g. Enterprise-wide GenAI adoption across delivery and operations"
          size="small"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.bg.glass, fontSize: '0.8125rem' } }}
        />

        <Box sx={{ mt: 1.25 }}>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suggested prompts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {SUGGESTED_PROMPTS.map((sp) => (
              <Chip
                key={sp}
                label={sp}
                size="small"
                onClick={() => setPrompt(sp)}
                sx={{
                  fontSize: '0.65rem',
                  bgcolor: colors.bg.glass,
                  border: `1px solid ${colors.border.subtle}`,
                  cursor: 'pointer',
                  '&:hover': { borderColor: colors.secondary, color: colors.secondary },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Action row — always visible and enabled (defaults are seeded when empty). */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5, pt: 1.5, borderTop: `1px solid ${colors.border.subtle}` }}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
            disabled={sim.isRunning}
            onClick={() => run(false)}
            sx={{ bgcolor: colors.secondary, fontSize: '0.78rem', fontWeight: 700 }}
          >
            Ask AI
          </Button>
          <Button
            variant="outlined"
            startIcon={<InsightsIcon sx={{ fontSize: 16 }} />}
            disabled={sim.isRunning}
            onClick={() => run(false)}
            sx={{ fontSize: '0.78rem' }}
          >
            Analyze
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
            disabled={sim.isRunning}
            onClick={() => run(true)}
            sx={{ bgcolor: colors.primary, fontSize: '0.78rem', fontWeight: 700 }}
          >
            Generate Artifact
          </Button>
          <Button
            variant="text"
            startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
            disabled={sim.isRunning}
            onClick={reset}
            sx={{ fontSize: '0.78rem', color: colors.text.secondary }}
          >
            Reset
          </Button>
        </Box>
      </GlassCard>

      <GenerationSimulationPanel
        visible={showSim}
        statusMessage={sim.statusMessage}
        progress={sim.progress}
        activityLog={sim.activityLog}
        agentLabel={AGENT_LABEL}
      />

      {analysis && (
        <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
          <ModuleHeader title="AI Transformation Analysis" subtitle={`For: "${analysisPrompt}"`} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {analysis.map((block) => (
              <AnalysisCard key={block.id} block={block} />
            ))}
          </Box>

          {artifacts.length === 0 && !sim.isRunning && (
            <Button
              variant="contained"
              startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
              onClick={generateFromAnalysis}
              sx={{ mt: 1.5, bgcolor: colors.primary, fontSize: '0.75rem' }}
            >
              Generate Transformation Artifacts from this analysis
            </Button>
          )}
        </GlassCard>
      )}

      {artifacts.length > 0 && (
        <ArtifactRepositoryPanel
          artifacts={artifacts}
          title="Generated Artifacts"
          subtitle="Transformation AI · Charter · Business Case · ROI · Benefits · Roadmap · Investment · Dependency · Steering · Risk · KPI Matrix"
        />
      )}

      <TransformationGovernanceWorkflow artifacts={artifacts} initiative={intake.initiative || prompt} />
    </Box>
  );
}
