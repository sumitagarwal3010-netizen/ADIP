/**
 * Deterministic enterprise telemetry generators.
 * Produces uneven, noisy, outlier-rich percentage series that resemble
 * real banking / IT estate dashboards — not balanced demo staircases.
 */

export type TelemetryProfile = 'excellent' | 'healthy' | 'average' | 'weak' | 'critical';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface TelemetryPoint {
  value: number;
  profile: TelemetryProfile;
  trend: TrendDirection;
  trendDelta: number;
  trendLabel: string;
}

export interface NamedTelemetry {
  name: string;
  value: number;
  profile: TelemetryProfile;
  trend: TrendDirection;
  trendDelta: number;
  trendLabel: string;
}

/** Profile bands (inclusive). */
export const TELEMETRY_PROFILES: Record<TelemetryProfile, { min: number; max: number }> = {
  excellent: { min: 90, max: 98 },
  healthy: { min: 75, max: 89 },
  average: { min: 55, max: 74 },
  weak: { min: 35, max: 54 },
  critical: { min: 10, max: 34 },
};

/** Enterprise mix: 20% excellent · 30% healthy · 25% average · 15% weak · 10% critical */
const PROFILE_WEIGHTS: Array<{ profile: TelemetryProfile; weight: number }> = [
  { profile: 'excellent', weight: 20 },
  { profile: 'healthy', weight: 30 },
  { profile: 'average', weight: 25 },
  { profile: 'weak', weight: 15 },
  { profile: 'critical', weight: 10 },
];

/** Irregular lookup tables — avoid linear i%n staircases. */
const NOISE_A = [41, 58, 55, 82, 79, 88, 63, 47, 91, 72, 95, 67, 53, 81, 44, 76, 39, 86, 61, 93, 48, 74, 69, 84, 52, 97, 36, 71, 57, 89];
const NOISE_B = [73, 29, 94, 51, 66, 83, 42, 77, 58, 91, 34, 68, 85, 46, 79, 62, 96, 38, 71, 54, 87, 49, 75, 31, 92, 64, 81, 43, 88, 56];
const NOISE_C = [17, 63, 88, 41, 76, 29, 94, 52, 69, 35, 81, 47, 92, 58, 73, 26, 85, 61, 44, 97, 33, 78, 54, 89, 37, 71, 48, 83, 59, 66];

function clamp(n: number, min = 1, max = 99): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Deterministic 32-bit mix (not for crypto). */
export function hashSeed(input: string | number): number {
  const s = String(input);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function profileForValue(value: number): TelemetryProfile {
  if (value >= 90) return 'excellent';
  if (value >= 75) return 'healthy';
  if (value >= 55) return 'average';
  if (value >= 35) return 'weak';
  return 'critical';
}

export function formatTrend(delta: number): { trend: TrendDirection; trendDelta: number; trendLabel: string } {
  const trendDelta = Math.round(delta);
  if (trendDelta >= 2) return { trend: 'up', trendDelta, trendLabel: `▲ +${trendDelta}%` };
  if (trendDelta <= -2) return { trend: 'down', trendDelta, trendLabel: `▼ ${trendDelta}%` };
  return { trend: 'stable', trendDelta: 0, trendLabel: '→ Stable' };
}

export function generateOutlier(seed: string | number, kind: 'spike' | 'dip' = 'spike'): number {
  const rng = mulberry32(hashSeed(`outlier:${kind}:${seed}`));
  if (kind === 'spike') return clamp(88 + rng() * 10);
  return clamp(12 + rng() * 22);
}

function pickProfile(rng: () => number): TelemetryProfile {
  const roll = rng() * 100;
  let acc = 0;
  for (const { profile, weight } of PROFILE_WEIGHTS) {
    acc += weight;
    if (roll < acc) return profile;
  }
  return 'average';
}

function valueInProfile(profile: TelemetryProfile, rng: () => number): number {
  const { min, max } = TELEMETRY_PROFILES[profile];
  return clamp(min + rng() * (max - min));
}

/**
 * Single deterministic score for index/seed.
 * Replaces patterns like `50 + (i % 48)`.
 */
export function telemetryScore(seed: string | number, forced?: TelemetryProfile): number {
  const h = hashSeed(seed);
  const rng = mulberry32(h);
  const profile = forced ?? pickProfile(rng);
  // Mix profile band with irregular lookup noise so adjacent indices diverge.
  const base = valueInProfile(profile, rng);
  const noise = NOISE_A[h % NOISE_A.length] - 60;
  const wobble = (NOISE_B[(h >>> 8) % NOISE_B.length] - 60) * 0.15;
  return clamp(base + noise * 0.08 + wobble);
}

/** Score forced into a profile band (still noisy within band). */
export function telemetryInProfile(seed: string | number, profile: TelemetryProfile): number {
  return telemetryScore(seed, profile);
}

export function generateEnterpriseDistribution(count: number, seedKey = 'dist'): number[] {
  const values: number[] = [];
  for (let i = 0; i < count; i += 1) {
    values.push(telemetryScore(`${seedKey}:${i}`));
  }
  // Guarantee at least one of each extreme when series is long enough.
  if (count >= 5) {
    values[0] = telemetryInProfile(`${seedKey}:strong`, 'excellent');
    values[1] = telemetryInProfile(`${seedKey}:weak`, 'weak');
    values[2] = telemetryInProfile(`${seedKey}:avg`, 'average');
    values[3] = generateOutlier(`${seedKey}:spike`, 'spike');
    values[4] = generateOutlier(`${seedKey}:dip`, 'dip');
  }
  return values;
}

/**
 * Realistic series for charts — uneven, with spike + dip + plateau + regression.
 * Does NOT enforce equal gaps or sorted spacing.
 */
export function generateRealisticSeries(length: number, seedKey = 'series'): number[] {
  if (length <= 0) return [];
  const rng = mulberry32(hashSeed(seedKey));
  const out: number[] = [];
  let prev = clamp(40 + rng() * 35);
  for (let i = 0; i < length; i += 1) {
    const roll = rng();
    let next: number;
    if (roll < 0.12) {
      next = generateOutlier(`${seedKey}:sp:${i}`, 'spike');
    } else if (roll < 0.22) {
      next = generateOutlier(`${seedKey}:dp:${i}`, 'dip');
    } else if (roll < 0.32) {
      // Plateau
      next = prev + (rng() - 0.5) * 3;
    } else if (roll < 0.42) {
      // Temporary regression
      next = prev - (4 + rng() * 14);
    } else if (roll < 0.55) {
      // Jump forward
      next = prev + (6 + rng() * 18);
    } else {
      next = prev + (rng() - 0.48) * 22;
    }
    next = clamp(next);
    // Nudge with irregular table so consecutive points never form a staircase.
    const nudge = (NOISE_C[(hashSeed(`${seedKey}:${i}`) + i * 7) % NOISE_C.length] - 55) * 0.12;
    next = clamp(next + nudge);
    out.push(next);
    prev = next;
  }
  return out;
}

export function withTrend(value: number, seed: string | number): TelemetryPoint {
  const rng = mulberry32(hashSeed(`trend:${seed}`));
  const delta = Math.round((rng() - 0.45) * 18);
  const { trend, trendDelta, trendLabel } = formatTrend(delta);
  return { value, profile: profileForValue(value), trend, trendDelta, trendLabel };
}

export function generatePortfolioTelemetry(names: string[], seedKey = 'portfolio'): NamedTelemetry[] {
  const dist = generateEnterpriseDistribution(names.length, seedKey);
  return names.map((name, i) => {
    const point = withTrend(dist[i] ?? telemetryScore(`${seedKey}:${name}`), `${seedKey}:${name}`);
    return { name, ...point };
  });
}

/** Canonical cloud adoption — matches enterprise multi-cloud reality. */
export function generateCloudTelemetry(): NamedTelemetry[] {
  const raw: Array<[string, number]> = [
    ['AWS', 89],
    ['Azure', 66],
    ['GCP', 48],
    ['Private Cloud', 81],
    ['Hybrid', 57],
  ];
  return raw.map(([name, value]) => {
    const point = withTrend(value, `cloud:${name}`);
    return { name, ...point };
  });
}

/** Technology standards maturity by domain. */
export function generateStandardsTelemetry(): NamedTelemetry[] {
  const raw: Array<[string, number]> = [
    ['Security', 93],
    ['Infrastructure', 84],
    ['Cloud', 72],
    ['API', 61],
    ['Observability', 49],
    ['AI', 88],
    ['Data', 68],
    ['Integration', 74],
  ];
  return raw.map(([name, value]) => {
    const point = withTrend(value, `std:${name}`);
    return { name, ...point };
  });
}

export function generateRiskTelemetry(): NamedTelemetry[] {
  const raw: Array<[string, number]> = [
    ['Retail Banking', 82],
    ['Corporate Banking', 56],
    ['Treasury', 41],
    ['Digital Payments', 74],
    ['Risk & Compliance', 91],
  ];
  return raw.map(([name, value]) => {
    const point = withTrend(value, `risk:${name}`);
    return { name, ...point };
  });
}

export function generateComplianceTelemetry(): NamedTelemetry[] {
  const raw: Array<[string, number]> = [
    ['RBI', 96],
    ['SEBI', 88],
    ['IRDAI', 73],
    ['CERT-In', 94],
    ['FIU', 61],
  ];
  return raw.map(([name, value]) => {
    const point = withTrend(value, `compliance:${name}`);
    return { name, ...point };
  });
}

export function generateModernizationTelemetry(): NamedTelemetry[] {
  const raw: Array<[string, number]> = [
    ['Wave 1', 86],
    ['Wave 2', 64],
    ['Wave 3', 38],
    ['Migration', 79],
    ['Testing', 72],
    ['Blocked', 27],
  ];
  return raw.map(([name, value]) => {
    const point = withTrend(value, `mod:${name}`);
    return { name, ...point };
  });
}

/** 5-year roadmap with regressions, plateaus, and jumps — not a staircase. */
export function generateRoadmapTelemetry(
  years: string[] = ['2021', '2022', '2023', '2024', '2025'],
  seedKey = 'roadmap',
): Array<{ year: string; value: number }> {
  // Canonical uneven path when using default years + default seed.
  if (seedKey === 'roadmap' && years.length === 5) {
    const canonical = [38, 52, 49, 77, 84];
    return years.map((year, i) => ({ year, value: canonical[i] ?? telemetryScore(`${seedKey}:${year}`) }));
  }
  const series = generateRealisticSeries(years.length, seedKey);
  return years.map((year, i) => ({ year, value: series[i] ?? telemetryScore(`${seedKey}:${year}`) }));
}

/**
 * Drop-in replacement for `base + (i % span)` generators.
 * Returns a value in [min, max] with enterprise distribution shape.
 */
export function telemetryInRange(seed: string | number, min: number, max: number): number {
  const score = telemetryScore(seed);
  // Map 1–99 enterprise score into caller range without linearizing adjacent indices.
  const t = (score - 1) / 98;
  const irregular = NOISE_A[hashSeed(seed) % NOISE_A.length] / 100;
  const mixed = t * 0.7 + irregular * 0.3;
  return clamp(min + mixed * (max - min), min, max);
}
