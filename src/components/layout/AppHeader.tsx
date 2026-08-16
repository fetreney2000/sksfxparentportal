import { LogOut, Menu, User as UserIcon } from "lucide-react";
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
import { useAdminAuth } from "@/features/auth/admin/useAdminAuth";
import { useParentAuth } from "@/features/auth/parent/useParentAuth";
import { bm } from "@/lib/i18n";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, isAdmin } = useAuthStore();
  const admin = useAdminAuth();
  const parent = useParentAuth();

  const logout = isAdmin() ? admin.logout : parent.logout;
  const email = user?.email ?? "";

  const initials = email.slice(0, 2).toUpperCase() || "SFX";

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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-black text-primary-foreground">
          SFXK
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            SK ST. FRANCIS XAVIER KENINGAU
          </p>
          <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            {bm.app.shortName}
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
                {isAdmin() ? "Pentadbir" : "Ibu Bapa / Penjaga"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
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
