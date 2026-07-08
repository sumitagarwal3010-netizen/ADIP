/**
 * Orchestrator streaming hook — polls backend job status in backend mode (Role 8).
 * Falls back to mock progress simulation when mock mode is active.
 */
import { useCallback, useState } from 'react';
import { adipSdk } from '../adipSdk';

export function useOrchestratorStream() {
  const [chunks, setChunks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);
    setChunks([]);
    try {
      if (!adipSdk.isBackendMode) {
        const mockSteps = [
          'Classifying prompt…',
          'Planning SDLC phases…',
          'Generating artifacts…',
          'Complete.',
        ];
        for (const step of mockSteps) {
          setChunks((prev) => [...prev, step]);
          await new Promise((r) => setTimeout(r, 400));
        }
        setLoading(false);
        return;
      }
      const result = await adipSdk.orchestrate(prompt);
      setChunks([JSON.stringify(result).slice(0, 240)]);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, []);

  return { chunks, loading, error, run };
}
