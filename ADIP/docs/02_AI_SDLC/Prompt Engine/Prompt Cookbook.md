# ADIP Prompt Cookbook

Copy-paste recipes and reusable building blocks for authoring high-quality
enterprise SDLC prompts. Complements the `Prompt Engineering Guide.md` (concepts)
and `Prompt Tuning Guide.md` (optimization). For anti-patterns see
`Prompt Anti-Patterns.md`.

> ADIP ships a programmatic template library (`prompt_template_library`) with
> use-case, artifact-authoring and 360 matrix prompts. This cookbook is the
> human-facing companion for writing your own.

---

## 1. The anatomy of a strong prompt

Every production prompt should contain these blocks (the template library encodes
all of them):

1. **Role** — who the model should act as.
2. **Context** — project/domain facts, constraints.
3. **Objective** — the single, specific outcome.
4. **Constraints** — compliance, scope, non-goals.
5. **Expected sections** — the exact structure to produce.
6. **Output format** — Markdown/JSON/table.
7. **Quality checklist** — self-check criteria.
8. **Compliance checklist** — regulatory checks (banking).

---

## 2. Reusable prompt blocks

Compose these into any prompt.

### Role blocks
```text
You are a Principal Business Analyst in an enterprise bank with 15 years in payments.
You are a Solution Architect specializing in high-availability transaction systems.
You are a QA Lead responsible for regulatory test coverage and traceability.
You are a Risk & Compliance Officer reviewing artifacts against RBI/NPCI mandates.
```

### Context block (banking)
```text
Context:
- Domain: {domain}  (e.g. UPI, Cards, Loans)
- System: {system/application}
- Regulatory scope: {compliance}  (e.g. RBI, NPCI, PCI-DSS)
- Non-functional targets: availability {sla}, latency {p99}, throughput {tps}
```

### Constraint block
```text
Constraints:
- Do not invent facts; mark unknowns as "TBD — requires SME input".
- Stay within {phase} scope; do not produce artifacts for other SDLC phases.
- Every requirement must be atomic, testable and traceable.
- Call out compliance impact explicitly.
```

### Output-format block
```text
Output format: Markdown with the following sections, in order:
{numbered section list}
Use tables for structured data. Keep executive summary under 150 words.
```

### Self-check block
```text
Before finishing, verify:
- All required sections are present and non-empty.
- No placeholder text remains.
- Acceptance criteria are measurable.
- Compliance implications are stated.
```

---

## 3. Role-based recipes

### Business Analyst → BRD
```text
{Role: Principal Business Analyst}
{Context: banking}
Objective: Author a Business Requirements Document for "{feature}".
{Constraints}
Expected sections: Executive Summary, Business Context, Objectives, Scope,
Stakeholders, Business Requirements, Assumptions, Dependencies, Risks,
Success Metrics, Compliance Considerations.
{Output-format}
{Self-check}
```

### Architect → HLD
```text
{Role: Solution Architect}
{Context: banking}
Objective: Produce a High-Level Design for "{feature}".
Expected sections: Overview, Architecture Diagram (described), Components,
Data Flow, Integrations, NFRs, Security Controls, Failure Modes, ADR references.
{Output-format} {Self-check}
```

### QA Lead → Test Strategy
```text
{Role: QA Lead}
Objective: Define a Test Strategy for "{feature}".
Expected sections: Scope, Test Levels, Entry/Exit Criteria, Environments,
Test Data, Automation Approach, Regulatory/Compliance Tests, Traceability,
Risks, Metrics.
{Output-format} {Self-check}
```

---

## 4. Domain-specific starters

| Domain | Starter objective |
|---|---|
| UPI | "Implement UPI Auto-Reversal with NPCI reconciliation, TAT SLAs and audit trail." |
| Cards | "Design a card authorization flow with fraud checks, EMI conversion and PCI-DSS controls." |
| Loans | "Design digital loan origination with credit scoring, KYC and disbursement." |
| Trade Finance | "Author an LC issuance workflow with SWIFT messaging and sanctions screening." |
| AML | "Specify AML transaction monitoring with scenario rules, alerting and STR filing." |

Browse the full generated set: `GET /api/v1/prompt-templates/matrix` (360 prompts)
and `docs/examples/enterprise-datasets/prompts.jsonl` (1000 prompts).

---

## 5. Variable injection

Prompts use `{placeholder}` variables. In the Prompt Studio / Workbench, provide
values at run time. Keep variables:

- **Named clearly** (`{project_name}`, not `{x}`).
- **Documented** with an example value.
- **Validated** — see `Prompt Validation Rules.md`.

---

## 6. Iteration loop (with ADIP tooling)

1. Draft in the Prompt Studio (`/api/v1/prompt-workbench/prompts`).
2. Run and inspect the artifact + quality score.
3. Benchmark variants: `python -m app.cli benchmark "v1" "v2"`.
4. Guard against regressions: `POST /api/v1/prompt-regression/compare`.
5. When approved, tag → approve → publish in the Studio.
