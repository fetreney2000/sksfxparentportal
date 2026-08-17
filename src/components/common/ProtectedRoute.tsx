import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  /** "guardian" = ibu bapa; "admin" = mana-mana akaun staf admin; "any" = sesiapa yang log masuk. */
  role?: "guardian" | "admin" | "any";
  /** Untuk "admin": true bermakna memerlukan pentadbir PENUH (peranan 'admin'). */
  full?: boolean;
}

export function ProtectedRoute({ children, role = "any", full = false }: ProtectedRouteProps) {
  const { status, session, isAdmin, isStaff, isGuardian } = useAuthStore();
  const location = useLocation();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated" || !session?.role) {
    const redirectTo = role === "admin" ? "/admin/login" : "/login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role === "admin") {
    if (!isStaff()) {
      return <Navigate to="/admin/login" replace />;
    }
    // Laluan penuh sahaja (Tetapan / Sejarah Import) — penonton dialih ke senarai DELIMA
    if (full && !isAdmin()) {
      return <Navigate to="/admin/delima-info" replace />;
    }
  }
  if (role === "guardian" && !isGuardian()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
