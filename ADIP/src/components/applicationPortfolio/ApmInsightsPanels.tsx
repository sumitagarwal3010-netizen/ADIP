import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { useApplicationPortfolio } from '../../context/ApplicationPortfolioContext';
import { colors } from '../../theme/colors';

const CAPABILITY_LABELS: Record<string, string> = {
  rationalization: 'Application Rationalization Advisor',
  'duplicate-capability': 'Duplicate Capability Detection',
  obsolescence: 'Technology Obsolescence Advisor',
  'cloud-migration': 'Cloud Migration Advisor',
  'ai-readiness': 'AI Readiness Advisor',
  'debt-prioritization': 'Technical Debt Prioritization',
  'risk-hotspot': 'Risk Hotspot Detection',
  'cost-optimization': 'Cost Optimization Advisor',
  retirement: 'Application Retirement Recommendation',
  modernization: 'Modernization Recommendation Engine',
};

export function ExecutiveApmInsightsPanel() {
  const { aiInsights, hubIntegrations, execSummary } = useApplicationPortfolio();

  return (
    <Box>
      <AIInsightBox title="Application Portfolio — Executive Summary" insight={execSummary} />
      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Application Portfolio Advisors" subtitle="Rule-based recommendations" />
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
        <ModuleHeader title="Platform Integration" />
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

export function ApmTraceabilityPanel() {
  const { traceabilityChains } = useApplicationPortfolio();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Application Traceability" subtitle="Application → Demand → Project → Workflow → Approval → Release → Production → Incident → Value" />
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
