import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { getAuthSession, type UserRole } from '../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const session = getAuthSession();
  const location = useLocation();

  if (!session) {
    // Redirect to login if not authenticated
    // For admin routes, we might want to redirect to /admin-login
    const isAdminRoute = location.pathname.startsWith('/admin');
    return <Navigate to={isAdminRoute ? "/admin-login" : "/login"} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    // Redirect to their specific dashboard if they don't have permission
    switch (session.user.role) {
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'patient':
        return <Navigate to="/patient-dashboard" replace />;
      case 'donor':
        return <Navigate to="/donor-dashboard" replace />;
      case 'organization':
        return <Navigate to="/organization-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
