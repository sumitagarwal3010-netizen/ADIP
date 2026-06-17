import { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PaidIcon from '@mui/icons-material/Paid';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import {
  CopilotSection,
  type CopilotFinding,
  type CopilotRecommendation,
  type CopilotSuggestedAction,
} from '../copilot/CopilotSection';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import type { PortfolioProject } from '../../types/portfolioGovernance';
import { colors } from '../../theme/colors';

type AdvisoryBucket = 'accelerate' | 'stop' | 'fund' | 'at-risk';

interface AdvisoryItem {
  project: PortfolioProject;
  reasons: string[];
  /** Annualized business impact in INR — used to size the recommendation. */
  businessImpact: number;
  impactLabel: string;
}

const BUCKET_META: Record<
  AdvisoryBucket,
  { title: string; subtitle: string; icon: typeof RocketLaunchIcon; color: string }
> = {
  accelerate: {
    title: 'Projects to Accelerate',
    subtitle: 'High delivery confidence, strong alignment, and material upside benefits.',
    icon: RocketLaunchIcon,
    color: colors.success,
  },
  stop: {
    title: 'Projects to Stop',
    subtitle: 'Kill candidates: low realization, low confidence, or eclipsed by a better initiative.',
    icon: StopCircleIcon,
    color: colors.critical,
  },
  fund: {
    title: 'Projects Needing Funding',
    subtitle: 'Approved or in-flight projects whose funding gap is constraining delivery.',
    icon: PaidIcon,
    color: colors.primary,
  },
  'at-risk': {
    title: 'Projects with Delivery Risk',
    subtitle: 'AI-flagged delivery risk: confidence, schedule, or risk-level breaching tolerance.',
    icon: WarningAmberIcon,
    color: colors.warning,
  },
};

function formatCurrency(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(1)} Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)} L`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Pure, deterministic advisory engine over the existing portfolio mock data.
 * No new infrastructure — we simply derive AI recommendations from project
 * status, delivery confidence, prioritization, benefits realized vs forecast
 * and funding ratio.
 */
function classifyProjects(projects: PortfolioProject[]): Record<AdvisoryBucket, AdvisoryItem[]> {
  const buckets: Record<AdvisoryBucket, AdvisoryItem[]> = {
    accelerate: [],
    stop: [],
    fund: [],
    'at-risk': [],
  };

  for (const p of projects) {
    const realizationPct = p.benefitsForecast > 0 ? Math.round((p.benefitsRealized / p.benefitsForecast) * 100) : 0;
    const fundingGap = Math.max(0, p.benefitsForecast * 0.55 - p.fundingApproved);

    if (p.status === 'kill-candidate') {
      buckets.stop.push({
        project: p,
        reasons: [
          `Realization at ${realizationPct}% of forecast — well below the 35% kill threshold.`,
          `Delivery confidence ${p.deliveryConfidence}% (target ≥ 70%).`,
          `Marked kill-candidate by portfolio governance review.`,
        ],
        businessImpact: Math.max(0, p.benefitsForecast - p.benefitsRealized),
        impactLabel: `${formatCurrency(p.benefitsForecast - p.benefitsRealized)} forecast at risk · stopping releases capacity`,
      });
      continue;
    }

    if (p.status === 'at-risk' || (p.deliveryConfidence < 65 && p.riskLevel !== 'low')) {
      buckets['at-risk'].push({
        project: p,
        reasons: [
          `Delivery confidence ${p.deliveryConfidence}% (below 65% AI threshold).`,
          `Risk level: ${p.riskLevel.toUpperCase()}.`,
          `Realization ${realizationPct}% vs ${formatCurrency(p.benefitsForecast)} forecast.`,
        ],
        businessImpact: Math.round(p.benefitsForecast * 0.4),
        impactLabel: `${formatCurrency(p.benefitsForecast * 0.4)} benefit at risk · slip cost ~${formatCurrency(p.benefitsForecast * 0.08)}/month`,
      });
      continue;
    }

    if (
      (p.status === 'planned' || p.status === 'on-hold') &&
      p.prioritizationScore >= 75 &&
      fundingGap > 0
    ) {
      buckets.fund.push({
        project: p,
        reasons: [
          `Prioritization score ${p.prioritizationScore}/100 — top quartile.`,
          `Funding gap of ${formatCurrency(fundingGap)} blocking start/continuation.`,
          `Status: ${p.status.toUpperCase()} · benefits forecast ${formatCurrency(p.benefitsForecast)}.`,
        ],
        businessImpact: p.benefitsForecast,
        impactLabel: `${formatCurrency(p.benefitsForecast)} benefit unlocked · funding ask ${formatCurrency(fundingGap)}`,
      });
      continue;
    }

    if (
      p.status === 'active' &&
      p.deliveryConfidence >= 80 &&
      p.prioritizationScore >= 75 &&
      p.benefitsForecast >= 800_000
    ) {
      buckets.accelerate.push({
        project: p,
        reasons: [
          `Delivery confidence ${p.deliveryConfidence}% — top decile.`,
          `Prioritization ${p.prioritizationScore}/100 with strong strategic alignment.`,
          `Benefit forecast ${formatCurrency(p.benefitsForecast)} · realization tracking ${realizationPct}%.`,
        ],
        businessImpact: Math.round(p.benefitsForecast * 0.25),
        impactLabel: `+${formatCurrency(p.benefitsForecast * 0.25)} early benefit · ROI accelerated by ~3 months`,
      });
    }
  }

  for (const key of Object.keys(buckets) as AdvisoryBucket[]) {
    buckets[key].sort((a, b) => b.businessImpact - a.businessImpact);
    buckets[key] = buckets[key].slice(0, 6);
  }
  return buckets;
}

function AdvisoryBucketCard({
  bucket,
  items,
}: {
  bucket: AdvisoryBucket;
  items: AdvisoryItem[];
}) {
  const meta = BUCKET_META[bucket];
  const Icon = meta.icon;
  const totalImpact = items.reduce((sum, i) => sum + i.businessImpact, 0);

  return (
    <GlassCard sx={{ p: 2 }} hover={false}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Icon sx={{ fontSize: 18, color: meta.color }} />
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{meta.title}</Typography>
        <Chip
          label={items.length}
          size="small"
          sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${meta.color}1f`, color: meta.color }}
        />
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={`${formatCurrency(totalImpact)} business impact`}
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)', color: colors.text.secondary }}
          />
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.62rem', color: colors.text.muted, mb: 1 }}>{meta.subtitle}</Typography>

      {items.length === 0 && (
        <Typography sx={{ fontSize: '0.7rem', color: colors.text.muted, py: 1 }}>
          No projects currently match this AI bucket.
        </Typography>
      )}

      {items.map((item) => (
        <Box key={item.project.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
            <Chip
              label={item.project.id}
              size="small"
              sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.05)' }}
            />
            <Chip
              label={item.project.status.toUpperCase()}
              size="small"
              sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${meta.color}26`, color: meta.color }}
            />
            <Chip
              label={`Confidence ${item.project.deliveryConfidence}%`}
              size="small"
              sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.04)', color: colors.text.secondary }}
            />
            <Chip
              label={item.project.riskLevel.toUpperCase()}
              size="small"
              sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.04)', color: colors.text.secondary }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700 }}>{item.project.name}</Typography>
          {item.reasons.map((r) => (
            <Typography
              key={r}
              sx={{ fontSize: '0.64rem', color: colors.text.secondary, lineHeight: 1.45 }}
            >
              · {r}
            </Typography>
          ))}
          <Typography sx={{ fontSize: '0.64rem', color: meta.color, fontWeight: 600, mt: 0.25 }}>
            Business impact · {item.impactLabel}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function AiPortfolioAdvisorPanel() {
  const { projects, kpis } = usePortfolioGovernance();

  const advisory = useMemo(() => classifyProjects(projects), [projects]);

  const findings: CopilotFinding[] = useMemo(() => {
    const out: CopilotFinding[] = [];
    for (const item of advisory.stop) {
      out.push({
        id: `find-stop-${item.project.id}`,
        badge: `Stop · ${item.project.id}`,
        severity: 'high',
        title: `${item.project.name} is a kill candidate`,
        detail: item.reasons.join(' '),
      });
    }
    for (const item of advisory['at-risk']) {
      out.push({
        id: `find-risk-${item.project.id}`,
        badge: `At Risk · ${item.project.id}`,
        severity: 'medium',
        title: `${item.project.name} delivery confidence ${item.project.deliveryConfidence}%`,
        detail: item.reasons.join(' '),
      });
    }
    return out.slice(0, 8);
  }, [advisory]);

  const recommendations: CopilotRecommendation[] = useMemo(() => {
    const out: CopilotRecommendation[] = [];
    for (const item of advisory.accelerate.slice(0, 3)) {
      out.push({
        id: `rec-acc-${item.project.id}`,
        badge: `Accelerate · ${item.project.id}`,
        title: `Accelerate ${item.project.name} — pull in scope and resources`,
        rationale: `Top-decile delivery confidence with material benefits forecast.`,
        impact: item.impactLabel,
      });
    }
    for (const item of advisory.fund.slice(0, 3)) {
      out.push({
        id: `rec-fund-${item.project.id}`,
        badge: `Fund · ${item.project.id}`,
        title: `Fund ${item.project.name} — close the funding gap to start`,
        rationale: `High prioritization score with a clear funding gap blocking value capture.`,
        impact: item.impactLabel,
      });
    }
    for (const item of advisory.stop.slice(0, 3)) {
      out.push({
        id: `rec-stop-${item.project.id}`,
        badge: `Stop · ${item.project.id}`,
        title: `Stop ${item.project.name} — release capacity for higher-ROI work`,
        rationale: `Realization and delivery confidence both below kill thresholds.`,
        impact: item.impactLabel,
      });
    }
    for (const item of advisory['at-risk'].slice(0, 3)) {
      out.push({
        id: `rec-risk-${item.project.id}`,
        badge: `At Risk · ${item.project.id}`,
        title: `Intervene on ${item.project.name} — recovery plan or scope cut`,
        rationale: `Delivery confidence is below the 65% AI threshold with elevated risk.`,
        impact: item.impactLabel,
      });
    }
    return out;
  }, [advisory]);

  const accelerateImpact = advisory.accelerate.reduce((s, i) => s + i.businessImpact, 0);
  const stopImpact = advisory.stop.reduce((s, i) => s + i.businessImpact, 0);
  const fundImpact = advisory.fund.reduce((s, i) => s + i.businessImpact, 0);
  const riskImpact = advisory['at-risk'].reduce((s, i) => s + i.businessImpact, 0);

  const accelerateMemo = `# Accelerate Recommendations
${advisory.accelerate
  .map(
    (i) =>
      `${i.project.id}  ${i.project.name}\n  Confidence ${i.project.deliveryConfidence}% · Realization ${
        i.project.benefitsForecast > 0 ? Math.round((i.project.benefitsRealized / i.project.benefitsForecast) * 100) : 0
      }%\n  Impact: ${i.impactLabel}`,
  )
  .join('\n\n')}

Combined accelerated benefit: ${formatCurrency(accelerateImpact)}.`;

  const stopMemo = `# Kill / Stop Recommendations
${advisory.stop
  .map(
    (i) =>
      `${i.project.id}  ${i.project.name}\n  Confidence ${i.project.deliveryConfidence}% · Status ${i.project.status}\n  Impact: ${i.impactLabel}`,
  )
  .join('\n\n')}

Combined avoided spend / capacity released: ${formatCurrency(stopImpact)}.`;

  const fundMemo = `# Funding Recommendations
${advisory.fund
  .map(
    (i) =>
      `${i.project.id}  ${i.project.name}\n  Status ${i.project.status} · Prioritization ${i.project.prioritizationScore}/100\n  Impact: ${i.impactLabel}`,
  )
  .join('\n\n')}

Combined benefit unlocked: ${formatCurrency(fundImpact)}.`;

  const portfolioReview = `# AI Portfolio Review

Snapshot
  • Portfolio Health ............ ${kpis.portfolioHealth}%
  • Delivery Confidence ......... ${kpis.deliveryConfidence}%
  • Risk Exposure ............... ${kpis.riskExposure}%
  • Benefits Realization ........ ${kpis.benefitsRealization}%

AI Recommendations
  • Accelerate .... ${advisory.accelerate.length} projects · ${formatCurrency(accelerateImpact)} early benefit
  • Stop .......... ${advisory.stop.length} projects · ${formatCurrency(stopImpact)} avoided spend / capacity released
  • Fund .......... ${advisory.fund.length} projects · ${formatCurrency(fundImpact)} benefit unlocked
  • At Risk ....... ${advisory['at-risk'].length} projects · ${formatCurrency(riskImpact)} benefit at risk

Net AI-recommended portfolio impact: ${formatCurrency(accelerateImpact + stopImpact + fundImpact - riskImpact * 0.4)} this fiscal year.`;

  const suggestedActions: CopilotSuggestedAction[] = useMemo(() => {
    const out: CopilotSuggestedAction[] = [];
    advisory.stop.slice(0, 2).forEach((item, i) =>
      out.push({
        id: `act-stop-${i}`,
        priority: 'P1',
        owner: 'Steering Committee',
        label: `Decommission ${item.project.id} — ${item.project.name}`,
        detail: 'Adopt the AI Stop recommendation, reallocate capacity, communicate to stakeholders.',
      }),
    );
    advisory.fund.slice(0, 2).forEach((item, i) =>
      out.push({
        id: `act-fund-${i}`,
        priority: 'P1',
        owner: 'Investment Board',
        label: `Approve funding for ${item.project.id} — ${item.project.name}`,
        detail: 'High-prioritization project with a clear funding gap blocking benefit capture.',
      }),
    );
    advisory.accelerate.slice(0, 2).forEach((item, i) =>
      out.push({
        id: `act-acc-${i}`,
        priority: 'P2',
        owner: 'Portfolio Lead',
        label: `Accelerate ${item.project.id} — ${item.project.name}`,
        detail: 'Pull scope in by 1 sprint; assign supplemental resources from stop-list capacity.',
      }),
    );
    advisory['at-risk'].slice(0, 2).forEach((item, i) =>
      out.push({
        id: `act-risk-${i}`,
        priority: 'P2',
        owner: 'Delivery Director',
        label: `Recovery plan for ${item.project.id} — ${item.project.name}`,
        detail: 'Confidence below 65%; commission a recovery or scope-cut plan within the sprint.',
      }),
    );
    return out;
  }, [advisory]);

  const totalBucketed =
    advisory.accelerate.length + advisory.stop.length + advisory.fund.length + advisory['at-risk'].length;

  return (
    <Box>
      <CopilotSection
        title="AI Portfolio Advisor"
        analyzedSubtitle={`AI evaluated ${projects.length} active projects across health, delivery confidence, prioritization, funding gap and benefit realization, and produced four portfolio actions: accelerate, stop, fund and recovery for at-risk projects — each tied to a business impact.`}
        analyzedScope={[
          `${projects.length} projects analyzed`,
          `${totalBucketed} AI recommendations`,
          `Portfolio Health ${kpis.portfolioHealth}%`,
        ]}
        findingsTitle="Findings · Stop & At-Risk Projects"
        findings={findings}
        recommendationsTitle="AI Portfolio Recommendations"
        recommendations={recommendations}
        primarySlot={
          <GlassCard sx={{ p: 2 }} glow="purple" hover={false}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <AutoAwesomeIcon sx={{ color: colors.secondary, fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Decision Summary</Typography>
            </Box>
            {(['accelerate', 'fund', 'stop', 'at-risk'] as AdvisoryBucket[]).map((b) => {
              const meta = BUCKET_META[b];
              const Icon = meta.icon;
              const items = advisory[b];
              const total = items.reduce((s, i) => s + i.businessImpact, 0);
              return (
                <Box
                  key={b}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    py: 0.6,
                    px: 0.75,
                    mb: 0.5,
                    borderRadius: 1.5,
                    border: `1px solid ${meta.color}40`,
                    bgcolor: `${meta.color}0d`,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: meta.color }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: meta.color }}>
                      {meta.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, lineHeight: 1.3 }}>
                      {items.length} project{items.length === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: meta.color }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              );
            })}
            <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, mt: 1, lineHeight: 1.45 }}>
              Net AI-recommended portfolio impact this fiscal year:{' '}
              <strong style={{ color: colors.success }}>
                {formatCurrency(accelerateImpact + stopImpact + fundImpact - riskImpact * 0.4)}
              </strong>
            </Typography>
          </GlassCard>
        }
        generationActions={[
          {
            id: 'portfolio-review',
            label: 'Generate AI Portfolio Review',
            artifactName: 'AI_Portfolio_Review.md',
            icon: AssessmentIcon,
            generatedBy: 'Portfolio AI',
            preview: portfolioReview,
          },
          {
            id: 'fund-memo',
            label: 'Generate Funding Recommendation Memo',
            artifactName: 'Funding_Recommendation.md',
            icon: PaidIcon,
            generatedBy: 'Portfolio AI',
            preview: fundMemo,
          },
          {
            id: 'stop-memo',
            label: 'Generate Kill / Stop Memo',
            artifactName: 'Stop_Recommendations.md',
            icon: StopCircleIcon,
            generatedBy: 'Portfolio AI',
            preview: stopMemo,
          },
          {
            id: 'accelerate-memo',
            label: 'Generate Accelerate Memo',
            artifactName: 'Accelerate_Recommendations.md',
            icon: RocketLaunchIcon,
            generatedBy: 'Portfolio AI',
            preview: accelerateMemo,
          },
          {
            id: 'cab-pack',
            label: 'Generate Investment Board Pack',
            artifactName: 'Investment_Board_Pack.md',
            icon: GavelIcon,
            generatedBy: 'Portfolio AI',
            preview: portfolioReview,
          },
        ]}
        suggestedActions={suggestedActions}
        initialArtifacts={[
          {
            actionId: 'portfolio-review',
            artifactName: 'AI_Portfolio_Review.md',
            generatedAt: '08:55',
            generatedBy: 'Portfolio AI',
            preview: portfolioReview,
          },
        ]}
        secondaryKpis={[
          { label: 'Accelerate', value: advisory.accelerate.length },
          { label: 'Stop', value: advisory.stop.length },
          { label: 'Fund', value: advisory.fund.length },
          { label: 'At Risk', value: advisory['at-risk'].length },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 1.5,
          mt: 1.5,
        }}
      >
        <AdvisoryBucketCard bucket="accelerate" items={advisory.accelerate} />
        <AdvisoryBucketCard bucket="fund" items={advisory.fund} />
        <AdvisoryBucketCard bucket="stop" items={advisory.stop} />
        <AdvisoryBucketCard bucket="at-risk" items={advisory['at-risk']} />
      </Box>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader
          title="How the AI Advisor decides"
          subtitle="Deterministic rules over the existing portfolio mock data — no new infrastructure."
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.75 }}>
          {[
            { icon: RocketLaunchIcon, color: colors.success, label: 'Accelerate', rule: 'Active · confidence ≥ 80% · prioritization ≥ 75 · forecast ≥ ₹8L' },
            { icon: PaidIcon, color: colors.primary, label: 'Fund', rule: 'Planned/On-hold · prioritization ≥ 75 · funding gap > 0' },
            { icon: StopCircleIcon, color: colors.critical, label: 'Stop', rule: 'kill-candidate status · realization < 35% · low confidence' },
            { icon: WarningAmberIcon, color: colors.warning, label: 'At Risk', rule: 'at-risk status · or confidence < 65% with elevated risk level' },
          ].map((r) => {
            const Icon = r.icon;
            return (
              <Box
                key={r.label}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 0.5,
                  px: 1,
                  py: 0.6,
                  borderRadius: 1.5,
                  border: `1px solid ${r.color}33`,
                  bgcolor: `${r.color}0a`,
                  minWidth: 220,
                  flex: '1 1 220px',
                }}
              >
                <Icon sx={{ fontSize: 16, color: r.color, mt: 0.25 }} />
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: r.color }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: '0.62rem', color: colors.text.secondary, lineHeight: 1.4 }}>
                    {r.rule}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DescriptionIcon sx={{ fontSize: 12 }} />
          Every recommendation in this advisor is traceable back to portfolio mock data on the project record.
        </Typography>
      </GlassCard>
    </Box>
  );
}
