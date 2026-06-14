import { Box, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { useAbac } from '../context/AbacContext';
import { useEntitlement } from '../hooks/useEntitlement';
import { colors } from '../theme/colors';

export function AbacAdminDashboard() {
  const entitlement = useEntitlement();
  const {
    policies,
    userAttributes,
    visibilityScope,
    effectiveAccess,
    domainAssignments,
    kpis,
    execSummary,
  } = useAbac();

  if (!entitlement.can('administer', 'dashboards')) {
    return <Navigate to="/" replace />;
  }

  const scopeChart = kpis.scopeDistribution.map((s) => ({ name: s.scope, value: s.count }));

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Policy Coverage" value={kpis.policyCoverage} suffix="%" chartId="abac.policy-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Domain Ownership" value={kpis.domainOwnershipCount} chartId="abac.domain-ownership" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Access Violations" value={kpis.accessViolations} chartId="abac.access-violations" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Scoped Resources" value={kpis.scopedResources} compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Enabled Policies" value={kpis.enabledPolicies} suffix={`/${kpis.totalPolicies}`} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="ABAC Policies" subtitle={`${policies.length} enterprise attribute policies`} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Policy', 'Effect', 'Resources', 'Priority', 'Status'].map((h) => (
                      <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, fontSize: '0.62rem' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem', fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}>
                        <Chip label={p.effect} size="small" sx={{ height: 18, fontSize: '0.55rem', color: p.effect === 'allow' ? colors.success : colors.critical }} />
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.6rem' }}>{p.resourceTypes.length} types</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{p.priority}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}>
                        <Chip label={p.enabled ? 'enabled' : 'disabled'} size="small" sx={{ height: 18, fontSize: '0.55rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="User Attributes" subtitle={userAttributes.personaId} />
            {[
              ['Department', userAttributes.department],
              ['Business Unit', userAttributes.businessUnit],
              ['Portfolios', userAttributes.portfolios.join(', ')],
              ['Applications', userAttributes.applicationOwnership.join(', ') || '—'],
              ['Assigned Domains', userAttributes.assignedDomains.join(', ')],
              ['Region', userAttributes.region],
              ['Risk Level', userAttributes.riskLevel],
            ].map(([k, v]) => (
              <Typography key={k} variant="caption" sx={{ display: 'block', py: 0.25, fontSize: '0.68rem' }}>
                <strong>{k}:</strong> {v}
              </Typography>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Effective Access" subtitle={effectiveAccess.roleLabel} />
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>{visibilityScope.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 1 }}>
              Row filter: {effectiveAccess.rowFilterActive ? 'Active' : 'Inactive (global)'} · Policies: {effectiveAccess.policyCount}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              Domains: {effectiveAccess.allowedDomains.join(', ')}
            </Typography>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Scope Distribution" />
            <HorizontalBarChart chartId="abac.scope-distribution" data={scopeChart} height={160} barColor={colors.primary} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Domain Assignments" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Persona', 'Scope', 'Domains', 'Applications'].map((h) => (
                  <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, fontSize: '0.62rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {domainAssignments.map((d) => (
                <TableRow key={d.personaId} hover>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem', fontWeight: 600 }}>{d.personaLabel}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{d.scopeKind}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{d.domains.join(', ')}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{d.applications.join(', ') || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="ABAC Executive Summary" insight={execSummary} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <HubArtifactGenerator hubKey="abac" />
      </Box>
    </Box>
  );
}
