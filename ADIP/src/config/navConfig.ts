import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CloudIcon from '@mui/icons-material/Cloud';
import SpeedIcon from '@mui/icons-material/Speed';
import ShieldIcon from '@mui/icons-material/Shield';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InventoryIcon from '@mui/icons-material/Inventory';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HubIcon from '@mui/icons-material/Hub';

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
  /**
   * Optional route for a group that is itself a single center (no child sections).
   * When set and `children` is empty, the group renders as a direct, non-expandable
   * center entry that navigates straight to this route.
   */
  path?: string;
  children: NavSection[];
}

/**
 * Hierarchical, executive-grade navigation tree — rationalized to "centers only".
 *
 * LEFT navigation = centers (each section resolves to a center landing route).
 * RIGHT side = functional tabs within the selected center.
 *
 * No left-nav leaf duplicates a horizontal tab that lives inside its center, so
 * every section here is a single center entry (no nested child leaves). This file
 * only reorganizes how routes are surfaced; it does not add or change any routing
 * target, engine, or mock data. Deep routes remain reachable as tabs within centers.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'executive',
    label: 'Executive',
    icon: DashboardIcon,
    children: [
      { id: 'delivery-health', label: 'Enterprise AI Authoring Studio', icon: SmartToyIcon, path: '/executive/delivery-health', children: [] },
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
      { id: 'portfolio-governance', label: 'Portfolio Governance', icon: GavelIcon, path: '/executive/portfolio-governance', children: [] },
      { id: 'enterprise-architecture', label: 'Enterprise Architecture', icon: AccountTreeIcon, path: '/executive/architecture-repository', children: [] },
      { id: 'technology-strategy', label: 'Technology Strategy', icon: RocketLaunchIcon, path: '/executive/technology-strategy', children: [] },
      { id: 'risk-compliance', label: 'Risk & Compliance', icon: ShieldIcon, path: '/executive/enterprise-risk', children: [] },
      { id: 'ai-governance', label: 'AI Governance', icon: SmartToyIcon, path: '/ai-governance-center', children: [] },
    ],
  },
  {
    id: 'ai-sdlc',
    label: 'AI SDLC',
    icon: AccountTreeIcon,
    children: [
      { id: 'requirements', label: 'Requirements Engineering', icon: AssignmentIcon, path: '/requirements', children: [] },
      { id: 'design-architecture', label: 'Design & Architecture', icon: DesignServicesIcon, path: '/architecture', children: [] },
      { id: 'development', label: 'Development', icon: CodeIcon, path: '/development', children: [] },
      { id: 'testing', label: 'Testing', icon: ScienceIcon, path: '/testing', children: [] },
      { id: 'release', label: 'Release', icon: RocketLaunchIcon, path: '/release', children: [] },
      { id: 'connector-workbench', label: 'Connector Artifact Workbench', icon: HubIcon, path: '/ai-sdlc/connector-artifact-workbench', children: [] },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: SpeedIcon,
    children: [
      { id: 'production-intelligence', label: 'Production Intelligence', icon: CloudIcon, path: '/production', children: [] },
      { id: 'service-operations', label: 'Service Operations', icon: SupportAgentIcon, path: '/operations', children: [] },
      { id: 'ai-observability', label: 'AI Observability', icon: VisibilityIcon, path: '/ai-observability', children: [] },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    icon: SettingsIcon,
    children: [
      { id: 'artifacts', label: 'Artifacts Repository', icon: InventoryIcon, path: '/artifacts', children: [] },
      // Knowledge & Transformation centers relocated from top level; same routes and icons.
      { id: 'knowledge', label: 'Knowledge Center', icon: MenuBookIcon, path: '/knowledge-center', children: [] },
      { id: 'transformation', label: 'Transformation Center', icon: RocketLaunchIcon, path: '/executive/transformation-pmo', children: [] },
      { id: 'kpi-catalog', label: 'KPI Catalog', icon: LibraryBooksIcon, path: '/kpi-catalog', children: [] },
      { id: 'workflow', label: 'Workflow', icon: TimelineIcon, path: '/executive/workflow-orchestration', children: [] },
      { id: 'reporting', label: 'Reporting', icon: AssessmentIcon, path: '/reports', children: [] },
      { id: 'administration', label: 'Administration', icon: TuneIcon, path: '/administration', children: [] },
      { id: 'integrations', label: 'Integration Center', icon: HubIcon, path: '/administration/integrations', children: [] },
      { id: 'team-engineering', label: 'Team Engineering Workbench', icon: ScienceIcon, path: '/platform/team-engineering-workbench', children: [] },
    ],
  },
];

function leafMatches(pathname: string, leafPath: string): boolean {
  if (leafPath === '/') return pathname === '/';
  return pathname === leafPath || pathname.startsWith(`${leafPath}/`);
}

/** Finds the group + section that own the given pathname (center header or nested route). */
export function findActiveTrail(pathname: string): { groupId: string; sectionId: string } | undefined {
  for (const group of NAV_GROUPS) {
    // Direct-center group (navigable header, no child sections).
    if (group.path && group.children.length === 0 && leafMatches(pathname, group.path)) {
      return { groupId: group.id, sectionId: group.id };
    }
    for (const section of group.children) {
      const ownsLeaf = section.children.some((leaf) => leafMatches(pathname, leaf.path));
      const ownsSection = section.path ? leafMatches(pathname, section.path) : false;
      if (ownsLeaf || ownsSection) {
        return { groupId: group.id, sectionId: section.id };
      }
    }
  }
  return undefined;
}

/** True when a group is a single navigable center with no child sections. */
export function isDirectCenterGroup(group: NavGroup): boolean {
  return !!group.path && group.children.length === 0;
}

export function isLeafActive(pathname: string, leafPath: string): boolean {
  return pathname === leafPath;
}
