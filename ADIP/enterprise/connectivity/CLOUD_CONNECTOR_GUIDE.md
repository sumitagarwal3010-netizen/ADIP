# Cloud Connector Guide

Cloud connectors provide inventory, deployment status, and observability summaries for ADIP operations views.

## Supported platforms

AWS, Azure, GCP, Kubernetes, ArgoCD, Prometheus, Grafana.

## Capabilities (foundation)

- Account/subscription/project metadata
- Workload inventory (mock or API-backed)
- Deployment/sync status (ArgoCD)
- Metrics summary placeholders (Prometheus/Grafana)
- Cost placeholder fields for future FinOps integration

## Configuration example (Kubernetes)

```json
{
  "cluster_name": "prod-us-east",
  "credential_ref": "KUBECONFIG_SECRET_PATH",
  "mock_mode": true,
  "namespace_filter": ["adip", "platform"]
}
```

## Credential patterns

| Platform | Reference style |
|----------|-----------------|
| AWS | `AWS_ROLE_ARN` + IRSA in K8s |
| Azure | `AZURE_CLIENT_SECRET_VAULT_PATH` |
| GCP | `GCP_SERVICE_ACCOUNT_JSON_PATH` |
| K8s | In-cluster SA or kubeconfig secret |

## Testing

All cloud connectors run in mock mode during `pytest` — no cloud credentials required.
