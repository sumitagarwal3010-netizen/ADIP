import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTransformationPmo } from '../../context/TransformationPmoContext';
import { colors } from '../../theme/colors';

export function TransformationProgramsPanel() {
  const { progByStatus, topProgs, atRiskProgs, kpis } = useTransformationPmo();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Transformation Programs" subtitle={`50 programs · delivery ${kpis.programDelivery}% · health ${kpis.transformationHealth}%`} />
        <HorizontalBarChart chartId="transformation-pmo.program-delivery" data={progByStatus} height={180} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="At-Risk Programs" subtitle="Requiring recovery action" />
        {atRiskProgs.map((p) => (
          <Box key={p.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.id} — {p.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {p.businessUnit} · {p.status} · Health: {p.health}% · Completion: {p.completion}% · Risk: {p.riskLevel} · Sponsor: {p.sponsor}
            </Typography>
          </Box>
        ))}
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Program Register" subtitle="By budget" />
        {topProgs.map((p) => (
          <Box key={p.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.id} — {p.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {p.businessUnit} · {p.status} · ₹{Math.round(p.budget / 1_000_000)}M budget · ₹{Math.round(p.benefitRealized / 1_000_000)}M/{Math.round(p.benefitTarget / 1_000_000)}M benefit · {p.targetYear}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function StrategicInitiativesPanel() {
  const { topInits, initiatives } = useTransformationPmo();
  const inFlight = initiatives.filter((i) => i.status === 'in-flight').length;
  const delivered = initiatives.filter((i) => i.status === 'delivered').length;

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Strategic Initiatives" subtitle={`200 initiatives · ${inFlight} in-flight · ${delivered} delivered`} />
      {topInits.map((i) => (
        <Box key={i.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>P{i.priority} · {i.id} — {i.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {i.businessUnit} · {i.status} · Completion: {i.completion}% · Benefit: ₹{Math.round(i.expectedBenefit / 1_000_000)}M · Owner: {i.owner}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function ObjectivesOkrsPanel() {
  const { objSummary, objectives, kpis } = useTransformationPmo();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Objectives & OKRs" subtitle={`Objective achievement ${kpis.objectiveAchievement}%`} />
        <HorizontalBarChart chartId="transformation-pmo.objective-achievement" data={objSummary} height={240} barColor={colors.secondary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Strategic Objective Register" />
        {objectives.map((o) => (
          <Box key={o.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{o.id} — {o.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {o.pillar} · Achievement: {o.achievement}% · Key results: {o.keyResultsMet}/{o.keyResults} · Target: {o.targetYear} · Owner: {o.owner}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
