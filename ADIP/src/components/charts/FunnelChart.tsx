import { Box, Typography, Tooltip } from '@mui/material';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';

interface FunnelDatum {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelDatum[];
  height?: number;
  barColor?: string;
  chartId?: string;
}

/**
 * Demand / pipeline funnel — stage widths proportional to counts,
 * with conversion % between stages.
 */
export function FunnelChart({
  data,
  height = 220,
  barColor = colors.secondary,
  chartId,
}: FunnelChartProps) {
  const { openKpiDrilldown } = useSimulation();
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const rowH = Math.max(28, (height - 20) / Math.max(data.length, 1));

  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column', gap: 0.75, justifyContent: 'center' }}>
      {data.map((d, i) => {
        const widthPct = 35 + (d.value / maxV) * 65;
        const prev = i > 0 ? data[i - 1].value : null;
        const conv = prev && prev > 0 ? Math.round((d.value / prev) * 100) : null;
        const isHigh = d.value === maxV;
        const isLow = d.value === Math.min(...data.map((x) => x.value));

        return (
          <Tooltip
            key={d.name}
            title={`${d.name}: ${d.value}${conv != null ? ` · ${conv}% of prior stage` : ''}`}
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
                        suffix: '',
                      })
                  : undefined
              }
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: chartId ? 'pointer' : 'default',
                minHeight: rowH,
              }}
            >
              <Box
                sx={{
                  width: `${widthPct}%`,
                  height: Math.min(22, rowH - 10),
                  borderRadius: 1,
                  bgcolor: isHigh ? colors.success : isLow ? colors.warning : barColor,
                  opacity: 0.88,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.25,
                  boxShadow: isHigh ? `0 0 10px ${colors.success}66` : undefined,
                  border: isLow ? `1px solid ${colors.warning}` : 'none',
                  transition: 'width 0.3s ease',
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: colors.text.primary, textTransform: 'capitalize' }}>
                  {d.name.replace(/-/g, ' ')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, color: colors.text.primary }}>
                  {d.value}
                  {conv != null && (
                    <Box component="span" sx={{ ml: 0.75, fontSize: '0.55rem', color: colors.text.muted, fontWeight: 500 }}>
                      {conv}%↓
                    </Box>
                  )}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
