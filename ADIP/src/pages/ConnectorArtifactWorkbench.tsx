import { useState } from 'react';
import {
  Alert, Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select,
  Typography, LinearProgress, Paper,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PreviewIcon from '@mui/icons-material/Preview';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { CenterErrorBoundary } from '../components/common/CenterErrorBoundary';
import { colors } from '../theme/colors';
import { useConnectorArtifactWorkbench } from '../sdk/hooks/useConnectorArtifactWorkbench';
import { useConnectorDashboard } from '../sdk/hooks/useConnectors';
import { getAuthMode } from '../services/auth/authConfig';

export function ConnectorArtifactWorkbench() {
  const authMode = getAuthMode();
  const { data: dashboard } = useConnectorDashboard();
  const {
    useCases, artifactType, setArtifactType, targetConnectors, sources, promptPreview,
    generated, loading, error, loadPreview, generate,
  } = useConnectorArtifactWorkbench();
  const [copied, setCopied] = useState(false);

  const mockBadge = targetConnectors.every((c) => c.mock_mode) || targetConnectors.length === 0;
  const dryRunBadge = targetConnectors.some((c) => c.dry_run === true);

  const handleCopy = async () => {
    if (!generated?.body) return;
    await navigator.clipboard.writeText(generated.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CenterErrorBoundary title="Connector Artifact Workbench">
      <Box>
        <GlassCard sx={{ p: 2, mb: 1.5 }} glow="blue" hover={false}>
          <ModuleHeader
            title="Connector Artifact Workbench"
            subtitle="Generate SDLC artifacts from enterprise connector evidence"
          />
          {(authMode === 'demo' || authMode === 'disabled' || dashboard.security_bypassed) && (
            <Alert severity="warning" sx={{ mb: 1, py: 0.25 }}>
              Security bypass active ({authMode}) — prototype mode. Production requires OIDC + RBAC.
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {mockBadge && <Chip size="small" color="warning" label="mock" />}
            {dryRunBadge && <Chip size="small" color="info" label="dry-run" />}
            {!mockBadge && targetConnectors.length > 0 && <Chip size="small" color="success" label="live" />}
            <Chip size="small" label={`${targetConnectors.length} connector(s)`} />
          </Box>
          {error && <Alert severity="info" sx={{ mb: 1 }}>{error}</Alert>}
          {loading && <LinearProgress sx={{ mb: 1 }} />}
        </GlassCard>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="1. Source & Type" subtitle="Select connectors and artifact type" />
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Artifact type</InputLabel>
                <Select value={artifactType} label="Artifact type" onChange={(e) => setArtifactType(e.target.value)}>
                  {useCases.map((uc) => (
                    <MenuItem key={uc.id} value={uc.id}>{uc.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ color: colors.text.muted, display: 'block', mb: 1 }}>
                Connectors: {targetConnectors.map((c) => c.name).join(', ') || 'defaults for use case'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" startIcon={<PreviewIcon />} onClick={() => loadPreview()}>
                  Preview sources
                </Button>
                <Button size="small" variant="contained" startIcon={<AutoAwesomeIcon />} onClick={() => generate(false)}>
                  Generate artifact
                </Button>
              </Box>
            </GlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="2. Source preview" subtitle={`${sources.length} record(s)`} />
              {sources.slice(0, 6).map((s) => (
                <Box key={s.external_id} sx={{ py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{s.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                    <Chip size="small" label={s.connector_type ?? '?'} />
                    {s.severity && <Chip size="small" color="error" label={s.severity} />}
                    {s.classification && <Chip size="small" variant="outlined" label={s.classification} />}
                  </Box>
                </Box>
              ))}
            </GlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="3. Prompt preview" subtitle="Template for generation" />
              <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {promptPreview || 'Click Preview sources to load prompt template.'}
              </Paper>
            </GlassCard>
          </Grid>

          {generated && (
            <Grid size={{ xs: 12 }}>
              <GlassCard sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ModuleHeader title={`4. ${generated.title}`} subtitle={generated.summary} />
                  <Chip size="small" label={`Quality ${Math.round(generated.quality_score * 100)}%`} color="primary" />
                  <Chip size="small" label={generated.confidence} />
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 320, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 13 }}>
                  {generated.body}
                </Paper>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: colors.text.muted }}>
                  Sources: {generated.source_connectors.join(', ')} · Records: {generated.explainability.contributing_records.length}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Quality checks</Typography>
                  {generated.quality_checks.map((c) => (
                    <Chip key={c} size="small" sx={{ mr: 0.5, mt: 0.5 }} label={c} />
                  ))}
                </Box>
              </GlassCard>
            </Grid>
          )}
        </Grid>
      </Box>
    </CenterErrorBoundary>
  );
}
