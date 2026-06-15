import { useState } from 'react';
import { Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import StorageIcon from '@mui/icons-material/Storage';
import GroupsIcon from '@mui/icons-material/Groups';
import HubIcon from '@mui/icons-material/Hub';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutivePortfolioDashboardPanel } from '../components/portfolioGovernance/ExecutivePortfolioDashboardPanel';
import { DemandPipelinePanel, BusinessCaseReviewPanel, InvestmentGovernancePanel } from '../components/portfolioGovernance/DemandInvestmentPanels';
import { CapacityPlanningPanel, ResourceAllocationPanel } from '../components/portfolioGovernance/CapacityResourcePanels';
import { StrategicAlignmentPanel, RoadmapPlanningPanel } from '../components/portfolioGovernance/StrategyRoadmapPanels';
import { PortfolioRisksPanel, BenefitsTrackingPanel } from '../components/portfolioGovernance/RisksBenefitsPanels';
import { ExecutiveInsightsPanel, PortfolioTraceabilityPanel } from '../components/portfolioGovernance/AiInsightsPanels';
import { usePortfolioGovernance } from '../context/PortfolioGovernanceContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessPortfolioGovernance } from '../data/portfolioGovernanceEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'demand'
  | 'business-case'
  | 'investment'
  | 'capacity'
  | 'resources'
  | 'alignment'
  | 'roadmap'
  | 'risks'
  | 'benefits'
  | 'insights'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Portfolio Dashboard', icon: DashboardIcon },
  { key: 'demand', label: 'Demand Pipeline', icon: PlaylistAddIcon },
  { key: 'business-case', label: 'Business Case Review', icon: DescriptionIcon },
  { key: 'investment', label: 'Investment Governance', icon: GavelIcon },
  { key: 'capacity', label: 'Capacity Planning', icon: StorageIcon },
  { key: 'resources', label: 'Resource Allocation', icon: GroupsIcon },
  { key: 'alignment', label: 'Strategic Alignment', icon: HubIcon },
  { key: 'roadmap', label: 'Roadmap Planning', icon: TimelineIcon },
  { key: 'risks', label: 'Portfolio Risks', icon: WarningAmberIcon },
  { key: 'benefits', label: 'Benefits Tracking', icon: TrendingUpIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface PortfolioGovernanceCenterProps {
  initialTab?: TabKey;
}

export function PortfolioGovernanceCenter({ initialTab = 'dashboard' }: PortfolioGovernanceCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = usePortfolioGovernance();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessPortfolioGovernance(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <GavelIcon sx={{ color: colors.warning, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Portfolio, Demand & Investment Governance Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Idea → Demand → Funding → Portfolio → SDLC → Production → Value Realization
          </Box>
        </Box>
      </GlassCard>

      <GlassCard sx={{ p: 1, mb: 1.5 }} hover={false}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {TABS.map((t) => {
            const active = t.key === tab;
            const Icon = t.icon;
            return (
              <Box
                key={t.key}
                role="button"
                tabIndex={0}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(t.key); } }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.7, borderRadius: 1.5, cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                  color: active ? colors.text.primary : colors.text.secondary,
                  bgcolor: active ? `${colors.warning}1f` : 'transparent',
                  border: `1px solid ${active ? colors.warning : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.warning}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.warning : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <ExecutivePortfolioDashboardPanel />}
      {tab === 'demand' && <DemandPipelinePanel />}
      {tab === 'business-case' && <BusinessCaseReviewPanel />}
      {tab === 'investment' && <InvestmentGovernancePanel />}
      {tab === 'capacity' && <CapacityPlanningPanel />}
      {tab === 'resources' && <ResourceAllocationPanel />}
      {tab === 'alignment' && <StrategicAlignmentPanel />}
      {tab === 'roadmap' && <RoadmapPlanningPanel />}
      {tab === 'risks' && <PortfolioRisksPanel />}
      {tab === 'benefits' && <BenefitsTrackingPanel />}
      {tab === 'insights' && <ExecutiveInsightsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="portfolio-governance" />}

      {(tab === 'dashboard' || tab === 'investment') && (
        <Box sx={{ mt: 1.5 }}>
          <PortfolioTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Portfolio Governance — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
