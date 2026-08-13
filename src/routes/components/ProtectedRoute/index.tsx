import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '../../../components/PageLoader';
import { useAuth } from '../../../contexts/Auth/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, refreshUser } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      void refreshUser();
    }
  }, [isAuthenticated, isBootstrapping, location.pathname, refreshUser]);

  if (isBootstrapping) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
