import { useState } from 'react';
import { Box } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import CategoryIcon from '@mui/icons-material/Category';
import AppsIcon from '@mui/icons-material/Apps';
import GavelIcon from '@mui/icons-material/Gavel';
import RuleIcon from '@mui/icons-material/Rule';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BuildIcon from '@mui/icons-material/Build';
import TimelineIcon from '@mui/icons-material/Timeline';
import CloudIcon from '@mui/icons-material/Cloud';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutiveArchitectureDashboardPanel } from '../components/architectureRepository/ExecutiveArchitectureDashboardPanel';
import { ArchitectureDomainsPanel, BusinessCapabilitiesPanel, ApplicationArchitecturePanel } from '../components/architectureRepository/DomainInventoryPanels';
import { ReviewBoardPanel, ArchitectureFindingsPanel, ArchitectureExceptionsPanel } from '../components/architectureRepository/ReviewBoardPanels';
import { StandardsRepositoryPanel, ReferenceArchitecturesPanel, ArchitectureDebtPanel, TechnologyLifecyclePanel } from '../components/architectureRepository/StandardsDebtPanels';
import { CloudArchitecturePanel, AiArchitecturePanel, ArchitectureRisksPanel } from '../components/architectureRepository/CloudAiRiskPanels';
import { ExecutiveArchInsightsPanel, ArchTraceabilityPanel } from '../components/architectureRepository/ArchInsightsPanels';
import { useArchitectureRepository } from '../context/ArchitectureRepositoryContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessArchitectureRepository } from '../data/architectureRepositoryEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'domains'
  | 'capabilities'
  | 'applications'
  | 'review-board'
  | 'findings'
  | 'exceptions'
  | 'standards'
  | 'reference'
  | 'debt'
  | 'lifecycle'
  | 'cloud'
  | 'ai'
  | 'risks'
  | 'insights'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Executive Dashboard', icon: DashboardIcon },
  { key: 'domains', label: 'Architecture Domains', icon: HubIcon },
  { key: 'capabilities', label: 'Business Capabilities', icon: CategoryIcon },
  { key: 'applications', label: 'Application Architecture', icon: AppsIcon },
  { key: 'review-board', label: 'Review Board', icon: GavelIcon },
  { key: 'findings', label: 'Findings', icon: RuleIcon },
  { key: 'exceptions', label: 'Exceptions & Decisions', icon: RuleIcon },
  { key: 'standards', label: 'Standards Repository', icon: MenuBookIcon },
  { key: 'reference', label: 'Reference Architectures', icon: MenuBookIcon },
  { key: 'debt', label: 'Architecture Debt', icon: BuildIcon },
  { key: 'lifecycle', label: 'Technology Lifecycle', icon: TimelineIcon },
  { key: 'cloud', label: 'Cloud Architecture', icon: CloudIcon },
  { key: 'ai', label: 'AI Architecture', icon: SmartToyIcon },
  { key: 'risks', label: 'Architecture Risks', icon: WarningAmberIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface ArchitectureRepositoryCenterProps {
  initialTab?: TabKey;
}

export function ArchitectureRepositoryCenter({ initialTab = 'dashboard' }: ArchitectureRepositoryCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useArchitectureRepository();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessArchitectureRepository(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <AccountTreeIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Enterprise Architecture Repository & Governance Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Authoritative EA system of record — capabilities, standards, review board, debt, cloud, and AI architecture
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

      {tab === 'dashboard' && <ExecutiveArchitectureDashboardPanel />}
      {tab === 'domains' && <ArchitectureDomainsPanel />}
      {tab === 'capabilities' && <BusinessCapabilitiesPanel />}
      {tab === 'applications' && <ApplicationArchitecturePanel />}
      {tab === 'review-board' && <ReviewBoardPanel />}
      {tab === 'findings' && <ArchitectureFindingsPanel />}
      {tab === 'exceptions' && <ArchitectureExceptionsPanel />}
      {tab === 'standards' && <StandardsRepositoryPanel />}
      {tab === 'reference' && <ReferenceArchitecturesPanel />}
      {tab === 'debt' && <ArchitectureDebtPanel />}
      {tab === 'lifecycle' && <TechnologyLifecyclePanel />}
      {tab === 'cloud' && <CloudArchitecturePanel />}
      {tab === 'ai' && <AiArchitecturePanel />}
      {tab === 'risks' && <ArchitectureRisksPanel />}
      {tab === 'insights' && <ExecutiveArchInsightsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="architecture-repository" />}

      {(tab === 'dashboard' || tab === 'capabilities') && (
        <Box sx={{ mt: 1.5 }}>
          <ArchTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Enterprise Architecture — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
