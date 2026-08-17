import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar, type NavItem } from "./AppSidebar";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { IdCard, History, LayoutDashboard, Settings } from "lucide-react";
import { bm } from "@/lib/i18n";

export function AdminLayout() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  // Penonton hanya melihat Papan Pemuka & Informasi ID DELIMA
  const adminNav: NavItem[] = [
    { to: "/admin", label: bm.nav.dashboard, icon: LayoutDashboard, end: true },
    { to: "/admin/delima-info", label: bm.nav.delimaInfo, icon: IdCard, end: true },
    ...(isAdmin()
      ? [
          { to: "/admin/import-history", label: bm.nav.importHistory, icon: History, end: true },
          { to: "/admin/settings", label: bm.nav.settings, icon: Settings, end: true },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-svh w-full bg-background">
      <AppSidebar items={adminNav} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
