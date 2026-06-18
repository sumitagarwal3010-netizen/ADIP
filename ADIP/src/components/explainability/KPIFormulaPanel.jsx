/** Tab 1 — Formula: business meaning, formula expression, weightages and full calculation walkthrough. */
import { Box, Typography } from '@mui/material';
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

export function KPIFormulaPanel({ model }) {
  if (!model) return null;
  const { formula, calculations } = model;

  return (
    <Box>
      <SectionLabel>Business Meaning</SectionLabel>
      <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.6, color: colors.text.secondary }}>
        {model.description}
      </Typography>

      <SectionLabel>Formula</SectionLabel>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: colors.bg.glass,
          border: `1px solid ${colors.border.glow}`,
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          color: colors.text.primary,
          lineHeight: 1.6,
        }}
      >
        {formula.expression}
      </Box>

      {model.weightages && model.weightages.length > 0 && (
        <>
          <SectionLabel>Weightages</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {model.weightages.map((w) => (
              <Box key={w.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ width: 150, fontSize: '0.72rem', color: colors.text.secondary }}>
                  {w.name}
                </Typography>
                <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.bg.glass, overflow: 'hidden' }}>
                  <Box sx={{ width: `${w.weight}%`, height: '100%', bgcolor: colors.secondary, borderRadius: 3 }} />
                </Box>
                <Typography variant="caption" sx={{ width: 36, textAlign: 'right', fontWeight: 700, fontSize: '0.72rem' }}>
                  {w.weight}%
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {calculations && calculations.length > 0 && (
        <>
          <SectionLabel>Calculation Walkthrough</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {calculations.map((c) => (
              <Box
                key={c.component}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1,
                  bgcolor: colors.bg.glass,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.72rem', color: colors.text.secondary }}>
                  {c.component}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: colors.text.primary }}>
                  {c.expression}
                </Typography>
              </Box>
            ))}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                mt: 0.5,
                borderRadius: 1,
                bgcolor: `${colors.primary}14`,
                border: `1px solid ${colors.border.glow}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                Result
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.primary }}>
                {model.value}
                {model.suffix}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
