"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Brand } from "@/components/auth/brand";
import { Card, Field, btnPrimary } from "@/components/ui/kit";
import { login } from "@/lib/api/auth";
import { errorMessage, isApiError } from "@/lib/api/client";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { saveLogin, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const FIELDS = ["email", "password"] as const;

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      // Saving the session triggers the redirect below.
      saveLogin(res);
      toast.success("Logged in");
    },
    onError: (error) => {
      if (applyFieldErrors(error, form.setError, FIELDS)) return;
      // Wrong email or password is shown in the form itself; anything else is a toast.
      if (!(isApiError(error) && error.code === "INVALID_CREDENTIALS")) toast.error(errorMessage(error));
    },
  });

  // Already logged in (or just now): one firm goes straight to bills, several go to the picker.
  useEffect(() => {
    if (session) router.replace(session.businessId ? "/bills" : "/firms");
  }, [session, router]);

  const wrong = isApiError(mutation.error) && mutation.error.code === "INVALID_CREDENTIALS" ? mutation.error.message : null;
  const { errors } = form.formState;
  const busy = mutation.isPending || Boolean(session);

  return (
    <Card className="p-6 sm:p-8">
      <Brand />
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Log in</h1>
      <form noValidate className="mt-6 grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoFocus
          error={errors.email?.message}
          {...form.register("email")}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...form.register("password")}
        />
        <button type="submit" disabled={busy} className={cn(btnPrimary, "h-14 text-lg")}>
          {busy ? "Logging in" : "Log in"}
        </button>
        {wrong && (
          <p
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 font-medium text-destructive"
          >
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            {wrong}
          </p>
        )}
      </form>
    </Card>
  );
}
