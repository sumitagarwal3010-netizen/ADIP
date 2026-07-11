# Disaster Recovery Guide

Estimates RPO, RTO, backup, and recovery testing requirements.

## Outputs

RPO/RTO minutes, snapshot schedule, backup retention, cross-region backup flag, recovery test frequency, backup storage GB and cost.

## API

Included in `POST /plan/enterprise` → `enterprise.disaster_recovery`.

## Module

`enterprise_planners.py` — `estimate_disaster_recovery()`
