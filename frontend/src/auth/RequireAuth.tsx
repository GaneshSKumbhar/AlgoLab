import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const location = useLocation();
  return authenticated ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
