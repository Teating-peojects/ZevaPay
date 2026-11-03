"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input, Label } from "@/components/ui/form";
import { PasswordField } from "@/components/auth/password-field";
import { DemoRoleSwitch } from "@/components/auth/demo-role-switch";
import { useDemoRole } from "@/hooks/use-demo-role";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { ApiError, apiFetch } from "@/lib/api-client";
import { DEMO_ACCOUNTS, isDemoMode } from "@/lib/demo-mode";
import type { SessionResponse } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const demoRole = useDemoRole();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  // The demo switch pre-fills the seeded account. It never signs in by
  // itself — the visitor still presses the button.
  const demoAccount = demoRole ? DEMO_ACCOUNTS[demoRole] : null;

  React.useEffect(() => {
    if (!demoAccount) return;
    setValue("email", demoAccount.email);
    setValue("password", demoAccount.password);
  }, [demoAccount, setValue]);

  async function onSubmit(values: LoginValues) {
    setFormError(null);

    try {
      const session = await apiFetch<SessionResponse>("/api/v1/auth/login", {
        method: "POST",
        body: {
          email: values.email,
          password: values.password,
          rememberMe: values.remember,
        },
      });

      // Platform administrators land in the admin console; everyone else in
      // the merchant dashboard.
      router.push(
        session.user.role === "PLATFORM_ADMIN" ? "/admin" : "/dashboard",
      );
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = error.fieldErrors;
        if (fields.email) setError("email", { message: fields.email });
        if (fields.password) setError("password", { message: fields.password });
        setFormError(error.message);
        return;
      }
      setFormError("We could not reach the server. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError ? (
        <Alert tone="danger" className="mb-5" title="Could not sign in">
          {formError}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="mb-1.5 text-[13px] font-medium text-brand-link transition-colors hover:text-brand-link-hover"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <Checkbox
          id="remember"
          checked={undefined}
          error={errors.remember?.message}
          label="Keep me signed in"
          {...register("remember")}
        />

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="mt-1 w-full"
        >
          Sign in
        </Button>
      </div>

      {isDemoMode() ? (
        <div className="mt-6 flex flex-col gap-3">
          <DemoRoleSwitch />
          {demoAccount ? (
            <p className="text-[12px] leading-relaxed text-ink-muted">
              The {demoAccount.label.toLowerCase()} account is filled in. Sign
              in to open the {demoAccount.destination === "/admin" ? "admin console" : "merchant dashboard"}.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-line bg-elevated p-4">
          <p className="text-[13px] font-medium text-ink-soft">
            Running the local demo?
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            Sign in with a seeded account —{" "}
            <code className="font-mono text-[12px]">owner@dhanmondi.test</code>{" "}
            for a merchant, or{" "}
            <code className="font-mono text-[12px]">admin@zevapay.test</code> for
            the platform console. The shared password is{" "}
            <code className="font-mono text-[12px]">ZevaPay#2026</code>.
          </p>
        </div>
      )}
    </form>
  );
}
