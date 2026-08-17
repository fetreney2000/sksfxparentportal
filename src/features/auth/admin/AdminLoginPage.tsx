import { useState } from "react";
import { useAdminAuth } from "./useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, User, Lock } from "lucide-react";
import { bm } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { PasswordInput } from "@/components/common/PasswordInput";
export function AdminLoginPage() {
  const { login, isLoading, error } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-accent/30 p-4">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 w-24 rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5">
          <img
            src="/logo.png"
            alt={bm.app.name}
            draggable={false}
            className="mx-auto h-full w-full object-contain"
          />
        </div>
        <h1 className="text-lg font-bold tracking-tight">{bm.app.name}</h1>
        <p className="text-xs text-muted-foreground">{bm.app.tagline}</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Pentadbir · {bm.auth.login}</CardTitle>
          <CardDescription>{bm.auth.adminLoginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <Alert className="mb-4 border-amber-500/30 bg-amber-50 text-amber-900" variant="warning">
              <AlertDescription className="text-xs">
                Supabase belum dikonfigurasi. Sila tetapkan env vars dalam <code>.env</code>.
              </AlertDescription>
            </Alert>
          )}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login(username, password);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">{bm.auth.username}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{bm.auth.password}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sedang...
                </>
              ) : (
                bm.auth.login
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mx-auto mt-6 max-w-md text-center text-[10px] leading-relaxed text-muted-foreground">
        {bm.app.disclaimer}
      </p>
    </div>
  );
}
