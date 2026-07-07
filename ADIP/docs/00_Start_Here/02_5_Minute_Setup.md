# 5-Minute Setup

No Docker or PostgreSQL required — the backend uses SQLite by default.

```bash
# 1. Backend (terminal 1)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed.run --reset          # create tables + seed 7 banking projects
uvicorn app.main:app --reload --port 8000
#   API docs → http://localhost:8000/docs

# 2. Frontend (terminal 2, repo root)
npm install
npm run dev
#   App → the URL Vite prints (usually http://localhost:5173)
```

## Smoke test (30 seconds)

```bash
curl -s http://localhost:8000/health
curl -s "http://localhost:8000/api/v1/prompt-templates/top?limit=1"
curl -s -X POST http://localhost:8000/api/v1/orchestrator/execute \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Implement UPI Auto-Reversal for Mobile Banking."}' | head -c 300
```

You should see the health payload, the top-ranked banking template, and a full
orchestration response. Done.
