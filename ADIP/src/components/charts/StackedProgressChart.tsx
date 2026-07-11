import { Box, Typography, Tooltip, LinearProgress } from '@mui/material';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';
import { formatTrend } from '../../data/enterpriseTelemetry';

interface StackedProgressDatum {
  name: string;
  value: number;
}

interface StackedProgressChartProps {
  data: StackedProgressDatum[];
  height?: number;
  barColor?: string;
  chartId?: string;
  target?: number;
}

/**
 * Modernization-wave style stacked progress rows with clear % labels and gaps.
 */
export function StackedProgressChart({
  data,
  height,
  barColor = colors.info,
  chartId,
  target = 80,
}: StackedProgressChartProps) {
  const { openKpiDrilldown } = useSimulation();
  const maxIdx = data.reduce((mi, d, i, arr) => (d.value > arr[mi].value ? i : mi), 0);
  const minIdx = data.reduce((mi, d, i, arr) => (d.value < arr[mi].value ? i : mi), 0);
  const rowH = 44;
  const computedH = height ?? data.length * rowH;

  return (
    <Box sx={{ height: computedH, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {data.map((d, i) => {
        const isHigh = i === maxIdx;
        const isLow = i === minIdx && maxIdx !== minIdx;
        const gap = d.value - target;
        const trend = formatTrend(gap);
        const fill = isHigh ? colors.success : isLow ? colors.warning : barColor;

        return (
          <Tooltip
            key={d.name}
            title={`${d.name}: ${d.value}% · Target ${target}% · Gap ${gap >= 0 ? '+' : ''}${gap}%`}
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
                        suffix: '%',
                      })
                  : undefined
              }
              sx={{ cursor: chartId ? 'pointer' : 'default' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: isHigh || isLow ? 700 : 500, color: colors.text.secondary }}>
                  {d.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                    {d.value}%
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.58rem', color: colors.text.muted }}>
                    T {target}%
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.58rem',
                      color: trend.trend === 'up' ? colors.success : trend.trend === 'down' ? colors.critical : colors.text.muted,
                    }}
                  >
                    {trend.trendLabel}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(0, Math.min(100, d.value))}
                  sx={{
                    height: 10,
                    borderRadius: 1,
                    bgcolor: 'rgba(148,163,184,0.12)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: fill,
                      borderRadius: 1,
                      boxShadow: isHigh ? `0 0 8px ${colors.success}` : undefined,
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${target}%`,
                    top: -2,
                    bottom: -2,
                    width: 2,
                    bgcolor: colors.text.muted,
                  }}
                />
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
