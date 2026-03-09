import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  if (loading) {
    return <LoadingSpinner fullScreen size="lg" />;
  }
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }
  if (requiredRole && user?.accountType !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
