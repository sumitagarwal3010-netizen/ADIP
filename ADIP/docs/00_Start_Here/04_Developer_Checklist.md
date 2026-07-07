# Developer Checklist

## First run
- [ ] Python 3.11+ and Node 18+ installed
- [ ] `backend/.venv` created and `requirements.txt` installed
- [ ] `python -m app.seed.run --reset` succeeds (7 projects seeded)
- [ ] `uvicorn app.main:app` serves `/docs`
- [ ] `npm install` and `npm run dev` start the frontend

## Before you commit code
- [ ] `cd backend && pytest` — all tests pass
- [ ] `npx tsc --noEmit` — no type errors (repo root)
- [ ] `npm run build` — production build succeeds
- [ ] No duplicate services / APIs / generators (reuse existing)
- [ ] New endpoints have a `response_model` + `summary`
- [ ] New env vars documented in `.env.example` files

## When adding a feature
- [ ] Reuse `BaseRepository` / `BaseService` / `fetch_all` for data access
- [ ] Business endpoints return DTOs (not raw ORM rows)
- [ ] Raise domain exceptions from `app.core.exceptions`
- [ ] Add a test (happy path + one edge case)
