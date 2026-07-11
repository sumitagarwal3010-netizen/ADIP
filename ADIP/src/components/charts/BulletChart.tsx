import { Box, Typography, Tooltip } from '@mui/material';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';
import { formatTrend } from '../../data/enterpriseTelemetry';

interface BulletDatum {
  name: string;
  value: number;
  target?: number;
  max?: number;
}

interface BulletChartProps {
  data: BulletDatum[];
  height?: number;
  barColor?: string;
  chartId?: string;
  suffix?: string;
  defaultTarget?: number;
}

/**
 * Bullet chart — actual vs target on a comparative track.
 * Ideal for investment stance / efficiency views.
 */
export function BulletChart({
  data,
  height,
  barColor = colors.primary,
  chartId,
  suffix = '',
  defaultTarget,
}: BulletChartProps) {
  const { openKpiDrilldown } = useSimulation();
  const maxSeries = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0, d.max ?? 0)), 1);
  const rowH = 40;
  const computedH = height ?? data.length * rowH + 8;

  return (
    <Box sx={{ height: computedH }}>
      {data.map((d) => {
        const target = d.target ?? defaultTarget;
        const ceiling = d.max ?? Math.max(maxSeries * 1.1, (target ?? 0) * 1.2, d.value * 1.15);
        const valuePct = (d.value / ceiling) * 100;
        const targetPct = target != null ? (target / ceiling) * 100 : null;
        const gap = target != null ? d.value - target : null;
        const isHigh = d.value === Math.max(...data.map((x) => x.value));
        const isLow = d.value === Math.min(...data.map((x) => x.value));
        const trend = formatTrend(gap ?? ((d.name.length * 7) % 11) - 5);

        return (
          <Tooltip
            key={d.name}
            title={`${d.name}: ${d.value}${suffix}${target != null ? ` · Target ${target}${suffix}` : ''}${gap != null ? ` · Gap ${gap >= 0 ? '+' : ''}${gap}` : ''}`}
          >
            <Box
              onClick={
                chartId
                  ? () =>
                      openKpiDrilldown({
                        chartId,
                        segment: d.name,
                        label: d.name,
                        value: d.value,
                        suffix,
                      })
                  : undefined
              }
              sx={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                alignItems: 'center',
                gap: 1,
                mb: 1.25,
                cursor: chartId ? 'pointer' : 'default',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.text.secondary, textTransform: 'capitalize' }}>
                {d.name}
              </Typography>
              <Box sx={{ position: 'relative', height: 18 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: '4px 0',
                    borderRadius: 1,
                    bgcolor: 'rgba(148,163,184,0.14)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 5,
                    height: 8,
                    width: `${valuePct}%`,
                    borderRadius: 1,
                    bgcolor: isHigh ? colors.success : isLow ? colors.warning : barColor,
                    boxShadow: isHigh ? `0 0 8px ${colors.success}88` : undefined,
                  }}
                />
                {targetPct != null && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${targetPct}%`,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      bgcolor: colors.text.primary,
                      zIndex: 2,
                    }}
                  />
                )}
              </Box>
              <Box sx={{ textAlign: 'right', minWidth: 72 }}>
                <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 700, display: 'block' }}>
                  {Math.round(d.value)}
                  {suffix}
                </Typography>
                {target != null && (
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.text.muted, display: 'block' }}>
                    T {target}
                    {suffix} · {gap != null && gap >= 0 ? '+' : ''}
                    {gap}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.55rem',
                    color: trend.trend === 'up' ? colors.success : trend.trend === 'down' ? colors.critical : colors.text.muted,
                  }}
                >
                  {trend.trendLabel}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
