"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The "we could not match your payment" screen.
 *
 * The customer lands here when a notification never arrives, or when the
 * amount on it does not match. The page points them back at the checkout so
 * they can try again, and tells them to contact the merchant if they have
 * already sent the money — because a TrxID that never matches is a case for
 * the merchant, not for ZevaPay.
 */
export function FailedView() {
  const router = useRouter();
  const params = useParams<{ paymentId: string }>();
  const paymentId = params.paymentId;

  return (
    <div className="surface rounded-xl p-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-danger-tint">
        <CircleAlert className="size-6 text-danger-fg" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-lg font-semibold text-ink">
        We could not match your payment
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        No notification matched this order — it may not have arrived yet, or
        the amount did not match. If you have already sent the money, contact
        the merchant with your TrxID so they can check it against their
        records.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={() => router.push(`/checkout/${paymentId}`)}>
          Try again
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go to ZevaPay
        </Button>
      </div>

      <p className="mt-6 text-left text-[12px] leading-relaxed text-ink-muted">
        A payment is only recorded when a notification reaches the
        merchant&apos;s device. ZevaPay cannot send money on your behalf and
        cannot check your provider&apos;s records, so it will not confirm a
        transfer it has not seen.
      </p>
    </div>
  );
}
