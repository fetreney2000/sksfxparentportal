import { useGuardianStudent } from "../queries";
import { DelimaCard } from "./DelimaCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { bm } from "@/lib/i18n";
import { User } from "lucide-react";

export function ParentDelimaPage() {
  const { data, isLoading, isError, refetch } = useGuardianStudent();
  const session = useAuthStore((s) => s.session);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Ralat"
        description="Tidak dapat memuatkan maklumat pelajar."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{bm.delima.moduleName}</h1>
        <p className="text-sm text-muted-foreground">
          ID DELIMA: {session?.delimaId ?? "-"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> {bm.delima.myChildren}
          </CardTitle>
          <CardDescription>
            Maklumat anak jagaan anda yang berdaftar dengan ID DELIMA ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="grid gap-3 sm:grid-cols-1">
              <DelimaCard student={data} />
            </div>
          ) : (
            <EmptyState
              title={bm.delima.noChildren}
              description="Hubungi pihak sekolah untuk mengemaskini rekod."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
