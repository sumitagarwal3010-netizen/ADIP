import { describe, expect, it } from 'vitest';
import { buildHubArtifacts } from './hubArtifactDefinitions';
import { createHubDocArtifact, hubSimulation } from './hubArtifactFactory';

describe('hubArtifactFactory', () => {
  it('creates doc artifacts with stable ids', () => {
    const artifact = createHubDocArtifact({
      runId: 'RUN-1',
      suffix: 'test',
      name: 'Test_Report.docx',
      generatedBy: 'Test AI',
      previewContent: 'Preview',
      contextSubject: 'Test',
    });
    expect(artifact.id).toBe('RUN-1-test');
    expect(artifact.name).toBe('Test_Report.docx');
  });

  it('builds hub simulation steps', () => {
    const sim = hubSimulation('Starting…', ['Step A', 'Step B']);
    expect(sim.steps).toHaveLength(2);
    expect(sim.steps[1].progress).toBe(100);
  });
});

describe('hubArtifactDefinitions', () => {
  it('buildHubArtifacts preserves audit hub output count', () => {
    const artifacts = buildHubArtifacts('audit', 'TEST-AUD');
    expect(artifacts.length).toBe(3);
    expect(artifacts[0].generatedBy).toBe('Audit AI');
  });
});
