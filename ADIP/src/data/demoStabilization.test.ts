import { describe, expect, it } from 'vitest';
import { NAV_GROUPS } from '../config/navConfig';
import {
  generateDeterministicArtifacts,
  getPageByPillarAndSubmenu,
  getPageByRoute,
  getPromptsForPage,
  listPages,
  type Pillar,
} from './enterpriseArtifactCatalog';

const CANONICAL_ROUTES = [
  '/executive-ai/executive-advisor',
  '/executive-ai/technology-advisor',
  '/executive-ai/investment-advisor',
  '/ai-sdlc/requirements-engineering',
  '/ai-sdlc/design-architecture',
  '/ai-sdlc/development',
  '/ai-sdlc/release',
  '/governance/ai-oversight',
  '/governance/compliance-automation',
  '/governance/architecture-assurance',
  '/enterprise-ai/enterprise-evidence-hub',
  '/enterprise-ai/knowledge-intelligence',
  '/enterprise-ai/administration',
] as const;

const PAGE_MAPPINGS: Array<{ pillar: Pillar; submenu: string; route: string }> = [
  { pillar: 'Executive AI', submenu: 'Executive Advisor', route: '/executive-ai/executive-advisor' },
  { pillar: 'Executive AI', submenu: 'Technology Advisor', route: '/executive-ai/technology-advisor' },
  { pillar: 'Executive AI', submenu: 'Investment Advisor', route: '/executive-ai/investment-advisor' },
  { pillar: 'AI SDLC', submenu: 'Requirements Engineering', route: '/ai-sdlc/requirements-engineering' },
  { pillar: 'AI SDLC', submenu: 'Design & Architecture', route: '/ai-sdlc/design-architecture' },
  { pillar: 'AI SDLC', submenu: 'Development', route: '/ai-sdlc/development' },
  { pillar: 'AI SDLC', submenu: 'Release', route: '/ai-sdlc/release' },
  { pillar: 'Governance', submenu: 'AI Oversight', route: '/governance/ai-oversight' },
  { pillar: 'Governance', submenu: 'Compliance Automation', route: '/governance/compliance-automation' },
  { pillar: 'Governance', submenu: 'Architecture Assurance', route: '/governance/architecture-assurance' },
  { pillar: 'Enterprise AI', submenu: 'Enterprise Evidence Hub', route: '/enterprise-ai/enterprise-evidence-hub' },
  { pillar: 'Enterprise AI', submenu: 'Knowledge Intelligence', route: '/enterprise-ai/knowledge-intelligence' },
  { pillar: 'Enterprise AI', submenu: 'Administration', route: '/enterprise-ai/administration' },
];

describe('Phase 4 navigation validation', () => {
  it('has exactly 4 navigation groups', () => {
    expect(NAV_GROUPS).toHaveLength(4);
    expect(NAV_GROUPS.map((g) => g.label)).toEqual([
      'Executive AI',
      'AI SDLC',
      'Governance',
      'Enterprise AI',
    ]);
  });

  it('has exactly 13 direct navigation entries with unique paths', () => {
    const entries = NAV_GROUPS.flatMap((g) => g.children);
    expect(entries).toHaveLength(13);
    const paths = entries.map((e) => e.path);
    expect(new Set(paths).size).toBe(13);
    expect(paths).toEqual([...CANONICAL_ROUTES]);
  });

  it('excludes parked capabilities from navigation labels', () => {
    const labels = NAV_GROUPS.flatMap((g) => g.children.map((c) => c.label)).join(' ');
    expect(labels).not.toMatch(/Capacity Planning/);
    expect(labels).not.toMatch(/Infrastructure Sizing/);
    expect(labels).not.toMatch(/\bTesting\b/);
  });
});

describe('Phase 4 canonical route catalogue', () => {
  it('maps all 13 routes in page metadata with six prompts each', () => {
    expect(listPages()).toHaveLength(13);
    for (const route of CANONICAL_ROUTES) {
      const page = getPageByRoute(route);
      expect(page, `missing metadata for ${route}`).toBeDefined();
      expect(getPromptsForPage(page!.page_id)).toHaveLength(6);
    }
  });

  it('resolves pillar and submenu for every approved page', () => {
    for (const { pillar, submenu, route } of PAGE_MAPPINGS) {
      const page = getPageByPillarAndSubmenu(pillar, submenu);
      expect(page?.route).toBe(route);
      expect(page?.title).toBe(submenu);
    }
  });
});

describe('Phase 4 deterministic generation', () => {
  it('generates stable artifact ids and Pending Review status', () => {
    const first = generateDeterministicArtifacts('PR-001');
    const second = generateDeterministicArtifacts('PR-001');
    expect(first.length).toBeGreaterThan(0);
    expect(first[0].approvalStatus).toBe('Pending Review');
    expect(first[0].modelUsed).toBe('Not applicable');
    expect(first.map((a) => a.id)).toEqual(second.map((a) => a.id));
    expect(first.map((a) => a.name)).toEqual(second.map((a) => a.name));
  });
});
