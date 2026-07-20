import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RequireRole({ role }: { role: "parent" | "teacher" }) {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (!profile) return <Navigate to="/login" replace />;

  if (profile.role !== role) {
    const dest = profile.role === "parent" ? "/parent/dashboard" : "/teacher/dashboard";
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
