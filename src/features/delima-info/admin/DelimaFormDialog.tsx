import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/common/PasswordInput";
import { bm } from "@/lib/i18n";
import { delimaFormSchema, type DelimaFormValues } from "../types";
import {
  useCreateDelima,
  useDelimaList,
  useUpdateDelima,
} from "../queries";
import type { DelimaRow } from "../queries";

interface DelimaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: DelimaRow | null;
}

export function DelimaFormDialog({
  open,
  onOpenChange,
  initial,
}: DelimaFormDialogProps) {
  const isEdit = Boolean(initial);
  const { data: allStudents } = useDelimaList();
  const createMut = useCreateDelima();
  const updateMut = useUpdateDelima();

  const form = useForm<DelimaFormValues>({
    resolver: zodResolver(delimaFormSchema),
    defaultValues: {
      delima_id: "",
      nama: "",
      kata_laluan: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initial
          ? {
              delima_id: initial.delima_id,
              nama: initial.nama,
              kata_laluan: initial.kata_laluan,
            }
          : { delima_id: "", nama: "", kata_laluan: "" }
      );
    }
  }, [open, initial, form]);

  const onSubmit = async (values: DelimaFormValues) => {
    try {
      // Validasi unik (client-side dari data yang dimuatkan)
      const duplicate = (allStudents ?? []).some(
        (s) => s.delima_id === values.delima_id && s.id !== initial?.id
      );
      if (duplicate) {
        form.setError("delima_id", { message: bm.delima.duplicateDelimaId });
        return;
      }
      if (isEdit && initial && initial.id) {
        await updateMut.mutateAsync({ id: initial.id, values });
        toast.success("Rekod DELIMA berjaya dikemas kini.");
      } else {
        await createMut.mutateAsync(values);
        toast.success("Rekod DELIMA berjaya ditambah.");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operasi gagal.");
    }
  };

  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? bm.common.edit : bm.common.add} — {bm.delima.moduleName}
          </DialogTitle>
          <DialogDescription>
            Isi maklumat pelajar seperti yang didaftarkan dalam sistem DELIMA.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="delima_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{bm.delima.delimaId}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="cth. DLM-2026-001"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{bm.delima.studentName}</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama penuh pelajar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kata_laluan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{bm.delima.delimaPassword}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Kata laluan akaun DELIMA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                {bm.common.cancel}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sedang...
                  </>
                ) : (
                  bm.common.save
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
