import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  LayoutDashboard,
  MonitorSmartphone,
  Receipt,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROVIDER_LIST } from "@/data/providers";

export const metadata: Metadata = {
  title: "ZevaPay — Simple Payment Management",
  description:
    "Connect your bKash, Nagad, Rocket, and Upay accounts, pair an Android device, and keep every payment notification in one clear dashboard.",
};

const features = [
  {
    icon: Wallet,
    title: "Payment Management",
    description:
      "Keep every bKash, Nagad, Rocket, and Upay account in one list. See the masked number, account type, and status of each without hunting through separate apps.",
  },
  {
    icon: Receipt,
    title: "Transaction Tracking",
    description:
      "Search recorded payments by transaction ID, customer, or account. Filter by status, provider, and date to find the one record you actually need.",
  },
  {
    icon: MonitorSmartphone,
    title: "Device Connection",
    description:
      "Pair an Android SMS Bridge device with your merchant and watch its connection status from the dashboard. Disconnect a device whenever you need to.",
  },
  {
    icon: LayoutDashboard,
    title: "Merchant Dashboard",
    description:
      "A simple overview of totals, successful payments, pending items, and connected devices — clear enough for a shop owner to read at a glance.",
  },
  {
    icon: Code2,
    title: "Secure API Integration",
    description:
      "Issue scoped API keys from your settings and read your transaction history programmatically, from your own reporting scripts or systems.",
  },
];

const steps = [
  {
    title: "Connect Payment Account",
    description:
      "Add the bKash, Nagad, Rocket, or Upay account you receive payments into, along with a label so you can tell your accounts apart.",
  },
  {
    title: "Connect Android Device",
    description:
      "Install the ZevaPay Android app on a phone or tablet at your counter and pair it using the pairing code shown in your dashboard.",
  },
  {
    title: "Receive Payment Notifications",
    description:
      "When a customer pays you, the app reads the provider's notification and records the details of that transaction.",
  },
  {
    title: "Process Transaction Information",
    description:
      "Open the dashboard to review the amount, customer, provider, and status of each record, then export or filter them for your records.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="max-w-3xl">
              <Badge tone="brand">Simple Payment Management</Badge>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.1]">
                Manage Your Payments. Simply.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
                ZevaPay connects your mobile financial services accounts to an
                Android device, then records every payment notification so you
                can see what came in, when it arrived, and which account it
                belongs to.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get started
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-ink-muted">
                ZevaPay reads the notifications your provider already sends. It
                never asks for your PIN or OTP, and never moves your money.
              </p>
            </div>

            {/* Product preview */}
            <div className="mt-16 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-overlay">
              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-white px-4 py-3">
                  <span className="size-2.5 rounded-full bg-neutral-300" />
                  <span className="size-2.5 rounded-full bg-neutral-300" />
                  <span className="size-2.5 rounded-full bg-neutral-300" />
                  <span className="ml-3 text-[12px] font-medium text-ink-faint">
                    app.zevapay.com/dashboard/transactions
                  </span>
                </div>

                <div className="mx-4 my-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  {[
                    {
                      ref: "TXN-100245",
                      method: "bKash",
                      amount: "৳2,450",
                      status: "Success",
                    },
                    {
                      ref: "TXN-100244",
                      method: "Nagad",
                      amount: "৳890",
                      status: "Pending",
                    },
                    {
                      ref: "TXN-100243",
                      method: "bKash",
                      amount: "৳12,750",
                      status: "Review",
                    },
                    {
                      ref: "TXN-100242",
                      method: "Rocket",
                      amount: "৳560",
                      status: "Failed",
                    },
                  ].map((row) => (
                    <div
                      key={row.ref}
                      className="flex items-center gap-4 border-b border-neutral-200 px-4 py-2.5 last:border-b-0"
                    >
                      <span className="font-mono text-[12px] text-ink-muted">
                        {row.ref}
                      </span>
                      <span className="text-[12px] text-ink-muted">
                        {row.method}
                      </span>
                      <span className="ml-auto text-[13px] font-medium text-ink">
                        {row.amount}
                      </span>
                      <span className="text-[12px] text-ink-muted">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-20 border-b border-neutral-200"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Built around the five things you actually do.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                ZevaPay is deliberately focused. Each screen answers one clear
                question so you can move quickly without training.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-neutral-200 bg-white p-6"
                  >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50">
                      <Icon
                        className="size-5 text-brand-700"
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-b border-neutral-200 bg-neutral-50"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Four steps from signup to a clear record.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                No implementation project and no sales call required to start.
              </p>
            </div>

            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((item, index) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-[13px] font-semibold text-brand-700">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Supported methods */}
        <section
          id="supported"
          className="scroll-mt-20 border-b border-neutral-200"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Works with the methods you already use.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                ZevaPay reads the payment notifications your provider sends to
                your phone. No PIN, no OTP, and no direct login to your provider
                account is ever requested.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROVIDER_LIST.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-5"
                >
                  <span
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                    style={{ backgroundColor: provider.color }}
                    aria-hidden="true"
                  >
                    {provider.shortName}
                  </span>
                  <span className="text-[15px] font-semibold text-ink">
                    {provider.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="rounded-xl border border-neutral-200 bg-brand-800 px-6 py-14 text-center sm:px-14">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start managing your payments today.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-100">
                Create a ZevaPay account, connect your payment account and
                Android device, and see every notification in one place.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="w-full bg-white text-brand-800 hover:bg-brand-50 sm:w-auto"
                  >
                    Get started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-brand-400 bg-transparent text-white hover:bg-brand-700 sm:w-auto"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
