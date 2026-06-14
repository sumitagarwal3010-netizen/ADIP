import { useState } from 'react';
import { Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpeedIcon from '@mui/icons-material/Speed';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VerifiedIcon from '@mui/icons-material/Verified';
import GavelIcon from '@mui/icons-material/Gavel';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutiveValueDashboardPanel } from '../components/valueRealization/ExecutiveValueDashboardPanel';
import {
  ProductivityAnalyticsPanel,
  DeliveryAccelerationPanel,
  QualityImprovementPanel,
  GovernanceEfficiencyPanel,
  AuditEfficiencyPanel,
  AiAdoptionImpactPanel,
} from '../components/valueRealization/AnalyticsPanels';
import { TransformationScorecardPanel, RoiCalculatorPanel } from '../components/valueRealization/ScorecardRoiPanels';
import { BusinessCaseGeneratorPanel, BenchmarkingPanel, ValueTraceabilityPanel } from '../components/valueRealization/BusinessCasePanels';
import { useValueRealization } from '../context/ValueRealizationContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessValueRealization } from '../data/valueRealizationEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'productivity'
  | 'delivery'
  | 'quality'
  | 'governance'
  | 'audit'
  | 'ai-adoption'
  | 'scorecard'
  | 'roi'
  | 'business-case'
  | 'benchmarking'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Executive Value', icon: DashboardIcon },
  { key: 'productivity', label: 'Productivity', icon: SpeedIcon },
  { key: 'delivery', label: 'Delivery Acceleration', icon: RocketLaunchIcon },
  { key: 'quality', label: 'Quality Improvement', icon: VerifiedIcon },
  { key: 'governance', label: 'Governance Efficiency', icon: GavelIcon },
  { key: 'audit', label: 'Audit Efficiency', icon: FactCheckIcon },
  { key: 'ai-adoption', label: 'AI Adoption', icon: SmartToyIcon },
  { key: 'scorecard', label: 'Transformation Scorecard', icon: ScoreboardIcon },
  { key: 'roi', label: 'ROI Calculator', icon: CalculateIcon },
  { key: 'business-case', label: 'Business Case', icon: DescriptionIcon },
  { key: 'benchmarking', label: 'Benchmarking', icon: CompareArrowsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface ValueRealizationCenterProps {
  initialTab?: TabKey;
}

export function ValueRealizationCenter({ initialTab = 'dashboard' }: ValueRealizationCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useValueRealization();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessValueRealization(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <TrendingUpIcon sx={{ color: colors.success, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Value Realization & Transformation Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Executive business case engine — ROI, productivity, risk reduction, and transformation value
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
                  bgcolor: active ? `${colors.success}1f` : 'transparent',
                  border: `1px solid ${active ? colors.success : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.success}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.success : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <ExecutiveValueDashboardPanel />}
      {tab === 'productivity' && <ProductivityAnalyticsPanel />}
      {tab === 'delivery' && <DeliveryAccelerationPanel />}
      {tab === 'quality' && <QualityImprovementPanel />}
      {tab === 'governance' && <GovernanceEfficiencyPanel />}
      {tab === 'audit' && <AuditEfficiencyPanel />}
      {tab === 'ai-adoption' && <AiAdoptionImpactPanel />}
      {tab === 'scorecard' && <TransformationScorecardPanel />}
      {tab === 'roi' && <RoiCalculatorPanel />}
      {tab === 'business-case' && <BusinessCaseGeneratorPanel />}
      {tab === 'benchmarking' && <BenchmarkingPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="value-realization" />}

      {(tab === 'dashboard' || tab === 'business-case') && (
        <Box sx={{ mt: 1.5 }}>
          <ValueTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Value Realization — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
