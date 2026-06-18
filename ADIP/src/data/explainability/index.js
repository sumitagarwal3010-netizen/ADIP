/**
 * Explainability catalog index.
 *
 * Flattens every domain catalog into a single key → entry map. Each entry may be
 * registered under multiple keys (its chartId plus label slugs) so the engine can
 * resolve a KPI regardless of how a particular card identifies it.
 */

import { TECHNOLOGY_HEALTH_EXPLAINABILITY } from './technologyHealth.js';
import { PORTFOLIO_GOVERNANCE_EXPLAINABILITY } from './portfolioGovernance.js';
import { AI_GOVERNANCE_EXPLAINABILITY } from './aiGovernance.js';
import { VALUE_REALIZATION_EXPLAINABILITY } from './valueRealization.js';
import { EXECUTIVE_EXPLAINABILITY } from './executive.js';
import { TRANSFORMATION_EXPLAINABILITY } from './transformation.js';

const ALL_ENTRIES = [
  ...EXECUTIVE_EXPLAINABILITY,
  ...TECHNOLOGY_HEALTH_EXPLAINABILITY,
  ...PORTFOLIO_GOVERNANCE_EXPLAINABILITY,
  ...AI_GOVERNANCE_EXPLAINABILITY,
  ...VALUE_REALIZATION_EXPLAINABILITY,
  ...TRANSFORMATION_EXPLAINABILITY,
];

/** Normalize a free-text KPI label into a stable lookup slug. */
export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[↓↑→%/]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map of every registered key → catalog entry. */
export const EXPLAINABILITY_CATALOG = ALL_ENTRIES.reduce((map, entry) => {
  (entry.keys || []).forEach((key) => {
    if (!map[key]) map[key] = entry;
  });
  return map;
}, {});

/** Domain grouping retained for documentation / future navigation. */
export const EXPLAINABILITY_DOMAINS = {
  executive: EXECUTIVE_EXPLAINABILITY,
  technologyHealth: TECHNOLOGY_HEALTH_EXPLAINABILITY,
  portfolioGovernance: PORTFOLIO_GOVERNANCE_EXPLAINABILITY,
  aiGovernance: AI_GOVERNANCE_EXPLAINABILITY,
  valueRealization: VALUE_REALIZATION_EXPLAINABILITY,
  transformation: TRANSFORMATION_EXPLAINABILITY,
};

/** Total count of authored, defensible KPI definitions. */
export const AUTHORED_KPI_COUNT = ALL_ENTRIES.length;
