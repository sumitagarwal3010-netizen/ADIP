// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AIWorkspacePanel } from './AIWorkspacePanel';
import { CopilotProvider } from '../../context/CopilotContext';
import { ArtifactsProvider } from '../../context/ArtifactsContext';

describe('AIWorkspacePanel', () => {
  it('starts with empty requirement textbox for ai-copilot', () => {
    render(
      <ArtifactsProvider>
        <CopilotProvider>
          <AIWorkspacePanel module="ai-copilot" />
        </CopilotProvider>
      </ArtifactsProvider>,
    );

    const textbox = screen.getByPlaceholderText(
      'e.g. Create BRD for UPI limit enhancement for KYC L2 customers',
    ) as HTMLInputElement;
    expect(textbox.value).toBe('');
  });

  it('shows explicit no-template state for unknown prompt', async () => {
    const user = userEvent.setup();
    render(
      <ArtifactsProvider>
        <CopilotProvider>
          <AIWorkspacePanel module="ai-copilot" />
        </CopilotProvider>
      </ArtifactsProvider>,
    );

    const textbox = screen.getByPlaceholderText(
      'e.g. Create BRD for UPI limit enhancement for KYC L2 customers',
    );
    await user.type(textbox, 'Build AI assistant for loan upsell journey');
    await user.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(
      await screen.findByText('No approved deterministic template exists for this request.'),
    ).toBeInTheDocument();
  });
});

