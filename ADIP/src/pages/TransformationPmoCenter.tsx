import { useState } from 'react';
import { Box } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InsightsIcon from '@mui/icons-material/Insights';
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

/**
 * Executive-Semantic Rationalization (June 2026)
 *
 * Transformation owns execution and outcomes. KPI-only PMO reporting tabs
 * have been dropped from the strip per the rationalization spec:
 *
 *   - benefits   → KPI-only board reporting; available via Value Realization
 *   - milestones → KPI-only PMO reporting (low decision value at exec layer)
 *
 * Final tab count: 5.
 */
type TabKey =
  | 'overview'
  | 'program-health'
  | 'benefits'
  | 'initiatives'
  | 'milestones'
  | 'risks-dependencies'
  | 'ai-recommendations';

// Legacy deep-link tab keys preserved so existing routes keep resolving.
type LegacyTabKey =
  | 'dashboard'
  | 'programs'
  | 'objectives'
  | 'commitments'
  | 'dependencies'
  | 'risks'
  | 'business-units'
  | 'insights'
  | 'reports';

const NEW_TAB_KEYS: TabKey[] = [
  'overview',
  'program-health',
  'benefits',
  'initiatives',
  'milestones',
  'risks-dependencies',
  'ai-recommendations',
];

const LEGACY_TAB_MAP: Record<LegacyTabKey, TabKey> = {
  dashboard: 'overview',
  programs: 'program-health',
  'business-units': 'program-health',
  objectives: 'initiatives',
  commitments: 'overview',
  dependencies: 'risks-dependencies',
  risks: 'risks-dependencies',
  insights: 'ai-recommendations',
  reports: 'ai-recommendations',
};

function normalizeTab(key: TabKey | LegacyTabKey): TabKey {
  if ((NEW_TAB_KEYS as string[]).includes(key)) return key as TabKey;
  return LEGACY_TAB_MAP[key as LegacyTabKey] ?? 'overview';
}

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'overview', label: 'Overview', icon: DashboardIcon },
  { key: 'program-health', label: 'Program Health', icon: AccountTreeIcon },
  { key: 'initiatives', label: 'Strategic Initiatives', icon: RocketLaunchIcon },
  { key: 'risks-dependencies', label: 'Risks & Dependencies', icon: WarningAmberIcon },
  { key: 'ai-recommendations', label: 'AI Recommendations', icon: InsightsIcon },
];

interface TransformationPmoCenterProps {
  initialTab?: TabKey | LegacyTabKey;
}

const TAB_STRIP_KEYS: ReadonlySet<TabKey> = new Set(TABS.map((t) => t.key));

export function TransformationPmoCenter({ initialTab = 'overview' }: TransformationPmoCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useTransformationPmo();
  const normalized = normalizeTab(initialTab);
  // Removed tabs (benefits, milestones) collapse onto the Overview tab so the
  // strip and the body never disagree.
  const [tab, setTab] = useState<TabKey>(TAB_STRIP_KEYS.has(normalized) ? normalized : 'overview');

  if (!canAccessTransformationPmo(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <HubIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Enterprise Transformation Center</Box>
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

      {/* Overview — executive dashboard, traceability and summary */}
      {tab === 'overview' && (
        <>
          <ExecutiveTransformationDashboardPanel />
          <Box sx={{ mt: 1.5 }}>
            <TransformationTraceabilityPanel />
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <AIInsightBox title="Transformation — Executive Summary" insight={execSummary} />
          </Box>
        </>
      )}

      {/* Program Health — programs and business unit performance */}
      {tab === 'program-health' && (
        <>
          <TransformationProgramsPanel />
          <Box sx={{ mt: 1.5 }}>
            <BusinessUnitPerformancePanel />
          </Box>
        </>
      )}

      {/* Benefits Realization — benefits tracking and executive commitments */}
      {tab === 'benefits' && (
        <>
          <BenefitsTrackingPanel />
          <Box sx={{ mt: 1.5 }}>
            <ExecutiveCommitmentsPanel />
          </Box>
        </>
      )}

      {/* Strategic Initiatives — initiatives and objectives / OKRs */}
      {tab === 'initiatives' && (
        <>
          <StrategicInitiativesPanel />
          <Box sx={{ mt: 1.5 }}>
            <ObjectivesOkrsPanel />
          </Box>
        </>
      )}

      {/* Milestones */}
      {tab === 'milestones' && <MilestonesPanel />}

      {/* Risks & Dependencies — transformation risks and cross-program dependencies */}
      {tab === 'risks-dependencies' && (
        <>
          <TransformationRisksPanel />
          <Box sx={{ mt: 1.5 }}>
            <CrossProgramDependenciesPanel />
          </Box>
        </>
      )}

      {/* AI Recommendations — executive insights and AI report generation */}
      {tab === 'ai-recommendations' && (
        <>
          <ExecutiveTransformationInsightsPanel />
          <Box sx={{ mt: 1.5 }}>
            <HubArtifactGenerator hubKey="transformation-pmo" />
          </Box>
        </>
      )}
    </Box>
  );
}
