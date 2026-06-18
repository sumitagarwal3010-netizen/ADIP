import { useState } from 'react';
import { Box } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import AppsIcon from '@mui/icons-material/Apps';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BuildIcon from '@mui/icons-material/Build';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { AIWorkspacePanel } from '../components/workflow/AIWorkspacePanel';
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

/**
 * Executive-Semantic Rationalization (June 2026)
 *
 * Enterprise Architecture is the authoritative repository — domains,
 * applications, standards, reference architectures, debt and architecture-level
 * risks. Governance workflows and cross-domain capabilities have been removed
 * from the strip (their panels and deep-link routes are intact):
 *
 *   - capabilities → Business Architecture / Strategy concern, not repository
 *   - review-board / findings / exceptions → Architecture Governance workflow,
 *                                            owned in Activity / Audit centers
 *   - lifecycle    → Technology Strategy concern
 *   - cloud        → Technology Strategy concern
 *   - ai           → AI Governance concern (benchmark — not duplicated here)
 *   - dashboard    → Executive Dashboard merged into Executive Insights
 *
 * Final tab count: 8.
 */
const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'domains', label: 'Architecture Domains', icon: HubIcon },
  { key: 'applications', label: 'Application Architecture', icon: AppsIcon },
  { key: 'standards', label: 'Standards Repository', icon: MenuBookIcon },
  { key: 'reference', label: 'Reference Architectures', icon: MenuBookIcon },
  { key: 'debt', label: 'Architecture Debt', icon: BuildIcon },
  { key: 'risks', label: 'Architecture Risks', icon: WarningAmberIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface ArchitectureRepositoryCenterProps {
  initialTab?: TabKey;
}

const TAB_STRIP_KEYS: ReadonlySet<TabKey> = new Set(TABS.map((t) => t.key));

export function ArchitectureRepositoryCenter({ initialTab = 'domains' }: ArchitectureRepositoryCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useArchitectureRepository();
  // If a deep link points at a tab that has been removed from the strip, land
  // on the canonical first tab so the strip and the body stay in sync.
  const [tab, setTab] = useState<TabKey>(TAB_STRIP_KEYS.has(initialTab) ? initialTab : 'domains');

  if (!canAccessArchitectureRepository(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <AIWorkspacePanel module="enterprise-architecture" number={1} />

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

      {tab === 'dashboard' && (
        <>
          <ExecutiveArchitectureDashboardPanel />
        </>
      )}
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
