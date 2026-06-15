import { useState } from 'react';
import { Box } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FlagIcon from '@mui/icons-material/Flag';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HandshakeIcon from '@mui/icons-material/Handshake';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BusinessIcon from '@mui/icons-material/Business';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutiveTransformationDashboardPanel } from '../components/transformationPmo/ExecutiveTransformationDashboardPanel';
import { TransformationProgramsPanel, StrategicInitiativesPanel, ObjectivesOkrsPanel } from '../components/transformationPmo/ProgramInitiativePanels';
import { MilestonesPanel, BenefitsTrackingPanel, ExecutiveCommitmentsPanel } from '../components/transformationPmo/MilestonesBenefitsPanels';
import { CrossProgramDependenciesPanel, TransformationRisksPanel, BusinessUnitPerformancePanel } from '../components/transformationPmo/DependencyRiskPanels';
import { ExecutiveTransformationInsightsPanel, TransformationTraceabilityPanel } from '../components/transformationPmo/TransformationInsightsPanels';
import { useTransformationPmo } from '../context/TransformationPmoContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessTransformationPmo } from '../data/transformationPmoEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'programs'
  | 'initiatives'
  | 'objectives'
  | 'milestones'
  | 'benefits'
  | 'commitments'
  | 'dependencies'
  | 'risks'
  | 'business-units'
  | 'insights'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Executive Dashboard', icon: DashboardIcon },
  { key: 'programs', label: 'Transformation Programs', icon: AccountTreeIcon },
  { key: 'initiatives', label: 'Strategic Initiatives', icon: RocketLaunchIcon },
  { key: 'objectives', label: 'Objectives & OKRs', icon: FlagIcon },
  { key: 'milestones', label: 'Milestones', icon: EmojiEventsIcon },
  { key: 'benefits', label: 'Benefits Tracking', icon: TrendingUpIcon },
  { key: 'commitments', label: 'Executive Commitments', icon: HandshakeIcon },
  { key: 'dependencies', label: 'Cross-Program Dependencies', icon: DeviceHubIcon },
  { key: 'risks', label: 'Transformation Risks', icon: WarningAmberIcon },
  { key: 'business-units', label: 'Business Unit Performance', icon: BusinessIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface TransformationPmoCenterProps {
  initialTab?: TabKey;
}

export function TransformationPmoCenter({ initialTab = 'dashboard' }: TransformationPmoCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useTransformationPmo();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessTransformationPmo(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <HubIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Enterprise Transformation PMO Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Executive oversight across programs, initiatives, objectives, benefits, commitments, dependencies, and board reporting
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

      {tab === 'dashboard' && <ExecutiveTransformationDashboardPanel />}
      {tab === 'programs' && <TransformationProgramsPanel />}
      {tab === 'initiatives' && <StrategicInitiativesPanel />}
      {tab === 'objectives' && <ObjectivesOkrsPanel />}
      {tab === 'milestones' && <MilestonesPanel />}
      {tab === 'benefits' && <BenefitsTrackingPanel />}
      {tab === 'commitments' && <ExecutiveCommitmentsPanel />}
      {tab === 'dependencies' && <CrossProgramDependenciesPanel />}
      {tab === 'risks' && <TransformationRisksPanel />}
      {tab === 'business-units' && <BusinessUnitPerformancePanel />}
      {tab === 'insights' && <ExecutiveTransformationInsightsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="transformation-pmo" />}

      {(tab === 'dashboard' || tab === 'programs') && (
        <Box sx={{ mt: 1.5 }}>
          <TransformationTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Transformation PMO — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
