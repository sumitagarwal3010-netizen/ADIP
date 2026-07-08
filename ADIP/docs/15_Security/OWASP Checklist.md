# ADIP OWASP Top 10 Checklist

Mapping of the OWASP Top 10 (2021) to ADIP's controls, with status and gaps.
Pairs with `Threat Model.md` and `API Hardening.md`.

Legend: ✅ addressed · ⚠️ partial / config-dependent · ⛔ future work (documented)

| # | Risk | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | ⛔ | AuthN/AuthZ is a documented future seam (OIDC/SSO). Today the API is unauthenticated by design for the internal/demo posture. Add RBAC before external exposure. |
| A02 | Cryptographic Failures | ⚠️ | No secrets stored by default (mock-first). TLS terminated at ingress/proxy. Secrets via K8s secret/vault; never in code (secret scanning in CI). |
| A03 | Injection | ✅ | ORM (SQLAlchemy) parameterizes queries; Pydantic validates all input. Raw SQL is limited to reviewed DBA scripts. |
| A04 | Insecure Design | ✅ | Layered architecture, ADRs, threat model, config-gated features default-off. |
| A05 | Security Misconfiguration | ⚠️ | `DEBUG=false` in prod; CORS restricted to known origins; rate limiting available. Verify secure headers at the proxy (see API Hardening). |
| A06 | Vulnerable & Outdated Components | ✅ | CI `security-scan.yml`: pip-audit + npm audit + SBOM (CycloneDX), weekly + on PR. |
| A07 | Identification & Auth Failures | ⛔ | Tied to A01 — add authentication. Rate limiting mitigates brute force once auth exists. |
| A08 | Software & Data Integrity Failures | ⚠️ | Pinned deps + SBOM; additive migrations (ADR-0006). Add image signing/provenance in the release pipeline. |
| A09 | Logging & Monitoring Failures | ✅ | Structured logs w/ correlation id, metrics (`/metrics`, Prometheus), audit trail, alert rules. |
| A10 | SSRF | ✅ | Backend makes no user-controlled outbound requests; the only egress is the configured LLM base URL (not user-supplied). Keep it that way when adding RAG/integrations. |

---

## Priorities to raise the score

1. **Authentication & RBAC** (closes A01/A07) — highest impact before external use.
2. **Secure headers + TLS everywhere** (A05/A02) — enforce at ingress and app.
3. **Image signing/provenance** (A08) — add to `release.yml`.
