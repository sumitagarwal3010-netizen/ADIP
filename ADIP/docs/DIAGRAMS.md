# ADIP Architecture & Flow Diagrams

Mermaid diagrams generated from the actual implementation. Sources referenced:
`src/App.tsx`, `src/routes/index.tsx`, `src/config/navConfig.ts`,
`src/config/personaConfig.ts`, `src/data/rbacCatalog.ts`, `src/data/rbacEngine.ts`,
`src/data/traceabilityModel.ts`, `src/persistence/*`, `src/events/*`.

> Render these in any Mermaid-capable viewer (GitHub, VS Code Mermaid preview, etc.).

---

## 1. Business Flow

The enterprise delivery value chain modeled by ADIP.

```mermaid
flowchart LR
    A[Demand] --> B[Portfolio Governance]
    B --> C[Application Portfolio]
    C --> D[Enterprise Architecture]
    D --> E[Technology Strategy]
    E --> F[SDLC Delivery]
    F --> G[Testing & Release]
    G --> H[Production Intelligence]
    H --> I[Knowledge Management]
    I --> J[Value Realization]
    J --> K[Executive Control Tower]
    K -. continuous feedback .-> B
```

---

## 2. System Architecture

Layered structure of the client-side SPA.

```mermaid
flowchart TB
    subgraph Presentation
        P1[pages/ executive centers and hubs]
        P2[components/ UI groups]
        P3[layouts AppLayout / Sidebar / TopBar]
        P4[charts and common]
    end
    subgraph State
        S1[context/ one provider per module]
        S2[hooks useEntitlement / useAutoRefresh / simulation]
    end
    subgraph Domain
        D1[data/ *Engine.ts]
        D2[services AI / summary / KPI / simulation]
        D3[data/ *Mock.ts seed data]
        D4[traceabilityModel and traceabilityEngine]
    end
    subgraph Infrastructure
        I1[events/ EventBus]
        I2[persistence/ engine and adapters]
        I3[rbacEngine / abacEngine / rowSecurityEngine]
    end

    Presentation --> State
    State --> Domain
    Domain --> Infrastructure
    State --> Infrastructure
```

---

## 3. Provider Hierarchy

Exact composition from `src/App.tsx` (outermost to innermost).

```mermaid
flowchart TB
    A[RootErrorBoundary] --> B[ThemeProvider + CssBaseline]
    B --> C[AuthenticationProvider]
    C --> D[StorageProvider]
    D --> E[PersonaProvider]
    E --> F[AbacProvider]
    F --> G[CopilotProvider]
    G --> H[ProductionIntelligenceProvider]
    H --> I[KnowledgeCenterProvider]
    I --> J[ValueRealizationProvider]
    J --> K[PortfolioGovernanceProvider]
    K --> L[ApplicationPortfolioProvider]
    L --> M[ArchitectureRepositoryProvider]
    M --> N[TechnologyStrategyProvider]
    N --> O[TransformationPmoProvider]
    O --> P[EnterpriseRiskProvider]
    P --> Q[EventProvider]
    Q --> R[WorkflowProvider]
    R --> S[NotificationProvider]
    S --> T[SimulationProvider]
    T --> U[BrowserRouter]
    U --> V[AppRoutes]
```

---

## 4. Executive Center Relationships

The 10 executive modules feeding the Control Tower, linked by shared traceability.
Routes from `src/routes/index.tsx`.

```mermaid
flowchart TB
    ECT[Executive Control Tower /]

    subgraph Investment_and_Portfolio
        PG[Portfolio Governance /executive/portfolio-governance]
        APM[Application Portfolio /executive/application-portfolio]
        TPMO[Transformation PMO /executive/transformation-pmo]
    end

    subgraph Architecture_and_Strategy
        AR[Architecture Repository /executive/architecture-repository]
        TS[Technology Strategy /executive/technology-strategy]
    end

    subgraph Delivery_Intelligence
        COP[AI Delivery Copilot /executive/ai-copilot]
        PI[Production Intelligence /production]
    end

    subgraph Outcomes_and_Learning
        VR[Value Realization /executive/value-realization]
        KC[Knowledge and Learning /knowledge-center]
        ER[Enterprise Risk /executive/enterprise-risk]
    end

    TC[Traceability Center /traceability]

    PG --> ECT
    APM --> ECT
    TPMO --> ECT
    AR --> ECT
    TS --> ECT
    COP --> ECT
    PI --> ECT
    VR --> ECT
    KC --> ECT
    ER --> ECT

    PG -.-> TC
    APM -.-> TC
    AR -.-> TC
    TS -.-> TC
    COP -.-> TC
    PI -.-> TC
    VR -.-> TC
    KC -.-> TC
    TPMO -.-> TC
    ER -.-> TC
    TC -.-> ECT
```

---

## 5. End-to-End Traceability

The lineage modeled in `src/data/traceabilityModel.ts` and surfaced by the Traceability Center.

```mermaid
flowchart LR
    Demand --> Program
    Program --> Project
    Project --> Architecture
    Architecture --> Development
    Development --> Release
    Release --> Production
    Production --> Incident
    Incident --> RCA
    RCA --> Knowledge
    Knowledge --> Value
    Value -. informs .-> Demand
```

---

## 6. Deployment Architecture

ADIP is a static SPA — build with Vite, serve the `dist/` bundle. No backend in demo mode.

```mermaid
flowchart TB
    subgraph Build_Time
        SRC[src/ TypeScript + React]
        TSC[tsc -b project references]
        VITE[vite build]
        SRC --> TSC --> VITE
        VITE --> DIST[dist/ static assets]
    end

    subgraph Runtime_Demo_Mode
        HOST[Static Web Host / Vite preview]
        BROWSER[Browser SPA]
        STORE[In-memory + localStorage persistence adapters]
        DIST --> HOST
        HOST --> BROWSER
        BROWSER <--> STORE
    end

    subgraph Future_Pluggable
        API[FutureApiAdapter]
        DB[FutureDatabaseAdapter]
    end

    BROWSER -. swappable via StorageAdapter .-> API
    BROWSER -. swappable via StorageAdapter .-> DB

    note["Demo mode: AuthGuard is pass-through; no Azure AD / token backend"]
    BROWSER --- note
```

---

## 7. SDLC Lifecycle

The SDLC Lifecycle Hub flow and its handoff into operations.
Routes: `/requirements`, `/architecture`, `/development`, `/testing`, `/release`, `/production`.

```mermaid
flowchart LR
    REQ[Requirements /requirements] --> ARCH[Architecture /architecture]
    ARCH --> DEV[Development /development]
    DEV --> TEST[Testing /testing]
    TEST --> REL[Release /release]
    REL --> PROD[Production Intelligence /production]
    PROD --> OPS[Operations /operations]

    COP[AI Delivery Copilot] -. recommendations .-> REQ
    COP -. recommendations .-> ARCH
    COP -. recommendations .-> DEV
    COP -. recommendations .-> TEST
    COP -. release readiness .-> REL

    REQ -. RTM .-> TRACE[Traceability Center]
    REL -. evidence .-> TRACE
    PROD -. incidents .-> TRACE
```

---

## 8. Governance Model

How visibility is resolved at runtime: persona → RBAC role → resource grants, plus
persona allow-lists for executive centers and ABAC/row-level scoping. All under demo mode.

```mermaid
flowchart TB
    USER[Demo User injected] --> PERSONA[Active Persona PersonaContext]
    PERSONA -->|persona.navHubs| SIDEBAR[Sidebar visible hubs]
    PERSONA -->|PERSONA_RBAC_ROLE| ROLE[RBAC Role]

    SIDEBAR -->|canAccessRoute per child| GATE{canAccessRoute path}

    GATE -->|gated prefix| ALLOW[Persona allow-lists *_ALLOWED_PERSONAS]
    GATE -->|mapped route| RRM[ROUTE_RESOURCE_MAP -> resource+permission]
    GATE -->|unmapped| OPEN[default allow]

    RRM --> RESOLVE[resolveAccess role permission resource]
    ROLE --> RESOLVE
    RESOLVE --> DECISION{allowed?}
    ALLOW --> DECISION

    DECISION -->|yes| RENDER[Route / hub rendered]
    DECISION -->|no| HIDE[Hidden from sidebar]

    ABAC[AbacProvider attribute scoping] -. demo visibility .-> RENDER
    ROW[rowSecurityEngine row-level scoping] -. demo visibility .-> RENDER

    DEMO[Demo Mode: AuthGuard pass-through; visibility not enforcement] --- DECISION
```
