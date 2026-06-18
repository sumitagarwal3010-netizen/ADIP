import type { KeyboardEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { GlassCard } from './GlassCard';
import { colors } from '../../theme/colors';
import { useExplainability } from '../explainability/ExplainabilityProvider';
import { wouldDuplicateUnit } from '../../utils/formatMetric';

interface KpiCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  data?: { day: string; value: number }[];
  delay?: number;
  compact?: boolean;
  chartId?: string;
}

export function KpiCard({ label, value, suffix = '%', trend, data, delay = 0, compact, chartId }: KpiCardProps) {
  const { openExplainability } = useExplainability();
  const isPositive = trend !== undefined && trend >= 0;

  // Unit-safe: never render a duplicate/invalid unit (e.g. "90% %", "₹15.9M %",
  // "61/100 %", "75 risks %"). If the value already carries its unit, suppress
  // the appended suffix. This fixes malformed KPIs regardless of call site.
  const safeSuffix = suffix && !wouldDuplicateUnit(value, suffix) ? suffix : '';

  const handleClick = () => {
    openExplainability({ label, value, suffix, trend, data, chartId });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <GlassCard
      delay={delay}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`Click for details: ${label}`}
      aria-label={`${label}: ${value}${safeSuffix}. Click to open detailed drilldown.`}
      sx={{
        p: compact ? 1.5 : 2,
        minHeight: compact ? 90 : 110,
        cursor: 'pointer',
        '&:focus-visible': {
          outline: `2px solid ${colors.primary}`,
          outlineOffset: 2,
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
        <Typography variant={compact ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: colors.text.primary }}>
          {value}
        </Typography>
        {safeSuffix && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {safeSuffix}
          </Typography>
        )}
      </Box>
      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          {isPositive ? (
            <TrendingUp sx={{ fontSize: 14, color: colors.success }} />
          ) : (
            <TrendingDown sx={{ fontSize: 14, color: colors.critical }} />
          )}
          <Typography variant="caption" sx={{ color: isPositive ? colors.success : colors.critical, fontWeight: 600 }}>
            {isPositive ? '+' : ''}{trend}%
          </Typography>
        </Box>
      )}
      {data && (
        <Box sx={{ height: 36, mt: 0.5, mx: -0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.success} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={colors.success} strokeWidth={1.5} fill={`url(#grad-${label})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
      {!compact && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: colors.text.muted,
            fontSize: '0.65rem',
            opacity: 0.6,
            transition: 'opacity 200ms',
            '.MuiPaper-root:hover &': { opacity: 1, color: colors.primary },
          }}
        >
          View details →
        </Typography>
      )}
    </GlassCard>
  );
}
