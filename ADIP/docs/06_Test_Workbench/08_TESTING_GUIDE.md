# ADIP — Testing Documentation (Phase 15)

## Test strategy overview

| Level | Scope | Tooling | Status |
|---|---|---|---|
| Unit | services, repositories, generators, LLM scaffolds | pytest | ✅ implemented |
| API/integration | routers end-to-end via `TestClient` over seeded SQLite | pytest + httpx | ✅ implemented |
| Contract | Pydantic response models validate every response | FastAPI response_model | ✅ implicit |
| Performance | load/latency of list + aggregation endpoints | (plan below) | ▢ planned |
| Security | input validation, error leakage, dependency scan | (plan below) | ▢ planned |
| Regression | full suite gate before release | pytest | ✅ suite in place |
| UAT | business acceptance per module | (plan below) | ▢ planned |
| Smoke | health + one endpoint per module | (script below) | ✅ coverable |

## Running the suite

```bash
cd backend && pytest            # all tests, isolated temp SQLite
pytest tests/test_phase3_sdlc.py -q     # a single module
pytest -k copilot               # by keyword
```

`tests/conftest.py` forces `DATABASE_URL` to a temp SQLite file and seeds once
per session, so tests never touch the developer database.

## Unit testing guide

- Test services directly against a `SessionLocal()` where logic is non-trivial.
- Assert DTO shape and computed fields (scores, coverage math, groupings).
- For pure helpers (readiness bands, ROI index), assert boundaries.

## Integration / API testing

- Use `TestClient(app)`.
- Assert status codes, the page envelope, and business DTO keys.
- Cover error paths: 404 (missing id), 409 (unique conflict), 422 (bad body).

## API testing checklist (per resource)

- [ ] list returns `{items,total,page,page_size,pages}`
- [ ] pagination limits + disjoint pages
- [ ] search returns relevant rows
- [ ] sort asc/desc
- [ ] get by id + 404
- [ ] create (201) + validation (422)
- [ ] update (partial) + delete (204)

## Performance testing plan

- Target: p95 < 200ms for list/aggregation on seed volume.
- Tooling suggestion: `locust` or `k6` against `/api/v1/*` list + summary routes.
- Watch N+1: aggregation reads use bounded `fetch_all` (cap 1000); add indexes
  already present on `project_id`/`reference`.

## Security testing plan

- Input validation is enforced by Pydantic; verify no 500s on malformed input.
- Confirm error bodies expose only `detail` (no stack traces) — handled centrally.
- Dependency scan: `pip-audit` (add to CI).
- Auth/RBAC are intentionally out of scope until a later phase.

## Regression plan

- The full `pytest` suite is the regression gate. Run before every release.
- Add a test with every new endpoint/DTO (shape + one edge case).

## UAT plan (business acceptance)

- Requirements/Architecture/Development/Testing/Release/Go-Live/Audit summaries
  reviewed by the respective domain owner against seed data.
- Executive + portfolio rollups reviewed by the CIO persona.
- Artifact generation validated for each type (JSON + Markdown render).

## Smoke test (fast confidence)

```bash
BASE=http://localhost:8000
curl -fsS $BASE/health
curl -fsS $BASE/api/v1/projects | head -c 200
curl -fsS "$BASE/api/v1/sdlc/projects/1/requirements/summary" | head -c 200
curl -fsS $BASE/api/v1/executive/portfolio | head -c 200
```
