# High Availability Guide

Estimates HA requirements for ADIP production deployments.

## Targets

99%, 99.5%, 99.9%, 99.95%, 99.99%

## Outputs

Backend/frontend replicas, database HA mode, connector redundancy, LLM redundancy, max downtime minutes/month.

## API

`POST /plan/enterprise` with `ha_target` parameter.

## Module

`enterprise_planners.py` — `estimate_ha()`
