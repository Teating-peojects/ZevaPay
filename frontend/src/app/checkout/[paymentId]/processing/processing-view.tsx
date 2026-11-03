"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockFetchCheckout } from "@/mock";

/**
 * The "we are checking your payment" screen.
 *
 * This is where a customer waits while the merchant's device reports the
 * notification. The demo does not wait for a real notification — it moves on
 * after a short pause, and the page says plainly that nothing was confirmed
 * with the provider.
 */
export function ProcessingView() {
  const router = useRouter();
  const params = useParams<{ paymentId: string }>();
  const searchParams = useSearchParams();
  const paymentId = params.paymentId;
  const trxId = searchParams.get("trx") ?? "";

  const checkout = React.useMemo(
    () => mockFetchCheckout(paymentId),
    [paymentId],
  );

  React.useEffect(() => {
    // The demo cannot wait for a real notification, so it continues on a
    // timer. A real deployment would poll the payment's status.
    const timer = window.setTimeout(() => {
      router.replace(`/checkout/${paymentId}/success?trx=${encodeURIComponent(trxId)}`);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [paymentId, trxId, router]);

  return (
    <div className="surface rounded-xl p-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-tint">
        <Loader2
          className="size-6 animate-spin text-brand-link"
          aria-hidden="true"
        />
      </span>

      <h1 className="mt-5 text-lg font-semibold text-ink">
        We are checking your payment
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Your TrxID has been recorded. The merchant&apos;s device reports the
        payment notification, and we match it to this order. This usually
        takes a few seconds.
      </p>

      {trxId ? (
        <div className="mt-5 flex flex-col gap-2 rounded-lg border border-line bg-elevated px-4 py-3 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-ink-muted">Transaction ID</span>
            <span className="font-mono text-[13px] font-medium text-ink">
              {trxId}
            </span>
          </div>
          {checkout ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-ink-muted">Order</span>
              <span className="font-mono text-[12px] text-ink-soft">
                {checkout.orderReference}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/checkout/${paymentId}/success?trx=${encodeURIComponent(trxId)}`)
          }
        >
          Continue now
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push(`/checkout/${paymentId}/failed`)}
        >
          Something went wrong
        </Button>
      </div>

      <p className="mt-6 flex items-start gap-2 text-left text-[12px] leading-relaxed text-ink-muted">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Nothing here has been checked with bKash, Nagad, Rocket or Upay. The
        result depends on a notification reaching the merchant&apos;s device.
      </p>
    </div>
  );
}
