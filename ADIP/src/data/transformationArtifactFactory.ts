/**
 * Transformation AI Workspace — artifact + analysis factory.
 *
 * Produces ONLY transformation-domain deliverables (Charter, Business Case,
 * ROI, Benefits, Roadmap, Investment, Dependency, Steering Pack, Risk, KPI
 * Matrix). It deliberately does NOT generate BRD/FRD/User Stories — those
 * belong to the Requirements Engineering Workspace. Reuses the shared
 * {@link createArtifact} builder so the output drops straight into the
 * existing ArtifactRepositoryPanel / Artifact Repository / viewer.
 */

import type { Artifact } from '../types/artifacts';
import { createArtifact, createRunId, buildSections } from './artifactBuilder';

export { createRunId };

export interface TransformationWorkspaceInput {
  initiative: string;
  outcomes: string;
  benefits: string;
  investment: string;
  timeline: string;
  /** Live KPI snapshot from TransformationPmoContext. */
  health: number;
  benefitsRealization: number;
  roi: number;
  dependencyRisk: number;
  milestoneCompletion: number;
  programCount: number;
}

/** Each generated artifact carries a stable suffix used to map it onto a governance stage. */
export const TRANSFORMATION_ARTIFACT_SUFFIXES = [
  'charter',
  'business-case',
  'benefits-plan',
  'roi',
  'roadmap',
  'investment',
  'dependency',
  'steering',
  'risk',
  'kpi-matrix',
] as const;

export type TransformationArtifactSuffix = (typeof TRANSFORMATION_ARTIFACT_SUFFIXES)[number];

function withDefaults(input: Partial<TransformationWorkspaceInput>): TransformationWorkspaceInput {
  return {
    initiative: input.initiative?.trim() || 'Enterprise Transformation Program',
    outcomes: input.outcomes?.trim() || 'Faster delivery, lower run-cost, and measurable customer outcomes',
    benefits: input.benefits?.trim() || '₹40 Cr annual value, NPS +12',
    investment: input.investment?.trim() || '₹35 Cr',
    timeline: input.timeline?.trim() || '24 months, 3 phases',
    health: input.health ?? 70,
    benefitsRealization: input.benefitsRealization ?? 55,
    roi: input.roi ?? 97,
    dependencyRisk: input.dependencyRisk ?? 75,
    milestoneCompletion: input.milestoneCompletion ?? 20,
    programCount: input.programCount ?? 50,
  };
}

/* ----------------------------------------------------------------------- */
/* Ask AI — 5 transformation analyses                                       */
/* ----------------------------------------------------------------------- */

export interface TransformationAnalysisBlock {
  id: string;
  title: string;
  headline: string;
  findings: string[];
  recommendation?: string;
}

export function buildTransformationAnalysis(
  raw: Partial<TransformationWorkspaceInput>,
): TransformationAnalysisBlock[] {
  const i = withDefaults(raw);
  return [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      headline: `"${i.initiative}" — portfolio health ${i.health}% across ${i.programCount} programs`,
      findings: [
        `Initiative targets: ${i.outcomes}.`,
        `Investment of ${i.investment} over ${i.timeline} with expected benefits of ${i.benefits}.`,
        `Headline posture: Health ${i.health}% · Benefits ${i.benefitsRealization}% · ROI ${i.roi}% · Dependency risk ${i.dependencyRisk}%.`,
      ],
      recommendation: 'Approve phased funding with benefit gates; the value case is strong but execution is early-stage.',
    },
    {
      id: 'benefits-analysis',
      title: 'Benefits Analysis',
      headline: `Benefits realization ${i.benefitsRealization}% · target ${i.benefits}`,
      findings: [
        `Expected benefits: ${i.benefits}.`,
        `${i.benefitsRealization}% of planned benefits realized to date; remainder weighted to later phases.`,
        'Revenue, cost-avoidance, risk-reduction and CX benefits modelled separately for defensibility.',
      ],
      recommendation: 'Attach each benefit to an owner and a tracking metric before funding release.',
    },
    {
      id: 'roi-projection',
      title: 'ROI Projection',
      headline: `Projected ROI ${i.roi}% on ${i.investment} investment`,
      findings: [
        `Investment: ${i.investment} over ${i.timeline}.`,
        `ROI computed as (Benefit − Investment) ÷ Investment; current projection ${i.roi}%.`,
        'Payback driven by cost-avoidance in phase 1 and revenue uplift in phase 2.',
      ],
      recommendation: 'Lock the investment tranches to benefit gates so spend tracks realized value.',
    },
    {
      id: 'dependency-analysis',
      title: 'Dependency Analysis',
      headline: `Weighted dependency risk ${i.dependencyRisk}%`,
      findings: [
        'Cross-program dependencies identified across shared platforms and data.',
        'Blocked and delayed dependencies are the largest contributors to schedule risk.',
        'Critical-path dependencies concentrated in the core-modernization stream.',
      ],
      recommendation: 'Establish a dependency war-room and re-sequence the top blocked items first.',
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      headline: 'Delivery, financial, resource & adoption risks profiled',
      findings: [
        'Top risks: dependency blockage, benefit slippage, and change-adoption capacity.',
        `Dependency risk (${i.dependencyRisk}%) is the dominant residual risk driver.`,
        'Adoption risk rises in later phases as scope reaches frontline operations.',
      ],
      recommendation: 'Fund a change-management workstream and add adoption KPIs to the tracking matrix.',
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      headline: 'AI-recommended next actions',
      findings: [
        'Sequence delivery into 3 phases with stage-gated funding to protect health as scope grows.',
        'Tie each investment tranche to a benefit gate and a named owner.',
        'Stand up a dependency war-room; re-sequence the top blocked items first.',
        'Add adoption and change-management KPIs to the tracking matrix.',
        'Take the business case and ROI assessment to the next steering committee for approval.',
      ],
    },
  ];
}

/* ----------------------------------------------------------------------- */
/* Generate Artifact — 10 transformation deliverables                       */
/* ----------------------------------------------------------------------- */

export function buildTransformationArtifacts(
  raw: Partial<TransformationWorkspaceInput>,
  runId: string,
): Artifact[] {
  const i = withDefaults(raw);
  const subject = i.initiative;

  return [
    createArtifact({
      id: `${runId}-charter`,
      name: 'Transformation_Charter.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `TRANSFORMATION CHARTER\n\nInitiative: ${i.initiative}\nSponsor: Chief Transformation Officer\nOutcomes: ${i.outcomes}\nTimeline: ${i.timeline}\n\nMandate, scope, guiding principles and governance authority for the program.`,
      executiveSummary: `Charter establishing mandate, scope and governance for "${i.initiative}".`,
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-business-case`,
      name: 'Business_Case.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `BUSINESS CASE\n\nInitiative: ${i.initiative}\nInvestment: ${i.investment} · Timeline: ${i.timeline}\nExpected benefits: ${i.benefits}\nProjected ROI: ${i.roi}%\n\nProblem statement, options analysis, recommended option and value narrative.`,
      executiveSummary: `Investment-grade business case for "${i.initiative}" with options analysis and value narrative.`,
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-benefits-plan`,
      name: 'Benefits_Realization_Plan.xlsx',
      generatedBy: 'Transformation AI',
      fileType: 'xlsx',
      approvalStatus: 'Draft',
      previewContent: `BENEFITS REALIZATION PLAN\n\nRealization: ${i.benefitsRealization}% · Target: ${i.benefits}\n\n| Benefit | Type | Owner | Baseline | Target | Realized |\n|---------|------|-------|----------|--------|----------|\n| Cost avoidance | Cost | CFO Office | — | 100% | ${i.benefitsRealization}% |\n| Revenue uplift | Revenue | CRO | — | 100% | partial |\n| Risk reduction | Risk | CRO | — | 100% | partial |`,
      executiveSummary: 'Benefit-by-benefit realization plan with owners, baselines, targets and tracking cadence.',
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-roi`,
      name: 'ROI_Assessment_Report.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      previewContent: `ROI ASSESSMENT REPORT\n\nInvestment: ${i.investment}\nProjected ROI: ${i.roi}%\nFormula: (Benefit − Investment) ÷ Investment × 100\n\nNPV, IRR, payback period and sensitivity analysis across scenarios.`,
      executiveSummary: `ROI assessment for "${i.initiative}" — ${i.roi}% projected return with sensitivity analysis.`,
      riskRating: 'Low',
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-roadmap`,
      name: 'Transformation_Roadmap.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `TRANSFORMATION ROADMAP\n\nTimeline: ${i.timeline}\n\nPhase 1 — Foundation & quick wins\nPhase 2 — Scale & integrate\nPhase 3 — Optimize & realize benefits\n\nMilestones, dependencies and benefit gates mapped per phase.`,
      executiveSummary: 'Phased delivery roadmap with milestones, dependencies and benefit gates.',
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-investment`,
      name: 'Investment_Proposal.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Draft',
      previewContent: `INVESTMENT PROPOSAL\n\nAsk: ${i.investment} over ${i.timeline}\nExpected ROI: ${i.roi}%\n\nFunding tranches tied to benefit gates, capital vs operating split, and approval routing to the Investment Committee.`,
      executiveSummary: `Funding proposal of ${i.investment} with gate-tied tranches for "${i.initiative}".`,
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-dependency`,
      name: 'Dependency_Analysis_Report.xlsx',
      generatedBy: 'Transformation AI',
      fileType: 'xlsx',
      approvalStatus: 'Approved',
      previewContent: `DEPENDENCY ANALYSIS REPORT\n\nWeighted dependency risk: ${i.dependencyRisk}%\n\n| Source | Target | Dependency | Severity | Status |\n|--------|--------|------------|----------|--------|\n| Core Modernization | Payments | Shared ledger | Critical | Blocked |\n| Data Platform | Analytics | Event stream | High | Delayed |\n| Identity | Channels | SSO rollout | Medium | On track |`,
      executiveSummary: 'Cross-program dependency register with severity, status and critical-path impact.',
      riskRating: 'High',
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-steering`,
      name: 'Executive_Steering_Committee_Pack.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      previewContent: `EXECUTIVE STEERING COMMITTEE PACK\n\nProgram: ${i.initiative}\nHealth ${i.health}% · Benefits ${i.benefitsRealization}% · ROI ${i.roi}% · Dependency risk ${i.dependencyRisk}%\n\nDecisions required, escalations, RAG status and steering recommendations.`,
      executiveSummary: 'Steering committee pack with RAG status, decisions required and escalations.',
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-risk`,
      name: 'Transformation_Risk_Assessment.docx',
      generatedBy: 'Transformation AI',
      fileType: 'docx',
      approvalStatus: 'Draft',
      previewContent: `TRANSFORMATION RISK ASSESSMENT\n\nDependency risk: ${i.dependencyRisk}%\n\nDelivery, financial, resource and adoption risks with likelihood, impact, mitigation owners and residual ratings.`,
      executiveSummary: 'Risk assessment across delivery, financial, resource and adoption dimensions.',
      riskRating: 'High',
      context: { subject },
    }),
    createArtifact({
      id: `${runId}-kpi-matrix`,
      name: 'KPI_Benefits_Tracking_Matrix.xlsx',
      generatedBy: 'Transformation AI',
      fileType: 'xlsx',
      approvalStatus: 'Approved',
      previewContent: `KPI & BENEFITS TRACKING MATRIX\n\n| KPI | Current | Target | Trend |\n|-----|---------|--------|-------|\n| Transformation Health | ${i.health}% | 85% | up |\n| Benefits Realization | ${i.benefitsRealization}% | 100% | up |\n| Milestone Completion | ${i.milestoneCompletion}% | 100% | up |\n| Dependency Risk | ${i.dependencyRisk}% | <40% | down |\n| Transformation ROI | ${i.roi}% | 120% | up |`,
      executiveSummary: 'Live KPI and benefits tracking matrix linking each metric to its target and trend.',
      sections: buildSections(
        'Single tracking surface linking every transformation KPI to its target, owner and trend.',
        [
          `Transformation Health ${i.health}% vs 85% target.`,
          `Benefits Realization ${i.benefitsRealization}% vs 100% target.`,
          `Transformation ROI ${i.roi}% vs 120% target.`,
        ],
        [
          'Review red metrics at each steering committee.',
          'Re-baseline targets at the end of each phase gate.',
        ],
      ),
      context: { subject },
    }),
  ];
}
