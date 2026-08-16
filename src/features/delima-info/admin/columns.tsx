import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DelimaRow } from "../queries";
import { bm } from "@/lib/i18n";

interface CreateColumnsArgs {
  onEdit: (row: DelimaRow) => void;
  onDelete: (row: DelimaRow) => void;
}

function PasswordCell({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
        {show ? value : "••••••••"}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? bm.delima.hidePassword : bm.delima.showPassword}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

export function createDelimaColumns({
  onEdit,
  onDelete,
}: CreateColumnsArgs): ColumnDef<DelimaRow>[] {
  return [
    {
      accessorKey: "delima_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {bm.delima.delimaId}
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <code className="text-xs font-mono">{row.getValue("delima_id")}</code>
      ),
    },
    {
      accessorKey: "nama",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {bm.delima.studentName}
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("nama")}</span>,
    },
    {
      accessorKey: "tahun",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {bm.delima.year}
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("tahun")}</Badge>,
    },
    {
      accessorKey: "kelas",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {bm.delima.class}
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="outline">{row.getValue("kelas")}</Badge>,
    },
    {
      accessorKey: "kata_laluan",
      header: bm.delima.delimaPassword,
      cell: ({ row }) => <PasswordCell value={row.getValue("kata_laluan")} />,
      enableSorting: false,
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">{bm.common.actions}</span>,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={bm.common.actions}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{bm.common.actions}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(r)}>
                <Pencil className="h-4 w-4" /> {bm.common.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(r)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> {bm.common.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
