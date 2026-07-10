import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Box, Button, Chip, LinearProgress, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DescriptionIcon from '@mui/icons-material/Description';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';
import { createArtifact } from '../../data/artifactBuilder';
import type { Artifact } from '../../types/artifacts';
import { downloadArtifactAs, defaultFormatFor } from '../../services/artifactExportService';

/**
 * Reusable AI-First Copilot section.
 *
 * Every Copilot tab answers four questions in the same order:
 *   1. What did AI analyze?         → analyzedSubtitle / analyzedScope
 *   2. What did AI find?            → findings
 *   3. What does AI recommend?      → recommendations
 *   4. What can AI generate?        → generationActions (action strip + artifact list)
 *
 * Secondary KPIs are intentionally rendered last and at small size so the
 * AI workflow is the primary visual.
 */

export interface CopilotFinding {
  id: string;
  /** e.g. "REQ-2014" or "Architecture · Module" */
  badge?: string;
  /** Severity label rendered as a colored pill (Critical/High/Medium/Low/Info). */
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  detail?: string;
}

export interface CopilotRecommendation {
  id: string;
  badge?: string;
  title: string;
  rationale?: string;
  /** Short impact line, e.g. "+18% quality · -₹2.4M risk" */
  impact?: string;
}

export interface CopilotKpi {
  label: string;
  value: string | number;
  suffix?: string;
}

/** AI reasoning shown at the top of a copilot (checklist + confidence). */
export interface CopilotReasoningBlock {
  steps: string[];
  confidence: number;
}

export interface CopilotSuggestedAction {
  id: string;
  /** The action an executive/team should take next. */
  label: string;
  /** Accountable owner/role, rendered as a chip. */
  owner?: string;
  /** Priority pill — P1 (now), P2 (this sprint), P3 (backlog). */
  priority?: 'P1' | 'P2' | 'P3';
  /** Optional supporting context for the action. */
  detail?: string;
}

export interface CopilotGenerationAction {
  id: string;
  label: string;
  artifactName: string;
  /** Inline preview rendered inside the generated artifact card after completion. */
  preview: string;
  /** Free-form description of who/what the AI agent is. Defaults to "SDLC Copilot". */
  generatedBy?: string;
  icon?: SvgIconComponent;
}

interface GeneratedArtifactEntry {
  runId: string;
  actionId: string;
  artifactName: string;
  generatedAt: string;
  generatedBy: string;
  preview: string;
}

const SEV_COLOR: Record<NonNullable<CopilotFinding['severity']>, string> = {
  critical: colors.critical,
  high: colors.warning,
  medium: colors.warning,
  low: colors.info,
  info: colors.info,
};

const SEV_LABEL: Record<NonNullable<CopilotFinding['severity']>, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

const PRIORITY_COLOR: Record<NonNullable<CopilotSuggestedAction['priority']>, string> = {
  P1: colors.critical,
  P2: colors.warning,
  P3: colors.info,
};

interface CopilotSectionProps {
  /** Tab title — e.g. "Requirements Copilot". */
  title: string;
  /** What AI analyzed in plain English — answers question 1. */
  analyzedSubtitle: string;
  /** Optional badge chips that summarize scope of analysis (counts, projects, etc). */
  analyzedScope?: string[];
  /** Optional AI reasoning block (checklist + confidence) shown after the banner. */
  reasoning?: CopilotReasoningBlock;
  /** Section heading for findings list (defaults to "AI Findings"). */
  findingsTitle?: string;
  findings: CopilotFinding[];
  /** Section heading for recommendations list. Defaults to "AI Recommendations". */
  recommendationsTitle?: string;
  recommendations: CopilotRecommendation[];
  /** Optional left-rail extra section (used by Release Copilot for the Go/No-Go gauge). */
  primarySlot?: ReactNode;
  /** Action buttons that "generate" artifacts. */
  generationActions: CopilotGenerationAction[];
  /** Concrete next-step actions for the team (the "Suggested Actions" section). */
  suggestedActions?: CopilotSuggestedAction[];
  /** Optional secondary KPI strip (compact, rendered at the bottom). */
  secondaryKpis?: CopilotKpi[];
  /** Initial seeded artifacts (so the page does not look empty before any click). */
  initialArtifacts?: Array<Omit<GeneratedArtifactEntry, 'runId'>>;
  /** Source-hub key used when registering generated artifacts in the global Artifacts repository. */
  sourceHub?: string;
  /** Human-readable label for the source-hub. */
  sourceLabel?: string;
  /** If false, generation actions are disabled and an explanatory message is shown. */
  canGenerate?: boolean;
  generationDisabledMessage?: string;
}

function toRegistryArtifact(
  entry: GeneratedArtifactEntry,
  source: { hub?: string; label?: string },
): Artifact {
  const requirementFlow =
    source.hub === 'ai-copilot' && (source.label ?? '').toLowerCase().includes('requirement');
  const modelUsed = requirementFlow
    ? (entry.generatedBy.toLowerCase().includes('deterministic demo') ? 'Not applicable' : 'qwen3:8b')
    : undefined;
  return createArtifact({
    id: `copilot-${entry.runId}`,
    name: entry.artifactName,
    generatedBy: entry.generatedBy,
    modelUsed,
    fileType: entry.artifactName.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'docx',
    approvalStatus: 'Pending Review',
    riskRating: 'Medium',
    previewContent: entry.preview,
    executiveSummary: requirementFlow
      ? entry.preview
      : `AI-generated ${entry.artifactName} produced by ${entry.generatedBy} at ${entry.generatedAt}.`,
    sections: requirementFlow
      ? [{ title: 'Requirement Artifact Content', content: entry.preview }]
      : undefined,
    context: { subject: source.label ?? 'AI SDLC Copilot' },
  });
}

export function CopilotSection({
  title,
  analyzedSubtitle,
  analyzedScope,
  reasoning,
  findingsTitle = 'AI Findings',
  findings,
  recommendationsTitle = 'AI Recommendations',
  recommendations,
  primarySlot,
  generationActions,
  suggestedActions,
  secondaryKpis,
  initialArtifacts,
  sourceHub,
  sourceLabel,
  canGenerate = true,
  generationDisabledMessage = 'Generation is unavailable for the current request.',
}: CopilotSectionProps) {
  const [artifacts, setArtifacts] = useState<GeneratedArtifactEntry[]>(() =>
    (initialArtifacts ?? []).map((a, i) => ({ ...a, runId: `seed-${i}` })),
  );
  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activity, setActivity] = useState<string>('');
  const { recordArtifacts } = useArtifactsRegistry();

  // Seed the global registry with any initial artifacts so the Universal
  // Artifacts Repository never appears empty for an executive demo.
  useEffect(() => {
    if (!artifacts.length) return;
    recordArtifacts(
      artifacts.map((a) => {
        const reg = toRegistryArtifact(a, { hub: sourceHub, label: sourceLabel });
        return { ...reg, sourceHub, sourceLabel };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runGenerate = useCallback(
    (action: CopilotGenerationAction) => {
      if (runningActionId) return;
      setRunningActionId(action.id);
      setProgress(0);
      setActivity(`AI agent starting: ${action.label}`);
      const STEPS = [
        { p: 25, msg: 'Loading project context and prior findings…' },
        { p: 55, msg: `Synthesizing ${action.label.toLowerCase()} from current evidence…` },
        { p: 80, msg: 'Drafting artifact and validating against governance rules…' },
        { p: 100, msg: 'Artifact generated and stored in repository.' },
      ];
      STEPS.forEach((s, i) => {
        setTimeout(() => {
          setProgress(s.p);
          setActivity(s.msg);
          if (i === STEPS.length - 1) {
            const runId = `R-${Date.now().toString(36).slice(-6).toUpperCase()}`;
            const newEntry: GeneratedArtifactEntry = {
              runId,
              actionId: action.id,
              artifactName: action.artifactName,
              generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              generatedBy: action.generatedBy ?? 'SDLC Copilot',
              preview: action.preview,
            };
            setArtifacts((prev) => [newEntry, ...prev]);
            // Push into the global Universal Artifacts Repository.
            const reg = toRegistryArtifact(newEntry, { hub: sourceHub, label: sourceLabel });
            recordArtifacts([{ ...reg, sourceHub, sourceLabel }]);
            setTimeout(() => {
              setRunningActionId(null);
              setProgress(0);
              setActivity('');
            }, 600);
          }
        }, 450 * (i + 1));
      });
    },
    [runningActionId, recordArtifacts, sourceHub, sourceLabel],
  );

  const runningAction = generationActions.find((a) => a.id === runningActionId);

  return (
    <Box>
      {/* 1. WHAT DID AI ANALYZE? — the AI Activity Banner */}
      <GlassCard glow="purple" sx={{ p: 2 }} hover={false}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <AutoAwesomeIcon sx={{ color: colors.secondary, fontSize: 22, mt: 0.25 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: colors.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.62rem',
              }}
            >
              AI Analyzed
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 0.25 }}>{title}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: colors.text.secondary, mt: 0.25 }}>
              {analyzedSubtitle}
            </Typography>
            {analyzedScope && analyzedScope.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                {analyzedScope.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.62rem',
                      bgcolor: `${colors.secondary}1f`,
                      color: colors.secondary,
                      border: `1px solid ${colors.border.purple}`,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </GlassCard>

      {/* AI REASONING — why the AI reached its conclusions for this prompt */}
      {reasoning && reasoning.steps.length > 0 && (
        <GlassCard sx={{ p: 2, mt: 1.5 }} hover={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <PsychologyIcon sx={{ fontSize: 18, color: colors.secondary }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Reasoning</Typography>
            <Chip
              label={`Confidence ${reasoning.confidence}%`}
              size="small"
              sx={{ height: 18, fontSize: '0.6rem', ml: 'auto', bgcolor: `${colors.success}1f`, color: colors.success, fontWeight: 700 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {reasoning.steps.map((s) => (
              <Box
                key={s}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: colors.bg.glass,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 14, color: colors.success }} />
                <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary }}>{s}</Typography>
              </Box>
            ))}
          </Box>
        </GlassCard>
      )}

      {/* 4. WHAT CAN AI GENERATE? — Action strip is given top placement so AI authoring is unmistakable */}
      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue">
        <ModuleHeader
          title="AI Authoring"
          subtitle="Click an action to let the AI agent generate a deliverable from the current findings."
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
          {generationActions.map((a) => {
            const Icon = a.icon ?? AutoAwesomeIcon;
            const isThisRunning = runningActionId === a.id;
            return (
              <Button
                key={a.id}
                variant="contained"
                size="small"
                disabled={!!runningActionId || !canGenerate}
                onClick={() => runGenerate(a)}
                startIcon={<Icon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.72rem',
                  bgcolor: isThisRunning ? colors.secondary : colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                }}
              >
                {a.label}
              </Button>
            );
          })}
        </Box>
        {!canGenerate && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.warning, mt: 1 }}>
            {generationDisabledMessage}
          </Typography>
        )}

        {runningAction && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(139,92,246,0.12)' }}
            />
            <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary, mt: 0.5 }}>
              <strong style={{ color: colors.secondary }}>{runningAction.generatedBy ?? 'SDLC Copilot'}</strong>
              {' · '}
              {activity}
            </Typography>
          </Box>
        )}
      </GlassCard>

      {/* 2 & 3. WHAT DID AI FIND / RECOMMEND? — two-column workspace with optional left primary slot */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mt: 1.5 }}>
        {primarySlot && <Box sx={{ flex: { md: '0 0 320px' } }}>{primarySlot}</Box>}

        <Box sx={{ flex: 1 }}>
          <GlassCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <InsightsIcon sx={{ fontSize: 18, color: colors.warning }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{findingsTitle}</Typography>
              <Chip
                label={`${findings.length}`}
                size="small"
                sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.warning}1f`, color: colors.warning }}
              />
            </Box>
            {findings.length === 0 && (
              <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted, py: 1 }}>
                No findings detected by AI in current scope.
              </Typography>
            )}
            {findings.map((f) => (
              <Box key={f.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 0.25 }}>
                  {f.badge && (
                    <Chip
                      label={f.badge}
                      size="small"
                      sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.04)' }}
                    />
                  )}
                  {f.severity && (
                    <Chip
                      label={SEV_LABEL[f.severity]}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.55rem',
                        bgcolor: `${SEV_COLOR[f.severity]}26`,
                        color: SEV_COLOR[f.severity],
                      }}
                    />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{f.title}</Typography>
                {f.detail && (
                  <Typography sx={{ fontSize: '0.66rem', color: colors.text.secondary, lineHeight: 1.45 }}>
                    {f.detail}
                  </Typography>
                )}
              </Box>
            ))}
          </GlassCard>
        </Box>

        <Box sx={{ flex: 1 }}>
          <GlassCard sx={{ p: 2 }} glow="purple">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <LightbulbIcon sx={{ fontSize: 18, color: colors.secondary }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{recommendationsTitle}</Typography>
              <Chip
                label={`${recommendations.length}`}
                size="small"
                sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.secondary}1f`, color: colors.secondary }}
              />
            </Box>
            {recommendations.length === 0 && (
              <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted, py: 1 }}>
                AI has no open recommendations — current scope is on track.
              </Typography>
            )}
            {recommendations.map((r) => (
              <Box key={r.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
                {r.badge && (
                  <Chip
                    label={r.badge}
                    size="small"
                    sx={{ height: 16, fontSize: '0.55rem', mb: 0.25, bgcolor: 'rgba(139,92,246,0.16)', color: colors.secondary }}
                  />
                )}
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.secondary }}>
                  → {r.title}
                </Typography>
                {r.rationale && (
                  <Typography sx={{ fontSize: '0.66rem', color: colors.text.secondary, lineHeight: 1.45 }}>
                    {r.rationale}
                  </Typography>
                )}
                {r.impact && (
                  <Typography sx={{ fontSize: '0.62rem', color: colors.success, mt: 0.25 }}>
                    {r.impact}
                  </Typography>
                )}
              </Box>
            ))}
          </GlassCard>
        </Box>
      </Box>

      {/* Generated Artifacts list — answers the visible "What did AI generate?" */}
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <DescriptionIcon sx={{ fontSize: 18, color: colors.info }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Generated Artifacts</Typography>
          <Chip
            label={`${artifacts.length}`}
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.info}1f`, color: colors.info }}
          />
        </Box>
        {artifacts.length === 0 && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted, py: 1 }}>
            No artifacts generated yet. Use an AI Action above to generate the first one.
          </Typography>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
          {artifacts.map((a) => (
            <Box
              key={a.runId}
              sx={{
                p: 1.25,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: 1.5,
                bgcolor: 'rgba(59,130,246,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Chip
                  label={a.runId}
                  size="small"
                  sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.06)' }}
                />
                <Chip
                  label={a.generatedBy}
                  size="small"
                  sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${colors.secondary}1f`, color: colors.secondary }}
                />
                <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, ml: 'auto' }}>
                  {a.generatedAt}
                </Typography>
                <Button
                  size="small"
                  startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    const reg = toRegistryArtifact(a, { hub: sourceHub, label: sourceLabel });
                    void downloadArtifactAs(reg, defaultFormatFor(reg));
                  }}
                  sx={{ ml: 0.5, fontSize: '0.6rem', py: 0, minWidth: 0, textTransform: 'none' }}
                >
                  Download
                </Button>
              </Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{a.artifactName}</Typography>
              <Typography
                component="pre"
                sx={{
                  fontSize: '0.6rem',
                  color: colors.text.secondary,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  mt: 0.5,
                  maxHeight: 110,
                  overflow: 'hidden',
                  lineHeight: 1.45,
                }}
              >
                {a.preview}
              </Typography>
            </Box>
          ))}
        </Box>
      </GlassCard>

      {/* 5. WHAT SHOULD WE DO NEXT? — Suggested Actions */}
      {suggestedActions && suggestedActions.length > 0 && (
        <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <PlaylistAddCheckIcon sx={{ fontSize: 18, color: colors.primary }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Suggested Actions</Typography>
            <Chip
              label={`${suggestedActions.length}`}
              size="small"
              sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.primary}1f`, color: colors.primary }}
            />
          </Box>
          {suggestedActions.map((a) => (
            <Box
              key={a.id}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}
            >
              {a.priority && (
                <Chip
                  label={a.priority}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    bgcolor: `${PRIORITY_COLOR[a.priority]}26`,
                    color: PRIORITY_COLOR[a.priority],
                  }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{a.label}</Typography>
                {a.detail && (
                  <Typography sx={{ fontSize: '0.66rem', color: colors.text.secondary, lineHeight: 1.45 }}>
                    {a.detail}
                  </Typography>
                )}
              </Box>
              {a.owner && (
                <Chip
                  label={a.owner}
                  size="small"
                  sx={{ height: 18, fontSize: '0.58rem', bgcolor: 'rgba(255,255,255,0.05)', color: colors.text.secondary }}
                />
              )}
            </Box>
          ))}
        </GlassCard>
      )}

      {secondaryKpis && secondaryKpis.length > 0 && (
        <GlassCard sx={{ p: 1.5, mt: 1.5 }} hover={false}>
          <Typography
            sx={{ fontSize: '0.62rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}
          >
            Secondary outcome indicators
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {secondaryKpis.map((k) => (
              <Box key={k.label} sx={{ minWidth: 110 }}>
                <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, textTransform: 'uppercase' }}>
                  {k.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{k.value}</Typography>
                  {k.suffix && (
                    <Typography sx={{ fontSize: '0.65rem', color: colors.text.muted }}>{k.suffix}</Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </GlassCard>
      )}
    </Box>
  );
}
