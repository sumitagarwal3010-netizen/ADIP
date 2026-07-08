"""Deterministic rule engine REST APIs."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.schemas.rules import RuleDefinition, RuleResult, RuleRunReport, RuleRunRequest
from app.services.rule_engine import rule_engine

router = APIRouter(prefix="/rules", tags=["Rule Engine"])


@router.get("", response_model=list[RuleDefinition])
def list_rules(category: str | None = None):
    return rule_engine.list_rules(category=category)


@router.post("/run", response_model=RuleRunReport)
def run_rules(body: RuleRunRequest):
    return rule_engine.run(body)


@router.post("/explain", response_model=list[RuleResult])
def explain_rules(body: RuleRunRequest):
    report = rule_engine.run(body)
    return report.results
