import { useState } from 'react';
import { Box } from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import MemoryIcon from '@mui/icons-material/Memory';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BuildIcon from '@mui/icons-material/Build';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CloudIcon from '@mui/icons-material/Cloud';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HubIcon from '@mui/icons-material/Hub';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutiveApmDashboardPanel } from '../components/applicationPortfolio/ExecutiveApmDashboardPanel';
import { ApplicationInventoryPanel, TechnologyHealthPanel, BusinessCriticalityPanel } from '../components/applicationPortfolio/InventoryTechnologyPanels';
import { TechnicalDebtPanel, ModernizationPanel, CloudReadinessPanel, AiReadinessPanel } from '../components/applicationPortfolio/DebtModernizationPanels';
import { ApplicationRisksPanel, DependencyMappingPanel, LifecyclePlanningPanel, ApplicationRationalizationPanel } from '../components/applicationPortfolio/RiskLifecyclePanels';
import { ExecutiveApmInsightsPanel, ApmTraceabilityPanel } from '../components/applicationPortfolio/ApmInsightsPanels';
import { useApplicationPortfolio } from '../context/ApplicationPortfolioContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessApplicationPortfolio } from '../data/applicationPortfolioEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'inventory'
  | 'technology-health'
  | 'criticality'
  | 'technical-debt'
  | 'modernization'
  | 'cloud'
  | 'ai-readiness'
  | 'risks'
  | 'dependencies'
  | 'lifecycle'
  | 'rationalization'
  | 'insights'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Executive Dashboard', icon: DashboardIcon },
  { key: 'inventory', label: 'Application Inventory', icon: InventoryIcon },
  { key: 'technology-health', label: 'Technology Health', icon: MemoryIcon },
  { key: 'criticality', label: 'Business Criticality', icon: PriorityHighIcon },
  { key: 'technical-debt', label: 'Technical Debt', icon: BuildIcon },
  { key: 'modernization', label: 'Modernization', icon: RocketLaunchIcon },
  { key: 'cloud', label: 'Cloud Readiness', icon: CloudIcon },
  { key: 'ai-readiness', label: 'AI Readiness', icon: SmartToyIcon },
  { key: 'risks', label: 'Application Risks', icon: WarningAmberIcon },
  { key: 'dependencies', label: 'Dependency Mapping', icon: HubIcon },
  { key: 'lifecycle', label: 'Lifecycle Planning', icon: TimelineIcon },
  { key: 'rationalization', label: 'Rationalization', icon: CompareArrowsIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface ApplicationPortfolioCenterProps {
  initialTab?: TabKey;
}

export function ApplicationPortfolioCenter({ initialTab = 'dashboard' }: ApplicationPortfolioCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useApplicationPortfolio();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessApplicationPortfolio(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <AppsIcon sx={{ color: colors.info, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Application Portfolio Management Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            CIO-level application system of record — inventory, health, debt, cloud, AI readiness, and rationalization
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
                  bgcolor: active ? `${colors.info}1f` : 'transparent',
                  border: `1px solid ${active ? colors.info : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.info}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.info : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <ExecutiveApmDashboardPanel />}
      {tab === 'inventory' && <ApplicationInventoryPanel />}
      {tab === 'technology-health' && <TechnologyHealthPanel />}
      {tab === 'criticality' && <BusinessCriticalityPanel />}
      {tab === 'technical-debt' && <TechnicalDebtPanel />}
      {tab === 'modernization' && <ModernizationPanel />}
      {tab === 'cloud' && <CloudReadinessPanel />}
      {tab === 'ai-readiness' && <AiReadinessPanel />}
      {tab === 'risks' && <ApplicationRisksPanel />}
      {tab === 'dependencies' && <DependencyMappingPanel />}
      {tab === 'lifecycle' && <LifecyclePlanningPanel />}
      {tab === 'rationalization' && <ApplicationRationalizationPanel />}
      {tab === 'insights' && <ExecutiveApmInsightsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="application-portfolio" />}

      {(tab === 'dashboard' || tab === 'inventory') && (
        <Box sx={{ mt: 1.5 }}>
          <ApmTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Application Portfolio — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
