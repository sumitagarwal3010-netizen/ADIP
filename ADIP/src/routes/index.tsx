import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { ExecutiveControlTower } from '../pages/ExecutiveControlTower';
import { DeliveryHub } from '../pages/DeliveryHub';
import { RequirementsHub } from '../pages/RequirementsHub';
import { ArchitectureHub } from '../pages/ArchitectureHub';
import { DevelopmentHub } from '../pages/DevelopmentHub';
import { TestingHub } from '../pages/TestingHub';
import { ReleaseCenter } from '../pages/ReleaseCenter';
import { ProductionCenter } from '../pages/ProductionCenter';
import { OperationsCenter } from '../pages/OperationsCenter';
import { PortfolioHealthPage } from '../pages/PortfolioHealthPage';
import { GovernanceCenter } from '../pages/GovernanceCenter';
import { GovernanceCompliancePage } from '../pages/GovernanceCompliancePage';
import { GovernanceRiskPage } from '../pages/GovernanceRiskPage';
import { GovernanceEvidencePage } from '../pages/GovernanceEvidencePage';
import { AIGovernanceHub } from '../pages/AIGovernanceHub';
import { ModelInventory } from '../pages/ModelInventory';
import { PromptGovernance } from '../pages/PromptGovernance';
import { AIRiskDashboard } from '../pages/AIRiskDashboard';
import { AIProgramStatusPage } from '../pages/AIProgramStatusPage';
import { LearningHub } from '../pages/LearningHub';
import { Reports } from '../pages/Reports';
import { ComplianceReports } from '../pages/ComplianceReports';
import { AuditReports } from '../pages/AuditReports';
import { TrendAnalytics } from '../pages/TrendAnalytics';
import { Administration } from '../pages/Administration';
import { ComingSoon } from '../pages/ComingSoon';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ExecutiveControlTower />} />
        <Route path="delivery" element={<DeliveryHub />} />
        <Route path="requirements" element={<RequirementsHub />} />
        <Route path="architecture" element={<ArchitectureHub />} />
        <Route path="development" element={<DevelopmentHub />} />
        <Route path="testing" element={<TestingHub />} />
        <Route path="release" element={<ReleaseCenter />} />
        <Route path="production" element={<ProductionCenter />} />
        <Route path="operations" element={<OperationsCenter />} />
        <Route path="operations/incidents" element={<ComingSoon title="Incidents" hub="Operations Hub" />} />
        <Route path="operations/availability" element={<ComingSoon title="Availability" hub="Operations Hub" />} />
        <Route path="operations/capacity" element={<PortfolioHealthPage />} />
        <Route path="governance" element={<GovernanceCenter />} />
        <Route path="governance/compliance" element={<GovernanceCompliancePage />} />
        <Route path="governance/risk" element={<GovernanceRiskPage />} />
        <Route path="governance/evidence" element={<GovernanceEvidencePage />} />
        <Route path="ai-governance" element={<AIGovernanceHub />} />
        <Route path="ai-governance/model-inventory" element={<ModelInventory />} />
        <Route path="ai-governance/prompt-governance" element={<PromptGovernance />} />
        <Route path="ai-governance/ai-risk" element={<AIRiskDashboard />} />
        <Route path="ai-governance/ai-controls" element={<AIProgramStatusPage />} />
        <Route path="ai-governance/ai-incidents" element={<ComingSoon title="AI Incidents" hub="AI Governance Hub" />} />
        <Route path="learning" element={<LearningHub />} />
        <Route path="knowledge/best-practices" element={<ComingSoon title="Best Practices" hub="Knowledge Hub" />} />
        <Route path="knowledge/reusable-assets" element={<ComingSoon title="Reusable Assets" hub="Knowledge Hub" />} />
        <Route path="knowledge/lessons-learned" element={<ComingSoon title="Lessons Learned" hub="Knowledge Hub" />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/compliance" element={<ComplianceReports />} />
        <Route path="reports/audit" element={<AuditReports />} />
        <Route path="reports/trends" element={<TrendAnalytics />} />
        <Route path="administration" element={<Administration />} />
      </Route>
    </Routes>
  );
}
