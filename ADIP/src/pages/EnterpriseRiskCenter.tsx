import { useState } from 'react';
import { Box } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EngineeringIcon from '@mui/icons-material/Engineering';
import MemoryIcon from '@mui/icons-material/Memory';
import SecurityIcon from '@mui/icons-material/Security';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SpeedIcon from '@mui/icons-material/Speed';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ExecutiveRiskDashboardPanel } from '../components/enterpriseRisk/ExecutiveRiskDashboardPanel';
import { EnterpriseRiskRegisterPanel, OperationalRiskPanel, TechnologyRiskPanel } from '../components/enterpriseRisk/RiskRegisterPanels';
import { CyberRiskPanel, AiRiskPanel, RegulatoryRiskPanel } from '../components/enterpriseRisk/DomainRiskPanels';
import { AuditFindingsRiskPanel, ControlEffectivenessPanel, RiskAppetitePanel, IntegratedAssurancePanel } from '../components/enterpriseRisk/ControlAssurancePanels';
import { ExecutiveRiskInsightsPanel, RiskTraceabilityPanel } from '../components/enterpriseRisk/RiskInsightsPanels';
import { useEnterpriseRisk } from '../context/EnterpriseRiskContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessEnterpriseRisk } from '../data/enterpriseRiskEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'register'
  | 'operational'
  | 'technology'
  | 'cyber'
  | 'ai'
  | 'regulatory'
  | 'audit-findings'
  | 'controls'
  | 'appetite'
  | 'assurance'
  | 'insights'
  | 'reports';

/**
 * Executive-Semantic Rationalization (June 2026)
 *
 * Risk & Compliance owns risk ownership and exposure: enterprise register,
 * operational/technology/cyber/AI risk, and risk appetite & tolerance.
 *
 * Removed from the strip (panels and deep links remain intact):
 *   - regulatory     → Compliance / Audit Center owns regulatory & compliance
 *   - audit-findings → Audit Center owns audit findings
 *   - controls       → Compliance / Audit Center owns control testing
 *   - assurance      → Audit Center owns integrated assurance
 *   - dashboard      → Executive Dashboard merged into Executive Insights
 *
 * Final tab count: 8.
 */
const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'register', label: 'Enterprise Risk Register', icon: ListAltIcon },
  { key: 'operational', label: 'Operational Risk', icon: EngineeringIcon },
  { key: 'technology', label: 'Technology Risk', icon: MemoryIcon },
  { key: 'cyber', label: 'Cyber & Security Risk', icon: SecurityIcon },
  { key: 'ai', label: 'AI Risk', icon: SmartToyIcon },
  { key: 'appetite', label: 'Risk Appetite & Tolerance', icon: SpeedIcon },
  { key: 'insights', label: 'Executive Insights', icon: InsightsIcon },
  { key: 'reports', label: 'AI Reports', icon: AssessmentIcon },
];

interface EnterpriseRiskCenterProps {
  initialTab?: TabKey;
}

const TAB_STRIP_KEYS: ReadonlySet<TabKey> = new Set(TABS.map((t) => t.key));

export function EnterpriseRiskCenter({ initialTab = 'register' }: EnterpriseRiskCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useEnterpriseRisk();
  const [tab, setTab] = useState<TabKey>(TAB_STRIP_KEYS.has(initialTab) ? initialTab : 'register');

  if (!canAccessEnterpriseRisk(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <ShieldIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Enterprise Risk Management & Integrated Assurance Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Board-level view of enterprise, operational, technology, cyber, AI, and regulatory risk with control and assurance coverage
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

      {tab === 'dashboard' && <ExecutiveRiskDashboardPanel />}
      {tab === 'register' && <EnterpriseRiskRegisterPanel />}
      {tab === 'operational' && <OperationalRiskPanel />}
      {tab === 'technology' && <TechnologyRiskPanel />}
      {tab === 'cyber' && <CyberRiskPanel />}
      {tab === 'ai' && <AiRiskPanel />}
      {tab === 'regulatory' && <RegulatoryRiskPanel />}
      {tab === 'audit-findings' && <AuditFindingsRiskPanel />}
      {tab === 'controls' && <ControlEffectivenessPanel />}
      {tab === 'appetite' && <RiskAppetitePanel />}
      {tab === 'assurance' && <IntegratedAssurancePanel />}
      {tab === 'insights' && <ExecutiveRiskInsightsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="enterprise-risk" />}

      {(tab === 'dashboard' || tab === 'register') && (
        <Box sx={{ mt: 1.5 }}>
          <RiskTraceabilityPanel />
        </Box>
      )}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Enterprise Risk — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
