import type { PersonaId } from '../config/personaConfig';
import type {
  KnowledgeCenterKpis,
  KnowledgeSearchFilters,
  KnowledgeTraceabilityChain,
} from '../types/knowledgeCenter';
import { KNOWLEDGE_CENTER_ALLOWED_PERSONAS } from '../types/knowledgeCenter';
import {
  ARCHITECTURE_PATTERNS,
  BEST_PRACTICES,
  KNOWLEDGE_TRACEABILITY_CHAINS,
  LEARNING_RECOMMENDATIONS,
  LESSONS_LEARNED,
  RCA_KNOWLEDGE_ARTICLES,
  REUSABLE_CONTROLS,
  SDLC_PLAYBOOKS,
} from './knowledgeCenterMock';

export function canAccessKnowledgeCenter(personaId: PersonaId): boolean {
  return KNOWLEDGE_CENTER_ALLOWED_PERSONAS.includes(personaId);
}

export function computeKnowledgeCenterKpis(): KnowledgeCenterKpis {
  const totalArtifacts =
    LESSONS_LEARNED.length + BEST_PRACTICES.length + ARCHITECTURE_PATTERNS.length
    + RCA_KNOWLEDGE_ARTICLES.length + SDLC_PLAYBOOKS.length + REUSABLE_CONTROLS.length;
  const totalReuse =
    LESSONS_LEARNED.reduce((s, l) => s + l.reuseCount, 0)
    + SDLC_PLAYBOOKS.reduce((s, p) => s + p.reuseCount, 0)
    + REUSABLE_CONTROLS.reduce((s, c) => s + c.reuseCount, 0)
    + ARCHITECTURE_PATTERNS.reduce((s, p) => s + p.adoptionCount, 0);
  const topControl = [...REUSABLE_CONTROLS].sort((a, b) => b.reuseCount - a.reuseCount)[0];
  const topPlaybook = [...SDLC_PLAYBOOKS].sort((a, b) => b.reuseCount - a.reuseCount)[0];
  const avgAdoption = BEST_PRACTICES.length
    ? Math.round(BEST_PRACTICES.reduce((s, b) => s + b.adoptionRate, 0) / BEST_PRACTICES.length)
    : 0;

  return {
    knowledgeCoverage: Math.min(98, Math.round((totalArtifacts / 750) * 100)),
    knowledgeReuse: Math.round(totalReuse / totalArtifacts),
    topRiskThemes: 5,
    mostReusedControls: topControl?.reuseCount ?? 0,
    mostReusedPlaybooks: topPlaybook?.reuseCount ?? 0,
    learningAdoption: avgAdoption,
    totalLessons: LESSONS_LEARNED.length,
    totalBestPractices: BEST_PRACTICES.length,
    totalPatterns: ARCHITECTURE_PATTERNS.length,
    totalPlaybooks: SDLC_PLAYBOOKS.length,
  };
}

export function topRiskThemes(limit = 6) {
  const themes = new Map<string, number>();
  for (const r of LEARNING_RECOMMENDATIONS) {
    themes.set(r.relatedTheme, (themes.get(r.relatedTheme) ?? 0) + 1);
  }
  for (const l of LESSONS_LEARNED) {
    themes.set(l.rootCause.slice(0, 30), (themes.get(l.rootCause.slice(0, 30)) ?? 0) + 1);
  }
  return [...themes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function mostReusedControls(limit = 8) {
  return [...REUSABLE_CONTROLS]
    .sort((a, b) => b.reuseCount - a.reuseCount)
    .slice(0, limit)
    .map((c) => ({ name: c.name, value: c.reuseCount }));
}

export function mostReusedPlaybooks(limit = 8) {
  return [...SDLC_PLAYBOOKS]
    .sort((a, b) => b.reuseCount - a.reuseCount)
    .slice(0, limit)
    .map((p) => ({ name: p.title, value: p.reuseCount }));
}

export function knowledgeByCategory() {
  const cats = ['incident', 'audit', 'release', 'defect', 'architecture', 'copilot', 'security'];
  return cats.map((c) => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    value: LESSONS_LEARNED.filter((l) => l.category === c).length,
  }));
}

export function bestPracticeByDomain() {
  const domains = ['requirements', 'architecture', 'development', 'testing', 'release', 'governance', 'audit', 'operations', 'ai-governance'];
  return domains.map((d) => ({
    name: d.replace('-', ' '),
    value: BEST_PRACTICES.filter((b) => b.domain === d).length,
  }));
}

export function patternByCategory() {
  const cats = [...new Set(ARCHITECTURE_PATTERNS.map((p) => p.category))];
  return cats.slice(0, 10).map((c) => ({
    name: c.replace('-', ' '),
    value: ARCHITECTURE_PATTERNS.filter((p) => p.category === c).length,
  }));
}

export function rcaBySource() {
  const sources = ['production-rca', 'audit-finding', 'control-failure', 'release-failure', 'security-incident'];
  return sources.map((s) => ({
    name: s.replace('-', ' '),
    value: RCA_KNOWLEDGE_ARTICLES.filter((r) => r.source === s).length,
  }));
}

export function adoptionTrend() {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    lessons: 20 + i * 5,
    playbooks: 15 + i * 4,
    controls: 12 + i * 3,
  }));
}

export function searchKnowledge(filters: KnowledgeSearchFilters) {
  const q = filters.query.toLowerCase();
  const results: { type: string; id: string; title: string; domain: string; meta: string }[] = [];

  for (const l of LESSONS_LEARNED) {
    if (filters.category && filters.category !== 'lesson' && filters.category !== 'all') continue;
    if (filters.domain && l.domain !== filters.domain) continue;
    if (filters.application && l.application !== filters.application) continue;
    if (q && !l.title.toLowerCase().includes(q) && !l.tags.some((t) => t.toLowerCase().includes(q))) continue;
    results.push({ type: 'Lesson', id: l.id, title: l.title, domain: l.domain, meta: l.category });
  }
  for (const b of BEST_PRACTICES) {
    if (filters.category && filters.category !== 'best-practice' && filters.category !== 'all') continue;
    if (filters.domain && b.domain !== filters.domain) continue;
    if (q && !b.title.toLowerCase().includes(q)) continue;
    results.push({ type: 'Best Practice', id: b.id, title: b.title, domain: b.domain, meta: b.domain });
  }
  for (const p of ARCHITECTURE_PATTERNS) {
    if (filters.category && filters.category !== 'pattern' && filters.category !== 'all') continue;
    if (q && !p.name.toLowerCase().includes(q)) continue;
    results.push({ type: 'Pattern', id: p.id, title: p.name, domain: p.category, meta: p.category });
  }
  for (const r of RCA_KNOWLEDGE_ARTICLES) {
    if (filters.category && filters.category !== 'rca' && filters.category !== 'all') continue;
    if (filters.domain && r.domain !== filters.domain) continue;
    if (q && !r.title.toLowerCase().includes(q)) continue;
    results.push({ type: 'RCA Article', id: r.id, title: r.title, domain: r.domain, meta: r.source });
  }
  for (const pb of SDLC_PLAYBOOKS) {
    if (filters.category && filters.category !== 'playbook' && filters.category !== 'all') continue;
    if (q && !pb.title.toLowerCase().includes(q)) continue;
    results.push({ type: 'Playbook', id: pb.id, title: pb.title, domain: pb.type, meta: pb.type });
  }
  for (const c of REUSABLE_CONTROLS) {
    if (filters.category && filters.category !== 'control' && filters.category !== 'all') continue;
    if (filters.domain && c.domain !== filters.domain) continue;
    if (q && !c.name.toLowerCase().includes(q)) continue;
    results.push({ type: 'Control', id: c.id, title: c.name, domain: c.domain, meta: c.type });
  }

  return results.slice(0, 50);
}

export function getTraceabilityChain(lessonId: string): KnowledgeTraceabilityChain | undefined {
  return KNOWLEDGE_TRACEABILITY_CHAINS.find((c) => c.lessonLearned === lessonId);
}

export function recommendationsByType() {
  const types = ['article', 'control', 'playbook', 'pattern'] as const;
  return types.map((t) => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    value: LEARNING_RECOMMENDATIONS.filter((r) => r.type === t).length,
  }));
}

export function recommendationsBySource() {
  const sources = [...new Set(LEARNING_RECOMMENDATIONS.map((r) => r.source))];
  return sources.map((s) => ({
    name: s,
    value: LEARNING_RECOMMENDATIONS.filter((r) => r.source === s).length,
  }));
}
