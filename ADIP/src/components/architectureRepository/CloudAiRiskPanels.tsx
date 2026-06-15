import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useArchitectureRepository } from '../../context/ArchitectureRepositoryContext';
import { colors } from '../../theme/colors';

export function CloudArchitecturePanel() {
  const { cloudAdoption, cloudServices, kpis } = useArchitectureRepository();
  const approved = cloudServices.filter((c) => c.approved).length;

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Cloud Architecture" subtitle={`Cloud readiness: ${kpis.cloudReadiness}% · ${approved}/${cloudServices.length} approved services`} />
        <HorizontalBarChart chartId="architecture-repository.cloud-readiness" data={cloudAdoption} height={200} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Cloud Service Catalog" subtitle="50 cloud services" />
        {cloudServices.slice(0, 15).map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.name} <span style={{ color: colors.text.muted }}>({c.provider})</span></Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {c.category} · Adoption: {c.adoptionLevel}% · {c.approved ? 'Approved' : 'Not approved'}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AiArchitecturePanel() {
  const { applications, kpis } = useArchitectureRepository();
  const aiReady = [...applications].sort((a, b) => b.aiReadiness - a.aiReadiness).slice(0, 15);

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="AI Architecture" subtitle={`AI readiness: ${kpis.aiReadiness}% · responsible-AI aligned`} />
        <HorizontalBarChart
          chartId="architecture-repository.ai-readiness"
          data={aiReady.map((a) => ({ name: a.name.slice(0, 22), value: a.aiReadiness }))}
          height={220}
          barColor={colors.secondary}
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="AI-Ready Solutions" subtitle="Aligned to REF-05 / REF-08 AI references" />
        {aiReady.map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {a.domain} · AI readiness: {a.aiReadiness}% · Cloud: {a.cloudReadiness}% · Compliance: {a.complianceState}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ArchitectureRisksPanel() {
  const { intRisks, modernization, kpis } = useArchitectureRepository();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Architecture Risks" subtitle={`Architecture risk: ${kpis.architectureRisk}/100 · integration & violation hotspots`} />
        {intRisks.map((i) => (
          <Box key={i.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{i.id} — {i.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Pattern: {i.pattern} · {i.complianceState} · Risk: {i.riskLevel}
            </Typography>
          </Box>
        ))}
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Modernization Candidates" subtitle="Remediation roadmap" />
        {modernization.map((d) => (
          <Box key={d.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.appName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {d.title} · {d.category} · Severity: {d.severity} · {d.effortDays} days · {d.remediationStatus}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
