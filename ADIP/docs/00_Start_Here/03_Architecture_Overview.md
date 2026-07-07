# Architecture Overview

```mermaid
flowchart TB
  subgraph Frontend[React / Vite / TS]
    UI[Pages + MUI]
    FLAG{Data source flag}
    UI --> FLAG
    FLAG -->|mock| MOCK[Mock / simulation]
    FLAG -->|backend| CLIENT[apiClient]
  end
  subgraph Backend[FastAPI]
    API[API routers /api/v1]
    ORCH[PromptExecutionEngine]
    SVC[Services: SDLC, Analytics, Knowledge, ArtifactGenerator, PromptTesting, ArtifactValidator]
    REPO[Repositories]
    ORM[SQLAlchemy ORM]
    LLM[LLM layer: mock reasoner + Ollama/OpenAI/Gemini/LMStudio adapters]
    API --> ORCH --> SVC --> REPO --> ORM
    SVC -.-> LLM
  end
  CLIENT -->|REST/JSON| API
  ORM --> DB[(SQLite dev / PostgreSQL prod)]
```

## Prompt-to-delivery flow

```mermaid
flowchart LR
  P[Business Prompt] --> C[Classification]
  C --> R[Requirements] --> A[Architecture] --> D[Development]
  D --> T[Testing] --> RL[Release] --> G[Go-Live] --> AU[Audit]
  AU --> E[Executive Summary] --> AR[Artifacts] --> TR[Traceability]
```

- **PromptExecutionEngine** orchestrates all existing services (no duplication).
- **ArtifactGenerator** produces 47 artifact types (JSON / Markdown / DOCX / PDF-ready).
- **LLM layer** is provider-independent; mock by default (offline), Ollama for real local execution.

Deep dive: [`../04_Architecture/07_SOLUTION_ARCHITECTURE.md`](../04_Architecture/07_SOLUTION_ARCHITECTURE.md).
