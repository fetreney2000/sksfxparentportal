import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  batchUpsertDelima,
  checkDelimaIdExists,
  createDelima,
  deleteDelima,
  fetchAllDelima,
  fetchChildrenForCurrentGuardian,
  fetchExistingDelimaIds,
  fetchImportLogs,
  logImport,
  updateDelima,
  type DelimaRow,
} from "./api";
import type { DelimaFormValues } from "./types";

export const delimaKeys = {
  all: ["delima"] as const,
  list: () => [...delimaKeys.all, "list"] as const,
  children: () => [...delimaKeys.all, "children"] as const,
  importLogs: () => [...delimaKeys.all, "import-logs"] as const,
};

export function useDelimaList() {
  return useQuery({
    queryKey: delimaKeys.list(),
    queryFn: fetchAllDelima,
  });
}

export function useDelimaChildren() {
  return useQuery({
    queryKey: delimaKeys.children(),
    queryFn: fetchChildrenForCurrentGuardian,
  });
}

export function useCreateDelima() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: DelimaFormValues) => createDelima(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: delimaKeys.all });
    },
  });
}

export function useUpdateDelima() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: DelimaFormValues }) =>
      updateDelima(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: delimaKeys.all });
    },
  });
}

export function useDeleteDelima() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDelima(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: delimaKeys.all });
    },
  });
}

export function useCheckDelimaId() {
  return useMutation({
    mutationFn: ({ delimaId, excludeId }: { delimaId: string; excludeId?: string }) =>
      checkDelimaIdExists(delimaId, excludeId),
  });
}

export function useBatchUpsertDelima() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      rows,
      conflictStrategy,
    }: {
      rows: DelimaFormValues[];
      conflictStrategy: "upsert" | "skip";
    }) => batchUpsertDelima(rows, conflictStrategy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: delimaKeys.all });
    },
  });
}

export function useImportLogs() {
  return useQuery({
    queryKey: delimaKeys.importLogs(),
    queryFn: fetchImportLogs,
  });
}

export function useLogImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logImport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: delimaKeys.importLogs() });
    },
  });
}

export function useExistingDelimaIds() {
  return useQuery({
    queryKey: [...delimaKeys.all, "existing-ids"] as const,
    queryFn: fetchExistingDelimaIds,
    staleTime: 60_000,
  });
}

export type { DelimaRow };
