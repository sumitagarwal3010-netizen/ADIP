import { Navigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GavelIcon from '@mui/icons-material/Gavel';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LayersIcon from '@mui/icons-material/Layers';
import { ExecutiveOutcomePage, OutcomeKpiGrid, type OutcomeKpi, type OutcomeTab } from '../components/executive/ExecutiveOutcomePage';
import { EnterpriseRiskCenter } from './EnterpriseRiskCenter';
import { EnterpriseRiskRegisterPanel } from '../components/enterpriseRisk/RiskRegisterPanels';
import { RegulatoryRiskPanel } from '../components/enterpriseRisk/DomainRiskPanels';
import { AuditFindingsRiskPanel } from '../components/enterpriseRisk/ControlAssurancePanels';
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

  const tabs: OutcomeTab[] = [
    { key: 'overview', label: 'Overview', icon: DashboardIcon, content: <OutcomeKpiGrid kpis={kpis} /> },
    { key: 'critical-risks', label: 'Critical Risks', icon: ListAltIcon, content: <EnterpriseRiskRegisterPanel /> },
    { key: 'compliance', label: 'Compliance', icon: GavelIcon, content: <RegulatoryRiskPanel /> },
    { key: 'audit', label: 'Audit', icon: FactCheckIcon, content: <AuditFindingsRiskPanel /> },
    { key: 'more', label: 'More', icon: LayersIcon, content: <EnterpriseRiskCenter initialTab="register" /> },
  ];

  return (
    <ExecutiveOutcomePage
      icon={ShieldIcon}
      title="Risk Posture"
      subtitle="Critical risks, compliance, and audit posture — full enterprise risk register under More"
      tabs={tabs}
    />
  );
}
