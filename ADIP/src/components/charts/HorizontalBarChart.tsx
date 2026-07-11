import { EnterpriseBarChart } from './EnterpriseBarChart';
import { colors } from '../../theme/colors';

interface HorizontalBarChartProps {
  data: { name: string; value: number; target?: number; previous?: number }[];
  height?: number;
  barColor?: string;
  chartId?: string;
  /** Override value suffix. Auto-detects counts when max > 100. */
  suffix?: string;
  showTarget?: boolean;
  defaultTarget?: number;
  dynamicScale?: boolean;
}

/**
 * Compatibility wrapper — all HorizontalBarChart call sites now render
 * EnterpriseBarChart (labels, dynamic scale, targets, trends, outliers).
 */
export function HorizontalBarChart({
  data,
  height = 160,
  barColor = colors.primary,
  chartId,
  suffix,
  showTarget,
  defaultTarget,
  dynamicScale = true,
}: HorizontalBarChartProps) {
  const maxVal = data.reduce((m, d) => Math.max(m, d.value), 0);
  const resolvedSuffix = suffix ?? (maxVal > 100 ? '' : '%');
  // Counts / ₹M charts: no % target line unless caller opts in.
  const resolvedShowTarget = showTarget ?? resolvedSuffix === '%';

  return (
    <EnterpriseBarChart
      data={data}
      height={height}
      barColor={barColor}
      chartId={chartId}
      suffix={resolvedSuffix}
      showTarget={resolvedShowTarget}
      defaultTarget={defaultTarget ?? 80}
      dynamicScale={dynamicScale}
      showLabels
      showTrend={resolvedSuffix === '%'}
      highlightOutliers
    />
  );
}
