# ADIP Product Roadmap (Role 17)

## Q3 2026 — Connect
- Enable backend mode on Traceability Center and Universal Artifacts Repository
- OIDC authentication scaffold
- Prompt governance UI (replay viewer) consuming `/prompt-governance/replay`

## Q4 2026 — Harden
- Postgres production profile
- Contract tests (OpenAPI ↔ SDK)
- Route-level code splitting (<500 KB initial chunk)
- Frontend Vitest + Playwright smoke suite

## Q1 2027 — Enterprise
- Multi-tenant row security at API layer
- Live LLM in AI Workspace with streaming
- Prompt regression in CI against golden dataset
- SOC2 audit trail end-to-end

## Enterprise backlog (prioritized)

| P | Item |
|---|------|
| P0 | Wire `useAdipQuery` / SDK to executive hubs |
| P0 | Remove dead components |
| P1 | Split `hubArtifactDefinitions.ts` |
| P1 | Consolidate AI workspace implementations |
| P2 | i18n scaffolding |
| P2 | Move `docs/examples/` to release artifacts repo |
