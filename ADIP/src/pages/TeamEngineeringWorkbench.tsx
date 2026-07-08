import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Tab, Tabs, Typography, LinearProgress, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { CenterErrorBoundary } from '../components/common/CenterErrorBoundary';
import { RuleResultsPanel, type RuleResultRow } from '../components/workbench/RuleResultsPanel';
import { getAuthMode } from '../services/auth/authConfig';
import { apiClient } from '../services/backend/apiClient';
import { isBackendMode } from '../services/backend/apiConfig';
import { useConnectorDashboard } from '../sdk/hooks/useConnectors';

type TabKey = 'llm' | 'regression' | 'quality' | 'rules';

export function TeamEngineeringWorkbench() {
  const [tab, setTab] = useState<TabKey>('llm');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<Record<string, unknown> | null>(null);
  const [regressionResult, setRegressionResult] = useState<Record<string, unknown> | null>(null);
  const [scorecard, setScorecard] = useState<Record<string, unknown> | null>(null);
  const [ruleResults, setRuleResults] = useState<RuleResultRow[]>([]);
  const [artifactType, setArtifactType] = useState('BRD');
  const authMode = getAuthMode();
  const { data: dashboard } = useConnectorDashboard();

  const runLlmSmoke = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const r = await apiClient.llmSmokeTest<Record<string, unknown>>();
      setLlmResult(r);
      setMsg(`LLM smoke: ${r.status}`);
    } catch {
      setLlmResult({ status: 'pass', mode: 'mock', checks: [{ check: 'fallback', ok: true }] });
      setMsg('Mock LLM smoke (backend unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const runRegression = async () => {
    setLoading(true);
    try {
      const r = await apiClient.runGoldenRegression<Record<string, unknown>>();
      setRegressionResult(r);
      setMsg(String(r.overall_verdict ?? 'Regression complete'));
    } catch {
      setRegressionResult({ overall_verdict: 'PASS 5/5 (mock)', passed: 5, total: 5 });
      setMsg('Mock regression (backend unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const runQuality = async () => {
    setLoading(true);
    try {
      const r = await apiClient.artifactScorecard<Record<string, unknown>>(artifactType);
      setScorecard(r);
      setMsg(`Scorecard grade: ${r.grade}`);
    } catch {
      setScorecard({ composite_score: 78, grade: 'B', rule_report: { passed: 12, total: 15 } });
      setMsg('Mock scorecard (backend unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const runRules = async () => {
    setLoading(true);
    try {
      const r = await apiClient.runRules<{ results: RuleResultRow[]; overall_status: string }>({
        artifact_type: artifactType,
        artifact_content: `# ${artifactType}\n## Summary\nEnterprise SDLC artifact with REQ-101 traceability.\n## Architecture\npayments-service API gateway component.`,
      });
      setRuleResults(r.results);
      setMsg(`Rules: ${r.overall_status}`);
    } catch {
      setRuleResults([
        { rule_id: 'mock-1', name: 'SDLC completeness', category: 'sdlc_completeness', status: 'pass', message: 'Mock pass' },
      ]);
      setMsg('Mock rules (backend unavailable)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenterErrorBoundary title="Team Engineering Workbench">
      <Box>
        <GlassCard sx={{ p: 2, mb: 1.5 }} glow="blue" hover={false}>
          <ModuleHeader title="Team Engineering Workbench" subtitle="LLM test, regression, quality, and rule automation" />
          {(authMode === 'demo' || authMode === 'disabled' || dashboard.security_bypassed) && (
            <Alert severity="warning" sx={{ mb: 1 }}>Security bypass active — prototype mode only.</Alert>
          )}
          <Chip size="small" label={isBackendMode() ? 'backend' : 'mock fallback'} sx={{ mr: 1 }} />
          <Button size="small" component={RouterLink} to="/ai-sdlc/connector-artifact-workbench">Connector Artifact Workbench →</Button>
          {loading && <LinearProgress sx={{ mt: 1 }} />}
          {msg && <Alert severity="success" sx={{ mt: 1 }}>{msg}</Alert>}
        </GlassCard>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
          <Tab label="LLM Test" value="llm" />
          <Tab label="Prompt Regression" value="regression" />
          <Tab label="Artifact Quality" value="quality" />
          <Tab label="Rule Results" value="rules" />
        </Tabs>

        {tab === 'llm' && (
          <GlassCard sx={{ p: 2 }}>
            <Button variant="contained" onClick={runLlmSmoke}>Run LLM smoke test</Button>
            {llmResult && (
              <Typography variant="body2" component="pre" sx={{ mt: 2, fontSize: 11, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(llmResult, null, 2)}
              </Typography>
            )}
          </GlassCard>
        )}

        {tab === 'regression' && (
          <GlassCard sx={{ p: 2 }}>
            <Button variant="contained" onClick={runRegression}>Run golden regression (mock)</Button>
            {regressionResult && (
              <Typography variant="body2" component="pre" sx={{ mt: 2, fontSize: 11, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(regressionResult, null, 2)}
              </Typography>
            )}
          </GlassCard>
        )}

        {tab === 'quality' && (
          <GlassCard sx={{ p: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160, mr: 1, mb: 1 }}>
              <InputLabel>Artifact type</InputLabel>
              <Select value={artifactType} label="Artifact type" onChange={(e) => setArtifactType(e.target.value)}>
                {['BRD', 'FRD', 'HLD', 'Test Plan', 'Executive Summary'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={runQuality}>Run quality scorecard</Button>
            {scorecard && (
              <Typography variant="body2" component="pre" sx={{ mt: 2, fontSize: 11, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify({ composite_score: scorecard.composite_score, grade: scorecard.grade, rules: scorecard.rule_report }, null, 2)}
              </Typography>
            )}
          </GlassCard>
        )}

        {tab === 'rules' && (
          <GlassCard sx={{ p: 2 }}>
            <Button variant="contained" onClick={runRules}>Run deterministic rules</Button>
            <Box sx={{ mt: 2 }}>
              <RuleResultsPanel results={ruleResults} overallStatus={msg ?? undefined} />
            </Box>
          </GlassCard>
        )}
      </Box>
    </CenterErrorBoundary>
  );
}
