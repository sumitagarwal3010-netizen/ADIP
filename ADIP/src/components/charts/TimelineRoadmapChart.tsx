import { Box, Typography, Tooltip } from '@mui/material';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';

interface TimelinePoint {
  name: string;
  value: number;
}

interface TimelineRoadmapChartProps {
  data: TimelinePoint[];
  height?: number;
  barColor?: string;
  chartId?: string;
  target?: number;
}

/**
 * Year-over-year roadmap as a connected timeline with value nodes —
 * makes regressions and jumps obvious (unlike equal-width bars).
 */
export function TimelineRoadmapChart({
  data,
  height = 180,
  barColor = colors.success,
  chartId,
  target = 80,
}: TimelineRoadmapChartProps) {
  const { openKpiDrilldown } = useSimulation();
  const values = data.map((d) => d.value);
  const minV = Math.min(...values, target) - 10;
  const maxV = Math.max(...values, target) + 10;
  const lo = Math.max(0, Math.floor(minV));
  const hi = Math.min(100, Math.ceil(maxV));
  const span = Math.max(1, hi - lo);

  const yFor = (v: number) => {
    const plotH = height - 48;
    return 16 + plotH * (1 - (v - lo) / span);
  };

  return (
    <Box sx={{ height, position: 'relative' }}>
      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted, mb: 0.5, display: 'block' }}>
        Timeline scale {lo}–{hi}% · Target {target}%
      </Typography>
      <Box sx={{ position: 'relative', height: height - 28, mx: 0.5 }}>
        {/* Target line */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: yFor(target),
            borderTop: `1px dashed ${colors.text.muted}`,
            zIndex: 1,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            right: 0,
            top: yFor(target) - 12,
            fontSize: '0.55rem',
            color: colors.text.muted,
          }}
        >
          Target {target}%
        </Typography>

        {/* Connecting path */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke={barColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.85}
            points={data
              .map((d, i) => {
                const x = ((i + 0.5) / data.length) * 100;
                return `${x}%,${yFor(d.value)}`;
              })
              .join(' ')}
          />
        </svg>

        {data.map((d, i) => {
          const xPct = ((i + 0.5) / data.length) * 100;
          const y = yFor(d.value);
          const prev = i > 0 ? data[i - 1].value : d.value;
          const delta = d.value - prev;
          const isLow = d.value === Math.min(...values);
          const isHigh = d.value === Math.max(...values);
          return (
            <Tooltip
              key={d.name}
              title={`${d.name}: ${d.value}%${i > 0 ? ` (${delta >= 0 ? '+' : ''}${delta} vs prior)` : ''}`}
            >
              <Box
                role={chartId ? 'button' : undefined}
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
                sx={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  cursor: chartId ? 'pointer' : 'default',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: isHigh ? colors.success : isLow ? colors.warning : barColor,
                    border: `2px solid ${colors.bg.secondary}`,
                    boxShadow: isHigh ? `0 0 10px ${colors.success}` : isLow ? `0 0 8px ${colors.warning}` : 'none',
                    mx: 'auto',
                    mb: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, color: colors.text.primary, display: 'block' }}>
                  {d.value}%
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted, display: 'block' }}>
                  {d.name}
                </Typography>
                {i > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.55rem',
                      color: delta > 0 ? colors.success : delta < 0 ? colors.critical : colors.text.muted,
                    }}
                  >
                    {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '→'}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
