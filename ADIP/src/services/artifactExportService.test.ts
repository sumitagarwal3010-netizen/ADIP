import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { buildBlob } from './artifactExportService';
import type { Artifact } from '../types/artifacts';

describe('artifactExportService requirement flow export', () => {
  it('docx export includes detailed sections without duplicating executive summary', async () => {
    const requirementText = 'Plan delivery for biometric login on mobile banking';
    const detailed = `BRD - Biometric Login on Mobile Banking
Requested Prompt: ${requirementText}
1. Document Purpose
Define secure biometric authentication with device binding and fallback.
2. Functional Requirements
FR-BIO-001 Enrollment
FR-BIO-002 Device Binding`;
    const artifact: Artifact = {
      id: 'req-brd-1',
      name: 'BRD_Biometric_Login_Mobile_Banking.docx',
      generatedBy: 'Requirements Copilot (Deterministic Demo)',
      modelUsed: 'Not applicable',
      version: '1.0',
      generatedDate: '2026-07-10',
      approvalStatus: 'Pending Review',
      fileType: 'docx',
      previewContent: detailed,
      sections: [{ title: 'Requirement Artifact Content', content: detailed }],
      generationHistory: [
        {
          version: '1.0',
          generatedDate: '2026-07-10',
          generatedBy: 'Requirements Copilot (Deterministic Demo)',
          modelUsed: 'Not applicable',
          changeSummary: 'Initial generation',
        },
      ],
      context: { subject: 'AI SDLC Copilot Requirement Artifacts' },
    };

    const { blob } = await buildBlob({ artifact, format: 'docx' });
    const buf = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const docXml = await zip.file('word/document.xml')?.async('string');

    expect(docXml).toBeTruthy();
    expect(docXml).toContain(requirementText);
    expect(docXml).toContain('Executive Summary');
    expect(docXml).toContain('Requirement Artifact Content');
    expect(docXml).toContain('1. Document Purpose');
    expect(docXml).toContain('FR-BIO-001 Enrollment');
    expect(docXml).toContain('Requirements Copilot (Deterministic Demo)');
    expect(docXml).toContain('Not applicable');
    expect(docXml?.match(/Define secure biometric authentication with device binding and fallback\./g)?.length ?? 0).toBe(1);
  });
});

