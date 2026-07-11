import { describe, expect, it } from 'vitest';
import {
  ARCHITECTURE_DOMAIN_MATURITY,
  COMPLIANCE_READINESS_BARS,
  AI_OVERSIGHT_CONTROL_COVERAGE,
  architectureDomainMaturityChart,
} from './deterministicChartBenchmarks';
import {
  ECS_EVIDENCE_PROVIDER,
  EVIDENCE_COLLECTION_SUMMARY,
  EVIDENCE_SOURCES,
  buildEvidencePackageBody,
} from './enterpriseEvidenceHubData';

describe('deterministicChartBenchmarks', () => {
  it('architecture domain maturity has varied stable scores', () => {
    const values = ARCHITECTURE_DOMAIN_MATURITY.map((d) => d.currentScore);
    expect(new Set(values).size).toBeGreaterThan(4);
    expect(values).toContain(68);
    expect(values).toContain(52);
    expect(values).toContain(88);
  });

  it('chart data includes target, trend and risk band metadata', () => {
    const chart = architectureDomainMaturityChart();
    const app = chart.find((d) => d.name === 'Application Architecture');
    expect(app?.value).toBe(74);
    expect(app?.target).toBe(85);
    expect(app?.trendLabel).toBe('+6%');
    expect(app?.riskBand).toBe('Medium');
    expect(app?.openReviewItems).toBe(3);
  });

  it('compliance and AI oversight bars are not identical', () => {
    const complianceValues = COMPLIANCE_READINESS_BARS.map((d) => d.value).join(',');
    const aiValues = AI_OVERSIGHT_CONTROL_COVERAGE.map((d) => d.value).join(',');
    expect(complianceValues).not.toEqual(aiValues);
  });
});

describe('enterpriseEvidenceHubData', () => {
  it('defines ECS as external provider separate from ADIP consumer', () => {
    expect(ECS_EVIDENCE_PROVIDER.sourceOwnership).toBe('ECS');
    expect(ECS_EVIDENCE_PROVIDER.consumer).toContain('ADIP');
    expect(ECS_EVIDENCE_PROVIDER.provider).toBe('ECS');
  });

  it('lists deterministic per-source evidence counts', () => {
    const jira = EVIDENCE_SOURCES.find((s) => s.name === 'Jira');
    expect(jira?.counts.find((c) => c.label === 'User stories')?.count).toBe(14);
    const github = EVIDENCE_SOURCES.find((s) => s.name === 'GitHub');
    expect(github?.counts.find((c) => c.label === 'Commits')?.count).toBe(83);
    const control = EVIDENCE_SOURCES.find((s) => s.name === 'Control Register');
    expect(control?.counts.find((c) => c.label === 'Mapped controls')?.count).toBe(42);
  });

  it('builds package with direct and ECS-reused sections', () => {
    const body = buildEvidencePackageBody(EVIDENCE_COLLECTION_SUMMARY);
    expect(body).toContain('Directly Collected Evidence');
    expect(body).toContain('ECS-Reused Evidence');
    expect(body).toContain('126');
    expect(body).toContain('ServiceNow change evidence');
  });
});
