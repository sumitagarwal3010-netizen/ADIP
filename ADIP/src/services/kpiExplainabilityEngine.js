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

  return {
    id: entry?.id || ctx.chartId || slugify(ctx.label),
    name: entry?.name || ctx.label,
    value: entry?.valueOverride ?? ctx.value,
    suffix: entry?.suffix ?? ctx.suffix ?? '',
    description:
      entry?.description ||
      `${ctx.label} is a derived indicator surfaced on the ADIP executive dashboards. Its contributing records and trend are resolved live from the underlying estate.`,
    formula,
    weightages: (formula.components || []).map((c) => ({ name: c.name, weight: c.weight })),
    dataSources,
    contributingEntities,
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
  };
}

export default getKpiExplainability;
