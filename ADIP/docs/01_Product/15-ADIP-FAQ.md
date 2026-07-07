# 15 — ADIP FAQ

## Product

**Q: What is ADIP?**
A: AI Delivery Intelligence Platform — an AI-first executive control surface
for an enterprise SDLC, governance, risk and value estate.

**Q: How is ADIP different from a BI dashboard?**
A: ADIP doesn't *report* — it **analyzes, recommends and generates**.
Every center is built around four AI questions: *what was analyzed*,
*what was found*, *what is recommended*, *what can be generated*.

**Q: Is ADIP a generic "AI Ops" tool?**
A: No. ADIP is purpose-built for *executive consumption* — CIO, CTO, CRO,
CISO. KPIs, risks, recommendations and artifacts are framed as *executive
decisions*, not raw operational telemetry.

## Architecture

**Q: Where does the data come from?**
A: In the demo build, a deterministic simulation engine
(`simulationEngine.js`) produces correlated banking telemetry every 30
seconds. In production, replace the engine with adapters to your real
telemetry sources (Jira, GitHub, ServiceNow, observability stack, etc.).

**Q: Is there a backend?**
A: Not in the demo. The full app runs in-browser. For production a thin
backend is recommended — see `13-ADIP-Operations-Guide.md`.

**Q: What language / stack?**
A: React 19, TypeScript 5, MUI 7, Vite 8.

## AI

**Q: Are the AI Copilots real?**
A: The Copilots are **deterministic mock implementations** in the demo —
they show how the platform behaves. The integration points
(`generationActions`, `findings`, `recommendations`, `suggestedActions`)
are designed to be wired to real LLM agents with no UI changes.

**Q: How do you avoid AI hallucinations?**
A: AI Evaluation Center (single source of truth) tracks Hallucination
Score per use case. AI Risk Register flags high-risk models. AI
Observability monitors runtime telemetry. AI Governance enforces approval
gates for all use cases.

**Q: How is AI governed end-to-end?**
A: Single source of truth principle: AI Governance owns use cases,
models, prompts, risks and controls; AI Evaluation owns quality scores;
AI Observability owns runtime metrics. Risk & Compliance and Executive
centers show *summarized rollups only*.

## Artifacts

**Q: Where do generated artifacts go?**
A: Every artifact generated anywhere in ADIP is automatically pushed to
the **Universal Artifacts Repository** at `/artifacts`. Searchable,
filterable, viewable and downloadable.

**Q: What formats are supported?**
A: DOCX, XLSX, YAML, PNG (typed metadata). The body is text-serializable
in the demo and downloads as `.txt` with the original file name.

**Q: Can I version-control generated artifacts?**
A: Yes — every artifact carries a `generationHistory` (version,
generation date, generator, model used, change summary) in
`src/types/artifacts.ts`.

## KPIs

**Q: How are KPIs documented?**
A: Every KPI has an entry in `src/data/kpiCatalog.ts` with definition,
formula, source, frequency, owner and executive consumer. The
`/kpi-catalog` page renders the dictionary live and exposes a
**Generate KPI Catalog** action that emits a downloadable Markdown +
CSV.

**Q: How many KPIs per center?**
A: At most **6 primary KPIs** per center. Each KPI must answer one of
*Health · Risk · Progress · Adoption · Compliance · Value*. Derived /
duplicated KPIs are removed.

## Personas & RBAC

**Q: What personas are supported?**
A: CIO, CTO, CISO, CRO, CFO, EA, PM, Architect, Developer, Tester,
Auditor, Compliance Officer, Model Owner, AI Governance Lead. See
`07-ADIP-Personas.md`.

**Q: How is access controlled?**
A: RBAC matrix in `src/data/rbacCatalog.ts` gates routes per persona.
ABAC overlays add fine-grained scoping.

## Demo

**Q: What's the shortest demo path?**
A: 20 minutes — see `08-ADIP-Demo-Guide.md`.

**Q: Where do I get demo credentials?**
A: No real auth in the demo. Use the persona switcher in the TopBar.

**Q: Can I record / share the demo?**
A: Yes — there's no real customer data; everything is simulated.

## Operations

**Q: How big is the build?**
A: ~2.3MB minified, ~610KB gzipped. A single chunk by design for the
demo. Production deployments should code-split.

**Q: How do I roll back?**
A: Re-upload the prior `dist/` to your static host. No database
migration is needed.
