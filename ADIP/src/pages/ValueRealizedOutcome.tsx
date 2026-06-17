import { Navigate } from 'react-router-dom';
import SavingsIcon from '@mui/icons-material/Savings';
import { ExecutiveOutcomePage, type OutcomeKpi } from '../components/executive/ExecutiveOutcomePage';
import { ValueRealizationCenter } from './ValueRealizationCenter';
import { useValueRealization } from '../context/ValueRealizationContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessValueRealization } from '../data/valueRealizationEngine';

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

  return (
    <ExecutiveOutcomePage
      icon={SavingsIcon}
      title="Value Realized"
      subtitle="Realized value, hours saved, business benefits, and productivity uplift — full value realization under Details"
      kpis={kpis}
      details={<ValueRealizationCenter initialTab="dashboard" />}
    />
  );
}
