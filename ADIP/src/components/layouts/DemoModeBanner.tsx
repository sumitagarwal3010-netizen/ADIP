import { Box } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/theme';
import { DEMO_BANNER } from '../../config/demoMode';

/**
 * Fixed top banner indicating the platform runs in demo mode with
 * authentication disabled. Spans the full viewport width above all chrome.
 */
export function DemoModeBanner() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: layout.demoBannerHeight,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 2,
        background: `linear-gradient(90deg, ${colors.warning} 0%, ${colors.secondary} 100%)`,
        borderBottom: `1px solid ${colors.border.subtle}`,
        color: '#0B1020',
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.04em',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <ScienceIcon sx={{ fontSize: 15 }} />
        <Box component="span" sx={{ fontWeight: 800 }}>{DEMO_BANNER.title}</Box>
      </Box>
      {DEMO_BANNER.lines.map((line) => (
        <Box
          key={line}
          component="span"
          sx={{ display: { xs: 'none', sm: 'inline' }, opacity: 0.85, fontWeight: 600 }}
        >
          · {line}
        </Box>
      ))}
    </Box>
  );
}
