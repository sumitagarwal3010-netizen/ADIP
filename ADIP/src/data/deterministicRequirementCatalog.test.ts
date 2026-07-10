import { describe, expect, it } from 'vitest';
import { getDeterministicRequirementPackage } from './deterministicRequirementCatalog';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('deterministicRequirementCatalog', () => {
  it('maps each approved prompt to a distinct deterministic package', () => {
    const prompts = [
      'Create BRD for UPI limit enhancement',
      'Generate requirements for merchant auto settlement',
      'Plan delivery for biometric login on mobile banking',
      'Assess readiness for NEFT batch modernization',
    ];

    const packages = prompts.map((p) => getDeterministicRequirementPackage(p));
    expect(packages.every(Boolean)).toBe(true);

    const features = packages.map((pkg) => pkg?.requirement_profile?.feature);
    expect(features).toEqual([
      'UPI Limit Enhancement',
      'Merchant Auto Settlement',
      'Biometric Login on Mobile Banking',
      'NEFT Batch Modernization Readiness',
    ]);

    for (const pkg of packages) {
      expect(pkg?.artifacts.brd.content.length).toBeGreaterThan(50);
      expect(pkg?.artifacts.frd.content.length).toBeGreaterThan(50);
      expect(pkg?.artifacts.user_stories.content.length).toBeGreaterThan(50);
      expect(pkg?.artifacts.acceptance_criteria.content.length).toBeGreaterThan(50);
      expect(pkg?.artifacts.test_scenarios.content.length).toBeGreaterThan(50);
      expect(pkg?.artifacts.traceability_matrix.content.length).toBeGreaterThan(50);
      expect(pkg?.artifacts.requirement_review?.content.length ?? 0).toBeGreaterThan(50);
    }
  });

  it('keeps biometric BRD and FRD materially different', () => {
    const pkg = getDeterministicRequirementPackage(
      'Plan delivery for biometric login on mobile banking',
    );
    expect(pkg).toBeTruthy();
    const brd = pkg!.artifacts.brd.content;
    const frd = pkg!.artifacts.frd.content;
    expect(brd).not.toBe(frd);
    expect(brd).toContain('Document Purpose');
    expect(frd).toContain('Functional Overview');
  });

  it('uses distinct domain terms per predefined prompt', () => {
    const upi = getDeterministicRequirementPackage('Create BRD for UPI limit enhancement')!;
    const merchant = getDeterministicRequirementPackage(
      'Generate requirements for merchant auto settlement',
    )!;
    const biometric = getDeterministicRequirementPackage(
      'Plan delivery for biometric login on mobile banking',
    )!;
    const neft = getDeterministicRequirementPackage(
      'Assess readiness for NEFT batch modernization',
    )!;

    expect(upi.artifacts.brd.content.toLowerCase()).toContain('upi');
    expect(merchant.artifacts.brd.content.toLowerCase()).toContain('merchant');
    expect(biometric.artifacts.brd.content.toLowerCase()).toContain('biometric');
    expect(neft.artifacts.brd.content.toLowerCase()).toContain('neft');

    expect(biometric.artifacts.brd.content.toLowerCase()).not.toContain('merchant auto settlement');
    expect(biometric.artifacts.brd.content.toLowerCase()).not.toContain('upi limit enhancement');
  });

  it('does not introduce llm or api calls in deterministic catalog', () => {
    const filePath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      'deterministicRequirementCatalog.ts',
    );
    const src = fs.readFileSync(filePath, 'utf8').toLowerCase();
    expect(src).not.toContain('ollama');
    expect(src).not.toContain('openrouter');
    expect(src).not.toContain('apiclient');
    expect(src).not.toContain('fetch(');
    expect(src).not.toContain('http://');
    expect(src).not.toContain('https://');
  });
});

