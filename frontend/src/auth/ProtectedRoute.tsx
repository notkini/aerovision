import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./AuthContext";


type ProtectedRouteProps = {
  allowedRoles?: string[];
};


export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    user,
    loading,
  } = useAuth();

  const location =
    useLocation();


  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-mark">
          AV
        </div>

        <p>Loading AeroVision...</p>
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return <Outlet />;
}