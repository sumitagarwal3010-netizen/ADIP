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
