import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import {
  ConnectorArtifactWorkbench,
  WORKFLOW_ACTIONS,
  FRAMEWORK_OPTIONS,
  MAX_WORKFLOW_TIMELINE_STEPS,
  PREPARE_FRAMEWORK_TIMELINE_STEPS,
  getPrimaryButtonLabel,
  checkPrerequisite,
  buildPrepareFrameworkSummary,
  resetSubmissionWorkflowState,
  type WorkflowActionId,
} from './ConnectorArtifactWorkbench';

vi.mock('../components/workflow/EnterpriseArtifactWorkspace', () => ({
  EnterpriseArtifactWorkspace: () => null,
}));

function selectAction(label: string) {
  const trigger = within(screen.getByTestId('workflow-action-select')).getByRole('combobox');
  fireEvent.mouseDown(trigger);
  fireEvent.click(screen.getByRole('option', { name: label }));
}

function actionDef(id: WorkflowActionId) {
  return WORKFLOW_ACTIONS.find((a) => a.id === id)!;
}

async function runActionSteps(id: WorkflowActionId) {
  const action = actionDef(id);
  fireEvent.click(screen.getByTestId('primary-action-button'));
  await act(async () => {
    vi.advanceTimersByTime(action.steps.length * action.intervalMs + 200);
  });
}

async function advanceActionSteps(id: WorkflowActionId, steps: number) {
  const action = actionDef(id);
  fireEvent.click(screen.getByTestId('primary-action-button'));
  await act(async () => {
    vi.advanceTimersByTime(steps * action.intervalMs + 50);
  });
}

async function runThroughAuditorSubmission() {
  await runActionSteps('collect-evidence');
  selectAction('Validate Evidence');
  await runActionSteps('validate-evidence');
  selectAction('Submit for Internal Auditor Review');
  await runActionSteps('submit-auditor');
}

describe('ConnectorArtifactWorkbench compact stable workflow panel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only one primary button whose label follows the dropdown', () => {
    render(<ConnectorArtifactWorkbench />);
    expect(screen.getAllByTestId('primary-action-button')).toHaveLength(1);
    selectAction('Notify Application Owner');
    expect(screen.getByTestId('primary-action-button').textContent).toBe('Send Notification');
  });

  it('does not render Run Again', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    expect(screen.queryByTestId('workflow-run-again')).toBeNull();
    expect(screen.queryByRole('button', { name: /^Run Again$/ })).toBeNull();
  });

  it('does not call scrollIntoView when running workflow actions', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('keeps exactly one fixed workflow panel', () => {
    render(<ConnectorArtifactWorkbench />);
    expect(screen.getAllByTestId('active-workflow-panel')).toHaveLength(1);
  });

  it('limits each action to five concise timeline steps', () => {
    for (const action of WORKFLOW_ACTIONS) {
      expect(action.steps.length).toBeLessThanOrEqual(MAX_WORKFLOW_TIMELINE_STEPS);
    }
    expect(PREPARE_FRAMEWORK_TIMELINE_STEPS.length).toBe(5);
    expect(PREPARE_FRAMEWORK_TIMELINE_STEPS[1]).toMatch(/CSITE, DPSC, PCI DSS, ITPP, RAF, VAPT and baselines/);
  });

  it('replaces the previous action in the same panel', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    const panel = screen.getByTestId('active-workflow-panel');
    expect(panel).toHaveAttribute('data-action-id', 'collect-evidence');
    selectAction('Validate Evidence');
    await runActionSteps('validate-evidence');
    expect(panel).toHaveAttribute('data-action-id', 'validate-evidence');
    expect(screen.queryByText('Collect Evidence — Completed')).toBeNull();
  });

  it('does not change page scroll position when starting a new action', async () => {
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    selectAction('Validate Evidence');
    fireEvent.click(screen.getByTestId('primary-action-button'));
    expect(window.scrollY).toBe(120);
    await act(async () => {
      vi.advanceTimersByTime(actionDef('validate-evidence').steps.length * 520 + 200);
    });
    expect(window.scrollY).toBe(120);
  });

  it('progresses one step at a time with advancing progress bar', async () => {
    render(<ConnectorArtifactWorkbench />);
    await advanceActionSteps('collect-evidence', 2);
    const panel = screen.getByTestId('active-workflow-panel');
    expect(within(panel).getByTestId('timeline-step-active-2')).toBeTruthy();
    expect(within(panel).getByTestId('timeline-step-done-0')).toBeTruthy();
    const bar = within(panel).getByTestId('workflow-progress-bar');
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeLessThan(100);
  });

  it('shows compact final result only after the final step', async () => {
    render(<ConnectorArtifactWorkbench />);
    await advanceActionSteps('collect-evidence', 3);
    expect(screen.queryByText('Next: Validate Evidence')).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime((actionDef('collect-evidence').steps.length - 3) * 500 + 200);
    });
    expect(screen.getByTestId('compact-workflow-summary')).toBeTruthy();
    expect(screen.getByText('Next: Validate Evidence')).toBeTruthy();
    expect(screen.queryByTestId('workflow-timeline')).toBeNull();
  });

  it('keeps prerequisite completion flags after replacing visible output', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    selectAction('Validate Evidence');
    await runActionSteps('validate-evidence');
    expect(checkPrerequisite('notify-owner', {
      collectionDone: true,
      validationDone: true,
      notificationDone: false,
      auditorSubmissionDone: false,
      frameworkPackDone: false,
      executiveSummaryDone: false,
    }).ok).toBe(true);
  });

  it('cancels previous timer when a new action is selected', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    selectAction('Validate Evidence');
    await advanceActionSteps('validate-evidence', 2);
    selectAction('Notify Application Owner');
    expect(screen.getByTestId('active-workflow-panel')).toHaveAttribute('data-action-id', '');
  });

  it('completes all six actions progressively', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    selectAction('Validate Evidence');
    await runActionSteps('validate-evidence');
    selectAction('Notify Application Owner');
    await runActionSteps('notify-owner');
    selectAction('Submit for Internal Auditor Review');
    await runActionSteps('submit-auditor');
    selectAction('Prepare Framework Submission');
    await runActionSteps('prepare-framework');
    selectAction('Generate Executive Summary');
    await runActionSteps('executive-summary');
    expect(screen.getByText('Generate Executive Summary — Completed')).toBeTruthy();
  });

  it('renders executive summary labels and values in the compact panel', async () => {
    render(<ConnectorArtifactWorkbench />);
    selectAction('Generate Executive Summary');
    await runActionSteps('executive-summary');

    const result = screen.getByTestId('action-result-executive-summary');
    expect(within(result).getByText('Applications covered')).toBeTruthy();
    expect(within(result).getByText('Evidence collected')).toBeTruthy();
    expect(within(result).getByText('126')).toBeTruthy();
    expect(within(result).getByText('Evidence reuse')).toBeTruthy();
    expect(within(result).getByText('54%')).toBeTruthy();
    expect(within(result).getByText('Frameworks covered')).toBeTruthy();
    expect(within(result).getByText('10')).toBeTruthy();
    expect(within(result).getByText('Open observations')).toBeTruthy();
    expect(within(result).getByText('7')).toBeTruthy();
    expect(within(result).getByText('Readiness score')).toBeTruthy();
    expect(within(result).getByText('91%')).toBeTruthy();
    expect(within(result).getByText('Top risks')).toBeTruthy();
    expect(within(result).getByText('Owner attestations, DR sign-off, CAB timing')).toBeTruthy();
    expect(within(result).getByText('Recommended action')).toBeTruthy();
    expect(within(result).getByText('Close exceptions and complete auditor review')).toBeTruthy();
  });

  it('does not show pack actions for executive summary', async () => {
    render(<ConnectorArtifactWorkbench />);
    selectAction('Generate Executive Summary');
    await runActionSteps('executive-summary');

    const result = screen.getByTestId('action-result-executive-summary');
    expect(within(result).queryByRole('button', { name: /View Evidence Pack/ })).toBeNull();
    expect(within(result).queryByRole('button', { name: /Download Evidence Pack/ })).toBeNull();
    expect(within(result).queryByRole('button', { name: /Run Again/ })).toBeNull();
  });

  it('fits executive summary content in the panel without clipping', async () => {
    render(<ConnectorArtifactWorkbench />);
    selectAction('Generate Executive Summary');
    await runActionSteps('executive-summary');

    const panel = screen.getByTestId('active-workflow-panel');
    const fields = [
      'applications-covered',
      'evidence-collected',
      'evidence-reuse',
      'frameworks-covered',
      'open-observations',
      'readiness-score',
      'top-risks',
      'recommended-action',
    ];
    for (const field of fields) {
      expect(within(panel).getByTestId(`executive-summary-field-${field}`)).toBeTruthy();
    }
    expect(panel.scrollHeight).toBeLessThanOrEqual(panel.clientHeight + 2);
  });

  it('retains view and download controls for auditor submission', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runThroughAuditorSubmission();
    const result = screen.getByTestId('action-result-submit-auditor');
    expect(within(result).getByRole('button', { name: /View Evidence Pack/ })).toBeTruthy();
    expect(within(result).getByRole('button', { name: /Download Evidence Pack/ })).toBeTruthy();
  });

  it('shows framework detail cards below the panel without auto-expanding timeline rows', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runThroughAuditorSubmission();
    selectAction('Prepare Framework Submission');
    await runActionSteps('prepare-framework');
    const panel = screen.getByTestId('active-workflow-panel');
    expect(within(panel).queryByText(/Mapping evidence to CSITE controls/)).toBeNull();
    expect(screen.getByTestId('framework-detail-section')).toBeTruthy();
    for (const fw of FRAMEWORK_OPTIONS) {
      expect(screen.getByTestId(`framework-result-${fw.replace(/\s+/g, '-').toLowerCase()}`)).toBeTruthy();
    }
  });

  it('shows compact framework summary in the panel', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runThroughAuditorSubmission();
    selectAction('Prepare Framework Submission');
    await runActionSteps('prepare-framework');
    const result = screen.getByTestId('action-result-prepare-framework');
    expect(within(result).getByText('Frameworks evaluated')).toBeTruthy();
    expect(within(result).getByText('Packs submitted')).toBeTruthy();
    expect(within(result).getByText('Readiness score')).toBeTruthy();
  });

  it('does not clear completed active result after timeout', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runActionSteps('collect-evidence');
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('Collect Evidence — Completed')).toBeTruthy();
  });

  it('getPrimaryButtonLabel maps all workflow actions', () => {
    expect(getPrimaryButtonLabel('submit-auditor')).toBe('Submit to Auditor');
    expect(getPrimaryButtonLabel('prepare-framework')).toBe('Prepare Submission Pack');
  });

  it('buildPrepareFrameworkSummary retains detailed framework results', () => {
    const built = buildPrepareFrameworkSummary();
    expect(built.frameworkResults).toHaveLength(10);
    expect(built.executiveStatement).toMatch(/68 reusable evidence items/);
  });

  it('submit auditor requires collection and validation', () => {
    expect(checkPrerequisite('submit-auditor', {
      collectionDone: true,
      validationDone: false,
      notificationDone: false,
      auditorSubmissionDone: false,
      frameworkPackDone: false,
      executiveSummaryDone: false,
    }).ok).toBe(false);
  });

  it('resetSubmissionWorkflowState clears legacy submission flags', () => {
    const setSubmitting = vi.fn();
    const setSubmitDone = vi.fn();
    const setSubmitStepIndex = vi.fn();
    const setSubmission = vi.fn();
    const setPackViewerOpen = vi.fn();
    resetSubmissionWorkflowState({
      setSubmitting,
      setSubmitDone,
      setSubmitStepIndex,
      setSubmission,
      setPackViewerOpen,
    });
    expect(setSubmitDone).toHaveBeenCalledWith(false);
    expect(setSubmission).toHaveBeenCalledWith(null);
  });
});
