import { Box, Typography, Tooltip as MuiTooltip } from '@mui/material';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';
import { formatTrend, profileForValue, type TrendDirection } from '../../data/enterpriseTelemetry';

export interface EnterpriseBarDatum {
  name: string;
  value: number;
  target?: number;
  previous?: number;
  trend?: TrendDirection;
  trendDelta?: number;
  trendLabel?: string;
}

export interface EnterpriseBarChartProps {
  data: EnterpriseBarDatum[];
  height?: number;
  barColor?: string;
  chartId?: string;
  /** Show numeric value labels (default true). */
  showLabels?: boolean;
  /** Show target marker + gap (default true when target present or defaultTarget set). */
  showTarget?: boolean;
  /** Default target applied to all rows when row.target is omitted. */
  defaultTarget?: number;
  /** Show ▲/▼/→ trend (default true). */
  showTrend?: boolean;
  /** Highlight highest / lowest bars (default true). */
  highlightOutliers?: boolean;
  /** Use series-relative domain instead of 0–100 (default true for % charts). */
  dynamicScale?: boolean;
  /** Force domain when dynamicScale is false. */
  domain?: [number, number];
  /** Value suffix for labels (default '%'). Use '' for absolute counts/₹M. */
  suffix?: string;
  /** Compact row height for dense catalogs. */
  dense?: boolean;
}

function resolveTrend(d: EnterpriseBarDatum): { trend: TrendDirection; trendDelta: number; trendLabel: string } {
  if (d.trendLabel && d.trend) {
    return { trend: d.trend, trendDelta: d.trendDelta ?? 0, trendLabel: d.trendLabel };
  }
  if (typeof d.previous === 'number') {
    return formatTrend(d.value - d.previous);
  }
  // Deterministic pseudo-trend from name+value so charts stay stable across renders.
  let h = 0;
  const key = `${d.name}:${d.value}`;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const delta = ((h % 17) - 8);
  return formatTrend(delta);
}

function computeDomain(
  values: number[],
  dynamicScale: boolean,
  domain?: [number, number],
  suffix = '%',
): [number, number] {
  if (domain) return domain;
  const maxRaw = values.length ? Math.max(...values) : 100;
  const isPercentLike = suffix === '%' && maxRaw <= 100;
  if (!dynamicScale || values.length === 0) {
    return [0, isPercentLike ? 100 : Math.ceil(maxRaw * 1.15) || 100];
  }
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  if (minV === maxV) {
    const pad = Math.max(10, Math.abs(minV) * 0.2);
    return [Math.max(0, minV - pad), maxV + pad];
  }
  const pad = Math.max(isPercentLike ? 8 : (maxV - minV) * 0.12, (maxV - minV) * 0.18);
  let lo = Math.floor(minV - pad);
  let hi = Math.ceil(maxV + pad);
  if (lo < 0) lo = 0;
  if (isPercentLike) hi = Math.min(100, hi);
  // Ensure enough spread so close values (89 vs 81) stay visually distinct.
  const minSpan = isPercentLike ? 40 : Math.max(20, (maxV - minV) * 1.6);
  if (hi - lo < minSpan) {
    const mid = (hi + lo) / 2;
    lo = Math.max(0, Math.floor(mid - minSpan / 2));
    hi = Math.ceil(lo + minSpan);
    if (isPercentLike) hi = Math.min(100, hi);
  }
  return [lo, hi];
}

function pctOfDomain(value: number, lo: number, hi: number): number {
  if (hi <= lo) return 0;
  return Math.max(0, Math.min(100, ((value - lo) / (hi - lo)) * 100));
}

/**
 * Executive telemetry bar chart — labels, targets, trends, outliers, dynamic scale.
 * Drop-in upgrade over plain HorizontalBarChart rendering.
 */
export function EnterpriseBarChart({
  data,
  height,
  barColor = colors.primary,
  chartId,
  showLabels = true,
  showTarget = true,
  defaultTarget = 80,
  showTrend = true,
  highlightOutliers = true,
  dynamicScale = true,
  domain,
  suffix = '%',
  dense = false,
}: EnterpriseBarChartProps) {
  const { openKpiDrilldown } = useSimulation();
  const values = data.map((d) => d.value);
  const [lo, hi] = computeDomain(values, dynamicScale, domain, suffix);
  const maxIdx = values.length ? values.indexOf(Math.max(...values)) : -1;
  const minIdx = values.length ? values.indexOf(Math.min(...values)) : -1;

  const rowH = dense ? 28 : 36;
  const barH = dense ? 10 : 12;
  const computedHeight = height ?? Math.max(120, data.length * rowH + 28);

  const handleClick = (d: EnterpriseBarDatum) => {
    if (!chartId) return;
    openKpiDrilldown({
      chartId,
      segment: d.name,
      label: d.name,
      value: d.value,
      suffix: suffix || '%',
    });
  };

  return (
    <Box sx={{ height: computedHeight, overflow: 'hidden', cursor: chartId ? 'pointer' : 'default' }}>
      {/* Scale legend */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, px: 0.5 }}>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>
          Scale {lo}–{hi}{suffix}
        </Typography>
        {showTarget && (
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>
            Target {defaultTarget}{suffix}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: dense ? 0.75 : 1.1 }}>
        {data.map((d, i) => {
          const target = d.target ?? (showTarget ? defaultTarget : undefined);
          const widthPct = pctOfDomain(d.value, lo, hi);
          const targetPct = target != null ? pctOfDomain(target, lo, hi) : null;
          const trend = resolveTrend(d);
          const isHigh = highlightOutliers && i === maxIdx;
          const isLow = highlightOutliers && i === minIdx && maxIdx !== minIdx;
          const gap = target != null ? d.value - target : null;
          const fill = isHigh ? colors.success : isLow ? colors.warning : barColor;
          const profile = profileForValue(d.value);

          const tip = [
            `${d.name}: ${d.value}${suffix}`,
            target != null ? `Target: ${target}${suffix}` : null,
            gap != null ? `Gap: ${gap >= 0 ? '+' : ''}${gap}${suffix}` : null,
            d.previous != null ? `Previous: ${d.previous}${suffix}` : null,
            `Trend: ${trend.trendLabel}`,
            `Band: ${profile}`,
          ]
            .filter(Boolean)
            .join('\n');

          return (
            <MuiTooltip
              key={d.name}
              title={<Box sx={{ whiteSpace: 'pre-line', fontSize: 11 }}>{tip}</Box>}
              arrow
              placement="left"
            >
              <Box
                role={chartId ? 'button' : undefined}
                tabIndex={chartId ? 0 : undefined}
                onClick={() => handleClick(d)}
                onKeyDown={(e) => {
                  if (chartId && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleClick(d);
                  }
                }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '108px 1fr auto',
                  alignItems: 'center',
                  gap: 1,
                  minHeight: rowH,
                  '&:focus-visible': chartId ? { outline: `2px solid ${colors.primary}` } : {},
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    color: colors.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: isHigh || isLow ? 700 : 500,
                  }}
                  title={d.name}
                >
                  {d.name}
                </Typography>

                <Box sx={{ position: 'relative', height: barH + 8, display: 'flex', alignItems: 'center' }}>
                  {/* Track */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: '50% 0 auto 0',
                      transform: 'translateY(-50%)',
                      height: barH,
                      borderRadius: 1,
                      bgcolor: 'rgba(148, 163, 184, 0.12)',
                      border: `1px solid ${colors.border.subtle}`,
                    }}
                  />
                  {/* Value bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: `${widthPct}%`,
                      height: barH,
                      borderRadius: 1,
                      bgcolor: fill,
                      opacity: 0.9,
                      boxShadow: isHigh
                        ? `0 0 10px ${colors.success}88`
                        : isLow
                          ? `0 0 0 1px ${colors.warning}`
                          : 'none',
                      border: isHigh
                        ? `1px solid ${colors.success}`
                        : isLow
                          ? `1px solid ${colors.warning}`
                          : 'none',
                      transition: 'width 0.35s ease',
                    }}
                  />
                  {/* Target marker */}
                  {targetPct != null && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${targetPct}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: colors.text.muted,
                        opacity: 0.85,
                        zIndex: 2,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -3,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: colors.text.muted,
                        },
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 88, justifyContent: 'flex-end' }}>
                  {showLabels && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: colors.text.primary,
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 36,
                        textAlign: 'right',
                      }}
                    >
                      {Math.round(d.value)}
                      {suffix}
                    </Typography>
                  )}
                  {showTrend && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color:
                          trend.trend === 'up'
                            ? colors.success
                            : trend.trend === 'down'
                              ? colors.critical
                              : colors.text.muted,
                        minWidth: 44,
                      }}
                    >
                      {trend.trendLabel}
                    </Typography>
                  )}
                </Box>
              </Box>
            </MuiTooltip>
          );
        })}
      </Box>
    </Box>
  );
}
