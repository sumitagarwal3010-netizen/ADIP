import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { AuthGuard } from '../components/auth/AuthGuard';
import { LoginPage } from '../pages/LoginPage';
import { AuthenticationHealthDashboard } from '../pages/AuthenticationHealthDashboard';
import { ExecutiveControlTower } from '../pages/ExecutiveControlTower';
import { DeliveryHub } from '../pages/DeliveryHub';
import { RequirementsHub } from '../pages/RequirementsHub';
import { ArchitectureHub } from '../pages/ArchitectureHub';
import { DevelopmentHub } from '../pages/DevelopmentHub';
import { TestingHub } from '../pages/TestingHub';
import { ReleaseCenter } from '../pages/ReleaseCenter';
import { ProductionIntelligenceCenter } from '../pages/ProductionIntelligenceCenter';
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
import { KnowledgeLearningCenter } from '../pages/KnowledgeLearningCenter';
import { ValueRealizationCenter } from '../pages/ValueRealizationCenter';
import { PortfolioGovernanceCenter } from '../pages/PortfolioGovernanceCenter';
import { ApplicationPortfolioCenter } from '../pages/ApplicationPortfolioCenter';
import { ArchitectureRepositoryCenter } from '../pages/ArchitectureRepositoryCenter';
import { TechnologyStrategyCenter } from '../pages/TechnologyStrategyCenter';
import { TransformationPmoCenter } from '../pages/TransformationPmoCenter';
import { EnterpriseRiskCenter } from '../pages/EnterpriseRiskCenter';
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
import { WorkflowOrchestrationDashboard } from '../pages/WorkflowOrchestrationDashboard';
import { AuditCenter } from '../pages/AuditCenter';
import { NotificationCenter } from '../pages/NotificationCenter';
import { AbacAdminDashboard } from '../pages/AbacAdminDashboard';
import { PersistenceAdminDashboard } from '../pages/PersistenceAdminDashboard';
import { ActivityCenter } from '../pages/ActivityCenter';
import { AiDeliveryCopilotCenter } from '../pages/AiDeliveryCopilotCenter';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
      <Route element={<AppLayout />}>
        <Route index element={<ExecutiveControlTower />} />
        <Route path="persona" element={<PersonaLanding />} />
        <Route path="executive/portfolio-health" element={<PortfolioHealthPage />} />
        <Route path="executive/program-status" element={<AIProgramStatusPage />} />
        <Route path="executive/strategic-risks" element={<GovernanceRiskPage />} />
        <Route path="executive/executive-summary" element={<ExecutiveControlTower />} />
        <Route path="executive/board-reporting" element={<Reports />} />
        <Route path="executive/authentication" element={<AuthenticationHealthDashboard />} />
        <Route path="executive/workflow-orchestration" element={<WorkflowOrchestrationDashboard />} />
        <Route path="executive/ai-copilot" element={<AiDeliveryCopilotCenter initialTab="dashboard" />} />
        <Route path="executive/ai-copilot/workspace" element={<AiDeliveryCopilotCenter initialTab="workspace" />} />
        <Route path="executive/ai-copilot/health" element={<AiDeliveryCopilotCenter initialTab="health" />} />
        <Route path="executive/ai-copilot/requirements" element={<AiDeliveryCopilotCenter initialTab="requirements" />} />
        <Route path="executive/ai-copilot/architecture" element={<AiDeliveryCopilotCenter initialTab="architecture" />} />
        <Route path="executive/ai-copilot/development" element={<AiDeliveryCopilotCenter initialTab="development" />} />
        <Route path="executive/ai-copilot/testing" element={<AiDeliveryCopilotCenter initialTab="testing" />} />
        <Route path="executive/ai-copilot/release" element={<AiDeliveryCopilotCenter initialTab="release" />} />
        <Route path="executive/ai-copilot/audit" element={<AiDeliveryCopilotCenter initialTab="audit" />} />
        <Route path="executive/ai-copilot/executive" element={<AiDeliveryCopilotCenter initialTab="executive" />} />
        <Route path="executive/ai-copilot/improvement" element={<AiDeliveryCopilotCenter initialTab="improvement" />} />
        <Route path="executive/ai-copilot/reports" element={<AiDeliveryCopilotCenter initialTab="reports" />} />
        <Route path="executive/value-realization" element={<ValueRealizationCenter initialTab="dashboard" />} />
        <Route path="executive/value-realization/productivity" element={<ValueRealizationCenter initialTab="productivity" />} />
        <Route path="executive/value-realization/delivery" element={<ValueRealizationCenter initialTab="delivery" />} />
        <Route path="executive/value-realization/quality" element={<ValueRealizationCenter initialTab="quality" />} />
        <Route path="executive/value-realization/governance" element={<ValueRealizationCenter initialTab="governance" />} />
        <Route path="executive/value-realization/audit" element={<ValueRealizationCenter initialTab="audit" />} />
        <Route path="executive/value-realization/ai-adoption" element={<ValueRealizationCenter initialTab="ai-adoption" />} />
        <Route path="executive/value-realization/scorecard" element={<ValueRealizationCenter initialTab="scorecard" />} />
        <Route path="executive/value-realization/roi" element={<ValueRealizationCenter initialTab="roi" />} />
        <Route path="executive/value-realization/business-case" element={<ValueRealizationCenter initialTab="business-case" />} />
        <Route path="executive/value-realization/benchmarking" element={<ValueRealizationCenter initialTab="benchmarking" />} />
        <Route path="executive/value-realization/reports" element={<ValueRealizationCenter initialTab="reports" />} />
        <Route path="executive/portfolio-governance" element={<PortfolioGovernanceCenter initialTab="dashboard" />} />
        <Route path="executive/portfolio-governance/demand" element={<PortfolioGovernanceCenter initialTab="demand" />} />
        <Route path="executive/portfolio-governance/business-case" element={<PortfolioGovernanceCenter initialTab="business-case" />} />
        <Route path="executive/portfolio-governance/investment" element={<PortfolioGovernanceCenter initialTab="investment" />} />
        <Route path="executive/portfolio-governance/capacity" element={<PortfolioGovernanceCenter initialTab="capacity" />} />
        <Route path="executive/portfolio-governance/resources" element={<PortfolioGovernanceCenter initialTab="resources" />} />
        <Route path="executive/portfolio-governance/alignment" element={<PortfolioGovernanceCenter initialTab="alignment" />} />
        <Route path="executive/portfolio-governance/roadmap" element={<PortfolioGovernanceCenter initialTab="roadmap" />} />
        <Route path="executive/portfolio-governance/risks" element={<PortfolioGovernanceCenter initialTab="risks" />} />
        <Route path="executive/portfolio-governance/benefits" element={<PortfolioGovernanceCenter initialTab="benefits" />} />
        <Route path="executive/portfolio-governance/insights" element={<PortfolioGovernanceCenter initialTab="insights" />} />
        <Route path="executive/portfolio-governance/reports" element={<PortfolioGovernanceCenter initialTab="reports" />} />
        <Route path="executive/application-portfolio" element={<ApplicationPortfolioCenter initialTab="dashboard" />} />
        <Route path="executive/application-portfolio/inventory" element={<ApplicationPortfolioCenter initialTab="inventory" />} />
        <Route path="executive/application-portfolio/technology-health" element={<ApplicationPortfolioCenter initialTab="technology-health" />} />
        <Route path="executive/application-portfolio/criticality" element={<ApplicationPortfolioCenter initialTab="criticality" />} />
        <Route path="executive/application-portfolio/technical-debt" element={<ApplicationPortfolioCenter initialTab="technical-debt" />} />
        <Route path="executive/application-portfolio/modernization" element={<ApplicationPortfolioCenter initialTab="modernization" />} />
        <Route path="executive/application-portfolio/cloud" element={<ApplicationPortfolioCenter initialTab="cloud" />} />
        <Route path="executive/application-portfolio/ai-readiness" element={<ApplicationPortfolioCenter initialTab="ai-readiness" />} />
        <Route path="executive/application-portfolio/risks" element={<ApplicationPortfolioCenter initialTab="risks" />} />
        <Route path="executive/application-portfolio/dependencies" element={<ApplicationPortfolioCenter initialTab="dependencies" />} />
        <Route path="executive/application-portfolio/lifecycle" element={<ApplicationPortfolioCenter initialTab="lifecycle" />} />
        <Route path="executive/application-portfolio/rationalization" element={<ApplicationPortfolioCenter initialTab="rationalization" />} />
        <Route path="executive/application-portfolio/insights" element={<ApplicationPortfolioCenter initialTab="insights" />} />
        <Route path="executive/application-portfolio/reports" element={<ApplicationPortfolioCenter initialTab="reports" />} />
        <Route path="executive/architecture-repository" element={<ArchitectureRepositoryCenter initialTab="dashboard" />} />
        <Route path="executive/architecture-repository/domains" element={<ArchitectureRepositoryCenter initialTab="domains" />} />
        <Route path="executive/architecture-repository/capabilities" element={<ArchitectureRepositoryCenter initialTab="capabilities" />} />
        <Route path="executive/architecture-repository/applications" element={<ArchitectureRepositoryCenter initialTab="applications" />} />
        <Route path="executive/architecture-repository/review-board" element={<ArchitectureRepositoryCenter initialTab="review-board" />} />
        <Route path="executive/architecture-repository/findings" element={<ArchitectureRepositoryCenter initialTab="findings" />} />
        <Route path="executive/architecture-repository/exceptions" element={<ArchitectureRepositoryCenter initialTab="exceptions" />} />
        <Route path="executive/architecture-repository/standards" element={<ArchitectureRepositoryCenter initialTab="standards" />} />
        <Route path="executive/architecture-repository/reference" element={<ArchitectureRepositoryCenter initialTab="reference" />} />
        <Route path="executive/architecture-repository/debt" element={<ArchitectureRepositoryCenter initialTab="debt" />} />
        <Route path="executive/architecture-repository/lifecycle" element={<ArchitectureRepositoryCenter initialTab="lifecycle" />} />
        <Route path="executive/architecture-repository/cloud" element={<ArchitectureRepositoryCenter initialTab="cloud" />} />
        <Route path="executive/architecture-repository/ai" element={<ArchitectureRepositoryCenter initialTab="ai" />} />
        <Route path="executive/architecture-repository/risks" element={<ArchitectureRepositoryCenter initialTab="risks" />} />
        <Route path="executive/architecture-repository/insights" element={<ArchitectureRepositoryCenter initialTab="insights" />} />
        <Route path="executive/architecture-repository/reports" element={<ArchitectureRepositoryCenter initialTab="reports" />} />
        <Route path="executive/technology-strategy" element={<TechnologyStrategyCenter initialTab="dashboard" />} />
        <Route path="executive/technology-strategy/standards" element={<TechnologyStrategyCenter initialTab="standards" />} />
        <Route path="executive/technology-strategy/lifecycle" element={<TechnologyStrategyCenter initialTab="lifecycle" />} />
        <Route path="executive/technology-strategy/roadmaps" element={<TechnologyStrategyCenter initialTab="roadmaps" />} />
        <Route path="executive/technology-strategy/strategic-platforms" element={<TechnologyStrategyCenter initialTab="strategic-platforms" />} />
        <Route path="executive/technology-strategy/cloud" element={<TechnologyStrategyCenter initialTab="cloud" />} />
        <Route path="executive/technology-strategy/ai-platform" element={<TechnologyStrategyCenter initialTab="ai-platform" />} />
        <Route path="executive/technology-strategy/vendors" element={<TechnologyStrategyCenter initialTab="vendors" />} />
        <Route path="executive/technology-strategy/investments" element={<TechnologyStrategyCenter initialTab="investments" />} />
        <Route path="executive/technology-strategy/risks" element={<TechnologyStrategyCenter initialTab="risks" />} />
        <Route path="executive/technology-strategy/modernization" element={<TechnologyStrategyCenter initialTab="modernization" />} />
        <Route path="executive/technology-strategy/insights" element={<TechnologyStrategyCenter initialTab="insights" />} />
        <Route path="executive/technology-strategy/reports" element={<TechnologyStrategyCenter initialTab="reports" />} />
        <Route path="executive/transformation-pmo" element={<TransformationPmoCenter initialTab="dashboard" />} />
        <Route path="executive/transformation-pmo/programs" element={<TransformationPmoCenter initialTab="programs" />} />
        <Route path="executive/transformation-pmo/initiatives" element={<TransformationPmoCenter initialTab="initiatives" />} />
        <Route path="executive/transformation-pmo/objectives" element={<TransformationPmoCenter initialTab="objectives" />} />
        <Route path="executive/transformation-pmo/milestones" element={<TransformationPmoCenter initialTab="milestones" />} />
        <Route path="executive/transformation-pmo/benefits" element={<TransformationPmoCenter initialTab="benefits" />} />
        <Route path="executive/transformation-pmo/commitments" element={<TransformationPmoCenter initialTab="commitments" />} />
        <Route path="executive/transformation-pmo/dependencies" element={<TransformationPmoCenter initialTab="dependencies" />} />
        <Route path="executive/transformation-pmo/risks" element={<TransformationPmoCenter initialTab="risks" />} />
        <Route path="executive/transformation-pmo/business-units" element={<TransformationPmoCenter initialTab="business-units" />} />
        <Route path="executive/transformation-pmo/insights" element={<TransformationPmoCenter initialTab="insights" />} />
        <Route path="executive/transformation-pmo/reports" element={<TransformationPmoCenter initialTab="reports" />} />
        <Route path="executive/enterprise-risk" element={<EnterpriseRiskCenter initialTab="dashboard" />} />
        <Route path="executive/enterprise-risk/register" element={<EnterpriseRiskCenter initialTab="register" />} />
        <Route path="executive/enterprise-risk/operational" element={<EnterpriseRiskCenter initialTab="operational" />} />
        <Route path="executive/enterprise-risk/technology" element={<EnterpriseRiskCenter initialTab="technology" />} />
        <Route path="executive/enterprise-risk/cyber" element={<EnterpriseRiskCenter initialTab="cyber" />} />
        <Route path="executive/enterprise-risk/ai" element={<EnterpriseRiskCenter initialTab="ai" />} />
        <Route path="executive/enterprise-risk/regulatory" element={<EnterpriseRiskCenter initialTab="regulatory" />} />
        <Route path="executive/enterprise-risk/audit-findings" element={<EnterpriseRiskCenter initialTab="audit-findings" />} />
        <Route path="executive/enterprise-risk/controls" element={<EnterpriseRiskCenter initialTab="controls" />} />
        <Route path="executive/enterprise-risk/appetite" element={<EnterpriseRiskCenter initialTab="appetite" />} />
        <Route path="executive/enterprise-risk/assurance" element={<EnterpriseRiskCenter initialTab="assurance" />} />
        <Route path="executive/enterprise-risk/insights" element={<EnterpriseRiskCenter initialTab="insights" />} />
        <Route path="executive/enterprise-risk/reports" element={<EnterpriseRiskCenter initialTab="reports" />} />
        <Route path="delivery" element={<DeliveryHub />} />
        <Route path="requirements" element={<RequirementsHub />} />
        <Route path="architecture" element={<ArchitectureHub />} />
        <Route path="development" element={<DevelopmentHub />} />
        <Route path="testing" element={<TestingHub />} />
        <Route path="release" element={<ReleaseCenter />} />
        <Route path="production" element={<ProductionIntelligenceCenter initialTab="dashboard" />} />
        <Route path="production/incidents" element={<ProductionIntelligenceCenter initialTab="incidents" />} />
        <Route path="production/leakage" element={<ProductionIntelligenceCenter initialTab="leakage" />} />
        <Route path="production/customer" element={<ProductionIntelligenceCenter initialTab="customer" />} />
        <Route path="production/applications" element={<ProductionIntelligenceCenter initialTab="applications" />} />
        <Route path="production/releases" element={<ProductionIntelligenceCenter initialTab="releases" />} />
        <Route path="production/rca" element={<ProductionIntelligenceCenter initialTab="rca" />} />
        <Route path="production/feedback" element={<ProductionIntelligenceCenter initialTab="feedback" />} />
        <Route path="production/reports" element={<ProductionIntelligenceCenter initialTab="reports" />} />
        <Route path="operations" element={<OperationsCenter />} />
        <Route path="operations/incidents" element={<OperationsIncidentsPage />} />
        <Route path="operations/availability" element={<OperationsAvailabilityPage />} />
        <Route path="operations/capacity" element={<PortfolioHealthPage />} />
        <Route path="operations/notifications" element={<NotificationCenter initialTab="dashboard" />} />
        <Route path="operations/notifications/inbox" element={<NotificationCenter initialTab="inbox" />} />
        <Route path="operations/notifications/escalations" element={<NotificationCenter initialTab="escalations" />} />
        <Route path="operations/notifications/delivery" element={<NotificationCenter initialTab="delivery" />} />
        <Route path="operations/notifications/history" element={<NotificationCenter initialTab="history" />} />
        <Route path="operations/notifications/reports" element={<NotificationCenter initialTab="reports" />} />
        <Route path="governance" element={<GovernanceCenter />} />
        <Route path="governance/compliance" element={<GovernanceCompliancePage />} />
        <Route path="governance/risk" element={<GovernanceRiskPage />} />
        <Route path="governance/evidence" element={<GovernanceEvidencePage />} />
        <Route path="governance/approval-workflow" element={<ApprovalWorkflowDashboard />} />
        <Route path="governance/activity-center" element={<ActivityCenter initialTab="dashboard" />} />
        <Route path="governance/activity-center/stream" element={<ActivityCenter initialTab="stream" />} />
        <Route path="governance/activity-center/analytics" element={<ActivityCenter initialTab="analytics" />} />
        <Route path="governance/activity-center/sources" element={<ActivityCenter initialTab="sources" />} />
        <Route path="governance/activity-center/history" element={<ActivityCenter initialTab="history" />} />
        <Route path="governance/activity-center/lineage" element={<ActivityCenter initialTab="lineage" />} />
        <Route path="governance/activity-center/reports" element={<ActivityCenter initialTab="reports" />} />
        <Route path="governance/audit-center" element={<AuditCenter initialTab="dashboard" />} />
        <Route path="governance/audit-center/findings" element={<AuditCenter initialTab="findings" />} />
        <Route path="governance/audit-center/observations" element={<AuditCenter initialTab="observations" />} />
        <Route path="governance/audit-center/evidence" element={<AuditCenter initialTab="evidence" />} />
        <Route path="governance/audit-center/timeline" element={<AuditCenter initialTab="timeline" />} />
        <Route path="governance/audit-center/compliance" element={<AuditCenter initialTab="compliance" />} />
        <Route path="governance/audit-center/readiness" element={<AuditCenter initialTab="readiness" />} />
        <Route path="governance/audit-center/lineage" element={<AuditCenter initialTab="lineage" />} />
        <Route path="governance/audit-center/reports" element={<AuditCenter initialTab="reports" />} />
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
        <Route path="traceability/lifecycle" element={<TraceabilityCenter initialTab="lifecycle" />} />
        <Route path="traceability/evidence" element={<TraceabilityCenter initialTab="evidence" />} />
        <Route path="traceability/events" element={<TraceabilityCenter initialTab="events" />} />
        <Route path="traceability/reports" element={<TraceabilityCenter initialTab="reports" />} />
        <Route path="knowledge-center" element={<KnowledgeLearningCenter initialTab="dashboard" />} />
        <Route path="knowledge-center/lessons" element={<KnowledgeLearningCenter initialTab="lessons" />} />
        <Route path="knowledge-center/best-practices" element={<KnowledgeLearningCenter initialTab="best-practices" />} />
        <Route path="knowledge-center/patterns" element={<KnowledgeLearningCenter initialTab="patterns" />} />
        <Route path="knowledge-center/controls" element={<KnowledgeLearningCenter initialTab="controls" />} />
        <Route path="knowledge-center/rca" element={<KnowledgeLearningCenter initialTab="rca" />} />
        <Route path="knowledge-center/playbooks" element={<KnowledgeLearningCenter initialTab="playbooks" />} />
        <Route path="knowledge-center/search" element={<KnowledgeLearningCenter initialTab="search" />} />
        <Route path="knowledge-center/recommendations" element={<KnowledgeLearningCenter initialTab="recommendations" />} />
        <Route path="knowledge-center/reports" element={<KnowledgeLearningCenter initialTab="reports" />} />
        <Route path="learning" element={<KnowledgeLearningCenter initialTab="dashboard" />} />
        <Route path="knowledge/best-practices" element={<KnowledgeBestPracticesPage />} />
        <Route path="knowledge/reusable-assets" element={<KnowledgeReusableAssetsPage />} />
        <Route path="knowledge/lessons-learned" element={<KnowledgeLessonsLearnedPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/compliance" element={<ComplianceReports />} />
        <Route path="reports/audit" element={<AuditReports />} />
        <Route path="reports/trends" element={<TrendAnalytics />} />
        <Route path="administration" element={<Administration />} />
        <Route path="administration/rbac" element={<RBACAdminDashboard />} />
        <Route path="administration/persistence" element={<PersistenceAdminDashboard />} />
        <Route path="administration/abac" element={<AbacAdminDashboard />} />
      </Route>
      </Route>
    </Routes>
  );
}
