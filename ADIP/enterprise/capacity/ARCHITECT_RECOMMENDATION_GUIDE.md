# Architect Recommendation Guide

Automated infrastructure recommendations for architects.

## Finding categories

Under-sized, over-sized, CPU/RAM/storage/network/connector/LLM bottlenecks.

## Recommendations

Best GKE profile, storage tier, HA topology, DR topology.

## Overall status

healthy | review_recommended | action_required

## API

`POST /plan/enterprise` → `enterprise.architect_recommendations`

## Workbench

Enterprise Capacity → Recommendations tab.

## Module

`backend/app/perf/capacity/recommendations.py`
