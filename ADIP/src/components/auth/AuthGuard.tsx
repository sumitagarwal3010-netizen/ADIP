import { Outlet } from 'react-router-dom';

/**
 * DEMO MODE route guard.
 *
 * Authentication is disabled — every route loads without a login. This guard
 * is intentionally a pass-through (equivalent to `return true`). Do not
 * reintroduce token/session checks here.
 */
export function AuthGuard() {
  return <Outlet />;
}
