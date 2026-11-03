"use client";

import * as React from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { PROVIDER_LIST } from "@/data/providers";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { formatBDT } from "@/lib/format";
import type { MockBrand, MockCheckoutConfig } from "@/mock";
import type { PaymentProvider } from "@/types/api";

/**
 * A preview of the checkout page as the customer would see it.
 *
 * The preview is drawn from the same configuration the form edits, so a
 * change in the form is visible immediately. It is a drawing of a page — no
 * real checkout is served, and no payment can be made through it.
 */
export function CheckoutPreview({
  config,
  brand,
  orderReference,
  amount,
}: {
  config: MockCheckoutConfig;
  /** The brand whose identity the page uses, when one is selected. */
  brand: MockBrand | null;
  /** A sample order reference for the summary. */
  orderReference: string;
  /** A sample amount for the summary. */
  amount: number;
}) {
  const isDark = config.theme === "DARK";
  const accent = config.accentColor;

  return (
    <div
      className="overflow-hidden rounded-xl border border-line"
      style={{
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        color: isDark ? "#e2e8f0" : "#0f172a",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-4 py-3.5"
        style={{
          borderColor: isDark ? "#1e293b" : "#e2e8f0",
          backgroundColor: isDark ? "#111c31" : "#f8fafc",
        }}
      >
        {config.showLogo && brand ? (
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-[12px] font-bold text-white"
            style={{ backgroundColor: brand.logoColor }}
            aria-hidden="true"
          >
            {brand.logoText}
          </span>
        ) : null}
        <div className="min-w-0">
          <p
            className="truncate text-[13px] font-semibold"
            style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
          >
            {brand?.name ?? "Your business"}
          </p>
          {config.showOrderSummary ? (
            <p
              className="truncate text-[12px]"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              Order {orderReference}
            </p>
          ) : null}
        </div>
        {config.showAmount ? (
          <span
            className="ml-auto text-base font-semibold"
            style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
          >
            {formatBDT(amount)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        {/* Payment methods, in the configured order */}
        <div>
          <p
            className="mb-2 text-[12px] font-semibold tracking-wide uppercase"
            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            Payment method
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {config.methodOrder.map((method) => {
              const meta = PROVIDER_LIST.find(
                (provider) => provider.id === method,
              );
              if (!meta) return null;

              return (
                <div
                  key={method}
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5"
                  style={{
                    borderColor: isDark ? "#1e293b" : "#e2e8f0",
                    backgroundColor: isDark ? "#111c31" : "#ffffff",
                  }}
                >
                  <ProviderLogo provider={meta.id} size="sm" />
                  <span className="text-[13px] font-medium">{meta.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        {config.instructions.length > 0 ? (
          <div>
            <p
              className="mb-2 text-[12px] font-semibold tracking-wide uppercase"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              How to pay
            </p>
            <ol className="flex flex-col gap-2">
              {config.instructions.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-2.5">
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                      color: isDark ? "#cbd5e1" : "#475569",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="text-[13px] leading-relaxed"
                    style={{ color: isDark ? "#cbd5e1" : "#334155" }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* The account the customer pays into */}
        <div
          className="rounded-lg border px-3.5 py-3"
          style={{
            borderColor: isDark ? "#1e293b" : "#e2e8f0",
            backgroundColor: isDark ? "#111c31" : "#f8fafc",
          }}
        >
          <p
            className="text-[12px] font-semibold tracking-wide uppercase"
            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            Send to
          </p>
          <p
            className="mt-1 font-mono text-sm font-semibold"
            style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
          >
            0171 •••••• 5678
          </p>
          <p
            className="mt-0.5 text-[12px]"
            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            Main counter bKash
          </p>
        </div>

        {/* TrxID field */}
        {config.collectTrxId ? (
          <div>
            <p
              className="mb-1.5 text-[12px] font-semibold tracking-wide uppercase"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              Transaction ID
            </p>
            <div
              className="rounded-lg border px-3 py-2.5"
              style={{
                borderColor: isDark ? "#1e293b" : "#cbd5e1",
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
              }}
            >
              <span
                className="text-[13px]"
                style={{ color: isDark ? "#64748b" : "#94a3b8" }}
              >
                e.g. 9F2KQ1L8M3
              </span>
            </div>
            <p
              className="mt-1.5 text-[12px] leading-relaxed"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              ZevaPay uses this to match your payment to the order. It is not a
              PIN and it does not confirm the payment on its own.
            </p>
          </div>
        ) : null}

        {/* Terms */}
        {config.collectTerms ? (
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border"
              style={{
                borderColor: isDark ? "#334155" : "#cbd5e1",
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
              }}
              aria-hidden="true"
            />
            <span
              className="text-[12px] leading-relaxed"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              I agree to the merchant&apos;s terms and refund policy.
            </span>
          </div>
        ) : null}

        {/* Pay button */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          <CreditCard className="size-4" aria-hidden="true" />
          I have sent the payment
        </button>

        <p
          className="flex items-center justify-center gap-1.5 text-center text-[12px]"
          style={{ color: isDark ? "#64748b" : "#94a3b8" }}
        >
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          ZevaPay records the notification. It does not settle the payment with
          the provider.
        </p>
      </div>
    </div>
  );
}

/** The provider order a brand's method list starts from. */
export function defaultMethodOrder(): PaymentProvider[] {
  return ["BKASH", "NAGAD", "ROCKET", "UPAY"];
}
