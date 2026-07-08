# ADIP API Hardening Guide

Concrete hardening steps for the ADIP API in production. Complements
`OWASP Checklist.md` and `Threat Model.md`.

---

## 1. Secure headers

Set at the edge (Nginx/ingress) and/or app middleware:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

The frontend Nginx config (`deploy/nginx.conf`) is the natural place; add these
headers there for the SPA and proxied API.

## 2. Rate limiting

- App-level token bucket: set `RATE_LIMIT_ENABLED=true`, tune `RATE_LIMIT_RPS`
  and `RATE_LIMIT_BURST` (see `app/core/rate_limit.py`).
- Edge-level: `nginx.ingress.kubernetes.io/limit-rps` (see `deploy/k8s/ingress.yaml`).
- Apply both: edge for coarse protection, app for per-client fairness.

## 3. Input validation

- All request bodies/params are validated by Pydantic schemas — keep it that way;
  never accept free-form dicts into services.
- Enforce max page sizes (`max_page_size`) to prevent unbounded queries.

## 4. Output validation

- Consistent error envelope via the `ADIPError` handler; no stack traces when
  `DEBUG=false`.
- Treat LLM output as untrusted: validate structure before persistence/return.

## 5. CORS

- `cors_origins` is restricted to known origins in `app/core/config.py`.
- In production, set it to the exact SPA origin(s); avoid `*` with credentials.

## 6. Transport & secrets

- Terminate TLS at the ingress; redirect HTTP→HTTPS.
- Secrets via K8s secret / vault / external-secrets — never in images or code.
- CI secret scanning (`security-scan.yml`) guards against accidental commits.

## 7. Authentication (future)

- Add OIDC/JWT validation as a dependency; attach identity to the request context
  (correlation id plumbing already exists) so the audit trail records *who*.
- Introduce RBAC roles aligned to the existing persona model.

## 8. Container hardening

- Slim base images (already used); run as non-root; read-only root filesystem
  where possible; drop Linux capabilities; keep healthchecks.
- Scan images in CI (add Trivy/Grype to the pipeline as a follow-up).
