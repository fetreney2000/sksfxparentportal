import { NavLink, type NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/common/BrandLogo";
import { bm } from "@/lib/i18n";
import type { ComponentType } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

interface AppSidebarProps {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ items, open, onClose }: AppSidebarProps) {
  return (
    <>
      {/* Overlay untuk mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo size="h-8 w-8" className="rounded-md" />
            <p className="truncate text-sm font-semibold">{bm.app.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => (
            <SidebarLink key={item.to} item={item} onNavigate={onClose} />
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-[10px] text-muted-foreground">
          <p>© {new Date().getFullYear()} SK St. Francis Xavier Keningau</p>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const navProps: NavLinkProps = {
    to: item.to,
    end: item.end,
    onClick: onNavigate,
    className: ({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      ),
  };
  return (
    <NavLink {...navProps}>
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </NavLink>
  );
}
