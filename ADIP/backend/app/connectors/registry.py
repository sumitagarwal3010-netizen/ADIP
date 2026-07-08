"""Enterprise connector registry and metadata catalog."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app.connectors.base import BaseConnector
from app.connectors.drivers import DRIVER_FACTORIES
from app.connectors.types import ConnectorCategory


@dataclass
class ConnectorDefinition:
    connector_type: str
    display_name: str
    category: ConnectorCategory
    description: str
    credential_ref_keys: list[str] = field(default_factory=list)
    config_schema: dict[str, str] = field(default_factory=dict)


CONNECTOR_CATALOG: list[ConnectorDefinition] = [
    ConnectorDefinition("jira", "Jira", ConnectorCategory.ALM, "Issues, projects, sprints",
                        ["JIRA_API_TOKEN_ENV"], {"base_url": "string", "project_key": "string"}),
    ConnectorDefinition("confluence", "Confluence", ConnectorCategory.ALM, "Spaces and pages",
                        ["CONFLUENCE_API_TOKEN_ENV"], {"base_url": "string"}),
    ConnectorDefinition("github_enterprise", "GitHub Enterprise", ConnectorCategory.ALM, "Repos, PRs, commits",
                        ["GITHUB_TOKEN_ENV"], {"base_url": "string", "org": "string"}),
    ConnectorDefinition("gitlab", "GitLab", ConnectorCategory.ALM, "Projects and pipelines",
                        ["GITLAB_TOKEN_ENV"], {"base_url": "string"}),
    ConnectorDefinition("azure_devops", "Azure DevOps", ConnectorCategory.ALM, "Projects and work items",
                        ["AZDO_PAT_ENV"], {"org_url": "string"}),
    ConnectorDefinition("jenkins", "Jenkins", ConnectorCategory.ALM, "Jobs and builds",
                        ["JENKINS_API_TOKEN_ENV"], {"base_url": "string"}),
    ConnectorDefinition("sharepoint", "SharePoint", ConnectorCategory.COLLABORATION, "Sites and documents",
                        ["GRAPH_CLIENT_SECRET_VAULT_PATH"], {"tenant_id": "string"}),
    ConnectorDefinition("teams", "Microsoft Teams", ConnectorCategory.COLLABORATION, "Channels and messages",
                        ["GRAPH_CLIENT_SECRET_VAULT_PATH"], {"tenant_id": "string"}),
    ConnectorDefinition("outlook", "Outlook", ConnectorCategory.COLLABORATION, "Mail folders",
                        ["GRAPH_CLIENT_SECRET_VAULT_PATH"], {"tenant_id": "string"}),
    ConnectorDefinition("onedrive", "OneDrive", ConnectorCategory.COLLABORATION, "Drives and files",
                        ["GRAPH_CLIENT_SECRET_VAULT_PATH"], {"tenant_id": "string"}),
    ConnectorDefinition("slack", "Slack", ConnectorCategory.COLLABORATION, "Channels and messages",
                        ["SLACK_BOT_TOKEN_ENV"], {"workspace": "string"}),
    ConnectorDefinition("sonarqube", "SonarQube", ConnectorCategory.SECURITY, "Code quality and vulnerabilities",
                        ["SONAR_TOKEN_ENV"], {"base_url": "string"}),
    ConnectorDefinition("checkmarx", "Checkmarx", ConnectorCategory.SECURITY, "SAST findings",
                        ["CHECKMARX_API_KEY_VAULT_PATH"], {"base_url": "string"}),
    ConnectorDefinition("prisma_cloud", "Prisma Cloud", ConnectorCategory.SECURITY, "Cloud security posture",
                        ["PRISMA_ACCESS_KEY_ENV"], {"console_url": "string"}),
    ConnectorDefinition("snyk", "Snyk", ConnectorCategory.SECURITY, "Dependency vulnerabilities",
                        ["SNYK_TOKEN_ENV"], {"org_id": "string"}),
    ConnectorDefinition("veracode", "Veracode", ConnectorCategory.SECURITY, "Application security findings",
                        ["VERACODE_API_KEY_VAULT_PATH"], {"app_id": "string"}),
    ConnectorDefinition("trivy", "Trivy", ConnectorCategory.SECURITY, "Container and IaC scanning",
                        ["TRIVY_REGISTRY_TOKEN_ENV"], {"registry": "string"}),
    ConnectorDefinition("dependency_track", "Dependency-Track", ConnectorCategory.SECURITY, "SBOM and components",
                        ["DTRACK_API_KEY_ENV"], {"base_url": "string"}),
    ConnectorDefinition("aws", "AWS", ConnectorCategory.CLOUD, "Accounts and workloads",
                        ["AWS_ROLE_ARN"], {"region": "string"}),
    ConnectorDefinition("azure", "Azure", ConnectorCategory.CLOUD, "Subscriptions and resources",
                        ["AZURE_CLIENT_SECRET_VAULT_PATH"], {"subscription_id": "string"}),
    ConnectorDefinition("gcp", "GCP", ConnectorCategory.CLOUD, "Projects and GKE",
                        ["GCP_SA_KEY_VAULT_PATH"], {"project_id": "string"}),
    ConnectorDefinition("kubernetes", "Kubernetes", ConnectorCategory.CLOUD, "Cluster inventory",
                        ["KUBECONFIG_SECRET_REF"], {"context": "string"}),
    ConnectorDefinition("argocd", "ArgoCD", ConnectorCategory.CLOUD, "GitOps deployments",
                        ["ARGOCD_TOKEN_ENV"], {"server_url": "string"}),
    ConnectorDefinition("prometheus", "Prometheus", ConnectorCategory.CLOUD, "Metrics and alerts",
                        ["PROMETHEUS_BEARER_TOKEN_ENV"], {"base_url": "string"}),
    ConnectorDefinition("grafana", "Grafana", ConnectorCategory.CLOUD, "Dashboards and SLOs",
                        ["GRAFANA_API_KEY_ENV"], {"base_url": "string"}),
]


class ConnectorRegistry:
    def __init__(self) -> None:
        self._catalog = {d.connector_type: d for d in CONNECTOR_CATALOG}

    def list_definitions(self) -> list[ConnectorDefinition]:
        return list(CONNECTOR_CATALOG)

    def get_definition(self, connector_type: str) -> ConnectorDefinition | None:
        return self._catalog.get(connector_type)

    def instantiate(
        self,
        connector_type: str,
        config: dict[str, Any] | None = None,
        *,
        mock_mode: bool = True,
        dry_run: bool = False,
    ) -> BaseConnector:
        factory = DRIVER_FACTORIES.get(connector_type)
        if factory is None:
            raise ValueError(f"Unknown connector type: {connector_type}")
        return factory(config=config, mock_mode=mock_mode, dry_run=dry_run)


connector_registry = ConnectorRegistry()
