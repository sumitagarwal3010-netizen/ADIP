/**
 * Deterministic demo data for Enterprise Evidence Hub (ADIP consumption layer).
 * ECS remains a separate external evidence provider — not embedded ADIP logic.
 */

export const EVIDENCE_HUB_ANCHOR_DATE = '11 Jul 2026';
export const EVIDENCE_HUB_LAST_SYNC = '11 Jul 2026, 19:02';

export type EvidenceProviderMode = 'Direct ADIP Connector' | 'ECS Reusable Pack' | 'ECS + Direct Connector';

export interface EvidenceCountItem {
  label: string;
  count: number;
}

export interface EvidenceSourceDetail {
  id: string;
  name: string;
  providerMode: EvidenceProviderMode;
  status: 'Connected' | 'Collected';
  reuseStatus: 'Reusable' | 'Validated' | 'Pending mapping';
  lastCollected: string;
  collectionMethod: string;
  consumerWorkflows: string[];
  artifactTypes: string[];
  counts: EvidenceCountItem[];
  totalRecords: number;
}

export interface EcsEvidenceProvider {
  provider: string;
  providerType: string;
  mode: string;
  status: string;
  authentication: string;
  evidencePacksAvailable: number;
  lastSync: string;
  reuseScope: string[];
  sourceOwnership: string;
  consumer: string;
  description: string;
}

export const ECS_EVIDENCE_PROVIDER: EcsEvidenceProvider = {
  provider: 'ECS',
  providerType: 'Enterprise Evidence Service',
  mode: 'Deterministic Demo Adapter',
  status: 'Connected',
  authentication: 'Mock / Demo',
  evidencePacksAvailable: 12,
  lastSync: EVIDENCE_HUB_LAST_SYNC,
  reuseScope: ['Audit', 'Compliance', 'Architecture', 'Release'],
  sourceOwnership: 'ECS',
  consumer: 'ADIP Enterprise Evidence Hub',
  description:
    'ECS collects, validates, stores, versions and governs enterprise evidence. ADIP consumes reusable packs through this demo adapter — ECS is separately deployable.',
};

export const EVIDENCE_SOURCES: EvidenceSourceDetail[] = [
  {
    id: 'SRC-JIRA',
    name: 'Jira',
    providerMode: 'Direct ADIP Connector',
    status: 'Connected',
    reuseStatus: 'Reusable',
    lastCollected: EVIDENCE_HUB_LAST_SYNC,
    collectionMethod: 'Direct ADIP connector (demo)',
    consumerWorkflows: ['Requirements Engineering', 'Sprint Planning', 'Release Readiness'],
    artifactTypes: ['User stories', 'Epics', 'Defects', 'CAB references', 'Release tickets'],
    counts: [
      { label: 'User stories', count: 14 },
      { label: 'Epics', count: 8 },
      { label: 'Defect records', count: 6 },
      { label: 'CAB references', count: 4 },
      { label: 'Release tickets', count: 2 },
    ],
    totalRecords: 34,
  },
  {
    id: 'SRC-CONFLUENCE',
    name: 'Confluence',
    providerMode: 'Direct ADIP Connector',
    status: 'Connected',
    reuseStatus: 'Validated',
    lastCollected: EVIDENCE_HUB_LAST_SYNC,
    collectionMethod: 'Direct ADIP connector (demo)',
    consumerWorkflows: ['Design & Architecture', 'Architecture Assurance'],
    artifactTypes: ['HLD', 'LLD', 'ADRs', 'Design decisions', 'Owner approvals'],
    counts: [
      { label: 'HLD documents', count: 3 },
      { label: 'LLD documents', count: 4 },
      { label: 'Architecture decision records', count: 6 },
      { label: 'Design decisions', count: 5 },
      { label: 'Owner approvals', count: 3 },
    ],
    totalRecords: 21,
  },
  {
    id: 'SRC-GITHUB',
    name: 'GitHub',
    providerMode: 'Direct ADIP Connector',
    status: 'Connected',
    reuseStatus: 'Reusable',
    lastCollected: EVIDENCE_HUB_LAST_SYNC,
    collectionMethod: 'Direct ADIP connector (demo)',
    consumerWorkflows: ['Development', 'Release Readiness', 'AI Oversight'],
    artifactTypes: ['Pull requests', 'Commits', 'Peer reviews', 'Release tags', 'Branch protection', 'Security scans'],
    counts: [
      { label: 'Pull requests', count: 13 },
      { label: 'Commits', count: 83 },
      { label: 'Peer-review approvals', count: 11 },
      { label: 'Release tags', count: 4 },
      { label: 'Branch-protection records', count: 3 },
      { label: 'Security-scan summaries', count: 2 },
    ],
    totalRecords: 116,
  },
  {
    id: 'SRC-SERVICENOW',
    name: 'ServiceNow',
    providerMode: 'ECS Reusable Pack',
    status: 'Connected',
    reuseStatus: 'Reusable',
    lastCollected: EVIDENCE_HUB_LAST_SYNC,
    collectionMethod: 'Imported ECS evidence pack (demo)',
    consumerWorkflows: ['Release Readiness', 'Compliance Automation', 'Generate Audit Pack'],
    artifactTypes: ['Change requests', 'CAB approvals', 'Incidents', 'Problem records', 'Risk acceptances'],
    counts: [
      { label: 'Change requests', count: 6 },
      { label: 'CAB approvals', count: 4 },
      { label: 'Incidents', count: 3 },
      { label: 'Problem records', count: 2 },
      { label: 'Risk-acceptance records', count: 2 },
    ],
    totalRecords: 17,
  },
  {
    id: 'SRC-CICD',
    name: 'CI/CD Logs',
    providerMode: 'Direct ADIP Connector',
    status: 'Connected',
    reuseStatus: 'Validated',
    lastCollected: EVIDENCE_HUB_LAST_SYNC,
    collectionMethod: 'Direct ADIP connector (demo)',
    consumerWorkflows: ['Release Readiness', 'Development'],
    artifactTypes: ['Pipeline runs', 'Deployment logs', 'Build manifests', 'Checksums', 'Rollback packages'],
    counts: [
      { label: 'Successful pipelines', count: 4 },
      { label: 'Failed pipelines', count: 1 },
      { label: 'Deployment logs', count: 5 },
      { label: 'Build manifests', count: 4 },
      { label: 'Artifact checksums', count: 4 },
      { label: 'Rollback packages', count: 2 },
    ],
    totalRecords: 20,
  },
  {
    id: 'SRC-CONTROL',
    name: 'Control Register',
    providerMode: 'ECS + Direct Connector',
    status: 'Connected',
    reuseStatus: 'Validated',
    lastCollected: EVIDENCE_HUB_LAST_SYNC,
    collectionMethod: 'ECS reusable pack + ADIP control mapping (demo)',
    consumerWorkflows: ['Compliance Automation', 'RBI Compliance Pack', 'Generate Audit Pack'],
    artifactTypes: ['Mapped controls', 'Implementations', 'Exceptions', 'Owner attestations'],
    counts: [
      { label: 'Mapped controls', count: 42 },
      { label: 'Implemented controls', count: 36 },
      { label: 'Partially implemented controls', count: 4 },
      { label: 'Pending controls', count: 2 },
      { label: 'Missing owner attestations', count: 5 },
      { label: 'Approved exceptions', count: 3 },
    ],
    totalRecords: 92,
  },
];

export interface EvidenceCollectionSummary {
  title: string;
  sourcesProcessed: number;
  recordsCollected: number;
  reusableRecords: number;
  newRecords: number;
  controlsMapped: number;
  missingOwnerAttestations: number;
  validationScore: number;
  directConnectorRecords: number;
  ecsReusableRecords: number;
  collectedAt: string;
}

export const EVIDENCE_COLLECTION_SUMMARY: EvidenceCollectionSummary = {
  title: 'Evidence Collection Completed',
  sourcesProcessed: 7,
  recordsCollected: 126,
  reusableRecords: 94,
  newRecords: 32,
  controlsMapped: 42,
  missingOwnerAttestations: 5,
  validationScore: 91,
  directConnectorRecords: 58,
  ecsReusableRecords: 68,
  collectedAt: EVIDENCE_HUB_LAST_SYNC,
};

export function sourcesAfterCollection(): EvidenceSourceDetail[] {
  return EVIDENCE_SOURCES.map((s) => ({ ...s, status: 'Collected' as const }));
}

export function buildEvidencePackageBody(summary: EvidenceCollectionSummary): string {
  return `Enterprise Evidence Package
Stage: Approval / Publish
Quality score: ${summary.validationScore}%
Total records: ${summary.recordsCollected}
Mapped controls: ${summary.controlsMapped}
Reusable records: ${summary.reusableRecords}
Missing attestations: ${summary.missingOwnerAttestations}

1. Package Overview
Business scope: UPI Release 24.6 · Mobile Banking biometric login · RBI compliance cycle Q3 FY27
Collection provider mix: Direct ADIP connectors + ECS reusable evidence packs
Consumed by: ADIP Enterprise Evidence Hub

2. Evidence Source Summary
Sources processed: ${summary.sourcesProcessed}
Direct ADIP connectors: ${summary.directConnectorRecords} records
ECS reusable evidence packs: ${summary.ecsReusableRecords} records

3. Directly Collected Evidence
- Jira: 14 stories, 8 epics, 6 defects (Direct ADIP Connector)
- Confluence: 3 HLD, 4 LLD, 6 ADRs (Direct ADIP Connector)
- GitHub: 83 commits, 13 pull requests, 11 peer reviews (Direct ADIP Connector)
- CI/CD: 4 successful pipelines, 5 deployment logs (Direct ADIP Connector)

4. ECS-Reused Evidence
- ServiceNow change evidence: 6 records (Imported ECS evidence pack)
- Security controls: 18 records (ECS reusable pack)
- Audit-ready approvals: 9 records (ECS reusable pack)
- Historical baseline evidence: 35 records (ECS reusable pack)

5. Control Mapping
- 42 controls mapped to release and compliance workflows
- 36 implemented · 4 partial · 2 pending

6. Traceability
- Requirements ↔ design ↔ commits ↔ change tickets linked for UPI Release 24.6
- ECS pack lineage retained with source ownership marked as ECS

7. Missing Evidence
- 5 missing owner attestations on privileged-access controls
- 1 stale DR drill sign-off pending upload

8. Owner Attestations
- Product Owner: Mobile Banking — attested
- CISO Office: conditional pending 2 control closures
- Release Manager: attested for CAB pack

9. Validation Results
- Evidence freshness: 91%
- Traceability completeness: 94%
- Control linkage: 96%
- Demo mode: deterministic validation only (no live enterprise APIs called)

10. Approval and Publication Status
- Validation score: ${summary.validationScore}%
- Stage: Approval / Publish
- Audit Lead: Pending review
- Compliance Officer: Approved for demo publication`;
}
