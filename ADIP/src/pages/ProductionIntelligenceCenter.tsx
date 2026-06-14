import { useState } from 'react';
import { Box } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BugReportIcon from '@mui/icons-material/BugReport';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DescriptionIcon from '@mui/icons-material/Description';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ProductionDashboardPanel } from '../components/production/ProductionDashboardPanel';
import { IncidentAnalyticsPanel } from '../components/production/IncidentAnalyticsPanel';
import { DefectLeakagePanel } from '../components/production/DefectLeakagePanel';
import { CustomerExperiencePanel } from '../components/production/CustomerExperiencePanel';
import { ApplicationHealthPanel } from '../components/production/ApplicationHealthPanel';
import { ReleasePerformancePanel } from '../components/production/ReleasePerformancePanel';
import { RootCauseIntelligencePanel } from '../components/production/RootCauseIntelligencePanel';
import { FeedbackRecommendationsPanel } from '../components/production/FeedbackRecommendationsPanel';
import { useProductionIntelligence } from '../context/ProductionIntelligenceContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessProductionIntelligence } from '../data/productionIntelligenceEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'incidents'
  | 'leakage'
  | 'customer'
  | 'applications'
  | 'releases'
  | 'rca'
  | 'feedback'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Production Dashboard', icon: DashboardIcon },
  { key: 'incidents', label: 'Incident Analytics', icon: ReportProblemIcon },
  { key: 'leakage', label: 'Defect Leakage', icon: BugReportIcon },
  { key: 'customer', label: 'Customer Experience', icon: SentimentDissatisfiedIcon },
  { key: 'applications', label: 'Application Health', icon: MonitorHeartIcon },
  { key: 'releases', label: 'Release Performance', icon: RocketLaunchIcon },
  { key: 'rca', label: 'Root Cause Intelligence', icon: PsychologyIcon },
  { key: 'feedback', label: 'Feedback Recommendations', icon: FeedbackIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface ProductionIntelligenceCenterProps {
  initialTab?: TabKey;
}

export function ProductionIntelligenceCenter({ initialTab = 'dashboard' }: ProductionIntelligenceCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useProductionIntelligence();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessProductionIntelligence(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <CloudIcon sx={{ color: colors.critical, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Production Intelligence Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            What happened · why · which requirement · which release · what to improve next
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
                  bgcolor: active ? `${colors.critical}1f` : 'transparent',
                  border: `1px solid ${active ? colors.critical : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.critical}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.critical : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <ProductionDashboardPanel />}
      {tab === 'incidents' && <IncidentAnalyticsPanel />}
      {tab === 'leakage' && <DefectLeakagePanel />}
      {tab === 'customer' && <CustomerExperiencePanel />}
      {tab === 'applications' && <ApplicationHealthPanel />}
      {tab === 'releases' && <ReleasePerformancePanel />}
      {tab === 'rca' && <RootCauseIntelligencePanel />}
      {tab === 'feedback' && <FeedbackRecommendationsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="production-intelligence" />}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Production Intelligence — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
