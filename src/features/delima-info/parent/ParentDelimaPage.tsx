import { useDelimaChildren } from "../queries";
import { DelimaCard } from "./DelimaCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { bm } from "@/lib/i18n";
import { Users } from "lucide-react";

export function ParentDelimaPage() {
  const { data, isLoading, isError, refetch } = useDelimaChildren();
  const user = useAuthStore((s) => s.user);

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

  const list = data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{bm.delima.moduleName}</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> {bm.delima.myChildren}
          </CardTitle>
          <CardDescription>
            Senarai anak jagaan anda yang berdaftar dengan sekolah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <EmptyState
              title={bm.delima.noChildren}
              description="Hubungi pihak sekolah untuk mengemas kini rekod."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((s) => (
                <DelimaCard key={s.id} student={s} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
