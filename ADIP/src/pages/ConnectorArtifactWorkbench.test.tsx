import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  ConnectorArtifactWorkbench,
  SUBMIT_TIMELINE_STEPS,
  resetSubmissionWorkflowState,
} from './ConnectorArtifactWorkbench';

vi.mock('../components/workflow/EnterpriseArtifactWorkspace', () => ({
  EnterpriseArtifactWorkspace: () => null,
}));

async function runCollectionAndSubmit() {
  fireEvent.click(screen.getByRole('button', { name: /^Collect Evidence$/ }));
  await act(async () => {
    vi.advanceTimersByTime(15 * 400 + 100);
  });
  fireEvent.click(screen.getByRole('button', { name: /^Submit Evidence Pack$/ }));
  await act(async () => {
    vi.advanceTimersByTime(SUBMIT_TIMELINE_STEPS.length * 450 + 100);
  });
}

describe('ConnectorArtifactWorkbench submission persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps submission timeline visible after completion with completed title', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runCollectionAndSubmit();
    expect(screen.getByText('Evidence Pack Submission — Completed')).toBeTruthy();
    expect(screen.getByText('Packaging Evidence...')).toBeTruthy();
    expect(screen.getByText('Submitted Successfully.')).toBeTruthy();
  });

  it('marks all submission steps completed with elapsed labels', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runCollectionAndSubmit();
    expect(screen.getAllByTestId(/timeline-step-done-/).length).toBe(SUBMIT_TIMELINE_STEPS.length);
    expect(screen.getByText('0.45s')).toBeTruthy();
    expect(screen.getByText('0.35s')).toBeTruthy();
  });

  it('shows persistent final pack summary after submission', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runCollectionAndSubmit();
    expect(screen.getByText('EVP-2026-07-11-001')).toBeTruthy();
    expect(screen.getByText('Submitted for Auditor Review')).toBeTruthy();
    expect(screen.getByText('Enterprise Audit & Compliance Review Queue')).toBeTruthy();
    expect(screen.getByText(/Requirements · Design · Development/)).toBeTruthy();
  });

  it('does not clear completed state after additional elapsed time', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runCollectionAndSubmit();
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText('Evidence Pack Submission — Completed')).toBeTruthy();
    expect(screen.getByText('EVP-2026-07-11-001')).toBeTruthy();
  });

  it('resets submission workflow when Resubmit is clicked', async () => {
    render(<ConnectorArtifactWorkbench />);
    await runCollectionAndSubmit();
    fireEvent.click(screen.getByRole('button', { name: /^Resubmit$/ }));
    expect(screen.queryByText('Evidence Pack Submission — Completed')).toBeNull();
    expect(screen.queryByText('EVP-2026-07-11-001')).toBeNull();
  });

  it('resetSubmissionWorkflowState clears submission flags', () => {
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
    expect(setSubmitStepIndex).toHaveBeenCalledWith(-1);
    expect(setSubmission).toHaveBeenCalledWith(null);
  });
});
