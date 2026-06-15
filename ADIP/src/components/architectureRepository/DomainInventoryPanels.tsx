import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useArchitectureRepository } from '../../context/ArchitectureRepositoryContext';
import { colors } from '../../theme/colors';

const DOMAIN_LABELS = [
  'Business Architecture', 'Application Architecture', 'Data Architecture', 'Integration Architecture',
  'Technology Architecture', 'Security Architecture', 'Cloud Architecture', 'Infrastructure Architecture',
  'AI Architecture', 'Reference Architectures',
];

export function ArchitectureDomainsPanel() {
  const { appsByDomain, capabilities, applications, integrations, apis, databases } = useArchitectureRepository();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Architecture Domains" subtitle="Applications mapped across 10 architecture domains" />
        <HorizontalBarChart chartId="architecture-repository.architecture-health" data={appsByDomain} height={220} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Domain Coverage" />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {DOMAIN_LABELS.map((d) => (
            <Box key={d} sx={{ px: 1.25, py: 0.5, borderRadius: 1, bgcolor: `${colors.info}12`, border: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>{d}</Typography>
            </Box>
          ))}
        </Box>
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Repository Inventory" />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {capabilities.length} business capabilities · {applications.length} applications · {integrations.length} integrations ·
          {' '}{apis.length} APIs · {databases.length} databases
        </Typography>
      </GlassCard>
    </Box>
  );
}

export function BusinessCapabilitiesPanel() {
  const { capabilities, capabilityAreas } = useArchitectureRepository();
  const topCaps = [...capabilities].sort((a, b) => b.architectureHealth - a.architectureHealth).slice(0, 15);

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Business Capability Map" subtitle={`${capabilities.length} capabilities across banking areas`} />
        <HorizontalBarChart chartId="architecture-repository.architecture-health" data={capabilityAreas} height={220} barColor={colors.secondary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Capability Health" />
        {topCaps.map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.id} — {c.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Maturity: {c.maturity}% · Architecture health: {c.architectureHealth}% · Apps: {c.applicationCount} · Criticality: {c.criticality}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ApplicationArchitecturePanel() {
  const { applications, appsByDomain } = useArchitectureRepository();
  const sample = applications.slice(0, 18);

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Application Architecture" subtitle={`${applications.length} applications by domain`} />
        <HorizontalBarChart chartId="architecture-repository.architecture-health" data={appsByDomain} height={200} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Application Architecture Register" />
        {sample.map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.id} — {a.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {a.domain} · {a.complianceState} · {a.lifecycle} · Standards: {a.standardsAdherence}% · Cloud: {a.cloudReadiness}% · AI: {a.aiReadiness}%
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
