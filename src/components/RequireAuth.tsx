import { Navigate, Outlet, useLocation } from 'react-router';

// extras
import { useAuth } from '../features/auth/useAuth';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
