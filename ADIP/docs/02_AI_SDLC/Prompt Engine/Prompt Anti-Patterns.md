# ADIP Prompt Anti-Patterns

Common prompt mistakes that degrade artifact quality, and the fix for each.
Pairs with `Prompt Cookbook.md` (do-this) and `Prompt Validation Rules.md`
(automated guards).

---

| # | Anti-pattern | Why it hurts | Fix |
|---|---|---|---|
| 1 | **No role** | Model defaults to generic tone; misses domain rigor | Start with a specific role (Principal BA, Solution Architect). |
| 2 | **Vague objective** ("write about UPI") | Unfocused, rambling output | State one concrete deliverable and feature. |
| 3 | **No expected sections** | Inconsistent structure; missing sections | Enumerate the exact sections, in order. |
| 4 | **No output format** | Prose where a table/JSON is needed | Specify Markdown/JSON/table explicitly. |
| 5 | **Missing constraints** | Scope creep; artifacts for wrong phase | Add scope + non-goals + "stay within {phase}". |
| 6 | **No "don't invent" guard** | Hallucinated facts, fake figures | Instruct to mark unknowns as "TBD — SME input". |
| 7 | **Kitchen-sink prompt** | Asks for BRD+HLD+tests at once → shallow everything | One artifact per prompt; orchestrate the SDLC separately. |
| 8 | **Unbounded length** | Bloated, unfocused executive summary | Cap sections ("summary < 150 words"). |
| 9 | **Ambiguous variables** (`{x}`, `{data}`) | Wrong substitutions | Use named, documented variables with examples. |
| 10 | **No compliance framing** (banking) | Regulatory gaps slip through | Add a compliance checklist (RBI/NPCI/PCI-DSS). |
| 11 | **No self-check** | Placeholder text, empty sections ship | Add a verification block at the end. |
| 12 | **Over-constraining** | Model can't reason; robotic output | Constrain scope, not thinking; leave room for analysis. |
| 13 | **Burying the ask** | Objective lost in a wall of context | Put the objective early and clearly labeled. |
| 14 | **Ignoring token budget** | Truncated context → dropped requirements | Use context trimming / chunking (runtime handles this). |
| 15 | **No iteration** | First draft treated as final | Benchmark + regression-test variants (ADIP tooling). |

---

## Quick "smell test"

A prompt is likely weak if you can't answer **yes** to all of these:

- [ ] Is there a specific role?
- [ ] Is there exactly one clear deliverable?
- [ ] Are the required sections listed?
- [ ] Is the output format stated?
- [ ] Are scope and non-goals constrained?
- [ ] Is there a "don't invent facts" guard?
- [ ] Is there a self-check block?
- [ ] (Banking) Is compliance addressed?

The automated equivalent of this list lives in `Prompt Validation Rules.md` and
the platform's prompt quality scoring.
