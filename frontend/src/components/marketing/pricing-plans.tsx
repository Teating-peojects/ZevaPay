"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_PLANS } from "@/mock";

/**
 * The pricing plan cards.
 *
 * Client-side because the monthly/yearly toggle is a view concern. The plan
 * data itself is fixed sample content from the mock layer — the page that
 * renders this makes that clear.
 */

type Cycle = "monthly" | "yearly";

function formatPrice(value: number | null): string {
  if (value === null) return "Custom";
  if (value === 0) return "Free";
  return `৳${value.toLocaleString("en-US")}`;
}

export function PricingPlans() {
  const [cycle, setCycle] = React.useState<Cycle>("yearly");

  return (
    <>
      <div className="mt-10 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="inline-flex rounded-lg border border-line bg-elevated p-1"
        >
          {(
            [
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly" },
            ] as const
          ).map((option) => {
            const selected = cycle === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCycle(option.id)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors",
                  selected
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink-soft",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {MOCK_PLANS.map((plan) => {
          const price =
            cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const yearlySaving =
            plan.monthlyPrice !== null &&
            plan.yearlyPrice !== null &&
            plan.monthlyPrice > 0 &&
            plan.yearlyPrice < plan.monthlyPrice * 12;

          return (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? "relative flex flex-col rounded-xl border-2 border-brand-solid bg-surface p-6 shadow-raised"
                  : "relative flex flex-col rounded-xl border border-line bg-surface p-6"
              }
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-6">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-solid px-2 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </span>
                </span>
              ) : null}

              <h2 className="text-base font-semibold text-ink">{plan.name}</h2>
              <p className="mt-2 min-h-10 text-[13px] leading-relaxed text-ink-muted">
                {plan.description}
              </p>

              <div className="mt-5">
                <p className="text-2xl font-semibold tracking-tight text-ink">
                  {formatPrice(price)}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {price === null
                    ? "Billed on an agreement"
                    : price === 0
                      ? "Forever"
                      : cycle === "monthly"
                        ? "per month"
                        : "per year, billed yearly"}
                </p>
                {cycle === "yearly" && yearlySaving ? (
                  <p className="mt-1 text-[12px] font-medium text-accent-fg">
                    Two months free
                  </p>
                ) : null}
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft"
                  >
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-accent-fg"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link href="/register">
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                  >
                    {price === null ? "Talk to us" : "Get started"}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/**
 * The plan-limits comparison table.
 */
export function PricingLimitsTable() {
  const limitLabels: {
    key: keyof (typeof MOCK_PLANS)[number]["limits"];
    label: string;
  }[] = [
    { key: "transactions", label: "Transactions per month" },
    { key: "paymentLinks", label: "Payment links" },
    { key: "devices", label: "Android devices" },
    { key: "apiRequests", label: "API requests per month" },
    { key: "teamMembers", label: "Team members" },
    { key: "brands", label: "Brands" },
  ];

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th
              scope="col"
              className="py-3 pr-4 text-[13px] font-semibold text-ink"
            >
              Limit
            </th>
            {MOCK_PLANS.map((plan) => (
              <th
                key={plan.id}
                scope="col"
                className="px-4 py-3 text-[13px] font-semibold text-ink"
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {limitLabels.map((limit) => (
            <tr key={limit.key} className="border-b border-line last:border-b-0">
              <th
                scope="row"
                className="py-3 pr-4 text-[13px] font-normal text-ink-soft"
              >
                {limit.label}
              </th>
              {MOCK_PLANS.map((plan) => {
                const value = plan.limits[limit.key];
                return (
                  <td key={plan.id} className="px-4 py-3 text-[13px] text-ink-muted">
                    {value === null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Minus
                          className="size-3.5 text-ink-faint"
                          aria-hidden="true"
                        />
                        Unlimited
                      </span>
                    ) : (
                      value.toLocaleString("en-US")
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
