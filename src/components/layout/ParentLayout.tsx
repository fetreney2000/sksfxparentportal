import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar, type NavItem } from "./AppSidebar";
import { useUIStore } from "@/stores/uiStore";
import { IdCard } from "lucide-react";
import { bm } from "@/lib/i18n";

const parentNav: NavItem[] = [
  { to: "/portal/delima-info", label: bm.nav.delimaInfo, icon: IdCard, end: true },
];

export function ParentLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <div className="flex min-h-svh w-full bg-background">
      <AppSidebar items={parentNav} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
