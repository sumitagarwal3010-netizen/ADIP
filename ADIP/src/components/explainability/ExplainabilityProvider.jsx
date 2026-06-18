/**
 * ExplainabilityProvider
 *
 * App-level provider that exposes `openExplainability(ctx)` to every KPI card and
 * renders a single shared KPIExplainabilityDrawer. The provider itself holds only
 * the lightweight card context (so it does not re-render the whole app on each
 * simulation tick); the drawer reads live simulation state and computes the model.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { KPIExplainabilityDrawer } from './KPIExplainabilityDrawer.jsx';

const ExplainabilityContext = createContext(null);

const NOOP = {
  openExplainability: () => {},
  closeExplainability: () => {},
};

export function ExplainabilityProvider({ children }) {
  const [ctx, setCtx] = useState(null);

  const openExplainability = useCallback((kpiContext) => {
    if (!kpiContext) return;
    setCtx(kpiContext);
  }, []);

  const closeExplainability = useCallback(() => setCtx(null), []);

  return (
    <ExplainabilityContext.Provider value={{ openExplainability, closeExplainability }}>
      {children}
      <KPIExplainabilityDrawer ctx={ctx} onClose={closeExplainability} />
    </ExplainabilityContext.Provider>
  );
}

export function useExplainability() {
  const value = useContext(ExplainabilityContext);
  // Graceful no-op if a card is rendered outside the provider — never crash.
  return value || NOOP;
}
