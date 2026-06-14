/**
 * Traceability engine — pure graph computations over the traceability model.
 * No backend; everything derives deterministically from TRACE_NODES/TRACE_LINKS.
 */
import {
  TRACE_LINKS,
  TRACE_NODES,
  TRACE_STAGE_ORDER,
  TRACE_THREADS,
  TRACE_TYPE_LABEL,
  type TraceNode,
  type TraceNodeType,
} from './traceabilityModel';

const nodeById = new Map<string, TraceNode>(TRACE_NODES.map((n) => [n.id, n]));
const outgoing = new Map<string, { id: string; rel?: string }[]>();
const incoming = new Map<string, { id: string; rel?: string }[]>();

for (const link of TRACE_LINKS) {
  if (!outgoing.has(link.from)) outgoing.set(link.from, []);
  if (!incoming.has(link.to)) incoming.set(link.to, []);
  outgoing.get(link.from)!.push({ id: link.to, rel: link.rel });
  incoming.get(link.to)!.push({ id: link.from, rel: link.rel });
}

export function getNode(id: string): TraceNode | undefined {
  return nodeById.get(id);
}

export function getAllNodes(): TraceNode[] {
  return TRACE_NODES;
}

export function downstreamOf(id: string): string[] {
  return (outgoing.get(id) ?? []).map((e) => e.id);
}

export function upstreamOf(id: string): string[] {
  return (incoming.get(id) ?? []).map((e) => e.id);
}

/** BFS in one direction; returns affected node ids (excluding the seed). */
function traverse(id: string, dir: 'down' | 'up'): string[] {
  const map = dir === 'down' ? outgoing : incoming;
  const seen = new Set<string>();
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of map.get(current) ?? []) {
      if (!seen.has(edge.id)) {
        seen.add(edge.id);
        queue.push(edge.id);
      }
    }
  }
  seen.delete(id);
  return [...seen];
}

export interface ImpactResult {
  node: TraceNode;
  upstream: TraceNode[];
  downstream: TraceNode[];
  affectedReleases: TraceNode[];
  affectedModels: TraceNode[];
  affectedControls: TraceNode[];
  affectedIncidents: TraceNode[];
  affectedCompliance: TraceNode[];
}

export function analyzeImpact(id: string): ImpactResult | null {
  const node = nodeById.get(id);
  if (!node) return null;
  const upIds = traverse(id, 'up');
  const downIds = traverse(id, 'down');
  const related = [...new Set([...upIds, ...downIds])].map((x) => nodeById.get(x)!).filter(Boolean);
  const byType = (t: TraceNodeType) => related.filter((n) => n.type === t);

  return {
    node,
    upstream: upIds.map((x) => nodeById.get(x)!).filter(Boolean),
    downstream: downIds.map((x) => nodeById.get(x)!).filter(Boolean),
    affectedReleases: byType('release'),
    affectedModels: byType('model'),
    affectedControls: byType('control'),
    affectedIncidents: byType('incident'),
    affectedCompliance: byType('compliance'),
  };
}

/* ------------------------------------------------------------------ */
/* Lineage (per business-requirement thread)                         */
/* ------------------------------------------------------------------ */

export interface LineageStage {
  type: TraceNodeType;
  label: string;
  nodes: TraceNode[];
}

/** All nodes reachable downstream from a root BR, grouped by SDLC stage. */
export function lineageForThread(rootId: string): LineageStage[] {
  const reachable = new Set<string>([rootId, ...traverse(rootId, 'down')]);
  return TRACE_STAGE_ORDER.map((type) => ({
    type,
    label: TRACE_TYPE_LABEL[type],
    nodes: [...reachable].map((id) => nodeById.get(id)!).filter((n) => n && n.type === type),
  })).filter((stage) => stage.nodes.length > 0);
}

/* ------------------------------------------------------------------ */
/* Requirement Traceability Matrix                                   */
/* ------------------------------------------------------------------ */

export interface RtmRow {
  businessRequirement: TraceNode;
  functionalRequirement?: TraceNode;
  userStory?: TraceNode;
  architecture?: TraceNode;
  api?: TraceNode;
  testCase?: TraceNode;
  release?: TraceNode;
  evidence?: TraceNode;
  /** Fraction 0..1 of the 8 RTM columns that are linked. */
  coverage: number;
  /** Stages that are missing a linked artifact. */
  missing: string[];
}

const RTM_COLUMNS: { key: keyof Omit<RtmRow, 'coverage' | 'missing'>; type: TraceNodeType }[] = [
  { key: 'businessRequirement', type: 'businessRequirement' },
  { key: 'functionalRequirement', type: 'functionalRequirement' },
  { key: 'userStory', type: 'userStory' },
  { key: 'architecture', type: 'architecture' },
  { key: 'api', type: 'api' },
  { key: 'testCase', type: 'testCase' },
  { key: 'release', type: 'release' },
  { key: 'evidence', type: 'evidence' },
];

/** First reachable downstream node of a given type from seed. */
function firstDownstreamOfType(rootId: string, type: TraceNodeType): TraceNode | undefined {
  const reachable = new Set<string>([rootId, ...traverse(rootId, 'down')]);
  for (const id of reachable) {
    const n = nodeById.get(id);
    if (n && n.type === type) return n;
  }
  return undefined;
}

export function buildRtm(): RtmRow[] {
  const brs = TRACE_NODES.filter((n) => n.type === 'businessRequirement');
  return brs.map((br) => {
    const row: Partial<RtmRow> = { businessRequirement: br };
    const missing: string[] = [];
    let present = 0;
    for (const col of RTM_COLUMNS) {
      const found = col.type === 'businessRequirement' ? br : firstDownstreamOfType(br.id, col.type);
      if (found) {
        (row as Record<string, TraceNode>)[col.key] = found;
        present += 1;
      } else {
        missing.push(TRACE_TYPE_LABEL[col.type]);
      }
    }
    return { ...(row as RtmRow), coverage: present / RTM_COLUMNS.length, missing };
  });
}

/* ------------------------------------------------------------------ */
/* AI traceability chains                                             */
/* ------------------------------------------------------------------ */

export interface AiChainRow {
  useCase: TraceNode;
  prompt?: TraceNode;
  model?: TraceNode;
  risk?: TraceNode;
  control?: TraceNode;
  incident?: TraceNode;
  evidence?: TraceNode;
  compliance?: TraceNode;
}

export function buildAiChains(): AiChainRow[] {
  const useCases = TRACE_NODES.filter((n) => n.type === 'aiUseCase');
  return useCases.map((uc) => {
    const reachable = new Set<string>([uc.id, ...traverse(uc.id, 'down')]);
    // Incident is upstream of risk in our model (production -> incident -> risk),
    // so also pull incidents linked via shared production/model context (upstream).
    const upstream = new Set<string>(traverse(uc.id, 'up'));
    const all = new Set<string>([...reachable, ...upstream]);
    const pick = (type: TraceNodeType) => {
      for (const id of reachable) { const n = nodeById.get(id); if (n?.type === type) return n; }
      for (const id of all) { const n = nodeById.get(id); if (n?.type === type) return n; }
      return undefined;
    };
    return {
      useCase: uc,
      prompt: pick('prompt'),
      model: pick('model'),
      risk: pick('risk'),
      control: pick('control'),
      incident: pick('incident'),
      evidence: pick('evidence'),
      compliance: pick('compliance'),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Coverage / executive metrics                                      */
/* ------------------------------------------------------------------ */

export interface MissingLink {
  fromId: string;
  fromName: string;
  fromType: string;
  expected: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface CoverageSummary {
  overallCoverage: number;
  rtmCoverage: number;
  threadsFullyTraced: number;
  totalThreads: number;
  auditReadiness: number;
  complianceReadiness: number;
  missingLinks: MissingLink[];
  stageCoverage: { type: TraceNodeType; label: string; linkedPct: number; count: number }[];
}

/** Rules for what each node type is expected to link to downstream. */
const EXPECTED_DOWNSTREAM: Partial<Record<TraceNodeType, { type: TraceNodeType; severity: MissingLink['severity'] }>> = {
  businessRequirement: { type: 'functionalRequirement', severity: 'high' },
  functionalRequirement: { type: 'userStory', severity: 'medium' },
  userStory: { type: 'architecture', severity: 'medium' },
  architecture: { type: 'api', severity: 'medium' },
  api: { type: 'testCase', severity: 'high' },
  testCase: { type: 'release', severity: 'high' },
  release: { type: 'production', severity: 'critical' },
  model: { type: 'risk', severity: 'high' },
  risk: { type: 'control', severity: 'critical' },
  control: { type: 'evidence', severity: 'high' },
  evidence: { type: 'compliance', severity: 'critical' },
};

export function computeCoverage(): CoverageSummary {
  const rtm = buildRtm();
  const rtmCoverage = rtm.reduce((acc, r) => acc + r.coverage, 0) / Math.max(1, rtm.length);

  // Missing links: any node whose expected downstream type isn't reachable downstream.
  const missingLinks: MissingLink[] = [];
  for (const node of TRACE_NODES) {
    const rule = EXPECTED_DOWNSTREAM[node.type];
    if (!rule) continue;
    const reachable = new Set<string>(traverse(node.id, 'down'));
    const hasType = [...reachable].some((id) => getNode(id)?.type === rule.type);
    if (!hasType) {
      missingLinks.push({
        fromId: node.id,
        fromName: node.name,
        fromType: TRACE_TYPE_LABEL[node.type],
        expected: TRACE_TYPE_LABEL[rule.type],
        severity: rule.severity,
      });
    }
  }

  // Stage coverage: % of nodes of each type that participate in at least one link.
  const stageCoverage = TRACE_STAGE_ORDER.map((type) => {
    const nodes = TRACE_NODES.filter((n) => n.type === type);
    if (nodes.length === 0) return null;
    const linked = nodes.filter((n) => upstreamOf(n.id).length > 0 || downstreamOf(n.id).length > 0);
    return { type, label: TRACE_TYPE_LABEL[type], linkedPct: linked.length / nodes.length, count: nodes.length };
  }).filter(Boolean) as CoverageSummary['stageCoverage'];

  // Thread completeness: a thread is "fully traced" if its RTM row has all 8 columns.
  const threadsFullyTraced = rtm.filter((r) => r.coverage === 1).length;

  // Audit readiness: weighted by evidence + control coverage and missing critical links.
  const controls = TRACE_NODES.filter((n) => n.type === 'control');
  const evidence = TRACE_NODES.filter((n) => n.type === 'evidence');
  const approvedEvidence = evidence.filter((e) => e.status === 'Approved').length;
  const criticalMissing = missingLinks.filter((m) => m.severity === 'critical').length;
  const auditReadiness = Math.round(
    clamp(
      (approvedEvidence / Math.max(1, evidence.length)) * 60 +
        (controls.filter((c) => c.status === 'Approved').length / Math.max(1, controls.length)) * 40 -
        criticalMissing * 4,
      0,
      100,
    ),
  );

  // Compliance readiness: % of compliance nodes marked Compliant, penalized by gaps.
  const compliance = TRACE_NODES.filter((n) => n.type === 'compliance');
  const compliant = compliance.filter((c) => c.status === 'Compliant').length;
  const complianceReadiness = Math.round(
    clamp((compliant / Math.max(1, compliance.length)) * 100 - criticalMissing * 2, 0, 100),
  );

  const overallCoverage = Math.round(
    clamp(rtmCoverage * 100 - missingLinks.length * 1.5, 0, 100),
  );

  return {
    overallCoverage,
    rtmCoverage: Math.round(rtmCoverage * 100),
    threadsFullyTraced,
    totalThreads: TRACE_THREADS.length,
    auditReadiness,
    complianceReadiness,
    missingLinks,
    stageCoverage,
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ------------------------------------------------------------------ */
/* Search helper for the impact selector                             */
/* ------------------------------------------------------------------ */

export function searchNodes(query: string): TraceNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return TRACE_NODES;
  return TRACE_NODES.filter(
    (n) => n.id.toLowerCase().includes(q) || n.name.toLowerCase().includes(q) || TRACE_TYPE_LABEL[n.type].toLowerCase().includes(q),
  );
}
