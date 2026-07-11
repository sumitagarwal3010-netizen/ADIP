import { useState } from 'react';
import {
  Alert, Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select,
  Typography, LinearProgress, Paper, TextField,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { CenterErrorBoundary } from '../components/common/CenterErrorBoundary';
import { colors } from '../theme/colors';

export function ConnectorArtifactWorkbench() {
  const useCases = [
    { id: 'collect-evidence', label: 'Collect Evidence' },
    { id: 'validate-evidence', label: 'Validate Evidence' },
    { id: 'audit-pack', label: 'Generate Audit Pack' },
    { id: 'release-pack', label: 'Generate Release Pack' },
    { id: 'architecture-pack', label: 'Generate Architecture Pack' },
    { id: 'executive-summary', label: 'Generate Executive Summary' },
  ];
  const enterpriseSources = ['Jira', 'Confluence', 'GitHub', 'ServiceNow', 'CI/CD Logs', 'Control Register'];
  const [artifactType, setArtifactType] = useState(useCases[0].id);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<{
    title: string;
    summary: string;
    body: string;
    quality_score: number;
    confidence: string;
    source_connectors: string[];
    quality_checks: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requirement, setRequirement] = useState('');
  const defaultRequirement = 'Describe the requirement for the evidence pack';
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const packs: Record<string, { title: string; summary: string; body: string }> = {
    'collect-evidence': {
      title: 'Evidence Collection Package',
      summary: 'Collected enterprise evidence for governance and release readiness.',
      body: 'Enterprise Sources\n- Jira epics and closure status\n- Confluence design records\n- GitHub pull request approvals\n\nEvidence Collection\n- 42 records mapped to current release scope\n- 5 missing owner attestations flagged',
    },
    'validate-evidence': {
      title: 'Evidence Validation Package',
      summary: 'Validation checks complete with deterministic quality scoring.',
      body: 'AI Validation\n- Traceability completeness: 94%\n- Evidence freshness: 91%\n- Control linkage: 96%\n\nValidation Findings\n- 3 stale evidence links\n- 2 missing approval timestamps',
    },
    'audit-pack': {
      title: 'Audit Pack',
      summary: 'Generated audit-ready pack with checklist and closure notes.',
      body: 'Generated Pack: Audit\n- Control checklist\n- Gap register\n- Remediation tracker\n- Auditor response draft\n\nApproval / Publish\n- Audit Lead: Pending\n- Compliance Officer: Approved',
    },
    'release-pack': {
      title: 'Release Pack',
      summary: 'Generated release governance pack for CAB review.',
      body: 'Generated Pack: Release\n- Change approvals\n- Test sign-off evidence\n- Rollback drill evidence\n- Operations readiness memo',
    },
    'architecture-pack': {
      title: 'Architecture Pack',
      summary: 'Generated architecture governance pack for board review.',
      body: 'Generated Pack: Architecture\n- Architecture decision records\n- Standards validation matrix\n- Dependency risk map\n- Exception approvals',
    },
    'executive-summary': {
      title: 'Executive Summary Pack',
      summary: 'Generated CIO summary with readiness and open actions.',
      body: 'Executive Summary\n- Readiness: 88%\n- Open governance actions: 4\n- High-risk dependencies: 1\n- Recommended decision: conditional go',
    },
  };

  const handleCopy = async () => {
    if (!generated?.body) return;
    await navigator.clipboard.writeText(generated.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CenterErrorBoundary title="Enterprise Evidence Hub">
      <Box>
        <GlassCard sx={{ p: 2, mb: 1.5 }} glow="blue" hover={false}>
          <ModuleHeader
            title="Enterprise Evidence Hub"
            subtitle="Enterprise Sources -> Evidence Collection -> AI Validation -> Generated Pack -> Approval / Publish"
          />
          <Alert severity="info" sx={{ mb: 1, py: 0.25 }}>
            Deterministic local automation mode for enterprise governance demos.
          </Alert>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip size="small" color="success" label="deterministic" />
            <Chip size="small" label={`${enterpriseSources.length} enterprise source(s)`} />
            <Chip size="small" label={['Evidence Collection', 'AI Validation', 'Generated Pack', 'Approval / Publish'][activeStep]} />
          </Box>
          {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
          {loading && <LinearProgress sx={{ mb: 1 }} />}
        </GlassCard>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="1. Evidence Action" subtitle="Select business action and run automation" />
              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Action</InputLabel>
                <Select value={artifactType} label="Action" onChange={(e) => setArtifactType(e.target.value)}>
                  {useCases.map((uc) => (
                    <MenuItem key={uc.id} value={uc.id}>{uc.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={3}
                sx={{ mb: 1.5 }}
                label="Requirement / prompt"
                value={requirement}
                placeholder={defaultRequirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
              <Typography variant="caption" sx={{ color: colors.text.muted, display: 'block', mb: 1 }}>
                Enterprise Sources: {enterpriseSources.join(', ')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={() => {
                  setActiveStep(1);
                  setError(null);
                }}>
                  Collect Evidence
                </Button>
                <Button size="small" variant="contained" startIcon={<AutoAwesomeIcon />} onClick={() => {
                  setLoading(true);
                  setError(null);
                  const prompt = requirement.trim() || defaultRequirement;
                  setTimeout(() => {
                    const next = packs[artifactType];
                    setGenerated({
                      ...next,
                      summary: `${next.summary} Requirement: ${prompt}`,
                      body: `${next.body}\n\nRequirement / prompt\n- ${prompt}`,
                      quality_score: 0.91,
                      confidence: 'High',
                      source_connectors: enterpriseSources,
                      quality_checks: ['Traceability complete', 'Owner attribution complete', 'Approval chain validated'],
                    });
                    setActiveStep(3);
                    setLoading(false);
                  }, 450);
                }}>
                  Generate Pack
                </Button>
              </Box>
            </GlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="2. Evidence Collection" subtitle="Business-aligned source inventory" />
              {enterpriseSources.map((source) => (
                <Box key={source} sx={{ py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{source}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                    <Chip size="small" label="Connected" color="success" />
                    <Chip size="small" variant="outlined" label="Evidence Ready" />
                  </Box>
                </Box>
              ))}
            </GlassCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <GlassCard sx={{ p: 2, height: '100%' }}>
              <ModuleHeader title="3. AI Validation" subtitle="Deterministic validation checks" />
              <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                Validation Checks
- Evidence freshness check
- Approval lineage check
- Control mapping completeness
- Risk flag consistency

Current Stage: {['Enterprise Sources', 'Evidence Collection', 'AI Validation', 'Generated Pack', 'Approval / Publish'][activeStep]}
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
                  Sources: {generated.source_connectors.join(', ')} · Stage: Approval / Publish
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
