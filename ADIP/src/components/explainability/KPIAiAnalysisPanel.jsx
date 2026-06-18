/** Tab 4 — AI Analysis: why the score exists, confidence, risk drivers and generated insights. */
import { Box, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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

export function KPIAiAnalysisPanel({ model }) {
  if (!model) return null;
  const ai = model.aiReasoning || {};
  const confidence = typeof ai.confidence === 'number' ? ai.confidence : null;

  return (
    <Box>
      {confidence !== null && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.25,
            borderRadius: 1,
            bgcolor: `${colors.secondary}14`,
            border: `1px solid ${colors.border.purple}`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 20, color: colors.secondary }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Confidence
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.bg.primary, overflow: 'hidden' }}>
                <Box sx={{ width: `${confidence}%`, height: '100%', bgcolor: colors.secondary, borderRadius: 3 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.secondary }}>
                {confidence}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {ai.drivers && ai.drivers.length > 0 && (
        <>
          <SectionLabel>Why this score exists</SectionLabel>
          <Box component="ul" sx={{ m: 0, pl: 2, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {ai.drivers.map((d, i) => (
              <Typography key={i} component="li" variant="body2" sx={{ fontSize: '0.76rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                {d}
              </Typography>
            ))}
          </Box>
        </>
      )}

      {ai.insights && ai.insights.length > 0 && (
        <>
          <SectionLabel>Generated Insights</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {ai.insights.map((line, i) => (
              <Typography
                key={i}
                variant="body2"
                sx={{
                  fontSize: '0.76rem',
                  color: colors.text.secondary,
                  lineHeight: 1.5,
                  pl: 1,
                  borderLeft: `2px solid ${colors.border.purple}`,
                }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
