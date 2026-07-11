import { useState } from 'react';
import {
  Box, Button, Tab, Tabs, Typography,
} from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { apiClient } from '../../services/backend/apiClient';

type EntTab =
  | 'infrastructure' | 'storage' | 'network' | 'cost' | 'growth'
  | 'comparison' | 'calibration' | 'recommendations';

const ENT_TABS: { key: EntTab; label: string }[] = [
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'storage', label: 'Storage' },
  { key: 'network', label: 'Networking' },
  { key: 'cost', label: 'Cost' },
  { key: 'growth', label: 'Growth' },
  { key: 'comparison', label: 'Scenario Comparison' },
  { key: 'calibration', label: 'Calibration' },
  { key: 'recommendations', label: 'Recommendations' },
];

interface Props {
  profile: string;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setMsg: (v: string | null) => void;
}

export function CapacityEnterprisePanel({ profile, loading, setLoading, setMsg }: Props) {
  const [entTab, setEntTab] = useState<EntTab>('infrastructure');
  const [enterprise, setEnterprise] = useState<Record<string, unknown> | null>(null);
  const [comparison, setComparison] = useState<Record<string, unknown> | null>(null);
  const [calibration, setCalibration] = useState<Record<string, unknown> | null>(null);

  const runEnterprise = async () => {
    setLoading(true);
    try {
      const r = await apiClient.runEnterpriseCapacityPlan<Record<string, unknown>>({
        profile,
        run_scenario_comparison: entTab === 'comparison',
        run_calibration: entTab === 'calibration',
      });
      setEnterprise(r);
      setMsg(`Enterprise plan: ${(r.enterprise as { architect_recommendations?: { overall_status?: string } })?.architect_recommendations?.overall_status ?? 'complete'}`);
    } catch {
      setEnterprise({
        plan: { profile, costs: { monthly_total_usd: 1800 }, gke: { node_count_est: 4 } },
        enterprise: {
          kubernetes_platform: { total_resources: 42, cluster_complexity: 'medium', pvc_total_gi: 50 },
          high_availability: { target: '99.9', availability_pct: 99.9 },
          disaster_recovery: { rpo_minutes: 30, rto_minutes: 120 },
          cost_optimization: { total_monthly_savings_usd: 320 },
          architect_recommendations: { overall_status: 'review_recommended', recommendations: [{ finding: 'Mock', severity: 'info' }] },
        },
      });
      setMsg('Mock enterprise plan');
    } finally {
      setLoading(false);
    }
  };

  const runCompare = async () => {
    setLoading(true);
    try {
      const r = await apiClient.compareCapacityScenarios<Record<string, unknown>>({
        profiles: ['small', 'medium', 'large'],
      });
      setComparison(r);
      setMsg(String(r.recommendation ?? 'Comparison complete'));
    } catch {
      setComparison({ rows: [{ scenario: 'medium', monthly_cost_usd: 1200 }], recommendation: 'Mock: medium lowest cost' });
      setMsg('Mock comparison');
    } finally {
      setLoading(false);
    }
  };

  const runCalibrate = async () => {
    setLoading(true);
    try {
      const r = await apiClient.calibrateCapacity<Record<string, unknown>>(profile, 'mock');
      setCalibration(r);
      setMsg(`Calibration accuracy: ${JSON.stringify(r.accuracy_pct)}`);
    } catch {
      setCalibration({ mock_mode: true, accuracy_pct: { cpu_millicores: 92 }, future_adjustments: ['Estimates within 15%'] });
      setMsg('Mock calibration');
    } finally {
      setLoading(false);
    }
  };

  const slice = (): unknown => {
    const e = enterprise?.enterprise as Record<string, unknown> | undefined;
    const p = enterprise?.plan as Record<string, unknown> | undefined;
    switch (entTab) {
      case 'infrastructure':
        return { k8s: e?.kubernetes_platform, ha: e?.high_availability, dr: e?.disaster_recovery, gke: p?.gke };
      case 'storage':
        return { object_storage: p?.object_storage, database: p?.database_growth, redis: p?.redis, vector: p?.vector_db, rag: e?.rag_benchmark };
      case 'network':
        return p?.network;
      case 'cost':
        return { costs: p?.costs, optimization: e?.cost_optimization };
      case 'growth':
        return { forecast: p?.growth_forecast, history: e?.benchmark_history };
      case 'comparison':
        return comparison ?? e?.scenario_comparison;
      case 'calibration':
        return calibration ?? e?.calibration;
      case 'recommendations':
        return e?.architect_recommendations;
      default:
        return enterprise;
    }
  };

  return (
    <GlassCard sx={{ p: 2 }}>
      <Tabs value={entTab} onChange={(_, v) => setEntTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1 }}>
        {ENT_TABS.map((t) => <Tab key={t.key} label={t.label} value={t.key} />)}
      </Tabs>
      <Box sx={{ mb: 1 }}>
        {entTab === 'comparison' && (
          <Button variant="contained" size="small" onClick={runCompare} disabled={loading} sx={{ mr: 1 }}>
            Compare scenarios
          </Button>
        )}
        {entTab === 'calibration' && (
          <Button variant="contained" size="small" onClick={runCalibrate} disabled={loading} sx={{ mr: 1 }}>
            Run calibration (mock)
          </Button>
        )}
        <Button variant="contained" size="small" onClick={runEnterprise} disabled={loading}>
          Run enterprise plan
        </Button>
      </Box>
      {(enterprise || comparison || calibration) && (
        <Typography variant="body2" component="pre" sx={{ fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
          {JSON.stringify(slice(), null, 2)}
        </Typography>
      )}
    </GlassCard>
  );
}
