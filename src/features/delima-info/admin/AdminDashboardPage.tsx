import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IdCard, Users, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useDelimaList } from "../queries";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { bm } from "@/lib/i18n";

export function AdminDashboardPage() {
  const { data, isLoading } = useDelimaList();
  const list = data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{bm.nav.dashboard}</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan maklumat portal DELIMA.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <Link to="/admin/delima-info" className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {bm.common.totalRecords}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{list.length}</div>
                <CardDescription>Pelajar berdaftar</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/import-history" className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {bm.nav.importHistory}
                </CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <IdCard className="inline h-5 w-5 text-primary" />
                </div>
                <CardDescription>Lihat log import</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
