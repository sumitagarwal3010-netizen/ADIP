# 14 — ADIP Release Guide

How to cut a release, validate it and deploy.

## Release Cadence

ADIP follows a two-week minor cadence and an as-needed patch cadence.
Each release candidate must pass the **Demo Readiness Checklist**
(`/DEMO_READINESS_CHECKLIST.md`).

## Release Steps

### 1. Pre-Release Validation

```bash
npm run lint
npm run build
```

Both must succeed. The build emits a single chunk warning (≈2.3MB) that is
intentional for demo clarity — no action required.

### 2. Smoke Test (manual, ~10 minutes)

Walk the **Demo Guide** (`docs/08-ADIP-Demo-Guide.md`) end-to-end:

- Executive Control Tower loads, simulation ticks, executive summary
  generates.
- All 6 AI SDLC Copilot tabs render with findings, recommendations,
  generated artifacts and suggested actions.
- AI Governance Center renders all 6 sections.
- All governance centers (Portfolio, EA, Tech Strategy, Risk &
  Compliance) render with their reduced tab strips and default landing
  tabs.
- Universal Artifact Repository (`/artifacts`) shows all generated
  artifacts with View / Download / Export Catalog actions.
- KPI Catalog (`/kpi-catalog`) renders all KPIs and Generate works.

### 3. Tag

```bash
git tag -a v<x.y.z> -m "ADIP <x.y.z>"
git push --tags
```

### 4. Build & Publish

```bash
npm run build
# upload dist/ to the static host
```

### 5. Post-Release

- Update **CHANGELOG.md** (if maintained).
- Notify stakeholders: CIO sponsor, demo owner, EA lead.
- Run the Demo Guide one more time on the deployed URL.

## Versioning

- **Major** — breaking change to KPI catalog, route layout, persona
  config or simulation engine signature.
- **Minor** — new tab, new artifact generator, new KPI.
- **Patch** — copy/UI fix, mock data refinement, bug fix.

## Rollback

Static hosting → flip back to the prior `dist/` build:

- Vercel / Netlify: instant rollback in dashboard.
- S3 + CloudFront: re-upload prior bundle and invalidate `/`.

There is no database state to migrate; rollback is safe.

## Communications Template

> ADIP <version> released to [environment].
>
> Highlights:
> - <feature>
> - <feature>
>
> Demo Guide: docs/08-ADIP-Demo-Guide.md
> Demo Readiness: DEMO_READINESS_CHECKLIST.md
>
> Validated by: Demo team
