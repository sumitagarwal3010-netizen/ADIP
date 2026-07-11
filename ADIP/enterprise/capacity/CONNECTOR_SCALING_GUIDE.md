# Connector Scaling Guide

Estimates per-connector throughput and worker requirements.

## Connectors

SharePoint, Teams, Outlook, OneDrive, Jira, Confluence, Azure DevOps, GitHub, GitLab, SonarQube, Prisma, ServiceNow.

## Outputs

API rate limits, throughput/hour, parallel workers, queue depth, retry window, daily sync duration, peak sync window.

## Module

`enterprise_planners.py` — `estimate_connector_scaling()`
