"""Connector driver implementations — mock-first, production-extensible."""
from __future__ import annotations

from typing import Any

from app.connectors.base import BaseConnector
from app.connectors.types import ConnectorCapability, ConnectorCategory, ConnectorTestResult, SyncPage


def _items(kind: str, connector: str, labels: list[str]) -> list[dict[str, Any]]:
    return [
        {
            "kind": kind,
            "external_id": f"{connector}-{i}",
            "title": label,
            "connector_type": connector,
            "severity": "medium" if kind == "finding" else None,
            "project_id": 1,
        }
        for i, label in enumerate(labels, 1)
    ]


class _MockConnector(BaseConnector):
    """Generic mock connector with category-specific sample data."""

    def __init__(self, connector_type: str, category: ConnectorCategory,
                 display_name: str, samples: list[dict[str, Any]], **kwargs) -> None:
        super().__init__(**kwargs)
        self.connector_type = connector_type
        self.category = category
        self.display_name = display_name
        self._samples = samples

    def _test_connection_live(self) -> ConnectorTestResult:
        return ConnectorTestResult(ok=False, message="Configure credentials for live mode.")

    def fetch_page(self, cursor: str | None = None) -> SyncPage:
        start = int(cursor or "0")
        page_size = 10
        chunk = self._samples[start:start + page_size]
        nxt = str(start + page_size) if start + page_size < len(self._samples) else None
        return SyncPage(items=chunk, next_cursor=nxt, total=len(self._samples))


# --- ALM ---
def jira_connector(**kw) -> BaseConnector:
    return _MockConnector("jira", ConnectorCategory.ALM, "Jira",
        _items("asset", "jira", ["ADIP", "Payments Modernization"]) +
        _items("finding", "jira", ["UPI-101: Settlement gap", "UPI-204: NPCI timeout"]), **kw)

def confluence_connector(**kw) -> BaseConnector:
    return _MockConnector("confluence", ConnectorCategory.ALM, "Confluence",
        _items("asset", "confluence", ["Architecture Playbook", "Release Runbook"]), **kw)

def github_enterprise_connector(**kw) -> BaseConnector:
    return _MockConnector("github_enterprise", ConnectorCategory.ALM, "GitHub Enterprise",
        _items("asset", "github_enterprise", ["adip-platform", "payments-service"]) +
        _items("finding", "github_enterprise", ["PR #42: missing tests"]), **kw)

def gitlab_connector(**kw) -> BaseConnector:
    return _MockConnector("gitlab", ConnectorCategory.ALM, "GitLab",
        _items("asset", "gitlab", ["adip/backend", "adip/frontend"]), **kw)

def azure_devops_connector(**kw) -> BaseConnector:
    return _MockConnector("azure_devops", ConnectorCategory.ALM, "Azure DevOps",
        _items("asset", "azure_devops", ["ADIP Program", "Sprint 12"]), **kw)

def jenkins_connector(**kw) -> BaseConnector:
    return _MockConnector("jenkins", ConnectorCategory.ALM, "Jenkins",
        _items("asset", "jenkins", ["adip-ci", "adip-nightly"]) +
        _items("finding", "jenkins", ["Build #892 failed: integration tests"]), **kw)


# --- Collaboration (Microsoft Graph + Slack) ---
def sharepoint_connector(**kw) -> BaseConnector:
    return _MockConnector("sharepoint", ConnectorCategory.COLLABORATION, "SharePoint",
        _items("asset", "sharepoint", ["ADIP Governance Site", "Architecture Library"]), **kw)

def teams_connector(**kw) -> BaseConnector:
    return _MockConnector("teams", ConnectorCategory.COLLABORATION, "Microsoft Teams",
        _items("asset", "teams", ["#adip-delivery", "#architecture-review"]), **kw)

def outlook_connector(**kw) -> BaseConnector:
    return _MockConnector("outlook", ConnectorCategory.COLLABORATION, "Outlook",
        _items("asset", "outlook", ["Release Approvals", "Audit Evidence"]), **kw)

def onedrive_connector(**kw) -> BaseConnector:
    return _MockConnector("onedrive", ConnectorCategory.COLLABORATION, "OneDrive",
        _items("asset", "onedrive", ["/ADIP/Artifacts", "/ADIP/Evidence"]), **kw)

def slack_connector(**kw) -> BaseConnector:
    return _MockConnector("slack", ConnectorCategory.COLLABORATION, "Slack",
        _items("asset", "slack", ["#adip-alerts", "#sdlc-copilot"]), **kw)


# --- Security scanners ---
def sonarqube_connector(**kw) -> BaseConnector:
    return _MockConnector("sonarqube", ConnectorCategory.SECURITY, "SonarQube",
        _items("finding", "sonarqube", ["SQL injection risk in PaymentService", "Cognitive complexity breach"]), **kw)

def checkmarx_connector(**kw) -> BaseConnector:
    return _MockConnector("checkmarx", ConnectorCategory.SECURITY, "Checkmarx",
        _items("finding", "checkmarx", ["Hardcoded credential pattern", "XSS in portal"]), **kw)

def prisma_cloud_connector(**kw) -> BaseConnector:
    return _MockConnector("prisma_cloud", ConnectorCategory.SECURITY, "Prisma Cloud",
        _items("finding", "prisma_cloud", ["S3 bucket public ACL", "K8s privileged pod"]), **kw)

def snyk_connector(**kw) -> BaseConnector:
    return _MockConnector("snyk", ConnectorCategory.SECURITY, "Snyk",
        _items("finding", "snyk", ["CVE-2024-1234 in lodash", "License policy violation"]), **kw)

def veracode_connector(**kw) -> BaseConnector:
    return _MockConnector("veracode", ConnectorCategory.SECURITY, "Veracode",
        _items("finding", "veracode", ["Flaw ID 8821: insufficient input validation"]), **kw)

def trivy_connector(**kw) -> BaseConnector:
    return _MockConnector("trivy", ConnectorCategory.SECURITY, "Trivy",
        _items("finding", "trivy", ["OS package CVE in base image", "Secret in env file"]), **kw)

def dependency_track_connector(**kw) -> BaseConnector:
    return _MockConnector("dependency_track", ConnectorCategory.SECURITY, "Dependency-Track",
        _items("finding", "dependency_track", ["Critical component vulnerability", "Outdated spring-core"]), **kw)


# --- Cloud / ops ---
def aws_connector(**kw) -> BaseConnector:
    return _MockConnector("aws", ConnectorCategory.CLOUD, "AWS",
        _items("asset", "aws", ["account:123456789012", "eks:adip-prod"]), **kw)

def azure_connector(**kw) -> BaseConnector:
    return _MockConnector("azure", ConnectorCategory.CLOUD, "Azure",
        _items("asset", "azure", ["subscription:adip-prod", "aks:adip-cluster"]), **kw)

def gcp_connector(**kw) -> BaseConnector:
    return _MockConnector("gcp", ConnectorCategory.CLOUD, "GCP",
        _items("asset", "gcp", ["project:adip-banking", "gke:adip-primary"]), **kw)

def kubernetes_connector(**kw) -> BaseConnector:
    return _MockConnector("kubernetes", ConnectorCategory.CLOUD, "Kubernetes",
        _items("asset", "kubernetes", ["namespace:adip", "deployment:api"]), **kw)

def argocd_connector(**kw) -> BaseConnector:
    return _MockConnector("argocd", ConnectorCategory.CLOUD, "ArgoCD",
        _items("asset", "argocd", ["app:adip-backend", "app:adip-frontend"]), **kw)

def prometheus_connector(**kw) -> BaseConnector:
    return _MockConnector("prometheus", ConnectorCategory.CLOUD, "Prometheus",
        _items("asset", "prometheus", ["up{job=\"adip-api\"}", "http_request_duration"]), **kw)

def grafana_connector(**kw) -> BaseConnector:
    return _MockConnector("grafana", ConnectorCategory.CLOUD, "Grafana",
        _items("asset", "grafana", ["ADIP SLO Dashboard", "Connector Health"]), **kw)


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
