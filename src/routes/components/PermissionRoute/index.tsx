import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../../contexts/Auth/useAuth';
import { getFirstAccessiblePath, hasPermission } from '../../../navigation/access';

interface PermissionRouteProps {
  permission: string;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    return <Navigate to={getFirstAccessiblePath(user)} replace />;
  }

  return <Outlet />;
}
