# ADIP Persona Visibility Matrix

This document describes **who sees what** in ADIP. It is generated from the actual
implementation:

- Personas: `src/config/personaConfig.ts` (`PERSONAS`, `PersonaId`)
- Persona → RBAC role mapping: `src/data/rbacCatalog.ts` (`PERSONA_RBAC_ROLE`)
- RBAC roles, resources, permissions: `src/data/rbacCatalog.ts`
- Navigation hubs: `src/config/navConfig.ts` (`NAV_HUBS`)
- Runtime visibility logic: `src/components/layouts/Sidebar.tsx`,
  `src/data/rbacEngine.ts`, `src/hooks/useEntitlement.ts`
- Executive-center access lists: the `*_ALLOWED_PERSONAS` arrays in `src/types/*` and
  `ACTIVITY_CENTER_PERSONAS` in `src/data/activityStreamEngine.ts`

> **Demo-mode note.** Authentication is disabled (`src/config/demoMode.ts`,
> `src/components/auth/AuthGuard.tsx` is a pass-through). RBAC/ABAC and persona scoping
> shape **visibility only** — they are **not** security enforcement. The TopBar persona
> switcher is labelled accordingly in the UI.

---

## 1. How Visibility Is Computed (Actual Runtime Behavior)

There are three layers, applied in this order:

1. **Persona → relevant hubs.** Each persona declares `navHubs` (hub ids it should see).
   `Sidebar.tsx` builds `relevant = new Set(persona.navHubs)` and shows only those hubs,
   unless the user toggles **"Show all modules"** (`showAll`), which reveals every hub so no
   module is orphaned.

2. **Per-route entitlement.** For each child route the sidebar calls
   `canAccessRoute(child.path)` (from `useEntitlement` → `entitlementResolverForPersona`).
   A hub is only rendered if at least one of its children passes this check
   (`hubs.filter(h => h.children.some(child => canAccessRoute(child.path)))`).

3. **Route resolution inside `canAccessRoute`** (`src/data/rbacEngine.ts`):
   - Certain prefixes are gated by **persona allow-lists** (see §4), independent of RBAC role:
     `/executive/ai-copilot`, `/production`, `/knowledge-center` (+`/learning`),
     `/executive/value-realization`, `/executive/portfolio-governance`,
     `/executive/application-portfolio`, `/executive/architecture-repository`,
     `/executive/technology-strategy`, `/executive/transformation-pmo`,
     `/executive/enterprise-risk`, `/governance/activity-center`.
   - Every other path is resolved through `ROUTE_RESOURCE_MAP[path]` → an RBAC grant check
     (`resolveAccess(roleId, permission, resource)`).
   - If a path has no entry in `ROUTE_RESOURCE_MAP` and matches no prefix, access defaults
     to allowed (`return true`).

The persona's RBAC role comes from `PERSONA_RBAC_ROLE`; `useEntitlement` resolves it via
`entitlementResolverForPersona(personaId)`.

---

## 2. Personas (13)

Source: `src/config/personaConfig.ts`. Default persona: **CIO** (`DEFAULT_PERSONA = 'cio'`).

| Persona ID | Label | Title | Mapped RBAC Role | Relevant Hubs (`navHubs`) |
|---|---|---|---|---|
| `cio` | CIO | Chief Information Officer | `cio` | executive, traceability, reports, governance |
| `cto` | CTO | Chief Technology Officer | `solution-architect` | executive, sdlc, traceability, reports |
| `ciso` | CISO | Chief Information Security Officer | `security-officer` | governance, ai-governance, operations, traceability |
| `audit-head` | Audit Head | Head of Internal Audit | `auditor` | governance, traceability, reports |
| `compliance-officer` | Compliance Officer | Regulatory Compliance Officer | `compliance-officer` | governance, traceability, reports |
| `risk-officer` | Risk Officer | Enterprise Risk Officer | `model-risk-officer` | governance, ai-governance, traceability, executive |
| `enterprise-architect` | Enterprise Architect | Principal Enterprise Architect | `enterprise-architect` | traceability, sdlc, ai-governance, executive |
| `application-owner` | Application Owner | Payments Application Owner | `application-owner` | operations, sdlc, traceability |
| `developer` | Developer | Senior Engineer | `development-lead` | sdlc, traceability, knowledge |
| `tester` | Tester | QA Lead | `test-lead` | sdlc, traceability, knowledge |
| `release-manager` | Release Manager | Release Manager | `release-manager` | sdlc, operations, traceability |
| `operations-manager` | Operations Manager | Banking Operations Control | `platform-administrator` | operations, executive, reports, administration\* |
| `model-owner` | Model Owner | AI Model Owner | `model-risk-officer` | ai-governance, traceability, governance |

> \* `operations-manager.navHubs` includes `administration`, which is **not** a hub id in
> `NAV_HUBS` (administration routes live under the `governance` hub). That entry therefore
> matches no hub at render time. See the Documentation Readiness Summary for this observation.

### Personas surfaced in the demo switcher

`DEMO_SWITCHABLE_PERSONAS` (`src/config/demoMode.ts`) exposes **8** of the 13 personas in
the TopBar switcher: `cio`, `cto`, `audit-head`, `compliance-officer`, `application-owner`,
`enterprise-architect`, `operations-manager`, `ciso`.

The remaining **5** personas exist in `PERSONAS` and are fully wired for entitlement, but are
not currently listed in the switcher: `risk-officer`, `developer`, `tester`,
`release-manager`, `model-owner`.

---

## 3. Persona × Navigation Hub Matrix

Hubs are defined in `src/config/navConfig.ts`. "Relevant" (●) means the hub appears in the
persona's default sidebar (`persona.navHubs`); all hubs remain reachable via **Show all
modules**. A hub still only renders if ≥1 child route passes `canAccessRoute`.

| Persona \ Hub | executive | sdlc | traceability | operations | governance | ai-governance | knowledge | reports |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| CIO | ● | | ● | | ● | | | ● |
| CTO | ● | ● | ● | | | | | ● |
| CISO | | | ● | ● | ● | ● | | |
| Audit Head | | | ● | | ● | | | ● |
| Compliance Officer | | | ● | | ● | | | ● |
| Risk Officer | ● | | ● | | ● | ● | | |
| Enterprise Architect | ● | ● | ● | | | ● | | |
| Application Owner | | ● | ● | ● | | | | |
| Developer | | ● | ● | | | | ● | |
| Tester | | ● | ● | | | | ● | |
| Release Manager | | ● | ● | ● | | | | |
| Operations Manager | ● | | | ● | | | | ● |
| Model Owner | | | ● | | ● | ● | | |

---

## 4. Executive-Center & Gated-Prefix Access Lists

These prefixes are gated by **persona allow-lists** inside `canAccessRoute` (not by RBAC role
grants). ✔ = persona is in the allow-list and may open the center.

Sources:
`COPILOT_ALLOWED_PERSONAS` (`types/copilot.ts`),
`PRODUCTION_INTEL_ALLOWED_PERSONAS` (`types/productionIntelligence.ts`),
`KNOWLEDGE_CENTER_ALLOWED_PERSONAS` (`types/knowledgeCenter.ts`),
`VALUE_REALIZATION_ALLOWED_PERSONAS` (`types/valueRealization.ts`),
`PORTFOLIO_GOVERNANCE_ALLOWED_PERSONAS` (`types/portfolioGovernance.ts`),
`APPLICATION_PORTFOLIO_ALLOWED_PERSONAS` (`types/applicationPortfolio.ts`),
`ARCHITECTURE_REPOSITORY_ALLOWED_PERSONAS` (`types/architectureRepository.ts`),
`TECHNOLOGY_STRATEGY_ALLOWED_PERSONAS` (`types/technologyStrategy.ts`),
`TRANSFORMATION_PMO_ALLOWED_PERSONAS` (`types/transformationPmo.ts`),
`ENTERPRISE_RISK_ALLOWED_PERSONAS` (`types/enterpriseRisk.ts`),
`ACTIVITY_CENTER_PERSONAS` (`data/activityStreamEngine.ts`).

Legend for columns: **Copilot** = AI Delivery Copilot · **ProdIntel** = Production
Intelligence · **Know** = Knowledge & Learning · **Value** = Value Realization · **PortGov** =
Portfolio Governance · **AppPort** = Application Portfolio · **ArchRepo** = Architecture
Repository · **TechStrat** = Technology Strategy · **PMO** = Transformation PMO · **EntRisk** =
Enterprise Risk · **Activity** = Activity Center.

| Persona | Copilot | ProdIntel | Know | Value | PortGov | AppPort | ArchRepo | TechStrat | PMO | EntRisk | Activity |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| CIO | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| CTO | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | |
| CISO | | | ✔ | ✔ | | ✔ | ✔ | | | ✔ | |
| Audit Head | ✔ | ✔ | ✔ | ✔ | | ✔ | | | | | ✔ |
| Compliance Officer | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Risk Officer | | | | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | |
| Enterprise Architect | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | |
| Application Owner | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | |
| Developer | ✔ | ✔ | ✔ | | | | | | | | |
| Tester | ✔ | ✔ | ✔ | | | | | | | | |
| Release Manager | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | |
| Operations Manager | | ✔ | | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Model Owner | | | | | | | | | | | |

> **Model Owner** appears in none of these allow-lists; its reach is limited to its relevant
> hubs (ai-governance, traceability, governance) and any route that resolves through
> `ROUTE_RESOURCE_MAP` for the `model-risk-officer` role.

---

## 5. RBAC Roles, Resources & Permissions

Source: `src/data/rbacCatalog.ts`.

### Permissions (9)

`view`, `create`, `edit`, `delete`, `approve`, `review`, `assign`, `export`, `administer`.

### Resources (14)

| Resource | Domain |
|---|---|
| `requirements` | SDLC |
| `architecture` | SDLC |
| `code` | SDLC |
| `tests` | SDLC |
| `releases` | SDLC |
| `incidents` | Operations |
| `controls` | Governance |
| `models` | AI Governance |
| `prompts` | AI Governance |
| `artifacts` | Platform |
| `approvals` | Governance |
| `reports` | Executive |
| `dashboards` | Platform |
| `knowledge` | Knowledge |

### Roles (12)

| Role ID | Label | Focus |
|---|---|---|
| `cio` | CIO | Portfolio oversight, executive reporting, strategic approval |
| `enterprise-architect` | Enterprise Architect | SDLC lineage, architecture governance, impact analysis |
| `solution-architect` | Solution Architect | Solution design, API governance, technical review |
| `development-lead` | Development Lead | Engineering delivery, code quality |
| `test-lead` | Test Lead | Test strategy, evidence, quality gates |
| `release-manager` | Release Manager | Release readiness, go/no-go authority |
| `security-officer` | Security Officer | Security posture, AI controls, incident response |
| `compliance-officer` | Compliance Officer | Regulatory compliance, evidence, policy |
| `model-risk-officer` | Model Risk Officer | AI model risk, fairness, model governance |
| `auditor` | Auditor | Audit visibility, findings & observation management |
| `application-owner` | Application Owner | Application portfolio health, SDLC delivery |
| `platform-administrator` | Platform Administrator | Full administration incl. RBAC & entitlements |

### Role × Resource Permission Matrix

Derived from each role's `grants`. Cells list granted permissions; blank = no grant.
Abbreviations: V=view, C=create, E=edit, D=delete, A=approve, R=review, As=assign, X=export,
Ad=administer.

| Role \ Resource | requirements | architecture | code | tests | releases | incidents | controls | models | prompts | artifacts | approvals | reports | dashboards | knowledge |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CIO | V | V | | | V | V | V | V | | V,X | V,A,X | V,X,A | V,X,Ad | |
| Enterprise Architect | V,C,E,R,X | V,C,E,R,X,A | V | V | V,R,X | | | | | V,X | V,R,As | | V | V |
| Solution Architect | V,R,X | V,C,E,R,X | V,R | V | V | | | | | V,X | V,R | | V | |
| Development Lead | V | V | V,C,E,R,X | V | V,R | | | | | V,C,X | V,C,R | | V | |
| Test Lead | V | | V | V,C,E,R,X,A | V,R | | | | | V,X | V,R,C | | V | |
| Release Manager | | | | V | V,C,E,R,X,A | V | | | | V,X | V,R,As,A | | V | |
| Security Officer | | | | | | V,R,X | V,R,X,E,A | V,R,X | V,R,X | V,X | V,R,A | | V | |
| Compliance Officer | | | | | | | V,R,X | | | V,X | V,R,A,X | V,X,A | V | V |
| Model Risk Officer | | | | | | V | V | V,R,X,E,A | V,R,X | V,X | V,R,A | | V | |
| Auditor | V | V | | V | V | | V,C,E,R,X | | | V,X | V,X | V,X | V | V |
| Application Owner | V,R | V | V | V | V,R,A | V,R | | | | V,C,X | V,C,R | | V | |
| Platform Administrator | full | full | full | full | full | full | full | full | full | full | full | full | full | full |

> "full" = all 9 permissions (`platform-administrator` is granted every permission on every
> resource via `RESOURCE_CATALOG.map(... FULL)`).

### Persona Entitlement Summary

Source: `PERSONA_ENTITLEMENT_MATRIX` (derived from `PERSONA_RBAC_ROLE` + `ROLE_MAP`).

| Persona | Role | Default Dashboards | Default Reports | Actions |
|---|---|---|---|---|
| cio | CIO | Executive Control Tower, Governance Reports, Approval Analytics, Audit Center | Executive Reports, Board Reporting, Portfolio Health | approve, export, review |
| cto | Solution Architect | Architecture Hub, Development Hub, Traceability Center | Architecture Reports | review, export |
| ciso | Security Officer | AI Governance Hub, AI Controls, AI Incidents, Governance Hub, Audit Center | Security Reports, Control Validation | review, approve, export |
| audit-head | Auditor | Audit Center, Traceability Center, Evidence Repository, Approval History | Audit Reports, Traceability Reports | view, edit, review, export |
| compliance-officer | Compliance Officer | Governance Hub, Approval Workflow, Compliance Reports, Audit Center | Compliance Reports, Evidence Reports | review, approve, export |
| risk-officer | Model Risk Officer | AI Governance Hub, Model Inventory, AI Risk, Approval Workflow | Model Risk Reports, AI Incident Reports | review, approve, export |
| enterprise-architect | Enterprise Architect | Traceability Center, Architecture Hub, Approval Workflow | Traceability Reports, Impact Assessment | review, assign, export |
| application-owner | Application Owner | SDLC Lifecycle Hub, Approval Workflow, Production Center, Audit Center | Application Health, Incident Reports | review, create, export |
| developer | Development Lead | Development Hub, Requirements Hub, Approval Workflow | Development Reports | create, edit, review |
| tester | Test Lead | Testing Hub, Release Center, Approval Workflow | Test Evidence Reports | review, create, export |
| release-manager | Release Manager | Release Center, Production Center, Approval Workflow | Release Readiness, Go/No-Go Reports | approve, assign, review |
| operations-manager | Platform Administrator | All Hubs, RBAC Administration, Platform Administration, Authentication Health | All Reports, RBAC Reports | administer, assign, approve, export, delete |
| model-owner | Model Risk Officer | AI Governance Hub, Model Inventory, AI Risk, Approval Workflow | Model Risk Reports, AI Incident Reports | review, approve, export |

---

## 6. Approval Action Permissions

Source: `APPROVAL_ACTION_PERMISSIONS` (`rbacCatalog.ts`). `canPerformApprovalAction(action)`
maps each workflow action to a required permission on the `approvals` resource.

| Action | Required Permission |
|---|---|
| Submit | create |
| Assign Reviewer | assign |
| Reassign Reviewer | assign |
| Approve | approve |
| Reject | review |
| Request Changes | review |
| Escalate | review |
| Close | approve |
| Release | approve |
