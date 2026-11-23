import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../redux/store";
import type { UserRole } from "../redux/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // super_admin has access to everything
  if (allowedRoles && user) {
    const isSuperAdmin = user.role === "super_admin";
    const hasRole = allowedRoles.includes(user.role);
    if (!isSuperAdmin && !hasRole) {
      return (
        <div className="container py-5 text-center">
          <div className="alert alert-danger shadow-sm mx-auto p-4" style={{ maxWidth: 500 }}>
            <h4 className="fw-bold mb-2">Access Denied</h4>
            <p className="mb-3 text-muted">
              Your account role (<strong>{user.role}</strong>) does not have permission to view this section.
            </p>
            <a href="/dashboard" className="btn btn-primary btn-sm">
              Return to Your Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
