import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import TuneIcon from '@mui/icons-material/Tune';
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
 * Hierarchical navigation — 4 groups, 13 direct entries (Phase 1).
 * Parked from nav: Capacity Planning, Infrastructure Sizing, Testing.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'executive-ai',
    label: 'Executive AI',
    icon: DashboardIcon,
    children: [
      { id: 'executive-advisor', label: 'Executive Advisor', icon: SmartToyIcon, path: '/executive-ai/executive-advisor', children: [] },
      { id: 'technology-advisor', label: 'Technology Advisor', icon: RocketLaunchIcon, path: '/executive-ai/technology-advisor', children: [] },
      { id: 'investment-advisor', label: 'Investment Advisor', icon: TrendingUpIcon, path: '/executive-ai/investment-advisor', children: [] },
    ],
  },
  {
    id: 'delivery-ai',
    label: 'AI SDLC',
    icon: AccountTreeIcon,
    children: [
      { id: 'requirements-engineering', label: 'Requirements Engineering', icon: AssignmentIcon, path: '/ai-sdlc/requirements-engineering', children: [] },
      { id: 'design-architecture', label: 'Design & Architecture', icon: DesignServicesIcon, path: '/ai-sdlc/design-architecture', children: [] },
      { id: 'development', label: 'Development', icon: CodeIcon, path: '/ai-sdlc/development', children: [] },
      { id: 'release', label: 'Release', icon: RocketLaunchIcon, path: '/ai-sdlc/release', children: [] },
    ],
  },
  {
    id: 'governance-ai',
    label: 'Governance',
    icon: GavelIcon,
    children: [
      { id: 'ai-oversight', label: 'AI Oversight', icon: SmartToyIcon, path: '/governance/ai-oversight', children: [] },
      { id: 'compliance-automation', label: 'Compliance Automation', icon: ShieldIcon, path: '/governance/compliance-automation', children: [] },
      { id: 'architecture-assurance', label: 'Architecture Assurance', icon: AccountTreeIcon, path: '/governance/architecture-assurance', children: [] },
    ],
  },
  {
    id: 'enterprise-ai',
    label: 'Enterprise AI',
    icon: SettingsIcon,
    children: [
      { id: 'enterprise-evidence-hub', label: 'Enterprise Evidence Hub', icon: HubIcon, path: '/enterprise-ai/enterprise-evidence-hub', children: [] },
      { id: 'knowledge-intelligence', label: 'Knowledge Intelligence', icon: MenuBookIcon, path: '/enterprise-ai/knowledge-intelligence', children: [] },
      { id: 'administration', label: 'Administration', icon: TuneIcon, path: '/enterprise-ai/administration', children: [] },
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
