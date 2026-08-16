import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useImportLogs } from "../queries";
import { bm } from "@/lib/i18n";
import { formatDateTimeKL } from "@/lib/date";

export function ImportHistoryPage() {
  const { data, isLoading, isError, refetch } = useImportLogs();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ErrorState
        title="Ralat"
        description="Tidak dapat memuatkan sejarah import."
        onRetry={() => refetch()}
      />
    );

  const list = data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{bm.delima.historyTitle}</h1>
        <p className="text-sm text-muted-foreground">
          Senarai aktiviti import fail Excel yang telah dijalankan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Import</CardTitle>
          <CardDescription>
            {list.length} rekod dipaparkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <EmptyState
              title={bm.delima.historyEmpty}
              description="Tiada aktiviti import setakat ini."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{bm.delima.importedAt}</TableHead>
                  <TableHead>{bm.delima.fileName}</TableHead>
                  <TableHead className="text-right">Jumlah Baris</TableHead>
                  <TableHead className="text-right">Berjaya</TableHead>
                  <TableHead className="text-right">Gagal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">
                      {formatDateTimeKL(r.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.filename ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">{r.total_rows ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="success">{r.success_rows ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          (r.failed_rows ?? 0) > 0 ? "destructive" : "secondary"
                        }
                      >
                        {r.failed_rows ?? 0}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
