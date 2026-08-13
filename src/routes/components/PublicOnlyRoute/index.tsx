import { Navigate, Outlet } from 'react-router-dom';

import { PageLoader } from '../../../components/PageLoader';
import { useAuth } from '../../../contexts/Auth/useAuth';
import { getFirstAccessiblePath } from '../../../navigation/access';

export function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={getFirstAccessiblePath(user)} replace />;
  }

  return <Outlet />;
}
