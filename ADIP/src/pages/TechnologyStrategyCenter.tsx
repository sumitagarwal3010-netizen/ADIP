import { useState } from 'react';
import { Box } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimelineIcon from '@mui/icons-material/Timeline';
import MapIcon from '@mui/icons-material/AltRoute';
import HubIcon from '@mui/icons-material/Hub';
import CloudIcon from '@mui/icons-material/Cloud';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PaymentsIcon from '@mui/icons-material/Payments';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutiveTechnologyDashboardPanel } from '../components/technologyStrategy/ExecutiveTechnologyDashboardPanel';
import { TechnologyStandardsPanel, TechnologyLifecyclePanel, TechnologyRoadmapsPanel } from '../components/technologyStrategy/StandardsLifecyclePanels';
import { StrategicPlatformsPanel, CloudStrategyPanel, AiPlatformStrategyPanel, VendorLandscapePanel } from '../components/technologyStrategy/PlatformStrategyPanels';
import { TechnologyInvestmentsPanel, TechnologyRisksPanel, ModernizationWavesPanel } from '../components/technologyStrategy/InvestmentRiskPanels';
import { ExecutiveTechInsightsPanel, TechTraceabilityPanel } from '../components/technologyStrategy/TechInsightsPanels';
import { useTechnologyStrategy } from '../context/TechnologyStrategyContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessTechnologyStrategy } from '../data/technologyStrategyEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'standards'
  | 'lifecycle'
  | 'roadmaps'
  | 'strategic-platforms'
  | 'cloud'
  | 'ai-platform'
  | 'vendors'
  | 'investments'
  | 'risks'
  | 'modernization'
  | 'insights'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Executive Dashboard', icon: DashboardIcon },
  { key: 'standards', label: 'Technology Standards', icon: MenuBookIcon },
  { key: 'lifecycle', label: 'Technology Lifecycle', icon: TimelineIcon },
  { key: 'roadmaps', label: 'Technology Roadmaps', icon: MapIcon },
  { key: 'strategic-platforms', label: 'Strategic Platforms', icon: HubIcon },
  { key: 'cloud', label: 'Cloud Strategy', icon: CloudIcon },
  { key: 'ai-platform', label: 'AI Platform Strategy', icon: SmartToyIcon },
  { key: 'vendors', label: 'Vendor Landscape', icon: StorefrontIcon },
  { key: 'investments', label: 'Technology Investments', icon: PaymentsIcon },
  { key: 'risks', label: 'Technology Risks', icon: WarningAmberIcon },
  { key: 'modernization', label: 'Modernization Waves', icon: UpgradeIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface TechnologyStrategyCenterProps {
  initialTab?: TabKey;
}

export function TechnologyStrategyCenter({ initialTab = 'dashboard' }: TechnologyStrategyCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useTechnologyStrategy();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessTechnologyStrategy(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <RocketLaunchIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Technology Strategy, Standards & Roadmap Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Executive technology planning layer — standards, lifecycle, platforms, cloud, AI, vendors, investments, and modernization
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
                  bgcolor: active ? `${colors.primary}1f` : 'transparent',
                  border: `1px solid ${active ? colors.primary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.primary}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.primary : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <ExecutiveTechnologyDashboardPanel />}
      {tab === 'standards' && <TechnologyStandardsPanel />}
      {tab === 'lifecycle' && <TechnologyLifecyclePanel />}
      {tab === 'roadmaps' && <TechnologyRoadmapsPanel />}
      {tab === 'strategic-platforms' && <StrategicPlatformsPanel />}
      {tab === 'cloud' && <CloudStrategyPanel />}
      {tab === 'ai-platform' && <AiPlatformStrategyPanel />}
      {tab === 'vendors' && <VendorLandscapePanel />}
      {tab === 'investments' && <TechnologyInvestmentsPanel />}
      {tab === 'risks' && <TechnologyRisksPanel />}
      {tab === 'modernization' && <ModernizationWavesPanel />}
      {tab === 'insights' && <ExecutiveTechInsightsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="technology-strategy" />}

      {(tab === 'dashboard' || tab === 'roadmaps') && (
        <Box sx={{ mt: 1.5 }}>
          <TechTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Technology Strategy — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
