/** Tab 6 — Trend: monthly/quarterly trajectory, target and forecast. */
import { Box, Typography } from '@mui/material';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { colors } from '../../theme/colors';

function SectionLabel({ children }) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        color: colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: '0.65rem',
        display: 'block',
        mb: 1,
        mt: 2,
      }}
    >
      {children}
    </Typography>
  );
}

export function KPITrendAnalysisPanel({ model }) {
  if (!model) return null;
  const trends = model.trends || {};
  const monthly = (trends.monthly || []).filter((p) => typeof p.value === 'number');

  return (
    <Box>
      <SectionLabel>Trend</SectionLabel>
      {monthly.length > 0 ? (
        <Box sx={{ height: 160, p: 1, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="kpi-explain-trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: colors.text.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.text.muted }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{
                  background: colors.bg.tertiary,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: colors.text.secondary }}
              />
              {typeof trends.target === 'number' && (
                <ReferenceLine
                  y={trends.target}
                  stroke={colors.success}
                  strokeDasharray="4 4"
                  label={{ value: `Target ${trends.target}`, fontSize: 10, fill: colors.success, position: 'insideTopRight' }}
                />
              )}
              <Area type="monotone" dataKey="value" stroke={colors.primary} strokeWidth={2} fill="url(#kpi-explain-trend)" dot={{ r: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>
          No trend series available for this metric.
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
        {typeof trends.target === 'number' && (
          <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted, textTransform: 'uppercase' }}>
              Target
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.success }}>
              {trends.target}
              {model.suffix}
            </Typography>
          </Box>
        )}
        {trends.forecast && typeof trends.forecast.value === 'number' && (
          <Box sx={{ flex: 1, p: 1, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted, textTransform: 'uppercase' }}>
              Forecast · {trends.forecast.horizon || 'Next period'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.primary }}>
              {trends.forecast.value}
              {model.suffix}
            </Typography>
          </Box>
        )}
      </Box>

      {trends.forecast && trends.forecast.note && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '0.66rem', color: colors.text.muted, fontStyle: 'italic' }}>
          {trends.forecast.note}
        </Typography>
      )}
    </Box>
  );
}
