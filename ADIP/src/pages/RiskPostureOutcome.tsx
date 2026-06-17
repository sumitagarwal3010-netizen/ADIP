import { Navigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import { ExecutiveOutcomePage, type OutcomeKpi } from '../components/executive/ExecutiveOutcomePage';
import { EnterpriseRiskCenter } from './EnterpriseRiskCenter';
import { useEnterpriseRisk } from '../context/EnterpriseRiskContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessEnterpriseRisk } from '../data/enterpriseRiskEngine';
import { computeAuditKpis } from '../data/auditCenterEngine';

export function RiskPostureOutcome() {
  const { personaId } = usePersona();
  const { kpis: ermKpis } = useEnterpriseRisk();

  if (!canAccessEnterpriseRisk(personaId)) {
    return <Navigate to="/" replace />;
  }

  const complianceRisk = Math.max(0, 100 - computeAuditKpis().complianceCoverage);

  // Single risk scale across the page: counts for volumes, /100 for risk scores. No % mixing.
  const kpis: OutcomeKpi[] = [
    { label: 'Open Critical Risks', value: ermKpis.openCriticalRisks, suffix: '', chartId: 'enterprise-risk.open-critical-risks' },
    { label: 'Appetite Breaches', value: ermKpis.riskAppetiteBreaches, suffix: '', chartId: 'enterprise-risk.risk-appetite-breaches' },
    { label: 'Cyber Risk', value: ermKpis.cyberRiskScore, suffix: '/100', chartId: 'enterprise-risk.cyber-risk-score' },
    { label: 'Compliance Risk', value: complianceRisk, suffix: '/100', chartId: 'enterprise-risk.compliance-risk' },
  ];

  return (
    <ExecutiveOutcomePage
      icon={ShieldIcon}
      title="Risk Posture"
      subtitle="Critical risks, appetite breaches, cyber and compliance risk — full enterprise risk register under Details"
      kpis={kpis}
      details={<EnterpriseRiskCenter initialTab="dashboard" />}
    />
  );
}
