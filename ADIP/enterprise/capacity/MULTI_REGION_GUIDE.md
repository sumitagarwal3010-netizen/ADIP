# Multi-Region Guide

Estimates capacity and cost for regional deployment topologies.

## Topologies

single_region, multi_zone, active_passive, active_active, cross_region, geo_dr

## Outputs

Cloud SQL replicas, object storage replication, Redis replication, cross-region egress, latency, cost multiplier.

## API

`POST /plan/enterprise` with `region_topology` parameter.

## Module

`enterprise_planners.py` — `estimate_multi_region()`
