import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import SavingsIcon from '@mui/icons-material/Savings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalculateIcon from '@mui/icons-material/Calculate';
import SpeedIcon from '@mui/icons-material/Speed';
import LayersIcon from '@mui/icons-material/Layers';
import { Box, CircularProgress } from '@mui/material';
import { ExecutiveOutcomePage, OutcomeKpiGrid, type OutcomeKpi, type OutcomeTab } from '../components/executive/ExecutiveOutcomePage';
import { ExecutiveValueDashboardPanel } from '../components/valueRealization/ExecutiveValueDashboardPanel';
import { RoiCalculatorPanel } from '../components/valueRealization/ScorecardRoiPanels';
import { ProductivityAnalyticsPanel } from '../components/valueRealization/AnalyticsPanels';
import { useValueRealization } from '../context/ValueRealizationContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessValueRealization } from '../data/valueRealizationEngine';

const ValueRealizationCenter = lazy(() =>
  import('./ValueRealizationCenter').then((m) => ({ default: m.ValueRealizationCenter })),
);

function LazyCenterFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
      <CircularProgress size={24} />
    </Box>
  );
}

export function ValueRealizedOutcome() {
  const { personaId } = usePersona();
  const { kpis: valueKpis } = useValueRealization();

  if (!canAccessValueRealization(personaId)) {
    return <Navigate to="/" replace />;
  }

  const kpis: OutcomeKpi[] = [
    { label: 'Realized Value (FYTD)', value: `₹${(valueKpis.annualValueRealized / 1_000_000).toFixed(1)}M`, suffix: '', chartId: 'value-realization.annual-value' },
    { label: 'Hours Saved', value: valueKpis.hoursSaved.toLocaleString('en-IN'), suffix: '', chartId: 'value-realization.hours-saved' },
    { label: 'Business Benefits', value: `₹${(valueKpis.threeYearProjectedValue / 1_000_000).toFixed(1)}M`, suffix: '', chartId: 'value-realization.business-benefits' },
    { label: 'Productivity Uplift', value: valueKpis.productivityGain, suffix: '%', chartId: 'value-realization.productivity' },
  ];

  const tabs: OutcomeTab[] = [
    { key: 'overview', label: 'Overview', icon: DashboardIcon, content: <OutcomeKpiGrid kpis={kpis} /> },
    { key: 'benefits', label: 'Benefits', icon: VerifiedIcon, content: <ExecutiveValueDashboardPanel /> },
    { key: 'roi', label: 'ROI', icon: CalculateIcon, content: <RoiCalculatorPanel /> },
    { key: 'productivity', label: 'Productivity', icon: SpeedIcon, content: <ProductivityAnalyticsPanel /> },
    { key: 'more', label: 'More', icon: LayersIcon, content: (
      <Suspense fallback={<LazyCenterFallback />}>
        <ValueRealizationCenter initialTab="dashboard" />
      </Suspense>
    ) },
  ];

  return (
    <ExecutiveOutcomePage
      icon={SavingsIcon}
      title="Value Realized"
      subtitle="Realized value, business benefits, ROI, and productivity — full value realization under More"
      tabs={tabs}
    />
  );
}
