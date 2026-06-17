# 12 — ADIP Developer Guide

A practitioner reference for engineers extending ADIP.

## Stack

- **React 19** + **TypeScript 5**
- **Vite 8** for dev server / build
- **MUI 7** (`@mui/material`, `@mui/icons-material`)
- **react-router-dom v7**
- **eslint** with `typescript-eslint`

## Code Map

### `src/services/`

- `simulationEngine.js` — the driver-based correlated simulation. Latent
  variables, mulberry32 RNG, KPI cascades. Exposes `tickSimulation` and
  `createInitialState`.
- `simulationService.js` — thin compatibility shim that re-exports the
  engine.
- `executiveSummaryEngine.js` — generates the narrative executive summary
  from a `SimulationState`.

### `src/context/`

Every cross-cutting domain has its own context:

| Context | What it owns |
| --- | --- |
| `SimulationContext` | Live tick + executive summary state |
| `CopilotContext` | Selected project, requirement insights |
| `PortfolioGovernanceContext` | Portfolio, risks, demand pipeline |
| `ArchitectureRepositoryContext` | Domains, applications, standards, debt |
| `TechnologyStrategyContext` | Standards, roadmaps, cloud, investments |
| `EnterpriseRiskContext` | Enterprise risks across all domains |
| `TransformationPmoContext` | Programs, initiatives, dependencies |
| `ProductionIntelligenceContext` | Production health, capacity |
| `ValueRealizationContext` | Value KPIs, ROI parameters |
| `ArtifactsContext` (NEW) | Universal artifact registry |

### `src/components/copilot/`

- `CopilotSection.tsx` — the canonical AI Copilot layout. Findings →
  Recommendations → AI Authoring → Generated Artifacts → Suggested Actions.
  Pushes generated artifacts into `ArtifactsContext`.
- `RequirementCopilotPanel.tsx`, `DomainCopilotPanels.tsx`,
  `ReleaseAuditCopilotPanels.tsx` — concrete panels per SDLC tab.

### `src/components/workflow/`

- `HubArtifactGenerator.tsx` — full multi-stage generation flow used by
  the AI Reports tab on every center.
- `ArtifactRepositoryPanel.tsx` — per-tab repository panel.
- `ArtifactViewerPanel.tsx` — modal viewer with download.
- `GenerationSimulationPanel.tsx`, `GenerationRunHistoryPanel.tsx` — UX
  pieces for the run progress + run history.

### `src/data/`

- `hubArtifactDefinitions.ts` — per-hub artifact configs (title, generate
  label, simulation stages, build function for artifacts).
- `artifactBuilder.ts` — `createArtifact`, `buildSections`, helper
  utilities for constructing `Artifact` objects.
- `kpiCatalog.ts` (NEW) — KPI dictionary with definition, formula,
  source, frequency, owner, executive consumer.
- `requirementArtifactFactory.ts` — `createRunId`, `formatTimestamp`.

## Adding a New AI SDLC Copilot Tab

1. Create the panel under `src/components/copilot/MyCopilotPanel.tsx`.
2. Use `<CopilotSection>` and pass:
   - `title`, `analyzedSubtitle`, `analyzedScope`
   - `findings`, `recommendations`, `suggestedActions`
   - `generationActions` (each carries `id`, `label`, `artifactName`,
     `preview`, optional `icon`)
   - `sourceHub="ai-copilot"`, `sourceLabel="<Tab Name>"`
3. Mount it under `AiDeliveryCopilotCenter.tsx`.
4. Verify generated artifacts appear in `/artifacts`.

## Adding a New Center Artifact Generator

1. Add a new `HubKey` to `data/hubArtifactDefinitions.ts`.
2. Implement a `build<Hub>Artifacts(runId)` function that returns
   `Artifact[]` (use `createArtifact` + `buildSections`).
3. Register it in `HUB_ARTIFACT_CONFIGS` with a `simulation` config.
4. Add `<HubArtifactGenerator hubKey="<your-hub>" />` to the center's
   "AI Reports" tab.
5. Verify generated artifacts appear in `/artifacts`.

## Adding a New KPI

1. Append an entry to `KPI_CATALOG` in `src/data/kpiCatalog.ts` —
   document definition, formula, source, frequency, owner and
   executive consumer.
2. Wire the KPI value into the relevant center's `KpiCard`.
3. The `/kpi-catalog` page picks it up automatically.

## Adding a New Page / Route

1. Create the page in `src/pages/<MyPage>.tsx`.
2. Register the route in `src/routes/index.tsx`.
3. Add the page meta to `src/components/layouts/AppLayout.tsx` `pageMeta`.
4. Add an entry in `src/data/rbacCatalog.ts` so the route is gated.
5. Add an item in `src/config/navConfig.ts` if it should appear in
   the sidebar.

## Coding Conventions

- **No emojis** in source unless the user asks.
- **Comments** explain *why*, not *what*. Avoid restating the code.
- **Theme-driven** styling — use the shared `colors` object from
  `src/theme/colors.ts`.
- **Existing primitives first** — `GlassCard`, `ModuleHeader`, `KpiCard`,
  `SeverityChip` and `CopilotSection` cover most use-cases.
- **Type safety** — keep `tsc -b` clean before committing.

## Build Pipeline

```bash
npm run lint      # ESLint
npm run build     # tsc -b && vite build
npm run preview   # local preview of dist/
```
