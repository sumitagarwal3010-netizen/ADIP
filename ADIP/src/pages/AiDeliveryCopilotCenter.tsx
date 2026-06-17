import { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { RequirementCopilotPanel } from '../components/copilot/RequirementCopilotPanel';
import { ArchitectureCopilotPanel, DevelopmentCopilotPanel, TestingCopilotPanel } from '../components/copilot/DomainCopilotPanels';
import { ReleaseCopilotPanel, AuditCopilotPanel } from '../components/copilot/ReleaseAuditCopilotPanels';
import { useCopilot } from '../context/CopilotContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessCopilot } from '../data/copilotEngine';
import { colors } from '../theme/colors';

/**
 * AI SDLC Copilot Center.
 *
 * AI-First redesign: every tab is a Copilot workflow that answers
 *   1. What did AI analyze?
 *   2. What did AI find?
 *   3. What does AI recommend?
 *   4. What can AI generate?
 *
 * KPIs are surfaced only as small "Secondary outcome indicators" inside each
 * tab; they are never the primary visual.
 */

type TabKey =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'audit';

const TABS: { key: TabKey; label: string; icon: typeof AssignmentIcon }[] = [
  { key: 'requirements', label: 'Requirements Copilot', icon: AssignmentIcon },
  { key: 'architecture', label: 'Architecture Copilot', icon: AccountTreeIcon },
  { key: 'development', label: 'Development Copilot', icon: CodeIcon },
  { key: 'testing', label: 'Testing Copilot', icon: ScienceIcon },
  { key: 'release', label: 'Release Copilot', icon: RocketLaunchIcon },
  { key: 'audit', label: 'Audit Copilot', icon: FactCheckIcon },
];

/**
 * Legacy tab keys still referenced by `routes/index.tsx`. Each one is mapped to
 * the closest AI-First Copilot tab so that bookmarks keep working while the
 * Center itself shows only the six Copilot workflows the executive cares about.
 */
type LegacyTabKey =
  | 'dashboard'
  | 'workspace'
  | 'health'
  | 'executive'
  | 'improvement'
  | 'reports'
  | TabKey;

const LEGACY_TAB_MAP: Record<LegacyTabKey, TabKey> = {
  dashboard: 'requirements',
  workspace: 'requirements',
  health: 'requirements',
  executive: 'audit',
  improvement: 'audit',
  reports: 'audit',
  requirements: 'requirements',
  architecture: 'architecture',
  development: 'development',
  testing: 'testing',
  release: 'release',
  audit: 'audit',
};

interface AiDeliveryCopilotCenterProps {
  initialTab?: LegacyTabKey;
}

export function AiDeliveryCopilotCenter({ initialTab = 'requirements' }: AiDeliveryCopilotCenterProps) {
  const { personaId } = usePersona();
  const { kpis, selectedProject } = useCopilot();
  const [tab, setTab] = useState<TabKey>(LEGACY_TAB_MAP[initialTab] ?? 'requirements');

  if (!canAccessCopilot(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard
        sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }}
        hover={false}
        glow="purple"
      >
        <SmartToyIcon sx={{ color: colors.secondary, fontSize: 24 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 700 }}>AI SDLC Copilot</Box>
          <Box sx={{ fontSize: '0.66rem', color: colors.text.secondary }}>
            AI agents analyze, recommend and generate across the SDLC — Requirements → Architecture → Development → Testing → Release → Audit.
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
          <Chip
            size="small"
            label={`${selectedProject.name}`}
            sx={{ height: 20, fontSize: '0.6rem', bgcolor: `${colors.secondary}1f`, color: colors.secondary, border: `1px solid ${colors.border.purple}` }}
          />
          <Chip
            size="small"
            label={`${kpis.aiRecommendations} AI recs`}
            sx={{ height: 20, fontSize: '0.6rem', bgcolor: `${colors.primary}1f`, color: colors.primary }}
          />
          <Chip
            size="small"
            label={`${kpis.projectsAtRisk} at-risk projects`}
            sx={{ height: 20, fontSize: '0.6rem', bgcolor: `${colors.warning}1f`, color: colors.warning }}
          />
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTab(t.key);
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: active ? 700 : 500,
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
        <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, mt: 0.75, ml: 0.25 }}>
          Tip · KPIs appear at the bottom of each tab as secondary outcome indicators — the AI workflow is the primary view.
        </Typography>
      </GlassCard>

      {tab === 'requirements' && <RequirementCopilotPanel />}
      {tab === 'architecture' && <ArchitectureCopilotPanel />}
      {tab === 'development' && <DevelopmentCopilotPanel />}
      {tab === 'testing' && <TestingCopilotPanel />}
      {tab === 'release' && <ReleaseCopilotPanel />}
      {tab === 'audit' && <AuditCopilotPanel />}
    </Box>
  );
}
