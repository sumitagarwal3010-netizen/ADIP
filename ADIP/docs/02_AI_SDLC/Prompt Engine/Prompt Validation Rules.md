# ADIP Prompt Validation Rules

Concrete, checkable rules for prompt quality — the automated counterpart to the
`Prompt Anti-Patterns.md` smell test. These map to the platform's prompt quality
scoring and can be enforced in the Prompt Studio approval workflow.

---

## Rule set

| ID | Rule | Severity | Check |
|---|---|---|---|
| PR-01 | Prompt declares a role | High | Contains a "You are ..." role statement |
| PR-02 | Single, explicit objective | High | Contains one "Objective:" line |
| PR-03 | Expected sections enumerated | High | Lists ≥ 3 named sections |
| PR-04 | Output format specified | Medium | Mentions Markdown/JSON/table |
| PR-05 | Scope / non-goals constrained | Medium | Contains a "Constraints:" block |
| PR-06 | Anti-hallucination guard | High | Instructs to mark unknowns / not invent |
| PR-07 | Self-check block present | Medium | Contains a verify/check instruction |
| PR-08 | Compliance framing (banking) | High* | References a regulator or compliance |
| PR-09 | Variables are named & documented | Low | No single-letter `{x}` placeholders |
| PR-10 | Reasonable length | Low | Between 40 and 1500 words |
| PR-11 | One artifact per prompt | Medium | Does not request multiple artifact types |
| PR-12 | Length caps on verbose sections | Low | Caps summary/section length |

\* High for banking artifacts; N/A for generic prompts.

---

## Scoring

- **High** rule failed → block publishing (Studio approval gate).
- **Medium** failed → warn; allow with reviewer sign-off.
- **Low** failed → advisory.

A prompt "passes" when no High rules fail. This mirrors the artifact quality
bands (Excellent/Good/Fair/Poor) applied to generated outputs.

---

## Reference implementation sketch

These rules are simple, dependency-free predicates over the prompt text — the
same style used by the artifact `QualityEngine`:

```python
def validate_prompt(text: str, *, banking: bool = True) -> list[dict]:
    t = text.lower()
    findings = []
    def fail(rule, sev, msg):
        findings.append({"rule": rule, "severity": sev, "message": msg})

    if "you are " not in t: fail("PR-01", "high", "No role declared.")
    if "objective" not in t: fail("PR-02", "high", "No explicit objective.")
    if text.count("\n-") + text.count("\n1.") < 3: fail("PR-03", "medium", "Few/no expected sections.")
    if not any(k in t for k in ("markdown", "json", "table")): fail("PR-04", "medium", "No output format.")
    if "constraint" not in t: fail("PR-05", "medium", "No constraints/non-goals.")
    if not any(k in t for k in ("do not invent", "tbd", "unknown")): fail("PR-06", "high", "No anti-hallucination guard.")
    if not any(k in t for k in ("verify", "self-check", "check that")): fail("PR-07", "medium", "No self-check block.")
    if banking and not any(k in t for k in ("rbi", "npci", "pci", "compliance", "regulat")):
        fail("PR-08", "high", "No compliance framing.")
    words = len(text.split())
    if words < 40 or words > 1500: fail("PR-10", "low", f"Length {words} words outside 40–1500.")
    return findings
```

> This is a documented rule set + reference; wire it into the Studio approval
> path where prompt governance is enforced. It reuses the platform's existing
> deterministic-scoring philosophy (no model required to validate a prompt).
