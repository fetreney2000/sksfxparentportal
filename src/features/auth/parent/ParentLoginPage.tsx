import { useState } from "react";
import { useParentAuth } from "./useParentAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { bm } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ParentLoginPage() {
  const {
    step,
    email,
    isLoading,
    error,
    setEmail,
    sendOtp,
    verifyOtp,
    resendOtp,
    back,
  } = useParentAuth();

  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-accent/30 p-4">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-md">
          SFXK
        </div>
        <h1 className="text-lg font-bold tracking-tight">
          {bm.app.name}
        </h1>
        <p className="text-xs text-muted-foreground">{bm.app.tagline}</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{bm.auth.welcome}</CardTitle>
          <CardDescription>
            {step === "email" ? bm.auth.parentLoginSubtitle : bm.auth.otpSent}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <Alert className="mb-4 border-amber-500/30 bg-amber-50 text-amber-900">
              <AlertDescription className="text-xs">
                Supabase belum dikonfigurasi. Sila tetapkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> dalam fail <code>.env</code>.
              </AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                sendOtp(String(fd.get("email") ?? ""));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{bm.auth.email}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="contoh@emel.com"
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Sedang Menghantar...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> {bm.auth.sendOtp}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {bm.auth.parentLoginFooter}
              </p>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtp(code);
              }}
              className="space-y-4"
            >
              <div className="rounded-md bg-muted px-3 py-2 text-center text-sm">
                <span className="text-muted-foreground">Kod dihantar ke: </span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">{bm.auth.enterCode}</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="pl-9 text-center text-lg tracking-[0.5em] font-mono"
                    placeholder="••••••"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sedang Mengesahkan...
                  </>
                ) : (
                  bm.auth.verify
                )}
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" /> {bm.auth.backToEmail}
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  {bm.auth.resendCode}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
