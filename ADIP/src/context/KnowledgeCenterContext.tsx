import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { KnowledgeCenterKpis, KnowledgeSearchFilters } from '../types/knowledgeCenter';
import {
  adoptionTrend,
  bestPracticeByDomain,
  computeKnowledgeCenterKpis,
  knowledgeByCategory,
  mostReusedControls,
  mostReusedPlaybooks,
  patternByCategory,
  rcaBySource,
  recommendationsBySource,
  recommendationsByType,
  searchKnowledge,
  topRiskThemes,
} from '../data/knowledgeCenterEngine';
import {
  ARCHITECTURE_PATTERNS,
  BEST_PRACTICES,
  KNOWLEDGE_CENTER_EXEC_SUMMARY,
  KNOWLEDGE_TRACEABILITY_CHAINS,
  LEARNING_RECOMMENDATIONS,
  LESSONS_LEARNED,
  RCA_KNOWLEDGE_ARTICLES,
  REUSABLE_CONTROLS,
  SDLC_PLAYBOOKS,
} from '../data/knowledgeCenterMock';

const DEFAULT_FILTERS: KnowledgeSearchFilters = {
  query: '',
  category: 'all',
  domain: '',
  application: '',
  severity: '',
};

interface KnowledgeCenterContextValue {
  kpis: KnowledgeCenterKpis;
  execSummary: string;
  lessons: typeof LESSONS_LEARNED;
  bestPractices: typeof BEST_PRACTICES;
  patterns: typeof ARCHITECTURE_PATTERNS;
  rcaArticles: typeof RCA_KNOWLEDGE_ARTICLES;
  playbooks: typeof SDLC_PLAYBOOKS;
  controls: typeof REUSABLE_CONTROLS;
  recommendations: typeof LEARNING_RECOMMENDATIONS;
  traceabilityChains: typeof KNOWLEDGE_TRACEABILITY_CHAINS;
  searchFilters: KnowledgeSearchFilters;
  setSearchFilters: (f: KnowledgeSearchFilters) => void;
  searchResults: ReturnType<typeof searchKnowledge>;
  topRiskThemes: ReturnType<typeof topRiskThemes>;
  mostReusedControls: ReturnType<typeof mostReusedControls>;
  mostReusedPlaybooks: ReturnType<typeof mostReusedPlaybooks>;
  knowledgeByCategory: ReturnType<typeof knowledgeByCategory>;
  bestPracticeByDomain: ReturnType<typeof bestPracticeByDomain>;
  patternByCategory: ReturnType<typeof patternByCategory>;
  rcaBySource: ReturnType<typeof rcaBySource>;
  adoptionTrend: ReturnType<typeof adoptionTrend>;
  recommendationsByType: ReturnType<typeof recommendationsByType>;
  recommendationsBySource: ReturnType<typeof recommendationsBySource>;
}

const KnowledgeCenterContext = createContext<KnowledgeCenterContextValue | null>(null);

export function KnowledgeCenterProvider({ children }: { children: ReactNode }) {
  const [searchFilters, setSearchFilters] = useState<KnowledgeSearchFilters>(DEFAULT_FILTERS);
  const kpis = useMemo(() => computeKnowledgeCenterKpis(), []);
  const searchResults = useMemo(() => searchKnowledge(searchFilters), [searchFilters]);

  const value = useMemo<KnowledgeCenterContextValue>(() => ({
    kpis,
    execSummary: KNOWLEDGE_CENTER_EXEC_SUMMARY,
    lessons: LESSONS_LEARNED,
    bestPractices: BEST_PRACTICES,
    patterns: ARCHITECTURE_PATTERNS,
    rcaArticles: RCA_KNOWLEDGE_ARTICLES,
    playbooks: SDLC_PLAYBOOKS,
    controls: REUSABLE_CONTROLS,
    recommendations: LEARNING_RECOMMENDATIONS,
    traceabilityChains: KNOWLEDGE_TRACEABILITY_CHAINS,
    searchFilters,
    setSearchFilters,
    searchResults,
    topRiskThemes: topRiskThemes(),
    mostReusedControls: mostReusedControls(),
    mostReusedPlaybooks: mostReusedPlaybooks(),
    knowledgeByCategory: knowledgeByCategory(),
    bestPracticeByDomain: bestPracticeByDomain(),
    patternByCategory: patternByCategory(),
    rcaBySource: rcaBySource(),
    adoptionTrend: adoptionTrend(),
    recommendationsByType: recommendationsByType(),
    recommendationsBySource: recommendationsBySource(),
  }), [kpis, searchFilters, searchResults]);

  return (
    <KnowledgeCenterContext.Provider value={value}>
      {children}
    </KnowledgeCenterContext.Provider>
  );
}

export function useKnowledgeCenter(): KnowledgeCenterContextValue {
  const ctx = useContext(KnowledgeCenterContext);
  if (!ctx) throw new Error('useKnowledgeCenter must be used within KnowledgeCenterProvider');
  return ctx;
}

export { KnowledgeCenterContext };
