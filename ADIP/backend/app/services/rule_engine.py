"""Unified deterministic rule engine — non-LLM automation for SDLC quality."""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Callable

from app.connectors.normalizers import normalize_severity
from app.schemas.rules import RuleDefinition, RuleResult, RuleRunReport, RuleRunRequest

RuleFn = Callable[[RuleRunRequest], RuleResult]


@dataclass(frozen=True)
class _RuleSpec:
    id: str
    name: str
    category: str
    description: str
    fn: RuleFn


def _status(passed: bool, warning: bool = False) -> str:
    if passed:
        return "pass"
    return "warning" if warning else "fail"


class RuleEngine:
    """Configurable, testable, explainable rules without LLM."""

    def list_rules(self, category: str | None = None) -> list[RuleDefinition]:
        specs = self._specs()
        if category:
            specs = [s for s in specs if s.category == category]
        return [
            RuleDefinition(id=s.id, name=s.name, category=s.category, description=s.description)
            for s in specs
        ]

    def run(self, request: RuleRunRequest) -> RuleRunReport:
        specs = self._specs()
        if request.categories:
            specs = [s for s in specs if s.category in request.categories]
        results = [s.fn(request) for s in specs]
        passed = sum(1 for r in results if r.status == "pass")
        failed = sum(1 for r in results if r.status == "fail")
        warnings = sum(1 for r in results if r.status == "warning")
        overall: str = "fail" if failed else ("warning" if warnings else "pass")
        return RuleRunReport(
            total=len(results), passed=passed, failed=failed, warnings=warnings,
            results=results, overall_status=overall,
        )

    def _specs(self) -> list[_RuleSpec]:
        return [
            _RuleSpec("sdlc-completeness-sections", "SDLC artifact has minimum sections",
                      "sdlc_completeness", "Artifact must have >=2 section markers or headings.",
                      self._rule_sdlc_completeness),
            _RuleSpec("req-numbered", "Requirements are numbered",
                      "requirement_quality", "Requirements should use numbered IDs (REQ-*, FR-*).",
                      self._rule_requirement_numbered),
            _RuleSpec("req-traceability-ref", "Requirements reference traceability",
                      "requirement_quality", "Requirements should link to source IDs.",
                      self._rule_requirement_traceability),
            _RuleSpec("arch-components", "Architecture lists components",
                      "architecture_quality", "Architecture docs should mention components/services.",
                      self._rule_architecture_components),
            _RuleSpec("arch-decisions", "Architecture captures decisions",
                      "architecture_quality", "Design decisions or ADR references expected.",
                      self._rule_architecture_decisions),
            _RuleSpec("test-evidence-ci", "Test evidence includes CI reference",
                      "test_evidence", "Test packs should reference CI/build or test run.",
                      self._rule_test_evidence_ci),
            _RuleSpec("test-evidence-coverage", "Test evidence mentions coverage",
                      "test_evidence", "Coverage or quality metrics expected.",
                      self._rule_test_evidence_coverage),
            _RuleSpec("release-blockers", "Release readiness checks blockers",
                      "release_readiness", "Release report should address open blockers.",
                      self._rule_release_blockers),
            _RuleSpec("release-quality-gate", "Release readiness quality gate",
                      "release_readiness", "Quality gate status should be present.",
                      self._rule_release_quality_gate),
            _RuleSpec("security-severity-normalized", "Security severities normalized",
                      "security_mapping", "Findings use critical/high/medium/low.",
                      self._rule_security_severity),
            _RuleSpec("connector-classification", "Connector records classified",
                      "connector_classification", "Connector records have classification field.",
                      self._rule_connector_classification),
            _RuleSpec("audit-evidence-checklist", "Audit evidence checklist items",
                      "audit_evidence", "Audit pack should list control/evidence items.",
                      self._rule_audit_evidence),
            _RuleSpec("traceability-gaps", "Traceability gap detection",
                      "traceability", "Orphan records without external_id flagged.",
                      self._rule_traceability_gaps),
            _RuleSpec("artifact-naming", "Artifact naming convention",
                      "artifact_naming", "Title follows ADIP naming pattern.",
                      self._rule_artifact_naming),
            _RuleSpec("artifact-version", "Artifact version present",
                      "artifact_naming", "Version or date stamp in content.",
                      self._rule_artifact_version),
        ]

    def _text(self, req: RuleRunRequest) -> str:
        parts = [req.artifact_content or ""]
        for rec in req.connector_records:
            parts.append(str(rec.get("title", "")))
            parts.append(str(rec.get("classification", "")))
        return "\n".join(parts)

    def _rule_sdlc_completeness(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req)
        sections = len(re.findall(r"^#+\s", text, re.M)) + len(re.findall(r"^\d+\.\s", text, re.M))
        ok = sections >= 2 or len(text) >= 200
        return RuleResult(
            rule_id="sdlc-completeness-sections", name="SDLC artifact has minimum sections",
            category="sdlc_completeness", status=_status(ok, warning=sections == 1),
            message=f"Found {sections} section markers; content length {len(text)}.",
            remediation="Add structured sections (headings or numbered lists).",
            explainability={"section_count": sections, "content_length": len(text)},
        )

    def _rule_requirement_numbered(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req)
        hits = re.findall(r"\b(REQ|FR|UPI|ADIP)-\d+\b", text, re.I)
        ok = len(hits) >= 1 or "requirement" not in (req.artifact_type or "").lower()
        return RuleResult(
            rule_id="req-numbered", name="Requirements are numbered", category="requirement_quality",
            status=_status(ok, warning=not hits and bool(req.connector_records)),
            message=f"Found {len(hits)} numbered requirement references.",
            remediation="Use REQ-### or story keys from Jira.",
            explainability={"matches": hits[:5]},
        )

    def _rule_requirement_traceability(self, req: RuleRunRequest) -> RuleResult:
        refs = [r.get("external_id") for r in req.connector_records if r.get("external_id")]
        ok = len(refs) >= 1
        return RuleResult(
            rule_id="req-traceability-ref", name="Requirements reference traceability",
            category="requirement_quality", status=_status(ok, warning=len(refs) == 0),
            message=f"{len(refs)} connector record external IDs available for traceability.",
            remediation="Sync Jira/Confluence connectors before generating requirements artifacts.",
            explainability={"external_ids": refs[:10]},
        )

    def _rule_architecture_components(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req).lower()
        keywords = ["service", "component", "api", "gateway", "database", "module"]
        found = [k for k in keywords if k in text]
        ok = len(found) >= 2 or "architecture" not in (req.artifact_type or "").lower()
        return RuleResult(
            rule_id="arch-components", name="Architecture lists components",
            category="architecture_quality", status=_status(ok, warning=len(found) == 1),
            message=f"Architecture keywords found: {', '.join(found) or 'none'}.",
            remediation="List major components, boundaries, and integration points.",
            explainability={"keywords": found},
        )

    def _rule_architecture_decisions(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req).lower()
        ok = any(w in text for w in ("decision", "adr", "design decision", "rationale"))
        return RuleResult(
            rule_id="arch-decisions", name="Architecture captures decisions",
            category="architecture_quality", status=_status(ok, warning=not ok),
            message="Design decision keywords present." if ok else "No design decision references.",
            remediation="Include ADR or Confluence design decision references.",
            explainability={},
        )

    def _rule_test_evidence_ci(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req).lower()
        ok = any(w in text for w in ("jenkins", "build", "ci", "pipeline", "test run"))
        return RuleResult(
            rule_id="test-evidence-ci", name="Test evidence includes CI reference",
            category="test_evidence", status=_status(ok, warning=not ok),
            message="CI/build reference found." if ok else "No CI/build reference.",
            remediation="Link Jenkins build or pipeline run IDs.",
            explainability={},
        )

    def _rule_test_evidence_coverage(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req)
        ok = bool(re.search(r"coverage|quality gate|%\s*\d", text, re.I))
        return RuleResult(
            rule_id="test-evidence-coverage", name="Test evidence mentions coverage",
            category="test_evidence", status=_status(ok, warning=not ok),
            message="Coverage/quality metrics referenced." if ok else "No coverage metrics.",
            remediation="Include SonarQube coverage or quality gate status.",
            explainability={},
        )

    def _rule_release_blockers(self, req: RuleRunRequest) -> RuleResult:
        blockers = [r for r in req.connector_records if r.get("status") == "Blocked" or "blocker" in str(r.get("title", "")).lower()]
        text = self._text(req).lower()
        ok = "blocker" in text or "open defect" in text or len(blockers) == 0
        return RuleResult(
            rule_id="release-blockers", name="Release readiness checks blockers",
            category="release_readiness", status=_status(ok, warning=bool(blockers)),
            message=f"{len(blockers)} blocker record(s); narrative addresses blockers: {'blocker' in text}.",
            remediation="List open blockers and mitigation in release readiness report.",
            explainability={"blockers": [b.get("title") for b in blockers]},
        )

    def _rule_release_quality_gate(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req).lower()
        ok = "quality gate" in text or "sonarqube" in text or any(r.get("quality_gate") for r in req.connector_records)
        return RuleResult(
            rule_id="release-quality-gate", name="Release readiness quality gate",
            category="release_readiness", status=_status(ok, warning=not ok),
            message="Quality gate referenced." if ok else "No quality gate status.",
            remediation="Include SonarQube quality gate pass/fail.",
            explainability={},
        )

    def _rule_security_severity(self, req: RuleRunRequest) -> RuleResult:
        severities = [normalize_severity(r.get("severity")) for r in req.connector_records if r.get("severity")]
        valid = {"critical", "high", "medium", "low", "info"}
        bad = [s for s in severities if s not in valid]
        ok = not bad
        return RuleResult(
            rule_id="security-severity-normalized", name="Security severities normalized",
            category="security_mapping", status=_status(ok or not severities, warning=bool(bad)),
            message=f"{len(severities)} severities; {len(bad)} non-standard.",
            remediation="Run connector sync to normalize finding severities.",
            explainability={"severities": severities[:10]},
        )

    def _rule_connector_classification(self, req: RuleRunRequest) -> RuleResult:
        if not req.connector_records:
            return RuleResult(
                rule_id="connector-classification", name="Connector records classified",
                category="connector_classification", status="warning",
                message="No connector records supplied.", remediation="Preview connector sources first.",
                explainability={},
            )
        unclassified = [r for r in req.connector_records if not r.get("classification")]
        ok = len(unclassified) == 0
        return RuleResult(
            rule_id="connector-classification", name="Connector records classified",
            category="connector_classification", status=_status(ok, warning=bool(unclassified)),
            message=f"{len(req.connector_records) - len(unclassified)}/{len(req.connector_records)} classified.",
            remediation="Ensure mock catalog or sync populates classification field.",
            explainability={"unclassified": len(unclassified)},
        )

    def _rule_audit_evidence(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req).lower()
        ok = any(w in text for w in ("control", "evidence", "attestation", "sox", "audit"))
        return RuleResult(
            rule_id="audit-evidence-checklist", name="Audit evidence checklist items",
            category="audit_evidence", status=_status(ok, warning=not ok),
            message="Audit/control keywords present." if ok else "No audit checklist markers.",
            remediation="List control objectives and evidence items with Outlook/SharePoint refs.",
            explainability={},
        )

    def _rule_traceability_gaps(self, req: RuleRunRequest) -> RuleResult:
        orphans = [r for r in req.connector_records if not r.get("external_id")]
        ok = len(orphans) == 0
        return RuleResult(
            rule_id="traceability-gaps", name="Traceability gap detection",
            category="traceability", status=_status(ok, warning=bool(orphans)),
            message=f"{len(orphans)} record(s) missing external_id.",
            remediation="Ensure connector sync preserves external IDs.",
            explainability={"orphan_count": len(orphans)},
        )

    def _rule_artifact_naming(self, req: RuleRunRequest) -> RuleResult:
        title = req.artifact_type or "artifact"
        ok = bool(re.match(r"^[a-z][a-z0-9_]*$", title)) or len(title) >= 3
        return RuleResult(
            rule_id="artifact-naming", name="Artifact naming convention",
            category="artifact_naming", status=_status(ok),
            message=f"Artifact type/key: {title}",
            remediation="Use snake_case artifact type IDs.",
            explainability={"artifact_type": title},
        )

    def _rule_artifact_version(self, req: RuleRunRequest) -> RuleResult:
        text = self._text(req)
        ok = bool(re.search(r"\b(v\d|version|202\d|generated_at)\b", text, re.I))
        return RuleResult(
            rule_id="artifact-version", name="Artifact version present",
            category="artifact_naming", status=_status(ok, warning=not ok),
            message="Version/date marker found." if ok else "No version or date stamp.",
            remediation="Include version or generation timestamp in artifact header.",
            explainability={},
        )


rule_engine = RuleEngine()
