# 06 — ADIP Governance Model

This document describes how ADIP governs **AI** (use cases, models, prompts,
risk, controls, evaluation, observability) and how AI signals flow back to
the Risk & Compliance and Executive layers.

## Single-Source-of-Truth Principles

| Concern | Authoritative Center | Other Centers |
| --- | --- | --- |
| AI use case lifecycle | **AI Governance · Use Cases** | Reference / link only |
| Model registry | **AI Governance · Models** | Reference / link only |
| Prompt governance | **AI Governance · Prompts** | Reference / link only |
| AI risk register | **AI Governance · Risks** | Risk & Compliance shows a **rollup**, not a duplicate register |
| AI controls library | **AI Governance · Controls** | Reference / link only |
| AI quality, hallucination, bias, explainability scores | **AI Evaluation Center** | None |
| AI runtime usage, latency, cost, errors | **AI Observability Center** | None |
| Universal artifact repository | **Universal Artifacts Repository (`/artifacts`)** | Each center keeps its own slice but pushes here |

## AI Governance Workflow

```
       Use Case Intake          ┌─────────────────┐
   ────────────────────────────▶│ Use Case Registry│
                                └────────┬────────┘
                                         ▼
                  ┌──────────────────────────────────┐
                  │  Risk Assessment + Controls Map  │
                  └──────────┬───────────┬──────────┘
                             ▼           ▼
                   ┌─────────────┐  ┌──────────────┐
                   │  Models     │  │  Prompts     │
                   └────┬────────┘  └──────┬───────┘
                        ▼                  ▼
                  ┌──────────────────────────────┐
                  │   AI Evaluation (quality)    │
                  └─────────────┬────────────────┘
                                ▼
                  ┌──────────────────────────────┐
                  │  AI Observability (runtime)  │
                  └─────────────┬────────────────┘
                                ▼
                  ┌──────────────────────────────┐
                  │   Risk Rollup → CRO / Board  │
                  └──────────────────────────────┘
```

## AI Risk Rollup in Risk & Compliance

The **AI Risk** tab in Risk & Compliance does **not** maintain its own AI
risk register. It renders a summarized rollup of the top 5 AI risks from the
authoritative AI Governance Risk Registry, with explicit "open AI Risk
Registry in AI Governance" deep link.

## Roles & Accountability

| Role | Owns |
| --- | --- |
| **AI Governance Lead** | Use case approvals, AI control library, AI risk register |
| **Model Risk Officer** | Model risk classification, model fact sheets |
| **AI Quality Lead** | AI evaluation runs, hallucination/bias monitors |
| **AI Platform Engineering** | Observability, performance, cost |
| **CISO** | Cyber risk, AI guardrails coverage, control effectiveness |
| **CRO** | Aggregated enterprise risk + AI risk rollup |
| **CIO** | Use case prioritization, AI portfolio investment |

## Approval Status Vocabulary

`Approved` · `Pending Review` · `Draft` · `Rejected`

## Risk Rating Vocabulary

`Critical` · `High` · `Medium` · `Low`

## Audit Trail

Every artifact has a generation history (timestamp, generator, model used,
version, change summary). The artifact viewer shows the full body, sections,
risk rating and approval status. Downloading an artifact serializes the full
metadata + body.
