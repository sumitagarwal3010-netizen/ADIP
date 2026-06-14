import { useMemo } from 'react';
import {
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { useAuth } from '../context/AuthContext';
import {
  AUTH_EXEC_SUMMARY,
  AUTH_HEALTH_MOCK,
  AUTH_PROVIDERS,
  MOCK_USERS,
} from '../data/authProviders';
import { PERMISSION_CATALOG } from '../data/rbacCatalog';
import { createEntitlementResolver } from '../data/rbacEngine';
import { colors } from '../theme/colors';

import type { AuthAuditEventType } from '../types/auth';

const CHART_COLORS = [colors.primary, colors.secondary, colors.success, colors.warning, '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];

const EVENT_COLORS: Record<AuthAuditEventType, string> = {
  login: colors.success,
  logout: colors.text.muted,
  session_expiry: colors.warning,
  session_refresh: colors.primary,
  role_change: colors.secondary,
};

export function AuthenticationHealthDashboard() {
  const { auditEvents, currentUser, session, isAuthenticated } = useAuth();

  const roleDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of MOCK_USERS) {
      counts.set(u.role, (counts.get(u.role) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, []);

  const privilegeDistribution = useMemo(() => {
    const permCounts = new Map<string, number>();
    for (const user of MOCK_USERS.slice(0, AUTH_HEALTH_MOCK.activeSessions)) {
      const resolver = createEntitlementResolver(user.rbacRole);
      for (const grant of resolver.listGrants()) {
        for (const p of grant.permissions) {
          permCounts.set(p, (permCounts.get(p) ?? 0) + 1);
        }
      }
    }
    return PERMISSION_CATALOG.map((p, i) => ({
      name: p.label,
      value: permCounts.get(p.id) ?? 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })).filter((d) => d.value > 0);
  }, []);

  const loginsToday = auditEvents.filter((e) => e.type === 'login').length;
  const expiries = auditEvents.filter((e) => e.type === 'session_expiry').length;

  const activeSessions = useMemo(() => {
    const baseTime = session?.createdAt ?? 1_748_000_000_000;
    const mockSessions = MOCK_USERS.slice(0, AUTH_HEALTH_MOCK.activeSessions).map((u, i) => ({
      sessionId: `mock-sess-${i}`,
      user: u,
      providerId: AUTH_PROVIDERS[i % 3].id,
      expiresAt: baseTime + (20 + i) * 60 * 1000,
    }));
    if (isAuthenticated && currentUser && session) {
      return [{ sessionId: session.sessionId, user: currentUser, providerId: session.providerId, expiresAt: session.expiresAt }, ...mockSessions.slice(0, 7)];
    }
    return mockSessions;
  }, [isAuthenticated, currentUser, session]);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Active Sessions" value={activeSessions.length} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="OIDC Providers" value={AUTH_PROVIDERS.length} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Logins (session)" value={loginsToday || AUTH_HEALTH_MOCK.activeSessions} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Session Expiries" value={expiries} suffix="" trend={expiries > 0 ? -100 : 0} compact />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Active Sessions" subtitle="Mock session registry — production will use Entra ID session store" />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Provider</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Expires</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeSessions.map((s) => (
                    <TableRow key={s.sessionId} hover>
                      <TableCell sx={{ fontSize: '0.72rem' }}>{s.user.display_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>{s.user.role}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>
                        {AUTH_PROVIDERS.find((p) => p.id === s.providerId)?.label}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>
                        {new Date(s.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <ModuleHeader title="Role Distribution" subtitle="Enterprise roles across mock directory" />
            <HorizontalBarChart data={roleDistribution} height={220} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Authentication Events" subtitle="Login, logout, expiry, and role change audit trail" />
            <TableContainer sx={{ maxHeight: 280 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(auditEvents.length > 0 ? auditEvents : seedAuditEvents()).map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>
                        <Chip
                          label={e.type.replace('_', ' ')}
                          size="small"
                          sx={{ height: 20, fontSize: '0.58rem', bgcolor: `${EVENT_COLORS[e.type]}22`, color: EVENT_COLORS[e.type] }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>{e.username}</TableCell>
                      <TableCell sx={{ fontSize: '0.68rem', color: colors.text.secondary }}>{e.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Privilege Distribution" subtitle="Permission grants across active sessions" />
            <DonutChart
              data={privilegeDistribution.length > 0 ? privilegeDistribution : [{ name: 'View', value: 8, color: colors.primary }]}
              height={220}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox
          title="Authentication Health — Executive Summary"
          insight={AUTH_EXEC_SUMMARY}
        />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <HubArtifactGenerator hubKey="authentication" />
      </Box>
    </Box>
  );
}

function seedAuditEvents() {
  return [
    { id: 'seed-1', type: 'login' as const, userId: 'usr-cio', username: 'sverma', timestamp: 'Jun 6, 2026, 09:12 AM', detail: 'Login via Mock Azure AD' },
    { id: 'seed-2', type: 'role_change' as const, userId: 'usr-dev', username: 'mkrishnan', timestamp: 'Jun 5, 2026, 04:30 PM', detail: 'Role changed: Developer → Development Lead' },
    { id: 'seed-3', type: 'session_expiry' as const, userId: 'usr-test', username: 'drao', timestamp: 'Jun 5, 2026, 02:15 PM', detail: 'Session expired' },
    { id: 'seed-4', type: 'logout' as const, userId: 'usr-rm', username: 'vjoshi', timestamp: 'Jun 5, 2026, 11:00 AM', detail: 'User signed out' },
  ];
}
