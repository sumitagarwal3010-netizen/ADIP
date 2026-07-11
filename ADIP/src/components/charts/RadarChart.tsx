import { Box, Typography, Tooltip } from '@mui/material';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';

interface RadarDatum {
  name: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDatum[];
  height?: number;
  barColor?: string;
  chartId?: string;
  target?: number;
}

/**
 * Lightweight SVG radar for portfolio / strategic alignment.
 */
export function RadarChart({
  data,
  height = 240,
  barColor = colors.success,
  chartId,
  target = 80,
}: RadarChartProps) {
  const { openKpiDrilldown } = useSimulation();
  const n = data.length || 1;
  const cx = 140;
  const cy = height / 2;
  const r = Math.min(100, height / 2 - 36);

  const point = (i: number, value: number) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const rr = (Math.max(0, Math.min(100, value)) / 100) * r;
    return { x: cx + rr * Math.cos(angle), y: cy + rr * Math.sin(angle) };
  };

  const ring = (pct: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = point(i, pct);
      return `${p.x},${p.y}`;
    }).join(' ');

  const poly = data.map((d, i) => {
    const p = point(i, d.value);
    return `${p.x},${p.y}`;
  }).join(' ');

  const targetPoly = ring(target);
  const maxIdx = data.reduce((mi, d, i, arr) => (d.value > arr[mi].value ? i : mi), 0);
  const minIdx = data.reduce((mi, d, i, arr) => (d.value < arr[mi].value ? i : mi), 0);

  return (
    <Box sx={{ height, display: 'flex', justifyContent: 'center', position: 'relative' }}>
      <svg width={280} height={height} viewBox={`0 0 280 ${height}`}>
        {[25, 50, 75, 100].map((pct) => (
          <polygon
            key={pct}
            points={ring(pct)}
            fill="none"
            stroke={colors.border.subtle}
            strokeWidth={1}
          />
        ))}
        <polygon points={targetPoly} fill="none" stroke={colors.text.muted} strokeWidth={1.5} strokeDasharray="4 3" />
        <polygon points={poly} fill={`${barColor}33`} stroke={barColor} strokeWidth={2} />
        {data.map((d, i) => {
          const p = point(i, d.value);
          const labelR = r + 18;
          const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const isHigh = i === maxIdx;
          const isLow = i === minIdx;
          return (
            <g
              key={d.name}
              style={{ cursor: chartId ? 'pointer' : 'default' }}
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
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHigh || isLow ? 5 : 3.5}
                fill={isHigh ? colors.success : isLow ? colors.warning : barColor}
                stroke={colors.bg.secondary}
                strokeWidth={1}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colors.text.secondary}
                fontSize={9}
              >
                {d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name}
              </text>
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fill={colors.text.primary}
                fontSize={10}
                fontWeight={700}
              >
                {d.value}%
              </text>
            </g>
          );
        })}
      </svg>
      <Box sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {data.map((d) => (
          <Typography key={d.name}>{d.name}: {d.value}%</Typography>
        ))}
      </Box>
    </Box>
  );
}
