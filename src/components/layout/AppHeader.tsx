import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { signOut } from "@/features/auth/api";
import { BrandLogo } from "@/components/common/BrandLogo";
import { bm } from "@/lib/i18n";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { session, isAdmin, isStaff, isGuardian } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    signOut();
    const target = isStaff() ? "/admin/login" : "/login";
    navigate(target, { replace: true });
  };

  const identity = isStaff()
    ? session?.username ?? "Pentadbir"
    : session?.delimaId ?? "Ibu Bapa";

  const initials = identity.slice(0, 2).toUpperCase() || "SFX";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <BrandLogo size="h-9 w-9" className="rounded-md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {bm.app.name}
          </p>
          <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            SK St. Francis Xavier Keningau
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Profil">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {isGuardian()
                  ? "Ibu Bapa / Penjaga"
                  : isAdmin()
                  ? "Pentadbir"
                  : "Penonton (Baca Sahaja)"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {isGuardian() ? `ID: ${identity}` : identity}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate(location.pathname)}
            disabled
          >
            <UserIcon className="h-4 w-4" /> {bm.nav.profile}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> {bm.auth.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
