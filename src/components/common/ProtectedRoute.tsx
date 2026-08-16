import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  /** "guardian" = hanya ibu bapa; "admin" = hanya admin. "any" = sesiapa yang log masuk. */
  role?: "guardian" | "admin" | "any";
}

export function ProtectedRoute({ children, role = "any" }: ProtectedRouteProps) {
  const { status, session, isAdmin, isGuardian } = useAuthStore();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated" || !session?.role) {
    const redirectTo = role === "admin" ? "/admin/login" : "/login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role === "admin" && !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role === "guardian" && !isGuardian()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
