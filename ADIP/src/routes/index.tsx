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
import { ApprovalWorkflowDashboard } from '../pages/ApprovalWorkflowDashboard';
import { AIGovernanceHub } from '../pages/AIGovernanceHub';
import { ModelInventory } from '../pages/ModelInventory';
import { PromptGovernance } from '../pages/PromptGovernance';
import { AIRiskDashboard } from '../pages/AIRiskDashboard';
import { AIProgramStatusPage } from '../pages/AIProgramStatusPage';
import { AIControlsDashboard } from '../pages/AIControlsDashboard';
import { AIIncidentsDashboard } from '../pages/AIIncidentsDashboard';
import { LearningHub } from '../pages/LearningHub';
import { Reports } from '../pages/Reports';
import { ComplianceReports } from '../pages/ComplianceReports';
import { AuditReports } from '../pages/AuditReports';
import { TrendAnalytics } from '../pages/TrendAnalytics';
import { Administration } from '../pages/Administration';
import { RBACAdminDashboard } from '../pages/RBACAdminDashboard';
import { OperationsIncidentsPage } from '../pages/OperationsIncidentsPage';
import { OperationsAvailabilityPage } from '../pages/OperationsAvailabilityPage';
import { KnowledgeBestPracticesPage } from '../pages/KnowledgeBestPracticesPage';
import { KnowledgeReusableAssetsPage } from '../pages/KnowledgeReusableAssetsPage';
import { KnowledgeLessonsLearnedPage } from '../pages/KnowledgeLessonsLearnedPage';
import { TraceabilityCenter } from '../pages/TraceabilityCenter';
import { PersonaLanding } from '../pages/PersonaLanding';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ExecutiveControlTower />} />
        <Route path="persona" element={<PersonaLanding />} />
        <Route path="executive/portfolio-health" element={<PortfolioHealthPage />} />
        <Route path="executive/program-status" element={<AIProgramStatusPage />} />
        <Route path="executive/strategic-risks" element={<GovernanceRiskPage />} />
        <Route path="executive/executive-summary" element={<ExecutiveControlTower />} />
        <Route path="executive/board-reporting" element={<Reports />} />
        <Route path="delivery" element={<DeliveryHub />} />
        <Route path="requirements" element={<RequirementsHub />} />
        <Route path="architecture" element={<ArchitectureHub />} />
        <Route path="development" element={<DevelopmentHub />} />
        <Route path="testing" element={<TestingHub />} />
        <Route path="release" element={<ReleaseCenter />} />
        <Route path="production" element={<ProductionCenter />} />
        <Route path="operations" element={<OperationsCenter />} />
        <Route path="operations/incidents" element={<OperationsIncidentsPage />} />
        <Route path="operations/availability" element={<OperationsAvailabilityPage />} />
        <Route path="operations/capacity" element={<PortfolioHealthPage />} />
        <Route path="governance" element={<GovernanceCenter />} />
        <Route path="governance/compliance" element={<GovernanceCompliancePage />} />
        <Route path="governance/risk" element={<GovernanceRiskPage />} />
        <Route path="governance/evidence" element={<GovernanceEvidencePage />} />
        <Route path="governance/approval-workflow" element={<ApprovalWorkflowDashboard />} />
        <Route path="ai-governance" element={<AIGovernanceHub />} />
        <Route path="ai-governance/model-inventory" element={<ModelInventory />} />
        <Route path="ai-governance/prompt-governance" element={<PromptGovernance />} />
        <Route path="ai-governance/ai-risk" element={<AIRiskDashboard />} />
        <Route path="ai-governance/ai-controls" element={<AIControlsDashboard />} />
        <Route path="ai-governance/ai-incidents" element={<AIIncidentsDashboard />} />
        <Route path="traceability" element={<TraceabilityCenter initialTab="dashboard" />} />
        <Route path="traceability/matrix" element={<TraceabilityCenter initialTab="rtm" />} />
        <Route path="traceability/ai" element={<TraceabilityCenter initialTab="ai" />} />
        <Route path="traceability/impact" element={<TraceabilityCenter initialTab="impact" />} />
        <Route path="traceability/executive" element={<TraceabilityCenter initialTab="executive" />} />
        <Route path="traceability/reports" element={<TraceabilityCenter initialTab="reports" />} />
        <Route path="learning" element={<LearningHub />} />
        <Route path="knowledge/best-practices" element={<KnowledgeBestPracticesPage />} />
        <Route path="knowledge/reusable-assets" element={<KnowledgeReusableAssetsPage />} />
        <Route path="knowledge/lessons-learned" element={<KnowledgeLessonsLearnedPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/compliance" element={<ComplianceReports />} />
        <Route path="reports/audit" element={<AuditReports />} />
        <Route path="reports/trends" element={<TrendAnalytics />} />
        <Route path="administration" element={<Administration />} />
        <Route path="administration/rbac" element={<RBACAdminDashboard />} />
      </Route>
    </Routes>
  );
}
