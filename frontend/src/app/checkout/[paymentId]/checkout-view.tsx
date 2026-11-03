"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Info, TriangleAlert } from "lucide-react";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { formatBDT } from "@/lib/format";
import { maskNumber } from "@/lib/format";
import { mockFetchCheckout, mockSubmitCheckoutTrxId } from "@/mock";

/**
 * The customer's checkout page.
 *
 * The customer sends money in their own payment app and then pastes the
 * TrxID so the merchant can match it to their order. ZevaPay records what
 * the customer claims — it never asks for a PIN or an OTP, and it does not
 * connect to the provider to check the claim.
 */

export function CheckoutView() {
  const router = useRouter();
  const params = useParams<{ paymentId: string }>();
  const paymentId = params.paymentId;

  const checkout = React.useMemo(
    () => mockFetchCheckout(paymentId),
    [paymentId],
  );

  const [trxId, setTrxId] = React.useState("");
  const [fields, setFields] = React.useState<Record<string, string>>({});
  const [terms, setTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  if (!checkout) {
    return (
      <div className="surface rounded-xl p-8 text-center">
        <h1 className="text-lg font-semibold text-ink">
          We could not find that payment
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          The link may have expired or been mistyped. Check the link you were
          sent, or ask the merchant for a new one.
        </p>
      </div>
    );
  }

  if (checkout.status === "EXPIRED") {
    return (
      <div className="surface rounded-xl p-8 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-warning-tint">
          <TriangleAlert
            className="size-5 text-warning-fg"
            aria-hidden="true"
          />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-ink">
          This payment link has expired
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          The payment for {checkout.description} is no longer open. Please ask
          the merchant for a new link.
        </p>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkout) return;

    // The merchant may ask for a few details before the TrxID.
    const missing = checkout.customerFields.find(
      (field) => field.required && !(fields[field.name] ?? "").trim(),
    );
    if (missing) {
      setError(`Please fill in ${missing.name.toLowerCase()}.`);
      return;
    }

    if (checkout.termsAccepted && !terms) {
      setError("Please accept the terms to continue.");
      return;
    }

    if (!trxId.trim()) {
      setError("Please paste the TrxID from your payment app.");
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = mockSubmitCheckoutTrxId(checkout.id, trxId.trim());

    if (!result || result.status === "EXPIRED") {
      setSubmitting(false);
      router.push(`/checkout/${checkout.id}/expired`);
      return;
    }

    router.push(
      `/checkout/${checkout.id}/processing?trx=${encodeURIComponent(result.trxId)}`,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Merchant and amount */}
      <div className="surface rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: checkout.merchantLogoColor }}
            aria-hidden="true"
          >
            {checkout.merchantLogoText}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-ink-muted">{checkout.merchantName}</p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-ink">
              {formatBDT(checkout.amount)}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {checkout.description}
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-ink-muted">
              {checkout.orderReference}
            </p>
          </div>
        </div>
      </div>

      <Alert tone="warning" title="Pay from your own app">
        ZevaPay does not take payments on this page. Send the money in your
        bKash, Nagad, Rocket or Upay app, then paste the TrxID below. We
        never ask for your PIN or an OTP — not here, and not anywhere.
      </Alert>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* Where to send the money */}
        <div className="surface rounded-xl p-6">
          <h2 className="text-[15px] font-semibold text-ink">
            Send the money
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {checkout.instructions.map((instruction, index) => (
              <div key={instruction} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-semibold text-brand-ink">
                  {index + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {instruction}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-line bg-elevated px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-ink-muted">Pay to</span>
              <ProviderBadge provider={checkout.provider} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-ink-muted">Account</span>
              <span className="font-mono text-[13px] font-medium text-ink">
                {maskNumber(checkout.accountNumber)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-ink-muted">Amount</span>
              <span className="text-[13px] font-semibold text-ink">
                {formatBDT(checkout.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] text-ink-muted">Reference</span>
              <span className="font-mono text-[12px] text-ink-soft">
                {checkout.orderReference}
              </span>
            </div>
          </div>
        </div>

        {/* Details the merchant asked for */}
        {checkout.customerFields.length > 0 ? (
          <div className="surface rounded-xl p-6">
            <h2 className="text-[15px] font-semibold text-ink">
              Your details
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {checkout.customerFields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={`checkout-${field.name}`}>
                    {field.name}
                    {field.required ? (
                      <span className="ml-1 text-danger-fg">*</span>
                    ) : null}
                  </Label>
                  <Input
                    id={`checkout-${field.name}`}
                    type={field.type === "phone" ? "tel" : field.type}
                    value={fields[field.name] ?? ""}
                    onChange={(event) =>
                      setFields((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* The TrxID */}
        <div className="surface rounded-xl p-6">
          <h2 className="text-[15px] font-semibold text-ink">
            Paste your TrxID
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            Copy the transaction ID from the confirmation screen in your payment
            app. The merchant will use it to match your payment to this order.
          </p>
          <div className="mt-4">
            <Label htmlFor="checkout-trxid" required>
              Transaction ID
            </Label>
            <Textarea
              id="checkout-trxid"
              rows={2}
              placeholder="e.g. 9F7A2K3M"
              value={trxId}
              onChange={(event) => setTrxId(event.target.value)}
              className="font-mono"
            />
          </div>

          {checkout.termsAccepted ? (
            <div className="mt-4 flex items-start gap-3">
              <input
                id="checkout-terms"
                type="checkbox"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded border-line-strong accent-brand-solid"
              />
              <label
                htmlFor="checkout-terms"
                className="text-[13px] leading-relaxed text-ink-soft"
              >
                I have sent the money, and the TrxID above is the one from my
                payment app.
              </label>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="mt-4 text-[13px] font-medium text-danger-fg"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full"
            loading={submitting}
          >
            I have sent the money
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </form>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Your TrxID is a claim that you paid. ZevaPay has not checked it with
        your provider, and the merchant may still ask for more proof if the
        notification does not match.
      </p>
    </div>
  );
}
