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
  NAV_GROUPS,
  findActiveTrail,
  isLeafActive,
  isDirectCenterGroup,
  type NavGroup,
  type NavSection,
} from '../../config/navConfig';
import { usePersona } from '../../context/PersonaContext';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/theme';

const sectionKey = (groupId: string, sectionId: string) => `${groupId}:${sectionId}`;

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona, canAccessRoute } = usePersona();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  // Auto-expand the group + section that own the active route, keeping the rest collapsed.
  useEffect(() => {
    const trail = findActiveTrail(location.pathname);
    if (trail) {
      setExpandedGroups((prev) => ({ ...prev, [trail.groupId]: true }));
      setExpandedSections((prev) => ({ ...prev, [sectionKey(trail.groupId, trail.sectionId)]: true }));
    }
  }, [location.pathname]);

  // Persona visibility: show only groups relevant to the active persona by default.
  // A "show all" toggle keeps every group reachable (no orphaned modules).
  const relevant = useMemo(() => new Set(persona.navHubs), [persona.navHubs]);

  // A section is shown if it has accessible leaves, or it has an accessible header route.
  const sectionVisibility = useMemo(() => {
    const map = new Map<string, { section: NavSection; leaves: NavSection['children'] }>();
    for (const group of NAV_GROUPS) {
      for (const section of group.children) {
        const leaves = section.children.filter((leaf) => canAccessRoute(leaf.path));
        const headerAccessible = section.path ? canAccessRoute(section.path) : false;
        if (leaves.length > 0 || headerAccessible) {
          map.set(sectionKey(group.id, section.id), { section, leaves });
        }
      }
    }
    return map;
  }, [canAccessRoute]);

  const visibleGroups = useMemo(() => {
    const base = showAll ? NAV_GROUPS : NAV_GROUPS.filter((g) => relevant.has(g.id));
    return base.filter((g) =>
      (isDirectCenterGroup(g) && !!g.path && canAccessRoute(g.path)) ||
      g.children.some((s) => sectionVisibility.has(sectionKey(g.id, s.id))),
    );
  }, [relevant, showAll, sectionVisibility, canAccessRoute]);

  const personaLandingActive = location.pathname === '/persona';

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSection = (group: NavGroup, section: NavSection) => {
    const entry = sectionVisibility.get(sectionKey(group.id, section.id));
    if (!entry) return null;
    const { leaves } = entry;
    const key = sectionKey(group.id, section.id);
    const isOpen = expandedSections[key] ?? false;
    const hasLeaves = leaves.length > 0;
    const SectionIcon = section.icon;
    const headerActive = section.path ? location.pathname === section.path : false;
    const childActive = leaves.some((leaf) => isLeafActive(location.pathname, leaf.path));
    const sectionActive = headerActive || childActive;

    const handleClick = () => {
      if (section.path) navigate(section.path);
      if (hasLeaves) toggleSection(key);
    };

    return (
      <Box key={key}>
        <ListItemButton
          onClick={handleClick}
          sx={{
            borderRadius: 1.5,
            mb: 0.25,
            py: 0.55,
            pl: 2,
            pr: 1.5,
            bgcolor: sectionActive && !isOpen ? `${colors.primary}10` : 'transparent',
            '&:hover': { bgcolor: `${colors.primary}12` },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: sectionActive ? colors.primary : colors.text.muted }}>
            <SectionIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={section.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.78rem',
                fontWeight: sectionActive ? 600 : 500,
                color: sectionActive ? colors.text.primary : colors.text.secondary,
              },
            }}
          />
          {hasLeaves &&
            (isOpen ? (
              <ExpandLessIcon sx={{ fontSize: 16, color: colors.text.muted }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 16, color: colors.text.muted }} />
            ))}
        </ListItemButton>
        {hasLeaves && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ pl: 1.5 }}>
              {leaves.map((leaf) => {
                const active = isLeafActive(location.pathname, leaf.path);
                const LeafIcon = leaf.icon;
                return (
                  <ListItemButton
                    key={leaf.path}
                    onClick={() => navigate(leaf.path)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.2,
                      py: 0.5,
                      pl: 2.5,
                      pr: 1.5,
                      bgcolor: active ? `${colors.primary}18` : 'transparent',
                      borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
                      '&:hover': { bgcolor: `${colors.primary}12` },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 26, color: active ? colors.primary : colors.text.muted }}>
                      <LeafIcon sx={{ fontSize: 15 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={leaf.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.75rem',
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
        )}
      </Box>
    );
  };

  const renderGroup = (group: NavGroup) => {
    const GroupIcon = group.icon;
    const groupActive = findActiveTrail(location.pathname)?.groupId === group.id;

    // Direct-center group: a single navigable center with no child sections.
    // Renders as one top-level entry that navigates straight to its page.
    if (isDirectCenterGroup(group) && group.path) {
      return (
        <Box key={group.id}>
          <ListItemButton
            onClick={() => navigate(group.path!)}
            sx={{
              borderRadius: 1.5,
              mb: 0.25,
              py: 0.75,
              px: 1.5,
              bgcolor: groupActive ? `${colors.primary}10` : 'transparent',
              '&:hover': { bgcolor: `${colors.primary}12` },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: groupActive ? colors.primary : colors.text.muted }}>
              <GroupIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={group.label}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: groupActive ? colors.text.primary : colors.text.secondary,
                },
              }}
            />
          </ListItemButton>
        </Box>
      );
    }

    const visibleSections = group.children.filter((s) => sectionVisibility.has(sectionKey(group.id, s.id)));
    if (visibleSections.length === 0) return null;

    const isOpen = expandedGroups[group.id] ?? false;

    return (
      <Box key={group.id}>
        <ListItemButton
          onClick={() => toggleGroup(group.id)}
          sx={{
            borderRadius: 1.5,
            mb: 0.25,
            py: 0.75,
            px: 1.5,
            bgcolor: groupActive && !isOpen ? `${colors.primary}10` : 'transparent',
            '&:hover': { bgcolor: `${colors.primary}12` },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: groupActive ? colors.primary : colors.text.muted }}>
            <GroupIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={group.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: groupActive ? colors.text.primary : colors.text.secondary,
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
            {visibleSections.map((section) => renderSection(group, section))}
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
        <Box
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/'); } }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        >
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
          {showAll ? 'All Modules' : `${persona.label} Workspace`}
        </Typography>

        {visibleGroups.map(renderGroup)}

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
