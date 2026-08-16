import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/types";

export function ProtectedRoute({
  role,
  children,
}: {
  role: Role | Role[];
  children: React.ReactNode;
}) {
  const { auth } = useAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!auth || !allowedRoles.includes(auth.role)) {
    return <Navigate to="/kirish" replace />;
  }
  return <>{children}</>;
}
