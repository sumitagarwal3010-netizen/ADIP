import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, TextField, Typography, Alert } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { ArtifactRepositoryPanel } from './ArtifactRepositoryPanel';
import { useGenerationSimulation } from '../../hooks/useGenerationSimulation';
import { GenerationSimulationPanel } from './GenerationSimulationPanel';
import { colors } from '../../theme/colors';
import {
  PHASE_CONFIG,
  generateAnalysisResult,
  type AnalysisResult,
} from '../../data/aiAnalysisMockData';
import { buildHubArtifacts } from '../../data/hubArtifactDefinitions';
import { createRunId } from '../../data/requirementArtifactFactory';
import type { Artifact } from '../../types/artifacts';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';
import { createArtifact } from '../../data/artifactBuilder';
import { orchestrateFromPrompt } from '../../data/copilotOrchestrationEngine';
import {
  AI_WORKSPACE_CONFIGS,
  type AIWorkspaceModule,
} from '../../config/aiWorkspaceConfig';
import {
  type AISession,
  createSessionId,
  loadSessions,
  nowDisplay,
  saveSession,
} from '../../data/aiSessionStore';
import { WorkspaceGovernancePanel } from './WorkspaceGovernancePanel';
import { useCopilot } from '../../context/CopilotContext';
import { analyzePromptWithBackend } from '../../services/aiWorkspaceBackend';
import { isBackendMode } from '../../services/backend/apiConfig';

interface AIWorkspacePanelProps {
  module: AIWorkspaceModule;
  /** Header number (optional) to slot into a numbered hub layout. */
  number?: number;
}

const FLOW_STEPS = ['User Prompt', 'AI Analysis', 'Recommendations', 'Generated Artifacts', 'Governance Workflow'];

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

function findingValue(value: string | number | string[]): string {
  return Array.isArray(value) ? value.join(' · ') : String(value);
}

export function AIWorkspacePanel({ module, number }: AIWorkspacePanelProps) {
  const config = AI_WORKSPACE_CONFIGS[module];
  const phaseConfig = PHASE_CONFIG[config.analysisPhase];
  const { recordArtifacts } = useArtifactsRegistry();
  const { activePrompt, runOrchestration } = useCopilot();

  // The AI SDLC Copilot studio is the single prompt that drives every copilot.
  const isOrchestrator = module === 'ai-copilot';

  const [prompt, setPrompt] = useState(isOrchestrator ? activePrompt : '');

  // Seed the orchestrator prompt from context once so the studio opens populated
  // with the default UPI Auto-Reversal demo scenario (editable by the user).
  useEffect(() => {
    if (isOrchestrator && !prompt.trim()) setPrompt(activePrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [intake, setIntake] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [sessions, setSessions] = useState<AISession[]>(() => loadSessions(module));
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [stage, setStage] = useState(0); // 0=input .. 4=governance
  const [showSim, setShowSim] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const pendingArtifactRef = useRef(false);

  const sim = useGenerationSimulation({
    initialStatus: `${config.agentLabel} analyzing your request...`,
    steps: phaseConfig.agents.map((agent, i) => ({
      progress: Math.round(((i + 1) / phaseConfig.agents.length) * 100),
      activity: agent,
      delayMs: 600,
    })),
  });

  // Compose the effective prompt from free text + structured intake fields.
  const effectivePrompt = useMemo(() => {
    const parts: string[] = [];
    if (prompt.trim()) parts.push(prompt.trim());
    for (const f of config.intakeFields ?? []) {
      if (intake[f.key]?.trim()) parts.push(`${f.label}: ${intake[f.key].trim()}`);
    }
    return parts.join(' · ');
  }, [prompt, intake, config.intakeFields]);

  const hasInput = effectivePrompt.length > 0;

  const recordSession = (generated: boolean, count: number) => {
    const session: AISession = {
      id: createSessionId(),
      module,
      prompt: effectivePrompt.slice(0, 120),
      createdAt: new Date().toISOString(),
      displayTime: nowDisplay(),
      generatedArtifacts: generated,
      artifactCount: count,
    };
    setSessions(saveSession(module, session));
    setHistory((prev) => [effectivePrompt, ...prev.filter((p) => p !== effectivePrompt)].slice(0, 8));
  };

  /**
   * Build the generated artifacts for a run. For the AI SDLC Copilot studio we
   * reuse the shared orchestration engine so artifact names/descriptions stay
   * prompt-specific (e.g. "UPI Auto-Reversal BRD"); every other hub keeps its
   * existing `buildHubArtifacts` pipeline. No artifact logic is duplicated.
   */
  const buildGeneratedArtifacts = (captured: string, runId: string): Artifact[] => {
    if (isOrchestrator) {
      const orch = orchestrateFromPrompt(captured);
      return orch.artifacts.map((a, i) =>
        createArtifact({
          id: `sdlc-${runId}-${i}`,
          name: a.name,
          generatedBy: a.generatedBy,
          fileType: a.name.toLowerCase().includes('matrix') || a.name.toLowerCase().includes('data model') ? 'xlsx' : 'docx',
          approvalStatus: 'Pending Review',
          riskRating: 'Medium',
          previewContent: `${a.name}\n\n${a.description}\n\nScenario: ${orch.scenario.label}\nPrompt-driven AI SDLC run ${runId}.`,
          executiveSummary: a.description,
          context: { subject: 'AI SDLC Copilot · ' + orch.scenario.label },
        }),
      ).map((a) => ({ ...a, sourceHub: config.artifactHub, sourceLabel: config.title }));
    }
    return buildHubArtifacts(config.artifactHub, runId).map((a) => ({
      ...a,
      sourceHub: config.artifactHub,
      sourceLabel: config.title,
    }));
  };

  const runAnalysis = (thenGenerate: boolean) => {
    if (!hasInput) return;
    pendingArtifactRef.current = thenGenerate;
    setShowSim(true);
    setStage(1);
    setAnalysis(null);
    setBackendError(null);
    if (!thenGenerate) setArtifacts([]);
    const captured = effectivePrompt;
    if (isOrchestrator) runOrchestration(captured);

    const finishAnalysis = (result: AnalysisResult) => {
      setAnalysis(result);
      setAnalysisPrompt(captured);
      setStage(2);
      if (pendingArtifactRef.current) {
        const runId = createRunId(module.toUpperCase().slice(0, 4));
        const generated = buildGeneratedArtifacts(captured, runId);
        setArtifacts(generated);
        recordArtifacts(generated);
        setStage(4);
        recordSession(true, generated.length);
      } else {
        recordSession(false, 0);
      }
    };

    const runMockPath = () => {
      sim.run(() => {
        finishAnalysis(generateAnalysisResult(config.analysisPhase, captured));
      });
    };

    if (isBackendMode()) {
      sim.run(async () => {
        const backendResult = await analyzePromptWithBackend(config.analysisPhase, captured);
        if (backendResult) {
          finishAnalysis(backendResult);
        } else {
          setBackendError('Backend analysis unavailable — using mock analysis.');
          finishAnalysis(generateAnalysisResult(config.analysisPhase, captured));
        }
      });
      return;
    }

    runMockPath();
  };

  const applySuggested = (text: string) => {
    setPrompt(text);
  };

  const isAsk = config.mode === 'ask';

  // Split analysis into summary findings vs. list-style recommendations/gaps.
  const summaryEntries = analysis ? Object.entries(analysis).filter(([, v]) => !Array.isArray(v)) : [];
  const listEntries = analysis ? Object.entries(analysis).filter(([, v]) => Array.isArray(v)) : [];

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }} glow={config.glow} hover={false}>
        <ModuleHeader number={number} title={config.title} subtitle={config.subtitle} />
        <FlowGuide stage={stage} />
        {backendError && (
          <Alert severity="info" sx={{ mb: 1, py: 0.25 }}>
            {backendError}
          </Alert>
        )}

        {/* Structured intake (Transformation / Technology / EA / Portfolio) */}
        {config.intakeFields && config.intakeFields.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1 }}>
            {config.intakeFields.map((f) => (
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
        )}

        {/* Primary prompt */}
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem', color: colors.text.secondary, display: 'block', mb: 0.5 }}>
          {config.promptLabel}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={config.placeholder}
            size="small"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { bgcolor: colors.bg.glass, fontSize: '0.8125rem' } }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 170 }}>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
              disabled={!hasInput || sim.isRunning}
              onClick={() => runAnalysis(false)}
              sx={{ bgcolor: colors.secondary, fontSize: '0.75rem' }}
            >
              {isAsk ? 'Ask AI' : 'Analyze'}
            </Button>
            {!isAsk && (
              <Button
                variant="outlined"
                startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                disabled={!hasInput || sim.isRunning}
                onClick={() => runAnalysis(true)}
                sx={{ fontSize: '0.75rem' }}
              >
                Generate Artifact
              </Button>
            )}
          </Box>
        </Box>

        {/* Suggested prompts */}
        <Box sx={{ mt: 1.25 }}>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suggested prompts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {config.suggestedPrompts.map((sp) => (
              <Chip
                key={sp}
                label={sp}
                size="small"
                onClick={() => applySuggested(sp)}
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

        {/* Prompt history + recent sessions */}
        {(history.length > 0 || sessions.length > 0) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.25 }}>
            {history.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 13 }} /> Prompt history
                </Typography>
                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {history.map((h, i) => (
                    <Typography
                      key={`${h}-${i}`}
                      variant="caption"
                      onClick={() => applySuggested(h)}
                      sx={{ fontSize: '0.7rem', color: colors.text.secondary, cursor: 'pointer', '&:hover': { color: colors.primary } }}
                    >
                      • {h}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            {sessions.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent sessions
                </Typography>
                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {sessions.slice(0, 5).map((s) => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.68rem', color: colors.text.secondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.prompt}
                      </Typography>
                      {s.generatedArtifacts && (
                        <Chip label={`${s.artifactCount} artifacts`} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${colors.success}22`, color: colors.success }} />
                      )}
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>{s.displayTime}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </GlassCard>

      {/* Analysis progress */}
      <GenerationSimulationPanel
        visible={showSim}
        statusMessage={sim.statusMessage}
        progress={sim.progress}
        activityLog={sim.activityLog}
        agentLabel={config.agentLabel}
      />

      {/* AI analysis results: Requirements / Gap / Recommendations */}
      {analysis && (
        <GlassCard sx={{ p: 2, mt: 1.5 }} glow={config.glow}>
          <ModuleHeader
            title={isAsk ? 'AI Answer' : `${phaseConfig.completeTitle}`}
            subtitle={`For: "${analysisPrompt}"`}
          />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, background: `linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)`, border: `1px solid ${colors.border.purple}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                AI Findings
              </Typography>
              {summaryEntries.map(([k, v]) => (
                <Box key={k} sx={{ mb: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', display: 'block' }}>{k}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{findingValue(v)}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                Recommendations &amp; Gaps
              </Typography>
              {listEntries.map(([k, items]) => (
                <Box key={k} sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', display: 'block', mb: 0.25 }}>{k}</Typography>
                  {(items as string[]).map((it) => (
                    <Typography key={it} variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', pl: 1 }}>• {it}</Typography>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Generate-from-analysis affordance (so Analyze → Artifacts is one click) */}
          {!isAsk && artifacts.length === 0 && !sim.isRunning && (
            <Button
              variant="contained"
              startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                pendingArtifactRef.current = true;
                const runId = createRunId(module.toUpperCase().slice(0, 4));
                const generated = buildGeneratedArtifacts(analysisPrompt || effectivePrompt, runId);
                setArtifacts(generated);
                recordArtifacts(generated);
                setStage(4);
                recordSession(true, generated.length);
              }}
              sx={{ mt: 1.5, bgcolor: colors.primary, fontSize: '0.75rem' }}
            >
              Generate Artifacts from this analysis
            </Button>
          )}

          {isAsk && !sim.isRunning && (
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                const runId = createRunId(module.toUpperCase().slice(0, 4));
                const generated = buildGeneratedArtifacts(analysisPrompt || effectivePrompt, runId);
                setArtifacts(generated);
                recordArtifacts(generated);
                setStage(4);
                recordSession(true, generated.length);
              }}
              sx={{ mt: 1.5, fontSize: '0.75rem' }}
            >
              Generate Executive Brief from this answer
            </Button>
          )}
        </GlassCard>
      )}

      {/* Generated artifacts */}
      {artifacts.length > 0 && (
        <ArtifactRepositoryPanel
          artifacts={artifacts}
          title="Generated Artifacts"
          subtitle={`${config.agentLabel} · ${config.artifactSummary.join(' · ')}`}
        />
      )}

      {(artifacts.length > 0 || (isAsk && analysis && stage >= 2)) && (
        <WorkspaceGovernancePanel
          governance={config.governance}
          artifacts={artifacts}
          promptSummary={analysisPrompt || effectivePrompt}
          showWithoutArtifacts={isAsk && artifacts.length === 0 && !!analysis}
        />
      )}
    </Box>
  );
}
