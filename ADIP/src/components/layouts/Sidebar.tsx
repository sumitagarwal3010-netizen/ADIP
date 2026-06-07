import { useEffect, useState } from 'react';
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
import { motion } from 'framer-motion';
import {
  NAV_EXECUTIVE,
  NAV_HUBS,
  findHubForPath,
  isChildActive,
  type NavHub,
} from '../../config/navConfig';
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>(buildInitialExpanded);

  useEffect(() => {
    const activeHub = findHubForPath(location.pathname);
    if (activeHub) {
      setExpanded((prev) => ({ ...prev, [activeHub.id]: true }));
    }
  }, [location.pathname]);

  const toggleHub = (hubId: string) => {
    setExpanded((prev) => ({ ...prev, [hubId]: !prev[hubId] }));
  };

  const renderHub = (hub: NavHub) => {
    const isOpen = expanded[hub.id] ?? false;
    const HubIcon = hub.icon;
    const hubActive = hub.children.some((child) => isChildActive(location.pathname, child.path));

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
            {hub.children.map((child) => {
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

  const executiveActive = location.pathname === NAV_EXECUTIVE.path;
  const ExecutiveIcon = NAV_EXECUTIVE.icon;

  return (
    <Box
      component={motion.nav}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        width: layout.sidebarWidth,
        minWidth: layout.sidebarWidth,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
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
          onClick={() => navigate(NAV_EXECUTIVE.path)}
          sx={{
            borderRadius: 1.5,
            mb: 0.5,
            py: 0.75,
            px: 1.5,
            bgcolor: executiveActive ? `${colors.primary}18` : 'transparent',
            borderLeft: executiveActive ? `3px solid ${colors.primary}` : '3px solid transparent',
            '&:hover': { bgcolor: `${colors.primary}12` },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: executiveActive ? colors.primary : colors.text.muted }}>
            <ExecutiveIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={NAV_EXECUTIVE.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.8125rem',
                fontWeight: executiveActive ? 600 : 400,
                color: executiveActive ? colors.text.primary : colors.text.secondary,
              },
            }}
          />
        </ListItemButton>
        {NAV_HUBS.map(renderHub)}
      </List>
      <Box sx={{ p: 1.5, borderTop: `1px solid ${colors.border.subtle}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          v2.4.1 · Production
        </Typography>
      </Box>
    </Box>
  );
}
