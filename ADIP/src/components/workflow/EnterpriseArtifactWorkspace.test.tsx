import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { EnterpriseArtifactWorkspace } from './EnterpriseArtifactWorkspace';
import {
  generateDeterministicArtifacts,
  getPageById,
  getPromptsForPage,
} from '../../data/enterpriseArtifactCatalog';

const recordArtifacts = vi.fn();
const updateArtifact = vi.fn();
const closeAdvisor = vi.fn();

vi.mock('../../context/ArtifactsContext', () => ({
  useArtifactsRegistry: () => ({
    artifacts: [],
    recordArtifacts,
    updateArtifact,
    clear: vi.fn(),
  }),
}));

vi.mock('../../context/AIAdvisorContext', () => ({
  useAIAdvisor: () => ({
    isOpen: true,
    setIsOpen: vi.fn(),
    closeAdvisor,
  }),
}));

describe('enterpriseArtifactCatalog', () => {
  it('resolves PAGE-EXE-ADV with six prompts', () => {
    const page = getPageById('PAGE-EXE-ADV');
    expect(page?.submenu).toBe('Executive Advisor');
    expect(getPromptsForPage('PAGE-EXE-ADV')).toHaveLength(6);
  });

  it('generates deterministic artifacts with Pending Review', () => {
    const artifacts = generateDeterministicArtifacts('PR-001');
    expect(artifacts.length).toBeGreaterThan(0);
    expect(artifacts[0].id).toBe('AR-001');
    expect(artifacts[0].approvalStatus).toBe('Pending Review');
    expect(artifacts[0].modelUsed).toBe('Not applicable');
  });
});

describe('EnterpriseArtifactWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders executive advisor workspace and generates on prompt select', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Executive Advisor')).toBeTruthy();
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    expect(screen.getByText(/AR-001/)).toBeTruthy();
    expect(screen.getAllByText('Pending Review').length).toBeGreaterThan(0);
  });

  it('approves artifact and updates registry', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    fireEvent.click(screen.getAllByRole('button', { name: /^Approve$/ })[0]);
    fireEvent.click(screen.getByText('Confirm Approve'));
    expect(updateArtifact).toHaveBeenCalledWith('AR-001', { approvalStatus: 'Approved' });
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
  });

  it('requires non-empty reason to reject', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    fireEvent.click(screen.getAllByRole('button', { name: /^Reject$/ })[0]);
    fireEvent.click(screen.getByText('Confirm Reject'));
    expect(updateArtifact).not.toHaveBeenCalled();
    expect(screen.getByText(/Rejection requires a non-empty reason/)).toBeTruthy();
    expect(screen.getAllByText('Pending Review').length).toBeGreaterThan(0);
  });

  it('rejects with reason and updates registry', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    fireEvent.click(screen.getAllByRole('button', { name: /^Reject$/ })[0]);
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'Incomplete evidence pack' } });
    fireEvent.click(screen.getByText('Confirm Reject'));
    expect(updateArtifact).toHaveBeenCalledWith('AR-001', { approvalStatus: 'Rejected' });
    expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
  });

  it('renders compact View action near artifact title', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    expect(screen.getAllByRole('button', { name: /^View$/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /^Preview$/ }).length).toBeGreaterThan(0);
  });

  it('closes AI Advisor when Preview is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    fireEvent.click(screen.getAllByRole('button', { name: /^Preview$/ })[0]);
    expect(closeAdvisor).toHaveBeenCalled();
  });

  it('closes AI Advisor when Approve is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/executive-ai/executive-advisor']}>
        <EnterpriseArtifactWorkspace pageId="PAGE-EXE-ADV" />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Today's CIO Briefing"));
    fireEvent.click(screen.getByText('Generate artifacts'));
    fireEvent.click(screen.getAllByRole('button', { name: /^Approve$/ })[0]);
    expect(closeAdvisor).toHaveBeenCalled();
  });
});
