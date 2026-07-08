# ADIP Architecture Diagrams — C4, Components & Flows

Comprehensive architecture diagrams for ADIP in **Mermaid** (renders on GitHub)
and **PlantUML** (for tooling that supports it). Covers C4 context/container,
component, deployment, sequence, database ER, and the three core AI flows
(prompt execution, artifact generation, LLM orchestration).

> This complements `DIAGRAMS.md`; it does not replace it. This file is the
> canonical source for the C4 model and the AI flow diagrams.

---

## 1. C4 — Level 1: System Context

```mermaid
graph TB
    user[["Enterprise User<br/>(BA / Architect / QA / Exec)"]]
    admin[["Platform Admin"]]
    subgraph ADIP["ADIP — AI SDLC Platform"]
        core["ADIP Platform<br/>(React SPA + FastAPI + DB)"]
    end
    llm[("Local / Cloud LLM<br/>Ollama · OpenAI · Gemini")]
    idp[("Identity Provider<br/>(future SSO/OIDC)")]

    user -->|"Prompts, reviews artifacts"| core
    admin -->|"Configures, monitors"| core
    core -->|"Completions (optional)"| llm
    core -.->|"AuthN/AuthZ (future)"| idp
```

### PlantUML (C4 Context)

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml
Person(user, "Enterprise User", "BA, Architect, QA, Executive")
Person(admin, "Platform Admin")
System(adip, "ADIP", "AI SDLC platform: prompt-driven requirements to go-live")
System_Ext(llm, "LLM Provider", "Ollama / OpenAI / Gemini")
System_Ext(idp, "Identity Provider", "Future SSO / OIDC")
Rel(user, adip, "Prompts, reviews artifacts")
Rel(admin, adip, "Configures, monitors")
Rel(adip, llm, "Completions (optional)")
Rel(adip, idp, "AuthN/AuthZ (future)")
@enduml
```

---

## 2. C4 — Level 2: Container

```mermaid
graph TB
    user[["Enterprise User"]]
    subgraph client["Client Tier"]
        spa["React + Vite SPA<br/>(TypeScript, MUI)"]
    end
    subgraph server["Application Tier"]
        api["FastAPI Backend<br/>(REST /api/v1)"]
        engine["Prompt Execution Engine<br/>+ Copilots"]
        gen["Artifact Generator<br/>+ Export Engine"]
        quality["Quality Engine<br/>+ AI Reviewer"]
        runtime["LLM Runtime<br/>(queue, cache, breaker, routing)"]
    end
    subgraph data["Data Tier"]
        db[("PostgreSQL / SQLite")]
    end
    llm[("LLM Provider")]

    user --> spa -->|"HTTPS JSON"| api
    api --> engine --> gen
    engine --> quality
    engine --> runtime --> llm
    api --> db
    gen --> db
    quality --> db
```

---

## 3. C4 — Level 3: Component (Backend)

```mermaid
graph LR
    subgraph API["API Layer (app/api/v1/endpoints)"]
        r_sdlc["sdlc"]
        r_orch["orchestrator"]
        r_gen["artifact_generation / export"]
        r_studio["prompt_studio / workbench"]
        r_qual["artifact_quality / ai_review"]
        r_bench["prompt_benchmark / regression"]
        r_crud["CRUD resources"]
    end
    subgraph SVC["Service Layer (app/services)"]
        s_engine["PromptExecutionEngine"]
        s_gen["ArtifactGenerator"]
        s_export["ExportEngine"]
        s_qual["QualityEngine"]
        s_rev["AIReviewer"]
        s_bench["BenchmarkService"]
        s_reg["RegressionService"]
        s_studio["PromptStudioService"]
        s_sdlc["SdlcService"]
    end
    subgraph INFRA["Infrastructure"]
        repo["BaseRepository / Models (SQLAlchemy)"]
        llm["LLM Runtime + Adapters"]
        audit["Audit Trail + Metrics"]
    end

    r_orch --> s_engine --> s_gen & s_qual & s_rev
    r_gen --> s_gen --> s_export
    r_studio --> s_studio
    r_qual --> s_qual
    r_qual --> s_rev
    r_bench --> s_bench --> s_reg
    r_sdlc --> s_sdlc
    r_crud --> repo
    s_engine --> llm
    s_gen --> repo
    s_engine --> audit
```

---

## 4. Deployment Diagram

```mermaid
graph TB
    subgraph browser["User Browser"]
        ui["ADIP SPA"]
    end
    subgraph edge["Edge / Reverse Proxy"]
        nginx["Nginx<br/>(serves SPA, proxies /api)"]
    end
    subgraph app["App Containers"]
        be["adip-backend<br/>(uvicorn/gunicorn)"]
    end
    subgraph data["Data"]
        pg[("PostgreSQL")]
    end
    subgraph optional["Optional (self-hosted)"]
        ollama["Ollama runtime"]
    end

    ui -->|"HTTPS"| nginx
    nginx -->|"/"| ui
    nginx -->|"/api/v1"| be
    be --> pg
    be -.->|"LOCAL_LLM_ENABLED=true"| ollama
```

### PlantUML (Deployment)

```plantuml
@startuml
node "User Browser" { artifact "ADIP SPA" as spa }
node "Nginx" as nginx
node "Backend Container" { component "FastAPI (uvicorn)" as be }
database "PostgreSQL" as pg
node "Ollama (optional)" as ollama
spa --> nginx : HTTPS
nginx --> be : /api/v1
be --> pg
be ..> ollama : optional completions
@enduml
```

---

## 5. Prompt Execution Flow (Sequence)

```mermaid
sequenceDiagram
    actor User
    participant SPA
    participant API as FastAPI /orchestrator
    participant Engine as PromptExecutionEngine
    participant RT as LLM Runtime
    participant LLM as Provider (mock/Ollama)
    participant Gen as ArtifactGenerator
    participant Q as QualityEngine

    User->>SPA: Enter one prompt
    SPA->>API: POST /orchestrator/run
    API->>Engine: execute(prompt, options)
    Engine->>Engine: classify → SDLC phases
    alt LOCAL_LLM_ENABLED
        Engine->>RT: complete(request)
        RT->>RT: cache? breaker? route+fallback
        RT->>LLM: completion
        LLM-->>RT: response (+usage)
        RT-->>Engine: text + token accounting
    else Mock reasoning
        Engine->>Engine: deterministic reasoning
    end
    Engine->>Gen: generate artifacts per phase
    Gen-->>Engine: GeneratedArtifact[]
    Engine->>Q: score_artifact(each)
    Q-->>Engine: quality reports
    Engine-->>API: orchestration result
    API-->>SPA: phases + artifacts + scores
    SPA-->>User: End-to-end SDLC view
```

---

## 6. Artifact Generation Flow

```mermaid
flowchart TD
    A["Request: project + artifact_type"] --> B{"artifact_type<br/>supported?"}
    B -- no --> E["ValidationError"]
    B -- yes --> C["Aggregate project data<br/>(SdlcService)"]
    C --> D["Resolve builder<br/>(47 types)"]
    D --> F["Build sections"]
    F --> G["Wrap in professional envelope<br/>(control, scope, risks, traceability)"]
    G --> H["Attach metadata<br/>(version, author, refs)"]
    H --> I{"Output format"}
    I -->|JSON| J["GeneratedArtifact"]
    I -->|Markdown| K["to_markdown()"]
    I -->|HTML/CSV/ZIP| L["ExportEngine"]
    I -->|DOCX/PDF model| M["docx/pdf model"]
```

---

## 7. LLM Orchestration Flow (Runtime)

```mermaid
flowchart TD
    A["complete(request)"] --> B{"response cache hit?"}
    B -- yes --> Z["return cached"]
    B -- no --> C{"circuit breaker<br/>open?"}
    C -- yes --> X["refuse (fail fast)"]
    C -- no --> D["acquire concurrency slot"]
    D --> E["routing plan:<br/>primary + fallbacks"]
    E --> F["try model[i]"]
    F --> G{"success?"}
    G -- yes --> H["record success<br/>token+cost accounting"]
    H --> I["cache response"] --> Z
    G -- no --> J{"more fallbacks?"}
    J -- yes --> F
    J -- no --> K["record failure<br/>maybe open breaker"] --> X
```

---

## 8. Database ER (Core Entities)

```mermaid
erDiagram
    ORGANIZATION ||--o{ PROJECT : owns
    PROJECT ||--o{ APPLICATION : contains
    PROJECT ||--o{ REQUIREMENT : has
    REQUIREMENT ||--o{ DEV_STORY : refines
    DEV_STORY ||--o{ TEST_CASE : verified_by
    PROJECT ||--o{ RELEASE : plans
    PROJECT ||--o{ ACTIVITY_LOG : records
    WORKBENCH_PROMPT ||--o{ WORKBENCH_PROMPT_VERSION : versions
    WORKBENCH_PROMPT ||--o{ WORKBENCH_RUN : runs

    PROJECT {
        int id PK
        string code
        string name
        string status
    }
    REQUIREMENT {
        int id PK
        int project_id FK
        string title
        string priority
    }
    WORKBENCH_PROMPT {
        int id PK
        string name
        string tags
        bool is_favorite
        string approval_status
        bool is_published
    }
```

> The full ER schema is derived from `backend/app/models/`. Regenerate a
> detailed ER with any SQLAlchemy-aware ERD tool pointed at the models package.

---

## How to render

- **Mermaid**: renders automatically on GitHub and in most Markdown viewers.
- **PlantUML**: use the PlantUML CLI/server, or the C4-PlantUML includes shown above.
