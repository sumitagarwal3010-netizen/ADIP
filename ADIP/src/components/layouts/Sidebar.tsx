import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import { motion } from 'framer-motion';
import {
  NAV_HUBS,
  findHubForPath,
  isChildActive,
  type NavHub,
} from '../../config/navConfig';
import { usePersona } from '../../context/PersonaContext';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/theme';

function buildInitialExpanded(): Record<string, boolean> {
  return NAV_HUBS.reduce<Record<string, boolean>>((acc, hub) => {
    acc[hub.id] = hub.defaultExpanded ?? false;
    return acc;
  }, {});
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona, canAccessRoute } = usePersona();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(buildInitialExpanded);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const activeHub = findHubForPath(location.pathname);
    if (activeHub) {
      setExpanded((prev) => ({ ...prev, [activeHub.id]: true }));
    }
  }, [location.pathname]);

  // Role-based navigation: show only hubs relevant to the active persona.
  // A "show all" toggle keeps every hub reachable (no orphaned modules).
  const relevant = useMemo(() => new Set(persona.navHubs), [persona.navHubs]);
  const visibleHubs = useMemo(() => {
    const hubs = showAll ? NAV_HUBS : NAV_HUBS.filter((h) => relevant.has(h.id));
    return hubs.filter((h) => h.children.some((child) => canAccessRoute(child.path)));
  }, [relevant, showAll, canAccessRoute]);

  const personaLandingActive = location.pathname === '/persona';

  const toggleHub = (hubId: string) => {
    setExpanded((prev) => ({ ...prev, [hubId]: !prev[hubId] }));
  };

  const renderHub = (hub: NavHub) => {
    const authorizedChildren = hub.children.filter((child) => canAccessRoute(child.path));
    if (authorizedChildren.length === 0) return null;

    const isOpen = expanded[hub.id] ?? false;
    const HubIcon = hub.icon;
    const hubActive = authorizedChildren.some((child) => isChildActive(location.pathname, child.path));

    return (
      <Box key={hub.id}>
        <ListItemButton
          onClick={() => toggleHub(hub.id)}
          sx={{
            borderRadius: 1.5,
            mb: 0.25,
            py: 0.75,
            px: 1.5,
            bgcolor: hubActive && !isOpen ? `${colors.primary}10` : 'transparent',
            '&:hover': { bgcolor: `${colors.primary}12` },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: hubActive ? colors.primary : colors.text.muted }}>
            <HubIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={hub.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.8125rem',
                fontWeight: hubActive ? 600 : 500,
                color: hubActive ? colors.text.primary : colors.text.secondary,
              },
            }}
          />
          {isOpen ? (
            <ExpandLessIcon sx={{ fontSize: 18, color: colors.text.muted }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, color: colors.text.muted }} />
          )}
        </ListItemButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 1 }}>
            {authorizedChildren.map((child) => {
              const active = isChildActive(location.pathname, child.path);
              const ChildIcon = child.icon;
              return (
                <ListItemButton
                  key={child.path}
                  onClick={() => navigate(child.path)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.25,
                    py: 0.6,
                    pl: 2,
                    pr: 1.5,
                    bgcolor: active ? `${colors.primary}18` : 'transparent',
                    borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
                    '&:hover': { bgcolor: `${colors.primary}12` },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: active ? colors.primary : colors.text.muted }}>
                    <ChildIcon sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={child.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.78rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? colors.text.primary : colors.text.secondary,
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      component={motion.nav}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        width: layout.sidebarWidth,
        minWidth: layout.sidebarWidth,
        height: `calc(100vh - ${layout.demoBannerHeight}px)`,
        position: 'fixed',
        left: 0,
        top: layout.demoBannerHeight,
        zIndex: 1200,
        background: `linear-gradient(180deg, ${colors.bg.secondary} 0%, ${colors.bg.primary} 100%)`,
        borderRight: `1px solid ${colors.border.subtle}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${colors.primary}44`,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>AI</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1.2 }}>
              ADIP
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Delivery Intelligence
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: colors.border.subtle }} />
      <List sx={{ flex: 1, py: 1, px: 1, overflow: 'auto' }}>
        <ListItemButton
          onClick={() => navigate('/persona')}
          sx={{
            borderRadius: 1.5,
            mb: 0.5,
            py: 0.75,
            px: 1.5,
            bgcolor: personaLandingActive ? `${colors.secondary}22` : `${colors.secondary}10`,
            border: `1px solid ${personaLandingActive ? colors.secondary : `${colors.secondary}33`}`,
            '&:hover': { bgcolor: `${colors.secondary}1f` },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: colors.secondary }}>
            <SpaceDashboardIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="My Workspace"
            secondary={persona.label}
            sx={{
              '& .MuiListItemText-primary': { fontSize: '0.8125rem', fontWeight: 700, color: colors.text.primary },
              '& .MuiListItemText-secondary': { fontSize: '0.62rem', color: colors.text.muted },
            }}
          />
        </ListItemButton>

        <Typography
          variant="caption"
          sx={{ display: 'block', px: 1.5, py: 0.5, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', color: colors.text.muted, textTransform: 'uppercase' }}
        >
          {showAll ? 'All Modules' : `${persona.label} Modules`}
        </Typography>

        {visibleHubs.map(renderHub)}

        <ListItemButton
          onClick={() => setShowAll((v) => !v)}
          sx={{ borderRadius: 1.5, mt: 0.5, py: 0.5, px: 1.5, '&:hover': { bgcolor: `${colors.primary}10` } }}
        >
          <ListItemText
            primary={showAll ? `Show ${persona.label} modules only` : 'Show all modules'}
            sx={{ '& .MuiListItemText-primary': { fontSize: '0.7rem', fontWeight: 600, color: colors.primary } }}
          />
        </ListItemButton>
      </List>
      <Box sx={{ p: 1.5, borderTop: `1px solid ${colors.border.subtle}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          v2.4.1 · Persona Mode
        </Typography>
      </Box>
    </Box>
  );
}
