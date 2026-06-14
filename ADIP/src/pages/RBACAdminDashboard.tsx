import { useMemo, useState } from 'react';
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
  Typography,
} from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { usePersona } from '../context/PersonaContext';
import { useEntitlement } from '../hooks/useEntitlement';
import { colors } from '../theme/colors';
import {
  PERMISSION_CATALOG,
  PERSONA_ENTITLEMENT_MATRIX,
  RBAC_KPI_MOCK,
  RESOURCE_CATALOG,
  ROLE_CATALOG,
} from '../data/rbacCatalog';

const RBAC_EXEC_SUMMARY =
  'RBAC posture covers 12 canonical roles across 14 resource types with 9 permission verbs. Two segregation-of-duties violations detected: platform administrators with approve+administer on approvals, and development leads with create+approve on same resource. Recommended action: review platform-administrator grants and enforce maker-checker on approval workflow.';

export function RBACAdminDashboard() {
  const { persona } = usePersona();
  const entitlement = useEntitlement();
  const [selectedRoleId, setSelectedRoleId] = useState(entitlement.roleId);
  const selectedRole = useMemo(
    () => ROLE_CATALOG.find((r) => r.id === selectedRoleId) ?? ROLE_CATALOG[0],
    [selectedRoleId],
  );

  const effective = entitlement.getEffectiveAccess();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Roles" value={RBAC_KPI_MOCK.totalRoles} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Permissions" value={RBAC_KPI_MOCK.totalPermissions} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Resource Types" value={RBAC_KPI_MOCK.totalResources} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Persona Mappings" value={RBAC_KPI_MOCK.personaMappings} suffix="" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="SoD Violations" value={RBAC_KPI_MOCK.sodViolations} suffix="" trend={-50} compact />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Role Catalog" subtitle="Canonical enterprise roles and grant summary" />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Grants</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Dashboards</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ROLE_CATALOG.map((role) => (
                    <TableRow
                      key={role.id}
                      hover
                      selected={role.id === selectedRoleId}
                      onClick={() => setSelectedRoleId(role.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{role.label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>
                          {role.description.slice(0, 60)}…
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{role.grants.length} resources</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{role.dashboards.length}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                          {role.actions.map((a) => (
                            <Chip key={a} label={a} size="small" sx={{ height: 18, fontSize: '0.58rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, mb: 1.5 }}>
            <AIInsightBox title="RBAC Executive Summary" insight={RBAC_EXEC_SUMMARY} />
          </GlassCard>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Your Effective Access" subtitle={`${persona.label} → ${effective.role.label}`} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {effective.grantCount} effective grants
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 1 }}>Dashboards</Typography>
            {effective.accessibleHubs.map((d) => (
              <Typography key={d} variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>• {d}</Typography>
            ))}
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 1 }}>Reports</Typography>
            {effective.accessibleReports.map((r) => (
              <Typography key={r} variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>• {r}</Typography>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title={`Resource Access — ${selectedRole.label}`} subtitle="Permission matrix for selected role" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem' }}>Resource</TableCell>
                {PERMISSION_CATALOG.map((p) => (
                  <TableCell key={p.id} align="center" sx={{ fontWeight: 700, fontSize: '0.58rem', px: 0.5 }}>
                    {p.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {RESOURCE_CATALOG.map((res) => {
                const grant = selectedRole.grants.find((g) => g.resource === res.id);
                return (
                  <TableRow
                    key={res.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedRoleId(selectedRoleId)}
                  >
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{res.label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                        {res.domain}
                      </Typography>
                    </TableCell>
                    {PERMISSION_CATALOG.map((p) => {
                      const has = grant?.permissions.includes(p.id) ?? false;
                      return (
                        <TableCell key={p.id} align="center" sx={{ px: 0.5 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              mx: 'auto',
                              bgcolor: has ? colors.success : colors.border.subtle,
                            }}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Persona → Role Mapping" subtitle="Persona framework integration" />
        {PERSONA_ENTITLEMENT_MATRIX.map((row) => (
          <DrilldownTableRow
            key={row.personaId}
            chartId="rbac.persona-mapping"
            segment={row.personaId}
            label={row.roleLabel}
            value={row.personaId}
            sx={{
              display: 'flex',
              gap: 2,
              py: 1,
              borderBottom: `1px solid ${colors.border.subtle}`,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 140, textTransform: 'capitalize' }}>
              {row.personaId.replace(/-/g, ' ')}
            </Typography>
            <Typography variant="caption" sx={{ minWidth: 160, fontWeight: 600 }}>{row.roleLabel}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontSize: '0.62rem' }}>
              Dashboards: {row.dashboards.join(', ')}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <HubArtifactGenerator hubKey="rbac" />
    </Box>
  );
}
