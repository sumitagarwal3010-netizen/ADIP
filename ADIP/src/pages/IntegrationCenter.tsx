import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Grid, Typography } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { KpiCard } from '../components/common/KpiCard';
import { CenterErrorBoundary } from '../components/common/CenterErrorBoundary';
import { colors } from '../theme/colors';
import { useConnectorDashboard, useConnectors } from '../sdk/hooks/useConnectors';
import { getAuthMode } from '../services/auth/authConfig';
import { apiClient } from '../services/backend/apiClient';
import { isBackendMode } from '../services/backend/apiConfig';

export function IntegrationCenter() {
  const { data: dashboard, loading: dashLoading, source } = useConnectorDashboard();
  const { data: connectors, loading, error, retry } = useConnectors();
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const authMode = getAuthMode();

  const handleSeed = async () => {
    if (!isBackendMode()) {
      setActionMsg('Seed requires backend mode — showing mock catalog.');
      return;
    }
    await apiClient.seedConnectors();
    retry();
    setActionMsg('Demo connectors seeded.');
  };

  const handleTest = async (id: number) => {
    if (!isBackendMode()) {
      setActionMsg(`Mock test OK for connector ${id}`);
      return;
    }
    const r = await apiClient.testConnector<{ ok: boolean; message: string }>(id);
    setActionMsg(r.message);
  };

  const handleSync = async (id: number) => {
    if (!isBackendMode()) {
      setActionMsg(`Mock sync completed for connector ${id}`);
      return;
    }
    await apiClient.syncConnector(id);
    setActionMsg(`Sync triggered for connector ${id}`);
  };

  return (
    <CenterErrorBoundary title="Integration Center">
      <Box>
        <GlassCard sx={{ p: 2, mb: 1.5 }} glow="blue" hover={false}>
          <ModuleHeader
            title="Enterprise Integration Center"
            subtitle="Connector catalog, health, sync and evidence ingestion"
          />
          {(authMode === 'demo' || dashboard.security_bypassed) && (
            <Alert severity="warning" sx={{ mb: 1, py: 0.25 }}>
              Security bypass active ({authMode}) — prototype mode only. Production must use OIDC + RBAC/ABAC.
            </Alert>
          )}
          {error && (
            <Alert severity="info" sx={{ mb: 1 }} onClose={retry}>
              Backend unavailable — mock connector catalog shown. {error}
            </Alert>
          )}
          {actionMsg && <Alert severity="success" sx={{ mb: 1 }}>{actionMsg}</Alert>}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Connectors" value={dashboard.total_connectors} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Enabled" value={dashboard.enabled_connectors} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Mock Mode" value={dashboard.mock_connectors} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Healthy" value={dashboard.healthy_connectors} compact /></Grid>
          </Grid>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`Data source: ${source}`} />
            <Chip size="small" color="info" label={`Auth: ${dashboard.auth_mode}`} />
            <Button size="small" variant="outlined" onClick={handleSeed}>Seed demo connectors</Button>
            <Button size="small" variant="text" component={RouterLink} to="/ai-sdlc/connector-artifact-workbench">
              Artifact Workbench →
            </Button>
          </Box>
        </GlassCard>

        <GlassCard sx={{ p: 2 }}>
          <ModuleHeader title="Connector Catalog" subtitle={loading || dashLoading ? 'Loading…' : `${connectors.length} configured connectors`} />
          {connectors.map((c) => (
            <Box
              key={c.id}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, py: 1,
                borderBottom: `1px solid ${colors.border.subtle}`, flexWrap: 'wrap',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 140 }}>{c.name}</Typography>
              <Chip size="small" label={c.category} />
              {c.mock_mode && <Chip size="small" color="warning" label="mock" />}
              <Chip size="small" label={c.last_health_status ?? c.status} color={c.last_health_status === 'healthy' ? 'success' : 'default'} />
              <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                <Button size="small" startIcon={<PlayArrowIcon />} onClick={() => handleTest(c.id)}>Test</Button>
                <Button size="small" startIcon={<SyncIcon />} onClick={() => handleSync(c.id)}>Sync</Button>
              </Box>
            </Box>
          ))}
        </GlassCard>
      </Box>
    </CenterErrorBoundary>
  );
}
