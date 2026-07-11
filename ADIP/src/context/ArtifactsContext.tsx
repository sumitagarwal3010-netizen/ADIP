import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Artifact } from '../types/artifacts';

/**
 * Global Artifacts Registry
 * ---------------------------------------------------------------
 * A single in-memory registry of every AI-generated artifact across
 * every hub/center. Both the {@link HubArtifactGenerator} and the
 * {@link CopilotSection} push into this registry whenever a generation
 * completes, so the {@link UniversalArtifactsRepository} page can show
 * a single, searchable, downloadable executive view.
 *
 * The registry is intentionally session-scoped (no persistence) — the
 * platform is a demo and the repository should reset between user sessions.
 */

interface ArtifactsContextValue {
  artifacts: Artifact[];
  /** Append one or more artifacts. Duplicates by id are silently ignored. */
  recordArtifacts: (artifacts: Artifact[]) => void;
  /** Update approval status (or other fields) for a registered artifact by id. */
  updateArtifact: (id: string, updates: Partial<Pick<Artifact, 'approvalStatus'>>) => void;
  /** Wipe the registry (used by the page-level "Clear" affordance). */
  clear: () => void;
}

const ArtifactsContext = createContext<ArtifactsContextValue | null>(null);

export function ArtifactsProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const recordArtifacts = useCallback((next: Artifact[]) => {
    if (!next || next.length === 0) return;
    setArtifacts((prev) => {
      const seen = new Set(prev.map((a) => a.id));
      const filtered = next.filter((a) => !seen.has(a.id));
      if (filtered.length === 0) return prev;
      return [...filtered, ...prev];
    });
  }, []);

  const updateArtifact = useCallback((id: string, updates: Partial<Pick<Artifact, 'approvalStatus'>>) => {
    setArtifacts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }, []);

  const clear = useCallback(() => setArtifacts([]), []);

  const value = useMemo(
    () => ({ artifacts, recordArtifacts, updateArtifact, clear }),
    [artifacts, recordArtifacts, updateArtifact, clear],
  );

  return <ArtifactsContext.Provider value={value}>{children}</ArtifactsContext.Provider>;
}

export function useArtifactsRegistry(): ArtifactsContextValue {
  const ctx = useContext(ArtifactsContext);
  if (!ctx) {
    // Soft fallback so isolated components (e.g. tests) can still render.
    return {
      artifacts: [],
      recordArtifacts: () => undefined,
      updateArtifact: () => undefined,
      clear: () => undefined,
    };
  }
  return ctx;
}
