export type Permission =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'review'
  | 'assign'
  | 'export'
  | 'administer';

export type ResourceType =
  | 'requirements'
  | 'architecture'
  | 'code'
  | 'tests'
  | 'releases'
  | 'incidents'
  | 'controls'
  | 'models'
  | 'prompts'
  | 'artifacts'
  | 'approvals'
  | 'reports'
  | 'dashboards'
  | 'knowledge';

export type RbacRoleId =
  | 'cio'
  | 'enterprise-architect'
  | 'solution-architect'
  | 'development-lead'
  | 'test-lead'
  | 'release-manager'
  | 'security-officer'
  | 'compliance-officer'
  | 'model-risk-officer'
  | 'auditor'
  | 'application-owner'
  | 'platform-administrator';

export interface PermissionDefinition {
  id: Permission;
  label: string;
  description: string;
}

export interface ResourceDefinition {
  id: ResourceType;
  label: string;
  domain: string;
  description: string;
}

export interface RoleGrant {
  resource: ResourceType;
  permissions: Permission[];
}

export interface RoleDefinition {
  id: RbacRoleId;
  label: string;
  description: string;
  grants: RoleGrant[];
  dashboards: string[];
  reports: string[];
  actions: string[];
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  { id: 'view', label: 'View', description: 'Read access to resource content and metadata' },
  { id: 'create', label: 'Create', description: 'Create new records or artifacts' },
  { id: 'edit', label: 'Edit', description: 'Modify existing records' },
  { id: 'delete', label: 'Delete', description: 'Remove or archive records' },
  { id: 'approve', label: 'Approve', description: 'Final approval authority on workflow items' },
  { id: 'review', label: 'Review', description: 'Perform review and provide feedback' },
  { id: 'assign', label: 'Assign', description: 'Assign reviewers or owners' },
  { id: 'export', label: 'Export', description: 'Export reports and evidence packages' },
  { id: 'administer', label: 'Administer', description: 'Full administrative control including RBAC' },
];

export const RESOURCE_CATALOG: ResourceDefinition[] = [
  { id: 'requirements', label: 'Requirements', domain: 'SDLC', description: 'BRD/FRD and requirement artifacts' },
  { id: 'architecture', label: 'Architecture', domain: 'SDLC', description: 'Architecture documents and API designs' },
  { id: 'code', label: 'Code', domain: 'SDLC', description: 'Development changes and code artifacts' },
  { id: 'tests', label: 'Tests', domain: 'SDLC', description: 'Test cases, evidence, and sign-offs' },
  { id: 'releases', label: 'Releases', domain: 'SDLC', description: 'Release packages and go/no-go decisions' },
  { id: 'incidents', label: 'Incidents', domain: 'Operations', description: 'Production and AI incident records' },
  { id: 'controls', label: 'Controls', domain: 'Governance', description: 'Security and compliance controls' },
  { id: 'models', label: 'Models', domain: 'AI Governance', description: 'ML model inventory and lifecycle' },
  { id: 'prompts', label: 'Prompts', domain: 'AI Governance', description: 'Prompt templates and governance' },
  { id: 'artifacts', label: 'Artifacts', domain: 'Platform', description: 'Generated AI artifacts across hubs' },
  { id: 'approvals', label: 'Approvals', domain: 'Governance', description: 'Enterprise approval workflow items' },
  { id: 'reports', label: 'Reports', domain: 'Executive', description: 'Executive and compliance reports' },
  { id: 'dashboards', label: 'Dashboards', domain: 'Platform', description: 'Hub dashboards and control towers' },
  { id: 'knowledge', label: 'Knowledge Articles', domain: 'Knowledge', description: 'Playbooks, lessons learned, reusable assets' },
];

const ALL_VIEW: Permission[] = ['view'];
const SDLC_RW: Permission[] = ['view', 'create', 'edit', 'review', 'export'];
const GOV_READ: Permission[] = ['view', 'review', 'export'];
const FULL: Permission[] = ['view', 'create', 'edit', 'delete', 'approve', 'review', 'assign', 'export', 'administer'];

function grants(entries: [ResourceType, Permission[]][]): RoleGrant[] {
  return entries.map(([resource, permissions]) => ({ resource, permissions }));
}

export const ROLE_CATALOG: RoleDefinition[] = [
  {
    id: 'cio',
    label: 'CIO',
    description: 'Enterprise portfolio oversight, executive reporting, and strategic approval authority.',
    grants: grants([
      ['dashboards', ['view', 'export', 'administer']],
      ['reports', ['view', 'export', 'approve']],
      ['approvals', ['view', 'approve', 'export']],
      ['requirements', ALL_VIEW],
      ['architecture', ALL_VIEW],
      ['releases', ALL_VIEW],
      ['incidents', ALL_VIEW],
      ['controls', ALL_VIEW],
      ['models', ALL_VIEW],
      ['artifacts', ['view', 'export']],
    ]),
    dashboards: ['Executive Control Tower', 'Governance Reports', 'Approval Analytics'],
    reports: ['Executive Reports', 'Board Reporting', 'Portfolio Health'],
    actions: ['approve', 'export', 'review'],
  },
  {
    id: 'enterprise-architect',
    label: 'Enterprise Architect',
    description: 'End-to-end SDLC lineage, architecture governance, and cross-domain impact analysis.',
    grants: grants([
      ['requirements', SDLC_RW],
      ['architecture', [...SDLC_RW, 'approve']],
      ['code', ALL_VIEW],
      ['tests', ALL_VIEW],
      ['releases', ['view', 'review', 'export']],
      ['approvals', ['view', 'review', 'assign']],
      ['dashboards', ALL_VIEW],
      ['artifacts', ['view', 'export']],
      ['knowledge', ALL_VIEW],
    ]),
    dashboards: ['Traceability Center', 'Architecture Hub', 'Approval Workflow'],
    reports: ['Traceability Reports', 'Impact Assessment'],
    actions: ['review', 'assign', 'export'],
  },
  {
    id: 'solution-architect',
    label: 'Solution Architect',
    description: 'Solution design, API governance, and technical review across delivery squads.',
    grants: grants([
      ['requirements', ['view', 'review', 'export']],
      ['architecture', SDLC_RW],
      ['code', ['view', 'review']],
      ['tests', ALL_VIEW],
      ['releases', ALL_VIEW],
      ['approvals', ['view', 'review']],
      ['dashboards', ALL_VIEW],
      ['artifacts', ['view', 'export']],
    ]),
    dashboards: ['Architecture Hub', 'Development Hub', 'Traceability Center'],
    reports: ['Architecture Reports'],
    actions: ['review', 'export'],
  },
  {
    id: 'development-lead',
    label: 'Development Lead',
    description: 'Engineering delivery, code quality, and development artifact governance.',
    grants: grants([
      ['requirements', ALL_VIEW],
      ['architecture', ALL_VIEW],
      ['code', SDLC_RW],
      ['tests', ALL_VIEW],
      ['releases', ['view', 'review']],
      ['approvals', ['view', 'create', 'review']],
      ['artifacts', ['view', 'create', 'export']],
      ['dashboards', ALL_VIEW],
    ]),
    dashboards: ['Development Hub', 'Requirements Hub', 'Approval Workflow'],
    reports: ['Development Reports'],
    actions: ['create', 'edit', 'review'],
  },
  {
    id: 'test-lead',
    label: 'Test Lead',
    description: 'Test strategy, evidence packs, and quality gate sign-offs.',
    grants: grants([
      ['requirements', ALL_VIEW],
      ['code', ALL_VIEW],
      ['tests', [...SDLC_RW, 'approve']],
      ['releases', ['view', 'review']],
      ['approvals', ['view', 'review', 'create']],
      ['artifacts', ['view', 'export']],
      ['dashboards', ALL_VIEW],
    ]),
    dashboards: ['Testing Hub', 'Release Center', 'Approval Workflow'],
    reports: ['Test Evidence Reports'],
    actions: ['review', 'create', 'export'],
  },
  {
    id: 'release-manager',
    label: 'Release Manager',
    description: 'Release readiness, deployment governance, and go/no-go authority.',
    grants: grants([
      ['tests', ALL_VIEW],
      ['releases', [...SDLC_RW, 'approve']],
      ['incidents', ALL_VIEW],
      ['approvals', ['view', 'review', 'assign', 'approve']],
      ['dashboards', ALL_VIEW],
      ['artifacts', ['view', 'export']],
    ]),
    dashboards: ['Release Center', 'Production Center', 'Approval Workflow'],
    reports: ['Release Readiness', 'Go/No-Go Reports'],
    actions: ['approve', 'assign', 'review'],
  },
  {
    id: 'security-officer',
    label: 'Security Officer',
    description: 'Security posture, AI controls, and incident response governance.',
    grants: grants([
      ['controls', [...GOV_READ, 'edit', 'approve']],
      ['models', GOV_READ],
      ['prompts', GOV_READ],
      ['incidents', ['view', 'review', 'export']],
      ['approvals', ['view', 'review', 'approve']],
      ['dashboards', ALL_VIEW],
      ['artifacts', ['view', 'export']],
    ]),
    dashboards: ['AI Governance Hub', 'AI Controls', 'AI Incidents', 'Governance Hub'],
    reports: ['Security Reports', 'Control Validation'],
    actions: ['review', 'approve', 'export'],
  },
  {
    id: 'compliance-officer',
    label: 'Compliance Officer',
    description: 'Regulatory compliance, evidence management, and policy enforcement.',
    grants: grants([
      ['controls', GOV_READ],
      ['approvals', ['view', 'review', 'approve', 'export']],
      ['reports', ['view', 'export', 'approve']],
      ['artifacts', ['view', 'export']],
      ['dashboards', ALL_VIEW],
      ['knowledge', ALL_VIEW],
    ]),
    dashboards: ['Governance Hub', 'Approval Workflow', 'Compliance Reports'],
    reports: ['Compliance Reports', 'Evidence Reports'],
    actions: ['review', 'approve', 'export'],
  },
  {
    id: 'model-risk-officer',
    label: 'Model Risk Officer',
    description: 'AI model risk, fairness reviews, and model governance oversight.',
    grants: grants([
      ['models', [...GOV_READ, 'edit', 'approve']],
      ['prompts', GOV_READ],
      ['controls', ALL_VIEW],
      ['approvals', ['view', 'review', 'approve']],
      ['incidents', ALL_VIEW],
      ['dashboards', ALL_VIEW],
      ['artifacts', ['view', 'export']],
    ]),
    dashboards: ['AI Governance Hub', 'Model Inventory', 'AI Risk', 'Approval Workflow'],
    reports: ['Model Risk Reports', 'AI Incident Reports'],
    actions: ['review', 'approve', 'export'],
  },
  {
    id: 'auditor',
    label: 'Auditor',
    description: 'Read-only audit access to traceability, evidence, and approval history.',
    grants: grants([
      ['requirements', ALL_VIEW],
      ['architecture', ALL_VIEW],
      ['tests', ALL_VIEW],
      ['releases', ALL_VIEW],
      ['controls', ALL_VIEW],
      ['approvals', ['view', 'export']],
      ['reports', ['view', 'export']],
      ['artifacts', ['view', 'export']],
      ['dashboards', ALL_VIEW],
      ['knowledge', ALL_VIEW],
    ]),
    dashboards: ['Traceability Center', 'Evidence', 'Approval History'],
    reports: ['Audit Reports', 'Traceability Reports'],
    actions: ['view', 'export'],
  },
  {
    id: 'application-owner',
    label: 'Application Owner',
    description: 'Application portfolio health, SDLC delivery, and approval participation.',
    grants: grants([
      ['requirements', ['view', 'review']],
      ['architecture', ALL_VIEW],
      ['code', ALL_VIEW],
      ['tests', ALL_VIEW],
      ['releases', ['view', 'review', 'approve']],
      ['incidents', ['view', 'review']],
      ['approvals', ['view', 'create', 'review']],
      ['artifacts', ['view', 'create', 'export']],
      ['dashboards', ALL_VIEW],
    ]),
    dashboards: ['SDLC Lifecycle Hub', 'Approval Workflow', 'Production Center'],
    reports: ['Application Health', 'Incident Reports'],
    actions: ['review', 'create', 'export'],
  },
  {
    id: 'platform-administrator',
    label: 'Platform Administrator',
    description: 'Full platform administration including RBAC, integrations, and entitlements.',
    grants: RESOURCE_CATALOG.map((r) => ({ resource: r.id, permissions: [...FULL] })),
    dashboards: ['All Hubs', 'RBAC Administration', 'Platform Administration'],
    reports: ['All Reports', 'RBAC Reports'],
    actions: ['administer', 'assign', 'approve', 'export', 'delete'],
  },
];

export const ROLE_MAP = Object.fromEntries(ROLE_CATALOG.map((r) => [r.id, r])) as Record<RbacRoleId, RoleDefinition>;

export const ROUTE_RESOURCE_MAP: Record<string, { resource: ResourceType; permission: Permission }> = {
  '/': { resource: 'dashboards', permission: 'view' },
  '/persona': { resource: 'dashboards', permission: 'view' },
  '/executive/portfolio-health': { resource: 'dashboards', permission: 'view' },
  '/executive/program-status': { resource: 'dashboards', permission: 'view' },
  '/executive/strategic-risks': { resource: 'reports', permission: 'view' },
  '/executive/executive-summary': { resource: 'dashboards', permission: 'view' },
  '/executive/board-reporting': { resource: 'reports', permission: 'view' },
  '/requirements': { resource: 'requirements', permission: 'view' },
  '/architecture': { resource: 'architecture', permission: 'view' },
  '/development': { resource: 'code', permission: 'view' },
  '/testing': { resource: 'tests', permission: 'view' },
  '/release': { resource: 'releases', permission: 'view' },
  '/production': { resource: 'incidents', permission: 'view' },
  '/operations': { resource: 'incidents', permission: 'view' },
  '/operations/incidents': { resource: 'incidents', permission: 'view' },
  '/operations/availability': { resource: 'dashboards', permission: 'view' },
  '/operations/capacity': { resource: 'dashboards', permission: 'view' },
  '/governance': { resource: 'controls', permission: 'view' },
  '/governance/compliance': { resource: 'controls', permission: 'view' },
  '/governance/risk': { resource: 'controls', permission: 'view' },
  '/governance/evidence': { resource: 'artifacts', permission: 'view' },
  '/governance/approval-workflow': { resource: 'approvals', permission: 'view' },
  '/ai-governance': { resource: 'models', permission: 'view' },
  '/ai-governance/model-inventory': { resource: 'models', permission: 'view' },
  '/ai-governance/prompt-governance': { resource: 'prompts', permission: 'view' },
  '/ai-governance/ai-risk': { resource: 'models', permission: 'view' },
  '/ai-governance/ai-controls': { resource: 'controls', permission: 'view' },
  '/ai-governance/ai-incidents': { resource: 'incidents', permission: 'view' },
  '/traceability': { resource: 'dashboards', permission: 'view' },
  '/traceability/matrix': { resource: 'requirements', permission: 'view' },
  '/traceability/ai': { resource: 'models', permission: 'view' },
  '/traceability/impact': { resource: 'architecture', permission: 'view' },
  '/traceability/executive': { resource: 'reports', permission: 'view' },
  '/traceability/reports': { resource: 'reports', permission: 'view' },
  '/learning': { resource: 'knowledge', permission: 'view' },
  '/knowledge/best-practices': { resource: 'knowledge', permission: 'view' },
  '/knowledge/reusable-assets': { resource: 'knowledge', permission: 'view' },
  '/knowledge/lessons-learned': { resource: 'knowledge', permission: 'view' },
  '/reports': { resource: 'reports', permission: 'view' },
  '/reports/compliance': { resource: 'reports', permission: 'view' },
  '/reports/audit': { resource: 'reports', permission: 'view' },
  '/reports/trends': { resource: 'reports', permission: 'view' },
  '/administration': { resource: 'dashboards', permission: 'administer' },
  '/administration/rbac': { resource: 'dashboards', permission: 'administer' },
};

export const APPROVAL_ACTION_PERMISSIONS: Record<string, Permission> = {
  Submit: 'create',
  'Assign Reviewer': 'assign',
  'Reassign Reviewer': 'assign',
  Approve: 'approve',
  Reject: 'review',
  'Request Changes': 'review',
  Escalate: 'review',
  Close: 'approve',
};

export const PERSONA_RBAC_ROLE: Record<string, RbacRoleId> = {
  cio: 'cio',
  cto: 'solution-architect',
  ciso: 'security-officer',
  'audit-head': 'auditor',
  'compliance-officer': 'compliance-officer',
  'risk-officer': 'model-risk-officer',
  'enterprise-architect': 'enterprise-architect',
  'application-owner': 'application-owner',
  developer: 'development-lead',
  tester: 'test-lead',
  'release-manager': 'release-manager',
  'operations-manager': 'platform-administrator',
  'model-owner': 'model-risk-officer',
};

export const PERSONA_ENTITLEMENT_MATRIX = Object.entries(PERSONA_RBAC_ROLE).map(([personaId, roleId]) => ({
  personaId,
  roleId,
  roleLabel: ROLE_MAP[roleId].label,
  dashboards: ROLE_MAP[roleId].dashboards,
  reports: ROLE_MAP[roleId].reports,
  actions: ROLE_MAP[roleId].actions,
}));

export const RBAC_KPI_MOCK = {
  totalRoles: ROLE_CATALOG.length,
  totalPermissions: PERMISSION_CATALOG.length,
  totalResources: RESOURCE_CATALOG.length,
  personaMappings: Object.keys(PERSONA_RBAC_ROLE).length,
  sodViolations: 2,
  effectiveGrants: ROLE_CATALOG.reduce((sum, r) => sum + r.grants.length, 0),
};
