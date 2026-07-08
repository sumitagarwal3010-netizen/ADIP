import { describe, expect, it } from 'vitest';
import { mapAiEngineToAnalysisResult } from './aiWorkspaceBackend';

describe('aiWorkspaceBackend', () => {
  it('maps AI engine response into analysis result', () => {
    const result = mapAiEngineToAnalysisResult('requirements', 'UPI limit', {
      classification: { domain: 'payments' },
      confidence: 82,
      steps: ['Parse requirements', 'Assess risk'],
      plan: [{ phase: 'Requirements', action: 'Draft BRD', artifact: 'BRD' }],
      reflection: { improvements: ['Add NFR targets'], issues: [], adjusted_confidence: 85 },
    });
    expect(result['Confidence Score']).toBe(85);
    expect(result.Recommendations).toContain('Requirements: Draft BRD → BRD');
    expect(result.Summary).toContain('Parse requirements');
  });

  it('falls back to phase mock fields when classification is sparse', () => {
    const result = mapAiEngineToAnalysisResult('testing', 'Regression pack', {
      confidence: 70,
      steps: [],
      plan: [],
    });
    expect(result['Coverage Score'] ?? result['Confidence Score']).toBeDefined();
  });
});
