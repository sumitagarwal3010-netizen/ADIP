# ADIP Team Takeover Pack

**Branch:** `adip-ai-sdlc-june6-stable`  
**Purpose:** Onboard ML, GenAI, backend, frontend, DB, SRE, DevOps, QA, security, and technical writing teams.

## What is ADIP?

ADIP (AI-driven SDLC platform) is an enterprise banking-grade AI SDLC copilot with:

- AI SDLC hubs (requirements → release)
- Prompt execution, workbench, artifact generation, AI reviewer
- Enterprise connector framework (24 connectors)
- LLM provider abstraction (Ollama, OpenAI, Claude, Gemini, etc.)
- Deterministic rule engine and quality scorecards
- Docker / Helm / Terraform deployment skeleton

## Team structure

| Role | Primary guides |
|------|----------------|
| ML Engineer | `14_ML_ENGINEERING_GUIDE.md`, `18_TESTING_STRATEGY.md` |
| GenAI Developer | `15_GENAI_ENGINEERING_GUIDE.md`, `17_RULE_ENGINE_GUIDE.md` |
| Backend Developer | `13_BACKEND_ENGINEERING_GUIDE.md`, `06_DEVELOPER_MANUAL.md` |
| Frontend Developer | `12_FRONTEND_ENGINEERING_GUIDE.md`, `07_DEVELOPER_STARTER_GUIDE.md` |
| DB Engineer | `11_DATABASE_ENGINEERING_GUIDE.md` |
| SRE | `09_OPERATIONS_RUNBOOK.md` |
| DevOps | `10_DEVOPS_GUIDE.md` |
| QA | `18_TESTING_STRATEGY.md` |
| Security Architect | `19_SECURITY_GUIDE.md` |
| Technical Writer | `ARTIFACT_MANIFEST.md`, all guides |

## How to use this pack

1. Start with `07_DEVELOPER_STARTER_GUIDE.md` — clone, build, test
2. Read `01_HIGH_LEVEL_DESIGN.md` and `03_HIGH_LEVEL_SOLUTION_ARCHITECTURE.md`
3. Use role-specific onboarding in `08_ONBOARDING_GUIDE.md`
4. Run ops scripts in `/scripts/run_*.py`
5. Open workbenches: `/platform/team-engineering-workbench`, `/ai-sdlc/connector-artifact-workbench`

## Related existing docs (do not duplicate)

- `docs/00_Start_Here/` — quick starts
- `enterprise/connectivity/` — connector guides
- `enterprise/database/ER_OVERVIEW.md` — ER diagram
- `docs/04_Architecture/` — ADRs and C4 diagrams

## API metadata

`GET /api/v1/team-takeover/metadata` — lists documents, scripts, workbenches, APIs.
