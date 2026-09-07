import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { ranger, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  // Auth state is still being verified (e.g. /auth/me on page refresh).
  // Hold the splash instead of flashing the app or bouncing to login early.
  if (loading) {
    return <div className="text-center py-10">Verifying session...</div>;
  }

  // No (or rejected) token -> login first, remembering where we came from
  // so Login can send the user back after signing in.
  if (!token || !ranger) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
