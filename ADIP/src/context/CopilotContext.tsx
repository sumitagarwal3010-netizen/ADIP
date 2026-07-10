import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  CopilotKpis,
  CopilotProject,
  CopilotRecommendation,
  ExecutiveCopilotSummary,
  RequirementArtifactPackage,
  ReleaseReadiness,
} from '../types/copilot';
import {
  analyzeArchitecture,
  analyzeAudit,
  analyzeDevelopment,
  analyzeTesting,
  buildExecutiveSummary,
  computeCopilotKpis,
  computeReleaseReadiness,
  domainRiskChart,
  filterRecommendations,
  getImprovementsForProject,
  getProjectById,
  getRecommendationsForProject,
  getRequirementInsights,
  getRisksForProject,
  recommendationTrend,
  topRecurringIssues,
} from '../data/copilotEngine';
import { mapFeedbackToCopilotRecommendations } from '../data/productionIntelligenceEngine';
import {
  COPILOT_EXEC_SUMMARY,
  COPILOT_IMPROVEMENT_ACTIONS,
  COPILOT_PROJECTS,
  COPILOT_RECOMMENDATIONS,
  COPILOT_RISK_OBSERVATIONS,
} from '../data/copilotMockData';
import {
  DEFAULT_SDLC_PROMPT,
  orchestrateFromPrompt,
  type SdlcOrchestration,
} from '../data/copilotOrchestrationEngine';

interface CopilotContextValue {
  projects: CopilotProject[];
  recommendations: CopilotRecommendation[];
  kpis: CopilotKpis;
  execSummary: string;
  executive: ExecutiveCopilotSummary;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: CopilotProject;
  projectRecommendations: CopilotRecommendation[];
  projectRisks: ReturnType<typeof getRisksForProject>;
  projectImprovements: ReturnType<typeof getImprovementsForProject>;
  releaseReadiness: ReleaseReadiness;
  requirementInsights: ReturnType<typeof getRequirementInsights>;
  architectureInsights: ReturnType<typeof analyzeArchitecture>;
  developmentInsights: ReturnType<typeof analyzeDevelopment>;
  testingInsights: ReturnType<typeof analyzeTesting>;
  auditInsights: ReturnType<typeof analyzeAudit>;
  topIssues: ReturnType<typeof topRecurringIssues>;
  domainRiskChart: ReturnType<typeof domainRiskChart>;
  recommendationTrend: ReturnType<typeof recommendationTrend>;
  improvementActions: typeof COPILOT_IMPROVEMENT_ACTIONS;
  riskObservations: typeof COPILOT_RISK_OBSERVATIONS;
  filterRecommendations: typeof filterRecommendations;
  /**
   * Prompt-driven AI SDLC orchestration. One business prompt drives all
   * copilots, the orchestrator summary, advisor insights, traceability and
   * artifacts. Defaults to the UPI Auto-Reversal demo scenario so the studio
   * is populated on first load; `runOrchestration(prompt)` re-runs it.
   */
  activePrompt: string;
  orchestration: SdlcOrchestration;
  /** True once the user has explicitly run Analyze (vs. the seeded default). */
  orchestrationActive: boolean;
  runOrchestration: (prompt: string) => SdlcOrchestration;
  requirementArtifactPackage: RequirementArtifactPackage | null;
  setRequirementArtifactPackage: (pkg: RequirementArtifactPackage | null) => void;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState(COPILOT_PROJECTS[0].id);

  // Prompt-driven orchestration state. Seed with the default UPI scenario so the
  // Authoring Studio is never empty; flip `orchestrationActive` when the user runs Analyze.
  const [activePrompt, setActivePrompt] = useState(DEFAULT_SDLC_PROMPT);
  const [orchestration, setOrchestration] = useState<SdlcOrchestration>(() =>
    orchestrateFromPrompt(DEFAULT_SDLC_PROMPT),
  );
  const [orchestrationActive, setOrchestrationActive] = useState(false);
  const [requirementArtifactPackage, setRequirementArtifactPackage] = useState<RequirementArtifactPackage | null>(null);

  const runOrchestration = useCallback((prompt: string): SdlcOrchestration => {
    const result = orchestrateFromPrompt(prompt);
    setActivePrompt(result.prompt);
    setOrchestration(result);
    setOrchestrationActive(true);
    return result;
  }, []);

  const selectedProject = useMemo(
    () => getProjectById(selectedProjectId) ?? COPILOT_PROJECTS[0],
    [selectedProjectId],
  );

  const projectRecommendations = useMemo(
    () => getRecommendationsForProject(selectedProjectId),
    [selectedProjectId],
  );
  const projectRisks = useMemo(() => getRisksForProject(selectedProjectId), [selectedProjectId]);
  const projectImprovements = useMemo(() => getImprovementsForProject(selectedProjectId), [selectedProjectId]);
  const releaseReadiness = useMemo(() => computeReleaseReadiness(selectedProjectId), [selectedProjectId]);
  const requirementInsights = useMemo(() => getRequirementInsights(selectedProjectId), [selectedProjectId]);
  const architectureInsights = useMemo(() => analyzeArchitecture(selectedProjectId), [selectedProjectId]);
  const developmentInsights = useMemo(() => analyzeDevelopment(selectedProjectId), [selectedProjectId]);
  const testingInsights = useMemo(() => analyzeTesting(selectedProjectId), [selectedProjectId]);
  const auditInsights = useMemo(() => analyzeAudit(selectedProjectId), [selectedProjectId]);
  const executive = useMemo(() => buildExecutiveSummary(), []);
  const kpis = useMemo(() => computeCopilotKpis(), []);
  const allRecommendations = useMemo(
    () => [...COPILOT_RECOMMENDATIONS, ...mapFeedbackToCopilotRecommendations()],
    [],
  );
  const topIssues = useMemo(() => topRecurringIssues(), []);
  const domainChart = useMemo(() => domainRiskChart(), []);
  const recTrend = useMemo(() => recommendationTrend(), []);

  const value = useMemo<CopilotContextValue>(() => ({
    projects: COPILOT_PROJECTS,
    recommendations: allRecommendations,
    kpis,
    execSummary: COPILOT_EXEC_SUMMARY,
    executive,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    projectRecommendations,
    projectRisks,
    projectImprovements,
    releaseReadiness,
    requirementInsights,
    architectureInsights,
    developmentInsights,
    testingInsights,
    auditInsights,
    topIssues,
    domainRiskChart: domainChart,
    recommendationTrend: recTrend,
    filterRecommendations,
    improvementActions: COPILOT_IMPROVEMENT_ACTIONS,
    riskObservations: COPILOT_RISK_OBSERVATIONS,
    activePrompt,
    orchestration,
    orchestrationActive,
    runOrchestration,
    requirementArtifactPackage,
    setRequirementArtifactPackage,
  }), [
    kpis, executive, selectedProjectId, selectedProject, projectRecommendations,
    projectRisks, projectImprovements, releaseReadiness, requirementInsights,
    architectureInsights, developmentInsights, testingInsights, auditInsights,
    topIssues, domainChart, recTrend, allRecommendations,
    activePrompt, orchestration, orchestrationActive, runOrchestration,
    requirementArtifactPackage,
  ]);

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot(): CopilotContextValue {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider');
  return ctx;
}

export { CopilotContext };
