import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  /** "parent" = hanya ibu bapa; "admin" = hanya admin. "any" = sesiapa yang log masuk. */
  role?: "parent" | "admin" | "any";
}

export function ProtectedRoute({ children, role = "any" }: ProtectedRouteProps) {
  const { status, role: userRole, isAdmin, isParent } = useAuthStore();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated" || !userRole) {
    const redirectTo = role === "admin" ? "/admin/login" : "/login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role === "admin" && !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role === "parent" && !isParent()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
