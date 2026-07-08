# ADIP Documentation

Welcome to the documentation home for **ADIP — Automation Delivery Integration
Platform**, an enterprise AI SDLC platform (React/Vite/TypeScript frontend +
FastAPI backend).

---

## Product Overview

ADIP turns **one business prompt** into a complete, orchestrated AI SDLC run:

> Prompt → Classification → Requirements → Architecture → Development → Testing →
> Release → Go-Live → Audit → Executive Summary → Artifact Generation → Traceability

It provides executive dashboards, AI copilots (Requirement, Architecture,
Development, Testing, Release, Go-Live, Audit, Executive Advisor), a 24-type
artifact generation framework, an end-to-end traceability engine, and knowledge
and transformation modules — all backed by realistic enterprise banking data
and a provider-independent LLM abstraction.

---

## Folder Structure

```
docs/
  00_Start_Here/       New-developer quick starts (setup, backend, frontend, LLM, prompts, artifacts)
  01_Product/          Product overview, modules, personas, governance, demo, FAQ
  02_AI_SDLC/          AI SDLC: KPI & artifact catalogs, explainability, traceability methodology
  03_Developer_Manual/ Onboarding, developer & setup guides, coding standards, troubleshooting
  04_Architecture/     Architecture guides, solution architecture, diagrams
  05_Workbench/        AI SDLC authoring workbench docs
  06_Test_Workbench/   Testing strategy & guide
  07_Benchmark/        Performance benchmarks & baselines
  08_Local_LLM/        Provider-independent LLM integration layer
  09_Operations/       Operations, release, production readiness
  10_API/              REST API guide
  11_Database/         Database schema & migrations
  12_UI_UX/            UI/UX design system & patterns
  13_Deployment/       Installation, Docker, deployment & environment
  14_Extensibility/    Plugin/extension points (MCP, agents, cloud LLM, RAG, vector DB)
  15_Security/         Security policy, OWASP checklist, threat model, API hardening
  examples/            Generated datasets, performance/ML reports, sample projects
  99_Archive/          Superseded / historical docs
```

---

## Documentation Index

### [00 · Start Here](00_Start_Here/)
- [Welcome](00_Start_Here/01_Welcome.md) · [5-Minute Setup](00_Start_Here/02_5_Minute_Setup.md) · [Architecture Overview](00_Start_Here/03_Architecture_Overview.md)
- [Backend](00_Start_Here/05_Backend_Quick_Start.md) · [Frontend](00_Start_Here/06_Frontend_Quick_Start.md) · [Local LLM](00_Start_Here/07_Local_LLM_Quick_Start.md)
- [Prompt Execution](00_Start_Here/08_Prompt_Execution_Guide.md) · [Artifact Generation](00_Start_Here/09_Artifact_Generation_Guide.md) · [Reference](00_Start_Here/10_Reference.md)

### [01 · Product](01_Product/)
- [Executive Overview](01_Product/01-ADIP-Executive-Overview.md)
- [Modules (product)](01_Product/03-ADIP-Modules.md) · [Modules (reference)](01_Product/MODULES.md)
- [Governance Model](01_Product/06-ADIP-Governance-Model.md)
- [Personas](01_Product/07-ADIP-Personas.md) · [Persona Visibility Matrix](01_Product/PERSONA_VISIBILITY_MATRIX.md)
- [Demo Guide](01_Product/08-ADIP-Demo-Guide.md) · [Executive Demo Talking Points](01_Product/09-ADIP-Executive-Demo-Talking-Points.md) · [Demo Readiness Checklist](01_Product/DEMO_READINESS_CHECKLIST.md)
- [ROI Methodology](01_Product/10-ADIP-ROI-Methodology.md)
- [Functional Walkthrough](01_Product/FUNCTIONAL_WALKTHROUGH.md)
- [Executive Completion Report](01_Product/EXECUTIVE_COMPLETION_REPORT.md)
- [FAQ](01_Product/15-ADIP-FAQ.md)

### [02 · AI SDLC](02_AI_SDLC/)
- [KPI Catalog](02_AI_SDLC/04-ADIP-KPI-Catalog.md) · [KPI Catalog v2](02_AI_SDLC/KPI_CATALOG_V2.md)
- [Artifact Catalog](02_AI_SDLC/05-ADIP-Artifact-Catalog.md)
- [KPI Explainability Framework](02_AI_SDLC/KPI_EXPLAINABILITY_FRAMEWORK.md)
- [KPI Traceability Matrix](02_AI_SDLC/KPI_TRACEABILITY_MATRIX.md)
- [Transformation KPI Methodology](02_AI_SDLC/TRANSFORMATION_KPI_METHODOLOGY.md)

### [03 · Developer Manual](03_Developer_Manual/)
- [Developer Onboarding](03_Developer_Manual/Developer%20Onboarding.md) ← start here
- [Developer Guide (backend)](03_Developer_Manual/02_DEVELOPER_GUIDE.md) · [Developer Guide (product)](03_Developer_Manual/12-ADIP-Developer-Guide.md)
- [Developer Setup Guide](03_Developer_Manual/DEVELOPER_SETUP_GUIDE.md)
- [Coding Standards](03_Developer_Manual/05_CODING_STANDARDS.md)
- [Troubleshooting](03_Developer_Manual/06_TROUBLESHOOTING.md)
- [Developer Experience Index](03_Developer_Manual/Developer%20Experience%20Index.md) · [FAQ](03_Developer_Manual/FAQ.md) · [Folder Structure Guide](03_Developer_Manual/Folder%20Structure%20Guide.md)
- [Administrator Guide](03_Developer_Manual/Administrator%20Guide.md)

### [04 · Architecture](04_Architecture/)
- [Architecture Guide](04_Architecture/01_ARCHITECTURE_GUIDE.md)
- [Solution Architecture (diagrams)](04_Architecture/07_SOLUTION_ARCHITECTURE.md)
- [Architecture (product)](04_Architecture/02-ADIP-Architecture.md) · [Architecture (reference)](04_Architecture/ARCHITECTURE.md)
- [Diagrams](04_Architecture/DIAGRAMS.md) · [C4 & Flow Diagrams](04_Architecture/Architecture%20Diagrams%20(C4%20and%20Flows).md)
- [Architecture Review & Quality Score](04_Architecture/Architecture%20Review%20and%20Quality%20Score.md) · [Plugin Architecture](04_Architecture/Plugin%20Architecture.md)
- [Architecture Decision Records (ADR)](04_Architecture/ADR/)

### [05 · Workbench](05_Workbench/)
- [Overview](05_Workbench/README.md)

### [06 · Test Workbench](06_Test_Workbench/)
- [Testing Guide](06_Test_Workbench/08_TESTING_GUIDE.md)

### [07 · Benchmark](07_Benchmark/)
- [Overview](07_Benchmark/README.md)

### [08 · Local LLM](08_Local_LLM/)
- [Local LLM Integration](08_Local_LLM/README.md)

### [09 · Operations](09_Operations/)
- [Operations Guide](09_Operations/13-ADIP-Operations-Guide.md)
- [Release Guide](09_Operations/14-ADIP-Release-Guide.md)
- [Production Readiness](09_Operations/09_PRODUCTION_READINESS.md)
- [Runbooks](09_Operations/Runbooks.md) · [Observability Guide](09_Operations/Observability%20Guide.md) · [SLIs/SLOs](09_Operations/SLI_SLO.md)

### [10 · API](10_API/)
- [API Guide](10_API/03_API_GUIDE.md)
- [API Examples & Contracts](10_API/API%20Examples%20and%20Contracts.md) · [OpenAPI spec](10_API/openapi.json) · [Postman collection](10_API/ADIP.postman_collection.json)

### [11 · Database](11_Database/)
- [Database Guide](11_Database/04_DATABASE_GUIDE.md)
- [Production Database Guide (DBA)](11_Database/Production%20Database%20Guide.md)

### [12 · UI / UX](12_UI_UX/)
- [Overview](12_UI_UX/README.md)

### [13 · Deployment](13_Deployment/)
- [Installation Guide](13_Deployment/11-ADIP-Installation-Guide.md)
- Kubernetes: [`deploy/k8s/`](../deploy/k8s/) · Helm: [`deploy/helm/adip/`](../deploy/helm/adip/) · Terraform: [`deploy/terraform/`](../deploy/terraform/)
- Observability stack: [`deploy/observability/`](../deploy/observability/)

### [14 · Extensibility](14_Extensibility/)
- [Extensibility Guide](14_Extensibility/Extensibility%20Guide.md)

### [15 · Security](15_Security/)
- [OWASP Checklist](15_Security/OWASP%20Checklist.md) · [Threat Model](15_Security/Threat%20Model.md) · [API Hardening](15_Security/API%20Hardening.md)
- [Security Policy](../SECURITY.md)

### [99 · Archive](99_Archive/)
- [About the archive](99_Archive/README.md)

---

## Recommended Reading Order

1. **Product Overview** — [`01_Product/01-ADIP-Executive-Overview.md`](01_Product/01-ADIP-Executive-Overview.md)
2. **Developer Onboarding** — [`03_Developer_Manual/Developer Onboarding.md`](03_Developer_Manual/Developer%20Onboarding.md)
3. **Architecture** — [`04_Architecture/01_ARCHITECTURE_GUIDE.md`](04_Architecture/01_ARCHITECTURE_GUIDE.md) → [`07_SOLUTION_ARCHITECTURE.md`](04_Architecture/07_SOLUTION_ARCHITECTURE.md)
4. **AI SDLC** — [`02_AI_SDLC/`](02_AI_SDLC/)
5. **Workbench** — [`05_Workbench/`](05_Workbench/)
6. **Test Workbench** — [`06_Test_Workbench/08_TESTING_GUIDE.md`](06_Test_Workbench/08_TESTING_GUIDE.md)
7. **Benchmark** — [`07_Benchmark/`](07_Benchmark/)
8. **Local LLM** — [`08_Local_LLM/`](08_Local_LLM/)
9. **APIs** — [`10_API/03_API_GUIDE.md`](10_API/03_API_GUIDE.md)
10. **Database** — [`11_Database/04_DATABASE_GUIDE.md`](11_Database/04_DATABASE_GUIDE.md)
11. **Deployment** — [`13_Deployment/11-ADIP-Installation-Guide.md`](13_Deployment/11-ADIP-Installation-Guide.md)
12. **Operations** — [`09_Operations/13-ADIP-Operations-Guide.md`](09_Operations/13-ADIP-Operations-Guide.md)
