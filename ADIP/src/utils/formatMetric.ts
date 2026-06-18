/**
 * Enterprise metric formatting framework.
 *
 * Single source of truth for rendering KPI / metric values so units, suffixes,
 * and prefixes are never duplicated (e.g. "90% %", "₹15.9M %", "61/100/100").
 *
 * Usage:
 *   formatMetric({ value: 90, format: 'PERCENTAGE' })        -> "90%"
 *   formatMetric({ value: 15.9, format: 'CURRENCY_MILLION' }) -> "₹15.9M"
 *   formatMetric({ value: 61, format: 'SCORE_100' })          -> "61/100"
 *   formatMetric({ value: 18, format: 'COUNT' })              -> "18"
 *   formatMetric({ value: 4.2, format: 'DURATION_HOURS' })    -> "4.2 hrs"
 *
 * Idempotent: if the incoming value already carries its unit (e.g. "90%"),
 * the formatter does NOT append it again.
 */

export type MetricFormat =
  | 'PERCENTAGE'
  | 'CURRENCY'
  | 'CURRENCY_MILLION'
  | 'CURRENCY_THOUSAND'
  | 'COUNT'
  | 'RATIO'
  | 'SCORE_100'
  | 'SCORE'
  | 'DURATION_DAYS'
  | 'DURATION_HOURS'
  | 'DURATION_MINUTES'
  | 'STORAGE_GB'
  | 'STORAGE_TB'
  | 'DECIMAL'
  | 'TEXT';

export interface FormatMetricInput {
  value: string | number;
  format?: MetricFormat;
  /** Decimal places for numeric formats that don't have a fixed default. */
  decimals?: number;
  /** Optional explicit unit override (rarely needed). */
  unit?: string;
}

const CURRENCY = '₹';

function isNumeric(v: string | number): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** A value is "already formatted" if it's a string carrying a non-numeric unit. */
function carriesUnit(raw: string): boolean {
  const s = raw.trim();
  // pure number (optionally with separators / decimal / sign) → no unit
  if (/^[+-]?[\d,]+(\.\d+)?$/.test(s)) return false;
  return true;
}

function round(n: number, decimals: number): string {
  const f = 10 ** decimals;
  const r = Math.round(n * f) / f;
  // avoid "15.0" when decimals=1 but value is whole and we want trailing? keep toFixed for consistency
  return decimals > 0 ? r.toFixed(decimals) : String(r);
}

/**
 * Format a metric value for display. Idempotent and unit-safe.
 */
export function formatMetric(input: FormatMetricInput): string {
  const { value, format = 'TEXT', decimals, unit } = input;

  // If a pre-formatted string already carries a unit, return as-is (never double up).
  if (typeof value === 'string' && carriesUnit(value)) {
    return value.trim();
  }

  const num = isNumeric(value) ? value : Number(String(value).replace(/,/g, ''));
  const hasNum = Number.isFinite(num);

  switch (format) {
    case 'PERCENTAGE':
      return hasNum ? `${round(num, decimals ?? 0)}%` : `${value}%`;

    case 'CURRENCY':
      return hasNum ? `${CURRENCY}${num.toLocaleString('en-IN')}` : `${CURRENCY}${value}`;

    case 'CURRENCY_MILLION':
      return hasNum ? `${CURRENCY}${round(num, decimals ?? 1)}M` : `${CURRENCY}${value}M`;

    case 'CURRENCY_THOUSAND':
      return hasNum ? `${CURRENCY}${round(num, decimals ?? 1)}K` : `${CURRENCY}${value}K`;

    case 'COUNT':
      // Plain count — NEVER append "count" or any unit word.
      return hasNum ? num.toLocaleString('en-IN') : String(value);

    case 'RATIO':
      // Caller passes a ready ratio number like 3.2 → "3.2x"
      return hasNum ? `${round(num, decimals ?? 1)}x` : String(value);

    case 'SCORE_100':
      return hasNum ? `${round(num, decimals ?? 0)}/100` : `${value}/100`;

    case 'SCORE':
      return hasNum ? round(num, decimals ?? 0) : String(value);

    case 'DURATION_DAYS':
      return hasNum ? `${round(num, decimals ?? 0)} ${num === 1 ? 'day' : 'days'}` : `${value} days`;

    case 'DURATION_HOURS':
      return hasNum ? `${round(num, decimals ?? 1)} ${num === 1 ? 'hr' : 'hrs'}` : `${value} hrs`;

    case 'DURATION_MINUTES':
      return hasNum ? `${round(num, decimals ?? 0)} ${num === 1 ? 'min' : 'mins'}` : `${value} mins`;

    case 'STORAGE_GB':
      return hasNum ? `${round(num, decimals ?? 1)} GB` : `${value} GB`;

    case 'STORAGE_TB':
      return hasNum ? `${round(num, decimals ?? 1)} TB` : `${value} TB`;

    case 'DECIMAL':
      return hasNum ? round(num, decimals ?? 2) : String(value);

    case 'TEXT':
    default:
      return unit ? `${value} ${unit}`.trim() : String(value);
  }
}

/* ------------------------------------------------------------------ */
/* Unit-safe suffix joining (used by KpiCard to defend legacy calls)  */
/* ------------------------------------------------------------------ */

/** Trailing-unit tokens that mean a value already carries its unit. */
const UNIT_TOKENS = ['%', '/100', 'M', 'K', 'B', 'GB', 'TB', 'x', 'hrs', 'hr', 'days', 'day', 'mins', 'min'];

/**
 * Returns true when appending `suffix` to `value` would duplicate a unit
 * or produce malformed notation (e.g. value "90%" + suffix "%").
 */
export function wouldDuplicateUnit(value: string | number, suffix: string): boolean {
  if (!suffix) return false;
  const v = String(value).trim();
  const s = suffix.trim();

  // currency prefix duplication is handled separately; this guards trailing units
  // 1. exact suffix already present at the end
  if (v.endsWith(s)) return true;

  // 2. value carries a currency marker but suffix is "%" → "₹15.9M %" is wrong
  if (v.includes(CURRENCY) && s === '%') return true;

  // 3. value ends with a ratio/score like "/100" but suffix is "%" or "/100"
  if (/\/\d+$/.test(v)) return true;

  // 4. value already ends with a known unit token and suffix is "%"
  const lower = v.toLowerCase();
  const endsWithUnit = UNIT_TOKENS.some((u) => lower.endsWith(u.toLowerCase()));
  if (endsWithUnit && s === '%') return true;

  // 5. value contains a trailing unit word (e.g. "75 risks", "18 count")
  if (/[a-zA-Z]{2,}$/.test(v) && s === '%') return true;

  return false;
}

/**
 * Join a (possibly already-formatted) value with a suffix, never duplicating units.
 * This is the defensive helper KpiCard uses so legacy call sites can't render
 * "90% %", "₹15.9M %", "61/100 %", "75 risks %", etc.
 */
export function joinValueSuffix(value: string | number, suffix?: string): string {
  if (!suffix) return String(value);
  if (wouldDuplicateUnit(value, suffix)) return String(value);
  // percentage and slash units attach with no space; word units keep a space
  const s = suffix.trim();
  if (s === '%' || s.startsWith('/')) return `${value}${s}`;
  return `${value}${s}`;
}
