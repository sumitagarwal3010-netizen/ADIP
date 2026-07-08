# ADIP Developer FAQ

Common questions when working on ADIP.

---

**Q: Do I need a GPU or a running LLM to work on ADIP?**
No. ADIP runs fully in **mock mode** by default (`LOCAL_LLM_ENABLED=false`). The
prompt engine, artifact generator, quality engine and reviewer all produce
deterministic output without any model. Enable a local model only when you want
real completions.

**Q: How do I turn on a real local LLM?**
Install Ollama, pull a model (e.g. `ollama pull llama3.1:8b`), then set
`LOCAL_LLM_ENABLED=true`, `LLM_PROVIDER=ollama`, `OLLAMA_MODEL=llama3.1:8b`. See
`docs/00_Start_Here/07_Local_LLM_Quick_Start.md`.

**Q: SQLite or PostgreSQL?**
SQLite for local dev (default `DATABASE_URL`), PostgreSQL for production. The code
and migrations support both. `psycopg` is optional (`requirements-postgres.txt`).

**Q: The seeder or a query fails with "no such table".**
A model/migration was added. Run `python -m app.cli migrate` then
`python -m app.cli seed --reset` (dev) to rebuild the schema and data.

**Q: How do I add a new CRUD entity?**
`python -m app.cli scaffold <Name>` prints the exact registration. Add the model
+ schemas, register the resource, then `python -m app.cli migrate`.

**Q: How do I list every API route?**
`python -m app.cli routes` (or open `/docs` for Swagger UI).

**Q: Where do generated datasets / performance reports go?**
`docs/examples/enterprise-datasets/` and `docs/examples/performance/`. Regenerate
with `python -m app.cli datasets` and `python -m app.cli perf`.

**Q: How do I benchmark or regression-test a prompt change?**
Benchmark: `python -m app.cli benchmark "v1" "v2"`. Regression (baseline vs
candidate with pass/fail): `POST /api/v1/prompt-regression/compare`.

**Q: How do I export an artifact as DOCX/PDF/HTML/ZIP?**
`GET /api/v1/artifact-export/projects/{id}?artifact_type=BRD&format=html` (or
`docx-model`, `pdf-model`, `csv`, `markdown`, `json`), and
`POST /api/v1/artifact-export/projects/{id}/bundle` for a ZIP of many artifacts.

**Q: Why are some LLM adapters "scaffolds"?**
OpenAI/Gemini/LM Studio adapters implement the `LLMProvider` protocol but raise
`NotImplementedError` until wired to a vendor SDK. Ollama is fully implemented.
See `docs/14_Extensibility/Extensibility Guide.md`.

**Q: How is observability exposed?**
`GET /metrics`, `GET /api/v1/llm/runtime`, `GET /api/v1/health`,
`GET /api/v1/llm/health`. See `docs/09_Operations/Observability Guide.md`.

**Q: Tests are failing after I changed seed data / counts.**
Some tests assert dynamic counts via helpers (project/copilot/provider counts).
Prefer the helper over hard-coded numbers when adding data.

**Q: How do I run the full validation locally?**
Backend: `cd backend && pytest -q`. Frontend: `npx tsc --noEmit && npm run build`.
CI runs the same in `.github/workflows/`.
