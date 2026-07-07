# ADIP — Solution Architecture (Phase 14)

## Logical architecture

```mermaid
flowchart TB
  subgraph Client
    UI[React / Vite / TS · MUI]
    FLAG{Data source flag}
    UI --> FLAG
    FLAG -->|mock| MOCK[Mock / Simulation layer]
    FLAG -->|backend| APICLIENT[apiClient]
  end
  subgraph Backend[FastAPI Backend]
    API[API layer /api/v1]
    SVC[Service layer]
    REPO[Repository layer]
    ORM[SQLAlchemy ORM]
    LLM[LLM abstraction - scaffold]
    API --> SVC --> REPO --> ORM
    SVC -.-> LLM
  end
  APICLIENT -->|REST/JSON| API
  ORM --> DB[(SQLite dev / PostgreSQL prod)]
```

## Component diagram

```mermaid
flowchart LR
  subgraph API
    CRUD[CRUD routers x28]
    SDLC[SDLC summaries]
    COP[Copilots]
    EXE[Executive + Analytics]
    ART[Artifact generation]
    TRC[Traceability]
    KT[Knowledge + Transformation]
    LLMM[LLM meta]
  end
  subgraph Services
    BASE[BaseService]
    SDLCS[SdlcService]
    ANA[AnalyticsService]
    KNW[Knowledge/Transformation]
    GEN[ArtifactGenerator]
  end
  CRUD --> BASE
  SDLC --> SDLCS
  COP --> SDLCS
  EXE --> SDLCS & ANA
  ART --> GEN --> SDLCS
  TRC --> SDLCS & ANA
  KT --> KNW
  BASE --> REPO[BaseRepository]
  SDLCS --> AGG[fetch_all]
  ANA --> AGG
  KNW --> AGG
  AGG --> REPO
```

## Sequence — business summary request

```mermaid
sequenceDiagram
  participant FE as Frontend (apiClient)
  participant R as Router (/sdlc)
  participant S as SdlcService
  participant Rep as fetch_all / BaseRepository
  participant DB as Database
  FE->>R: GET /sdlc/projects/1/requirements/summary
  R->>S: requirement_summary(1)
  S->>Rep: fetch_all(Requirement, {project_id:1})
  Rep->>DB: SELECT ... WHERE project_id=1
  DB-->>Rep: rows
  Rep-->>S: requirements
  S->>S: group by type, attach findings, compute score
  S-->>R: RequirementSummary DTO
  R-->>FE: 200 JSON
```

## API flow — artifact generation

```mermaid
sequenceDiagram
  participant FE
  participant R as /artifact-generation
  participant G as ArtifactGenerator
  participant S as SdlcService
  FE->>R: GET .../generate?artifact_type=BRD
  R->>G: generate(project, "BRD")
  G->>S: requirement_summary(project)
  S-->>G: aggregated data
  G->>G: build sections -> GeneratedArtifact
  G-->>R: JSON | Markdown | DOCX-ready
  R-->>FE: 200
```

## Database ER (high level)

```mermaid
erDiagram
  PROJECTS ||--o{ APPLICATIONS : has
  PROJECTS ||--o{ REQUIREMENTS : has
  REQUIREMENTS ||--o{ REQUIREMENT_ANALYSIS : analyzed_by
  REQUIREMENTS ||--o{ DEVELOPMENT_STORIES : implemented_by
  DEVELOPMENT_STORIES ||--o{ DEVELOPMENT_TASKS : contains
  DEVELOPMENT_STORIES ||--o{ SOURCE_CODE_METADATA : measured_by
  DEVELOPMENT_STORIES ||--o{ CODE_REVIEW : reviewed_by
  REQUIREMENTS ||--o{ TEST_CASES : verified_by
  TEST_CASES ||--o{ TEST_EXECUTION : run_as
  TEST_CASES ||--o{ DEFECTS : yields
  PROJECTS ||--o{ ARCHITECTURE : has
  ARCHITECTURE ||--o{ ARCHITECTURE_REVIEW : reviewed_by
  PROJECTS ||--o{ RELEASES : has
  RELEASES ||--o{ DEPLOYMENTS : deployed_by
  RELEASES ||--o{ GO_LIVE : gated_by
  PROJECTS ||--o{ AUDIT_EVIDENCE : has
  AUDIT_EVIDENCE ||--o{ COMPLIANCE_RECORDS : mapped_by
  AUDIT_EVIDENCE ||--o{ AUDIT_OBSERVATIONS : notes
  PROJECTS ||--o{ COPILOT_FINDINGS : produces
  COPILOT_FINDINGS ||--o{ AI_RECOMMENDATIONS : suggests
  PROJECTS ||--o{ EXECUTIVE_SCORES : scored_by
  PROJECTS ||--o{ ARTIFACTS : generates
  PROJECTS ||--o{ TRACEABILITY_LINKS : traced_by
```

## Deployment architecture

```mermaid
flowchart TB
  subgraph Docker Compose
    NGINX[nginx: SPA + /api proxy :8080]
    BE[FastAPI :8000]
    PG[(PostgreSQL :5432)]
    NGINX -->|/api| BE --> PG
  end
  DEV[Local dev: uvicorn + SQLite + npm run dev]:::note
  classDef note fill:#eef,stroke:#99f;
```

## AI orchestration flow (future-ready)

```mermaid
flowchart LR
  P[Prompt/template] --> PM[PromptManager]
  CTX[ContextBuilder from SDLC data] --> PM
  PM --> REQ[CompletionRequest]
  REQ --> SVC[LLMService.adapter_for model]
  SVC --> AD{Adapter}
  AD -->|ollama| OLL[Ollama - scaffold]
  AD -->|openai| OAI[OpenAI - scaffold]
  AD -->|lmstudio| LMS[LM Studio - scaffold]
  note[Adapters raise NotImplementedError until wired]:::n
  classDef n fill:#ffe,stroke:#cc0;
```
