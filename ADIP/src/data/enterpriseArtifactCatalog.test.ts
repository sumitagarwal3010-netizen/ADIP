import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import {
  GENERIC_FALLBACK_PHRASE,
  generateDeterministicArtifacts,
  getPromptById,
} from './enterpriseArtifactCatalog';
import promptCatalogue from './deterministic/prompt-catalogue.json';
import { buildBlob } from '../services/artifactExportService';

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read Blob'));
    reader.readAsArrayBuffer(blob);
  });
}

const GOLDEN_PROMPT_IDS = [
  'PR-001',
  'PR-007',
  'PR-013',
  'PR-014',
  'PR-019',
  'PR-025',
  'PR-031',
  'PR-037',
  'PR-043',
  'PR-049',
  'PR-055',
  'PR-061',
  'PR-067',
  'PR-073',
];

function allSectionText(promptId: string): string {
  return generateDeterministicArtifacts(promptId)
    .flatMap((a) => [a.executiveSummary ?? '', ...a.sections.map((s) => s.content)])
    .join('\n');
}

describe('enterpriseArtifactCatalog content quality', () => {
  it('golden demo content does not contain the generic fallback sentence', () => {
    for (const promptId of GOLDEN_PROMPT_IDS) {
      const text = allSectionText(promptId);
      expect(text, promptId).not.toContain(GENERIC_FALLBACK_PHRASE);
    }
  });

  it('two different prompts generate different content', () => {
    const exec = allSectionText('PR-001');
    const investment = allSectionText('PR-014');
    expect(exec).not.toEqual(investment);
    expect(investment).toMatch(/investment|ROI|benefit/i);
  });

  it('two different artifact types generate different section content', () => {
    const artifacts = generateDeterministicArtifacts('PR-014');
    const primary = artifacts.find((a) => a.id === 'AR-014');
    const supporting = artifacts.find((a) => a.id !== 'AR-014');
    expect(primary).toBeTruthy();
    expect(supporting).toBeTruthy();
    expect(primary!.sections[0]?.content).not.toEqual(supporting!.sections[0]?.content);
  });

  it('repeated generation of the same prompt remains deterministic', () => {
    const first = generateDeterministicArtifacts('PR-019');
    const second = generateDeterministicArtifacts('PR-019');
    expect(second).toEqual(first);
  });

  it('Biometric Login uses linked scenario identifiers and banking content', () => {
    const artifacts = generateDeterministicArtifacts('PR-019');
    const brd = artifacts.find((a) => a.id === 'AR-020');
    const text = allSectionText('PR-019');
    expect(brd).toBeTruthy();
    expect(text).toMatch(/SCN-BIO-001|BR-BIO|FR-BIO|biometric/i);
    expect(text).toMatch(/Mobile Banking|RBI|MPIN/i);
  });

  it('Investment Roadmap business case sections are distinct and meaningful', () => {
    const artifact = generateDeterministicArtifacts('PR-014').find((a) => a.id === 'AR-014');
    expect(artifact).toBeTruthy();
    const byTitle = Object.fromEntries(
      artifact!.sections.map((s) => [s.title.toLowerCase(), s.content]),
    );
    expect(byTitle.problem).toMatch(/password|authentication/i);
    expect(byTitle.options).toMatch(/Option A/);
    expect(byTitle.benefits).toMatch(/benefit/i);
    expect(byTitle.cost).toMatch(/investment/i);
    expect(byTitle.roi).toMatch(/ROI|payback/i);
    expect(byTitle.risk).toBeTruthy();
    expect(byTitle.recommendation).toBeTruthy();
    const bodies = Object.values(byTitle);
    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it('viewer content matches exported artifact content', async () => {
    const artifact = generateDeterministicArtifacts('PR-014').find((a) => a.id === 'AR-014')!;
    const marker = artifact.sections.find((s) => s.title.toLowerCase() === 'problem')!.content.slice(0, 40);
    expect(artifact.previewContent).toContain(marker);

    const { blob } = await buildBlob({ artifact, format: 'docx' });
    const buf = await blobToArrayBuffer(blob);
    const zip = await JSZip.loadAsync(buf);
    const docXml = await zip.file('word/document.xml')?.async('string');
    expect(docXml).toContain(marker.replace(/&/g, '&amp;').slice(0, 20));
  });

  it('all active prompts retain a valid deterministic output path', () => {
    const active = (promptCatalogue as Array<{ prompt_id: string; status: string }>).filter(
      (p) => p.status === 'active',
    );
    expect(active).toHaveLength(78);
    for (const { prompt_id } of active) {
      const artifacts = generateDeterministicArtifacts(prompt_id);
      expect(artifacts.length, prompt_id).toBeGreaterThan(0);
      expect(getPromptById(prompt_id)?.modelUsed).toBeUndefined();
      for (const artifact of artifacts) {
        expect(artifact.modelUsed).toBe('Not applicable');
        expect(artifact.sections.length).toBeGreaterThan(0);
      }
    }
  });
});
