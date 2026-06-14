import { useState } from 'react';
import { Box } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { CopilotDashboardPanel } from '../components/copilot/CopilotDashboardPanel';
import { CopilotWorkspacePanel } from '../components/copilot/CopilotWorkspacePanel';
import { ProjectHealthPanel } from '../components/copilot/ProjectHealthPanel';
import { RequirementCopilotPanel } from '../components/copilot/RequirementCopilotPanel';
import { ArchitectureCopilotPanel, DevelopmentCopilotPanel, TestingCopilotPanel } from '../components/copilot/DomainCopilotPanels';
import { ReleaseCopilotPanel, AuditCopilotPanel } from '../components/copilot/ReleaseAuditCopilotPanels';
import { ExecutiveCopilotPanel, ImprovementAdvisorPanel } from '../components/copilot/ExecutiveCopilotPanel';
import { useCopilot } from '../context/CopilotContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessCopilot } from '../data/copilotEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'workspace'
  | 'health'
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'audit'
  | 'executive'
  | 'improvement'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Copilot Dashboard', icon: DashboardIcon },
  { key: 'workspace', label: 'Copilot Workspace', icon: WorkspacesIcon },
  { key: 'health', label: 'Project Health', icon: HealthAndSafetyIcon },
  { key: 'requirements', label: 'Requirements', icon: AssignmentIcon },
  { key: 'architecture', label: 'Architecture', icon: AccountTreeIcon },
  { key: 'development', label: 'Development', icon: CodeIcon },
  { key: 'testing', label: 'Testing', icon: ScienceIcon },
  { key: 'release', label: 'Release', icon: RocketLaunchIcon },
  { key: 'audit', label: 'Audit', icon: FactCheckIcon },
  { key: 'executive', label: 'Executive Copilot', icon: InsightsIcon },
  { key: 'improvement', label: 'Improvement Advisor', icon: TrendingUpIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface AiDeliveryCopilotCenterProps {
  initialTab?: TabKey;
}

export function AiDeliveryCopilotCenter({ initialTab = 'dashboard' }: AiDeliveryCopilotCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useCopilot();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessCopilot(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <SmartToyIcon sx={{ color: colors.secondary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Delivery Copilot</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>Rule-based insights actively helping teams deliver better software</Box>
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
                  bgcolor: active ? `${colors.secondary}1f` : 'transparent',
                  border: `1px solid ${active ? colors.secondary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.secondary}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.secondary : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <CopilotDashboardPanel />}
      {tab === 'workspace' && <CopilotWorkspacePanel />}
      {tab === 'health' && <ProjectHealthPanel />}
      {tab === 'requirements' && <RequirementCopilotPanel />}
      {tab === 'architecture' && <ArchitectureCopilotPanel />}
      {tab === 'development' && <DevelopmentCopilotPanel />}
      {tab === 'testing' && <TestingCopilotPanel />}
      {tab === 'release' && <ReleaseCopilotPanel />}
      {tab === 'audit' && <AuditCopilotPanel />}
      {tab === 'executive' && <ExecutiveCopilotPanel />}
      {tab === 'improvement' && <ImprovementAdvisorPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="ai-copilot" />}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="AI Delivery Copilot — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
