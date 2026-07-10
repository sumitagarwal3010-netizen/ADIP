import { useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, TextField, Typography, Alert } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { ArtifactRepositoryPanel } from './ArtifactRepositoryPanel';
import { useGenerationSimulation } from '../../hooks/useGenerationSimulation';
import { GenerationSimulationPanel } from './GenerationSimulationPanel';
import { colors } from '../../theme/colors';
import {
  PHASE_CONFIG,
  generateAnalysisResult,
  type AnalysisResult,
} from '../../data/aiAnalysisMockData';
import { buildHubArtifacts } from '../../data/hubArtifactDefinitions';
import { createRunId } from '../../data/requirementArtifactFactory';
import type { Artifact } from '../../types/artifacts';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';
import { createArtifact } from '../../data/artifactBuilder';
import { orchestrateFromPrompt } from '../../data/copilotOrchestrationEngine';
import {
  AI_WORKSPACE_CONFIGS,
  type AIWorkspaceModule,
} from '../../config/aiWorkspaceConfig';
import {
  type AISession,
  createSessionId,
  loadSessions,
  nowDisplay,
  normalizeRequirement,
  loadRequirementPackage,
  saveRequirementPackage,
  saveSession,
} from '../../data/aiSessionStore';
import { WorkspaceGovernancePanel } from './WorkspaceGovernancePanel';
import { useCopilot } from '../../context/CopilotContext';
import { analyzePromptWithBackend } from '../../services/aiWorkspaceBackend';
import { isBackendMode } from '../../services/backend/apiConfig';
import type { RequirementArtifactPackage } from '../../types/copilot';
import { getDeterministicRequirementPackage } from '../../data/deterministicRequirementCatalog';

interface AIWorkspacePanelProps {
  module: AIWorkspaceModule;
  /** Header number (optional) to slot into a numbered hub layout. */
  number?: number;
}

const FLOW_STEPS = ['User Prompt', 'AI Analysis', 'Recommendations', 'Generated Artifacts', 'Governance Workflow'];

function FlowGuide({ stage }: { stage: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
      {FLOW_STEPS.map((step, i) => {
        const active = i <= stage;
        return (
          <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: 1,
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: active ? colors.text.primary : colors.text.muted,
                bgcolor: active ? `${colors.secondary}22` : colors.bg.glass,
                border: `1px solid ${active ? colors.secondary : colors.border.subtle}`,
              }}
            >
              {step}
            </Box>
            {i < FLOW_STEPS.length - 1 && (
              <ArrowForwardIcon sx={{ fontSize: 13, mx: 0.25, color: active ? colors.secondary : colors.border.glow }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function findingValue(value: string | number | string[]): string {
  return Array.isArray(value) ? value.join(' · ') : String(value);
}

function fileTypeFromName(name: string): 'docx' | 'xlsx' {
  return name.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'docx';
}

export function AIWorkspacePanel({ module, number }: AIWorkspacePanelProps) {
  const config = AI_WORKSPACE_CONFIGS[module];
  const phaseConfig = PHASE_CONFIG[config.analysisPhase];
  const { recordArtifacts } = useArtifactsRegistry();
  const { runOrchestration, setRequirementArtifactPackage } = useCopilot();

  // The AI SDLC Copilot studio is the single prompt that drives every copilot.
  const isOrchestrator = module === 'ai-copilot';

  const [prompt, setPrompt] = useState('');
  const [intake, setIntake] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [sessions, setSessions] = useState<AISession[]>(() => loadSessions(module));
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [stage, setStage] = useState(0); // 0=input .. 4=governance
  const [showSim, setShowSim] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const pendingArtifactRef = useRef(false);

  const sim = useGenerationSimulation({
    initialStatus: `${config.agentLabel} analyzing your request...`,
    steps: phaseConfig.agents.map((agent, i) => ({
      progress: Math.round(((i + 1) / phaseConfig.agents.length) * 100),
      activity: agent,
      delayMs: 600,
    })),
  });

  // Compose the effective prompt from free text + structured intake fields.
  const effectivePrompt = useMemo(() => {
    const parts: string[] = [];
    if (prompt.trim()) parts.push(prompt.trim());
    for (const f of config.intakeFields ?? []) {
      if (intake[f.key]?.trim()) parts.push(`${f.label}: ${intake[f.key].trim()}`);
    }
    return parts.join(' · ');
  }, [prompt, intake, config.intakeFields]);

  const hasInput = effectivePrompt.length > 0;

  const recordSession = (generated: boolean, count: number) => {
    const session: AISession = {
      id: createSessionId(),
      module,
      prompt: effectivePrompt.slice(0, 120),
      createdAt: new Date().toISOString(),
      displayTime: nowDisplay(),
      generatedArtifacts: generated,
      artifactCount: count,
    };
    setSessions(saveSession(module, session));
    setHistory((prev) => [effectivePrompt, ...prev.filter((p) => p !== effectivePrompt)].slice(0, 8));
  };

  /**
   * Build the generated artifacts for a run. For the AI SDLC Copilot studio we
   * reuse the shared orchestration engine so artifact names/descriptions stay
   * prompt-specific (e.g. "UPI Auto-Reversal BRD"); every other hub keeps its
   * existing `buildHubArtifacts` pipeline. No artifact logic is duplicated.
   */
  const buildGeneratedArtifacts = (captured: string, runId: string): Artifact[] => {
    if (module === 'requirements') {
      const normalized = normalizeRequirement(captured);
      const exact: Record<string, string[]> = {
        [normalizeRequirement('Create BRD for UPI limit enhancement')]: [
          'UPI_Limit_Enhancement_BRD.docx',
          'UPI_Limit_Acceptance_Criteria.docx',
          'UPI_Limit_Traceability_Matrix.xlsx',
        ],
        [normalizeRequirement('Generate FRD for recurring mandate upgrade')]: [
          'Recurring_Mandate_Upgrade_FRD.docx',
          'Recurring_Mandate_User_Stories.xlsx',
          'Recurring_Mandate_Acceptance_Criteria.docx',
        ],
        [normalizeRequirement('Draft user stories for merchant settlement portal')]: [
          'Merchant_Settlement_User_Stories.xlsx',
          'Merchant_Settlement_Acceptance_Criteria.docx',
          'Merchant_Settlement_Requirements_Summary.docx',
        ],
        [normalizeRequirement('Identify compliance gaps for cross-border payments')]: [
          'Cross_Border_Compliance_Gap_Assessment.docx',
          'Cross_Border_Regulatory_Checklist.xlsx',
          'Cross_Border_Remediation_Plan.docx',
        ],
      };
      const names = exact[normalized] ?? ['Generated_Requirements_Assessment.docx'];
      const detailsByPrompt: Record<string, Record<string, {
        summary: string;
        findings: string;
        recommendations: string;
        risk: string;
        compliance: string;
        owner: string;
        approval: string;
      }>> = {
        [normalizeRequirement('Create BRD for UPI limit enhancement')]: {
          "UPI_Limit_Enhancement_BRD.docx": {
            summary: 'Define UPI limit enhancement scope aligned with NPCI policy, customer experience, and fraud-control requirements.',
            findings: '- Existing limit tiers do not fully differentiate by risk segment.\n- Customer notifications for near-limit and breached-limit events are inconsistent.\n- Transaction velocity controls require explicit governance thresholds.',
            recommendations: '- Configure NPCI-aligned tiered limits by customer segment.\n- Add real-time customer notifications for threshold events.\n- Enforce transaction velocity guardrails with risk-based overrides.',
            risk: 'Medium',
            compliance: 'NPCI transaction limit policy, RBI digital payments supervision controls.',
            owner: 'Payments Product Owner',
            approval: 'Pending Product + Risk approval',
          },
          "UPI_Limit_Acceptance_Criteria.docx": {
            summary: 'Acceptance criteria pack for UPI limit enhancement rollout and operational readiness.',
            findings: '- Criteria for tier-based approval boundaries are partially defined.\n- Alert behavior for velocity breaches needs deterministic reason codes.\n- Fraud-control exception handling is not fully documented.',
            recommendations: '- Finalize scenario-based acceptance criteria for each customer tier.\n- Add explicit expected outcomes for velocity and fraud-rule triggers.\n- Validate customer communication templates for all rejection paths.',
            risk: 'Medium',
            compliance: 'NPCI operating guidelines, internal fraud-risk standards.',
            owner: 'Requirements Lead',
            approval: 'Pending QA + Compliance sign-off',
          },
          "UPI_Limit_Traceability_Matrix.xlsx": {
            summary: 'Traceability matrix mapping UPI limit requirements to controls, tests, and approvals.',
            findings: '- Two requirement-to-test mappings are incomplete.\n- Fraud-rule coverage is mapped but not yet execution-verified.\n- Notification controls are missing one negative-path mapping.',
            recommendations: '- Complete missing mapping rows before sprint closure.\n- Add fraud-control validation evidence references.\n- Attach customer notification test IDs to final matrix.',
            risk: 'Medium',
            compliance: 'RBI auditability expectations for digital payment controls.',
            owner: 'Delivery Governance Analyst',
            approval: 'Pending Governance Board review',
          },
        },
        [normalizeRequirement('Generate FRD for recurring mandate upgrade')]: {
          "Recurring_Mandate_Upgrade_FRD.docx": {
            summary: 'Functional design for recurring mandate upgrade covering eNACH/UPI consent, debit retries, and lifecycle states.',
            findings: '- Consent capture is available but versioning by mandate revision is incomplete.\n- Debit retry logic exists without uniform retry-window policy.\n- Mandate suspension and reactivation transitions need explicit state controls.',
            recommendations: '- Add consent version and timestamp persistence for each mandate revision.\n- Standardize retry windows and retry reason handling across rails.\n- Define full lifecycle transitions: created, active, suspended, revoked, expired.',
            risk: 'Medium',
            compliance: 'RBI e-mandate framework, UPI autopay operating rules.',
            owner: 'Payments Functional Architect',
            approval: 'Pending Architecture + Compliance approval',
          },
          "Recurring_Mandate_User_Stories.xlsx": {
            summary: 'User stories for recurring mandate creation, consent, retry outcomes, and customer alerts.',
            findings: '- Customer alert stories are present for success/failure but missing partial debit cases.\n- Merchant lifecycle stories need explicit revoke/reactivate acceptance.\n- Ops stories for retry monitoring are under-specified.',
            recommendations: '- Add user stories for partial debit and retry exhaustion outcomes.\n- Expand lifecycle stories for revoke/reactivate workflows.\n- Include operations dashboards and alert ownership stories.',
            risk: 'Medium',
            compliance: 'RBI customer-consent and notification obligations for recurring debits.',
            owner: 'Business Analyst Lead',
            approval: 'Pending Product Owner confirmation',
          },
          "Recurring_Mandate_Acceptance_Criteria.docx": {
            summary: 'Acceptance criteria validating mandate consent integrity, retry behavior, lifecycle management, and customer notifications.',
            findings: '- Criteria for retry exhaustion behavior are incomplete.\n- Notification timing thresholds are inconsistent by channel.\n- Mandate lifecycle audit events are not fully enumerated.',
            recommendations: '- Define deterministic outcomes for each retry stage.\n- Align alert timing thresholds across app/SMS/email channels.\n- Add mandatory audit-event checks for each lifecycle transition.',
            risk: 'Medium',
            compliance: 'RBI eNACH/UPI mandate controls, customer notification policy.',
            owner: 'QA Requirements Owner',
            approval: 'Pending QA Manager approval',
          },
        },
        [normalizeRequirement('Draft user stories for merchant settlement portal')]: {
          "Merchant_Settlement_User_Stories.xlsx": {
            summary: 'User stories for merchant settlement onboarding, reconciliation, dispute management, and payout visibility.',
            findings: '- Reconciliation stories need clearer variance thresholds.\n- Merchant onboarding flow misses settlement-profile validation edge cases.\n- Payout status notifications are not fully sequenced for dispute states.',
            recommendations: '- Add user stories for variance threshold handling in reconciliation.\n- Extend onboarding stories with settlement-profile validation failures.\n- Define payout status progression stories including dispute holds.',
            risk: 'Medium',
            compliance: 'Merchant settlement governance and financial control policy.',
            owner: 'Merchant Platform Product Owner',
            approval: 'Pending Product + Operations sign-off',
          },
          "Merchant_Settlement_Acceptance_Criteria.docx": {
            summary: 'Acceptance criteria for merchant settlement reconciliation, dispute workflow, and payout status transparency.',
            findings: '- Dispute workflow criteria do not include timeout/escalation behavior.\n- Reconciliation acceptance is missing negative variance scenarios.\n- Payout status criteria need explicit event sequencing.',
            recommendations: '- Add escalation and timeout acceptance for dispute resolution.\n- Include negative and borderline variance scenarios.\n- Define canonical payout status sequence and validation checks.',
            risk: 'Medium',
            compliance: 'Internal settlement control standards and audit evidence requirements.',
            owner: 'Settlement Operations Lead',
            approval: 'Pending Operations Governance approval',
          },
          "Merchant_Settlement_Requirements_Summary.docx": {
            summary: 'Requirements summary consolidating onboarding, reconciliation, dispute, and payout tracking for the merchant settlement portal.',
            findings: '- Onboarding and settlement profile dependencies are captured.\n- Reconciliation logic requires one additional exception category.\n- Dispute-to-payout linkage is documented but needs closure evidence mapping.',
            recommendations: '- Add exception category for delayed settlement posting.\n- Map dispute closure evidence to payout release decision points.\n- Finalize owner accountability matrix for settlement SLAs.',
            risk: 'Medium',
            compliance: 'Finance operations policy, settlement audit traceability standards.',
            owner: 'Delivery Manager - Merchant Settlement',
            approval: 'Pending Program Steering approval',
          },
        },
        [normalizeRequirement('Identify compliance gaps for cross-border payments')]: {
          "Cross_Border_Compliance_Gap_Assessment.docx": {
            summary: 'Assess regulatory gaps before enabling cross-border payment flows.',
            findings: '- Missing country-by-country sanctions and PEP screening evidence.\n- FX disclosure, fee transparency, and customer consent controls are incomplete.\n- Data residency and cross-border personal-data transfer controls need approval.',
            recommendations: '- Add sanctions/AML screening before payment authorization.\n- Publish FX rate, fees, and settlement-time disclosures.\n- Complete data-transfer impact assessment and compliance sign-off.',
            risk: 'High',
            compliance: 'RBI cross-border payment, FEMA, AML/KYC, data privacy.',
            owner: 'Compliance Lead',
            approval: 'Pending Compliance Committee approval',
          },
          "Cross_Border_Regulatory_Checklist.xlsx": {
            summary: 'Pre-launch regulatory checklist for cross-border payments.',
            findings: '- RBI/FEMA applicability confirmed.\n- AML/KYC and sanctions screening tested.\n- Beneficiary and sender data validation completed.\n- FX rate and fee disclosure approved.\n- Data residency and retention approved.\n- Audit trail and suspicious-transaction reporting enabled.\n- Status: 2 open controls: data-transfer approval, sanctions-test evidence.',
            recommendations: '- Close data-transfer approval with legal and privacy offices.\n- Attach final sanctions-test evidence to launch checklist.\n- Re-run checklist validation after control closure.',
            risk: 'High',
            compliance: 'RBI cross-border payment, FEMA, AML/KYC, data privacy.',
            owner: 'Regulatory Controls Manager',
            approval: 'Pending Regulatory Gate closure',
          },
          "Cross_Border_Remediation_Plan.docx": {
            summary: 'Remediation plan to close compliance gaps before production release.',
            findings: '- Week 1: complete sanctions/PEP screening integration and test evidence.\n- Week 2: obtain Legal/Compliance approval for FX disclosures and data transfer.\n- Week 3: run end-to-end audit, exception handling, and suspicious-transaction reporting test.\n- Exit criteria: all controls approved, evidence attached, no critical findings.',
            recommendations: '- Track weekly remediation milestones with named owners.\n- Block production release until exit criteria are met.\n- Submit closure evidence bundle to compliance board.',
            risk: 'High',
            compliance: 'RBI cross-border payment, FEMA, AML/KYC, data privacy.',
            owner: 'Compliance Lead',
            approval: 'Target: Before production release',
          },
        },
      };
      const defaultDetails = (name: string) => ({
        summary: `Requirement deliverable for query: ${captured}`,
        findings:
          '- Requirement-specific scope and control expectations documented.\n- Functional and risk constraints aligned to entered query context.\n- Approval dependencies identified for delivery readiness.',
        recommendations:
          '- Confirm scope with product and compliance stakeholders.\n- Attach validation evidence before final approval.\n- Proceed to governance review after action closure.',
        risk: normalized.includes('compliance') ? 'High' : 'Medium',
        compliance: 'Requirement-specific standards and regulatory checks.',
        owner: 'Requirement AI',
        approval: 'Pending Review',
      });
      return names.map((name, i) =>
        createArtifact({
          id: `req-${runId}-${i}`,
          name,
          generatedBy: 'Requirement AI',
          modelUsed: 'deterministic-requirements',
          fileType: fileTypeFromName(name),
          approvalStatus: 'Pending Review',
          riskRating: (detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).risk as 'Low' | 'Medium' | 'High' | 'Critical',
          previewContent: `${name}\n\nQuery: ${captured}\n\nSummary:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).summary}\n\nFindings:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).findings}\n\nRecommendations / Actions:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).recommendations}\n\nRisk:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).risk}\n\nCompliance:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).compliance}\n\nOwner:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).owner}\n\nApproval Status:\n${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).approval}`,
          executiveSummary: (detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).summary,
          context: { subject: `Requirements delivery for ${captured}`, feature: captured, domain: 'Requirements' },
          sections: [
            { title: 'Requirement Query Context', content: captured },
            { title: 'Findings', content: (detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).findings },
            { title: 'Recommendations / Actions', content: (detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).recommendations },
            { title: 'Risk and Compliance', content: `Risk: ${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).risk}\nCompliance: ${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).compliance}` },
            { title: 'Owner and Approval Status', content: `Owner: ${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).owner}\nApproval Status: ${(detailsByPrompt[normalized]?.[name] ?? defaultDetails(name)).approval}` },
          ],
        }),
      ).map((a) => ({ ...a, sourceHub: config.artifactHub, sourceLabel: config.title }));
    }

    if (isOrchestrator) {
      const orch = orchestrateFromPrompt(captured);
      return orch.artifacts.map((a, i) =>
        createArtifact({
          id: `sdlc-${runId}-${i}`,
          name: a.name,
          generatedBy: a.generatedBy,
          fileType: a.name.toLowerCase().includes('matrix') || a.name.toLowerCase().includes('data model') ? 'xlsx' : 'docx',
          approvalStatus: 'Pending Review',
          riskRating: 'Medium',
          previewContent: `${a.name}\n\n${a.description}\n\nScenario: ${orch.scenario.label}\nPrompt-driven AI SDLC run ${runId}.`,
          executiveSummary: a.description,
          context: { subject: 'AI SDLC Copilot · ' + orch.scenario.label },
        }),
      ).map((a) => ({ ...a, sourceHub: config.artifactHub, sourceLabel: config.title }));
    }
    return buildHubArtifacts(config.artifactHub, runId).map((a) => ({
      ...a,
      sourceHub: config.artifactHub,
      sourceLabel: config.title,
    }));
  };

  const buildArtifactsFromRequirementPackage = (
    pkg: RequirementArtifactPackage,
  ): Artifact[] => {
    const mapping = [
      ['brd', 'BRD'],
      ['frd', 'FRD'],
      ['user_stories', 'User Stories'],
      ['acceptance_criteria', 'Acceptance Criteria'],
      ['test_scenarios', 'Test Scenarios'],
      ['traceability_matrix', 'Traceability Matrix'],
      ['requirement_review', 'Requirement Review'],
    ] as const;
    return mapping
      .map(([key, label], idx) => {
        const item = pkg.artifacts[key];
        if (!item) return null;
        const generatedBy = item.metadata?.generated_by ?? 'Requirements Copilot (Deterministic Demo)';
        const modelUsed = item.metadata?.model ?? 'Not applicable';
        return createArtifact({
          id: `${pkg.session_key}-${key}-${idx}`,
          name: item.name,
          generatedBy,
          modelUsed,
          fileType: item.file_type,
          approvalStatus: pkg.source === 'failed' ? 'Rejected' : 'Pending Review',
          riskRating: pkg.source === 'failed' ? 'High' : 'Medium',
          previewContent: item.content,
          executiveSummary: undefined,
          context: {
            subject: 'AI SDLC Copilot Requirement Artifacts',
            sessionKey: pkg.session_key,
            normalizedRequirement: pkg.normalized_requirement,
            source: pkg.source,
          },
          sections: [
            { title: 'Requirement', content: pkg.normalized_requirement },
            { title: label, content: item.content },
          ],
        });
      })
      .filter((a): a is Artifact => a !== null)
      .map((a) => ({ ...a, sourceHub: config.artifactHub, sourceLabel: config.title }));
  };

  const runAnalysis = (thenGenerate: boolean) => {
    if (!hasInput) return;
    pendingArtifactRef.current = thenGenerate;
    setShowSim(true);
    setStage(1);
    setAnalysis(null);
    setBackendError(null);
    if (!thenGenerate) setArtifacts([]);
    const captured = effectivePrompt;
    if (isOrchestrator) runOrchestration(captured);

    const finishAnalysis = (result: AnalysisResult) => {
      setAnalysis(result);
      setAnalysisPrompt(captured);
      setStage(2);
      if (pendingArtifactRef.current) {
        const runId = createRunId(module.toUpperCase().slice(0, 4));
        const generated = buildGeneratedArtifacts(captured, runId);
        setArtifacts(generated);
        recordArtifacts(generated);
        setStage(4);
        recordSession(true, generated.length);
      } else {
        recordSession(false, 0);
      }
    };

    const runMockPath = () => {
      sim.run(() => {
        finishAnalysis(generateAnalysisResult(config.analysisPhase, captured));
      });
    };

    if (isOrchestrator) {
      sim.run(async () => {
        try {
          const normalized = normalizeRequirement(captured);
          if (!normalized) {
            setBackendError('Requirement is empty.');
            setShowSim(false);
            return;
          }
          const cached = loadRequirementPackage(normalized);
          let pkg = cached ?? getDeterministicRequirementPackage(captured);
          if (pkg && !cached) {
            saveRequirementPackage(normalized, pkg);
          }
          if (!pkg) {
            const msg = 'No approved deterministic template exists for this request.';
            setRequirementArtifactPackage(null);
            setBackendError(msg);
            setAnalysis({
              Summary: msg,
              'Confidence Score': 0,
              Recommendations: [],
              'Risk Flags': [msg],
            });
            setAnalysisPrompt(captured);
            setStage(2);
            recordSession(false, 0);
            return;
          }
          setRequirementArtifactPackage(pkg);
          if (pkg.source === 'failed') {
            setBackendError(pkg.failure_reason ?? 'Generation Failed');
            setAnalysis({
              Summary: pkg.failure_reason ?? 'Generation Failed',
              'Confidence Score': 0,
              Recommendations: [],
              'Risk Flags': ['Generation Failed'],
            });
            setAnalysisPrompt(captured);
            setStage(2);
            recordSession(false, 0);
            return;
          }
          const analysisFromPackage: AnalysisResult = {
            Domain: pkg.requirement_profile.business_context ?? 'Requirement',
            'Confidence Score': 100,
            Summary: `Requirement profile generated for "${pkg.normalized_requirement}"`,
            Recommendations: Object.values(pkg.artifacts).map((a) => `Generated ${a.name}`),
            'Risk Flags': [],
          };
          setAnalysis(analysisFromPackage);
          setAnalysisPrompt(captured);
          setStage(2);
          if (pendingArtifactRef.current) {
            const generated = buildArtifactsFromRequirementPackage(pkg);
            setArtifacts(generated);
            recordArtifacts(generated);
            setStage(4);
            recordSession(true, generated.length);
          } else {
            recordSession(false, 0);
          }
        } catch (error) {
          setBackendError((error as Error).message || 'Generation Failed');
          setAnalysis({
            Summary: 'Generation Failed',
            'Confidence Score': 0,
            Recommendations: [],
            'Risk Flags': ['Generation Failed'],
          });
          setAnalysisPrompt(captured);
          setStage(2);
          recordSession(false, 0);
        }
      });
      return;
    }

    if (isBackendMode()) {
      sim.run(async () => {
        const backendResult = await analyzePromptWithBackend(config.analysisPhase, captured);
        if (backendResult) {
          finishAnalysis(backendResult);
        } else {
          setBackendError('Backend analysis unavailable — using mock analysis.');
          finishAnalysis(generateAnalysisResult(config.analysisPhase, captured));
        }
      });
      return;
    }

    runMockPath();
  };

  const applySuggested = (text: string) => {
    setPrompt(text);
  };

  const isAsk = config.mode === 'ask';

  // Split analysis into summary findings vs. list-style recommendations/gaps.
  const summaryEntries = analysis ? Object.entries(analysis).filter(([, v]) => !Array.isArray(v)) : [];
  const listEntries = analysis ? Object.entries(analysis).filter(([, v]) => Array.isArray(v)) : [];

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }} glow={config.glow} hover={false}>
        <ModuleHeader number={number} title={config.title} subtitle={config.subtitle} />
        <FlowGuide stage={stage} />
        {backendError && (
          <Alert severity="info" sx={{ mb: 1, py: 0.25 }}>
            {backendError}
          </Alert>
        )}

        {/* Structured intake (Transformation / Technology / EA / Portfolio) */}
        {config.intakeFields && config.intakeFields.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1 }}>
            {config.intakeFields.map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                placeholder={f.placeholder}
                size="small"
                multiline={!!f.rows}
                rows={f.rows}
                value={intake[f.key] ?? ''}
                onChange={(e) => setIntake((prev) => ({ ...prev, [f.key]: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.bg.glass, fontSize: '0.8rem' } }}
              />
            ))}
          </Box>
        )}

        {/* Primary prompt */}
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem', color: colors.text.secondary, display: 'block', mb: 0.5 }}>
          {config.promptLabel}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={config.placeholder}
            size="small"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { bgcolor: colors.bg.glass, fontSize: '0.8125rem' } }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 170 }}>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
              disabled={!hasInput || sim.isRunning}
              onClick={() => runAnalysis(false)}
              sx={{ bgcolor: colors.secondary, fontSize: '0.75rem' }}
            >
              {isAsk ? 'Ask AI' : 'Analyze'}
            </Button>
            {!isAsk && (
              <Button
                variant="outlined"
                startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                disabled={!hasInput || sim.isRunning}
                onClick={() => runAnalysis(true)}
                sx={{ fontSize: '0.75rem' }}
              >
                Generate Artifact
              </Button>
            )}
          </Box>
        </Box>

        {/* Suggested prompts */}
        <Box sx={{ mt: 1.25 }}>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suggested prompts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {config.suggestedPrompts.map((sp) => (
              <Chip
                key={sp}
                label={sp}
                size="small"
                onClick={() => applySuggested(sp)}
                sx={{
                  fontSize: '0.65rem',
                  bgcolor: colors.bg.glass,
                  border: `1px solid ${colors.border.subtle}`,
                  cursor: 'pointer',
                  '&:hover': { borderColor: colors.secondary, color: colors.secondary },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Prompt history + recent sessions */}
        {(history.length > 0 || sessions.length > 0) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.25 }}>
            {history.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 13 }} /> Prompt history
                </Typography>
                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {history.map((h, i) => (
                    <Typography
                      key={`${h}-${i}`}
                      variant="caption"
                      onClick={() => applySuggested(h)}
                      sx={{ fontSize: '0.7rem', color: colors.text.secondary, cursor: 'pointer', '&:hover': { color: colors.primary } }}
                    >
                      • {h}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            {sessions.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent sessions
                </Typography>
                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {sessions.slice(0, 5).map((s) => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.68rem', color: colors.text.secondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.prompt}
                      </Typography>
                      {s.generatedArtifacts && (
                        <Chip label={`${s.artifactCount} artifacts`} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${colors.success}22`, color: colors.success }} />
                      )}
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>{s.displayTime}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </GlassCard>

      {/* Analysis progress */}
      <GenerationSimulationPanel
        visible={showSim}
        statusMessage={sim.statusMessage}
        progress={sim.progress}
        activityLog={sim.activityLog}
        agentLabel={config.agentLabel}
      />

      {/* AI analysis results: Requirements / Gap / Recommendations */}
      {analysis && (
        <GlassCard sx={{ p: 2, mt: 1.5 }} glow={config.glow}>
          <ModuleHeader
            title={isAsk ? 'AI Answer' : `${phaseConfig.completeTitle}`}
            subtitle={`For: "${analysisPrompt}"`}
          />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, background: `linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)`, border: `1px solid ${colors.border.purple}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                AI Findings
              </Typography>
              {summaryEntries.map(([k, v]) => (
                <Box key={k} sx={{ mb: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', display: 'block' }}>{k}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{findingValue(v)}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ flex: 1, p: 1.5, borderRadius: 1.5, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                Recommendations &amp; Gaps
              </Typography>
              {listEntries.map(([k, items]) => (
                <Box key={k} sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', display: 'block', mb: 0.25 }}>{k}</Typography>
                  {(items as string[]).map((it) => (
                    <Typography key={it} variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', pl: 1 }}>• {it}</Typography>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Generate-from-analysis affordance (so Analyze → Artifacts is one click) */}
          {!isAsk && artifacts.length === 0 && !sim.isRunning && (
            <Button
              variant="contained"
              startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                pendingArtifactRef.current = true;
                const normalized = normalizeRequirement(analysisPrompt || effectivePrompt);
                const cachedPackage = isOrchestrator ? loadRequirementPackage(normalized) : null;
                if (isOrchestrator && !cachedPackage) {
                  const msg = 'No approved deterministic template exists for this request.';
                  setBackendError(msg);
                  return;
                }
                const runId = createRunId(module.toUpperCase().slice(0, 4));
                const generated = isOrchestrator && cachedPackage
                  ? buildArtifactsFromRequirementPackage(cachedPackage)
                  : buildGeneratedArtifacts(analysisPrompt || effectivePrompt, runId);
                setArtifacts(generated);
                recordArtifacts(generated);
                setStage(4);
                recordSession(true, generated.length);
              }}
              sx={{ mt: 1.5, bgcolor: colors.primary, fontSize: '0.75rem' }}
            >
              Generate Artifacts from this analysis
            </Button>
          )}

          {isAsk && !sim.isRunning && (
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                const runId = createRunId(module.toUpperCase().slice(0, 4));
                const generated = buildGeneratedArtifacts(analysisPrompt || effectivePrompt, runId);
                setArtifacts(generated);
                recordArtifacts(generated);
                setStage(4);
                recordSession(true, generated.length);
              }}
              sx={{ mt: 1.5, fontSize: '0.75rem' }}
            >
              Generate Executive Brief from this answer
            </Button>
          )}
        </GlassCard>
      )}

      {/* Generated artifacts */}
      {artifacts.length > 0 && (
        <ArtifactRepositoryPanel
          artifacts={artifacts}
          title="Generated Artifacts"
          subtitle={
            module === 'requirements'
              ? `Requirement AI deliverables for: ${analysisPrompt || effectivePrompt}`
              : `${config.agentLabel} · ${config.artifactSummary.join(' · ')}`
          }
        />
      )}

      {(artifacts.length > 0 || (isAsk && analysis && stage >= 2)) && (
        <WorkspaceGovernancePanel
          governance={config.governance}
          artifacts={artifacts}
          promptSummary={analysisPrompt || effectivePrompt}
          showWithoutArtifacts={isAsk && artifacts.length === 0 && !!analysis}
        />
      )}
    </Box>
  );
}
