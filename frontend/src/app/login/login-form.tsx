"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input, Label } from "@/components/ui/form";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { ApiError, apiFetch } from "@/lib/api-client";
import type { SessionResponse } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

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
              className="mb-1.5 text-[13px] font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center text-ink-muted transition-colors hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
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

      <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
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
    </form>
  );
}
