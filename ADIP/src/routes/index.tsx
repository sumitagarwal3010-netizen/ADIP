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
import { GovernanceCenter } from '../pages/GovernanceCenter';
import { AIGovernanceHub } from '../pages/AIGovernanceHub';
import { LearningHub } from '../pages/LearningHub';
import { Reports } from '../pages/Reports';
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
        <Route path="operations/capacity" element={<ComingSoon title="Capacity" hub="Operations Hub" />} />
        <Route path="governance" element={<GovernanceCenter />} />
        <Route path="governance/compliance" element={<ComingSoon title="Compliance" hub="Governance Hub" />} />
        <Route path="governance/risk" element={<ComingSoon title="Risk" hub="Governance Hub" />} />
        <Route path="governance/evidence" element={<ComingSoon title="Evidence" hub="Governance Hub" />} />
        <Route path="ai-governance" element={<AIGovernanceHub />} />
        <Route path="ai-governance/model-inventory" element={<ComingSoon title="Model Inventory" hub="AI Governance Hub" />} />
        <Route path="ai-governance/prompt-governance" element={<ComingSoon title="Prompt Governance" hub="AI Governance Hub" />} />
        <Route path="ai-governance/ai-risk" element={<ComingSoon title="AI Risk" hub="AI Governance Hub" />} />
        <Route path="ai-governance/ai-controls" element={<ComingSoon title="AI Controls" hub="AI Governance Hub" />} />
        <Route path="ai-governance/ai-incidents" element={<ComingSoon title="AI Incidents" hub="AI Governance Hub" />} />
        <Route path="learning" element={<LearningHub />} />
        <Route path="knowledge/best-practices" element={<ComingSoon title="Best Practices" hub="Knowledge Hub" />} />
        <Route path="knowledge/reusable-assets" element={<ComingSoon title="Reusable Assets" hub="Knowledge Hub" />} />
        <Route path="knowledge/lessons-learned" element={<ComingSoon title="Lessons Learned" hub="Knowledge Hub" />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/compliance" element={<ComingSoon title="Compliance Reports" hub="Reports & Analytics" />} />
        <Route path="reports/audit" element={<ComingSoon title="Audit Reports" hub="Reports & Analytics" />} />
        <Route path="reports/trends" element={<ComingSoon title="Trend Analytics" hub="Reports & Analytics" />} />
        <Route path="administration" element={<Administration />} />
      </Route>
    </Routes>
  );
}
