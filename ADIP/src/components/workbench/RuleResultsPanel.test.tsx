import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RuleResultsPanel } from './RuleResultsPanel';

describe('RuleResultsPanel', () => {
  it('renders pass/fail rule rows', () => {
    render(
      <RuleResultsPanel
        overallStatus="pass"
        results={[
          { rule_id: 'r1', name: 'Test rule', category: 'sdlc', status: 'pass', message: 'OK' },
          { rule_id: 'r2', name: 'Fail rule', category: 'security', status: 'fail', message: 'Missing', remediation: 'Fix it' },
        ]}
      />,
    );
    expect(screen.getByText('Test rule')).toBeTruthy();
    expect(screen.getByText('Fail rule')).toBeTruthy();
  });
});
