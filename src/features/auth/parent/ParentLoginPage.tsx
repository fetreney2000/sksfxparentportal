import { useState } from "react";
import { useParentAuth } from "./useParentAuth";
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
import { Loader2, IdCard } from "lucide-react";
import { bm } from "@/lib/i18n";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export function ParentLoginPage() {
  const { login, isLoading, error } = useParentAuth();
  const [delimaId, setDelimaId] = useState("");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-accent/30 p-4">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-md">
          SFXK
        </div>
        <h1 className="text-lg font-bold tracking-tight">{bm.app.name}</h1>
        <p className="text-xs text-muted-foreground">{bm.app.tagline}</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{bm.auth.welcome}</CardTitle>
          <CardDescription>
            Masukkan ID DELIMA anak jagaan anda untuk melihat maklumat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <Alert className="mb-4 border-amber-500/30 bg-amber-50 text-amber-900" variant="warning">
              <AlertDescription className="text-xs">
                Supabase belum dikonfigurasi. Sila tetapkan{" "}
                <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>{" "}
                dalam fail <code>.env</code>.
              </AlertDescription>
            </Alert>
          )}

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login(delimaId);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="delima_id">{bm.delima.delimaId}</Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="delima_id"
                  type="text"
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  value={delimaId}
                  onChange={(e) => setDelimaId(e.target.value.trim())}
                  placeholder="cth. m-15247730@moe-dl.edu.my"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ID DELIMA anda tercetak pada surat/borang yang dihantar oleh pihak sekolah.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !delimaId}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sedang...
                </>
              ) : (
                "Masuk Portal"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Tiada akaun? Hubungi pihak sekolah untuk mendapatkan ID DELIMA anak anda.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
