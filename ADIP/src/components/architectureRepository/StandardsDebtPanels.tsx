import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useArchitectureRepository } from '../../context/ArchitectureRepositoryContext';
import { colors } from '../../theme/colors';

export function StandardsRepositoryPanel() {
  const { standardsAdoption, standards, principles, kpis } = useArchitectureRepository();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Standards Repository" subtitle={`${standards.length} standards · ${kpis.standardsCompliance}% compliance`} />
        <HorizontalBarChart chartId="architecture-repository.standards-compliance" data={standardsAdoption} height={200} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Architecture Principles" />
        {principles.map((p) => (
          <Box key={p.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.name} <span style={{ color: colors.text.muted }}>({p.domain})</span></Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {p.statement} · Adherence: {p.adherence}%
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ReferenceArchitecturesPanel() {
  const { refAdoption, referenceArchitectures, kpis } = useArchitectureRepository();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Reference Architectures" subtitle={`Adoption: ${kpis.referenceAdoption}%`} />
        <HorizontalBarChart chartId="architecture-repository.reference-adoption" data={refAdoption} height={200} barColor={colors.success} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Reference Architecture Catalog" />
        {referenceArchitectures.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.domain} · Adoption: {r.adoptionRate}% · Applications aligned: {r.applicationsAligned}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ArchitectureDebtPanel() {
  const { topDebt, kpis } = useArchitectureRepository();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Architecture Debt" subtitle={`Avg effort: ${kpis.architectureDebt} days · 150 debt items · Modernization: ${kpis.modernizationProgress}%`} />
      {topDebt.map((d) => (
        <Box key={d.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.appName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {d.title} · {d.category} · {d.domain} · Severity: {d.severity} · {d.effortDays} days · {d.remediationStatus}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function TechnologyLifecyclePanel() {
  const { lifecycleDist, obsoletePlatformsList, kpis } = useArchitectureRepository();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Lifecycle" subtitle={`Obsolescence: ${kpis.technologyObsolescence}% · current → target → deprecated → retiring → EOS → EOL`} />
        <HorizontalBarChart chartId="architecture-repository.technology-obsolescence" data={lifecycleDist} height={200} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Obsolete & Unsupported Platforms" />
        {obsoletePlatformsList.map((p) => (
          <Box key={p.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {p.category} · Lifecycle: {p.lifecycle} · {p.applicationCount} apps · Obsolescence risk: {p.obsolescenceRisk}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
