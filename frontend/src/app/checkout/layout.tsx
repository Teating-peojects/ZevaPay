import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Pay",
  description: "Complete your payment to ZevaPay.",
};

/**
 * The shell a customer's checkout page lives in.
 *
 * It is deliberately plain: no dashboard navigation, no marketing header, no
 * sign-in state. A customer who follows a payment link should see the
 * merchant and the amount, and nothing else.
 */
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-solid text-[13px] font-bold text-white">
              Z
            </span>
            ZevaPay
          </Link>
          <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Secure checkout
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-6 text-[12px] leading-relaxed text-ink-muted sm:px-6">
          Payments on this page are recorded from a mobile financial services
          notification. ZevaPay does not connect to bKash, Nagad, Rocket or
          Upay to confirm a payment, so a payment that looks confirmed here
          has been confirmed from the notification only.
        </div>
      </footer>
    </div>
  );
}
