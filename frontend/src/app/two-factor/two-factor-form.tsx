"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { UiOnlyNotice } from "@/components/auth/ui-only-notice";
import { twoFactorSchema, type TwoFactorValues } from "@/lib/schemas";

/**
 * The second factor step of sign-in.
 *
 * UI-only in this phase: the API has no two-factor endpoint, so this screen
 * never asks for a real code. It deliberately does not collect a provider PIN
 * or an OTP — ZevaPay never handles those.
 */
export function TwoFactorForm() {
  const [verified, setVerified] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorValues>({
    resolver: zodResolver(twoFactorSchema),
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
            The code matched the expected format. No session was created,
            because this screen has no backend endpoint yet.
          </p>
        </div>

        <Link href="/login" className="w-full">
          <Button className="w-full">Back to login</Button>
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
        The API has no two-factor endpoint yet, so no code was sent and no
        session is created. Enter any six digits to see how the screen
        behaves.
      </UiOnlyNotice>

      <div className="flex items-start gap-3 rounded-lg border border-line bg-elevated px-4 py-3">
        <KeyRound
          className="mt-0.5 size-4 shrink-0 text-ink-muted"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-ink-muted">
          You would enter the six-digit code from your authenticator app. This
          is not a payment PIN and ZevaPay never asks for one.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="code" required>
            Two-factor code
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
          Verify and continue
        </Button>

        <Button type="button" variant="ghost" className="w-full">
          Use a recovery code instead
        </Button>
      </div>
    </form>
  );
}
