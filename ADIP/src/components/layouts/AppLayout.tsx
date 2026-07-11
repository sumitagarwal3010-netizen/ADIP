import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AIAdvisor } from './AIAdvisor';
import { AIAdvisorProvider } from '../../context/AIAdvisorContext';
import { DemoModeBanner } from './DemoModeBanner';
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
  '/executive/program-status': { title: 'Transformation PMO', subtitle: 'Program health · strategic initiatives · execution risks' },
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
  '/executive/portfolio-governance': { title: 'Portfolio Governance Center', subtitle: 'Demand intake, funding, capacity planning, and investment governance' },
  '/executive/portfolio-governance/demand': { title: 'Portfolio Governance Center', subtitle: 'Demand pipeline and prioritization' },
  '/executive/portfolio-governance/business-case': { title: 'Portfolio Governance Center', subtitle: 'Business case review queue' },
  '/executive/portfolio-governance/investment': { title: 'Portfolio Governance Center', subtitle: 'Investment governance and funding decisions' },
  '/executive/portfolio-governance/capacity': { title: 'Portfolio Governance Center', subtitle: 'Capacity planning and forecasting' },
  '/executive/portfolio-governance/resources': { title: 'Portfolio Governance Center', subtitle: 'Resource allocation and bottleneck detection' },
  '/executive/portfolio-governance/alignment': { title: 'Portfolio Governance Center', subtitle: 'Strategic alignment scoring' },
  '/executive/portfolio-governance/roadmap': { title: 'Portfolio Governance Center', subtitle: 'Strategic roadmap planning' },
  '/executive/portfolio-governance/risks': { title: 'Portfolio Governance Center', subtitle: 'Portfolio risk exposure' },
  '/executive/portfolio-governance/benefits': { title: 'Portfolio Governance Center', subtitle: 'Benefits tracking and realization' },
  '/executive/portfolio-governance/insights': { title: 'Portfolio Governance Center', subtitle: 'Executive insights and AI advisors' },
  '/executive/portfolio-governance/reports': { title: 'Portfolio Governance Center', subtitle: 'AI-generated portfolio reports' },
  '/executive/application-portfolio': { title: 'Application Portfolio Center', subtitle: 'CIO application system of record — inventory, health, debt, cloud, AI' },
  '/executive/application-portfolio/inventory': { title: 'Application Portfolio Center', subtitle: '300-application inventory' },
  '/executive/application-portfolio/technology-health': { title: 'Application Portfolio Center', subtitle: 'Technology stack health and obsolescence' },
  '/executive/application-portfolio/criticality': { title: 'Application Portfolio Center', subtitle: 'Business criticality tiers' },
  '/executive/application-portfolio/technical-debt': { title: 'Application Portfolio Center', subtitle: 'Technical debt prioritization' },
  '/executive/application-portfolio/modernization': { title: 'Application Portfolio Center', subtitle: 'Modernization opportunities' },
  '/executive/application-portfolio/cloud': { title: 'Application Portfolio Center', subtitle: 'Cloud readiness assessments' },
  '/executive/application-portfolio/ai-readiness': { title: 'Application Portfolio Center', subtitle: 'AI readiness assessments' },
  '/executive/application-portfolio/risks': { title: 'Application Portfolio Center', subtitle: 'Application technology risks' },
  '/executive/application-portfolio/dependencies': { title: 'Application Portfolio Center', subtitle: 'Integration dependency mapping' },
  '/executive/application-portfolio/lifecycle': { title: 'Application Portfolio Center', subtitle: 'Application lifecycle planning' },
  '/executive/application-portfolio/rationalization': { title: 'Application Portfolio Center', subtitle: 'Application rationalization candidates' },
  '/executive/application-portfolio/insights': { title: 'Application Portfolio Center', subtitle: 'Executive insights and AI advisors' },
  '/executive/application-portfolio/reports': { title: 'Application Portfolio Center', subtitle: 'AI-generated APM reports' },
  '/executive/architecture-repository': { title: 'Architecture Repository & Governance', subtitle: 'Authoritative EA system of record' },
  '/executive/architecture-repository/domains': { title: 'Architecture Repository & Governance', subtitle: '10 architecture domains' },
  '/executive/architecture-repository/capabilities': { title: 'Architecture Repository & Governance', subtitle: '100 business capabilities' },
  '/executive/architecture-repository/applications': { title: 'Architecture Repository & Governance', subtitle: 'Application architecture register' },
  '/executive/architecture-repository/review-board': { title: 'Architecture Repository & Governance', subtitle: 'Architecture Review Board' },
  '/executive/architecture-repository/findings': { title: 'Architecture Repository & Governance', subtitle: 'Architecture findings' },
  '/executive/architecture-repository/exceptions': { title: 'Architecture Repository & Governance', subtitle: 'Exceptions, waivers & decisions' },
  '/executive/architecture-repository/standards': { title: 'Architecture Repository & Governance', subtitle: 'Standards repository & principles' },
  '/executive/architecture-repository/reference': { title: 'Architecture Repository & Governance', subtitle: 'Reference architectures' },
  '/executive/architecture-repository/debt': { title: 'Architecture Repository & Governance', subtitle: 'Architecture debt' },
  '/executive/architecture-repository/lifecycle': { title: 'Architecture Repository & Governance', subtitle: 'Technology lifecycle' },
  '/executive/architecture-repository/cloud': { title: 'Architecture Repository & Governance', subtitle: 'Cloud architecture' },
  '/executive/architecture-repository/ai': { title: 'Architecture Repository & Governance', subtitle: 'AI architecture' },
  '/executive/architecture-repository/risks': { title: 'Architecture Repository & Governance', subtitle: 'Architecture risks' },
  '/executive/architecture-repository/insights': { title: 'Architecture Repository & Governance', subtitle: 'Executive insights and AI advisors' },
  '/executive/architecture-repository/reports': { title: 'Architecture Repository & Governance', subtitle: 'AI-generated architecture reports' },
  '/executive/technology-strategy': { title: 'Technology Strategy & Roadmap', subtitle: 'Executive technology planning layer' },
  '/executive/technology-strategy/standards': { title: 'Technology Strategy & Roadmap', subtitle: 'Technology standards catalog' },
  '/executive/technology-strategy/lifecycle': { title: 'Technology Strategy & Roadmap', subtitle: 'Technology lifecycle and retirement' },
  '/executive/technology-strategy/roadmaps': { title: 'Technology Strategy & Roadmap', subtitle: '5-year technology roadmap' },
  '/executive/technology-strategy/strategic-platforms': { title: 'Technology Strategy & Roadmap', subtitle: 'Strategic platform adoption' },
  '/executive/technology-strategy/cloud': { title: 'Technology Strategy & Roadmap', subtitle: 'Cloud strategy and spend' },
  '/executive/technology-strategy/ai-platform': { title: 'Technology Strategy & Roadmap', subtitle: 'AI platform strategy' },
  '/executive/technology-strategy/vendors': { title: 'Technology Strategy & Roadmap', subtitle: 'Vendor landscape and concentration' },
  '/executive/technology-strategy/investments': { title: 'Technology Strategy & Roadmap', subtitle: 'Technology investment portfolio' },
  '/executive/technology-strategy/risks': { title: 'Technology Strategy & Roadmap', subtitle: 'Technology risk register' },
  '/executive/technology-strategy/modernization': { title: 'Technology Strategy & Roadmap', subtitle: 'Modernization waves' },
  '/executive/technology-strategy/insights': { title: 'Technology Strategy & Roadmap', subtitle: 'Executive insights and AI advisors' },
  '/executive/technology-strategy/reports': { title: 'Technology Strategy & Roadmap', subtitle: 'AI-generated technology reports' },
  '/executive/transformation-pmo': { title: 'Enterprise Transformation Center', subtitle: 'Executive transformation oversight' },
  '/executive/transformation-pmo/programs': { title: 'Enterprise Transformation Center', subtitle: 'Transformation programs' },
  '/executive/transformation-pmo/initiatives': { title: 'Enterprise Transformation Center', subtitle: 'Strategic initiatives' },
  '/executive/transformation-pmo/objectives': { title: 'Enterprise Transformation Center', subtitle: 'Objectives & OKRs' },
  '/executive/transformation-pmo/milestones': { title: 'Enterprise Transformation Center', subtitle: 'Milestones' },
  '/executive/transformation-pmo/benefits': { title: 'Enterprise Transformation Center', subtitle: 'Benefits tracking' },
  '/executive/transformation-pmo/commitments': { title: 'Enterprise Transformation Center', subtitle: 'Executive commitments' },
  '/executive/transformation-pmo/dependencies': { title: 'Enterprise Transformation Center', subtitle: 'Cross-program dependencies' },
  '/executive/transformation-pmo/risks': { title: 'Enterprise Transformation Center', subtitle: 'Transformation risks' },
  '/executive/transformation-pmo/business-units': { title: 'Enterprise Transformation Center', subtitle: 'Business unit performance' },
  '/executive/transformation-pmo/insights': { title: 'Enterprise Transformation Center', subtitle: 'Executive insights and AI advisors' },
  '/executive/transformation-pmo/reports': { title: 'Enterprise Transformation Center', subtitle: 'AI-generated transformation reports' },
  '/executive/enterprise-risk': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Board-level enterprise risk and assurance' },
  '/executive/enterprise-risk/register': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Enterprise risk register' },
  '/executive/enterprise-risk/operational': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Operational risk' },
  '/executive/enterprise-risk/technology': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Technology risk' },
  '/executive/enterprise-risk/cyber': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Cyber & security risk' },
  '/executive/enterprise-risk/ai': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'AI risk' },
  '/executive/enterprise-risk/regulatory': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Regulatory & compliance risk' },
  '/executive/enterprise-risk/audit-findings': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Audit findings risk' },
  '/executive/enterprise-risk/controls': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Control effectiveness' },
  '/executive/enterprise-risk/appetite': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Risk appetite & tolerance' },
  '/executive/enterprise-risk/assurance': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Integrated assurance' },
  '/executive/enterprise-risk/insights': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'Executive insights and AI advisors' },
  '/executive/enterprise-risk/reports': { title: 'Enterprise Risk & Integrated Assurance', subtitle: 'AI-generated risk reports' },
  '/executive/delivery-health': { title: 'Enterprise AI Authoring Studio', subtitle: 'Cross-SDLC artifact generation and orchestration' },
  '/executive/ai-copilot': { title: 'Enterprise AI Authoring Studio', subtitle: 'Cross-SDLC artifact generation and orchestration' },
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
  '/requirements': { title: 'Requirements Engineering Workspace', subtitle: 'Requirement analysis, quality review & artifact generation' },
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
  '/ai-governance/model-inventory': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls · evaluation' },
  '/ai-governance/prompt-governance': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls · evaluation' },
  '/ai-governance/ai-risk': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls · evaluation' },
  '/ai-governance/ai-controls': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls · evaluation' },
  '/ai-governance/ai-incidents': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls · evaluation' },
  '/ai-governance-center': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls' },
  '/ai-governance-center/models': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls' },
  '/ai-governance-center/prompts': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls' },
  '/ai-governance-center/risks': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls' },
  '/ai-governance-center/controls': { title: 'AI Governance Center', subtitle: 'Use cases · models · prompts · risks · controls' },
  '/ai-evaluation': { title: 'AI Evaluation Center', subtitle: 'Quality, safety, grounding & regression scores' },
  '/ai-observability': { title: 'AI Observability Center', subtitle: 'Usage, tokens, cost, latency & error rates' },
  '/artifacts': { title: 'Universal Artifacts Repository', subtitle: 'Single source of truth for every AI-generated executive deliverable' },
  '/kpi-catalog': { title: 'KPI Catalog', subtitle: 'KPI definitions, formulas, sources, owners & executive consumers' },
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
      <DemoModeBanner />
      <Sidebar />
      <TopBar title={meta.title} subtitle={meta.subtitle} />
      <AIAdvisorProvider>
      <AIAdvisor />
      <KpiDrilldownDrawer />
      <ExecutiveSummaryDrawer />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${layout.sidebarWidth}px`,
          mr: 0,
          mt: `${layout.topBarHeight + layout.demoBannerHeight}px`,
          p: 2,
          pb: 6,
          minHeight: `calc(100vh - ${layout.topBarHeight + layout.demoBannerHeight}px)`,
        }}
      >
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </Box>
      </AIAdvisorProvider>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: layout.sidebarWidth,
          right: 0,
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
