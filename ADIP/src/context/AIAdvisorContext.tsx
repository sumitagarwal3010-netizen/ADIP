import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface AIAdvisorContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeAdvisor: () => void;
}

const AIAdvisorContext = createContext<AIAdvisorContextValue | null>(null);

export function AIAdvisorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const closeAdvisor = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, setIsOpen, closeAdvisor }),
    [isOpen, closeAdvisor],
  );

  return <AIAdvisorContext.Provider value={value}>{children}</AIAdvisorContext.Provider>;
}

export function useAIAdvisor(): AIAdvisorContextValue {
  const ctx = useContext(AIAdvisorContext);
  if (!ctx) {
    return {
      isOpen: true,
      setIsOpen: () => undefined,
      closeAdvisor: () => undefined,
    };
  }
  return ctx;
}
