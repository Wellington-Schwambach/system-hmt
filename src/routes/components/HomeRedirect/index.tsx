import { Navigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/Auth/useAuth';
import { getFirstAccessiblePath } from '../../../navigation/access';

export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getFirstAccessiblePath(user)} replace />;
}
