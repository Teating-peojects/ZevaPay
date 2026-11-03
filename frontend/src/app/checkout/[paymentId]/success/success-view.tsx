"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";
import { mockFetchCheckout } from "@/mock";

/**
 * The "payment recorded" screen.
 *
 * The wording matters more than usual here. A TrxID was submitted and a
 * notification was recorded — ZevaPay did not check with the provider, so
 * the page says "recorded" rather than "verified", and it says where to go
 * next if the merchant does not receive the money.
 */
export function SuccessView() {
  const params = useParams<{ paymentId: string }>();
  const searchParams = useSearchParams();
  const paymentId = params.paymentId;
  const trxId = searchParams.get("trx") ?? "";

  const checkout = React.useMemo(
    () => mockFetchCheckout(paymentId),
    [paymentId],
  );

  return (
    <div className="surface rounded-xl p-8 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-success-tint">
        <CircleCheck className="size-6 text-success-fg" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-lg font-semibold text-ink">
        Your payment was recorded
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        We have your TrxID and the merchant has been notified. If the amount
        does not reach the merchant, please contact them with the details
        below — they can match it to your order.
      </p>

      {checkout ? (
        <div className="mt-5 flex flex-col gap-2 rounded-lg border border-line bg-elevated px-4 py-3 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-ink-muted">Merchant</span>
            <span className="text-[13px] font-medium text-ink">
              {checkout.merchantName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-ink-muted">Amount</span>
            <span className="text-[13px] font-semibold text-ink">
              {formatBDT(checkout.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-ink-muted">Order</span>
            <span className="font-mono text-[12px] text-ink-soft">
              {checkout.orderReference}
            </span>
          </div>
          {trxId ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-ink-muted">Transaction ID</span>
              <span className="font-mono text-[12px] font-medium text-ink">
                {trxId}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex justify-center">
        <Badge tone="warning" dot>
          Confirmed from the notification, not from the provider
        </Badge>
      </div>

      <div className="mt-6">
        {checkout?.successUrl ? (
          <Button
            onClick={() => {
              window.location.href = checkout.successUrl;
            }}
          >
            Back to {checkout.merchantName}
          </Button>
        ) : (
          <Button variant="outline" disabled>
            Return to the merchant
          </Button>
        )}
      </div>

      <p className="mt-6 flex items-start gap-2 text-left text-[12px] leading-relaxed text-ink-muted">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        This page does not mean your provider has confirmed the transfer.
        ZevaPay works from the notification your payment app sends, and it has
        not checked with bKash, Nagad, Rocket or Upay.
      </p>
    </div>
  );
}
