import { Routes, Route, Navigate } from "react-router-dom";
import { bm } from "@/lib/i18n";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
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
      {/* Default route — pilih role */}
      <Route path="/" element={<RoleSelectPage />} />
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
        <Route path="import-history" element={<ImportHistoryPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function RoleSelectPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-accent/30 p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 w-28 rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5">
          <img
            src="/logo.png"
            alt={bm.app.name}
            draggable={false}
            className="mx-auto h-full w-full object-contain"
          />
        </div>
        <h1 className="text-xl font-bold">{bm.app.name}</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {bm.app.tagline}
        </p>
        <p className="mx-auto mt-1 text-xs font-medium text-muted-foreground/70">
          SK St. Francis Xavier Keningau
        </p>
      </div>
      <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
        <a
          href="/login"
          className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-base font-semibold">Ibu Bapa / Penjaga</p>
          <p className="text-xs text-muted-foreground">
            Log masuk dengan ID DELIMA anak anda
          </p>
        </a>
        <a
          href="/admin/login"
          className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-base font-semibold">Pentadbir</p>
          <p className="text-xs text-muted-foreground">
            Log masuk dengan nama pengguna
          </p>
        </a>
      </div>

      <p className="mx-auto mt-8 max-w-md text-center text-[10px] leading-relaxed text-muted-foreground">
        {bm.app.disclaimer}
      </p>
    </div>
  );
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
