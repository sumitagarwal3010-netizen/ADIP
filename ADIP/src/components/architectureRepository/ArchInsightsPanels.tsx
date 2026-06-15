import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { useArchitectureRepository } from '../../context/ArchitectureRepositoryContext';
import { colors } from '../../theme/colors';

const CAPABILITY_LABELS: Record<string, string> = {
  compliance: 'Architecture Compliance Advisor',
  'reference-architecture': 'Reference Architecture Advisor',
  obsolescence: 'Technology Obsolescence Advisor',
  'cloud-migration': 'Cloud Migration Advisor',
  'ai-architecture': 'AI Architecture Advisor',
  'architecture-debt': 'Architecture Debt Advisor',
  'security-architecture': 'Security Architecture Advisor',
  'integration-risk': 'Integration Risk Advisor',
  modernization: 'Modernization Recommendation Engine',
  rationalization: 'Architecture Rationalization Advisor',
};

export function ExecutiveArchInsightsPanel() {
  const { aiInsights, hubIntegrations, execSummary } = useArchitectureRepository();

  return (
    <Box>
      <AIInsightBox title="Enterprise Architecture — Executive Summary" insight={execSummary} />
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Architecture Advisors" subtitle="Rule-based recommendations — no LLM required" />
        {aiInsights.map((insight) => (
          <Box key={insight.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 1, bgcolor: `${colors.primary}08`, border: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>
              {CAPABILITY_LABELS[insight.capability] ?? insight.title}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.5 }}>{insight.recommendation}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
              Confidence: {insight.confidence}% · Impact: {insight.impact}
            </Typography>
          </Box>
        ))}
      </GlassCard>
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Platform Integration" subtitle="Connected ADIP hubs" />
        {hubIntegrations.map((link) => (
          <Box key={link.hub} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Link to={link.path} style={{ textDecoration: 'none' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{link.hub}</Typography>
            </Link>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>{link.description}</Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ArchTraceabilityPanel() {
  const { traceabilityChains } = useArchitectureRepository();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Capability-to-Value Traceability" subtitle="Business Capability → Demand → Portfolio → Program → Project → Architecture → Application → Release → Production → Incident → Value" />
      {traceabilityChains.map((c) => (
        <Box key={c.stage} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: `${colors.secondary}08`, border: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.8 }}>
            <strong>{c.stage}</strong> · {c.entity} → <strong>{c.link}</strong> → <em>{c.outcome}</em>
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
