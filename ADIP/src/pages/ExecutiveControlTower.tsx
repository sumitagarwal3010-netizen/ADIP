import { Box, Grid, Typography, Button, LinearProgress } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { DonutChart } from '../components/charts/DonutChart';
import { GaugeChart } from '../components/charts/GaugeChart';
import { HorizontalBarChart } from '../components/charts/HorizontalBarChart';
import { MultiLineChart } from '../components/charts/MultiLineChart';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { colors } from '../theme/colors';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { useWorkflow } from '../context/WorkflowContext';
import { WORKFLOW_EXEC_SUMMARY } from '../data/workflowOrchestrationMock';
import { WORKFLOW_STAGE_LABEL } from '../data/unifiedLifecycleEngine';
import { computeAuditKpis } from '../data/auditCenterEngine';
import { AUDIT_EXEC_SUMMARY } from '../data/auditCenterMock';
import { NOTIFICATION_EXEC_SUMMARY } from '../data/notificationCenterMock';
import { useNotifications } from '../context/NotificationContext';
import { usePersistence } from '../context/PersistenceContext';
import { PERSISTENCE_EXEC_SUMMARY } from '../persistence/PersistenceEngine';
import { useEventBus } from '../context/EventContext';
import { ACTIVITY_EXEC_SUMMARY } from '../data/activityCenterMock';
import { useAbac } from '../context/AbacContext';
import { ABAC_EXEC_SUMMARY } from '../data/abacCatalog';
import { useCopilot } from '../context/CopilotContext';
import { COPILOT_EXEC_SUMMARY } from '../data/copilotMockData';
import { useProductionIntelligence } from '../context/ProductionIntelligenceContext';
import { PRODUCTION_INTEL_EXEC_SUMMARY } from '../data/productionIntelligenceMock';
import { useKnowledgeCenter } from '../context/KnowledgeCenterContext';
import { KNOWLEDGE_CENTER_EXEC_SUMMARY } from '../data/knowledgeCenterMock';
import { useValueRealization } from '../context/ValueRealizationContext';
import { VALUE_REALIZATION_EXEC_SUMMARY } from '../data/valueRealizationMock';
import { usePortfolioGovernance } from '../context/PortfolioGovernanceContext';
import { PORTFOLIO_GOVERNANCE_EXEC_SUMMARY } from '../data/portfolioGovernanceMock';
import { useApplicationPortfolio } from '../context/ApplicationPortfolioContext';
import { APPLICATION_PORTFOLIO_EXEC_SUMMARY } from '../data/applicationPortfolioMock';
import { useArchitectureRepository } from '../context/ArchitectureRepositoryContext';
import { ARCHITECTURE_REPOSITORY_EXEC_SUMMARY } from '../data/architectureRepositoryMock';
import { useTechnologyStrategy } from '../context/TechnologyStrategyContext';
import { TECHNOLOGY_STRATEGY_EXEC_SUMMARY } from '../data/technologyStrategyMock';
import { useTransformationPmo } from '../context/TransformationPmoContext';
import { TRANSFORMATION_PMO_EXEC_SUMMARY } from '../data/transformationPmoMock';
import { useEnterpriseRisk } from '../context/EnterpriseRiskContext';
import { ENTERPRISE_RISK_EXEC_SUMMARY } from '../data/enterpriseRiskMock';

export function ExecutiveControlTower() {
  const { executive, release, governance, learning, dynamicInsights } = useFilteredSimulation();
  const { kpis, workflows } = useWorkflow();
  const auditKpis = computeAuditKpis();
  const { kpis: notifKpis } = useNotifications();
  const { kpis: persistKpis } = usePersistence();
  const { kpis: eventKpis } = useEventBus();
  const { kpis: abacKpis } = useAbac();
  const { kpis: copilotKpis } = useCopilot();
  const { kpis: prodIntelKpis } = useProductionIntelligence();
  const { kpis: knowledgeKpis } = useKnowledgeCenter();
  const { kpis: valueKpis } = useValueRealization();
  const { kpis: portfolioGovKpis } = usePortfolioGovernance();
  const { kpis: apmKpis } = useApplicationPortfolio();
  const { kpis: archKpis } = useArchitectureRepository();
  const { kpis: techKpis } = useTechnologyStrategy();
  const { kpis: tpmoKpis } = useTransformationPmo();
  const { kpis: ermKpis } = useEnterpriseRisk();

  const approvalBottleneckData = kpis.workflowBottlenecks.slice(0, 5).map((b) => ({
    name: WORKFLOW_STAGE_LABEL[b.stage],
    value: b.count,
  }));

  const deliveryRiskWorkflows = workflows.filter((w) => w.deliveryRisk === 'high' || w.deliveryRisk === 'critical');

  return (
    <Box>
      <Grid container spacing={1.5}>
        {executive.kpis.map((kpi, i) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard label={kpi.label} value={kpi.value} trend={kpi.trend} data={kpi.data} delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Open Risks" value={executive.openRisks} suffix="" trend={executive.portfolioMetrics[3].trend} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Open Incidents" value={executive.openIncidents} suffix="" trend={executive.portfolioMetrics[2].trend} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Business Impact" value={executive.businessImpactScore} trend={1.2} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Portfolio Health" value={executive.portfolioHealth} trend={2.4} compact />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Approval Bottlenecks" value={kpis.approvalBottlenecks} suffix="" trend={-8} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Workflow Bottlenecks" value={kpis.workflowBottlenecks[0]?.avgHours ?? 0} suffix="h" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Unified SLA Breaches" value={kpis.slaBreaches} suffix="" trend={kpis.slaBreaches > 0 ? -100 : 0} compact />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Delivery Risk Items" value={kpis.deliveryRiskCount} suffix="" trend={-15} compact />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Open Audit Findings" value={auditKpis.openFindings} chartId="audit-center.open-findings" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Evidence Coverage" value={auditKpis.evidenceCoverage} suffix="%" chartId="audit-center.evidence-coverage" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Audit Readiness" value={auditKpis.auditReadinessScore} suffix="%" chartId="audit-center.audit-readiness" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Overdue Findings" value={auditKpis.overdueFindings} chartId="audit-center.overdue-findings" compact />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <KpiCard label="Compliance Coverage" value={auditKpis.complianceCoverage} suffix="%" chartId="audit-center.compliance-coverage" compact />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Alerts" value={notifKpis.openAlerts} chartId="notification-center.open-alerts" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Critical Alerts" value={notifKpis.criticalAlerts} chartId="notification-center.critical-alerts" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Escalated" value={notifKpis.escalatedAlerts} chartId="notification-center.escalation-trend" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="SLA Breach Alerts" value={notifKpis.slaBreaches} chartId="notification-center.sla-breaches" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Unread" value={notifKpis.unreadCount} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Persistence Health" value={persistKpis.persistenceHealth} suffix="%" chartId="persistence.health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Storage Utilization" value={persistKpis.storageUtilization} suffix="%" chartId="persistence.storage-utilization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Repository Activity" value={persistKpis.repositoryActivity} chartId="persistence.repository-activity" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Data Quality" value={persistKpis.dataQualityScore} suffix="%" chartId="persistence.data-quality" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Total Records" value={persistKpis.totalRecords} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Event Volume" value={eventKpis.eventVolume} chartId="activity.volume" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Event Sources" value={eventKpis.uniqueSources} chartId="activity.events-by-source" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Critical Events" value={eventKpis.criticalEvents} chartId="activity.critical-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Workflow Activity" value={eventKpis.workflowActivity} chartId="activity.workflow-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Approval Activity" value={eventKpis.approvalActivity} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Activity" value={eventKpis.auditActivity} chartId="activity.audit-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="High Risk Events" value={eventKpis.highRiskEvents} compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Notification Events" value={eventKpis.notificationEvents} chartId="activity.notification-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="24h Volume" value={eventKpis.eventVolume24h} compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Event Health" value={eventKpis.platformEventHealth} suffix="%" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Policy Coverage" value={abacKpis.policyCoverage} suffix="%" chartId="abac.policy-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Domain Ownership" value={abacKpis.domainOwnershipCount} chartId="abac.domain-ownership" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Access Violations" value={abacKpis.accessViolations} chartId="abac.access-violations" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Scoped Resources" value={abacKpis.scopedResources} chartId="abac.scope-distribution" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="ABAC Policies" value={abacKpis.enabledPolicies} suffix={`/${abacKpis.totalPolicies}`} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="AI Recommendations" value={copilotKpis.aiRecommendations} chartId="copilot.recommendations" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Delivery Health" value={copilotKpis.deliveryHealth} suffix="%" chartId="copilot.delivery-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Portfolio Risk" value={copilotKpis.portfolioRisk} suffix="%" chartId="copilot.portfolio-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Quality Improvement" value={copilotKpis.predictedQualityImprovement} suffix="%" chartId="copilot.quality-improvement" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Projects at Risk" value={copilotKpis.projectsAtRisk} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Production Risk" value={prodIntelKpis.productionRisk} suffix="%" chartId="prod-intel.production-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Customer Impact" value={prodIntelKpis.customerImpact} suffix="%" chartId="prod-intel.customer-impact" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Defect Leakage" value={prodIntelKpis.defectLeakage} suffix="%" chartId="prod-intel.defect-leakage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Incident Trends" value={prodIntelKpis.openIncidents} chartId="prod-intel.incident-trends" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Feedback Recs" value={prodIntelKpis.feedbackRecommendations} chartId="prod-intel.feedback-recommendations" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Knowledge Coverage" value={knowledgeKpis.knowledgeCoverage} suffix="%" chartId="knowledge-center.coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Knowledge Reuse" value={knowledgeKpis.knowledgeReuse} chartId="knowledge-center.reuse" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Risk Themes" value={knowledgeKpis.topRiskThemes} chartId="knowledge-center.risk-themes" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Top Control Reuse" value={knowledgeKpis.mostReusedControls} chartId="knowledge-center.controls" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Top Playbook Reuse" value={knowledgeKpis.mostReusedPlaybooks} chartId="knowledge-center.playbooks" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Learning Adoption" value={knowledgeKpis.learningAdoption} suffix="%" chartId="knowledge-center.adoption" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="App Health" value={apmKpis.applicationHealth} suffix="%" chartId="application-portfolio.application-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Critical Apps" value={apmKpis.criticalApplications} chartId="application-portfolio.critical-applications" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Technical Debt" value={apmKpis.technicalDebt} chartId="application-portfolio.technical-debt" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Cloud Readiness" value={apmKpis.cloudReadiness} suffix="%" chartId="application-portfolio.cloud-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="AI Readiness" value={apmKpis.aiReadiness} suffix="%" chartId="application-portfolio.ai-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Annual Cost" value={`₹${(apmKpis.annualCost / 1_000_000).toFixed(0)}M`} chartId="application-portfolio.annual-cost" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Arch Health" value={archKpis.architectureHealth} suffix="%" chartId="architecture-repository.architecture-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Std Compliance" value={archKpis.standardsCompliance} suffix="%" chartId="architecture-repository.standards-compliance" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Arch Debt" value={archKpis.architectureDebt} suffix="d" chartId="architecture-repository.architecture-debt" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Tech Obsolescence" value={archKpis.technologyObsolescence} suffix="%" chartId="architecture-repository.technology-obsolescence" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Ref Adoption" value={archKpis.referenceAdoption} suffix="%" chartId="architecture-repository.reference-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Arch Risk" value={archKpis.architectureRisk} suffix="/100" chartId="architecture-repository.architecture-risk" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Tech Health" value={techKpis.technologyHealth} suffix="%" chartId="technology-strategy.technology-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Strategic Platform" value={techKpis.strategicPlatformAdoption} suffix="%" chartId="technology-strategy.strategic-platform-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Cloud Adoption" value={techKpis.cloudAdoption} suffix="%" chartId="technology-strategy.cloud-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="AI Platform" value={techKpis.aiPlatformAdoption} suffix="%" chartId="technology-strategy.ai-platform-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Tech Debt" value={techKpis.technologyDebt} suffix="%" chartId="technology-strategy.technology-debt" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Vendor Concentration" value={techKpis.vendorConcentration} suffix="%" chartId="technology-strategy.vendor-concentration" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Transformation Health" value={tpmoKpis.transformationHealth} suffix="%" chartId="transformation-pmo.transformation-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Program Delivery" value={tpmoKpis.programDelivery} suffix="%" chartId="transformation-pmo.program-delivery" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Benefits Realization" value={tpmoKpis.benefitsRealization} suffix="%" chartId="transformation-pmo.benefits-realization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Exec Commitments" value={tpmoKpis.executiveCommitments} suffix="%" chartId="transformation-pmo.executive-commitments" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Transformation ROI" value={tpmoKpis.transformationRoi} suffix="%" chartId="transformation-pmo.transformation-roi" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Board Readiness" value={tpmoKpis.boardReadiness} suffix="%" chartId="transformation-pmo.board-readiness" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Risk Exposure" value={ermKpis.enterpriseRiskExposure} suffix="/100" chartId="enterprise-risk.enterprise-risk-exposure" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Residual Risk" value={ermKpis.residualRisk} suffix="/100" chartId="enterprise-risk.residual-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Control Effectiveness" value={ermKpis.controlEffectiveness} suffix="%" chartId="enterprise-risk.control-effectiveness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Open Critical Risks" value={ermKpis.openCriticalRisks} chartId="enterprise-risk.open-critical-risks" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Cyber Risk" value={ermKpis.cyberRiskScore} suffix="/100" chartId="enterprise-risk.cyber-risk-score" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Assurance Coverage" value={ermKpis.assuranceCoverage} suffix="%" chartId="enterprise-risk.assurance-coverage" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Portfolio Health" value={portfolioGovKpis.portfolioHealth} suffix="%" chartId="portfolio-governance.portfolio-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Strategic Alignment" value={portfolioGovKpis.strategicAlignment} suffix="%" chartId="portfolio-governance.strategic-alignment" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Funding Utilization" value={portfolioGovKpis.fundingUtilization} suffix="%" chartId="portfolio-governance.funding-utilization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Capacity Utilization" value={portfolioGovKpis.capacityUtilization} suffix="%" chartId="portfolio-governance.capacity-utilization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Delivery Confidence" value={portfolioGovKpis.deliveryConfidence} suffix="%" chartId="portfolio-governance.delivery-confidence" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Demand Backlog" value={portfolioGovKpis.demandBacklog} chartId="portfolio-governance.demand-backlog" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Annual Value" value={`₹${(valueKpis.annualValueRealized / 1_000_000).toFixed(1)}M`} chartId="value-realization.annual-value" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="ROI" value={valueKpis.roi} suffix="%" chartId="value-realization.roi" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Transformation Score" value={valueKpis.transformationScore} suffix="%" chartId="value-realization.transformation-score" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Productivity Gain" value={valueKpis.productivityGain} suffix="%" chartId="value-realization.productivity" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Risk Reduction" value={valueKpis.riskReduction} suffix="%" chartId="value-realization.risk-reduction" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Audit Efficiency" value={valueKpis.auditEfficiency} suffix="%" chartId="value-realization.audit-efficiency" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Unified Lifecycle — Stage Bottlenecks" subtitle="Approval + workflow gates across SDLC hubs" />
            <HorizontalBarChart data={approvalBottleneckData.length > 0 ? approvalBottleneckData : [{ name: 'Release', value: 2 }]} height={180} chartId="workflow.bottlenecks" />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Delivery Risk" subtitle="High/critical unified lifecycle items" />
            {deliveryRiskWorkflows.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No elevated delivery risk</Typography>
            ) : (
              deliveryRiskWorkflows.map((w) => (
                <Box key={w.id} sx={{ mb: 1, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{w.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {w.lifecycleStatus} · {w.deliveryRisk} risk · Audit: {w.auditStatus} · {w.openNotifications} alerts ({w.criticalNotifications} critical)
                  </Typography>
                </Box>
              ))
            )}
          </GlassCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Unified Lifecycle — Executive Summary" insight={WORKFLOW_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Enterprise Audit — Executive Summary" insight={AUDIT_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Notification & Escalation — Executive Summary" insight={NOTIFICATION_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Persistence Layer — Executive Summary" insight={PERSISTENCE_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Event Bus & Activity Stream — Executive Summary" insight={ACTIVITY_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="ABAC & Domain Security — Executive Summary" insight={ABAC_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="AI Delivery Copilot — Executive Summary" insight={COPILOT_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Production Intelligence — Executive Summary" insight={PRODUCTION_INTEL_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Knowledge & Learning — Executive Summary" insight={KNOWLEDGE_CENTER_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Value Realization — Executive Summary" insight={VALUE_REALIZATION_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Portfolio Governance — Executive Summary" insight={PORTFOLIO_GOVERNANCE_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Application Portfolio — Executive Summary" insight={APPLICATION_PORTFOLIO_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Enterprise Architecture — Executive Summary" insight={ARCHITECTURE_REPOSITORY_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Technology Strategy — Executive Summary" insight={TECHNOLOGY_STRATEGY_EXEC_SUMMARY} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Transformation PMO — Executive Summary" insight={TRANSFORMATION_PMO_EXEC_SUMMARY} />
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Enterprise Risk — Executive Summary" insight={ENTERPRISE_RISK_EXEC_SUMMARY} />
        </Box>
      </Box>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        {executive.domainHealth.map((d, i) => (
          <Grid key={d.name} size={{ xs: 6, md: 4 }}>
            <GlassCard delay={0.1 + i * 0.05} sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{d.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{d.score}%</Typography>
                <Typography variant="caption" color="text.secondary">Health</Typography>
              </Box>
              <Box sx={{ height: 32, mt: 0.5 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.trend}>
                    <Area type="monotone" dataKey="value" stroke={colors.primary} fill={`${colors.primary}22`} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {[
                  { l: 'Changes', v: d.changes },
                  { l: 'Risks', v: d.risks },
                  { l: 'Incidents', v: d.incidents },
                ].map((m) => (
                  <Box key={m.l} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>{m.l}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.v}</Typography>
                  </Box>
                ))}
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader number={1} title="Domain Confidence Trend" subtitle="Net Banking · Mobile · Payments" />
            <MultiLineChart
              data={executive.confidenceTrend}
              series={[
                { key: 'net', color: colors.primary, name: 'Net Banking' },
                { key: 'mobile', color: colors.info, name: 'Mobile Banking' },
                { key: 'payments', color: colors.warning, name: 'Payments' },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }} glow="purple">
            <ModuleHeader title="Executive Insights" subtitle="Live · updates every 30s" />
            {dynamicInsights.map((insight) => (
              <Typography key={insight} variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mb: 1, lineHeight: 1.5 }}>
                • {insight}
              </Typography>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        {executive.portfolioMetrics.map((m, i) => (
          <Grid key={m.label} size={{ xs: 6, md: 3 }}>
            <KpiCard label={m.label} value={m.value} suffix="" trend={m.trend} delay={0.1 + i * 0.05} compact />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Risk by SDLC Phase" />
            <DonutChart chartId="executive.risk-by-phase" data={executive.riskByPhase} centerLabel="Open Risks" centerValue={executive.openRisks} height={150} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }} glow="green">
            <ModuleHeader title="Release Confidence" />
            <GaugeChart chartId="release.confidence-gauge" value={release.confidence} label="Enterprise Avg" showGo />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Business Impact Areas" />
            <HorizontalBarChart chartId="executive.business-impact" data={executive.businessImpactAreas} height={150} barColor={colors.secondary} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Critical Incidents" />
            {executive.criticalIncidents.map((inc) => (
              <DrilldownTableRow
                key={inc.id}
                chartId="executive.critical-incidents"
                segment={inc.id}
                label={inc.title}
                value={inc.id}
                sx={{ p: 1, mb: 0.75, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{inc.id}</Typography>
                  <SeverityChip severity={inc.severity} />
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>{inc.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{inc.domain} · {inc.duration}</Typography>
              </DrilldownTableRow>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Enterprise Scorecard" />
            {executive.scorecard.map((s) => (
              <Box key={s.label} sx={{ mb: 1.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption">{s.label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{s.value}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={s.value}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': { bgcolor: s.value >= 90 ? colors.success : colors.primary },
                  }}
                />
              </Box>
            ))}
            <ModuleHeader title="Governance Snapshot" />
            <DonutChart chartId="finding-severity" data={governance.findingSeverity} centerLabel="Findings" height={120} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Active AI Scans" />
        <Grid container spacing={1.5}>
          {executive.activeScans.map((scan) => (
            <Grid key={scan.name} size={{ xs: 12, md: 4 }}>
              <Box sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{scan.name}</Typography>
                <LinearProgress variant="determinate" value={scan.progress} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                <Typography variant="caption" color="text.secondary">{scan.status} · {scan.progress}%</Typography>
              </Box>
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Lessons learned: {learning.lessonsLearned} · Reusable assets: {learning.reusableAssets}
            </Typography>
            <Button size="small" sx={{ mt: 1, fontSize: '0.75rem' }}>View Learning Hub →</Button>
          </Grid>
        </Grid>
      </GlassCard>

      <HubArtifactGenerator hubKey="executive" />
    </Box>
  );
}
