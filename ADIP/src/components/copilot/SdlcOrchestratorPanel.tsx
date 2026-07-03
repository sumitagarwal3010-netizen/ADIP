/**
 * AI SDLC Orchestrator.
 *
 * Renders the aggregated, prompt-driven view for the Enterprise AI Authoring
 * Studio: overall AI SDLC score, executive summary, cross-phase risks, key
 * recommendations, the visible traceability chain (Prompt → Requirement →
 * Architecture → Development → Testing → Release → Audit Evidence), the
 * right-side AI Advisor insights, per-phase scores, and the prompt-specific
 * generated artifacts (also pushed to the Universal Artifacts Repository).
 *
 * All content comes from the shared CopilotContext orchestration — one prompt
 * drives everything. Reuses existing GlassCard / AIInsightBox / ArtifactRepositoryPanel.
 */
import { useEffect } from 'react';
import { Box, Chip, Grid, Typography } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InsightsIcon from '@mui/icons-material/Insights';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import SavingsIcon from '@mui/icons-material/Savings';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { GaugeChart } from '../charts/GaugeChart';
import { ArtifactRepositoryPanel } from '../workflow/ArtifactRepositoryPanel';
import { colors } from '../../theme/colors';
import { useCopilot } from '../../context/CopilotContext';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';
import { createArtifact } from '../../data/artifactBuilder';
import type { Artifact } from '../../types/artifacts';
import type { AdvisorInsight } from '../../data/copilotOrchestrationEngine';

const ADVISOR_COLOR: Record<AdvisorInsight['severity'], string> = {
  critical: colors.critical,
  high: colors.warning,
  medium: colors.info,
  info: colors.primary,
};

const PHASE_ORDER = ['requirements', 'architecture', 'development', 'testing', 'release', 'audit'] as const;

const READINESS_COLOR: Record<string, string> = {
  Ready: colors.success,
  'On Track': colors.warning,
  'Needs Attention': colors.critical,
};

export function SdlcOrchestratorPanel() {
  const { orchestration, orchestrationActive } = useCopilot();
  const { recordArtifacts } = useArtifactsRegistry();
  const o = orchestration;

  // Convert the prompt-specific artifact catalog into registry artifacts so the
  // Generated Artifacts table + Universal Artifacts Repository reflect the prompt.
  const artifacts: Artifact[] = o.artifacts.map((a, i) =>
    createArtifact({
      id: `sdlc-${o.runId}-${i}`,
      name: a.name,
      generatedBy: a.generatedBy,
      fileType: a.name.toLowerCase().includes('matrix') || a.name.toLowerCase().includes('data model') ? 'xlsx' : 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      previewContent: `${a.name}\n\n${a.description}\n\nScenario: ${o.scenario.label}\nPrompt-driven AI SDLC run ${o.runId}.`,
      executiveSummary: a.description,
      context: { subject: 'AI SDLC Copilot · ' + o.scenario.label },
    }),
  );

  useEffect(() => {
    recordArtifacts(artifacts.map((a) => ({ ...a, sourceHub: 'ai-copilot', sourceLabel: 'AI SDLC Copilot' })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.runId]);

  const bandColor =
    o.orchestrator.band === 'Ready' ? colors.success : o.orchestrator.band === 'Conditional' ? colors.warning : colors.critical;

  return (
    <Box>
      {/* Scenario banner */}
      <GlassCard glow="purple" sx={{ p: 2 }} hover={false}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, flexWrap: 'wrap' }}>
          <AccountTreeIcon sx={{ color: colors.secondary, fontSize: 22, mt: 0.25 }} />
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {orchestrationActive ? 'AI SDLC Orchestration · Prompt-driven' : 'AI SDLC Orchestration · Default scenario (run Analyze to refresh)'}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 0.25 }}>{o.scenario.label}</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: colors.text.secondary, mt: 0.25, lineHeight: 1.5 }}>
              {o.prompt.length > 220 ? `${o.prompt.slice(0, 220)}…` : o.prompt}
            </Typography>
            {o.scenario.matchedKeywords.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mt: 0.75 }}>
                <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, mr: 0.5 }}>Detected keywords:</Typography>
                {o.scenario.matchedKeywords.slice(0, 8).map((k) => (
                  <Chip key={k} label={k} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${colors.secondary}1f`, color: colors.secondary }} />
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 150 }}>
            <GaugeChart value={o.orchestrator.overallScore} label="AI SDLC Score" size={150} />
            <Chip
              label={`${o.orchestrator.band} · ${o.orchestrator.overallScore}/100`}
              size="small"
              sx={{ mt: 0.5, fontWeight: 700, bgcolor: `${bandColor}1f`, color: bandColor, border: `1px solid ${bandColor}55` }}
            />
          </Box>
        </Box>
      </GlassCard>

      {/* AI Prompt Classification */}
      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <CategoryIcon sx={{ fontSize: 18, color: colors.secondary }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Prompt Classification</Typography>
          <Chip
            label={`AI Confidence ${o.classification.aiConfidence}%`}
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', ml: 'auto', bgcolor: `${colors.success}1f`, color: colors.success, fontWeight: 700 }}
          />
        </Box>
        <Grid container spacing={1.5}>
          {[
            { label: 'Business Domain', value: o.classification.businessDomain },
            { label: 'Application', value: o.classification.application },
            { label: 'Capability', value: o.classification.capability },
            { label: 'Technology', value: o.classification.technology },
            { label: 'Complexity', value: o.classification.complexity },
            { label: 'Estimated Story Points', value: `${o.classification.estimatedStoryPoints}` },
            { label: 'Estimated Sprint Count', value: `${o.classification.estimatedSprintCount} sprints` },
            { label: 'AI Confidence', value: `${o.classification.aiConfidence}%` },
          ].map((c) => (
            <Grid key={c.label} size={{ xs: 6, md: 3 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}`, height: '100%' }}>
                <Typography sx={{ fontSize: '0.58rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, mt: 0.25, lineHeight: 1.35 }}>{c.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </GlassCard>

      {/* Aggregate metrics */}
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        {[
          { label: 'Overall AI SDLC Score', value: `${o.orchestrator.overallScore}/100` },
          { label: 'Generated Artifacts', value: o.orchestrator.artifactCount },
          { label: 'Est. Manual Effort Saved', value: `${o.orchestrator.estimatedEffortSavedDays} days` },
          { label: 'Cross-phase Risks', value: o.orchestrator.crossPhaseRisks.length },
        ].map((m) => (
          <Grid key={m.label} size={{ xs: 6, md: 3 }}>
            <GlassCard sx={{ p: 1.5 }}>
              <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, mt: 0.25 }}>{m.value}</Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* AI Business Value */}
      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <SavingsIcon sx={{ fontSize: 18, color: colors.success }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Business Value</Typography>
        </Box>
        <Grid container spacing={1.5}>
          {[
            { label: 'Documentation Generated', value: `${o.businessValue.documentationPages} pages` },
            { label: 'Manual Effort Saved', value: `${o.businessValue.manualEffortSavedDays} days` },
            { label: 'Artifacts Generated', value: `${o.businessValue.artifactsGenerated}` },
            { label: 'Compliance Controls Identified', value: `${o.businessValue.complianceControlsIdentified}` },
            { label: 'Engineering Productivity Uplift', value: `+${o.businessValue.engineeringProductivityUpliftPct}%` },
            { label: 'AI Confidence', value: `${o.businessValue.aiConfidence}%` },
          ].map((m) => (
            <Grid key={m.label} size={{ xs: 6, md: 2 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(16,185,129,0.06)', border: `1px solid ${colors.border.subtle}`, height: '100%' }}>
                <Typography sx={{ fontSize: '0.58rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, mt: 0.25, color: colors.success }}>{m.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </GlassCard>

      {/* Traceability chain — Prompt → Requirement → ... → Audit Evidence */}
      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue">
        <ModuleHeader title="Traceability Chain" subtitle="Prompt → Requirement → Architecture → Development → Testing → Release → Audit Evidence" />
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          {o.traceability.map((step, i) => (
            <Box key={step.label} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1,
                  minWidth: 150,
                  maxWidth: 190,
                  borderRadius: 1.5,
                  bgcolor: colors.bg.glass,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.secondary }}>
                  {step.label}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: colors.text.secondary, mt: 0.25, lineHeight: 1.4 }}>
                  {step.detail}
                </Typography>
              </Box>
              {i < o.traceability.length - 1 && (
                <ArrowForwardIcon sx={{ fontSize: 16, mx: 0.25, color: colors.secondary }} />
              )}
            </Box>
          ))}
        </Box>
      </GlassCard>

      {/* Cross-phase Dependency View — Requirement ↓ Architecture ↓ ... ↓ Audit with readiness */}
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Cross-phase Dependency View" subtitle="Each phase depends on the previous — readiness flows Requirement → Audit" />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, mt: 0.5 }}>
          {PHASE_ORDER.map((phase, i) => {
            const p = o.phases[phase];
            const rColor = READINESS_COLOR[p.readiness] ?? colors.info;
            return (
              <Box key={phase} sx={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.85,
                    borderRadius: 1.5,
                    bgcolor: colors.bg.glass,
                    border: `1px solid ${rColor}55`,
                  }}
                >
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, flex: 1 }}>
                    {p.title.replace(' Copilot', '')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: colors.text.secondary }}>{p.score}/100</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: rColor }} />
                    <Chip
                      label={p.readiness}
                      size="small"
                      sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, bgcolor: `${rColor}1f`, color: rColor }}
                    />
                  </Box>
                </Box>
                {i < PHASE_ORDER.length - 1 && (
                  <ArrowDownwardIcon sx={{ fontSize: 16, color: colors.secondary, my: 0.1 }} />
                )}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {/* Per-phase scores */}
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Copilot Scores by Phase" subtitle="Each copilot analyzed the same prompt" />
        <Grid container spacing={1.5}>
          {PHASE_ORDER.map((phase) => {
            const p = o.phases[phase];
            const color = p.score >= 82 ? colors.success : p.score >= 72 ? colors.warning : colors.critical;
            return (
              <Grid key={phase} size={{ xs: 6, md: 2 }}>
                <Box sx={{ p: 1.25, borderRadius: 1.5, border: `1px solid ${colors.border.subtle}`, bgcolor: 'rgba(59,130,246,0.04)' }}>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700 }}>{p.title.replace(' Copilot', '')}</Typography>
                  <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color }}>{p.score}<Box component="span" sx={{ fontSize: '0.62rem', color: colors.text.muted }}>/100</Box></Typography>
                  <Typography sx={{ fontSize: '0.55rem', color: colors.text.muted }}>{p.scoreLabel}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </GlassCard>

      {/* Cross-phase risks + key recommendations + AI Advisor */}
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <ReportProblemIcon sx={{ fontSize: 18, color: colors.warning }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Cross-phase Risks</Typography>
            </Box>
            {o.orchestrator.crossPhaseRisks.map((risk) => (
              <Typography key={risk} sx={{ fontSize: '0.68rem', color: colors.text.secondary, lineHeight: 1.5, mb: 0.5 }}>• {risk}</Typography>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }} glow="purple">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <LightbulbIcon sx={{ fontSize: 18, color: colors.secondary }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Key Recommendations</Typography>
            </Box>
            {o.orchestrator.keyRecommendations.map((rec) => (
              <Typography key={rec} sx={{ fontSize: '0.68rem', color: colors.secondary, lineHeight: 1.5, mb: 0.5 }}>→ {rec}</Typography>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }} glow="blue">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <InsightsIcon sx={{ fontSize: 18, color: colors.primary }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Advisor Insights</Typography>
            </Box>
            {o.advisorInsights.map((ins) => (
              <Box key={ins.id} sx={{ display: 'flex', gap: 0.6, py: 0.4, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ADVISOR_COLOR[ins.severity], mt: 0.5, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.66rem', color: colors.text.secondary, lineHeight: 1.45 }}>{ins.text}</Typography>
              </Box>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      {/* Suggested stakeholders */}
      <GlassCard sx={{ p: 1.5, mt: 1.5 }} hover={false}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
          <GroupsIcon sx={{ fontSize: 16, color: colors.info }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.text.muted }}>
            Suggested Stakeholders
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {o.orchestrator.suggestedStakeholders.map((s) => (
            <Chip key={s} label={s} size="small" sx={{ fontSize: '0.62rem', bgcolor: `${colors.info}1f`, color: colors.info, border: `1px solid ${colors.border.subtle}` }} />
          ))}
        </Box>
      </GlassCard>

      {/* Executive summary */}
      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="AI SDLC Orchestrator · Executive Summary" insight={o.orchestrator.executiveSummary} />
      </Box>

      {/* Prompt-specific generated artifacts */}
      <ArtifactRepositoryPanel
        artifacts={artifacts}
        title="Generated Artifacts"
        subtitle={`${o.scenario.label} · ${o.orchestrator.artifactCount} prompt-specific artifacts · run ${o.runId}`}
      />
    </Box>
  );
}
