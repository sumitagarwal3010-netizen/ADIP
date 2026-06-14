import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AIAdvisor } from './AIAdvisor';
import { KpiDrilldownDrawer } from '../common/KpiDrilldownDrawer';
import { ExecutiveSummaryDrawer } from '../common/ExecutiveSummaryDrawer';
import { PageTransition } from './PageTransition';
import { layout } from '../../theme/theme';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';
import { usePersona } from '../../context/PersonaContext';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/persona': { title: 'My Workspace', subtitle: 'Role-based enterprise experience' },
  '/executive/portfolio-health': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/program-status': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/strategic-risks': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/executive-summary': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/board-reporting': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/authentication': { title: 'Authentication Health', subtitle: 'Sessions, identity events, and privilege distribution' },
  '/executive/workflow-orchestration': { title: 'Workflow Orchestration', subtitle: 'Cross-hub lifecycle, bottlenecks, and SLA monitoring' },
  '/executive/value-realization': { title: 'Value Realization Center', subtitle: 'Executive business case engine — ROI, productivity, transformation' },
  '/executive/value-realization/productivity': { title: 'Value Realization Center', subtitle: 'Productivity analytics across SDLC domains' },
  '/executive/value-realization/delivery': { title: 'Value Realization Center', subtitle: 'Delivery acceleration metrics' },
  '/executive/value-realization/quality': { title: 'Value Realization Center', subtitle: 'Quality improvement and defect reduction' },
  '/executive/value-realization/governance': { title: 'Value Realization Center', subtitle: 'Governance efficiency gains' },
  '/executive/value-realization/audit': { title: 'Value Realization Center', subtitle: 'Audit efficiency improvements' },
  '/executive/value-realization/ai-adoption': { title: 'Value Realization Center', subtitle: 'AI adoption and impact metrics' },
  '/executive/value-realization/scorecard': { title: 'Value Realization Center', subtitle: 'Transformation maturity scorecard' },
  '/executive/value-realization/roi': { title: 'Value Realization Center', subtitle: 'Interactive ROI calculator' },
  '/executive/value-realization/business-case': { title: 'Value Realization Center', subtitle: 'Business case generator' },
  '/executive/value-realization/benchmarking': { title: 'Value Realization Center', subtitle: 'Benchmarking and gap analysis' },
  '/executive/value-realization/reports': { title: 'Value Realization Center', subtitle: 'AI-generated value reports' },
  '/executive/ai-copilot': { title: 'AI Delivery Copilot', subtitle: 'Rule-based delivery intelligence across the SDLC' },
  '/executive/ai-copilot/workspace': { title: 'AI Delivery Copilot', subtitle: 'Unified project workspace — insights, risks, and actions' },
  '/executive/ai-copilot/health': { title: 'AI Delivery Copilot', subtitle: 'Project health advisor and delivery risk scoring' },
  '/executive/ai-copilot/requirements': { title: 'AI Delivery Copilot', subtitle: 'Requirement quality and acceptance criteria analysis' },
  '/executive/ai-copilot/architecture': { title: 'AI Delivery Copilot', subtitle: 'Architecture risk and resiliency pattern insights' },
  '/executive/ai-copilot/development': { title: 'AI Delivery Copilot', subtitle: 'Code quality, tech debt, and refactoring candidates' },
  '/executive/ai-copilot/testing': { title: 'AI Delivery Copilot', subtitle: 'Test coverage gaps and automation opportunities' },
  '/executive/ai-copilot/release': { title: 'AI Delivery Copilot', subtitle: 'Release readiness and go/no-go recommendations' },
  '/executive/ai-copilot/audit': { title: 'AI Delivery Copilot', subtitle: 'Audit findings, evidence gaps, and compliance risks' },
  '/executive/ai-copilot/executive': { title: 'AI Delivery Copilot', subtitle: 'CIO portfolio summary and governance hotspots' },
  '/executive/ai-copilot/improvement': { title: 'AI Delivery Copilot', subtitle: 'Continuous improvement backlog and predicted gains' },
  '/executive/ai-copilot/reports': { title: 'AI Delivery Copilot', subtitle: 'AI-generated executive and delivery reports' },
  '/delivery': { title: 'Delivery Intelligence', subtitle: 'SDLC pipeline & change metrics' },
  '/requirements': { title: 'Requirements Intelligence Hub', subtitle: 'AI-powered requirement analysis' },
  '/architecture': { title: 'Architecture Intelligence Hub', subtitle: 'Dependency mapping & readiness' },
  '/development': { title: 'Development Intelligence Hub', subtitle: 'Code quality & engineering metrics' },
  '/testing': { title: 'Testing Intelligence Hub', subtitle: 'Coverage, automation & optimization' },
  '/release': { title: 'Release Intelligence Center', subtitle: 'Readiness assessment & go/no-go' },
  '/production': { title: 'Production Intelligence Center', subtitle: 'Production incidents, defect leakage, customer impact & RCA' },
  '/production/incidents': { title: 'Production Intelligence Center', subtitle: 'Incident analytics with full traceability links' },
  '/production/leakage': { title: 'Production Intelligence Center', subtitle: 'Defect leakage analytics across SDLC stages' },
  '/production/customer': { title: 'Production Intelligence Center', subtitle: 'Customer experience signals and pain points' },
  '/production/applications': { title: 'Production Intelligence Center', subtitle: 'Application health, availability, and risk scores' },
  '/production/releases': { title: 'Production Intelligence Center', subtitle: 'Release performance and readiness insights' },
  '/production/rca': { title: 'Production Intelligence Center', subtitle: 'Root cause intelligence and predicted risks' },
  '/production/feedback': { title: 'Production Intelligence Center', subtitle: 'Feedback recommendations fed to AI Delivery Copilot' },
  '/production/reports': { title: 'Production Intelligence Center', subtitle: 'AI-generated production intelligence reports' },
  '/operations': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/incidents': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/availability': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/capacity': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/notifications': { title: 'Notification & Escalation Center', subtitle: 'Enterprise alerts, escalations & mock delivery' },
  '/operations/notifications/inbox': { title: 'Notification & Escalation Center', subtitle: 'Notification inbox & actions' },
  '/operations/notifications/escalations': { title: 'Notification & Escalation Center', subtitle: 'Escalation queue & SLA breaches' },
  '/operations/notifications/delivery': { title: 'Notification & Escalation Center', subtitle: 'Mock delivery channel status' },
  '/operations/notifications/history': { title: 'Notification & Escalation Center', subtitle: 'Alert lifecycle history' },
  '/operations/notifications/reports': { title: 'Notification & Escalation Center', subtitle: 'AI-generated notification reports' },
  '/governance': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/compliance': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/risk': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/evidence': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/approval-workflow': { title: 'Enterprise Approval Workflow', subtitle: 'Review queue, approvals & audit trail' },
  '/governance/activity-center': { title: 'Activity Center', subtitle: 'Enterprise event bus & activity stream' },
  '/governance/audit-center': { title: 'Evidence & Audit Center', subtitle: 'Enterprise evidence, findings, compliance & audit readiness' },
  '/governance/audit-center/findings': { title: 'Evidence & Audit Center', subtitle: 'Audit findings register & severity analysis' },
  '/governance/audit-center/observations': { title: 'Evidence & Audit Center', subtitle: 'Audit observations & management responses' },
  '/governance/audit-center/evidence': { title: 'Evidence & Audit Center', subtitle: 'Centralized evidence repository' },
  '/governance/audit-center/timeline': { title: 'Evidence & Audit Center', subtitle: 'Unified enterprise audit chronology' },
  '/governance/audit-center/compliance': { title: 'Evidence & Audit Center', subtitle: 'Compliance status & risk analysis' },
  '/governance/audit-center/readiness': { title: 'Evidence & Audit Center', subtitle: 'Audit readiness assessment' },
  '/governance/audit-center/lineage': { title: 'Evidence & Audit Center', subtitle: 'SDLC evidence lineage & coverage' },
  '/governance/audit-center/reports': { title: 'Evidence & Audit Center', subtitle: 'AI-generated audit reports' },
  '/ai-governance': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/model-inventory': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/prompt-governance': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/ai-risk': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/ai-controls': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/ai-incidents': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/traceability': { title: 'AI SDLC Traceability Center', subtitle: 'End-to-end lineage from requirement to compliance' },
  '/traceability/matrix': { title: 'AI SDLC Traceability Center', subtitle: 'Requirement traceability matrix' },
  '/traceability/ai': { title: 'AI SDLC Traceability Center', subtitle: 'AI lifecycle traceability' },
  '/traceability/impact': { title: 'AI SDLC Traceability Center', subtitle: 'Impact analysis' },
  '/traceability/executive': { title: 'AI SDLC Traceability Center', subtitle: 'Executive traceability view' },
  '/traceability/reports': { title: 'AI SDLC Traceability Center', subtitle: 'AI-generated traceability reports' },
  '/learning': { title: 'Knowledge & Learning Center', subtitle: 'Institutional knowledge from every SDLC signal' },
  '/knowledge-center': { title: 'Knowledge & Learning Center', subtitle: 'Institutional knowledge from every SDLC signal' },
  '/knowledge-center/lessons': { title: 'Knowledge & Learning Center', subtitle: 'Lessons learned library with full traceability' },
  '/knowledge-center/best-practices': { title: 'Knowledge & Learning Center', subtitle: 'Best practices across all SDLC domains' },
  '/knowledge-center/patterns': { title: 'Knowledge & Learning Center', subtitle: 'Enterprise architecture pattern catalog' },
  '/knowledge-center/controls': { title: 'Knowledge & Learning Center', subtitle: 'Reusable preventive and detective controls' },
  '/knowledge-center/rca': { title: 'Knowledge & Learning Center', subtitle: 'RCA knowledge base from production and audit' },
  '/knowledge-center/playbooks': { title: 'Knowledge & Learning Center', subtitle: 'SDLC institutional playbooks' },
  '/knowledge-center/search': { title: 'Knowledge & Learning Center', subtitle: 'Search and discover organizational knowledge' },
  '/knowledge-center/recommendations': { title: 'Knowledge & Learning Center', subtitle: 'Learning recommendations from integrated hubs' },
  '/knowledge-center/reports': { title: 'Knowledge & Learning Center', subtitle: 'AI-generated knowledge reports' },
  '/knowledge/best-practices': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/knowledge/reusable-assets': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/knowledge/lessons-learned': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/reports': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/reports/compliance': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/reports/audit': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/reports/trends': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/administration': { title: 'Platform Administration', subtitle: 'Configuration & access management' },
  '/administration/rbac': { title: 'RBAC Administration', subtitle: 'Roles, permissions, and entitlement governance' },
  '/administration/persistence': { title: 'Persistence Administration', subtitle: 'Entity stores, repositories & adapter health' },
  '/administration/abac': { title: 'ABAC Administration', subtitle: 'Attribute policies, domain scope & row-level security' },
};

export function AppLayout() {
  const location = useLocation();
  const { state } = useSimulation();
  const { persona } = usePersona();
  const meta =
    location.pathname === '/persona'
      ? { title: `${persona.label} Workspace`, subtitle: persona.title }
      : pageMeta[location.pathname] || { title: 'ADIP', subtitle: '' };
  const opsStatus = state.operations.operationalHealth >= 85 ? 'Healthy' : 'Attention';
  const statusColor = opsStatus === 'Healthy' ? colors.success : colors.warning;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <TopBar title={meta.title} subtitle={meta.subtitle} />
      <AIAdvisor />
      <KpiDrilldownDrawer />
      <ExecutiveSummaryDrawer />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${layout.sidebarWidth}px`,
          mr: `${layout.aiAdvisorWidth}px`,
          mt: `${layout.topBarHeight}px`,
          p: 2,
          pb: 6,
          minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
        }}
      >
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: layout.sidebarWidth,
          right: layout.aiAdvisorWidth,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          bgcolor: 'rgba(4, 11, 31, 0.9)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${colors.border.subtle}`,
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
            <Box component="span" sx={{ fontSize: '0.7rem', color: colors.text.secondary }}>
              Operations: {opsStatus} · {state.executive.openIncidents} incidents
            </Box>
          </Box>
          <Box component="span" sx={{ fontSize: '0.7rem', color: colors.text.muted }}>
            Last sync: {new Date(state.lastUpdated).toLocaleTimeString()}
          </Box>
        </Box>
        <Box component="span" sx={{ fontSize: '0.7rem', color: colors.success, fontWeight: 600 }}>
          Portfolio Health {state.executive.portfolioHealth}% · UPI Release 24.6
        </Box>
      </Box>
    </Box>
  );
}
