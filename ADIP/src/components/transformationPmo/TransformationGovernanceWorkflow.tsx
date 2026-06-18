/**
 * Transformation Governance Workflow.
 *
 * Renders the fixed transformation governance pipeline and shows the generated
 * artifacts moving through it:
 *   Idea → Analysis → Business Case → Funding Review → Steering Committee →
 *   Approval → Execution → Benefits Tracking
 *
 * Artifacts are mapped onto stages by their stable id suffix (see
 * transformationArtifactFactory). Reuses GlassCard / ModuleHeader / theme.
 */
import { Box, Chip, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import type { Artifact } from '../../types/artifacts';

interface Stage {
  key: string;
  label: string;
  /** Artifact id suffixes that land in this stage. */
  suffixes: string[];
}

const STAGES: Stage[] = [
  { key: 'idea', label: 'Idea', suffixes: [] },
  { key: 'analysis', label: 'Analysis', suffixes: ['dependency', 'risk'] },
  { key: 'business-case', label: 'Business Case', suffixes: ['charter', 'business-case'] },
  { key: 'funding-review', label: 'Funding Review', suffixes: ['roi', 'investment'] },
  { key: 'steering', label: 'Steering Committee', suffixes: ['steering'] },
  { key: 'approval', label: 'Approval', suffixes: [] },
  { key: 'execution', label: 'Execution', suffixes: ['roadmap', 'benefits-plan'] },
  { key: 'benefits-tracking', label: 'Benefits Tracking', suffixes: ['kpi-matrix'] },
];

function artifactsForStage(artifacts: Artifact[], stage: Stage): Artifact[] {
  if (stage.suffixes.length === 0) return [];
  return artifacts.filter((a) => stage.suffixes.some((s) => a.id.endsWith(`-${s}`)));
}

interface TransformationGovernanceWorkflowProps {
  artifacts: Artifact[];
  /** Initiative text shown as the seed of the Idea stage. */
  initiative?: string;
}

export function TransformationGovernanceWorkflow({ artifacts, initiative }: TransformationGovernanceWorkflowProps) {
  const generated = artifacts.length > 0;
  // The pipeline is "live" up to Steering Committee once artifacts exist; the
  // later stages are routed via the approval workflow.
  const activeUntil = generated ? STAGES.findIndex((s) => s.key === 'approval') : 0;

  return (
    <Box sx={{ mt: 1.5 }}>
      <GlassCard sx={{ p: 2 }} glow="green">
        <ModuleHeader
          title="Transformation Governance Workflow"
          subtitle="Generated artifacts routed through the transformation governance lifecycle"
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'stretch', mt: 0.5 }}>
          {STAGES.map((stage, idx) => {
            const stageArtifacts = artifactsForStage(artifacts, stage);
            const active = generated && idx <= activeUntil;
            const isLast = idx === STAGES.length - 1;
            return (
              <Box key={stage.key} sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Box
                  sx={{
                    minWidth: 150,
                    maxWidth: 200,
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: active ? `${colors.success}14` : colors.bg.glass,
                    border: `1px solid ${active ? colors.success : colors.border.subtle}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    {active && <CheckCircleIcon sx={{ fontSize: 13, color: colors.success }} />}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        color: active ? colors.text.primary : colors.text.muted,
                      }}
                    >
                      {stage.label}
                    </Typography>
                  </Box>

                  {stage.key === 'idea' && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.secondary, display: 'block', lineHeight: 1.3 }}>
                      {initiative?.trim() || 'Transformation initiative intake'}
                    </Typography>
                  )}

                  {stage.key === 'approval' && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.secondary, display: 'block', lineHeight: 1.3 }}>
                      {generated ? 'Routed to approval workflow' : 'Pending generation'}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mt: stageArtifacts.length ? 0.5 : 0 }}>
                    {stageArtifacts.map((a) => (
                      <Chip
                        key={a.id}
                        label={a.name.replace(/\.(docx|xlsx|yaml|png)$/, '')}
                        size="small"
                        sx={{
                          height: 'auto',
                          py: 0.3,
                          fontSize: '0.55rem',
                          justifyContent: 'flex-start',
                          bgcolor: `${colors.primary}14`,
                          border: `1px solid ${colors.primary}44`,
                          color: colors.text.primary,
                          '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', lineHeight: 1.25, px: 0.5 },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {!isLast && (
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 0.25 }}>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: active ? colors.success : colors.border.glow }} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {!generated && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: colors.text.muted, fontSize: '0.68rem' }}>
            Generate transformation artifacts to populate the governance pipeline.
          </Typography>
        )}
      </GlassCard>
    </Box>
  );
}
