"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The "this link has expired" screen.
 *
 * A payment link has a window. Once it closes the customer cannot submit a
 * TrxID against it, because the merchant is no longer expecting this money.
 */
export function ExpiredView() {
  const router = useRouter();
  const params = useParams<{ paymentId: string }>();
  const paymentId = params.paymentId;

  return (
    <div className="surface rounded-xl p-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-warning-tint">
        <Clock className="size-6 text-warning-fg" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-lg font-semibold text-ink">
        This payment link has expired
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        The payment window for this order has closed, so it can no longer
        accept a payment. Ask the merchant for a new link, or check whether
        you have already paid.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={() => router.push(`/checkout/${paymentId}`)}>
          Check this payment again
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go to ZevaPay
        </Button>
      </div>

      <p className="mt-6 text-left text-[12px] leading-relaxed text-ink-muted">
        If you sent the money before the link expired, keep your TrxID and
        contact the merchant — they can still record it against your order.
      </p>
    </div>
  );
}
