import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../../contexts/Auth/useAuth';

export function AdministratorRoute() {
  const { user } = useAuth();

  if (user?.role.toLowerCase() !== 'administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
