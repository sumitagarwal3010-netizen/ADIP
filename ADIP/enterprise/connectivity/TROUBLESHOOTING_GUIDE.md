# Connector Troubleshooting Guide

## Backend unavailable / mock fallback

**Symptom:** Integration Center shows "Backend unavailable — mock catalog"  
**Fix:** Start backend (`uvicorn app.main:app`), set `VITE_BACKEND_MODE=true`

## Empty source preview

**Symptom:** Workbench shows 0 records  
**Fix:** Seed connectors, sync target connector, or rely on mock catalog (automatic fallback)

## Generate returns 404 for artifact

**Symptom:** `GET /artifacts/{id}` not found  
**Cause:** In-memory store cleared on backend restart  
**Fix:** Re-generate artifact (pre-MVP limitation)

## Live mode test fails

**Symptom:** "Configure credentials for live mode"  
**Fix:** Set `mock_mode: true` for demo, or provide `credential_ref` + env/vault value

## OIDC blocks API calls

**Symptom:** 401 on connector APIs  
**Fix:** Use `ADIP_AUTH_MODE=demo` locally; production uses Bearer token

## Quality score low

**Symptom:** Score &lt; 0.65  
**Cause:** Few source records or single connector  
**Fix:** Sync more connectors, use multi-source use case (release readiness, executive summary)

## Prompt missing sources

**Symptom:** Prompt shows "(no source records)"  
**Fix:** Run preview-sources before generate; sync connectors first
