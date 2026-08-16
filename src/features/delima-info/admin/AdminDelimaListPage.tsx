import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Combobox } from "@/components/ui/combobox";
import { bm } from "@/lib/i18n";
import { createDelimaColumns } from "./columns";
import { useDeleteDelima, useDelimaList, type DelimaRow } from "../queries";
import { DelimaFormDialog } from "./DelimaFormDialog";
import { DelimaImportDialog } from "./DelimaImportDialog";

export function AdminDelimaListPage() {
  const { data, isLoading, isError, refetch } = useDelimaList();
  const deleteMut = useDeleteDelima();

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<DelimaRow | null>(null);
  const [toDelete, setToDelete] = useState<DelimaRow | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const rows = data ?? [];

  // Pilihan dinamik untuk filter tahun & kelas
  const tahunOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.tahun).filter(Boolean)))
        .sort()
        .map((v) => ({ value: v, label: v })),
    [rows]
  );
  const kelasOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.kelas).filter(Boolean)))
        .sort()
        .map((v) => ({ value: v, label: v })),
    [rows]
  );

  const columns = useMemo(
    () =>
      createDelimaColumns({
        onEdit: (r) => {
          setEditing(r);
          setFormOpen(true);
        },
        onDelete: (r) => setToDelete(r),
      }),
    []
  );

  const filteredRows = useMemo(() => {
    let r = rows;
    const tahun = (columnFilters.find((f) => f.id === "tahun")?.value as string) ?? "";
    const kelas = (columnFilters.find((f) => f.id === "kelas")?.value as string) ?? "";
    if (tahun) r = r.filter((x) => x.tahun === tahun);
    if (kelas) r = r.filter((x) => x.kelas === kelas);
    return r;
  }, [rows, columnFilters]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
    globalFilterFn: (row: { original: DelimaRow }, _columnId: string, filterValue: unknown) => {
      const q = String(filterValue ?? "").toLowerCase();
      if (!q) return true;
      return (
        row.original.nama.toLowerCase().includes(q) ||
        row.original.delima_id.toLowerCase().includes(q)
      );
    },
  });

  const handleDelete = async () => {
    if (!toDelete || !toDelete.id) return;
    const id = toDelete.id;
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Rekod DELIMA berjaya dipadam.");
      setToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memadam rekod.");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ErrorState
        title="Ralat"
        description="Tidak dapat memuatkan data DELIMA."
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{bm.delima.moduleName}</h1>
          <p className="text-sm text-muted-foreground">
            Urus maklumat ID DELIMA pelajar. Jumlah: {rows.length} rekod.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <FileSpreadsheet className="h-4 w-4" /> {bm.common.import}
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> {bm.common.add}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Senarai Pelajar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={bm.common.search + "..."}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Combobox
              value={
                (columnFilters.find((f) => f.id === "tahun")?.value as string) ?? ""
              }
              onChange={(v) => {
                setColumnFilters((prev) => {
                  const others = prev.filter((f) => f.id !== "tahun");
                  return v ? [...others, { id: "tahun", value: v }] : others;
                });
              }}
              options={tahunOptions}
              placeholder="Tapis Tahun"
            />
            <Combobox
              value={
                (columnFilters.find((f) => f.id === "kelas")?.value as string) ?? ""
              }
              onChange={(v) => {
                setColumnFilters((prev) => {
                  const others = prev.filter((f) => f.id !== "kelas");
                  return v ? [...others, { id: "kelas", value: v }] : others;
                });
              }}
              options={kelasOptions}
              placeholder="Tapis Kelas"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <EmptyState
                        title={bm.common.noData}
                        description="Cuba ubah carian atau tapis anda."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              {bm.common.showing}{" "}
              <span className="font-medium">
                {table.getRowModel().rows.length}
              </span>{" "}
              {bm.common.of} <span className="font-medium">{filteredRows.length}</span>{" "}
              rekod
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger className="h-8 w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s} / halaman
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs">
                Halaman {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DelimaFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing}
      />

      <DelimaImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Padam rekod DELIMA?"
        description={
          toDelete ? (
            <div className="space-y-1">
              <p>
                Anda akan memadam rekod untuk: <strong>{toDelete.nama}</strong> (ID:{" "}
                <code className="text-xs">{toDelete.delima_id}</code>).
              </p>
              <p className="text-destructive">{bm.common.cannotBeUndone}.</p>
            </div>
          ) : null
        }
        confirmText={bm.common.delete}
        cancelText={bm.common.cancel}
        destructive
        onConfirm={handleDelete}
        trigger={<span className="hidden" />}
      />
    </div>
  );
}
