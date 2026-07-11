import { Box } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, LabelList, Cell,
} from 'recharts';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';

interface BarSeries {
  dataKey: string;
  name: string;
  fill: string;
  barSize?: number;
  radius?: number | [number, number, number, number];
}

interface BarChartPanelProps {
  chartId: string;
  data: Record<string, string | number>[];
  categoryKey: string;
  series: BarSeries[];
  height?: number;
  layout?: 'vertical' | 'horizontal';
  showLegend?: boolean;
}

export function BarChartPanel({
  chartId,
  data,
  categoryKey,
  series,
  height = 200,
  layout = 'horizontal',
  showLegend = false,
}: BarChartPanelProps) {
  const { openKpiDrilldown } = useSimulation();
  const isVertical = layout === 'vertical';

  const numericKeys = series.map((s) => s.dataKey);
  const allVals = data.flatMap((row) => numericKeys.map((k) => Number(row[k]) || 0));
  const maxV = Math.max(...allVals, 1);
  const minV = Math.min(...allVals, 0);
  const pad = Math.max(4, (maxV - minV) * 0.15);
  const domainMax = Math.ceil(maxV + pad);
  const domainMin = Math.max(0, Math.floor(minV - pad));

  const handleBarClick = (barData: { payload?: Record<string, string | number> }, dataKey?: string) => {
    const payload = barData?.payload;
    if (!payload) return;
    const category = String(payload[categoryKey]);
    const segment = dataKey && series.length > 1 ? `${category}|${dataKey}` : category;
    const value = dataKey ? Number(payload[dataKey]) : Number(payload[series[0].dataKey]);
    const seriesName = dataKey ? series.find((s) => s.dataKey === dataKey)?.name : category;

    openKpiDrilldown({
      chartId,
      segment,
      label: series.length > 1 ? `${category} — ${seriesName}` : category,
      value,
      suffix: '',
    });
  };

  return (
    <Box sx={{ height, cursor: 'pointer' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={{ left: 0, right: 28, top: 8, bottom: 0 }}
          barCategoryGap="32%"
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} horizontal={!isVertical} vertical={isVertical} />
          {isVertical ? (
            <>
              <XAxis type="number" domain={[domainMin, domainMax]} tick={{ fill: colors.text.muted, fontSize: 11 }} />
              <YAxis type="category" dataKey={categoryKey} width={90} tick={{ fill: colors.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey={categoryKey} tick={{ fill: colors.text.muted, fontSize: 11 }} />
              <YAxis domain={[domainMin, domainMax]} tick={{ fill: colors.text.muted, fontSize: 11 }} />
            </>
          )}
          <Tooltip
            contentStyle={{ background: colors.bg.secondary, borderRadius: 8, fontSize: 12, border: `1px solid ${colors.border.subtle}` }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.fill}
              barSize={s.barSize ?? (isVertical ? 12 : 18)}
              radius={s.radius ?? (isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0])}
              onClick={(barData) => handleBarClick(barData, s.dataKey)}
            >
              <LabelList
                dataKey={s.dataKey}
                position={isVertical ? 'right' : 'top'}
                style={{ fill: colors.text.secondary, fontSize: 10, fontWeight: 600 }}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={s.fill} fillOpacity={0.9 - i * 0.04} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
