import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RequireGuest() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  if (session && profile) {
    const dest = profile.role === "parent" ? "/parent/dashboard" : "/teacher/dashboard";
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
