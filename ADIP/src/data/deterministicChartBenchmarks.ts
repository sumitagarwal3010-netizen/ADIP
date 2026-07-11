import type { EnterpriseBarDatum } from '../components/charts/EnterpriseBarChart';
import type { TrendDirection } from './enterpriseTelemetry';

export interface DomainMaturityBenchmark {
  domain: string;
  currentScore: number;
  target: number;
  trend: TrendDirection;
  trendDelta: number;
  trendLabel: string;
  riskBand: 'Low' | 'Medium' | 'High';
  openReviewItems: number;
  lastUpdated: string;
}

/** Authoritative architecture domain maturity scores for horizontal bar charts. */
export const ARCHITECTURE_DOMAIN_MATURITY: DomainMaturityBenchmark[] = [
  { domain: 'Business Architecture', currentScore: 68, target: 85, trend: 'up', trendDelta: 3, trendLabel: '+3%', riskBand: 'Medium', openReviewItems: 4, lastUpdated: '11 Jul 2026' },
  { domain: 'Application Architecture', currentScore: 74, target: 85, trend: 'up', trendDelta: 6, trendLabel: '+6%', riskBand: 'Medium', openReviewItems: 3, lastUpdated: '11 Jul 2026' },
  { domain: 'Data Architecture', currentScore: 59, target: 85, trend: 'up', trendDelta: 2, trendLabel: '+2%', riskBand: 'High', openReviewItems: 7, lastUpdated: '11 Jul 2026' },
  { domain: 'Integration Architecture', currentScore: 82, target: 85, trend: 'stable', trendDelta: 0, trendLabel: 'Stable', riskBand: 'Low', openReviewItems: 1, lastUpdated: '11 Jul 2026' },
  { domain: 'Technology Architecture', currentScore: 71, target: 85, trend: 'down', trendDelta: -2, trendLabel: '-2%', riskBand: 'Medium', openReviewItems: 5, lastUpdated: '11 Jul 2026' },
  { domain: 'Security Architecture', currentScore: 88, target: 90, trend: 'up', trendDelta: 4, trendLabel: '+4%', riskBand: 'Low', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
  { domain: 'Cloud Architecture', currentScore: 64, target: 85, trend: 'up', trendDelta: 5, trendLabel: '+5%', riskBand: 'High', openReviewItems: 6, lastUpdated: '11 Jul 2026' },
  { domain: 'Infrastructure Architecture', currentScore: 79, target: 90, trend: 'up', trendDelta: 1, trendLabel: '+1%', riskBand: 'Medium', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
  { domain: 'AI Architecture', currentScore: 52, target: 80, trend: 'up', trendDelta: 7, trendLabel: '+7%', riskBand: 'High', openReviewItems: 8, lastUpdated: '11 Jul 2026' },
  { domain: 'Reference Architecture', currentScore: 77, target: 90, trend: 'stable', trendDelta: 0, trendLabel: 'Stable', riskBand: 'Medium', openReviewItems: 3, lastUpdated: '11 Jul 2026' },
];

export function architectureDomainMaturityChart(): EnterpriseBarDatum[] {
  return ARCHITECTURE_DOMAIN_MATURITY.map((d) => ({
    name: d.domain,
    value: d.currentScore,
    target: d.target,
    trend: d.trend,
    trendDelta: d.trendDelta,
    trendLabel: d.trendLabel,
    riskBand: d.riskBand,
    openReviewItems: d.openReviewItems,
    lastUpdated: d.lastUpdated,
  }));
}

/** Standards adoption by architecture domain key (deterministic, not averaged from noisy telemetry). */
export const STANDARDS_ADOPTION_BY_DOMAIN: EnterpriseBarDatum[] = [
  { name: 'business', value: 72, target: 85, trend: 'up', trendDelta: 4, trendLabel: '+4%', riskBand: 'Medium', openReviewItems: 3, lastUpdated: '11 Jul 2026' },
  { name: 'application', value: 81, target: 85, trend: 'up', trendDelta: 5, trendLabel: '+5%', riskBand: 'Low', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
  { name: 'data', value: 63, target: 85, trend: 'up', trendDelta: 2, trendLabel: '+2%', riskBand: 'High', openReviewItems: 6, lastUpdated: '11 Jul 2026' },
  { name: 'integration', value: 86, target: 90, trend: 'stable', trendDelta: 0, trendLabel: 'Stable', riskBand: 'Low', openReviewItems: 1, lastUpdated: '11 Jul 2026' },
  { name: 'technology', value: 69, target: 85, trend: 'down', trendDelta: -1, trendLabel: '-1%', riskBand: 'Medium', openReviewItems: 4, lastUpdated: '11 Jul 2026' },
  { name: 'security', value: 93, target: 95, trend: 'up', trendDelta: 3, trendLabel: '+3%', riskBand: 'Low', openReviewItems: 1, lastUpdated: '11 Jul 2026' },
  { name: 'cloud', value: 58, target: 85, trend: 'up', trendDelta: 6, trendLabel: '+6%', riskBand: 'High', openReviewItems: 5, lastUpdated: '11 Jul 2026' },
  { name: 'infrastructure', value: 76, target: 90, trend: 'up', trendDelta: 2, trendLabel: '+2%', riskBand: 'Medium', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
  { name: 'ai', value: 49, target: 80, trend: 'up', trendDelta: 8, trendLabel: '+8%', riskBand: 'High', openReviewItems: 7, lastUpdated: '11 Jul 2026' },
  { name: 'reference', value: 84, target: 90, trend: 'stable', trendDelta: 0, trendLabel: 'Stable', riskBand: 'Low', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
];

export const COMPLIANCE_READINESS_BARS: EnterpriseBarDatum[] = [
  { name: 'RBI Cyber Security', value: 91, target: 95, trend: 'up', trendDelta: 2, trendLabel: '+2%', riskBand: 'Low', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
  { name: 'PCI-DSS 4.0', value: 84, target: 92, trend: 'up', trendDelta: 3, trendLabel: '+3%', riskBand: 'Medium', openReviewItems: 4, lastUpdated: '11 Jul 2026' },
  { name: 'ISO 27001', value: 88, target: 93, trend: 'stable', trendDelta: 0, trendLabel: 'Stable', riskBand: 'Low', openReviewItems: 1, lastUpdated: '11 Jul 2026' },
  { name: 'RBI IT Governance', value: 76, target: 90, trend: 'up', trendDelta: 4, trendLabel: '+4%', riskBand: 'Medium', openReviewItems: 5, lastUpdated: '11 Jul 2026' },
  { name: 'DPDP Act Controls', value: 67, target: 85, trend: 'up', trendDelta: 5, trendLabel: '+5%', riskBand: 'High', openReviewItems: 6, lastUpdated: '11 Jul 2026' },
  { name: 'SOX ITGC', value: 82, target: 90, trend: 'down', trendDelta: -1, trendLabel: '-1%', riskBand: 'Medium', openReviewItems: 3, lastUpdated: '11 Jul 2026' },
];

export const AI_OVERSIGHT_CONTROL_COVERAGE: EnterpriseBarDatum[] = [
  { name: 'Model Governance', value: 86, target: 90, trend: 'up', trendDelta: 4, trendLabel: '+4%', riskBand: 'Medium', openReviewItems: 3, lastUpdated: '11 Jul 2026' },
  { name: 'Prompt Safety', value: 78, target: 88, trend: 'up', trendDelta: 6, trendLabel: '+6%', riskBand: 'Medium', openReviewItems: 4, lastUpdated: '11 Jul 2026' },
  { name: 'Bias & Fairness', value: 71, target: 85, trend: 'up', trendDelta: 3, trendLabel: '+3%', riskBand: 'High', openReviewItems: 5, lastUpdated: '11 Jul 2026' },
  { name: 'Human Oversight', value: 92, target: 95, trend: 'stable', trendDelta: 0, trendLabel: 'Stable', riskBand: 'Low', openReviewItems: 1, lastUpdated: '11 Jul 2026' },
  { name: 'Data Lineage', value: 64, target: 85, trend: 'up', trendDelta: 5, trendLabel: '+5%', riskBand: 'High', openReviewItems: 6, lastUpdated: '11 Jul 2026' },
  { name: 'Audit Trail', value: 89, target: 92, trend: 'up', trendDelta: 2, trendLabel: '+2%', riskBand: 'Low', openReviewItems: 2, lastUpdated: '11 Jul 2026' },
];
