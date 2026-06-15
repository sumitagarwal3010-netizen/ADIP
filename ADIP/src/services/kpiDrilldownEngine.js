import { sparkline7d } from './mockDataEngine.js';
import {
  AI_CONTROLS,
  AI_INCIDENTS,
  AI_CONTROLS_TREND,
  AI_INCIDENTS_TREND,
} from '../data/aiGovernanceModulesMock.ts';
import {
  APPROVAL_REQUESTS,
  APPROVAL_HISTORY,
  APPROVAL_TREND,
  APPROVALS_BY_STAGE,
  approvalToDrilldownRecord,
} from '../data/approvalWorkflowMock.ts';
import {
  PENDING_STATUSES,
  IN_PROGRESS_STATUSES,
  isOverdue,
} from '../data/approvalWorkflowEngine.ts';
import {
  ROLE_CATALOG,
  ROLE_MAP,
  PERMISSION_CATALOG,
  RESOURCE_CATALOG,
  PERSONA_ENTITLEMENT_MATRIX,
  RBAC_KPI_MOCK,
  PERSONA_RBAC_ROLE,
} from '../data/rbacCatalog.ts';
import { WORKFLOW_ORCHESTRATION_MOCK } from '../data/workflowOrchestrationMock.ts';
import { WORKFLOW_STAGE_LABEL } from '../data/workflowOrchestrationEngine.ts';
import {
  AUDIT_EVIDENCE,
  AUDIT_FINDINGS,
  AUDIT_OBSERVATIONS,
  AUDIT_TIMELINE,
} from '../data/auditCenterMock.ts';
import { computeAuditKpis } from '../data/auditCenterEngine.ts';
import {
  PLATFORM_NOTIFICATIONS,
  ESCALATION_NOTIFICATIONS,
} from '../data/notificationCenterMock.ts';
import { computeNotificationKpis } from '../data/notificationCenterEngine.ts';
import { computePersistenceKpis } from '../persistence/PersistenceEngine.ts';
import { getPersistenceLayer } from '../context/PersistenceContext.tsx';
import { computeActivityKpis } from '../data/activityStreamEngine.ts';
import { getEventBus } from '../context/EventContext.tsx';
import { computeAbacKpis } from '../data/abacEngine.ts';
import { buildVisibilityScope } from '../data/abacCatalog.ts';
import {
  computeCopilotKpis,
  topRecurringIssues,
  domainRiskChart,
  recommendationTrend,
} from '../data/copilotEngine.ts';
import {
  COPILOT_PROJECTS,
  COPILOT_RECOMMENDATIONS,
  COPILOT_RISK_OBSERVATIONS,
  COPILOT_IMPROVEMENT_ACTIONS,
} from '../data/copilotMockData.ts';
import {
  computeProductionIntelligenceKpis,
  leakageByStage,
  rcaPatternChart,
  topLeakageApplications,
  feedbackByDomain,
} from '../data/productionIntelligenceEngine.ts';
import {
  PRODUCTION_APPLICATIONS,
  PRODUCTION_INCIDENTS,
  PRODUCTION_DEFECTS,
  CUSTOMER_SIGNALS,
  FEEDBACK_RECOMMENDATIONS,
} from '../data/productionIntelligenceMock.ts';
import {
  computeKnowledgeCenterKpis,
  topRiskThemes,
  mostReusedControls,
  mostReusedPlaybooks,
  knowledgeByCategory,
  bestPracticeByDomain,
  recommendationsBySource,
} from '../data/knowledgeCenterEngine.ts';
import {
  LESSONS_LEARNED,
  BEST_PRACTICES,
  REUSABLE_CONTROLS,
  SDLC_PLAYBOOKS,
  LEARNING_RECOMMENDATIONS,
} from '../data/knowledgeCenterMock.ts';
import {
  computeValueRealizationKpis,
  PRODUCTIVITY_GAINS,
  MATURITY_SCORES,
  BENCHMARK_METRICS,
  VALUE_TRACEABILITY_CHAINS,
} from '../data/valueRealizationEngine.ts';
import {
  PROGRAMS,
  PORTFOLIOS,
  VALUE_TREND_HISTORY,
} from '../data/valueRealizationMock.ts';
import {
  computePortfolioGovernanceKpis,
  demandTopPrioritized,
  portfolioHealthByPortfolio,
} from '../data/portfolioGovernanceEngine.ts';
import {
  PG_DEMAND_REQUESTS,
  PG_PORTFOLIOS,
  PG_PORTFOLIO_HISTORY,
  PG_TRACEABILITY_CHAINS,
} from '../data/portfolioGovernanceMock.ts';
import {
  computeApplicationPortfolioKpis,
  applicationsByDomain,
  rationalizationCandidates,
  topTechnicalDebt,
} from '../data/applicationPortfolioEngine.ts';
import {
  APM_APPLICATIONS,
  APM_LIFECYCLE_HISTORY,
  APM_TECH_STACKS,
  APM_TRACEABILITY_CHAINS,
} from '../data/applicationPortfolioMock.ts';
import {
  computeArchitectureRepositoryKpis,
  obsoletePlatforms as archObsoletePlatforms,
  topArchitectureDebt as archTopDebt,
  openFindings as archOpenFindings,
  activeExceptions as archActiveExceptions,
  integrationRisks as archIntegrationRisks,
  referenceAdoptionSummary as archReferenceAdoption,
  modernizationCandidates as archModernization,
} from '../data/architectureRepositoryEngine.ts';
import {
  ARCH_APPLICATIONS,
} from '../data/architectureRepositoryMock.ts';
import {
  computeTechnologyStrategyKpis,
  retirementCandidates as techRetirementCandidates,
  topVendorRisks as techTopVendorRisks,
  topTechnologyRisks as techTopRisks,
  modernizationInitiatives as techModernization,
  strategicPlatformAdoptionChart as techPlatformAdoption,
  topCloudPlatforms as techTopClouds,
  topAiPlatforms as techTopAis,
  topInvestments as techTopInvestments,
} from '../data/technologyStrategyEngine.ts';
import {
  TECHNOLOGIES,
  TECH_STANDARDS,
} from '../data/technologyStrategyMock.ts';
import {
  computeTransformationPmoKpis,
  atRiskPrograms as tpmoAtRiskPrograms,
  topPrograms as tpmoTopPrograms,
  objectivesSummary as tpmoObjectives,
  upcomingCriticalMilestones as tpmoCriticalMilestones,
  topBenefits as tpmoTopBenefits,
  commitmentsAtRisk as tpmoCommitmentsAtRisk,
  riskyDependencies as tpmoRiskyDeps,
  businessUnitPerformanceChart as tpmoBuChart,
  topInitiatives as tpmoTopInitiatives,
} from '../data/transformationPmoEngine.ts';
import {
  computeEnterpriseRiskKpis,
  topEnterpriseRisks as ermTopRisks,
  criticalOpenRisks as ermCriticalRisks,
  ineffectiveControls as ermWeakControls,
  topCyberRisks as ermTopCyber,
  topAiRisks as ermTopAi,
  topRegulatoryRisks as ermTopRegulatory,
  openAuditFindings as ermOpenFindings,
  assuranceReviews as ermAssuranceReviews,
} from '../data/enterpriseRiskEngine.ts';
import { ERM_RISK_APPETITE } from '../data/enterpriseRiskMock.ts';

/** @typedef {import('../types/kpiDrilldown').KpiDrilldownPayload} KpiDrilldownPayload */
/** @typedef {import('../types/kpiDrilldown').KpiDrilldownContext} KpiDrilldownContext */
/** @typedef {import('../types/simulation').SimulationState} SimulationState */

/**
 * @param {SimulationState} state
 * @returns {{ name: string; status?: string }[]}
 */
function appsFromArchitecture(state) {
  return state.architecture.services.map((s) => ({
    name: s.label,
    status: s.risk,
  }));
}

/**
 * @param {SimulationState} state
 * @returns {{ id: string; title: string; severity: string; domain?: string }[]}
 */
function incidentsFromState(state) {
  return state.production.openIncidents.map((i) => ({
    id: i.id,
    title: i.title,
    severity: i.severity,
    domain: i.domain,
  }));
}

/**
 * @param {SimulationState} state
 * @returns {{ id: string; name: string; confidence: number; risk: string }[]}
 */
function releasesFromState(state) {
  return state.release.releases.map((r) => ({
    id: r.id,
    name: r.name,
    confidence: r.confidence,
    risk: r.risk,
  }));
}

/**
 * @param {SimulationState} state
 * @returns {import('../data/aiUseCaseRegistryMock').AIUseCase[]}
 */
function useCasesFromState(state) {
  return state.aiGovernance?.useCases ?? [];
}

/**
 * @param {SimulationState} state
 * @param {import('../data/aiUseCaseRegistryMock').AIUseCase} uc
 * @param {KpiDrilldownContext} ctx
 * @returns {KpiDrilldownPayload}
 */
function buildUseCaseDrilldown(state, uc, ctx) {
  return buildPayload(ctx, {
    sourceRecords: uc.reviewHistory.map((r, i) => ({
      id: `REV-${i + 1}`,
      title: r.outcome,
      detail: r.reviewer,
      meta: r.date,
    })),
    supportingEvidence: [
      uc.description,
      `Model: ${uc.modelName} · Owner: ${uc.owner}`,
      `Compliance: ${uc.complianceFramework}`,
      `Data classification: ${uc.dataClassification}`,
      ...uc.controls,
    ],
    relatedApplications: appsFromArchitecture(state).filter((a) =>
      uc.domain === 'Payments' ? a.name.includes('UPI') || a.name.includes('Payment') || a.name.includes('Fraud')
        : uc.domain === 'Mobile Banking' ? a.name.includes('Mobile') || a.name.includes('Auth')
          : true,
    ).slice(0, 4),
    relatedIncidents: incidentsFromState(state).filter((i) =>
      uc.riskTier === 'high' || i.domain === uc.domain,
    ).slice(0, 3),
    relatedReleases: releasesFromState(state).filter((r) => r.domain === uc.domain).slice(0, 3),
    historicalTrend: sparkline7d(uc.riskTier === 'high' ? 72 : uc.riskTier === 'medium' ? 85 : 94),
  });
}

/**
 * @param {KpiDrilldownContext} ctx
 * @param {Partial<KpiDrilldownPayload>} overrides
 * @returns {KpiDrilldownPayload}
 */
function buildPayload(ctx, overrides = {}) {
  return {
    label: ctx.label,
    value: ctx.value,
    suffix: ctx.suffix,
    sourceRecords: [],
    supportingEvidence: [],
    relatedApplications: [],
    relatedIncidents: [],
    relatedReleases: [],
    historicalTrend: ctx.data?.length ? ctx.data : sparkline7d(90),
    ...overrides,
  };
}

/**
 * @param {import('../data/aiGovernanceModulesMock').AIControlEntry} control
 */
function controlToRecord(control) {
  return {
    id: control.id,
    title: control.name,
    detail: control.controlDomain,
    meta: `${control.controlType} · ${control.coverage}% · ${control.testResult}`,
  };
}

/**
 * @param {import('../data/aiGovernanceModulesMock').AIIncidentEntry} incident
 */
function incidentToRecord(incident) {
  return {
    id: incident.id,
    title: incident.incidentType,
    detail: incident.application,
    meta: `${incident.severity} · ${incident.status} · ${incident.category}`,
  };
}

/**
 * @param {import('../data/aiGovernanceModulesMock').AIControlEntry} control
 * @param {SimulationState} state
 */
function buildControlDrilldown(state, control, ctx) {
  return buildPayload(ctx, {
    sourceRecords: [controlToRecord(control)],
    supportingEvidence: [
      `Owner: ${control.owner}`,
      `Linked use case: ${control.linkedUseCase}`,
      `Last tested: ${control.lastTested}`,
      `Status: ${control.status}`,
      control.requiresHumanReview ? 'Requires human review' : 'Automated control',
    ],
    relatedApplications: appsFromArchitecture(state).slice(0, 4),
    relatedIncidents: AI_INCIDENTS.filter((i) => i.application.includes(control.linkedUseCase.split(' ')[0])).map((i) => ({
      id: i.id,
      title: i.incidentType,
      severity: i.severity,
      domain: i.application,
    })).slice(0, 3),
    relatedReleases: releasesFromState(state).slice(0, 2),
    historicalTrend: AI_CONTROLS_TREND.map((p) => ({ month: p.month, value: p.coverage })),
  });
}

/**
 * @param {import('../data/aiGovernanceModulesMock').AIIncidentEntry} incident
 * @param {SimulationState} state
 */
function buildIncidentDrilldown(state, incident, ctx) {
  return buildPayload(ctx, {
    sourceRecords: [incidentToRecord(incident)],
    supportingEvidence: [
      `Root cause: ${incident.rootCause}`,
      `Impact: ${incident.impact}`,
      `Corrective: ${incident.correctiveAction}`,
      `Preventive: ${incident.preventiveAction}`,
    ],
    relatedApplications: appsFromArchitecture(state).slice(0, 3),
    relatedIncidents: AI_INCIDENTS.filter((i) => i.category === incident.category).map((i) => ({
      id: i.id,
      title: i.incidentType,
      severity: i.severity,
      domain: i.application,
    })).slice(0, 4),
    relatedReleases: releasesFromState(state).slice(0, 2),
    historicalTrend: AI_INCIDENTS_TREND.map((p) => ({ day: p.day, value: p.open + p.closed })),
  });
}

/** @type {Record<string, (state: SimulationState, ctx: KpiDrilldownContext) => KpiDrilldownPayload>} */
const resolvers = {
  'Delivery Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.delivery.topRequirements.map((r) => ({
        id: r.id,
        title: r.title,
        detail: r.domain,
        meta: `${r.risk} risk · ${r.impact}`,
      })),
      supportingEvidence: [
        `Pipeline velocity: ${state.delivery.pipelineVelocity.map((p) => `${p.stage} (${p.count})`).join(', ')}`,
        `Change failure rate: ${state.delivery.changeFailureRate}%`,
        `Lead time: ${state.delivery.leadTimeHours} hours`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: ctx.data ?? sparkline7d(Number(ctx.value) || 94),
    }),

  'Production Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.production.serviceHealth.map((s) => ({
        id: s.name,
        title: s.name,
        detail: `Uptime ${s.uptime}%`,
        meta: s.status,
      })),
      supportingEvidence: state.production.topIssues.map((i) => `${i.issue}: ${i.rca}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical' || a.status === 'high'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state).filter((r) => r.risk !== 'low'),
      historicalTrend: state.production.incidentTrend.map((p) => ({ day: p.day, value: p.count * 10 })),
    }),

  'Governance Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.governance.topFindings.map((f, i) => ({
        id: `GOV-${i + 1}`,
        title: f.title,
        meta: f.severity,
      })),
      supportingEvidence: [
        ...state.governance.auditTrail.map((a) => `${a.event} (${a.time})`),
        `Policy compliance: ${state.governance.policyCompliance}%`,
      ],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'critical'),
      relatedReleases: releasesFromState(state),
      historicalTrend: ctx.data ?? sparkline7d(state.governance.governanceScore),
    }),

  'Engineering Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({
        id: `SEC-${i + 1}`,
        title: s.title,
        meta: s.severity,
      })),
      supportingEvidence: [
        `PR aging: ${state.development.prAging.map((p) => `${p.range}: ${p.count}`).join(' · ')}`,
        `Tech debt items: ${state.development.techDebt}`,
      ],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.qualityTrend.map((p) => ({ day: p.month, value: p.quality })),
    }),

  'Open Risks': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.executive.riskByPhase.map((p) => ({
        id: p.name,
        title: p.name,
        detail: 'SDLC phase',
        meta: `${p.value} risks`,
      })),
      supportingEvidence: state.requirements.topRiskRequirements.map(
        (r) => `${r.id} — ${r.title} (${r.risk})`,
      ),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(state.executive.openRisks * 4),
    }),

  'Open Incidents': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.production.openIncidents.map((i) => ({
        id: i.id,
        title: i.title,
        detail: i.domain,
        meta: `${i.severity} · ${i.status}`,
      })),
      supportingEvidence: state.production.topIssues.map((i) => i.rca),
      relatedApplications: state.production.serviceHealth
        .filter((s) => s.status !== 'healthy')
        .map((s) => ({ name: s.name, status: s.status })),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === 'Payments'),
      historicalTrend: state.production.incidentTrend.map((p) => ({ day: p.day, value: p.count })),
    }),

  'Business Impact': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.executive.businessImpactAreas.map((a) => ({
        id: a.name,
        title: a.name,
        meta: `${a.value}% impact score`,
      })),
      supportingEvidence: state.dynamicInsights.slice(0, 3),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity !== 'low'),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.executive.businessImpactScore),
    }),

  'Portfolio Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.executive.scorecard.map((s) => ({
        id: s.label,
        title: s.label,
        meta: `${s.value}%`,
      })),
      supportingEvidence: state.dynamicInsights,
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: ctx.data ?? sparkline7d(state.executive.portfolioHealth),
    }),

  'Active Changes': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.delivery.pipelineVelocity.map((p) => ({
        id: p.stage,
        title: p.stage,
        detail: `${p.count} items`,
        meta: `Avg ${p.avgDays}d`,
      })),
      supportingEvidence: [
        `Sprint burndown on track: ${state.delivery.sprintBurndown[state.delivery.sprintBurndown.length - 1]?.actual}% complete`,
      ],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(120),
    }),

  'In-Flight Releases': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.release.releases.map((r) => ({
        id: r.id,
        title: r.name,
        detail: r.domain,
        meta: `${r.confidence}% · ${r.risk} risk`,
      })),
      supportingEvidence: state.release.checklist.map((c) => `${c.item}: ${c.status}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.release.confidence),
    }),

  'Requirements Analysed': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.topRiskRequirements.map((r) => ({
        id: r.id,
        title: r.title,
        detail: r.domain,
        meta: `${r.risk} · ${r.impact}`,
      })),
      supportingEvidence: state.requirements.complianceBreakdown.map(
        (c) => `${c.name}: ${c.count} requirements`,
      ),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(85),
    }),

  'Business Impact Index': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.executive.businessImpactAreas.map((a) => ({
        id: a.name,
        title: a.name,
        meta: `${a.value}%`,
      })),
      supportingEvidence: state.delivery.topRequirements.map((r) => `${r.title} — ${r.impact} impact`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.delivery.businessImpactIndex),
    }),

  'Compliance Impact': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.complianceBreakdown.map((c) => ({
        id: c.name,
        title: c.name,
        meta: `${c.count} reqs`,
      })),
      supportingEvidence: state.governance.complianceStandards.map((s) => `${s.name}: ${s.score}%`),
      relatedApplications: [{ name: 'Payment Gateway', status: 'high' }, { name: 'UPI Switch', status: 'critical' }],
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === 'Payments'),
      historicalTrend: sparkline7d(state.requirements.complianceImpact * 3),
    }),

  'Requirement Risks': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.topRiskRequirements.map((r) => ({
        id: r.id,
        title: r.title,
        meta: r.risk,
      })),
      supportingEvidence: state.requirements.riskDistribution.map((d) => `${d.name}: ${d.value}`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.delivery.requirementRisks * 5),
    }),

  'Architecture Risks': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.architecture.techRisks.map((r, i) => ({
        id: `AR-${i + 1}`,
        title: r.title,
        meta: r.severity,
      })),
      supportingEvidence: state.architecture.recommendations,
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).filter((i) => i.domain === 'Payments'),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.architecture.readiness),
    }),

  'Technical Debt': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({
        id: `TD-${i + 1}`,
        title: s.title,
        meta: s.severity,
      })),
      supportingEvidence: [
        `Tech debt score: ${state.development.techDebt} items`,
        ...state.architecture.recommendations,
      ],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low'),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.qualityTrend.map((p) => ({ day: p.month, value: p.debt })),
    }),

  'Test Coverage': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.coverageHeatmap.map((row, i) => ({
        id: `COV-${i}`,
        title: row[0],
        detail: state.testing.heatmapEnvs.map((env, j) => `${env}: ${row[j + 1]}%`).join(' · '),
      })),
      supportingEvidence: state.testing.aiRecommendations,
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(typeof ctx.value === 'number' ? ctx.value : state.testing.coverage),
    }),

  'Code Quality': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({
        id: `CQ-${i + 1}`,
        title: s.title,
        meta: s.severity,
      })),
      supportingEvidence: state.development.prAging.map((p) => `${p.range}: ${p.count} PRs`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.qualityTrend.map((p) => ({ day: p.month, value: p.quality })),
    }),

  'Change Failure Rate': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.release.riskMatrix.map((r, i) => ({
        id: `CFR-${i}`,
        title: r.title,
        meta: r.severity,
      })),
      supportingEvidence: [`Deployment frequency: ${state.delivery.deploymentFrequency}/month`],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(95 - state.delivery.changeFailureRate * 5),
    }),

  'Deployments / Month': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: releasesFromState(state).map((r) => ({
        id: r.id,
        title: r.name,
        meta: `${r.confidence}%`,
      })),
      supportingEvidence: state.release.checklist.map((c) => c.item),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.commitTrend.map((p) => ({ day: p.week, value: p.prs * 8 })),
    }),

  'Lead Time': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.delivery.pipelineVelocity.map((p) => ({
        id: p.stage,
        title: p.stage,
        meta: `${p.avgDays}d avg`,
      })),
      supportingEvidence: [`Defect density: ${state.delivery.defectDensity}/KLOC`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(100 - state.delivery.leadTimeHours / 2),
    }),

  'Defect Density': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.defectTrend.map((d) => ({
        id: d.week,
        title: d.week,
        detail: `${d.found} found, ${d.escaped} escaped`,
      })),
      supportingEvidence: [`Defect leakage: ${state.testing.defectLeakage}`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.testing.defectTrend.map((d) => ({ day: d.week, value: d.found })),
    }),

  'High Risk': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.topRiskRequirements
        .filter((r) => r.risk === 'high')
        .map((r) => ({ id: r.id, title: r.title, meta: r.domain })),
      supportingEvidence: state.requirements.riskDistribution.map((d) => `${d.name}: ${d.value}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(state.requirements.highRisk * 4),
    }),

  Ambiguous: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.topRiskRequirements.slice(0, 3).map((r) => ({
        id: r.id,
        title: r.title,
        detail: 'Ambiguity flagged in acceptance criteria',
        meta: r.domain,
      })),
      supportingEvidence: [`Analysis queue: ${state.requirements.analysisQueue} pending reviews`],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.requirements.ambiguous * 8),
    }),

  'Missing Criteria': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.topRiskRequirements.slice(1, 4).map((r) => ({
        id: r.id,
        title: r.title,
        detail: 'Missing acceptance criteria',
        meta: r.risk,
      })),
      supportingEvidence: [`Quality score: ${state.requirements.qualityScore}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.requirements.missingCriteria * 10),
    }),

  'Compliance-Tagged': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.requirements.complianceBreakdown.map((c) => ({
        id: c.name,
        title: c.name,
        meta: `${c.count} tagged`,
      })),
      supportingEvidence: state.governance.complianceStandards.map((s) => `${s.name}: ${s.score}%`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.requirements.complianceImpact * 4),
    }),

  'Architecture Readiness': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.architecture.layerReadiness.map((l) => ({
        id: l.label,
        title: l.label,
        meta: `${l.value}%`,
      })),
      supportingEvidence: state.architecture.techRisks.map((r) => r.title),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.architecture.readiness),
    }),

  'Critical Dependencies': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.architecture.techRisks
        .filter((r) => r.severity === 'critical' || r.severity === 'high')
        .map((r, i) => ({ id: `DEP-${i}`, title: r.title, meta: r.severity })),
      supportingEvidence: state.architecture.edges.map((e) => e.join(' → ')),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'critical'),
      relatedReleases: releasesFromState(state).filter((r) => r.name.includes('UPI')),
      historicalTrend: sparkline7d(state.architecture.criticalDependencies * 12),
    }),

  'Integration Risks': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.architecture.techRisks.map((r, i) => ({
        id: `INT-${i}`,
        title: r.title,
        meta: r.severity,
      })),
      supportingEvidence: state.architecture.recommendations,
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(80),
    }),

  'Cross-Team Dependencies': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.architecture.edges.map((e, i) => ({
        id: `XTD-${i}`,
        title: e.join(' ↔ '),
        detail: 'Service dependency',
      })),
      supportingEvidence: state.architecture.layerReadiness.map((l) => `${l.label}: ${l.value}%`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.architecture.crossTeamDeps * 6),
    }),

  'Pull Requests': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.prAging.map((p) => ({
        id: p.range,
        title: p.range,
        meta: `${p.count} PRs`,
      })),
      supportingEvidence: state.development.securityItems.map((s) => s.title),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.commitTrend.map((p) => ({ day: p.week, value: p.prs })),
    }),

  Commits: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.commitTrend.map((p) => ({
        id: p.week,
        title: p.week,
        meta: `${p.commits} commits`,
      })),
      supportingEvidence: [`Code quality: ${state.development.codeQuality}%`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.commitTrend.map((p) => ({ day: p.week, value: p.commits })),
    }),

  'Tech Debt': (state, ctx) =>
    resolvers['Technical Debt'](state, ctx),

  'Dev Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({
        id: `DH-${i}`,
        title: s.title,
        meta: s.severity,
      })),
      supportingEvidence: [
        `Commits: ${state.development.commits} · PRs: ${state.development.pullRequests}`,
      ],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.qualityTrend.map((p) => ({ day: p.month, value: p.quality })),
    }),

  'Total Tests': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.coverageHeatmap.map((row, i) => ({
        id: `TST-${i}`,
        title: String(row[0]),
        detail: `Coverage across ${state.testing.heatmapEnvs.join(', ')}`,
      })),
      supportingEvidence: state.testing.aiRecommendations,
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(90),
    }),

  'Manual Tests': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.coverageHeatmap.map((row, i) => ({
        id: `MAN-${i}`,
        title: String(row[0]),
        meta: `Manual coverage gap: ${100 - Number(row[1])}%`,
      })),
      supportingEvidence: [`Automation rate: ${state.testing.automation}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.testing.manualTests / 100),
    }),

  Coverage: (state, ctx) => resolvers['Test Coverage'](state, ctx),

  Automation: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.aiRecommendations.map((r, i) => ({
        id: `AUTO-${i}`,
        title: r,
      })),
      supportingEvidence: [`Effectiveness: ${state.testing.effectiveness}%`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.testing.automation),
    }),

  Effectiveness: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.defectTrend.map((d) => ({
        id: d.week,
        title: d.week,
        detail: `Escaped defects: ${d.escaped}`,
      })),
      supportingEvidence: [`Defect leakage: ${state.testing.defectLeakage}`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.testing.effectiveness),
    }),

  'AI Recommended': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.testing.aiRecommendations.map((r, i) => ({
        id: `AI-${i}`,
        title: r,
      })),
      supportingEvidence: [`Optimization progress: ${state.testing.optimizationProgress}%`],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(state.testing.recommended / 3),
    }),

  'Release Confidence': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.release.readiness.map((r) => ({
        id: r.dimension,
        title: r.dimension,
        meta: `${r.score}% · ${r.status}`,
      })),
      supportingEvidence: state.release.checklist.map((c) => `${c.item}: ${c.status}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.release.confidence),
    }),

  'Rollback Readiness': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.release.releases.map((r) => ({
        id: r.id,
        title: r.name,
        meta: `${r.confidence}% confidence`,
      })),
      supportingEvidence: state.release.riskMatrix.map((r) => r.title),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.release.rollbackReadiness),
    }),

  'Deployment Readiness': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.release.checklist.map((c, i) => ({
        id: `CHK-${i}`,
        title: c.item,
        meta: c.status,
      })),
      supportingEvidence: state.release.riskMatrix.map((r) => `${r.title} (${r.severity})`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.release.deploymentReadiness),
    }),

  'Go / No-Go': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.release.readiness.map((r) => ({
        id: r.dimension,
        title: r.dimension,
        meta: r.status,
      })),
      supportingEvidence: [
        `Enterprise decision: ${state.release.goNoGo}`,
        ...state.release.checklist.filter((c) => c.status !== 'completed').map((c) => `Pending: ${c.item}`),
      ],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low'),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'critical'),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.release.confidence),
    }),

  Availability: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.production.serviceHealth.map((s) => ({
        id: s.name,
        title: s.name,
        meta: `${s.uptime}% uptime`,
      })),
      supportingEvidence: [`SLA breaches: ${state.production.slaBreaches}`],
      relatedApplications: state.production.serviceHealth.map((s) => ({
        name: s.name,
        status: s.status,
      })),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.production.availability),
    }),

  MTTR: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.production.openIncidents.map((i) => ({
        id: i.id,
        title: i.title,
        detail: i.duration,
        meta: i.severity,
      })),
      supportingEvidence: state.production.topIssues.map((i) => i.rca),
      relatedApplications: state.production.serviceHealth
        .filter((s) => s.status !== 'healthy')
        .map((s) => ({ name: s.name, status: s.status })),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(100 - state.production.mttrMinutes),
    }),

  'Service Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.production.serviceHealth.map((s) => ({
        id: s.name,
        title: s.name,
        meta: s.status,
      })),
      supportingEvidence: state.production.topIssues.map((i) => i.issue),
      relatedApplications: state.production.serviceHealth.map((s) => ({
        name: s.name,
        status: s.status,
      })),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.production.health),
    }),

  'Batch Health': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.operations.batchJobs.map((j, i) => ({
        id: `BATCH-${i}`,
        title: j.name,
        meta: `${j.status} · ${j.progress}%`,
      })),
      supportingEvidence: state.operations.operationalRisks.map((r) => `${r.title} (${r.severity})`),
      relatedApplications: [{ name: 'Core Banking', status: 'low' }, { name: 'UPI Switch', status: 'critical' }],
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.operations.batchHealth),
    }),

  'Capacity Utilization': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.operations.capacityForecast.map((f) => ({
        id: f.day,
        title: f.day,
        meta: `${f.predicted}% predicted`,
      })),
      supportingEvidence: state.operations.operationalRisks.map((r) => r.title),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.operations.capacityTrend.map((p) => ({ day: p.hour, value: p.cpu })),
    }),

  'CPU Utilization': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.operations.capacityTrend.map((p) => ({
        id: p.hour,
        title: `${p.hour}:00`,
        meta: `CPU ${p.cpu}%`,
      })),
      supportingEvidence: [`Memory avg: ${state.operations.capacityTrend[3]?.memory}%`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.operations.capacityTrend.map((p) => ({ day: p.hour, value: p.cpu })),
    }),

  'Storage Utilization': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.operations.capacityTrend.map((p) => ({
        id: `ST-${p.hour}`,
        title: `${p.hour}:00`,
        meta: `Storage ${p.storage}%`,
      })),
      supportingEvidence: state.operations.operationalRisks.map((r) => r.title),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.operations.capacityTrend.map((p) => ({ day: p.hour, value: p.storage })),
    }),

  'Audit Findings': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.governance.auditTrail.map((a, i) => ({
        id: `AUD-${i}`,
        title: a.event,
        meta: a.time,
      })),
      supportingEvidence: state.governance.topFindings.map((f) => f.title),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(90),
    }),

  'VAPT Findings': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.governance.topFindings.map((f, i) => ({
        id: `VAPT-${i}`,
        title: f.title,
        meta: f.severity,
      })),
      supportingEvidence: state.governance.findingSeverity.map((f) => `${f.name}: ${f.value}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(85),
    }),

  'Policy Violations': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.governance.topFindings
        .filter((f) => f.severity === 'medium' || f.severity === 'high')
        .map((f, i) => ({ id: `POL-${i}`, title: f.title, meta: f.severity })),
      supportingEvidence: [`Policy compliance: ${state.governance.policyCompliance}%`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(92),
    }),

  'Security Findings': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({
        id: `SEC-${i}`,
        title: s.title,
        meta: s.severity,
      })),
      supportingEvidence: state.governance.topFindings.map((f) => f.title),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(88),
    }),

  'Governance Score': (state, ctx) => resolvers['Governance Health'](state, ctx),

  'Lessons Learned': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.learning.recentLessons.map((l, i) => ({
        id: `LL-${i}`,
        title: l.text,
        meta: l.time,
      })),
      supportingEvidence: state.learning.analytics.map((a) => `${a.label}: ${a.value}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: state.learning.incidents.map((i, idx) => ({
        id: `LINC-${idx}`,
        title: i.title,
        severity: i.severity,
      })),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.learning.lessonsLearned / 2),
    }),

  'Reusable Assets': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.learning.knowledgeBase.map((k, i) => ({
        id: `KB-${i}`,
        title: k.title,
        meta: `${k.category} · ${k.views} views`,
      })),
      supportingEvidence: state.learning.recentLessons.map((l) => l.text),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.learning.reusableAssets / 3),
    }),

  'Similar Incidents': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.learning.incidents.map((i, idx) => ({
        id: `SIM-${idx}`,
        title: i.title,
        meta: i.date,
      })),
      supportingEvidence: state.production.topIssues.map((i) => i.issue),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.learning.similarIncidents / 10),
    }),

  'Tech Debt Logged': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.architecture.techRisks.map((r, i) => ({
        id: `TDL-${i}`,
        title: r.title,
        meta: r.severity,
      })),
      supportingEvidence: state.development.securityItems.map((s) => s.title),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.qualityTrend.map((p) => ({ day: p.month, value: p.debt })),
    }),

  'Reports Generated': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.reports.reportTypes.map((r, i) => ({
        id: `RPT-${i}`,
        title: r.name,
        meta: r.type,
      })),
      supportingEvidence: [`Last export: ${state.reports.lastExport}`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.reports.generated * 3),
    }),

  'Scheduled Reports': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: state.reports.reportTypes.map((r, i) => ({
        id: `SCH-${i}`,
        title: r.name,
        meta: `Scheduled · ${r.type}`,
      })),
      supportingEvidence: [`${state.reports.scheduled} active schedules`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.reports.scheduled * 10),
    }),

  'Total AI Use Cases': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: useCasesFromState(state).map((u) => ({
        id: u.id,
        title: u.name,
        detail: u.domain,
        meta: `${u.modelType} · ${u.status}`,
      })),
      supportingEvidence: [
        `Approved: ${useCasesFromState(state).filter((u) => u.status === 'Approved').length}`,
        `Pilot: ${useCasesFromState(state).filter((u) => u.status === 'Pilot').length}`,
        `In review: ${useCasesFromState(state).filter((u) => u.status === 'Review').length}`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(useCasesFromState(state).length * 3),
    }),

  'Approved Models': (state, ctx) => {
    const approved = useCasesFromState(state).filter((u) => u.status === 'Approved');
    return buildPayload(ctx, {
      sourceRecords: approved.map((u) => ({
        id: u.id,
        title: u.name,
        detail: u.domain,
        meta: `${u.modelName} · ${u.riskTier} risk`,
      })),
      supportingEvidence: approved.map((u) => `Last review: ${u.lastReview} — ${u.name}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(approved.length * 8),
    });
  },

  'High Risk Use Cases': (state, ctx) => {
    const highRisk = useCasesFromState(state).filter((u) => u.riskTier === 'high');
    return buildPayload(ctx, {
      sourceRecords: highRisk.map((u) => ({
        id: u.id,
        title: u.name,
        detail: u.owner,
        meta: `${u.status} · ${u.domain}`,
      })),
      supportingEvidence: highRisk.flatMap((u) => u.controls.slice(0, 2)),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'critical' || i.severity === 'high'),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(highRisk.length * 10),
    });
  },

  'Pending Review': (state, ctx) => {
    const pending = useCasesFromState(state).filter((u) => u.status === 'Review');
    return buildPayload(ctx, {
      sourceRecords: pending.map((u) => ({
        id: u.id,
        title: u.name,
        detail: u.owner,
        meta: u.lastReview,
      })),
      supportingEvidence: pending.map((u) => u.reviewHistory[u.reviewHistory.length - 1]?.outcome ?? u.description),
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(pending.length * 12),
    });
  },

  'Control Coverage': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: AI_CONTROLS.map(controlToRecord),
      supportingEvidence: AI_CONTROLS.map((c) => `${c.name}: ${c.coverage}% coverage · ${c.testResult}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: AI_INCIDENTS.slice(0, 3).map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_CONTROLS_TREND.map((p) => ({ month: p.month, value: p.coverage })),
    }),

  'Effective Controls': (state, ctx) => {
    const effective = AI_CONTROLS.filter((c) => c.testResult === 'Effective');
    return buildPayload(ctx, {
      sourceRecords: effective.map(controlToRecord),
      supportingEvidence: effective.map((c) => `${c.id} · ${c.controlDomain} · last tested ${c.lastTested}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_CONTROLS_TREND.map((p) => ({ month: p.month, value: p.effective })),
    });
  },

  'Failed Controls': (state, ctx) => {
    const failed = AI_CONTROLS.filter((c) => c.testResult === 'Failed');
    return buildPayload(ctx, {
      sourceRecords: failed.map(controlToRecord),
      supportingEvidence: failed.map((c) => `${c.name}: gap in ${c.linkedUseCase}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: AI_INCIDENTS.filter((i) => i.category === 'model').map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(failed.length * 15),
    });
  },

  'Control Exceptions': (state, ctx) => {
    const exceptions = AI_CONTROLS.filter((c) => c.testResult === 'Exception');
    return buildPayload(ctx, {
      sourceRecords: exceptions.map(controlToRecord),
      supportingEvidence: exceptions.map((c) => `${c.name}: ${c.status} · ${c.coverage}% coverage`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: AI_INCIDENTS.filter((i) => i.severity === 'high' || i.severity === 'critical').map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_CONTROLS_TREND.map((p) => ({ month: p.month, value: p.exceptions })),
    });
  },

  'Human Review Controls': (state, ctx) => {
    const humanReview = AI_CONTROLS.filter((c) => c.controlDomain === 'Human Review');
    return buildPayload(ctx, {
      sourceRecords: humanReview.map(controlToRecord),
      supportingEvidence: humanReview.map((c) => `${c.name} · ${c.linkedUseCase}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: AI_INCIDENTS.filter((i) => i.category === 'prompt').map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(humanReview.length * 11),
    });
  },

  'Model Monitoring Controls': (state, ctx) => {
    const monitoring = AI_CONTROLS.filter((c) => c.controlDomain === 'Model Monitoring');
    return buildPayload(ctx, {
      sourceRecords: monitoring.map(controlToRecord),
      supportingEvidence: monitoring.map((c) => `${c.name}: ${c.testResult} · ${c.lastTested}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: AI_INCIDENTS.filter((i) => i.category === 'model').map(incidentToRecord).slice(0, 4),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(monitoring.length * 13),
    });
  },

  'Prompt Safety Controls': (state, ctx) => {
    const promptSafety = AI_CONTROLS.filter((c) => c.controlDomain === 'Prompt Safety');
    return buildPayload(ctx, {
      sourceRecords: promptSafety.map(controlToRecord),
      supportingEvidence: promptSafety.map((c) => `${c.name}: ${c.testResult} · ${c.status}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: AI_INCIDENTS.filter((i) => i.category === 'prompt').map(incidentToRecord),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(promptSafety.length * 9),
    });
  },

  'Regulatory Controls': (state, ctx) => {
    const regulatory = AI_CONTROLS.filter((c) => c.controlDomain === 'Regulatory');
    return buildPayload(ctx, {
      sourceRecords: regulatory.map(controlToRecord),
      supportingEvidence: regulatory.map((c) => `${c.name}: ${c.coverage}% · ${c.status}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: AI_INCIDENTS.filter((i) => i.regulatory).map(incidentToRecord),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(regulatory.length * 12),
    });
  },

  'Open Incidents': (state, ctx) => {
    const open = AI_INCIDENTS.filter((i) => i.status === 'Open');
    return buildPayload(ctx, {
      sourceRecords: open.map(incidentToRecord),
      supportingEvidence: open.map((i) => `Root cause: ${i.rootCause}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: open.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_INCIDENTS_TREND.map((p) => ({ day: p.day, value: p.open })),
    });
  },

  'Closed Incidents': (state, ctx) => {
    const closed = AI_INCIDENTS.filter((i) => i.status === 'Resolved');
    return buildPayload(ctx, {
      sourceRecords: closed.map(incidentToRecord),
      supportingEvidence: closed.map((i) => `Resolved in ${i.mttrHours}h · ${i.correctiveAction}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: closed.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_INCIDENTS_TREND.map((p) => ({ day: p.day, value: p.closed })),
    });
  },

  'Critical Incidents': (state, ctx) => {
    const critical = AI_INCIDENTS.filter((i) => i.severity === 'critical');
    return buildPayload(ctx, {
      sourceRecords: critical.map(incidentToRecord),
      supportingEvidence: critical.map((i) => `${i.incidentType}: ${i.impact}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: critical.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(critical.length * 14),
    });
  },

  'Regulatory Incidents': (state, ctx) => {
    const regulatory = AI_INCIDENTS.filter((i) => i.regulatory);
    return buildPayload(ctx, {
      sourceRecords: regulatory.map(incidentToRecord),
      supportingEvidence: regulatory.map((i) => `${i.incidentType}: ${i.preventiveAction}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: regulatory.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(regulatory.length * 16),
    });
  },

  'Model Failures': (state, ctx) => {
    const modelFailures = AI_INCIDENTS.filter((i) => i.category === 'model');
    return buildPayload(ctx, {
      sourceRecords: modelFailures.map(incidentToRecord),
      supportingEvidence: modelFailures.map((i) => `Root cause: ${i.rootCause}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: modelFailures.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(modelFailures.length * 10),
    });
  },

  'Prompt Failures': (state, ctx) => {
    const promptFailures = AI_INCIDENTS.filter((i) => i.category === 'prompt');
    return buildPayload(ctx, {
      sourceRecords: promptFailures.map(incidentToRecord),
      supportingEvidence: promptFailures.map((i) => `Corrective: ${i.correctiveAction}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: promptFailures.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(promptFailures.length * 11),
    });
  },

  'Mean Resolution Time': (state, ctx) => {
    const resolved = AI_INCIDENTS.filter((i) => i.status === 'Resolved');
    return buildPayload(ctx, {
      sourceRecords: resolved.map((i) => ({
        id: i.id,
        title: i.incidentType,
        detail: i.application,
        meta: `${i.mttrHours}h MTTR · ${i.severity}`,
      })),
      supportingEvidence: resolved.map((i) => `${i.incidentType}: resolved in ${i.mttrHours}h`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: resolved.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: resolved.map((i) => ({ id: i.id, value: i.mttrHours })),
    });
  },

  'Pending Approvals': (state, ctx) => {
    const pending = APPROVAL_REQUESTS.filter((r) => PENDING_STATUSES.includes(r.status));
    return buildPayload(ctx, {
      sourceRecords: pending.map(approvalToDrilldownRecord),
      supportingEvidence: pending.map((r) => `${r.id}: ${r.stage} · due ${r.dueDate}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.pending })),
    });
  },

  'Overdue Reviews': (state, ctx) => {
    const overdue = APPROVAL_REQUESTS.filter((r) => isOverdue(r));
    return buildPayload(ctx, {
      sourceRecords: overdue.map(approvalToDrilldownRecord),
      supportingEvidence: overdue.map((r) => `SLA breach: ${r.title} — due ${r.dueDate}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: sparkline7d(overdue.length * 12),
    });
  },

  'Reviews In Progress': (state, ctx) => {
    const inProgress = APPROVAL_REQUESTS.filter((r) => IN_PROGRESS_STATUSES.includes(r.status));
    return buildPayload(ctx, {
      sourceRecords: inProgress.map(approvalToDrilldownRecord),
      supportingEvidence: inProgress.map((r) => `Reviewer: ${r.assignedReviewer ?? 'Unassigned'}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(inProgress.length * 9),
    });
  },

  'Approved Items': (state, ctx) => {
    const approved = APPROVAL_REQUESTS.filter((r) => r.status === 'Approved' || r.status === 'Closed');
    return buildPayload(ctx, {
      sourceRecords: approved.map(approvalToDrilldownRecord),
      supportingEvidence: approved.map((r) => `${r.id} approved at ${r.stage} stage`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.approved })),
    });
  },

  'Rejected Items': (state, ctx) => {
    const rejected = APPROVAL_REQUESTS.filter((r) => r.status === 'Rejected');
    return buildPayload(ctx, {
      sourceRecords: rejected.map(approvalToDrilldownRecord),
      supportingEvidence: rejected.map((r) => `${r.title}: rejected at ${r.stage}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(rejected.length * 14),
    });
  },

  'Escalated Reviews': (state, ctx) => {
    const escalated = APPROVAL_REQUESTS.filter((r) => r.status === 'Escalated');
    return buildPayload(ctx, {
      sourceRecords: escalated.map(approvalToDrilldownRecord),
      supportingEvidence: escalated.map((r) => `Escalated: ${r.title} · ${r.domain}`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'healthy'),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'critical'),
      relatedReleases: releasesFromState(state).filter((r) => r.risk === 'high'),
      historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.escalated })),
    });
  },

  'Average Approval Time': (state, ctx) => {
    const closed = APPROVAL_REQUESTS.filter((r) => r.status === 'Approved' || r.status === 'Closed');
    return buildPayload(ctx, {
      sourceRecords: closed.map((r) => ({
        id: r.id,
        title: r.title,
        detail: r.stage,
        meta: `${r.submittedDate} → ${r.status}`,
      })),
      supportingEvidence: [`Average cycle: ${ctx.value} days`, ...closed.slice(0, 4).map((r) => r.title)],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.approved })),
    });
  },

  Roles: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: ROLE_CATALOG.map((r) => ({
        id: r.id,
        title: r.label,
        detail: r.description.slice(0, 80),
        meta: `${r.grants.length} resource grants`,
      })),
      supportingEvidence: ROLE_CATALOG.map((r) => `${r.label}: ${r.actions.join(', ')}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(RBAC_KPI_MOCK.totalRoles * 8),
    }),

  Permissions: (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: PERMISSION_CATALOG.map((p) => ({
        id: p.id,
        title: p.label,
        detail: p.description,
        meta: 'Permission verb',
      })),
      supportingEvidence: PERMISSION_CATALOG.map((p) => p.description),
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 1),
      historicalTrend: sparkline7d(RBAC_KPI_MOCK.totalPermissions * 10),
    }),

  'Resource Types': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: RESOURCE_CATALOG.map((r) => ({
        id: r.id,
        title: r.label,
        detail: r.domain,
        meta: r.description.slice(0, 60),
      })),
      supportingEvidence: RESOURCE_CATALOG.map((r) => `${r.label} (${r.domain})`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(RBAC_KPI_MOCK.totalResources * 9),
    }),

  'Persona Mappings': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: PERSONA_ENTITLEMENT_MATRIX.map((m) => ({
        id: m.personaId,
        title: m.roleLabel,
        detail: m.dashboards.join(', '),
        meta: m.reports.join(', '),
      })),
      supportingEvidence: Object.entries(PERSONA_RBAC_ROLE).map(([p, r]) => `${p} → ${ROLE_MAP[r].label}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 1),
      historicalTrend: sparkline7d(RBAC_KPI_MOCK.personaMappings * 7),
    }),

  'SoD Violations': (state, ctx) =>
    buildPayload(ctx, {
      sourceRecords: [
        { id: 'SOD-001', title: 'Platform Admin: administer + approve', detail: 'approvals', meta: 'High' },
        { id: 'SOD-002', title: 'Development Lead: create + approve', detail: 'code', meta: 'Medium' },
      ],
      supportingEvidence: ['Maker-checker policy requires separation of create and approve on same resource'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 1),
      historicalTrend: sparkline7d(RBAC_KPI_MOCK.sodViolations * 15),
    }),
};

/** @type {Record<string, (state: SimulationState, ctx: KpiDrilldownContext) => KpiDrilldownPayload>} */
const chartResolvers = {
  'executive.risk-by-phase': (state, ctx) => {
    const phase = ctx.segment ?? '';
    const phaseReqs = state.requirements.topRiskRequirements.filter((_, i) => {
      const phases = ['Requirements', 'Architecture', 'Development', 'Testing'];
      return phases[i % phases.length] === phase || phase === '';
    });
    return buildPayload(ctx, {
      sourceRecords: phaseReqs.length
        ? phaseReqs.map((r) => ({ id: r.id, title: r.title, detail: r.domain, meta: r.risk }))
        : [{ id: phase, title: `${phase} phase risks`, meta: `${state.executive.riskByPhase.find((p) => p.name === phase)?.value ?? 0} open` }],
      supportingEvidence: state.requirements.topRiskRequirements.map((r) => `${r.id} — ${r.title}`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.executive.riskByPhase.find((p) => p.name === phase)?.value ?? 5 * 10),
    });
  },

  'executive.business-impact': (state, ctx) => {
    const area = state.executive.businessImpactAreas.find((a) => a.name === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.delivery.topRequirements.map((r) => ({
        id: r.id, title: r.title, detail: r.impact, meta: r.domain,
      })),
      supportingEvidence: [`${ctx.segment} impact score: ${area?.value ?? ctx.value}%`, ...state.dynamicInsights.slice(0, 2)],
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(area?.value ?? 85),
    });
  },

  'finding-severity': (state, ctx) => {
    const severity = (ctx.segment ?? '').toLowerCase();
    const findings = state.governance.topFindings.filter((f) => !severity || f.severity === severity);
    return buildPayload(ctx, {
      sourceRecords: findings.map((f, i) => ({ id: `FND-${i}`, title: f.title, meta: f.severity })),
      supportingEvidence: state.governance.auditTrail.map((a) => `${a.event} (${a.time})`),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low'),
      relatedIncidents: incidentsFromState(state).filter((i) => !severity || i.severity === severity),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.governance.governanceScore),
    });
  },

  'requirements.risk-distribution': (state, ctx) => {
    const risk = (ctx.segment ?? '').toLowerCase();
    const reqs = state.requirements.topRiskRequirements.filter((r) => !risk || r.risk === risk);
    return buildPayload(ctx, {
      sourceRecords: reqs.map((r) => ({ id: r.id, title: r.title, detail: r.domain, meta: r.impact })),
      supportingEvidence: state.requirements.complianceBreakdown.map((c) => `${c.name}: ${c.count}`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.requirements.qualityScore),
    });
  },

  'requirements.compliance-breakdown': (state, ctx) => {
    const item = state.requirements.complianceBreakdown.find((c) => c.name === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.requirements.topRiskRequirements
        .filter((r) => r.impact === 'Compliance' || r.domain === 'Payments')
        .map((r) => ({ id: r.id, title: r.title, meta: r.risk })),
      supportingEvidence: state.governance.complianceStandards.map((s) => `${s.name}: ${s.score}%`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === 'Payments'),
      historicalTrend: sparkline7d((item?.count ?? 1) * 10),
    });
  },

  'requirements.quality-gauge': (state, ctx) => resolvers['Requirements Analysed'](state, { ...ctx, label: 'Requirements Analysed', value: state.requirements.analysed, suffix: '' }),

  'governance.compliance-standards': (state, ctx) => {
    const std = state.governance.complianceStandards.find((s) => s.name === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.governance.topFindings.map((f, i) => ({ id: `GOV-${i}`, title: f.title, meta: f.severity })),
      supportingEvidence: [`${ctx.segment} compliance: ${std?.score ?? ctx.value}%`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(std?.score ?? 90),
    });
  },

  'governance.gauge': (state, ctx) => resolvers['Governance Health'](state, { ...ctx, label: 'Governance Health', value: state.governance.governanceScore }),

  'governance.compliance-gauge': (state, ctx) => {
    const score = ctx.segment === 'Baseline'
      ? state.governance.baselineCompliance
      : state.governance.policyCompliance;
    return buildPayload(ctx, {
      sourceRecords: state.governance.complianceStandards.map((s) => ({ id: s.name, title: s.name, meta: `${s.score}%` })),
      supportingEvidence: state.governance.auditTrail.map((a) => `${a.event} (${a.time})`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(score),
    });
  },

  'operations.health-gauge': (state, ctx) => resolvers['Batch Health'](state, { ...ctx, label: 'Batch Health', value: state.operations.operationalHealth }),

  'operations.batch-jobs': (state, ctx) => {
    const job = state.operations.batchJobs.find((j) => j.name === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: job ? [{ id: job.name, title: job.name, meta: `${job.status} · ${job.progress}%` }] : [],
      supportingEvidence: state.operations.operationalRisks.map((r) => `${r.title} (${r.severity})`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.operations.batchHealth),
    });
  },

  'release.confidence-gauge': (state, ctx) => resolvers['Release Confidence'](state, { ...ctx, label: 'Release Confidence', value: state.release.confidence }),

  'release.readiness-dimension': (state, ctx) => {
    const dim = state.release.readiness.find((r) => r.dimension === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.release.checklist.map((c, i) => ({ id: `CHK-${i}`, title: c.item, meta: c.status })),
      supportingEvidence: [`${ctx.segment}: ${dim?.score ?? ctx.value}% · ${dim?.status ?? ''}`],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(dim?.score ?? state.release.confidence),
    });
  },

  'architecture.layer-readiness': (state, ctx) => {
    const layer = state.architecture.layerReadiness.find((l) => l.label === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.architecture.techRisks.map((r, i) => ({ id: `AR-${i}`, title: r.title, meta: r.severity })),
      supportingEvidence: state.architecture.recommendations,
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(layer?.value ?? state.architecture.readiness),
    });
  },

  'testing.coverage-heatmap': (state, ctx) => {
    const [rowLabel, colLabel] = (ctx.segment ?? '|').split('|');
    return buildPayload(ctx, {
      sourceRecords: state.testing.aiRecommendations.map((r, i) => ({ id: `REC-${i}`, title: r })),
      supportingEvidence: [`${rowLabel} · ${colLabel}: ${ctx.value}% coverage`, ...state.testing.aiRecommendations],
      relatedApplications: appsFromArchitecture(state).filter((a) => rowLabel && a.name.includes(rowLabel.split(' ')[0])),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(Number(ctx.value) || state.testing.coverage),
    });
  },

  'delivery.pipeline-velocity': (state, ctx) => {
    const stage = state.delivery.pipelineVelocity.find((p) => p.stage === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.delivery.topRequirements.map((r) => ({ id: r.id, title: r.title, meta: r.domain })),
      supportingEvidence: [`${ctx.segment}: ${stage?.count ?? ctx.value} items · avg ${stage?.avgDays ?? '—'}d`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d((stage?.count ?? 30) + 60),
    });
  },

  'delivery.sprint-burndown': (state, ctx) => {
    const [day, series] = (ctx.segment ?? '|').split('|');
    const point = state.delivery.sprintBurndown.find((p) => p.day === day);
    const val = series === 'planned' ? point?.planned : point?.actual;
    return buildPayload(ctx, {
      sourceRecords: state.delivery.topRequirements.map((r) => ({ id: r.id, title: r.title, meta: r.risk })),
      supportingEvidence: [`${day} ${series}: ${val ?? ctx.value}% remaining`],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.delivery.sprintBurndown.map((p) => ({ day: p.day, value: p.actual })),
    });
  },

  'development.pr-aging': (state, ctx) => {
    const bucket = state.development.prAging.find((p) => p.range === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({ id: `PR-${i}`, title: s.title, meta: s.severity })),
      supportingEvidence: [`${ctx.segment}: ${bucket?.count ?? ctx.value} pull requests`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.commitTrend.map((p) => ({ day: p.week, value: p.prs })),
    });
  },

  'development.commit-trend': (state, ctx) => {
    const [week, series] = (ctx.segment ?? '|').split('|');
    const point = state.development.commitTrend.find((p) => p.week === week);
    const val = series === 'prs' ? point?.prs : point?.commits;
    return buildPayload(ctx, {
      sourceRecords: state.development.securityItems.map((s, i) => ({ id: `CM-${i}`, title: s.title, meta: s.severity })),
      supportingEvidence: [`${week} — ${series ?? 'commits'}: ${val ?? ctx.value}`],
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.commitTrend.map((p) => ({ day: p.week, value: p.commits })),
    });
  },

  'production.incident-trend': (state, ctx) => {
    const day = state.production.incidentTrend.find((p) => p.day === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.production.openIncidents.map((i) => ({
        id: i.id, title: i.title, detail: i.domain, meta: i.severity,
      })),
      supportingEvidence: state.production.topIssues.map((i) => i.rca),
      relatedApplications: state.production.serviceHealth.map((s) => ({ name: s.name, status: s.status })),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.production.incidentTrend.map((p) => ({ day: p.day, value: p.count })),
    });
  },

  'requirements.top-risk': (state, ctx) => {
    const req = state.requirements.topRiskRequirements.find((r) => r.id === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: req ? [{ id: req.id, title: req.title, detail: req.domain, meta: `${req.risk} · ${req.impact}` }] : [],
      supportingEvidence: state.requirements.complianceBreakdown.map((c) => `${c.name}: ${c.count}`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).filter((i) => i.domain === req?.domain),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === req?.domain),
      historicalTrend: sparkline7d(state.requirements.qualityScore),
    });
  },

  'delivery.top-requirements': (state, ctx) => {
    const req = state.delivery.topRequirements.find((r) => r.id === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: req ? [{ id: req.id, title: req.title, detail: req.domain, meta: req.risk }] : [],
      supportingEvidence: state.delivery.pipelineVelocity.map((p) => `${p.stage}: ${p.count} items`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.delivery.businessImpactIndex),
    });
  },

  'release.in-flight': (state, ctx) => {
    const rel = state.release.releases.find((r) => r.id === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: state.release.checklist.map((c, i) => ({ id: `CHK-${i}`, title: c.item, meta: c.status })),
      supportingEvidence: state.release.riskMatrix.map((r) => r.title),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status === 'critical'),
      relatedIncidents: incidentsFromState(state).filter((i) => i.domain === rel?.domain),
      relatedReleases: rel ? [{ id: rel.id, name: rel.name, confidence: rel.confidence, risk: rel.risk }] : releasesFromState(state),
      historicalTrend: sparkline7d(rel?.confidence ?? state.release.confidence),
    });
  },

  'release.risk-matrix': (state, ctx) => {
    const risk = state.release.riskMatrix.find((r) => r.title === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: risk ? [{ id: 'RISK-1', title: risk.title, detail: risk.domain, meta: risk.severity }] : [],
      supportingEvidence: state.release.checklist.map((c) => `${c.item}: ${c.status}`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === risk?.domain),
      historicalTrend: sparkline7d(state.release.confidence),
    });
  },

  'governance.top-findings': (state, ctx) => {
    const finding = state.governance.topFindings.find((f) => f.title === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: finding ? [{ id: 'FND-1', title: finding.title, meta: finding.severity }] : [],
      supportingEvidence: state.governance.auditTrail.map((a) => `${a.time} — ${a.event}`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(state.governance.governanceScore),
    });
  },

  'production.open-incidents': (state, ctx) => {
    const inc = state.production.openIncidents.find((i) => i.id === ctx.segment);
    const rca = state.production.topIssues.find((i) => i.issue === inc?.title);
    return buildPayload(ctx, {
      sourceRecords: inc ? [{ id: inc.id, title: inc.title, detail: inc.domain, meta: `${inc.severity} · ${inc.status}` }] : [],
      supportingEvidence: rca ? [rca.rca] : state.production.topIssues.map((i) => i.rca),
      relatedApplications: state.production.serviceHealth.map((s) => ({ name: s.name, status: s.status })),
      relatedIncidents: inc ? [{ id: inc.id, title: inc.title, severity: inc.severity, domain: inc.domain }] : incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.production.incidentTrend.map((p) => ({ day: p.day, value: p.count })),
    });
  },

  'production.service-health': (state, ctx) => {
    const svc = state.production.serviceHealth.find((s) => s.name === ctx.segment);
    const issue = state.production.topIssues.find((i) => i.issue.includes((ctx.segment ?? '').split(' ')[0]));
    return buildPayload(ctx, {
      sourceRecords: svc ? [{ id: svc.name, title: svc.name, meta: `${svc.uptime}% uptime · ${svc.status}` }] : [],
      supportingEvidence: issue ? [issue.rca] : [],
      relatedApplications: [{ name: ctx.segment ?? '', status: svc?.status }],
      relatedIncidents: incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(svc?.uptime ?? state.production.health),
    });
  },

  'development.security-items': (state, ctx) => {
    const item = state.development.securityItems.find((s) => s.title === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: item ? [{ id: 'SEC-1', title: item.title, meta: item.severity }] : [],
      supportingEvidence: state.development.prAging.map((p) => `${p.range}: ${p.count} PRs`),
      relatedApplications: appsFromArchitecture(state),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.development.qualityTrend.map((p) => ({ day: p.month, value: p.quality })),
    });
  },

  'executive.critical-incidents': (state, ctx) => {
    const inc = state.executive.criticalIncidents.find((i) => i.id === ctx.segment);
    return buildPayload(ctx, {
      sourceRecords: inc ? [{ id: inc.id, title: inc.title, detail: inc.domain, meta: `${inc.severity} · ${inc.duration}` }] : [],
      supportingEvidence: state.production.topIssues.map((i) => i.rca),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'healthy'),
      relatedIncidents: inc ? [{ id: inc.id, title: inc.title, severity: inc.severity, domain: inc.domain }] : incidentsFromState(state),
      relatedReleases: releasesFromState(state),
      historicalTrend: state.production.incidentTrend.map((p) => ({ day: p.day, value: p.count })),
    });
  },

  'ai-governance.use-case-registry': (state, ctx) => {
    const uc = useCasesFromState(state).find((u) => u.id === ctx.segment);
    if (!uc) {
      return buildPayload(ctx, {
        sourceRecords: [{ id: ctx.segment ?? '—', title: ctx.label, meta: String(ctx.value) }],
        supportingEvidence: state.dynamicInsights.slice(0, 3),
        relatedApplications: appsFromArchitecture(state),
        relatedIncidents: incidentsFromState(state),
        relatedReleases: releasesFromState(state),
      });
    }
    return buildUseCaseDrilldown(state, uc, ctx);
  },

  'ai-governance.ai-controls': (state, ctx) => {
    const control = AI_CONTROLS.find((c) => c.id === ctx.segment);
    if (control) return buildControlDrilldown(state, control, ctx);
    return buildPayload(ctx, {
      sourceRecords: AI_CONTROLS.map(controlToRecord),
      supportingEvidence: AI_CONTROLS.map((c) => `${c.controlDomain}: ${c.testResult}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: AI_INCIDENTS.slice(0, 3).map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_CONTROLS_TREND.map((p) => ({ month: p.month, value: p.coverage })),
    });
  },

  'ai-governance.ai-incidents': (state, ctx) => {
    const incident = AI_INCIDENTS.find((i) => i.id === ctx.segment);
    if (incident) return buildIncidentDrilldown(state, incident, ctx);
    return buildPayload(ctx, {
      sourceRecords: AI_INCIDENTS.map(incidentToRecord),
      supportingEvidence: AI_INCIDENTS.map((i) => i.rootCause),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: AI_INCIDENTS.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_INCIDENTS_TREND.map((p) => ({ day: p.day, value: p.open + p.closed })),
    });
  },

  'ai-governance.incidents-trend': (state, ctx) => {
    const segment = ctx.segment ?? '';
    const [day, seriesKey] = segment.includes('|') ? segment.split('|') : [segment, null];
    let incidents = AI_INCIDENTS;
    if (seriesKey === 'open') incidents = AI_INCIDENTS.filter((i) => i.status === 'Open');
    else if (seriesKey === 'closed') incidents = AI_INCIDENTS.filter((i) => i.status === 'Resolved');
    const trendPoint = AI_INCIDENTS_TREND.find((p) => p.day === day);
    return buildPayload(ctx, {
      sourceRecords: incidents.map(incidentToRecord),
      supportingEvidence: [
        trendPoint ? `${day}: ${trendPoint.open} open, ${trendPoint.closed} closed` : `Trend segment: ${segment}`,
        ...incidents.slice(0, 3).map((i) => i.rootCause),
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidents.map((i) => ({
        id: i.id,
        title: i.incidentType,
        severity: i.severity,
        domain: i.application,
      })),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: AI_INCIDENTS_TREND.map((p) => ({
        day: p.day,
        value: seriesKey === 'closed' ? p.closed : seriesKey === 'open' ? p.open : p.open + p.closed,
      })),
    });
  },

  'approval-workflow.by-stage': (state, ctx) => {
    const stageRow = APPROVALS_BY_STAGE.find((s) => s.stage === ctx.segment);
    const stageFull = ctx.segment === 'AI Gov' ? 'AI Governance' : ctx.segment === 'Knowled' ? 'Knowledge Management' : ctx.segment;
    const records = APPROVAL_REQUESTS.filter((r) =>
      r.stage.startsWith(stageFull) || r.stage.startsWith(ctx.segment ?? ''),
    );
    return buildPayload(ctx, {
      sourceRecords: records.map(approvalToDrilldownRecord),
      supportingEvidence: [
        stageRow ? `${stageRow.stage}: ${stageRow.count} pending` : `Stage: ${ctx.segment}`,
        ...records.slice(0, 3).map((r) => r.title),
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: APPROVALS_BY_STAGE.map((s) => ({ stage: s.stage, value: s.count })),
    });
  },

  'approval-workflow.trend': (state, ctx) => {
    const segment = ctx.segment ?? '';
    const [month, seriesKey] = segment.includes('|') ? segment.split('|') : [segment, null];
    const trendPoint = APPROVAL_TREND.find((p) => p.month === month);
    let records = APPROVAL_REQUESTS;
    if (seriesKey === 'pending') records = APPROVAL_REQUESTS.filter((r) => PENDING_STATUSES.includes(r.status));
    else if (seriesKey === 'approved') records = APPROVAL_REQUESTS.filter((r) => r.status === 'Approved' || r.status === 'Closed');
    else if (seriesKey === 'escalated') records = APPROVAL_REQUESTS.filter((r) => r.status === 'Escalated');
    return buildPayload(ctx, {
      sourceRecords: records.slice(0, 12).map(approvalToDrilldownRecord),
      supportingEvidence: [
        trendPoint ? `${month}: ${trendPoint.pending} pending, ${trendPoint.approved} approved` : `Trend: ${segment}`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: APPROVAL_TREND.map((p) => ({
        month: p.month,
        value: seriesKey === 'approved' ? p.approved : seriesKey === 'escalated' ? p.escalated : p.pending,
      })),
    });
  },

  'approval-workflow.queue': (state, ctx) => {
    const item = APPROVAL_REQUESTS.find((r) => r.id === ctx.segment);
    if (!item) {
      return buildPayload(ctx, {
        sourceRecords: APPROVAL_REQUESTS.filter((r) => PENDING_STATUSES.includes(r.status)).map(approvalToDrilldownRecord),
        supportingEvidence: APPROVAL_HISTORY.slice(0, 4).map((h) => `${h.action}: ${h.comment}`),
        relatedApplications: appsFromArchitecture(state).slice(0, 4),
        relatedIncidents: incidentsFromState(state).slice(0, 2),
        relatedReleases: releasesFromState(state).slice(0, 3),
        historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.pending })),
      });
    }
    return buildPayload(ctx, {
      sourceRecords: [approvalToDrilldownRecord(item)],
      supportingEvidence: [
        ...item.reviewNotes,
        ...item.relatedArtifacts.map((a) => `${a.id}: ${a.name}`),
        ...item.traceabilityChain.map((t) => `${t.stage} → ${t.nodeId}`),
      ],
      relatedApplications: appsFromArchitecture(state).filter((a) => a.name.includes(item.domain.split(' ')[0])).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === item.domain).slice(0, 3),
      historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.pending })),
    });
  },

  'approval-workflow.history': (state, ctx) => {
    const entry = APPROVAL_HISTORY.find((h) => h.id === ctx.segment);
    const item = entry ? APPROVAL_REQUESTS.find((r) => r.id === entry.approvalId) : null;
    return buildPayload(ctx, {
      sourceRecords: entry
        ? [{ id: entry.id, title: entry.action, detail: entry.actor, meta: `${entry.previousStatus} → ${entry.newStatus}` }]
        : APPROVAL_HISTORY.map((h) => ({ id: h.id, title: h.action, detail: h.actor, meta: h.approvalId })),
      supportingEvidence: entry
        ? [entry.comment, item?.title ?? '']
        : APPROVAL_HISTORY.map((h) => h.comment),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: APPROVAL_HISTORY.map((h, i) => ({ step: i, value: h.approvalId })),
    });
  },

  'rbac.persona-mapping': (state, ctx) => {
    const mapping = PERSONA_ENTITLEMENT_MATRIX.find((m) => m.personaId === ctx.segment);
    const role = mapping ? ROLE_MAP[mapping.roleId] : null;
    return buildPayload(ctx, {
      sourceRecords: mapping
        ? [{ id: mapping.personaId, title: mapping.roleLabel, detail: mapping.dashboards.join(', '), meta: mapping.actions.join(', ') }]
        : PERSONA_ENTITLEMENT_MATRIX.map((m) => ({ id: m.personaId, title: m.roleLabel, meta: m.roleId })),
      supportingEvidence: role
        ? role.grants.map((g) => `${g.resource}: ${g.permissions.join(', ')}`)
        : PERSONA_ENTITLEMENT_MATRIX.map((m) => m.reports.join(', ')),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(RBAC_KPI_MOCK.effectiveGrants),
    });
  },

  'rbac.resource-access': (state, ctx) => {
    const [roleId, resourceId] = (ctx.segment ?? '').split('|');
    const role = ROLE_MAP[roleId];
    const resource = RESOURCE_CATALOG.find((r) => r.id === resourceId);
    const grant = role?.grants.find((g) => g.resource === resourceId);
    return buildPayload(ctx, {
      sourceRecords: grant
        ? [{ id: `${roleId}-${resourceId}`, title: `${role?.label} → ${resource?.label}`, meta: grant.permissions.join(', ') }]
        : ROLE_CATALOG.flatMap((r) => r.grants.map((g) => ({
          id: `${r.id}-${g.resource}`,
          title: `${r.label} → ${g.resource}`,
          meta: g.permissions.join(', '),
        }))).slice(0, 12),
      supportingEvidence: grant
        ? grant.permissions.map((p) => `${resource?.label}: ${p}`)
        : PERMISSION_CATALOG.map((p) => p.label),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d((grant?.permissions.length ?? 3) * 12),
    });
  },

  'workflow.bottlenecks': (state, ctx) => {
    const stageWorkflows = WORKFLOW_ORCHESTRATION_MOCK.filter(
      (w) => WORKFLOW_STAGE_LABEL[w.currentStage] === ctx.segment,
    );
    return buildPayload(ctx, {
      sourceRecords: stageWorkflows.length > 0
        ? stageWorkflows.map((w) => ({ id: w.id, title: w.title, detail: w.owner, meta: `${w.stageDurationHours}h` }))
        : WORKFLOW_ORCHESTRATION_MOCK.map((w) => ({
          id: w.id,
          title: w.title,
          detail: WORKFLOW_STAGE_LABEL[w.currentStage],
          meta: `${w.stageDurationHours}h`,
        })),
      supportingEvidence: stageWorkflows.map((w) => w.pendingActions.join('; ')),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: sparkline7d(ctx.value ?? 48),
    });
  },

  'workflow.completion': (state, ctx) => {
    const wf = WORKFLOW_ORCHESTRATION_MOCK.find((w) => w.id === ctx.segment || w.title.includes(ctx.segment ?? ''));
    return buildPayload(ctx, {
      sourceRecords: wf
        ? [{ id: wf.id, title: wf.title, detail: wf.owner, meta: `${wf.completionPct}%` }]
        : WORKFLOW_ORCHESTRATION_MOCK.map((w) => ({
          id: w.id,
          title: w.title,
          detail: WORKFLOW_STAGE_LABEL[w.currentStage],
          meta: `${w.completionPct}%`,
        })),
      supportingEvidence: wf
        ? wf.traceabilityChain.map((l) => `${WORKFLOW_STAGE_LABEL[l.stage]}: ${l.label}`)
        : WORKFLOW_ORCHESTRATION_MOCK.map((w) => w.lifecycleStatus),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).filter((r) => r.domain === wf?.domain).slice(0, 3),
      historicalTrend: sparkline7d(wf?.completionPct ?? ctx.value ?? 68),
    });
  },

  'workflow.sla-breaches': (state, ctx) => {
    const breached = WORKFLOW_ORCHESTRATION_MOCK.filter((w) => w.slaBreached);
    return buildPayload(ctx, {
      sourceRecords: breached.map((w) => ({
        id: w.id,
        title: w.title,
        detail: w.owner,
        meta: `Due ${w.dueDate}`,
      })),
      supportingEvidence: breached.flatMap((w) => w.pendingActions),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(breached.length * 15),
    });
  },

  'workflow.approval-delays': (state, ctx) => {
    const delayed = WORKFLOW_ORCHESTRATION_MOCK.filter(
      (w) => ['Submitted', 'Assigned', 'Under Review', 'Changes Requested', 'Escalated'].includes(w.lifecycleStatus),
    );
    return buildPayload(ctx, {
      sourceRecords: delayed.map((w) => ({
        id: w.id,
        title: w.title,
        detail: w.reviewer ?? 'Unassigned',
        meta: w.lifecycleStatus,
      })),
      supportingEvidence: delayed.map((w) => w.pendingActions.join('; ')),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: APPROVAL_TREND.map((p) => ({ month: p.month, value: p.pending })),
    });
  },

  'workflow.active': (state, ctx) => {
    const active = WORKFLOW_ORCHESTRATION_MOCK.filter((w) => w.currentStage !== 'production');
    return buildPayload(ctx, {
      sourceRecords: active.map((w) => ({
        id: w.id,
        title: w.title,
        detail: WORKFLOW_STAGE_LABEL[w.currentStage],
        meta: w.domain,
      })),
      supportingEvidence: active.map((w) => `${w.owner} · ${w.lifecycleStatus}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: sparkline7d(active.length * 10),
    });
  },

  'audit-center.open-findings': (state, ctx) => {
    const open = AUDIT_FINDINGS.filter((f) => f.status === 'Open' || f.status === 'In Progress');
    return buildPayload(ctx, {
      sourceRecords: open.map((f) => ({ id: f.id, title: f.description.slice(0, 80), detail: f.domain, meta: f.severity })),
      supportingEvidence: open.flatMap((f) => f.linkedEvidence).slice(0, 8),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: sparkline7d(open.length * 5),
    });
  },

  'audit-center.findings-by-severity': (state, ctx) => {
    const severity = ctx.segment ?? '';
    const findings = AUDIT_FINDINGS.filter((f) => !severity || f.severity === severity);
    return buildPayload(ctx, {
      sourceRecords: findings.map((f) => ({ id: f.id, title: f.description.slice(0, 80), detail: f.controlArea, meta: `${f.severity} · ${f.status}` })),
      supportingEvidence: findings.flatMap((f) => f.linkedEvidence).slice(0, 10),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low').slice(0, 3),
      relatedIncidents: incidentsFromState(state).filter((i) => !severity || i.severity === severity.toLowerCase()),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(findings.length * 8),
    });
  },

  'audit-center.findings-by-domain': (state, ctx) => {
    const domain = ctx.segment ?? '';
    const findings = AUDIT_FINDINGS.filter((f) => !domain || f.domain === domain);
    return buildPayload(ctx, {
      sourceRecords: findings.map((f) => ({ id: f.id, title: f.description.slice(0, 80), meta: f.severity })),
      supportingEvidence: AUDIT_EVIDENCE.filter((e) => !domain || e.domain === domain).slice(0, 6).map((e) => `${e.id}: ${e.title}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(findings.length * 6),
    });
  },

  'audit-center.findings-aging': (state, ctx) => {
    const bucket = ctx.segment ?? '';
    const now = new Date('2026-06-06');
    const open = AUDIT_FINDINGS.filter((f) => f.status === 'Open' || f.status === 'In Progress');
    const aged = open.filter((f) => {
      const age = Math.floor((now.getTime() - new Date(f.createdAt).getTime()) / 86400000);
      if (bucket === '0-30d') return age <= 30;
      if (bucket === '31-60d') return age > 30 && age <= 60;
      if (bucket === '61-90d') return age > 60 && age <= 90;
      if (bucket === '90d+') return age > 90;
      return true;
    });
    return buildPayload(ctx, {
      sourceRecords: aged.map((f) => ({ id: f.id, title: f.description.slice(0, 80), detail: `Due ${f.dueDate}`, meta: f.severity })),
      supportingEvidence: [`Aging bucket: ${bucket || 'all'}`, ...aged.map((f) => `${f.id} created ${f.createdAt}`)],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(aged.length * 10),
    });
  },

  'audit-center.evidence-coverage': (state, ctx) => {
    const kpis = computeAuditKpis();
    const segment = ctx.segment ?? '';
    const evidence = segment
      ? AUDIT_EVIDENCE.filter((e) => e.evidenceType.includes(segment) || e.lifecycleStage === segment)
      : AUDIT_EVIDENCE;
    return buildPayload(ctx, {
      sourceRecords: evidence.slice(0, 12).map((e) => ({ id: e.id, title: e.title, detail: e.domain, meta: e.status })),
      supportingEvidence: [`Coverage: ${kpis.evidenceCoverage}%`, `Approved: ${evidence.filter((e) => e.status === 'Approved').length}/${evidence.length}`],
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(kpis.evidenceCoverage),
    });
  },

  'audit-center.compliance-coverage': (state, ctx) => {
    const kpis = computeAuditKpis();
    return buildPayload(ctx, {
      sourceRecords: AUDIT_OBSERVATIONS.slice(0, 8).map((o) => ({ id: o.id, title: o.observation.slice(0, 80), meta: o.closureStatus })),
      supportingEvidence: state.governance.complianceStandards.map((s) => `${s.name}: ${s.score}%`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: kpis.complianceTrend.map((t) => ({ day: t.month, value: t.score })),
    });
  },

  'audit-center.overdue-findings': (state, ctx) => {
    const now = new Date('2026-06-06');
    const overdue = AUDIT_FINDINGS.filter((f) => (f.status === 'Open' || f.status === 'In Progress') && new Date(f.dueDate) < now);
    return buildPayload(ctx, {
      sourceRecords: overdue.map((f) => ({ id: f.id, title: f.description.slice(0, 80), detail: f.owner, meta: `Due ${f.dueDate}` })),
      supportingEvidence: overdue.map((f) => `${f.id}: ${f.severity} — ${f.controlArea}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'high' || i.severity === 'critical'),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(overdue.length * 12),
    });
  },

  'audit-center.audit-readiness': (state, ctx) => {
    const kpis = computeAuditKpis();
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'READINESS', title: `Audit Readiness Score: ${kpis.auditReadinessScore}%`, meta: 'Overall' },
        { id: 'EVIDENCE', title: `Evidence Coverage: ${kpis.evidenceCoverage}%`, meta: 'Evidence' },
        { id: 'CONTROLS', title: `Control Coverage: ${kpis.controlCoverage}%`, meta: 'Controls' },
        { id: 'FINDINGS', title: `Open Findings: ${kpis.openFindings}`, meta: 'Findings' },
      ],
      supportingEvidence: AUDIT_TIMELINE.slice(0, 5).map((e) => `${e.timestamp.slice(0, 10)} — ${e.action}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: kpis.complianceTrend.map((t) => ({ day: t.month, value: t.score })),
    });
  },

  'audit-center.control-coverage': (state, ctx) => {
    const kpis = computeAuditKpis();
    return buildPayload(ctx, {
      sourceRecords: state.governance.complianceStandards.map((s) => ({ id: s.name, title: s.name, meta: `${s.score}%` })),
      supportingEvidence: AUDIT_FINDINGS.filter((f) => f.status !== 'Closed').slice(0, 6).map((f) => `${f.id}: ${f.controlArea}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.controlCoverage),
    });
  },

  'notification-center.open-alerts': (state, ctx) => {
    const kpis = computeNotificationKpis();
    const open = PLATFORM_NOTIFICATIONS.filter((n) => ['Open', 'Escalated', 'Acknowledged'].includes(n.status));
    return buildPayload(ctx, {
      sourceRecords: open.slice(0, 12).map((n) => ({ id: n.id, title: n.title.slice(0, 80), detail: n.source, meta: n.severity })),
      supportingEvidence: open.slice(0, 6).map((n) => `${n.id}: ${n.type} — ${n.escalationLevel}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state).slice(0, 2),
      historicalTrend: sparkline7d(kpis.openAlerts * 3),
    });
  },

  'notification-center.critical-alerts': (state, ctx) => {
    const severity = ctx.segment ?? 'critical';
    const critical = PLATFORM_NOTIFICATIONS.filter((n) => n.severity === severity && n.status !== 'Resolved' && n.status !== 'Dismissed');
    return buildPayload(ctx, {
      sourceRecords: critical.map((n) => ({ id: n.id, title: n.title.slice(0, 80), meta: `${n.type} · ${n.source}` })),
      supportingEvidence: critical.map((n) => n.escalationTrigger ?? n.message.slice(0, 60)).slice(0, 8),
      relatedApplications: appsFromArchitecture(state).filter((a) => a.status !== 'low').slice(0, 3),
      relatedIncidents: incidentsFromState(state).filter((i) => i.severity === 'critical' || i.severity === 'high'),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(critical.length * 10),
    });
  },

  'notification-center.alerts-by-severity': (state, ctx) => {
    const sev = ctx.segment ?? '';
    const alerts = PLATFORM_NOTIFICATIONS.filter((n) => !sev || n.severity === sev.toLowerCase());
    return buildPayload(ctx, {
      sourceRecords: alerts.slice(0, 10).map((n) => ({ id: n.id, title: n.title.slice(0, 80), meta: n.status })),
      supportingEvidence: alerts.slice(0, 5).map((n) => `${n.source}: ${n.type}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(alerts.length * 5),
    });
  },

  'notification-center.alerts-by-source': (state, ctx) => {
    const source = ctx.segment ?? '';
    const alerts = PLATFORM_NOTIFICATIONS.filter((n) => !source || n.source === source);
    return buildPayload(ctx, {
      sourceRecords: alerts.slice(0, 10).map((n) => ({ id: n.id, title: n.title.slice(0, 80), meta: n.severity })),
      supportingEvidence: alerts.filter((n) => n.linkedWorkflow).slice(0, 6).map((n) => `${n.linkedWorkflow}: ${n.title.slice(0, 40)}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(alerts.length * 6),
    });
  },

  'notification-center.escalation-trend': (state, ctx) => {
    const kpis = computeNotificationKpis();
    return buildPayload(ctx, {
      sourceRecords: ESCALATION_NOTIFICATIONS.map((n) => ({ id: n.id, title: n.title.slice(0, 80), detail: n.escalationTrigger ?? '', meta: n.escalationLevel })),
      supportingEvidence: ESCALATION_NOTIFICATIONS.map((n) => `${n.escalationLevel}: ${n.owner}`).slice(0, 8),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: kpis.escalationTrend.map((t) => ({ day: t.month, value: t.count * 5 })),
    });
  },

  'notification-center.sla-breaches': (state, ctx) => {
    const breaches = PLATFORM_NOTIFICATIONS.filter((n) => n.escalationTrigger === 'SLA Breach' && n.status !== 'Resolved');
    return buildPayload(ctx, {
      sourceRecords: breaches.map((n) => ({ id: n.id, title: n.title.slice(0, 80), detail: n.linkedWorkflow ?? '', meta: n.escalationLevel })),
      supportingEvidence: breaches.map((n) => `${n.id}: ${n.source}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state).slice(0, 3),
      historicalTrend: sparkline7d(breaches.length * 12),
    });
  },

  'notification-center.resolved-alerts': (state, ctx) => {
    const resolved = PLATFORM_NOTIFICATIONS.filter((n) => n.status === 'Resolved');
    return buildPayload(ctx, {
      sourceRecords: resolved.map((n) => ({ id: n.id, title: n.title.slice(0, 80), meta: n.resolvedAt?.slice(0, 10) ?? '' })),
      supportingEvidence: resolved.slice(0, 6).map((n) => `Resolved by ${n.owner}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(resolved.length * 4),
    });
  },

  'persistence.health': (state, ctx) => {
    const kpis = computePersistenceKpis(getPersistenceLayer());
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'HEALTH', title: `Persistence Health: ${kpis.persistenceHealth}%`, meta: 'Overall' },
        { id: 'ADAPTER', title: `Active Adapter: ${kpis.activeAdapter}`, meta: kpis.adapterStatus },
        { id: 'REPOS', title: 'Repositories: 8', meta: 'healthy' },
      ],
      supportingEvidence: ['AuthRepository', 'WorkflowRepository', 'NotificationRepository', 'AuditRepository', 'EvidenceRepository'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.persistenceHealth),
    });
  },

  'persistence.storage-utilization': (state, ctx) => {
    const kpis = computePersistenceKpis(getPersistenceLayer());
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'workflows', title: 'Workflows Entity', meta: 'adip.unified.lifecycle' },
        { id: 'notifications', title: 'Notifications Entity', meta: 'adip.notifications' },
        { id: 'auth', title: 'Authentication Entity', meta: 'adip.auth.*' },
        { id: 'audit', title: 'Audit Entities', meta: 'mock + cache' },
      ],
      supportingEvidence: [`Total bytes: ${kpis.totalStorageBytes}`, `Utilization: ${kpis.storageUtilization}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 4),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.storageUtilization),
    });
  },

  'persistence.repository-activity': (state, ctx) => {
    const kpis = computePersistenceKpis(getPersistenceLayer());
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'AuthRepository', title: 'AuthRepository', meta: 'read/write' },
        { id: 'WorkflowRepository', title: 'WorkflowRepository', meta: 'read/write' },
        { id: 'NotificationRepository', title: 'NotificationRepository', meta: 'read/write' },
        { id: 'AuditRepository', title: 'AuditRepository', meta: 'read' },
      ],
      supportingEvidence: [`Total operations: ${kpis.repositoryActivity}`, `Total records: ${kpis.totalRecords}`],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.repositoryActivity * 2),
    });
  },

  'persistence.data-quality': (state, ctx) => {
    const kpis = computePersistenceKpis(getPersistenceLayer());
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'DQ', title: `Data Quality Score: ${kpis.dataQualityScore}%`, meta: 'Overall' },
        { id: 'ENTITIES', title: 'Entity Types: 10', meta: 'catalogued' },
      ],
      supportingEvidence: ['Workflow lifecycle data validated', 'Notification state schema consistent', 'Auth session TTL enforced'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.dataQualityScore),
    });
  },

  'persistence.adapter-status': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'localStorage', title: 'LocalStorageAdapter', meta: 'active' },
        { id: 'memory', title: 'MemoryAdapter', meta: 'standby' },
        { id: 'future-api', title: 'FutureApiAdapter', meta: 'stub' },
        { id: 'future-database', title: 'FutureDatabaseAdapter', meta: 'stub' },
      ],
      supportingEvidence: ['No direct localStorage access in application modules', 'All persistence routed through repositories'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(96),
    });
  },

  'activity.volume': (state, ctx) => {
    const kpis = computeActivityKpis(getEventBus().history.allEvents());
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'total', title: 'Total Events', meta: String(kpis.eventVolume) },
        { id: '24h', title: '24h Volume', meta: String(kpis.eventVolume24h) },
        { id: 'health', title: 'Platform Health', meta: `${kpis.platformEventHealth}%` },
      ],
      supportingEvidence: ['In-memory enterprise event bus', '250 seeded events with cross-linked lineage'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.eventVolume24h),
    });
  },

  'activity.events-by-type': (state, ctx) => {
    const events = getEventBus().history.allEvents();
    const counts = {};
    events.forEach((e) => { counts[e.type] = (counts[e.type] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: top.map(([type, count]) => ({ id: type, title: type, meta: String(count) })),
      supportingEvidence: ['EventRegistry catalogs 33 canonical event types', 'Categories span authentication through artifacts'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(events.length),
    });
  },

  'activity.events-by-source': (state, ctx) => {
    const kpis = computeActivityKpis(getEventBus().history.allEvents());
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'workflow', title: 'WorkflowOrchestration', meta: String(kpis.workflowActivity) },
        { id: 'approval', title: 'ApprovalWorkflow', meta: String(kpis.approvalActivity) },
        { id: 'audit', title: 'AuditCenter', meta: String(kpis.auditActivity) },
        { id: 'notification', title: 'NotificationCenter', meta: String(kpis.notificationEvents) },
      ],
      supportingEvidence: [`${kpis.uniqueSources} unique event sources registered`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.uniqueSources * 10),
    });
  },

  'activity.critical-events': (state, ctx) => {
    const events = getEventBus().history.allEvents().filter((e) => e.severity === 'critical' || e.severity === 'high');
    return buildPayload(ctx, {
      sourceRecords: events.slice(0, 12).map((e) => ({
        id: e.id,
        title: e.message,
        meta: `${e.severity} · ${e.source}`,
      })),
      supportingEvidence: ['Critical and high-severity events trigger event-driven notifications'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(events.length),
    });
  },

  'activity.workflow-events': (state, ctx) => {
    const events = getEventBus().history.allEvents().filter((e) => e.category === 'workflow' || e.category === 'approval');
    return buildPayload(ctx, {
      sourceRecords: events.slice(0, 10).map((e) => ({
        id: e.id,
        title: e.message,
        meta: `${e.entityId} · ${e.actor}`,
      })),
      supportingEvidence: ['Unified lifecycle publishes stage, approval, release, and production events'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(events.length),
    });
  },

  'activity.audit-events': (state, ctx) => {
    const events = getEventBus().history.allEvents().filter((e) => e.category === 'audit' || e.category === 'evidence');
    return buildPayload(ctx, {
      sourceRecords: events.slice(0, 10).map((e) => ({
        id: e.id,
        title: e.message,
        meta: `${e.entityType}:${e.entityId}`,
      })),
      supportingEvidence: ['Audit findings, observations, evidence, and compliance changes published to bus'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(events.length),
    });
  },

  'activity.notification-events': (state, ctx) => {
    const events = getEventBus().history.allEvents().filter((e) => e.category === 'notification');
    return buildPayload(ctx, {
      sourceRecords: events.slice(0, 10).map((e) => ({
        id: e.id,
        title: e.message,
        meta: e.actor,
      })),
      supportingEvidence: ['Event-driven notification bridge creates alerts from critical platform events'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(events.length),
    });
  },

  'abac.policy-coverage': (state, ctx) => {
    const kpis = computeAbacKpis('cio', 500, 500);
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'enabled', title: 'Enabled Policies', meta: String(kpis.enabledPolicies) },
        { id: 'total', title: 'Total Policies', meta: String(kpis.totalPolicies) },
        { id: 'coverage', title: 'Coverage', meta: `${kpis.policyCoverage}%` },
      ],
      supportingEvidence: ['RBAC extended with 8 ABAC attribute policies', 'Row-level security on workflows, audit, notifications, traceability'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.policyCoverage),
    });
  },

  'abac.domain-ownership': (state, ctx) => {
    const scope = buildVisibilityScope('application-owner');
    return buildPayload(ctx, {
      sourceRecords: scope.domains.map((d) => ({ id: d, title: d, meta: 'domain' })),
      supportingEvidence: ['Domain assignments mapped to personas', 'Application ownership drives row filters'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(scope.domains.length * 10),
    });
  },

  'abac.access-violations': (state, ctx) => {
    const kpis = computeAbacKpis('compliance-officer', 500, 120);
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'v1', title: 'Restricted evidence outside domain', meta: 'denied' },
        { id: 'v2', title: 'Production workflow scope mismatch', meta: 'denied' },
      ],
      supportingEvidence: [`${kpis.accessViolations} mock violations in policy evaluation`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.accessViolations),
    });
  },

  'abac.scope-distribution': (state, ctx) => {
    const kpis = computeAbacKpis('cio', 500, 500);
    return buildPayload(ctx, {
      sourceRecords: kpis.scopeDistribution.map((s) => ({ id: s.scope, title: s.scope, meta: String(s.count) })),
      supportingEvidence: ['Scoped visibility: application, portfolio, domain, security, global'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.scopedResources),
    });
  },

  'copilot.recommendations': (state, ctx) => {
    const kpis = computeCopilotKpis();
    return buildPayload(ctx, {
      sourceRecords: COPILOT_RECOMMENDATIONS.slice(0, 12).map((r) => ({
        id: r.id,
        title: r.title,
        meta: `${r.domain} · ${r.priority}`,
      })),
      supportingEvidence: [
        `${kpis.aiRecommendations} total AI recommendations across ${COPILOT_PROJECTS.length} projects`,
        `${kpis.openRecommendations} open recommendations requiring action`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.openRecommendations),
    });
  },

  'copilot.delivery-health': (state, ctx) => {
    const kpis = computeCopilotKpis();
    const atRisk = COPILOT_PROJECTS.filter((p) => p.healthScore < 70).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: atRisk.map((p) => ({
        id: p.id,
        title: p.name,
        meta: `Health ${p.healthScore}% · Delivery risk ${p.deliveryRisk}%`,
      })),
      supportingEvidence: [
        `Portfolio average health: ${kpis.deliveryHealth}%`,
        `${kpis.projectsAtRisk} projects below health threshold`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.deliveryHealth),
    });
  },

  'copilot.portfolio-risk': (state, ctx) => {
    const kpis = computeCopilotKpis();
    const risky = [...COPILOT_PROJECTS].sort((a, b) => b.deliveryRisk - a.deliveryRisk).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: risky.map((p) => ({
        id: p.id,
        title: p.name,
        meta: `Delivery ${p.deliveryRisk}% · Testing ${p.testingRisk}%`,
      })),
      supportingEvidence: [
        `Portfolio average delivery risk: ${kpis.portfolioRisk}%`,
        `${kpis.criticalRisks} critical/high risk observations`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.portfolioRisk),
    });
  },

  'copilot.quality-improvement': (state, ctx) => {
    const kpis = computeCopilotKpis();
    const actions = COPILOT_IMPROVEMENT_ACTIONS.filter((a) => a.status === 'open').slice(0, 10);
    return buildPayload(ctx, {
      sourceRecords: actions.map((a) => ({
        id: a.id,
        title: a.title,
        meta: `+${a.predictedQualityGain}% quality · -${a.predictedRiskReduction}% risk`,
      })),
      supportingEvidence: [
        `${kpis.improvementActions} open improvement actions in backlog`,
        `Predicted portfolio quality gain: +${kpis.predictedQualityImprovement}%`,
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.predictedQualityImprovement),
    });
  },

  'copilot.recurring-issues': (state, ctx) => {
    const issues = topRecurringIssues(8);
    return buildPayload(ctx, {
      sourceRecords: issues.map((i, idx) => ({
        id: `issue-${idx}`,
        title: i.issue,
        meta: `${i.count} occurrences`,
      })),
      supportingEvidence: COPILOT_RISK_OBSERVATIONS.slice(0, 3).map((r) => r.observation),
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(issues.length * 5),
    });
  },

  'copilot.recommendations-by-domain': (state, ctx) => {
    const trend = recommendationTrend();
    return buildPayload(ctx, {
      sourceRecords: trend.map((t) => ({ id: t.name, title: t.name, meta: `${t.value} recommendations` })),
      supportingEvidence: ['Recommendations distributed across SDLC domains', 'Rule-based analysis from mock artifacts'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(trend.reduce((s, t) => s + t.value, 0)),
    });
  },

  'copilot.domain-risk': (state, ctx) => {
    const chart = domainRiskChart();
    return buildPayload(ctx, {
      sourceRecords: chart.map((d) => ({ id: d.name, title: d.name, meta: `Risk index ${d.value}` })),
      supportingEvidence: COPILOT_PROJECTS.slice(0, 3).map((p) => `${p.name}: ${p.deliveryRisk}% delivery risk`),
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(chart.reduce((s, d) => s + d.value, 0)),
    });
  },

  'prod-intel.production-risk': (state, ctx) => {
    const kpis = computeProductionIntelligenceKpis();
    const risky = [...PRODUCTION_APPLICATIONS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: risky.map((a) => ({ id: a.id, title: a.name, meta: `Risk ${a.riskScore}% · ${a.domain}` })),
      supportingEvidence: [`${kpis.totalApplications} applications monitored`, `${kpis.openIncidents} open production incidents`],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.productionRisk),
    });
  },

  'prod-intel.customer-impact': (state, ctx) => {
    const kpis = computeProductionIntelligenceKpis();
    const negative = CUSTOMER_SIGNALS.filter((s) => s.sentiment === 'negative').slice(0, 10);
    return buildPayload(ctx, {
      sourceRecords: negative.map((s) => ({ id: s.id, title: s.application, meta: `${s.painPoint} · ${s.channel}` })),
      supportingEvidence: [`${kpis.customerComplaints} formal complaints`, `${CUSTOMER_SIGNALS.length} total customer signals`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.customerImpact),
    });
  },

  'prod-intel.defect-leakage': (state, ctx) => {
    const kpis = computeProductionIntelligenceKpis();
    const stages = leakageByStage();
    return buildPayload(ctx, {
      sourceRecords: stages.map((s) => ({ id: s.name, title: s.name, meta: `${s.value} defects` })),
      supportingEvidence: [`${kpis.escapedDefects} escaped defects`, `${kpis.defectLeakage}% leakage rate`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.defectLeakage),
    });
  },

  'prod-intel.incident-trends': (state, ctx) => {
    const kpis = computeProductionIntelligenceKpis();
    const open = PRODUCTION_INCIDENTS.filter((i) => i.status === 'open').slice(0, 10);
    return buildPayload(ctx, {
      sourceRecords: open.map((i) => ({ id: i.id, title: i.title, meta: `${i.severity} · ${i.application}` })),
      supportingEvidence: [`${PRODUCTION_INCIDENTS.length} incidents in catalog`, `${kpis.criticalIncidents} critical/high severity`],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 4),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.openIncidents),
    });
  },

  'prod-intel.feedback-recommendations': (state, ctx) => {
    const kpis = computeProductionIntelligenceKpis();
    return buildPayload(ctx, {
      sourceRecords: FEEDBACK_RECOMMENDATIONS.slice(0, 12).map((r) => ({
        id: r.id, title: r.title, meta: `${r.domain} · ${r.priority}`,
      })),
      supportingEvidence: [
        `${kpis.feedbackRecommendations} recommendations fed to AI Delivery Copilot`,
        'Production feedback loop: Requirement → Release → Incident → RCA → Improvement',
      ],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.feedbackRecommendations),
    });
  },

  'prod-intel.rca-patterns': (state, ctx) => {
    const patterns = rcaPatternChart();
    return buildPayload(ctx, {
      sourceRecords: patterns.map((p) => ({ id: p.name, title: p.name, meta: `${p.value} records` })),
      supportingEvidence: ['RCA patterns: requirement, architecture, coding, testing, release, ops, third party'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(patterns.reduce((s, p) => s + p.value, 0)),
    });
  },

  'prod-intel.leakage-by-stage': (state, ctx) => {
    const stages = leakageByStage();
    return buildPayload(ctx, {
      sourceRecords: stages.map((s) => ({ id: s.name, title: s.name, meta: String(s.value) })),
      supportingEvidence: PRODUCTION_DEFECTS.filter((d) => d.escapedToProduction).slice(0, 3).map((d) => `${d.application}: ${d.leakageStage}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(stages.reduce((s, x) => s + x.value, 0)),
    });
  },

  'prod-intel.top-leakage-apps': (state, ctx) => {
    const apps = topLeakageApplications(8);
    return buildPayload(ctx, {
      sourceRecords: apps.map((a) => ({ id: a.name, title: a.name, meta: `${a.value} escapes` })),
      supportingEvidence: ['Top applications by production defect escape count'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(apps.reduce((s, a) => s + a.value, 0)),
    });
  },

  'prod-intel.feedback-by-domain': (state, ctx) => {
    const domains = feedbackByDomain();
    return buildPayload(ctx, {
      sourceRecords: domains.map((d) => ({ id: d.name, title: d.name, meta: `${d.value} recommendations` })),
      supportingEvidence: ['Recommendations span requirements through audit domains'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(domains.reduce((s, d) => s + d.value, 0)),
    });
  },

  'prod-intel.customer-channels': (state, ctx) => {
    const channels = ['call-center', 'branch', 'complaint', 'app-store', 'nps'];
    return buildPayload(ctx, {
      sourceRecords: channels.map((ch) => ({
        id: ch,
        title: ch,
        meta: String(CUSTOMER_SIGNALS.filter((s) => s.channel === ch).length),
      })),
      supportingEvidence: CUSTOMER_SIGNALS.slice(0, 3).map((s) => s.summary),
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(CUSTOMER_SIGNALS.length),
    });
  },

  'prod-intel.pain-points': (state, ctx) => {
    const pains = new Map();
    for (const s of CUSTOMER_SIGNALS) pains.set(s.painPoint, (pains.get(s.painPoint) ?? 0) + 1);
    const records = [...pains.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return buildPayload(ctx, {
      sourceRecords: records.map(([title, count]) => ({ id: title, title, meta: String(count) })),
      supportingEvidence: ['Customer pain points from call center, branch, complaints, app store, NPS'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(records.length * 8),
    });
  },

  'prod-intel.impacted-apps': (state, ctx) => {
    const counts = new Map();
    for (const s of CUSTOMER_SIGNALS.filter((x) => x.sentiment === 'negative')) {
      counts.set(s.application, (counts.get(s.application) ?? 0) + 1);
    }
    const records = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: records.map(([title, count]) => ({ id: title, title, meta: String(count) })),
      supportingEvidence: ['Applications with highest negative customer signal volume'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(records.reduce((s, r) => s + r[1], 0)),
    });
  },

  'prod-intel.app-risk': (state, ctx) => {
    const apps = [...PRODUCTION_APPLICATIONS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: apps.map((a) => ({ id: a.id, title: a.name, meta: `Risk ${a.riskScore}%` })),
      supportingEvidence: ['Risk score derived from incidents, defects, and audit findings'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(apps[0]?.riskScore ?? 50),
    });
  },

  'knowledge-center.coverage': (state, ctx) => {
    const kpis = computeKnowledgeCenterKpis();
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'lessons', title: 'Lessons Learned', meta: String(kpis.totalLessons) },
        { id: 'bp', title: 'Best Practices', meta: String(kpis.totalBestPractices) },
        { id: 'patterns', title: 'Patterns', meta: String(kpis.totalPatterns) },
        { id: 'playbooks', title: 'Playbooks', meta: String(kpis.totalPlaybooks) },
      ],
      supportingEvidence: [`Knowledge coverage: ${kpis.knowledgeCoverage}% across SDLC domains`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.knowledgeCoverage),
    });
  },

  'knowledge-center.reuse': (state, ctx) => {
    const kpis = computeKnowledgeCenterKpis();
    const top = [...LESSONS_LEARNED].sort((a, b) => b.reuseCount - a.reuseCount).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: top.map((l) => ({ id: l.id, title: l.title, meta: `${l.reuseCount}× reused` })),
      supportingEvidence: [`Knowledge reuse index: ${kpis.knowledgeReuse}`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.knowledgeReuse),
    });
  },

  'knowledge-center.risk-themes': (state, ctx) => {
    const themes = topRiskThemes(8);
    return buildPayload(ctx, {
      sourceRecords: themes.map((t) => ({ id: t.name, title: t.name, meta: String(t.value) })),
      supportingEvidence: LEARNING_RECOMMENDATIONS.slice(0, 3).map((r) => r.relatedTheme),
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(themes.length * 10),
    });
  },

  'knowledge-center.controls': (state, ctx) => {
    const controls = mostReusedControls(8);
    return buildPayload(ctx, {
      sourceRecords: controls.map((c) => ({ id: c.name, title: c.name, meta: `${c.value}×` })),
      supportingEvidence: REUSABLE_CONTROLS.slice(0, 2).map((c) => `${c.name} — ${c.framework}`),
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(controls[0]?.value ?? 20),
    });
  },

  'knowledge-center.playbooks': (state, ctx) => {
    const playbooks = mostReusedPlaybooks(8);
    return buildPayload(ctx, {
      sourceRecords: playbooks.map((p) => ({ id: p.name, title: p.name, meta: `${p.value}×` })),
      supportingEvidence: SDLC_PLAYBOOKS.slice(0, 2).map((p) => p.type),
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(playbooks[0]?.value ?? 15),
    });
  },

  'knowledge-center.adoption': (state, ctx) => {
    const kpis = computeKnowledgeCenterKpis();
    const top = [...BEST_PRACTICES].sort((a, b) => b.adoptionRate - a.adoptionRate).slice(0, 8);
    return buildPayload(ctx, {
      sourceRecords: top.map((b) => ({ id: b.id, title: b.title, meta: `${b.adoptionRate}%` })),
      supportingEvidence: [`Learning adoption average: ${kpis.learningAdoption}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.learningAdoption),
    });
  },

  'knowledge-center.lessons-category': (state, ctx) => {
    const cats = knowledgeByCategory();
    return buildPayload(ctx, {
      sourceRecords: cats.map((c) => ({ id: c.name, title: c.name, meta: String(c.value) })),
      supportingEvidence: LESSONS_LEARNED.slice(0, 3).map((l) => l.title),
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(LESSONS_LEARNED.length),
    });
  },

  'knowledge-center.best-practices': (state, ctx) => {
    const domains = bestPracticeByDomain();
    return buildPayload(ctx, {
      sourceRecords: domains.map((d) => ({ id: d.name, title: d.name, meta: String(d.value) })),
      supportingEvidence: BEST_PRACTICES.slice(0, 3).map((b) => b.title),
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(BEST_PRACTICES.length),
    });
  },

  'knowledge-center.patterns': (state, ctx) => {
    const kpis = computeKnowledgeCenterKpis();
    return buildPayload(ctx, {
      sourceRecords: [{ id: 'total', title: 'Architecture Patterns', meta: String(kpis.totalPatterns) }],
      supportingEvidence: ['Microservices, event-driven, API security, resilience, payments, UPI, KYC, AML'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.totalPatterns),
    });
  },

  'knowledge-center.rca-source': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'prod', title: 'Production RCA', meta: '20' },
        { id: 'audit', title: 'Audit Findings', meta: '20' },
        { id: 'control', title: 'Control Failures', meta: '20' },
      ],
      supportingEvidence: ['100 RCA knowledge articles from integrated sources'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(100),
    });
  },

  'knowledge-center.rec-by-type': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: LEARNING_RECOMMENDATIONS.slice(0, 10).map((r) => ({
        id: r.id, title: r.title, meta: `${r.type} · ${r.priority}`,
      })),
      supportingEvidence: ['Articles, controls, playbooks, patterns recommended from integrated hubs'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(LEARNING_RECOMMENDATIONS.length),
    });
  },

  'knowledge-center.rec-by-source': (state, ctx) => {
    const sources = recommendationsBySource();
    return buildPayload(ctx, {
      sourceRecords: sources.map((s) => ({ id: s.name, title: s.name, meta: String(s.value) })),
      supportingEvidence: ['Sources: Audit, Production, Copilot, Notifications, Workflow, Event Bus'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(sources.reduce((s, x) => s + x.value, 0)),
    });
  },

  'value-realization.hours-saved': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: PRODUCTIVITY_GAINS.map((p) => ({ id: p.domain, title: p.domain, meta: `${p.hoursSaved.toLocaleString()} hrs` })),
      supportingEvidence: [`Total hours saved: ${kpis.hoursSaved.toLocaleString()}`, `${kpis.fteSavings} FTE equivalent`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.hoursSaved / 1000),
    });
  },

  'value-realization.fte-savings': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: PRODUCTIVITY_GAINS.map((p) => ({ id: p.domain, title: p.domain, meta: `${p.fteEquivalent} FTE` })),
      supportingEvidence: [`${kpis.fteSavings} total FTE savings across SDLC`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.fteSavings * 10),
    });
  },

  'value-realization.productivity': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: PRODUCTIVITY_GAINS.map((p) => ({ id: p.domain, title: p.domain, meta: `${p.productivityPercent}%` })),
      supportingEvidence: [`Overall productivity gain: ${kpis.productivityGain}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.productivityGain),
    });
  },

  'value-realization.defects-prevented': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: [{ id: 'total', title: 'Defects Prevented', meta: String(kpis.defectsPrevented) }],
      supportingEvidence: ['Quality improvement from AI copilot and production intelligence'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.defectsPrevented),
    });
  },

  'value-realization.risk-reduction': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: VALUE_TRACEABILITY_CHAINS.map((c) => ({ id: c.capability, title: c.capability, meta: c.kpi })),
      supportingEvidence: [`${kpis.riskReduction}% portfolio risk reduction`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.riskReduction),
    });
  },

  'value-realization.annual-value': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: PORTFOLIOS.slice(0, 8).map((p) => ({ id: p.id, title: p.name, meta: `₹${(p.valueRealized / 1000).toFixed(0)}K` })),
      supportingEvidence: [`Annual value: ₹${(kpis.annualValueRealized / 1_000_000).toFixed(1)}M`, `100 programs · 500 projects`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.annualValueRealized / 100000),
    });
  },

  'value-realization.projected-value': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: VALUE_TREND_HISTORY.map((t) => ({ id: t.year, title: t.year, meta: `₹${(t.valueRealized / 1_000_000).toFixed(1)}M` })),
      supportingEvidence: [`3-year projected: ₹${(kpis.threeYearProjectedValue / 1_000_000).toFixed(1)}M`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.threeYearProjectedValue / 1000000),
    });
  },

  'value-realization.roi': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: VALUE_TREND_HISTORY.map((t) => ({ id: t.year, title: t.year, meta: `${t.roi}% ROI` })),
      supportingEvidence: [`Current ROI: ${kpis.roi}%`, 'Payback period: 8 months'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.roi),
    });
  },

  'value-realization.roi-annual': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: PROGRAMS.slice(0, 10).map((p) => ({ id: p.id, title: p.name, meta: `₹${(p.valueRealized / 1000).toFixed(0)}K` })),
      supportingEvidence: [`Annual savings modeled from ${PROGRAMS.length} programs`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.annualValueRealized / 100000),
    });
  },

  'value-realization.roi-3year': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: VALUE_TREND_HISTORY.map((t) => ({ id: t.year, title: t.year, meta: `₹${(t.valueRealized / 1_000_000).toFixed(1)}M` })),
      supportingEvidence: ['5-year trend history informs 3-year projection'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.threeYearProjectedValue / 1000000),
    });
  },

  'value-realization.transformation-score': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: MATURITY_SCORES.map((m) => ({ id: m.dimension, title: m.label, meta: `${m.score}%` })),
      supportingEvidence: [`Overall enterprise score: ${kpis.transformationScore}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.transformationScore),
    });
  },

  'value-realization.delivery-acceleration': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'req', title: 'Requirement Cycle', meta: '-32%' },
        { id: 'arch', title: 'Architecture Review', meta: '-28%' },
        { id: 'e2e', title: 'End-to-End', meta: '-35%' },
      ],
      supportingEvidence: ['Delivery acceleration from unified lifecycle and copilot'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(35),
    });
  },

  'value-realization.quality': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'defect', title: 'Defect Reduction', meta: '42%' },
        { id: 'leakage', title: 'Leakage Reduction', meta: '57%' },
        { id: 'incident', title: 'Prod Incidents', meta: '45%' },
      ],
      supportingEvidence: ['Quality gains from production intelligence and testing copilot'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(42),
    });
  },

  'value-realization.governance': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'approval', title: 'Approval Cycle', meta: '-61%' },
        { id: 'control', title: 'Control Coverage', meta: '82%' },
        { id: 'compliance', title: 'Compliance Readiness', meta: '78%' },
      ],
      supportingEvidence: ['Governance efficiency from ABAC, RBAC, and audit center'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(61),
    });
  },

  'value-realization.audit-efficiency': (state, ctx) => {
    const kpis = computeValueRealizationKpis();
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'prep', title: 'Audit Prep', meta: '-58%' },
        { id: 'evidence', title: 'Evidence Collection', meta: '-60%' },
        { id: 'readiness', title: 'Audit Readiness', meta: '68%' },
      ],
      supportingEvidence: [`${kpis.auditEfficiency}% overall audit efficiency`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.auditEfficiency),
    });
  },

  'value-realization.ai-adoption': (state, ctx) => {
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'copilot', title: 'Copilot Usage', meta: '94%' },
        { id: 'ai-sdlc', title: 'AI SDLC Coverage', meta: '71%' },
        { id: 'ai-gov', title: 'AI Gov Coverage', meta: '68%' },
      ],
      supportingEvidence: ['200 recommendations generated · 142 adopted'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(71),
    });
  },

  'portfolio-governance.portfolio-health': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: portfolioHealthByPortfolio().slice(0, 8).map((p) => ({ id: p.name, title: p.name, meta: `${p.value}%` })),
      supportingEvidence: [`Enterprise portfolio health: ${kpis.portfolioHealth}%`, '10 portfolios · 25 programs · 100 projects'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 1),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.portfolioHealth),
    });
  },

  'portfolio-governance.strategic-alignment': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: PG_PORTFOLIOS.slice(0, 8).map((p) => ({ id: p.id, title: p.name, meta: `${p.strategicAlignment}%` })),
      supportingEvidence: [`Enterprise strategic alignment: ${kpis.strategicAlignment}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.strategicAlignment),
    });
  },

  'portfolio-governance.funding-utilization': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: PG_PORTFOLIOS.map((p) => ({ id: p.id, title: p.name, meta: `${p.fundingUtilization}%` })),
      supportingEvidence: [`Funding utilization: ${kpis.fundingUtilization}%`, '120 funding requests across portfolios'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.fundingUtilization),
    });
  },

  'portfolio-governance.capacity-utilization': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: [
        { id: 'architect', title: 'Architects', meta: '88%' },
        { id: 'dev', title: 'Developers', meta: '79%' },
        { id: 'data', title: 'Data Engineers', meta: '91%' },
      ],
      supportingEvidence: [`Capacity utilization: ${kpis.capacityUtilization}%`, '500 resources · 3 critical bottlenecks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.capacityUtilization),
    });
  },

  'portfolio-governance.delivery-confidence': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: demandTopPrioritized(8).map((d) => ({ id: d.id, title: d.title, meta: `Score ${d.score}` })),
      supportingEvidence: [`Delivery confidence: ${kpis.deliveryConfidence}%`, '12 kill candidates flagged'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.deliveryConfidence),
    });
  },

  'portfolio-governance.benefits-realization': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: PG_TRACEABILITY_CHAINS.filter((c) => c.stage === 'Value' || c.stage === 'Production').map((c) => ({
        id: c.stage, title: c.entity, meta: c.outcome,
      })),
      supportingEvidence: [`Benefits realization: ${kpis.benefitsRealization}% of forecast`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.benefitsRealization),
    });
  },

  'portfolio-governance.risk-exposure': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: PG_DEMAND_REQUESTS.filter((d) => d.riskLevel === 'high' || d.riskLevel === 'critical').slice(0, 8).map((d) => ({
        id: d.id, title: d.title, meta: d.riskLevel,
      })),
      supportingEvidence: [`Portfolio risk exposure: ${kpis.riskExposure}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.riskExposure),
    });
  },

  'portfolio-governance.demand-backlog': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: demandTopPrioritized(10).map((d) => ({ id: d.id, title: d.title, meta: d.status })),
      supportingEvidence: [`Demand backlog: ${kpis.demandBacklog} requests`, '11 duplicate initiatives detected'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.demandBacklog),
    });
  },

  'portfolio-governance.investment-efficiency': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: PG_PORTFOLIO_HISTORY.slice(-4).map((h) => ({ id: h.quarter, title: h.quarter, meta: `${Math.round(h.fundingUtilization)}%` })),
      supportingEvidence: [`Investment efficiency: ${kpis.investmentEfficiency}%`],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.investmentEfficiency),
    });
  },

  'portfolio-governance.transformation-progress': (state, ctx) => {
    const kpis = computePortfolioGovernanceKpis();
    return buildPayload(ctx, {
      sourceRecords: PG_PORTFOLIO_HISTORY.map((h) => ({ id: h.quarter, title: h.quarter, meta: `${Math.round(h.portfolioHealth)}%` })),
      supportingEvidence: [`Transformation progress: ${kpis.transformationProgress}%`, 'Idea → Demand → Funding → Portfolio → SDLC → Production → Value'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.transformationProgress),
    });
  },

  'application-portfolio.application-health': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: APM_APPLICATIONS.slice(0, 10).map((a) => ({ id: a.id, title: a.name, meta: `${a.productionHealth}%` })),
      supportingEvidence: [`Application health: ${kpis.applicationHealth}%`, '300 applications across 20 domains'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.applicationHealth),
    });
  },

  'application-portfolio.critical-applications': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: APM_APPLICATIONS.filter((a) => a.criticality === 'tier-1').slice(0, 8).map((a) => ({
        id: a.id, title: a.name, meta: a.criticality,
      })),
      supportingEvidence: [`${kpis.criticalApplications} tier-1/tier-2 critical applications`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.criticalApplications),
    });
  },

  'application-portfolio.technical-debt': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    const debt = topTechnicalDebt(8);
    return buildPayload(ctx, {
      sourceRecords: debt.map((d) => ({ id: d.id, title: d.appName, meta: `Score ${d.score}` })),
      supportingEvidence: [`Portfolio debt index: ${kpis.technicalDebt}/100`, '150 debt items tracked'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.technicalDebt),
    });
  },

  'application-portfolio.modernization-readiness': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: rationalizationCandidates().slice(0, 8).map((a) => ({
        id: a.id, title: a.name, meta: `${a.cloudReadinessScore}% cloud`,
      })),
      supportingEvidence: [`Modernization readiness: ${kpis.modernizationReadiness}%`, '100 opportunities identified'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.modernizationReadiness),
    });
  },

  'application-portfolio.cloud-readiness': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: APM_APPLICATIONS.filter((a) => a.cloudReadinessScore > 75).slice(0, 8).map((a) => ({
        id: a.id, title: a.name, meta: `${a.cloudReadinessScore}%`,
      })),
      supportingEvidence: [`Cloud readiness: ${kpis.cloudReadiness}%`, '100 cloud assessments'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.cloudReadiness),
    });
  },

  'application-portfolio.ai-readiness': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: APM_APPLICATIONS.filter((a) => a.aiReadinessScore > 70).slice(0, 8).map((a) => ({
        id: a.id, title: a.name, meta: `${a.aiReadinessScore}%`,
      })),
      supportingEvidence: [`AI readiness: ${kpis.aiReadiness}%`, '100 AI assessments'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.aiReadiness),
    });
  },

  'application-portfolio.risk-exposure': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: APM_APPLICATIONS.filter((a) => a.riskScore > 70).slice(0, 8).map((a) => ({
        id: a.id, title: a.name, meta: `Risk ${a.riskScore}`,
      })),
      supportingEvidence: [`Risk exposure: ${kpis.riskExposure}/100`, '200 technology risks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 3),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.riskExposure),
    });
  },

  'application-portfolio.annual-cost': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: applicationsByDomain().slice(0, 8).map((d) => ({ id: d.name, title: d.name, meta: `${d.value} apps` })),
      supportingEvidence: [`Annual portfolio cost: ₹${(kpis.annualCost / 1_000_000).toFixed(0)}M`],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.annualCost / 1_000_000),
    });
  },

  'application-portfolio.rationalization-savings': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: rationalizationCandidates().slice(0, 8).map((a) => ({
        id: a.id, title: a.name, meta: `₹${(a.annualCost / 1_000_000).toFixed(1)}M`,
      })),
      supportingEvidence: [`Rationalization savings: ₹${(kpis.rationalizationSavings / 1_000_000).toFixed(1)}M`, '12 retirement candidates'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.rationalizationSavings / 1_000_000),
    });
  },

  'application-portfolio.technology-obsolescence': (state, ctx) => {
    const kpis = computeApplicationPortfolioKpis();
    return buildPayload(ctx, {
      sourceRecords: APM_TECH_STACKS.filter((s) => s.obsolescenceRisk === 'high' || s.obsolescenceRisk === 'critical').slice(0, 8).map((s) => ({
        id: s.id, title: s.name, meta: s.obsolescenceRisk,
      })),
      supportingEvidence: [`Technology obsolescence: ${kpis.technologyObsolescence}%`, '50 technology stacks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.technologyObsolescence),
    });
  },

  'architecture-repository.architecture-health': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: ARCH_APPLICATIONS.slice(0, 10).map((a) => ({ id: a.id, title: a.name, meta: `${a.standardsAdherence}%` })),
      supportingEvidence: [`Architecture health: ${kpis.architectureHealth}%`, '300 applications across 10 domains'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.architectureHealth),
    });
  },

  'architecture-repository.standards-compliance': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archOpenFindings(8).map((f) => ({ id: f.id, title: f.appName, meta: f.severity })),
      supportingEvidence: [`Standards compliance: ${kpis.standardsCompliance}%`, '100 standards · 8 principles'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.standardsCompliance),
    });
  },

  'architecture-repository.architecture-debt': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archTopDebt(8).map((d) => ({ id: d.id, title: d.appName, meta: `${d.effortDays}d` })),
      supportingEvidence: [`Architecture debt: ${kpis.architectureDebt} days avg`, '150 debt items tracked'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.architectureDebt),
    });
  },

  'architecture-repository.technology-obsolescence': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archObsoletePlatforms(8).map((p) => ({ id: p.id, title: p.name, meta: p.lifecycle })),
      supportingEvidence: [`Technology obsolescence: ${kpis.technologyObsolescence}%`, '50 technology platforms'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.technologyObsolescence),
    });
  },

  'architecture-repository.cloud-readiness': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: ARCH_APPLICATIONS.filter((a) => a.cloudReadiness > 75).slice(0, 8).map((a) => ({ id: a.id, title: a.name, meta: `${a.cloudReadiness}%` })),
      supportingEvidence: [`Cloud readiness: ${kpis.cloudReadiness}%`, '50 cloud services catalogued'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.cloudReadiness),
    });
  },

  'architecture-repository.ai-readiness': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: ARCH_APPLICATIONS.filter((a) => a.aiReadiness > 70).slice(0, 8).map((a) => ({ id: a.id, title: a.name, meta: `${a.aiReadiness}%` })),
      supportingEvidence: [`AI readiness: ${kpis.aiReadiness}%`, 'Aligned to REF-05 / REF-08 AI references'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.aiReadiness),
    });
  },

  'architecture-repository.architecture-risk': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archIntegrationRisks(8).map((i) => ({ id: i.id, title: i.name, meta: i.riskLevel })),
      supportingEvidence: [`Architecture risk: ${kpis.architectureRisk}/100`, '200 integrations assessed'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.architectureRisk),
    });
  },

  'architecture-repository.architecture-exceptions': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archActiveExceptions(8).map((e) => ({ id: e.id, title: e.appName, meta: e.status })),
      supportingEvidence: [`Active exceptions: ${kpis.architectureExceptions}`, 'Waivers and risk acceptances tracked'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.architectureExceptions),
    });
  },

  'architecture-repository.reference-adoption': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archReferenceAdoption().map((r, i) => ({ id: `REF-${i + 1}`, title: r.name, meta: `${r.value}%` })),
      supportingEvidence: [`Reference architecture adoption: ${kpis.referenceAdoption}%`, '8 reference architectures'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.referenceAdoption),
    });
  },

  'architecture-repository.modernization-progress': (state, ctx) => {
    const kpis = computeArchitectureRepositoryKpis();
    return buildPayload(ctx, {
      sourceRecords: archModernization(8).map((d) => ({ id: d.id, title: d.appName, meta: d.remediationStatus })),
      supportingEvidence: [`Modernization progress: ${kpis.modernizationProgress}%`, '22 platforms in modernization wave'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.modernizationProgress),
    });
  },

  'technology-strategy.technology-health': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: TECHNOLOGIES.filter((t) => t.lifecycle === 'strategic' || t.lifecycle === 'preferred').slice(0, 10).map((t) => ({ id: t.id, title: t.name, meta: t.lifecycle })),
      supportingEvidence: [`Technology health: ${kpis.technologyHealth}%`, '200 technologies across 10 categories'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.technologyHealth),
    });
  },

  'technology-strategy.standards-adoption': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: TECH_STANDARDS.filter((s) => s.mandatory).slice(0, 8).map((s) => ({ id: s.id, title: s.name, meta: `${s.adoptionRate}%` })),
      supportingEvidence: [`Standards adoption: ${kpis.standardsAdoption}%`, '100 technology standards'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.standardsAdoption),
    });
  },

  'technology-strategy.strategic-platform-adoption': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techPlatformAdoption().map((p, i) => ({ id: `SPLT-${i + 1}`, title: p.name, meta: `${p.value}%` })),
      supportingEvidence: [`Strategic platform adoption: ${kpis.strategicPlatformAdoption}%`, '50 strategic platforms'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.strategicPlatformAdoption),
    });
  },

  'technology-strategy.cloud-adoption': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techTopClouds(8).map((c) => ({ id: c.id, title: c.name, meta: `${c.adoptionRate}%` })),
      supportingEvidence: [`Cloud adoption: ${kpis.cloudAdoption}%`, '50 cloud platforms'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.cloudAdoption),
    });
  },

  'technology-strategy.ai-platform-adoption': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techTopAis(8).map((a) => ({ id: a.id, title: a.name, meta: a.category })),
      supportingEvidence: [`AI platform adoption: ${kpis.aiPlatformAdoption}%`, '50 AI platforms'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.aiPlatformAdoption),
    });
  },

  'technology-strategy.technology-risk': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techTopRisks(8).map((r) => ({ id: r.id, title: r.techName, meta: r.severity })),
      supportingEvidence: [`Technology risk: ${kpis.technologyRisk}%`, '150 technology risks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.technologyRisk),
    });
  },

  'technology-strategy.modernization-progress': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techModernization(8).map((m) => ({ id: m.id, title: m.name, meta: `Wave ${m.wave} · ${m.status}` })),
      supportingEvidence: [`Modernization progress: ${kpis.modernizationProgress}%`, '100 initiatives across 3 waves'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.modernizationProgress),
    });
  },

  'technology-strategy.technology-debt': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techRetirementCandidates(8).map((t) => ({ id: t.id, title: t.name, meta: t.lifecycle })),
      supportingEvidence: [`Technology debt: ${kpis.technologyDebt}%`, 'Legacy/deprecated/EOS technologies'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.technologyDebt),
    });
  },

  'technology-strategy.vendor-concentration': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techTopVendorRisks(8).map((v) => ({ id: v.id, title: `${v.vendor} — ${v.product}`, meta: `Lock-in ${v.lockInRisk}%` })),
      supportingEvidence: [`Vendor concentration: ${kpis.vendorConcentration}%`, '100 vendor products'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.vendorConcentration),
    });
  },

  'technology-strategy.investment-efficiency': (state, ctx) => {
    const kpis = computeTechnologyStrategyKpis();
    return buildPayload(ctx, {
      sourceRecords: techTopInvestments(8).map((i) => ({ id: i.id, title: i.name, meta: `₹${Math.round(i.annualSpend / 1_000_000)}M · ${i.stance}` })),
      supportingEvidence: [`Investment efficiency: ${kpis.investmentEfficiency}%`, 'Technology investment portfolio'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.investmentEfficiency),
    });
  },

  'transformation-pmo.transformation-health': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoTopPrograms(10).map((p) => ({ id: p.id, title: p.name, meta: `${p.health}%` })),
      supportingEvidence: [`Transformation health: ${kpis.transformationHealth}%`, '50 programs across 5 business units'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.transformationHealth),
    });
  },

  'transformation-pmo.program-delivery': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoAtRiskPrograms(8).map((p) => ({ id: p.id, title: p.name, meta: p.status })),
      supportingEvidence: [`Program delivery: ${kpis.programDelivery}%`, '50 transformation programs'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.programDelivery),
    });
  },

  'transformation-pmo.objective-achievement': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoObjectives().slice(0, 8).map((o, i) => ({ id: `OBJ-${i + 1}`, title: o.name, meta: `${o.value}%` })),
      supportingEvidence: [`Objective achievement: ${kpis.objectiveAchievement}%`, '20 strategic objectives'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.objectiveAchievement),
    });
  },

  'transformation-pmo.benefits-realization': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoTopBenefits(8).map((b) => ({ id: b.id, title: b.name, meta: `₹${Math.round(b.realizedValue / 1_000_000)}M` })),
      supportingEvidence: [`Benefits realization: ${kpis.benefitsRealization}%`, '100 benefits tracked'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.benefitsRealization),
    });
  },

  'transformation-pmo.milestone-completion': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoCriticalMilestones(8).map((m) => ({ id: m.id, title: m.name, meta: m.status })),
      supportingEvidence: [`Milestone completion: ${kpis.milestoneCompletion}%`, '500 milestones tracked'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.milestoneCompletion),
    });
  },

  'transformation-pmo.executive-commitments': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoCommitmentsAtRisk(8).map((c) => ({ id: c.id, title: c.title, meta: c.status })),
      supportingEvidence: [`Executive commitments met: ${kpis.executiveCommitments}%`, '100 board/exec commitments'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.executiveCommitments),
    });
  },

  'transformation-pmo.dependency-risk': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoRiskyDeps(8).map((d) => ({ id: d.id, title: d.name, meta: `${d.type} · ${d.status}` })),
      supportingEvidence: [`Dependency risk: ${kpis.dependencyRisk}%`, '100 cross-program dependencies'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.dependencyRisk),
    });
  },

  'transformation-pmo.business-unit-performance': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoBuChart().map((b, i) => ({ id: `TBU-${i + 1}`, title: b.name, meta: `${b.value}%` })),
      supportingEvidence: [`Business unit performance: ${kpis.businessUnitPerformance}%`, '5 business units'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.businessUnitPerformance),
    });
  },

  'transformation-pmo.transformation-roi': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoTopInitiatives(8).map((i) => ({ id: i.id, title: i.name, meta: `₹${Math.round(i.expectedBenefit / 1_000_000)}M` })),
      supportingEvidence: [`Transformation ROI: ${kpis.transformationRoi}%`, 'Benefit vs spend across programs'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.transformationRoi),
    });
  },

  'transformation-pmo.board-readiness': (state, ctx) => {
    const kpis = computeTransformationPmoKpis();
    return buildPayload(ctx, {
      sourceRecords: tpmoCommitmentsAtRisk(8).map((c) => ({ id: c.id, title: c.title, meta: `Confidence ${c.confidence}%` })),
      supportingEvidence: [`Board readiness: ${kpis.boardReadiness}%`, 'Health, delivery, milestones, commitments composite'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.boardReadiness),
    });
  },

  'enterprise-risk.enterprise-risk-exposure': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermTopRisks(10).map((r) => ({ id: r.id, title: r.title, meta: `${r.category} · ${r.residualScore}` })),
      supportingEvidence: [`Enterprise risk exposure: ${kpis.enterpriseRiskExposure}/100`, '500 enterprise risks across 8 categories'],
      relatedApplications: appsFromArchitecture(state).slice(0, 3),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.enterpriseRiskExposure),
    });
  },

  'enterprise-risk.residual-risk': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermTopRisks(10).map((r) => ({ id: r.id, title: r.title, meta: `Inherent ${r.inherentScore} → Residual ${r.residualScore}` })),
      supportingEvidence: [`Residual risk: ${kpis.residualRisk}/100`, 'Post-control residual exposure'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.residualRisk),
    });
  },

  'enterprise-risk.control-effectiveness': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermWeakControls(10).map((c) => ({ id: c.id, title: c.name, meta: c.effectiveness })),
      supportingEvidence: [`Control effectiveness: ${kpis.controlEffectiveness}%`, '300 controls assessed'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.controlEffectiveness),
    });
  },

  'enterprise-risk.open-critical-risks': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermCriticalRisks(10).map((r) => ({ id: r.id, title: r.title, meta: `${r.status} · ${r.owner}` })),
      supportingEvidence: [`Open critical risks: ${kpis.openCriticalRisks}`, 'Critical-severity unresolved risks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.openCriticalRisks),
    });
  },

  'enterprise-risk.risk-appetite-breaches': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ERM_RISK_APPETITE.map((a) => ({ id: a.id, title: a.category, meta: `${a.currentExposure}/${a.appetiteThreshold} · ${a.status}` })),
      supportingEvidence: [`Risk appetite breaches: ${kpis.riskAppetiteBreaches} categories`, 'Exposure vs appetite vs tolerance'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.riskAppetiteBreaches),
    });
  },

  'enterprise-risk.regulatory-exposure': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermTopRegulatory(10).map((r) => ({ id: r.id, title: r.title, meta: `${r.regulator} · ₹${Math.round(r.exposureValue / 1_000_000)}M` })),
      supportingEvidence: [`Regulatory exposure: ₹${kpis.regulatoryExposure}M`, '150 regulatory risks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.regulatoryExposure),
    });
  },

  'enterprise-risk.cyber-risk-score': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermTopCyber(10).map((r) => ({ id: r.id, title: r.title, meta: `${r.threatType} · ${r.exposureScore}` })),
      supportingEvidence: [`Cyber risk score: ${kpis.cyberRiskScore}/100`, '150 cyber risks'],
      relatedApplications: appsFromArchitecture(state).slice(0, 2),
      relatedIncidents: incidentsFromState(state).slice(0, 2),
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.cyberRiskScore),
    });
  },

  'enterprise-risk.ai-risk-score': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermTopAi(10).map((r) => ({ id: r.id, title: r.title, meta: `${r.category} · ${r.residualScore}` })),
      supportingEvidence: [`AI risk score: ${kpis.aiRiskScore}/100`, '100 AI risks across models'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.aiRiskScore),
    });
  },

  'enterprise-risk.audit-risk-score': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermOpenFindings(10).map((f) => ({ id: f.id, title: f.title, meta: `${f.source} · ${f.status}` })),
      supportingEvidence: [`Audit risk score: ${kpis.auditRiskScore}%`, '200 audit findings'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.auditRiskScore),
    });
  },

  'enterprise-risk.assurance-coverage': (state, ctx) => {
    const kpis = computeEnterpriseRiskKpis();
    return buildPayload(ctx, {
      sourceRecords: ermAssuranceReviews(10).map((a) => ({ id: a.id, title: a.name, meta: `${a.type} · ${a.coverage}%` })),
      supportingEvidence: [`Assurance coverage: ${kpis.assuranceCoverage}%`, 'Three lines of defense · 100 reviews'],
      relatedApplications: appsFromArchitecture(state).slice(0, 1),
      relatedIncidents: [],
      relatedReleases: releasesFromState(state),
      historicalTrend: sparkline7d(kpis.assuranceCoverage),
    });
  },
};

/**
 * @param {KpiDrilldownContext} ctx
 * @param {SimulationState} state
 * @returns {KpiDrilldownPayload}
 */
function resolveChartDrilldown(ctx, state) {
  const resolver = chartResolvers[ctx.chartId ?? ''];
  if (resolver) return resolver(state, ctx);

  return buildPayload(ctx, {
    sourceRecords: [{ id: ctx.segment ?? '—', title: ctx.label, meta: String(ctx.value) }],
    supportingEvidence: state.dynamicInsights.slice(0, 3),
    relatedApplications: appsFromArchitecture(state),
    relatedIncidents: incidentsFromState(state),
    relatedReleases: releasesFromState(state),
  });
}

/**
 * @param {KpiDrilldownContext} ctx
 * @param {SimulationState} state
 * @returns {KpiDrilldownPayload}
 */
export function resolveKpiDrilldown(ctx, state) {
  if (ctx.chartId) return resolveChartDrilldown(ctx, state);

  const resolver = resolvers[ctx.label];
  if (resolver) return resolver(state, ctx);

  return buildPayload(ctx, {
    sourceRecords: state.requirements.topRiskRequirements.slice(0, 4).map((r) => ({
      id: r.id,
      title: r.title,
      meta: r.domain,
    })),
    supportingEvidence: state.dynamicInsights.slice(0, 3),
    relatedApplications: appsFromArchitecture(state),
    relatedIncidents: incidentsFromState(state),
    relatedReleases: releasesFromState(state),
  });
}
