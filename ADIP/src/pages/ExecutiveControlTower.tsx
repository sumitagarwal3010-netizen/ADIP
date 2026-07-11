import { Box, Grid, Typography, LinearProgress } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { colors } from '../theme/colors';
import { useNavigate } from 'react-router-dom';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { useWorkflow } from '../context/WorkflowContext';
import { useCopilot } from '../context/CopilotContext';
import { useValueRealization } from '../context/ValueRealizationContext';
import { useTechnologyStrategy } from '../context/TechnologyStrategyContext';
import { useEnterpriseRisk } from '../context/EnterpriseRiskContext';
import { computeAiGovernanceKpis } from '../data/aiUseCaseRegistryMock';
import { MODEL_INVENTORY, AI_RISKS, AI_CONTROLS, computeAIControlsKpis } from '../data/aiGovernanceModulesMock';
import { computeEvaluationScores } from '../data/aiEvaluationMock';
import { CioAdvisorCockpit } from '../components/executive/CioAdvisorCockpit';

export function ExecutiveControlTower() {
  const { dynamicInsights, aiGovernance } = useFilteredSimulation();
  const { workflows } = useWorkflow();
  const { kpis: copilotKpis } = useCopilot();
  const { kpis: valueKpis } = useValueRealization();
  const { kpis: techKpis } = useTechnologyStrategy();
  const { kpis: ermKpis } = useEnterpriseRisk();
  const navigate = useNavigate();

  // Varied CIO scorecard bars — realistic banking tech focus areas (not identical lengths).
  const strategicPriorities = [
    { label: 'UPI / Payments Stability', value: 78 },
    { label: 'Release Confidence', value: 64 },
    { label: 'Regulatory Posture', value: 91 },
    { label: 'Modernization Progress', value: 52 },
    { label: 'Investment Efficiency', value: 71 },
  ];
  const recentDecisions = workflows.slice(0, 6);

  // Enterprise AI Health — compact rollup from existing AI governance + evaluation data.
  const aiUseCaseKpis = computeAiGovernanceKpis(aiGovernance.useCases);
  const aiControlKpis = computeAIControlsKpis(AI_CONTROLS);
  const aiEvalScores = computeEvaluationScores();
  const aiOpenRisks = AI_RISKS.filter((r) => r.status === 'Open').length;
  const enterpriseAiHealth: { label: string; value: string; to: string; tone?: 'warn' }[] = [
    { label: 'AI Use Cases', value: `${aiUseCaseKpis.total}`, to: '/ai-governance-center' },
    { label: 'AI Models', value: `${MODEL_INVENTORY.length}`, to: '/ai-governance-center/models' },
    { label: 'AI Risks (open)', value: `${aiOpenRisks}`, to: '/ai-governance-center/risks', tone: aiOpenRisks > 4 ? 'warn' : undefined },
    { label: 'AI Controls', value: `${aiControlKpis.active}/${AI_CONTROLS.length}`, to: '/ai-governance-center/controls' },
    { label: 'AI Evaluation Score', value: `${aiEvalScores.quality}%`, to: '/ai-evaluation' },
  ];

  return (
    <Box>
      <CioAdvisorCockpit advisor="executive" defaultPromptId="cio-briefing" />
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Delivery Health" value={copilotKpis.deliveryHealth} suffix="%" trend={2.4} chartId="copilot.delivery-health" delay={0} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Technology Health" value={techKpis.technologyHealth} suffix="%" trend={1.8} chartId="technology-strategy.technology-health" delay={0.05} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Risk Posture" value={ermKpis.enterpriseRiskExposure} suffix="/100" trend={-3.1} chartId="enterprise-risk.enterprise-risk-exposure" delay={0.1} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Value Realized" value={`₹${(valueKpis.annualValueRealized / 1_000_000).toFixed(1)}M`} suffix="" trend={valueKpis.roi} chartId="value-realization.annual-value" delay={0.15} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <ModuleHeader title="Strategic Priorities" subtitle="Enterprise scorecard focus areas" />
            {strategicPriorities.map((p) => (
              <Box key={p.label} sx={{ mb: 1.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption">{p.label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.value}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={p.value}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': { bgcolor: p.value >= 90 ? colors.success : colors.primary },
                  }}
                />
              </Box>
            ))}
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }} glow="purple">
            <ModuleHeader title="Executive Insights" subtitle="Live · updates every 30s" />
            {dynamicInsights.map((insight) => (
              <Typography key={insight} variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mb: 1, lineHeight: 1.5 }}>
                • {insight}
              </Typography>
            ))}
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <ModuleHeader title="Recent Decisions" subtitle="Unified lifecycle gate outcomes" />
            {recentDecisions.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No recent decisions</Typography>
            ) : (
              recentDecisions.map((w) => (
                <Box key={w.id} sx={{ mb: 1, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{w.title}</Typography>
                    <SeverityChip severity={w.deliveryRisk} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {w.lifecycleStatus} · Audit: {w.auditStatus}
                  </Typography>
                </Box>
              ))
            )}
          </GlassCard>
        </Grid>
      </Grid>

      {/* Enterprise AI Health — compact executive summary (reuses AI governance + evaluation data) */}
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12 }}>
          <GlassCard sx={{ p: 2 }} glow="purple">
            <ModuleHeader title="Enterprise AI Health" subtitle="Use cases · models · risks · controls · evaluation" />
            <Grid container spacing={1.5}>
              {enterpriseAiHealth.map((item) => (
                <Grid key={item.label} size={{ xs: 6, md: 'grow' }}>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(item.to)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(item.to); } }}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: colors.bg.glass,
                      border: `1px solid ${item.tone === 'warn' ? `${colors.warning}55` : colors.border.subtle}`,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      '&:hover': { borderColor: colors.secondary, bgcolor: `${colors.secondary}10` },
                      '&:focus-visible': { outline: `2px solid ${colors.secondary}`, outlineOffset: 1 },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', color: item.tone === 'warn' ? colors.warning : colors.text.primary }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
