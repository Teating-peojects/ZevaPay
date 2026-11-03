"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { UiOnlyNotice } from "@/components/auth/ui-only-notice";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/schemas";

/**
 * Set a new password.
 *
 * UI-only in this phase: the API has no reset-token endpoint yet, so the
 * form validates the input and then reports what would happen, rather than
 * pretending to have changed the password.
 */
export function ResetPasswordForm() {
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  if (done) {
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
            Password accepted
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            The new password passed every validation rule. It was not saved,
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
      onSubmit={handleSubmit(() => setDone(true))}
      noValidate
      className="flex flex-col gap-5"
    >
      <UiOnlyNotice>
        The API has no password-reset endpoint yet, so nothing is saved when
        you submit. The form still enforces the same password rules as the
        rest of ZevaPay.
      </UiOnlyNotice>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="password" required>
            New password
          </Label>
          <PasswordField
            id="password"
            autoComplete="new-password"
            placeholder="Create a new password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength value={password ?? ""} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>
            Confirm new password
          </Label>
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          {confirmPassword && !errors.confirmPassword ? (
            <p
              className={
                confirmPassword === password
                  ? "mt-1.5 text-[13px] text-success-text"
                  : "mt-1.5 text-[13px] text-ink-muted"
              }
            >
              {confirmPassword === password
                ? "The two passwords match."
                : "The two passwords do not match yet."}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full">
          Save new password
        </Button>
      </div>
    </form>
  );
}
