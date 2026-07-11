# Cost Optimization Report

Total monthly savings: $15.32

- **reserved_instances**: $10.08/mo — Commit 1-year GKE/Compute reserved capacity for baseline nodes.
- **autoscaling**: $4.32/mo — Enable HPA on backend; scale to zero for benchmark workers off-peak.
- **storage_lifecycle**: $0.01/mo — Move aged artifacts to Nearline after 30d, Coldline after 90d.
- **compression**: $0.08/mo — Enable gzip compression on CSV/JSON exports and log archives.
- **caching**: $0.75/mo — Expand prompt and connector metadata cache TTL during steady state.
- **object_deduplication**: $0.01/mo — Content-hash dedup for version history and retention copies.
- **cold_storage**: $0.07/mo — Archive 4.3 GB to Coldline tier.