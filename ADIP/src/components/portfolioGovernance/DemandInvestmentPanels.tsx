import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { FunnelChart } from '../charts/FunnelChart';
import { EnterpriseBarChart } from '../charts/EnterpriseBarChart';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import { colors } from '../../theme/colors';

export function DemandPipelinePanel() {
  const { demands, demandPipeline, topDemands } = usePortfolioGovernance();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Demand Intake Pipeline" subtitle={`${demands.length} demand requests across 5 business units`} />
        <FunnelChart chartId="portfolio-governance.demand-backlog" data={demandPipeline} height={240} barColor={colors.secondary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Top Prioritized Demands" subtitle="Demand Prioritization Copilot ranking" />
        {topDemands.map((d) => (
          <Box key={d.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.id} — {d.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Score: {d.score} · Alignment: {d.alignment}% · Cost: ₹{(d.cost / 1_000_000).toFixed(2)}M · {d.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function BusinessCaseReviewPanel() {
  const { demands, fundingRequests } = usePortfolioGovernance();
  const inReview = demands.filter((d) => d.status === 'business-case' || d.status === 'under-review').slice(0, 15);

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Business Case Review Queue" subtitle="Demands awaiting business case validation" />
      {inReview.map((d) => {
        const funding = fundingRequests.find((f) => f.demandId === d.id);
        return (
          <Box key={d.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Benefit forecast: ₹{(d.benefitForecast / 1_000_000).toFixed(2)}M · Cost: ₹{(d.estimatedCost / 1_000_000).toFixed(2)}M ·
              ROI potential: {Math.round((d.benefitForecast / d.estimatedCost) * 100)}% ·
              {funding ? ` Funding: ${funding.status}` : ' No funding request yet'}
            </Typography>
          </Box>
        );
      })}
    </GlassCard>
  );
}

export function InvestmentGovernancePanel() {
  const { fundingRequests, fundingByPortfolio, kpis } = usePortfolioGovernance();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Investment Governance" subtitle={`Funding utilization: ${kpis.fundingUtilization}%`} />
        <EnterpriseBarChart
          chartId="portfolio-governance.funding-utilization"
          data={fundingByPortfolio}
          height={240}
          barColor={colors.primary}
          defaultTarget={80}
          dynamicScale
          highlightOutliers
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Recent Funding Decisions" />
        {fundingRequests.slice(0, 15).map((f) => (
          <Box key={f.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{f.id} — {f.status}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Requested: ₹{(f.amount / 1_000_000).toFixed(2)}M · Approved: ₹{(f.approvedAmount / 1_000_000).toFixed(2)}M · {f.fiscalYear} · {f.approver}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
