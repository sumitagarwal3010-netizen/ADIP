"""Connector driver implementations — mock-first, production-extensible."""
from __future__ import annotations

from typing import Any

from app.connectors.base import BaseConnector
from app.connectors.mock_catalog import samples_for
from app.connectors.types import ConnectorCapability, ConnectorCategory, ConnectorTestResult, SyncPage


class _MockConnector(BaseConnector):
    """Generic mock connector with category-specific sample data."""

    def __init__(self, connector_type: str, category: ConnectorCategory,
                 display_name: str, samples: list[dict[str, Any]] | None = None, **kwargs) -> None:
        super().__init__(**kwargs)
        self.connector_type = connector_type
        self.category = category
        self.display_name = display_name
        self._samples = samples if samples is not None else samples_for(connector_type)

    @property
    def capabilities(self) -> ConnectorCapability:
        cap = ConnectorCapability()
        cap.supports_sync = True
        cap.supports_pagination = True
        cap.supports_dry_run = True
        has_findings = any(s.get("kind") == "finding" for s in self._samples)
        has_assets = any(s.get("kind") != "finding" for s in self._samples)
        if has_assets:
            cap.asset_types = list({s.get("classification", "asset") for s in self._samples if s.get("kind") != "finding"})
        if has_findings:
            cap.finding_types = list({s.get("classification", "finding") for s in self._samples if s.get("kind") == "finding"})
        return cap

    def validate_config(self) -> tuple[bool, list[str]]:
        errors: list[str] = []
        if not self.mock_mode and not self.dry_run:
            base_url = self.config.get("base_url") or self.config.get("tenant_id")
            if not base_url and self.connector_type not in ("aws", "gcp", "kubernetes", "prometheus", "grafana"):
                errors.append("base_url or tenant_id required for live mode")
            if not self.config.get("credential_ref") and not self.mock_mode:
                errors.append("credential_ref required (env var or vault path — never store secrets in config)")
        return len(errors) == 0, errors

    def _test_connection_live(self) -> ConnectorTestResult:
        ok, errs = self.validate_config()
        if not ok:
            return ConnectorTestResult(ok=False, message="; ".join(errs))
        return ConnectorTestResult(ok=False, message="Configure credentials for live mode.")

    def fetch_page(self, cursor: str | None = None) -> SyncPage:
        start = int(cursor or "0")
        page_size = 10
        chunk = self._samples[start:start + page_size]
        nxt = str(start + page_size) if start + page_size < len(self._samples) else None
        return SyncPage(items=chunk, next_cursor=nxt, total=len(self._samples))


# --- ALM ---
def jira_connector(**kw) -> BaseConnector:
    return _MockConnector("jira", ConnectorCategory.ALM, "Jira", **kw)

def confluence_connector(**kw) -> BaseConnector:
    return _MockConnector("confluence", ConnectorCategory.ALM, "Confluence", **kw)

def github_enterprise_connector(**kw) -> BaseConnector:
    return _MockConnector("github_enterprise", ConnectorCategory.ALM, "GitHub Enterprise", **kw)

def gitlab_connector(**kw) -> BaseConnector:
    return _MockConnector("gitlab", ConnectorCategory.ALM, "GitLab", **kw)

def azure_devops_connector(**kw) -> BaseConnector:
    return _MockConnector("azure_devops", ConnectorCategory.ALM, "Azure DevOps", **kw)

def jenkins_connector(**kw) -> BaseConnector:
    return _MockConnector("jenkins", ConnectorCategory.ALM, "Jenkins", **kw)


# --- Collaboration (Microsoft Graph + Slack) ---
def sharepoint_connector(**kw) -> BaseConnector:
    return _MockConnector("sharepoint", ConnectorCategory.COLLABORATION, "SharePoint", **kw)

def teams_connector(**kw) -> BaseConnector:
    return _MockConnector("teams", ConnectorCategory.COLLABORATION, "Microsoft Teams", **kw)

def outlook_connector(**kw) -> BaseConnector:
    return _MockConnector("outlook", ConnectorCategory.COLLABORATION, "Outlook", **kw)

def onedrive_connector(**kw) -> BaseConnector:
    return _MockConnector("onedrive", ConnectorCategory.COLLABORATION, "OneDrive", **kw)

def slack_connector(**kw) -> BaseConnector:
    return _MockConnector("slack", ConnectorCategory.COLLABORATION, "Slack", **kw)


# --- Security scanners ---
def sonarqube_connector(**kw) -> BaseConnector:
    return _MockConnector("sonarqube", ConnectorCategory.SECURITY, "SonarQube", **kw)

def checkmarx_connector(**kw) -> BaseConnector:
    return _MockConnector("checkmarx", ConnectorCategory.SECURITY, "Checkmarx", **kw)

def prisma_cloud_connector(**kw) -> BaseConnector:
    return _MockConnector("prisma_cloud", ConnectorCategory.SECURITY, "Prisma Cloud", **kw)

def snyk_connector(**kw) -> BaseConnector:
    return _MockConnector("snyk", ConnectorCategory.SECURITY, "Snyk", **kw)

def veracode_connector(**kw) -> BaseConnector:
    return _MockConnector("veracode", ConnectorCategory.SECURITY, "Veracode", **kw)

def trivy_connector(**kw) -> BaseConnector:
    return _MockConnector("trivy", ConnectorCategory.SECURITY, "Trivy", **kw)

def dependency_track_connector(**kw) -> BaseConnector:
    return _MockConnector("dependency_track", ConnectorCategory.SECURITY, "Dependency-Track", **kw)


# --- Cloud / ops ---
def aws_connector(**kw) -> BaseConnector:
    return _MockConnector("aws", ConnectorCategory.CLOUD, "AWS", **kw)

def azure_connector(**kw) -> BaseConnector:
    return _MockConnector("azure", ConnectorCategory.CLOUD, "Azure", **kw)

def gcp_connector(**kw) -> BaseConnector:
    return _MockConnector("gcp", ConnectorCategory.CLOUD, "GCP", **kw)

def kubernetes_connector(**kw) -> BaseConnector:
    return _MockConnector("kubernetes", ConnectorCategory.CLOUD, "Kubernetes", **kw)

def argocd_connector(**kw) -> BaseConnector:
    return _MockConnector("argocd", ConnectorCategory.CLOUD, "ArgoCD", **kw)

def prometheus_connector(**kw) -> BaseConnector:
    return _MockConnector("prometheus", ConnectorCategory.CLOUD, "Prometheus", **kw)

def grafana_connector(**kw) -> BaseConnector:
    return _MockConnector("grafana", ConnectorCategory.CLOUD, "Grafana", **kw)


DRIVER_FACTORIES: dict[str, Any] = {
    "jira": jira_connector, "confluence": confluence_connector,
    "github_enterprise": github_enterprise_connector, "gitlab": gitlab_connector,
    "azure_devops": azure_devops_connector, "jenkins": jenkins_connector,
    "sharepoint": sharepoint_connector, "teams": teams_connector,
    "outlook": outlook_connector, "onedrive": onedrive_connector, "slack": slack_connector,
    "sonarqube": sonarqube_connector, "checkmarx": checkmarx_connector,
    "prisma_cloud": prisma_cloud_connector, "snyk": snyk_connector,
    "veracode": veracode_connector, "trivy": trivy_connector,
    "dependency_track": dependency_track_connector,
    "aws": aws_connector, "azure": azure_connector, "gcp": gcp_connector,
    "kubernetes": kubernetes_connector, "argocd": argocd_connector,
    "prometheus": prometheus_connector, "grafana": grafana_connector,
}
