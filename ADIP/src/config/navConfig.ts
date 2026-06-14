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
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import InventoryIcon from '@mui/icons-material/Inventory';
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
import VpnLockIcon from '@mui/icons-material/VpnLock';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InboxIcon from '@mui/icons-material/Inbox';
import StreamIcon from '@mui/icons-material/Stream';

export interface NavChild {
  path: string;
  label: string;
  icon: SvgIconComponent;
}

export interface NavHub {
  id: string;
  label: string;
  icon: SvgIconComponent;
  defaultExpanded?: boolean;
  children: NavChild[];
}

export const NAV_HUBS: NavHub[] = [
  {
    id: 'executive',
    label: 'Executive Control Tower',
    icon: DashboardIcon,
    defaultExpanded: true,
    children: [
      { path: '/executive/portfolio-health', label: 'Portfolio Health', icon: StorageIcon },
      { path: '/executive/program-status', label: 'AI Program Status', icon: PsychologyIcon },
      { path: '/executive/strategic-risks', label: 'Strategic Risks', icon: WarningAmberIcon },
      { path: '/executive/executive-summary', label: 'Executive Summary', icon: SummarizeIcon },
      { path: '/executive/board-reporting', label: 'Board Reporting', icon: AssessmentIcon },
      { path: '/executive/authentication', label: 'Authentication Health', icon: VpnLockIcon },
      { path: '/executive/workflow-orchestration', label: 'Workflow Orchestration', icon: TimelineIcon },
    ],
  },
  {
    id: 'sdlc',
    label: 'SDLC Lifecycle Hub',
    icon: AccountTreeIcon,
    defaultExpanded: true,
    children: [
      { path: '/requirements', label: 'Requirements', icon: AssignmentIcon },
      { path: '/architecture', label: 'Architecture', icon: AccountTreeIcon },
      { path: '/development', label: 'Development', icon: CodeIcon },
      { path: '/testing', label: 'Testing', icon: ScienceIcon },
      { path: '/release', label: 'Release', icon: RocketLaunchIcon },
    ],
  },
  {
    id: 'traceability',
    label: 'Traceability Center',
    icon: HubIcon,
    children: [
      { path: '/traceability', label: 'Lineage Dashboard', icon: AccountTreeIcon },
      { path: '/traceability/matrix', label: 'Requirement Matrix', icon: FactCheckIcon },
      { path: '/traceability/ai', label: 'AI Traceability', icon: PsychologyIcon },
      { path: '/traceability/impact', label: 'Impact Analysis', icon: InsightsIcon },
      { path: '/traceability/executive', label: 'Executive View', icon: AssessmentIcon },
      { path: '/traceability/lifecycle', label: 'Workflow Lifecycle', icon: TimelineIcon },
      { path: '/traceability/evidence', label: 'Evidence Lineage', icon: FolderSharedIcon },
      { path: '/traceability/reports', label: 'AI Reports', icon: SummarizeIcon },
    ],
  },
  {
    id: 'operations',
    label: 'Operations Hub',
    icon: SettingsIcon,
    children: [
      { path: '/production', label: 'Production', icon: CloudIcon },
      { path: '/operations/incidents', label: 'Incidents', icon: ReportProblemIcon },
      { path: '/operations/availability', label: 'Availability', icon: SpeedIcon },
      { path: '/operations/capacity', label: 'Capacity', icon: StorageIcon },
      { path: '/operations/notifications', label: 'Notification Center', icon: NotificationsActiveIcon },
      { path: '/operations/notifications/inbox', label: 'Notification Inbox', icon: InboxIcon },
      { path: '/operations/notifications/escalations', label: 'Escalation Queue', icon: TrendingUpIcon },
    ],
  },
  {
    id: 'governance',
    label: 'Governance Hub',
    icon: GavelIcon,
    children: [
      { path: '/governance', label: 'Audit', icon: FactCheckIcon },
      { path: '/governance/audit-center', label: 'Audit Center', icon: FactCheckIcon },
      { path: '/governance/audit-center/findings', label: 'Audit Findings', icon: BugReportIcon },
      { path: '/governance/audit-center/evidence', label: 'Evidence Repository', icon: FolderSharedIcon },
      { path: '/governance/audit-center/timeline', label: 'Audit Timeline', icon: TimelineIcon },
      { path: '/governance/audit-center/readiness', label: 'Audit Readiness', icon: FactCheckIcon },
      { path: '/governance/compliance', label: 'Compliance', icon: PolicyIcon },
      { path: '/governance/risk', label: 'Risk', icon: WarningAmberIcon },
      { path: '/governance/evidence', label: 'Evidence', icon: FolderSharedIcon },
      { path: '/governance/approval-workflow', label: 'Approval Workflow', icon: AssignmentTurnedInIcon },
      { path: '/governance/activity-center', label: 'Activity Center', icon: StreamIcon },
      { path: '/administration/rbac', label: 'RBAC Administration', icon: AdminPanelSettingsIcon },
      { path: '/administration/persistence', label: 'Persistence Admin', icon: StorageIcon },
      { path: '/administration/abac', label: 'ABAC Administration', icon: SecurityIcon },
    ],
  },
  {
    id: 'ai-governance',
    label: 'AI Governance Hub',
    icon: PsychologyIcon,
    children: [
      { path: '/ai-governance', label: 'Use Case Registry', icon: PsychologyIcon },
      { path: '/ai-governance/model-inventory', label: 'Model Inventory', icon: InventoryIcon },
      { path: '/ai-governance/prompt-governance', label: 'Prompt Governance', icon: EditNoteIcon },
      { path: '/ai-governance/ai-risk', label: 'AI Risk', icon: WarningAmberIcon },
      { path: '/ai-governance/ai-controls', label: 'AI Controls', icon: ShieldIcon },
      { path: '/ai-governance/ai-incidents', label: 'AI Incidents', icon: BugReportIcon },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge Hub',
    icon: MenuBookIcon,
    children: [
      { path: '/learning', label: 'Learning', icon: SchoolIcon },
      { path: '/knowledge/best-practices', label: 'Best Practices', icon: LightbulbIcon },
      { path: '/knowledge/reusable-assets', label: 'Reusable Assets', icon: LibraryBooksIcon },
      { path: '/knowledge/lessons-learned', label: 'Lessons Learned', icon: HistoryEduIcon },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: AssessmentIcon,
    children: [
      { path: '/reports', label: 'Executive Reports', icon: SummarizeIcon },
      { path: '/reports/compliance', label: 'Compliance Reports', icon: PolicyIcon },
      { path: '/reports/audit', label: 'Audit Reports', icon: SecurityIcon },
      { path: '/reports/trends', label: 'Trend Analytics', icon: TrendingUpIcon },
    ],
  },
];

export function findHubForPath(pathname: string): NavHub | undefined {
  return NAV_HUBS.find((hub) =>
    hub.children.some((child) =>
      child.path === pathname || (child.path !== '/' && pathname.startsWith(`${child.path}/`)),
    ),
  );
}

export function isChildActive(pathname: string, childPath: string): boolean {
  return pathname === childPath;
}
