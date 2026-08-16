import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAuthStore } from "@/stores/authStore";
import { changeAdminCredentials } from "@/features/auth/api";

const changeCredsSchema = z
  .object({
    current_password: z.string().min(1, bm.settings.currentRequired),
    new_username: z
      .string()
      .trim()
      .min(1, bm.settings.usernameRequired)
      .max(64, "Nama pengguna terlalu panjang"),
    new_password: z
      .string()
      .min(8, bm.settings.passwordMin)
      .max(128, "Kata laluan terlalu panjang"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: bm.settings.passwordMismatch,
    path: ["confirm_password"],
  });

type ChangeCredsValues = z.infer<typeof changeCredsSchema>;

export function AdminSettingsPage() {
  const session = useAuthStore((s) => s.session);
  const updateUsername = useAuthStore((s) => s.updateUsername);

  const form = useForm<ChangeCredsValues>({
    resolver: zodResolver(changeCredsSchema),
    defaultValues: {
      current_password: "",
      new_username: session?.username ?? "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values: ChangeCredsValues) => {
    const result = await changeAdminCredentials({
      currentPassword: values.current_password,
      newUsername: values.new_username,
      newPassword: values.new_password,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    updateUsername(values.new_username.trim());
    form.reset({
      current_password: "",
      new_username: values.new_username.trim(),
      new_password: "",
      confirm_password: "",
    });
    toast.success(bm.settings.successUpdated);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{bm.settings.title}</h1>
        <p className="text-sm text-muted-foreground">{bm.settings.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{bm.settings.changeCredentials}</CardTitle>
          <CardDescription>{bm.settings.note}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{bm.settings.currentPassword}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{bm.settings.newUsername}</FormLabel>
                    <FormControl>
                      <Input autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{bm.settings.newPassword}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{bm.settings.confirmPassword}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sedang...
                  </>
                ) : (
                  bm.common.save
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
