import { useState } from 'react';
import { Box, Chip, Grid, Typography } from '@mui/material';
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
import { EnterpriseArtifactWorkspace } from '../components/workflow/EnterpriseArtifactWorkspace';
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

type ArchGovernancePrompt =
  | 'Architecture Review'
  | 'Standards Validation'
  | 'Dependency Mapping'
  | 'Technology Exception'
  | 'Reference Architecture'
  | 'Approval Checklist';

const ARCH_GOVERNANCE_PROMPTS: ArchGovernancePrompt[] = [
  'Architecture Review',
  'Standards Validation',
  'Dependency Mapping',
  'Technology Exception',
  'Reference Architecture',
  'Approval Checklist',
];

const ARCH_GOVERNANCE_OUTPUTS: Record<
  ArchGovernancePrompt,
  {
    reviewSummary: string;
    complianceMatrix: string;
    dependencyRiskMap: string;
    exceptionRecord: string;
    adr: string;
    signoffChecklist: string;
  }
> = {
  'Architecture Review': {
    reviewSummary: 'Architecture Review Summary\n- Scope: Payments platform redesign wave 3\n- Verdict: Approved with 2 conditional controls\n- Decision latency and resilience targets acceptable',
    complianceMatrix: 'Standards Compliance Matrix\n- API versioning standard: compliant\n- observability baseline: conditional (alert routing pending)',
    dependencyRiskMap: 'Dependency Risk Map\n- Core ledger API: medium risk\n- identity service contract: low risk\n- notification queue SLA: medium risk',
    exceptionRecord: 'Exception Approval Record\n- None required for this review cycle',
    adr: 'Architecture Decision Record\n- ADR-902: retain async event choreography for settlement updates',
    signoffChecklist: 'Governance Sign-off Checklist\n- Architecture board sign-off complete\n- Security review complete\n- Ops readiness pending',
  },
  'Standards Validation': {
    reviewSummary: 'Architecture Review Summary\n- Validation run against enterprise standards baseline 2026-Q2',
    complianceMatrix: 'Standards Compliance Matrix\n- SEC-API-12: compliant\n- DATA-RET-09: compliant\n- OBS-LOG-03: non-compliant (retention mismatch)',
    dependencyRiskMap: 'Dependency Risk Map\n- logging pipeline dependency causing compliance variance',
    exceptionRecord: 'Exception Approval Record\n- EX-338 requested for temporary log retention override',
    adr: 'Architecture Decision Record\n- ADR-915: align retention policy with central observability platform',
    signoffChecklist: 'Governance Sign-off Checklist\n- Standards owner approval: complete\n- Compliance validation: complete\n- Exception committee: pending',
  },
  'Dependency Mapping': {
    reviewSummary: 'Architecture Review Summary\n- 27 service dependencies assessed across payment and identity domains',
    complianceMatrix: 'Standards Compliance Matrix\n- dependency declaration standard: compliant',
    dependencyRiskMap: 'Dependency Risk Map\n- high risk: payment switch to ledger synchronous coupling\n- medium risk: auth profile service fanout',
    exceptionRecord: 'Exception Approval Record\n- EX-341 approved for temporary synchronous fallback under peak windows',
    adr: 'Architecture Decision Record\n- ADR-921: phased decoupling with event replay safety net',
    signoffChecklist: 'Governance Sign-off Checklist\n- dependency owners validated\n- fallback tested\n- SLA amendments documented',
  },
  'Technology Exception': {
    reviewSummary: 'Architecture Review Summary\n- Exception sought for legacy runtime in non-production zone',
    complianceMatrix: 'Standards Compliance Matrix\n- runtime baseline: non-compliant by design (exception path)',
    dependencyRiskMap: 'Dependency Risk Map\n- elevated patching risk and supportability risk',
    exceptionRecord: 'Exception Approval Record\n- EX-352 approved for 90 days\n- mandatory compensating controls attached',
    adr: 'Architecture Decision Record\n- ADR-933: limited-duration legacy runtime bridge pending migration',
    signoffChecklist: 'Governance Sign-off Checklist\n- risk acceptance signed\n- migration milestone committed\n- monthly review cadence set',
  },
  'Reference Architecture': {
    reviewSummary: 'Architecture Review Summary\n- Reference baseline published for event-driven settlement workflows',
    complianceMatrix: 'Standards Compliance Matrix\n- architecture pattern compliance score: 94%',
    dependencyRiskMap: 'Dependency Risk Map\n- low residual risk with mandated circuit-breaker policy',
    exceptionRecord: 'Exception Approval Record\n- no open exceptions',
    adr: 'Architecture Decision Record\n- ADR-940: canonical reference for settlement orchestration pattern',
    signoffChecklist: 'Governance Sign-off Checklist\n- architecture council approval complete\n- enablement notes published',
  },
  'Approval Checklist': {
    reviewSummary: 'Architecture Review Summary\n- Release candidate architecture governance gate review',
    complianceMatrix: 'Standards Compliance Matrix\n- all mandatory controls mapped to approval gate',
    dependencyRiskMap: 'Dependency Risk Map\n- one medium vendor API dependency under enhanced monitoring',
    exceptionRecord: 'Exception Approval Record\n- no blocking exceptions',
    adr: 'Architecture Decision Record\n- ADR-948: go-live architecture signed with constrained rollout',
    signoffChecklist: 'Governance Sign-off Checklist\n- architecture: complete\n- security: complete\n- operations: complete\n- compliance: complete',
  },
};

const TAB_STRIP_KEYS: ReadonlySet<TabKey> = new Set(TABS.map((t) => t.key));

export function ArchitectureRepositoryCenter({ initialTab = 'domains' }: ArchitectureRepositoryCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useArchitectureRepository();
  const [selectedPrompt, setSelectedPrompt] = useState<ArchGovernancePrompt>('Architecture Review');
  const archPack = ARCH_GOVERNANCE_OUTPUTS[selectedPrompt];
  // If a deep link points at a tab that has been removed from the strip, land
  // on the canonical first tab so the strip and the body stay in sync.
  const [tab, setTab] = useState<TabKey>(TAB_STRIP_KEYS.has(initialTab) ? initialTab : 'domains');

  if (!canAccessArchitectureRepository(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <EnterpriseArtifactWorkspace pillar="Governance" submenu="Architecture Assurance" />
      <Box sx={{ mt: 0.5 }}>
        <AIWorkspacePanel module="enterprise-architecture" number={1} />
      </Box>

      <GlassCard sx={{ p: 2, mb: 1.5 }} glow="blue" hover={false}>
        <AIInsightBox
          title="Architecture Governance Automation"
          insight="Deterministic architecture governance packs for standards, dependency, exception, and sign-off decisions."
        />
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
          {ARCH_GOVERNANCE_PROMPTS.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              onClick={() => setSelectedPrompt(chip)}
              sx={{
                fontSize: '0.68rem',
                bgcolor: selectedPrompt === chip ? `${colors.primary}24` : colors.bg.glass,
                color: selectedPrompt === chip ? colors.primary : colors.text.secondary,
                border: `1px solid ${selectedPrompt === chip ? colors.primary : colors.border.subtle}`,
              }}
            />
          ))}
        </Box>
        <Grid container spacing={1} sx={{ mt: 0.5 }}>
          {[
            ['Architecture Review Summary', archPack.reviewSummary],
            ['Standards Compliance Matrix', archPack.complianceMatrix],
            ['Dependency Risk Map', archPack.dependencyRiskMap],
            ['Exception Approval Record', archPack.exceptionRecord],
            ['Architecture Decision Record', archPack.adr],
            ['Governance Sign-off Checklist', archPack.signoffChecklist],
          ].map(([title, content]) => (
            <Grid key={title} size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 1.25, borderRadius: 1.25, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>{title}</Typography>
                <Typography component="pre" sx={{ m: 0, mt: 0.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.7rem', color: colors.text.secondary }}>
                  {content}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </GlassCard>

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
