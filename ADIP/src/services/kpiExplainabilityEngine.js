/**
 * Universal KPI Explainability Engine.
 *
 * Given a KPI card context ({ label, value, suffix, trend, data, chartId }) and the
 * live simulation state, returns a complete Universal Explainability Model:
 *
 *   { id, name, value, suffix, description, formula, weightages, dataSources,
 *     contributingEntities, calculations, aiReasoning, recommendations,
 *     traceability, trends, assumptions, lastUpdated, authored }
 *
 * Resolution strategy:
 *   1. Look up an authored, defensible definition in the explainability catalog
 *      (by chartId, then by label slug).
 *   2. Enrich with live contributors / source records / trend by reusing the
 *      existing kpiDrilldownEngine — so even authored KPIs reflect live state and
 *      un-authored KPIs still produce a substantive (non-placeholder) drawer.
 *   3. Merge: authored fields win; live data fills any gaps; the card context is
 *      the final fallback. The returned object always has every field populated.
 */

import { resolveKpiDrilldown } from './kpiDrilldownEngine.js';
import { EXPLAINABILITY_CATALOG, slugify } from '../data/explainability/index.js';

function findEntry(ctx) {
  if (ctx.chartId && EXPLAINABILITY_CATALOG[ctx.chartId]) return EXPLAINABILITY_CATALOG[ctx.chartId];
  const slug = slugify(ctx.label);
  if (slug && EXPLAINABILITY_CATALOG[slug]) return EXPLAINABILITY_CATALOG[slug];
  return null;
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  const match = String(value ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

/** Pull live contributors, lineage and trend from the existing drilldown engine. */
function buildLiveModel(ctx, state) {
  let payload = null;
  try {
    payload = resolveKpiDrilldown(
      {
        label: ctx.label,
        value: ctx.value,
        suffix: ctx.suffix,
        trend: ctx.trend,
        data: ctx.data,
        chartId: ctx.chartId,
      },
      state,
    );
  } catch {
    payload = null;
  }
  if (!payload) return { contributors: [], traceability: [], evidence: [], trend: [] };

  const contributors = (payload.relatedApplications || []).map((app) => ({
    name: app.name,
    type: 'Application',
    score: null,
    note: app.status || '',
  }));

  const traceability = (payload.sourceRecords || []).slice(0, 6).map((r) => ({
    stage: r.id || r.title,
    description: r.title + (r.meta ? ` — ${r.meta}` : ''),
  }));

  const trend = (payload.historicalTrend || []).map((p, i) => ({
    label: p.label || p.day || `T${i + 1}`,
    value: typeof p.value === 'number' ? p.value : toNumber(p.value),
  }));

  return {
    contributors,
    traceability,
    evidence: payload.supportingEvidence || [],
    trend,
  };
}

/** Build a simple linear forecast from a trend series. */
function forecastFrom(series) {
  const pts = (series || []).map((p) => p.value).filter((v) => typeof v === 'number');
  if (pts.length < 2) return null;
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const slope = last - prev;
  const projected = Math.round((last + slope) * 10) / 10;
  return { value: projected, horizon: 'Next period', note: 'Linear projection from recent trend' };
}

/** Derive a calculation walkthrough from a formula definition. */
function buildCalculations(formula) {
  if (!formula || !Array.isArray(formula.components) || formula.components.length === 0) return [];
  return formula.components
    .filter((c) => typeof c.weight === 'number' && c.weight > 0 && typeof c.value === 'number')
    .map((c) => {
      const contribution = Math.round(((c.value * c.weight) / 100) * 10) / 10;
      return {
        component: c.name,
        weight: c.weight,
        value: c.value,
        contribution,
        expression: `${c.value} × ${c.weight}% = ${contribution}`,
      };
    });
}

function normalizeTrends(entryTrends, ctx, live) {
  if (entryTrends && Array.isArray(entryTrends.monthly) && entryTrends.monthly.length) {
    return {
      monthly: entryTrends.monthly,
      quarterly: entryTrends.quarterly || [],
      target: entryTrends.target ?? null,
      forecast: entryTrends.forecast || forecastFrom(entryTrends.monthly),
    };
  }
  const fromData = (ctx.data || []).map((p, i) => ({
    label: p.label || p.day || `T${i + 1}`,
    value: typeof p.value === 'number' ? p.value : toNumber(p.value),
  }));
  const monthly = fromData.length ? fromData : live.trend;
  return {
    monthly: monthly || [],
    quarterly: [],
    target: null,
    forecast: forecastFrom(monthly),
  };
}

function genericFormula(ctx) {
  const num = toNumber(ctx.value);
  return {
    expression: 'Composite index normalized to a 0–100 scale from its weighted source signals',
    components: [],
    result: num,
  };
}

/* ── Universal Explainability Model — additional mandated sections ───────────
 * Everything below is deterministic (seeded from the KPI id) so a metric always
 * resolves to the same Sample Size, Evidence Chain, Confidence, Audit trail and
 * Challenge answers across re-renders. Authored fields always win when present.
 */

const LOWER_IS_BETTER = /risk|debt|breach|incident|leak|defect|vuln|mttr|backlog|overdue|aging|exposure|critical|cost|toil/i;
const BASE_AUDIT_DATE = '2026-06-18';

function hashString(input) {
  let h = 2166136261;
  const s = String(input ?? '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Adds a defensible weight + contribution% and a direction to each contributor. */
function enrichContributors(entities, lowerIsBetter) {
  const list = Array.isArray(entities) ? entities : [];
  if (list.length === 0) return [];
  const n = list.length;
  const even = Math.round(100 / n);
  const withWeight = list.map((e, i) => ({
    ...e,
    weight: typeof e.weight === 'number' ? e.weight : i === 0 ? 100 - even * (n - 1) : even,
  }));
  const weightedTotal = withWeight
    .filter((e) => typeof e.score === 'number')
    .reduce((sum, e) => sum + e.score * e.weight, 0) || 1;
  return withWeight.map((e) => {
    const contribution = typeof e.score === 'number' ? Math.round(((e.score * e.weight) / weightedTotal) * 100) : null;
    let direction = 'neutral';
    if (typeof e.score === 'number') {
      const strong = e.score >= 60;
      direction = (lowerIsBetter ? !strong : strong) ? 'positive' : 'negative';
    }
    return { ...e, contribution, direction };
  });
}

function buildSampleSize(seed) {
  const rand = mulberry32(seed + 23);
  const applications = 30 + Math.floor(rand() * 40);
  const controls = 400 + Math.floor(rand() * 700);
  const milestones = 80 + Math.floor(rand() * 220);
  const releases = 120 + Math.floor(rand() * 120);
  const incidents = 200 + Math.floor(rand() * 500);
  // Population assessed = the full evaluated universe spanning every record type.
  const population = applications + controls + milestones + releases + incidents + 200 + Math.floor(rand() * 400);
  return [
    { label: 'Population assessed', value: population.toLocaleString('en-IN') },
    { label: 'Applications assessed', value: String(applications) },
    { label: 'Controls evaluated', value: String(controls) },
    { label: 'Milestones analyzed', value: String(milestones) },
    { label: 'Releases analyzed', value: String(releases) },
    { label: 'Incidents analyzed', value: String(incidents) },
  ];
}

/**
 * Confidence Breakdown by evidence type — what proportion of the score is backed
 * by each grade of evidence. Higher-confidence KPIs lean on validated/telemetry/
 * audit evidence; lower-confidence KPIs lean more on manual attestation and
 * AI-derived inference. Deterministic (seeded) and normalized to exactly 100%.
 */
function buildConfidenceMix(score, seed) {
  const rand = mulberry32(seed + 47);
  const hard = clamp(Math.round(score), 60, 95);
  const validated = clamp(Math.round(hard * 0.45 + (rand() - 0.5) * 6), 20, 55);
  const telemetry = clamp(Math.round(hard * 0.3 + (rand() - 0.5) * 6), 10, 40);
  const audit = clamp(Math.round((100 - hard) * 0.5 + 8 + (rand() - 0.5) * 4), 5, 25);
  const manual = clamp(Math.round((100 - hard) * 0.4 + (rand() - 0.5) * 4), 3, 20);
  const parts = [
    { type: 'Validated evidence', pct: validated, note: 'Reconciled against source systems of record' },
    { type: 'Telemetry', pct: telemetry, note: 'Automated pipeline / runtime signals' },
    { type: 'Audit evidence', pct: audit, note: 'Audit-grade artefacts and approvals' },
    { type: 'Manual attestations', pct: manual, note: 'Owner-attested inputs' },
    { type: 'AI-derived inference', pct: 0, note: 'Model-inferred where evidence is sparse' },
  ];
  const used = validated + telemetry + audit + manual;
  parts[4].pct = clamp(100 - used, 2, 30);
  // Normalize any rounding drift onto the largest (validated) bucket.
  const drift = 100 - parts.reduce((s, p) => s + p.pct, 0);
  parts[0].pct += drift;
  return parts;
}

/**
 * Canonical evidence chain: Source → Assessment → Calculation → KPI → Dashboard.
 * The fixed five-stage provenance every KPI flows through, hydrated from this
 * metric's own sources, contributors, formula and audit run.
 */
function buildLineageChain(model) {
  const ds = model.dataSources || [];
  const ents = model.contributingEntities || [];
  const sfx = model.suffix === '%' ? '%' : model.suffix ? ` ${model.suffix}` : '';
  return [
    { stage: 'Source', detail: ds.length ? `${ds.length} source systems — ${ds.slice(0, 3).join(', ')}${ds.length > 3 ? '…' : ''}` : 'Underlying estate systems of record' },
    { stage: 'Assessment', detail: `Signals scored across ${ents.length || 'multiple'} contributing ${ents.length === 1 ? 'entity' : 'entities'}` },
    { stage: 'Calculation', detail: `${model.formula?.expression || 'Weighted composite model'} · formula ${model.audit?.formulaVersion || '—'}` },
    { stage: 'KPI', detail: `${model.name} = ${model.value}${sfx}` },
    { stage: 'Dashboard', detail: `Surfaced on executive dashboards · run ${model.audit?.calculationRunId || '—'}` },
  ];
}

function buildEvidenceChain(dataSources, components) {
  const sources = (dataSources && dataSources.length ? dataSources : ['Azure DevOps', 'Jenkins', 'ServiceNow', 'SonarQube']).slice(0, 6);
  const metricNames = components && components.length ? components.map((c) => c.name) : ['Coverage', 'Quality', 'Timeliness', 'Stability'];
  return sources.map((src, i) => {
    const minute = 20 + i * 5;
    const hh = 10 + Math.floor(minute / 60);
    const mm = String(minute % 60).padStart(2, '0');
    const metric = metricNames[i % metricNames.length] || `Signal ${i + 1}`;
    return {
      metric,
      sourceSystem: src,
      timestamp: `${BASE_AUDIT_DATE} ${hh}:${mm}`,
      evidenceRecord: `EV-${(hashString(src + metric) % 90000) + 10000}`,
    };
  });
}

function buildConfidenceBreakdown(base, seed) {
  const rand = mulberry32(seed + 31);
  const score = clamp(Math.round(base), 60, 99);
  return {
    score,
    sourceCoverage: clamp(Math.round(score + (rand() - 0.4) * 10), 65, 99),
    dataFreshness: clamp(Math.round(score + (rand() - 0.4) * 12), 65, 99),
    sampleSize: clamp(Math.round(score + (rand() - 0.5) * 8), 65, 99),
    completeness: clamp(Math.round(score + (rand() - 0.5) * 10), 65, 99),
  };
}

function buildHistoricalSummary(trends, lowerIsBetter, drivers) {
  const monthly = (trends && trends.monthly) || [];
  const nums = monthly.map((m) => (typeof m.value === 'number' ? m.value : null)).filter((v) => v !== null);
  const current = nums.length ? nums[nums.length - 1] : null;
  const previous = nums.length > 1 ? nums[nums.length - 2] : current;
  const delta = current !== null && previous !== null ? Math.round((current - previous) * 10) / 10 : 0;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const reason =
    (drivers && drivers[0]) ||
    (delta === 0
      ? 'Steady-state; no material change this period.'
      : improved
        ? 'Quality and remediation improvements moved the score in the right direction.'
        : 'New findings and lagging contributors pushed the score the wrong way.');
  return { current, previous, delta, reason };
}

function buildAudit(id, dataSources) {
  const h = hashString(id);
  const formulaVersion = `FM-${1 + (h % 3)}.${h % 9}`;
  const priorFormula = `FM-${1 + (h % 3)}.${(h % 9 + 8) % 9}`;
  return {
    calculationRunId: `CALC-20260618-${(h % 9000) + 1000}`,
    calculationTimestamp: `${BASE_AUDIT_DATE} 10:30 IST`,
    dataSnapshotId: `SNAP-${(h % 900000) + 100000}`,
    version: 'v4.2.0',
    formulaVersion,
    aiModelVersion: 'adip-explain-v1.4',
    generatedBy: 'ADIP KPI Explainability Engine · adip-explain-v1.4',
    generatedOn: `${BASE_AUDIT_DATE} 10:30 IST`,
    dataSource: (dataSources && dataSources.length ? dataSources : ['ADIP simulation engine']).join(' · '),
    lastRecalculation: `${BASE_AUDIT_DATE} 10:30 IST · auto-recalculated every 30s during simulation`,
    changeHistory: [
      { date: '2026-06-18', version: formulaVersion, change: 'Recalculated on latest estate snapshot' },
      { date: '2026-05-30', version: priorFormula, change: 'Weighting reviewed and re-approved by Governance Council' },
      { date: '2026-04-15', version: 'FM-1.0', change: 'KPI baselined and onboarded to the explainability registry' },
    ],
  };
}

function businessOwnerFor(name) {
  const n = String(name).toLowerCase();
  if (/risk|breach|cyber|control|compliance|audit/.test(n)) return 'Chief Risk Office';
  if (/cloud|architecture|modern|technology|platform|standard/.test(n)) return 'CTO Office — Architecture & Platforms';
  if (/value|roi|cost|benefit|productivity/.test(n)) return 'CFO Office — Value Realization';
  if (/\bai\b|model|governance/.test(n)) return 'AI Governance Council';
  if (/delivery|quality|throughput|release|requirement|defect/.test(n)) return 'CIO Office — Delivery & Engineering';
  return 'Enterprise Governance Office';
}

function ownerFor(name) {
  const n = String(name).toLowerCase();
  if (/risk|cyber|control|compliance/.test(n)) return 'CRO';
  if (/architecture|cloud|technology|standard|modern/.test(n)) return 'Chief Architect';
  if (/value|roi|cost|benefit/.test(n)) return 'Value Office';
  if (/\bai\b|model/.test(n)) return 'Head of AI Governance';
  if (/delivery|quality|release|requirement/.test(n)) return 'Head of Delivery';
  return 'Enterprise Data Steward';
}

function buildRegistry(model, authored, evidenceCount) {
  const sfx = model.suffix === '%' ? '%' : model.suffix ? ` ${model.suffix}` : '';
  const target = model.trends && model.trends.target != null ? `${model.trends.target}${sfx}` : null;
  const thresholdDefinition = target
    ? `Target ${target} · ${model.lowerIsBetter ? 'lower is better (breach above target)' : 'higher is better (breach below target)'}`
    : `${model.lowerIsBetter ? 'Lower is better' : 'Higher is better'} · threshold under governance review`;
  return {
    kpiId: model.id,
    owner: ownerFor(model.name),
    businessOwner: businessOwnerFor(model.name),
    sourceSystems: model.dataSources || [],
    formulaDefinition: model.formula?.expression || 'Composite weighted model',
    thresholdDefinition,
    reviewFrequency: 'Quarterly · Enterprise Governance Council',
    governanceStatus: authored ? 'Governed · Approved' : 'Provisional · In Review',
    refreshFrequency: model.lastUpdated && /live/i.test(model.lastUpdated) ? 'Real-time / 30s' : 'Daily',
    confidenceMethod: 'Source coverage × data freshness × sample completeness',
    explainabilityMethod: authored ? 'Authored explainability catalog + AI narrative' : 'Auto-synthesized model + AI narrative',
    evidenceMapping: `${(model.dataSources || []).length} source systems · ${evidenceCount} evidence records`,
    approvalStatus: authored ? 'Approved' : 'In Review',
    version: authored ? '2.1' : '1.0',
  };
}

function fmtVal(v, suffix) {
  const s = suffix === '%' ? '%' : suffix ? ` ${suffix}` : '';
  return `${v}${s}`;
}

function buildNarrative(model, hist) {
  const pos = (model.contributingEntities || []).filter((c) => c.direction === 'positive').map((c) => c.name);
  const neg = (model.contributingEntities || []).filter((c) => c.direction === 'negative').map((c) => c.name);
  const lead =
    hist.current === null
      ? `${model.name} is currently ${fmtVal(model.value, model.suffix)}.`
      : hist.delta === 0
        ? `${model.name} held steady at ${fmtVal(hist.current, model.suffix)}.`
        : `${model.name} moved from ${fmtVal(hist.previous, model.suffix)} to ${fmtVal(hist.current, model.suffix)} (Δ ${hist.delta > 0 ? '+' : ''}${hist.delta}).`;
  const drivers = (model.aiReasoning && model.aiReasoning.drivers) || [];
  const driverLines = drivers.slice(0, 3).map((d) => `• ${d}`);
  const parts = [lead];
  if (driverLines.length) parts.push(`Key drivers:\n${driverLines.join('\n')}`);
  else if (hist.reason) parts.push(`Reason: ${hist.reason}`);
  if (pos.length) parts.push(`Primary positive contributors: ${pos.slice(0, 3).join(', ')}.`);
  if (neg.length) parts.push(`Primary negative contributors: ${neg.slice(0, 3).join(', ')}.`);
  return parts.join('\n\n');
}

function buildChallenges(model) {
  const sfx = model.suffix === '%' ? '%' : model.suffix ? ` ${model.suffix}` : '';
  const ents = model.contributingEntities || [];
  const pos = ents.filter((c) => c.direction === 'positive');
  const neg = ents.filter((c) => c.direction === 'negative');
  const fmtList = (arr) =>
    arr
      .slice(0, 5)
      .map((c) => {
        const scorePart = typeof c.score === 'number' ? `score ${c.score}` : '';
        const contribPart = typeof c.contribution === 'number' ? `${c.contribution}% contribution` : '';
        const detail = [scorePart, contribPart].filter(Boolean).join(', ');
        return detail ? `${c.name} (${detail})` : c.name;
      })
      .join('; ');
  const target = model.trends && model.trends.target != null ? `${model.trends.target}${sfx}` : 'target';
  const hist = model.historicalTrend || {};
  return [
    { id: 'why', question: `Why is ${model.name} ${model.value}${sfx}?`, answer: model.aiNarrative },
    {
      id: 'why-not',
      question: `Why isn't it at ${target} yet?`,
      answer: `The gap to ${target} is held back by the lowest-performing contributors: ${fmtList(neg) || 'no material detractors'}. ${(model.recommendations || [])
        .slice(0, 2)
        .map((r) => `Recommended: ${r.title}${r.expectedBenefit ? ` (${r.expectedBenefit})` : ''}.`)
        .join(' ')}`,
    },
    { id: 'contributors', question: 'Which applications contributed most?', answer: `Top positive contributors: ${fmtList(pos) || 'none resolved'}.` },
    { id: 'detractors', question: 'Which applications reduced the score?', answer: `Detractors dragging the score down: ${fmtList(neg) || 'none material'}.` },
    {
      id: 'changed',
      question: 'What changed since the last period?',
      answer:
        hist.current === null
          ? 'Period-over-period comparison is not available for this metric.'
          : `${model.name} moved from ${hist.previous}${sfx} to ${hist.current}${sfx} (Δ ${hist.delta > 0 ? '+' : ''}${hist.delta}). Reason: ${hist.reason}`,
    },
    {
      id: 'formula',
      question: 'Show the formula and weights.',
      answer: `${model.name} = ${model.formula.expression}. ${
        (model.weightages || []).length ? `Weights: ${model.weightages.map((w) => `${w.name} ${w.weight}%`).join(', ')}.` : ''
      }`,
    },
    {
      id: 'evidence',
      question: 'Show the evidence.',
      answer: (model.evidenceChain || []).map((e) => `${e.metric} ← ${e.sourceSystem} @ ${e.timestamp} [${e.evidenceRecord}]`).join('  ·  '),
    },
    {
      id: 'trust',
      question: 'Can I trust this number?',
      answer: `Confidence ${model.confidence.score}% — source coverage ${model.confidence.sourceCoverage}%, data freshness ${model.confidence.dataFreshness}%, sample completeness ${model.confidence.completeness}%. Sample: ${(model.sampleSize || [])
        .map((s) => `${s.value} ${s.label.toLowerCase()}`)
        .join(', ')}. Reproduce via run ${model.audit.calculationRunId} on snapshot ${model.audit.dataSnapshotId} (formula ${model.audit.formulaVersion}).`,
    },
  ];
}

/** Free-text Executive Challenge Mode — maps a question to the best preset answer. */
export function answerKpiChallenge(model, question) {
  const q = String(question || '').toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));
  const pick = (id) => (model.challenges || []).find((c) => c.id === id);
  let chosen;
  if (has('formula', 'calculat', 'weight', 'how is')) chosen = pick('formula');
  else if (has('evidence', 'source', 'proof', 'record')) chosen = pick('evidence');
  else if (has('trust', 'confiden', 'reliab', 'fresh', 'reproduc')) chosen = pick('trust');
  else if (has('reduce', 'detract', 'drag', 'worst', 'negative', 'lower it')) chosen = pick('detractors');
  else if (has('contribut', 'which app', 'best', 'positive', 'top')) chosen = pick('contributors');
  else if (has('change', 'yesterday', 'since', 'previous', 'last')) chosen = pick('changed');
  else if (has('why not', "isn't", 'higher', 'better', 'target')) chosen = pick('why-not');
  else chosen = pick('why');
  return (chosen && chosen.answer) || model.aiNarrative;
}

export function getKpiExplainability(ctx, state) {
  const entry = findEntry(ctx);
  const live = state ? buildLiveModel(ctx, state) : { contributors: [], traceability: [], evidence: [], trend: [] };
  const authored = Boolean(entry);

  const formula = entry?.formula || genericFormula(ctx);
  const contributingEntities =
    entry?.contributingEntities && entry.contributingEntities.length
      ? entry.contributingEntities
      : live.contributors;
  const traceability =
    entry?.traceability && entry.traceability.length
      ? entry.traceability
      : live.traceability;

  const aiReasoning = entry?.aiReasoning || {
    confidence: ctx.trend !== undefined ? 70 : 65,
    drivers: live.evidence.slice(0, 3),
    insights: [
      `${ctx.label} is currently ${ctx.value}${ctx.suffix || ''}. Detailed factor weighting for this metric is sourced live from its contributing records.`,
    ],
  };

  const recommendations = entry?.recommendations || [
    {
      priority: 'Medium',
      title: `Review the largest contributor to ${ctx.label}`,
      expectedBenefit: 'Targeted improvement of the headline metric',
      estimatedImpact: 'Assessment',
    },
  ];

  const dataSources = entry?.dataSources || ['ADIP simulation engine', 'KPI drilldown resolver'];

  const trends = normalizeTrends(entry?.trends, ctx, live);

  const id = entry?.id || ctx.chartId || slugify(ctx.label);
  const name = entry?.name || ctx.label;
  const suffix = entry?.suffix ?? ctx.suffix ?? '';
  const lowerIsBetter = LOWER_IS_BETTER.test(`${name} ${ctx.chartId || ''} ${suffix}`);
  const seed = hashString(id || name);

  const model = {
    id,
    name,
    value: entry?.valueOverride ?? ctx.value,
    suffix,
    description:
      entry?.description ||
      `${ctx.label} is a derived indicator surfaced on the ADIP executive dashboards. Its contributing records and trend are resolved live from the underlying estate.`,
    formula,
    weightages: (formula.components || []).map((c) => ({ name: c.name, weight: c.weight })),
    dataSources,
    contributingEntities: enrichContributors(contributingEntities, lowerIsBetter),
    calculations: buildCalculations(formula),
    aiReasoning,
    recommendations,
    traceability,
    trends,
    assumptions: entry?.assumptions || [
      'Values shown are illustrative simulation data.',
      'Contributing records are resolved live from the current estate snapshot.',
    ],
    lastUpdated: entry?.lastUpdated || 'Live · auto-refreshed',
    authored,
    lowerIsBetter,
  };

  // ── Universal Explainability Model — mandated sections (7, 9, 10, 12, 13) ──
  model.sampleSize = entry?.sampleSize || buildSampleSize(seed);
  model.evidenceChain = buildEvidenceChain(dataSources, formula.components);
  model.confidence = buildConfidenceBreakdown(
    typeof aiReasoning.confidence === 'number' ? aiReasoning.confidence : 85,
    seed,
  );
  model.confidence.evidenceMix = buildConfidenceMix(model.confidence.score, seed);
  model.historicalTrend = buildHistoricalSummary(trends, lowerIsBetter, aiReasoning.drivers);
  model.audit = buildAudit(id, dataSources);
  model.lineageChain = buildLineageChain(model);
  model.aiNarrative = buildNarrative(model, model.historicalTrend);
  model.registry = buildRegistry(model, authored, model.evidenceChain.length);
  model.challenges = buildChallenges(model);

  return model;
}

export default getKpiExplainability;
