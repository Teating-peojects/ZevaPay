"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { UiOnlyNotice } from "@/components/auth/ui-only-notice";
import {
  verifyEmailSchema,
  type VerifyEmailValues,
} from "@/lib/schemas";

/**
 * Confirm the email address on an account.
 *
 * UI-only in this phase: there is no verification endpoint, and no email
 * transport is configured, so no code is ever sent. The screen therefore
 * says so rather than implying a code is on its way.
 */
export function VerifyEmailForm() {
  const [verified, setVerified] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  if (verified) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center rounded-lg border border-success-line bg-success-tint px-6 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface">
            <CircleCheck
              className="size-5 text-success-fg"
              aria-hidden="true"
            />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">
            Code accepted
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            The code matched the expected format. It was not recorded, because
            this screen has no backend endpoint yet.
          </p>
        </div>

        <Link href="/dashboard" className="w-full">
          <Button className="w-full">Continue to the dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(() => setVerified(true))}
      noValidate
      className="flex flex-col gap-5"
    >
      <UiOnlyNotice>
        No verification code was sent, because this deployment has no email
        transport connected and the API has no verification endpoint yet. Enter
        any six digits to see how the screen behaves.
      </UiOnlyNotice>

      <div className="flex items-start gap-3 rounded-lg border border-line bg-elevated px-4 py-3">
        <Mail className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-ink-muted">
          We would send a six-digit code to{" "}
          <span className="font-medium text-ink-soft">your account email</span>.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="code" required>
            Verification code
          </Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="font-mono tracking-[0.3em]"
            error={errors.code?.message}
            {...register("code")}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Verify email
        </Button>

        <Button type="button" variant="ghost" className="w-full">
          Resend code
        </Button>
      </div>
    </form>
  );
}
