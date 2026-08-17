import { Routes, Route, Navigate } from "react-router-dom";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { ParentLoginPage } from "@/features/auth/parent/ParentLoginPage";
import { AdminLoginPage } from "@/features/auth/admin/AdminLoginPage";
import { AdminSettingsPage } from "@/features/auth/admin/AdminSettingsPage";
import { ParentDelimaPage } from "@/features/delima-info/parent/ParentDelimaPage";
import { AdminDelimaListPage } from "@/features/delima-info/admin/AdminDelimaListPage";
import { AdminDashboardPage } from "@/features/delima-info/admin/AdminDashboardPage";
import { ImportHistoryPage } from "@/features/delima-info/admin/ImportHistoryPage";

export function AppRouter() {
  return (
    <Routes>
      {/* Akar — alihkan automatik mengikut status log masuk */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<ParentLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/portal"
        element={
          <ProtectedRoute role="guardian">
            <ParentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="delima-info" replace />} />
        <Route path="delima-info" element={<ParentDelimaPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="delima-info" element={<AdminDelimaListPage />} />
        <Route
          path="import-history"
          element={
            <ProtectedRoute role="admin" full>
              <ImportHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute role="admin" full>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/**
 * Alihan akar: pengguna yang log masuk terus ke portal masing-masing,
 * pelawat dihantar ke halaman log masuk ibu bapa.
 */
function RootRedirect() {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.session?.role);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (role === "admin" || role === "viewer") {
    return <Navigate to="/admin/delima-info" replace />;
  }
  if (role === "guardian") {
    return <Navigate to="/portal/delima-info" replace />;
  }
  return <Navigate to="/login" replace />;
}

function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-6xl font-black text-muted-foreground">404</p>
      <p className="text-lg font-semibold">Halaman tidak dijumpai</p>
      <a href="/" className="text-sm text-primary hover:underline">
        Kembali ke halaman utama
      </a>
    </div>
  );
}