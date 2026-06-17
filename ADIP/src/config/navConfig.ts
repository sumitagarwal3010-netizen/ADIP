import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CloudIcon from '@mui/icons-material/Cloud';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PolicyIcon from '@mui/icons-material/Policy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HubIcon from '@mui/icons-material/Hub';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FlagIcon from '@mui/icons-material/Flag';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MapIcon from '@mui/icons-material/Map';
import LayersIcon from '@mui/icons-material/Layers';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import RuleIcon from '@mui/icons-material/Rule';
import SavingsIcon from '@mui/icons-material/Savings';
import GroupsIcon from '@mui/icons-material/Groups';
import TuneIcon from '@mui/icons-material/Tune';
import PaymentsIcon from '@mui/icons-material/Payments';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FactoryIcon from '@mui/icons-material/Factory';

/** A leaf navigation entry. `path` is an existing application route (routing is untouched). */
export interface NavLeaf {
  path: string;
  label: string;
  icon: SvgIconComponent;
}

/** A mid-level category that groups related leaves. May itself be navigable via `path`. */
export interface NavSection {
  id: string;
  label: string;
  icon: SvgIconComponent;
  /** Optional route for the section header itself (e.g. the center landing page). */
  path?: string;
  children: NavLeaf[];
}

/** A top-level navigation group (the only items visible when everything is collapsed). */
export interface NavGroup {
  id: string;
  label: string;
  icon: SvgIconComponent;
  children: NavSection[];
}

/**
 * Hierarchical, executive-grade navigation tree.
 *
 * Seven top-level groups, each containing categories, each containing leaves.
 * Every leaf `path` resolves to an existing route — this file only reorganizes
 * how routes are surfaced in the left navigation; it does not add or change any
 * routing target, engine, or mock data.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'executive',
    label: 'Executive',
    icon: DashboardIcon,
    children: [
      { id: 'delivery-health', label: 'Delivery Health', icon: SmartToyIcon, path: '/executive/ai-copilot/health', children: [] },
      { id: 'technology-health', label: 'Technology Health', icon: RocketLaunchIcon, path: '/executive/technology-health', children: [] },
      { id: 'risk-posture', label: 'Risk Posture', icon: ShieldIcon, path: '/executive/risk-posture', children: [] },
      { id: 'value-realized', label: 'Value Realized', icon: TrendingUpIcon, path: '/executive/value-realized', children: [] },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: GavelIcon,
    children: [
      {
        id: 'portfolio-governance',
        label: 'Portfolio Governance',
        icon: GavelIcon,
        path: '/executive/portfolio-governance',
        children: [
          { path: '/executive/portfolio-governance/demand', label: 'Demand Intake', icon: AssignmentIcon },
          { path: '/executive/portfolio-governance/business-case', label: 'Business Case Review', icon: FactCheckIcon },
          { path: '/executive/portfolio-governance/investment', label: 'Investment Governance', icon: SavingsIcon },
          { path: '/executive/portfolio-governance/capacity', label: 'Capacity Planning', icon: StorageIcon },
        ],
      },
      {
        id: 'enterprise-architecture',
        label: 'Enterprise Architecture',
        icon: AccountTreeIcon,
        path: '/executive/architecture-repository',
        children: [
          { path: '/executive/architecture-repository', label: 'Architecture Repository', icon: AccountTreeIcon },
          { path: '/executive/architecture-repository/standards', label: 'Standards', icon: PolicyIcon },
          { path: '/executive/architecture-repository/reference', label: 'Reference Architectures', icon: LayersIcon },
          { path: '/executive/architecture-repository/review-board', label: 'Architecture Reviews', icon: RuleIcon },
        ],
      },
      {
        id: 'technology-strategy',
        label: 'Technology Strategy',
        icon: RocketLaunchIcon,
        path: '/executive/technology-strategy',
        children: [
          { path: '/executive/technology-strategy/lifecycle', label: 'Technology Lifecycle', icon: TimelineIcon },
          { path: '/executive/technology-strategy/strategic-platforms', label: 'Strategic Platforms', icon: LayersIcon },
          { path: '/executive/technology-strategy/vendors', label: 'Vendor Management', icon: HandshakeIcon },
          { path: '/executive/technology-strategy/roadmaps', label: 'Roadmaps', icon: MapIcon },
        ],
      },
      {
        id: 'risk-compliance',
        label: 'Risk & Compliance',
        icon: ShieldIcon,
        path: '/executive/enterprise-risk',
        children: [
          { path: '/executive/enterprise-risk', label: 'Enterprise Risk', icon: WarningAmberIcon },
          { path: '/governance/audit-center', label: 'Audit Center', icon: FactCheckIcon },
          { path: '/governance/audit-center/compliance', label: 'Compliance Controls', icon: ShieldIcon },
          { path: '/governance/compliance', label: 'Policy Management', icon: PolicyIcon },
        ],
      },
      {
        id: 'ai-governance',
        label: 'AI Governance',
        icon: SmartToyIcon,
        path: '/ai-governance-center',
        children: [
          { path: '/ai-governance-center', label: 'AI Use Cases', icon: PsychologyIcon },
          { path: '/ai-governance-center/models', label: 'AI Models', icon: HubIcon },
          { path: '/ai-governance-center/risks', label: 'AI Risks', icon: WarningAmberIcon },
          { path: '/ai-governance-center/controls', label: 'AI Controls', icon: ShieldIcon },
          { path: '/ai-evaluation', label: 'AI Evaluation Score', icon: InsightsIcon },
        ],
      },
    ],
  },
  {
    id: 'ai-sdlc',
    label: 'AI SDLC',
    icon: AccountTreeIcon,
    children: [
      {
        id: 'requirements',
        label: 'Requirements',
        icon: AssignmentIcon,
        path: '/requirements',
        children: [
          { path: '/requirements', label: 'Requirements Hub', icon: AssignmentIcon },
          { path: '/traceability/matrix', label: 'Traceability Matrix', icon: FactCheckIcon },
        ],
      },
      {
        id: 'design-architecture',
        label: 'Design & Architecture',
        icon: DesignServicesIcon,
        path: '/architecture',
        children: [
          { path: '/architecture', label: 'Solution Design', icon: DesignServicesIcon },
          { path: '/executive/architecture-repository/review-board', label: 'Architecture Reviews', icon: RuleIcon },
          { path: '/executive/architecture-repository/exceptions', label: 'Architecture Decisions', icon: EditNoteIcon },
        ],
      },
      {
        id: 'development',
        label: 'Development',
        icon: CodeIcon,
        path: '/development',
        children: [
          { path: '/executive/ai-copilot', label: 'AI Delivery Copilot', icon: SmartToyIcon },
          { path: '/development', label: 'Development Intelligence', icon: CodeIcon },
          { path: '/ai-evaluation', label: 'AI Evaluation Center', icon: RuleIcon },
        ],
      },
      {
        id: 'testing',
        label: 'Testing',
        icon: ScienceIcon,
        path: '/testing',
        children: [
          { path: '/testing', label: 'Test Intelligence', icon: ScienceIcon },
          { path: '/executive/ai-copilot/testing', label: 'Quality Analytics', icon: InsightsIcon },
        ],
      },
      {
        id: 'release',
        label: 'Release',
        icon: RocketLaunchIcon,
        path: '/release',
        children: [
          { path: '/release', label: 'Release Readiness', icon: RocketLaunchIcon },
          { path: '/production/releases', label: 'Deployment Intelligence', icon: CloudIcon },
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: SpeedIcon,
    children: [
      {
        id: 'production-intelligence',
        label: 'Production Intelligence',
        icon: CloudIcon,
        path: '/production',
        children: [
          { path: '/production/incidents', label: 'Incident Analytics', icon: ReportProblemIcon },
          { path: '/production/leakage', label: 'Defect Leakage', icon: BugReportIcon },
          { path: '/production/rca', label: 'Root Cause Analysis', icon: PsychologyIcon },
        ],
      },
      {
        id: 'service-operations',
        label: 'Service Operations',
        icon: SupportAgentIcon,
        path: '/operations',
        children: [
          { path: '/operations/availability', label: 'Availability', icon: SpeedIcon },
          { path: '/production/applications', label: 'Performance', icon: FactoryIcon },
          { path: '/production/feedback', label: 'Reliability', icon: InsightsIcon },
          { path: '/ai-observability', label: 'AI Observability Center', icon: VisibilityIcon },
        ],
      },
      {
        id: 'operational-risk',
        label: 'Operational Risk',
        icon: WarningAmberIcon,
        path: '/operations/incidents',
        children: [
          { path: '/operations/incidents', label: 'Major Incidents', icon: ReportProblemIcon },
          { path: '/production/customer', label: 'Customer Impact', icon: VisibilityIcon },
          { path: '/executive/enterprise-risk/operational', label: 'MTTR', icon: TimelineIcon },
        ],
      },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: MenuBookIcon,
    children: [
      {
        id: 'knowledge-repository',
        label: 'Knowledge Repository',
        icon: MenuBookIcon,
        path: '/knowledge-center',
        children: [
          { path: '/knowledge-center/lessons', label: 'Lessons Learned', icon: HistoryEduIcon },
          { path: '/knowledge-center/best-practices', label: 'Best Practices', icon: LightbulbIcon },
          { path: '/knowledge/reusable-assets', label: 'Reusable Assets', icon: LibraryBooksIcon },
        ],
      },
      {
        id: 'learning-center',
        label: 'Learning Center',
        icon: SchoolIcon,
        path: '/knowledge-center/recommendations',
        children: [
          { path: '/knowledge-center/patterns', label: 'Patterns', icon: AccountTreeIcon },
          { path: '/knowledge-center/playbooks', label: 'Playbooks', icon: LibraryBooksIcon },
          { path: '/knowledge-center/recommendations', label: 'Training', icon: SchoolIcon },
        ],
      },
    ],
  },
  {
    id: 'transformation',
    label: 'Transformation',
    icon: RocketLaunchIcon,
    children: [
      {
        id: 'transformation-pmo',
        label: 'Transformation PMO',
        icon: HubIcon,
        path: '/executive/transformation-pmo',
        children: [
          { path: '/executive/transformation-pmo/objectives', label: 'Objectives', icon: FlagIcon },
          { path: '/executive/transformation-pmo/programs', label: 'Programs', icon: HubIcon },
          { path: '/executive/transformation-pmo/initiatives', label: 'Initiatives', icon: RocketLaunchIcon },
        ],
      },
      {
        id: 'benefits-realization',
        label: 'Benefits Realization',
        icon: TrendingUpIcon,
        path: '/executive/value-realization',
        children: [
          { path: '/executive/value-realization/roi', label: 'ROI', icon: PaymentsIcon },
          { path: '/executive/value-realization/productivity', label: 'Productivity', icon: TrendingUpIcon },
          { path: '/executive/transformation-pmo/benefits', label: 'Cost Avoidance', icon: SavingsIcon },
        ],
      },
      {
        id: 'strategic-execution',
        label: 'Strategic Execution',
        icon: FlagIcon,
        path: '/executive/transformation-pmo/commitments',
        children: [
          { path: '/executive/transformation-pmo/commitments', label: 'Commitments', icon: AssignmentTurnedInIcon },
          { path: '/executive/transformation-pmo/milestones', label: 'Progress Tracking', icon: TimelineIcon },
          { path: '/executive/transformation-pmo/insights', label: 'Executive Reviews', icon: SummarizeIcon },
        ],
      },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    icon: SettingsIcon,
    children: [
      {
        id: 'workflow',
        label: 'Workflow',
        icon: TimelineIcon,
        path: '/governance/approval-workflow',
        children: [
          { path: '/executive/workflow-orchestration', label: 'Workflow Center', icon: TimelineIcon },
          { path: '/governance/approval-workflow', label: 'Approvals', icon: AssignmentTurnedInIcon },
          { path: '/operations/notifications', label: 'Notifications', icon: NotificationsActiveIcon },
        ],
      },
      {
        id: 'security',
        label: 'Security',
        icon: SecurityIcon,
        path: '/administration/rbac',
        children: [
          { path: '/administration/rbac', label: 'RBAC', icon: AdminPanelSettingsIcon },
          { path: '/administration/abac', label: 'ABAC', icon: SecurityIcon },
        ],
      },
      {
        id: 'reporting',
        label: 'Reporting',
        icon: AssessmentIcon,
        path: '/reports',
        children: [
          { path: '/reports', label: 'Reports', icon: SummarizeIcon },
          { path: '/reports/compliance', label: 'Dashboards', icon: AssessmentIcon },
          { path: '/reports/trends', label: 'Analytics', icon: TrendingUpIcon },
        ],
      },
      {
        id: 'administration',
        label: 'Administration',
        icon: TuneIcon,
        path: '/administration',
        children: [
          { path: '/administration', label: 'Settings', icon: SettingsIcon },
          { path: '/administration/persistence', label: 'Configuration', icon: StorageIcon },
          { path: '/persona', label: 'Personas', icon: GroupsIcon },
        ],
      },
    ],
  },
];

function leafMatches(pathname: string, leafPath: string): boolean {
  if (leafPath === '/') return pathname === '/';
  return pathname === leafPath || pathname.startsWith(`${leafPath}/`);
}

/** Finds the group + section that own the given pathname (leaf or section header). */
export function findActiveTrail(pathname: string): { groupId: string; sectionId: string } | undefined {
  for (const group of NAV_GROUPS) {
    for (const section of group.children) {
      const ownsLeaf = section.children.some((leaf) => leafMatches(pathname, leaf.path));
      const ownsSection = section.path ? pathname === section.path : false;
      if (ownsLeaf || ownsSection) {
        return { groupId: group.id, sectionId: section.id };
      }
    }
  }
  return undefined;
}

export function isLeafActive(pathname: string, leafPath: string): boolean {
  return pathname === leafPath;
}
