import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useArchitectureRepository } from '../../context/ArchitectureRepositoryContext';
import { colors } from '../../theme/colors';

export function ReviewBoardPanel() {
  const { reviewQueueItems, reviews } = useArchitectureRepository();
  const approved = reviews.filter((r) => r.status === 'approved').length;
  const rejected = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Architecture Review Board" subtitle={`${reviewQueueItems.length} in queue · ${approved} approved · ${rejected} rejected`} />
        {reviewQueueItems.map((r) => (
          <Box key={r.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.domain} · {r.status} · Compliance: {r.complianceScore}% · By: {r.submittedBy} · Reviewer: {r.reviewer} · {r.submittedAt}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ArchitectureFindingsPanel() {
  const { findingsList, kpis } = useArchitectureRepository();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Architecture Findings" subtitle={`Architecture risk: ${kpis.architectureRisk}/100 · 100 findings tracked`} />
      {findingsList.map((f) => (
        <Box key={f.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{f.id} — {f.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {f.appName} · {f.domain} · Severity: {f.severity} · {f.status}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function ArchitectureExceptionsPanel() {
  const { exceptionsList, decisions, kpis } = useArchitectureRepository();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Exceptions, Waivers & Risk Acceptances" subtitle={`${kpis.architectureExceptions} active exceptions`} />
        {exceptionsList.map((e) => (
          <Box key={e.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{e.id} — {e.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {e.appName} · {e.status} · Risk: {e.riskLevel} · Approver: {e.approver} · Expires: {e.expiresAt}
            </Typography>
          </Box>
        ))}
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Architecture Decision Register" subtitle="Key architecture decisions (ADRs)" />
        {decisions.slice(0, 12).map((d) => (
          <Box key={d.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.id} — {d.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {d.domain} · {d.status} · {d.decision} · Rationale: {d.rationale}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
