import {
  Box, Typography, InputBase, Select, MenuItem, IconButton, Badge, Avatar, Chip, Tooltip, Button, ListSubheader,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/theme';
import { DOMAINS } from '../../services/mockDataEngine.js';
import { useSimulation } from '../../context/SimulationContext';
import { usePersona } from '../../context/PersonaContext';
import { PERSONAS, type PersonaId } from '../../config/personaConfig';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const {
    selectedDomain,
    setSelectedDomain,
    refreshNow,
    refreshIntervalMs,
    state,
    generateExecutiveSummary,
  } = useSimulation();
  const { personaId, persona, setPersona } = usePersona();
  const navigate = useNavigate();

  const handlePersonaChange = (id: PersonaId) => {
    setPersona(id);
    navigate('/persona');
  };

  return (
    <Box
      component={motion.header}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      sx={{
        height: layout.topBarHeight,
        position: 'fixed',
        top: 0,
        left: layout.sidebarWidth,
        right: layout.aiAdvisorWidth,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
        background: `rgba(4, 11, 31, 0.85)`,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          maxWidth: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          bgcolor: colors.bg.glass,
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: colors.text.muted }} />
        <InputBase
          placeholder="Search UPI, releases, incidents..."
          sx={{ flex: 1, fontSize: '0.8125rem', color: colors.text.primary }}
        />
      </Box>

      <Select
        value={selectedDomain}
        onChange={(e) => setSelectedDomain(e.target.value)}
        size="small"
        sx={{
          minWidth: 140,
          fontSize: '0.8125rem',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border.subtle },
        }}
      >
        {DOMAINS.map((d) => (
          <MenuItem key={d.id} value={d.id} sx={{ fontSize: '0.8125rem' }}>
            {d.label}
          </MenuItem>
        ))}
      </Select>

      <Chip
        icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: `${colors.success} !important` }} />}
        label="PROD"
        size="small"
        sx={{
          height: 24,
          fontSize: '0.65rem',
          fontWeight: 700,
          bgcolor: `${colors.success}15`,
          color: colors.success,
          border: `1px solid ${colors.success}33`,
        }}
      />

      <Tooltip title="Generate Executive Summary from current state">
        <Button
          size="small"
          variant="outlined"
          startIcon={<SummarizeIcon sx={{ fontSize: 16 }} />}
          onClick={generateExecutiveSummary}
          sx={{
            height: 28,
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: colors.border.subtle,
            color: colors.text.primary,
            px: 1.25,
            '&:hover': { borderColor: colors.primary, color: colors.primary },
          }}
        >
          Generate Executive Summary
        </Button>
      </Tooltip>

      <Tooltip title={`Live simulation · refresh every ${refreshIntervalMs / 1000}s`}>
        <IconButton size="small" onClick={refreshNow} sx={{ color: colors.text.secondary }}>
          <RefreshIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <IconButton size="small" sx={{ color: colors.text.secondary }}>
        <Badge
          badgeContent={state.executive.openIncidents}
          color="error"
          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
        >
          <NotificationsIcon sx={{ fontSize: 18 }} />
        </Badge>
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, borderLeft: `1px solid ${colors.border.subtle}` }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: colors.secondary, fontSize: '0.62rem', fontWeight: 700 }}>
          {persona.initials}
        </Avatar>
        <Tooltip title="Switch persona — Executive Demo Mode">
          <Select
            value={personaId}
            onChange={(e) => handlePersonaChange(e.target.value as PersonaId)}
            size="small"
            IconComponent={SwitchAccountIcon}
            renderValue={() => (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.15 }}>
                  {persona.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem' }}>
                  {persona.title}
                </Typography>
              </Box>
            )}
            sx={{
              minWidth: 170,
              '& .MuiSelect-select': { py: 0.25, pr: '28px !important' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border.subtle },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
              '& .MuiSelect-icon': { color: colors.text.muted, fontSize: 18 },
            }}
            MenuProps={{ slotProps: { paper: { sx: { maxHeight: 460, bgcolor: colors.bg.tertiary, border: `1px solid ${colors.border.subtle}` } } } }}
          >
            <ListSubheader sx={{ bgcolor: 'transparent', color: colors.text.muted, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', lineHeight: 2.2 }}>
              ENTERPRISE PERSONA
            </ListSubheader>
            {PERSONAS.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.78rem', py: 0.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 22, height: 22, bgcolor: p.id === personaId ? colors.secondary : colors.bg.glass, color: p.id === personaId ? '#fff' : colors.text.secondary, fontSize: '0.52rem', fontWeight: 700, border: `1px solid ${colors.border.subtle}` }}>
                    {p.initials}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>{p.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem' }}>{p.title}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Tooltip>
      </Box>
    </Box>
  );
}
