"use client";

import * as React from "react";
import { Check, Flag, Minus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { formatBDT, formatNumber } from "@/lib/format";
import { mockFetchPlans, mockFetchMerchants, type MockPlan } from "@/mock";

/**
 * The platform plan catalogue.
 *
 * The backend has no plan model, so this screen reads from the mock layer.
 * It shows what a merchant could be on, how many are on each plan, and what
 * each plan allows.
 */
export default function AdminPlansPage() {
  const plans = React.useMemo(() => mockFetchPlans(), []);

  // How many merchants sit on each plan, so the catalogue shows real usage.
  const usageByPlan = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const merchant of mockFetchMerchants({ merchantId: "*", pageSize: 200 }).rows) {
      counts.set(merchant.plan, (counts.get(merchant.plan) ?? 0) + 1);
    }
    return counts;
  }, []);

  const withListPrice = plans.filter((plan) => plan.monthlyPrice !== null);
  const entryPrice = withListPrice.reduce(
    (lowest, plan) =>
      (plan.monthlyPrice ?? Infinity) < lowest ? (plan.monthlyPrice ?? 0) : lowest,
    Infinity,
  );
  const highestPrice = withListPrice.reduce(
    (highest, plan) =>
      (plan.monthlyPrice ?? 0) > highest ? (plan.monthlyPrice ?? 0) : highest,
    0,
  );

  function renderLimit(value: number | null): string {
    if (value === null) return "Unlimited";
    return formatNumber(value);
  }

  function planPrice(plan: MockPlan): string {
    if (plan.monthlyPrice === null) return "Talk to sales";
    if (plan.monthlyPrice === 0) return "Free";
    return `${formatBDT(plan.monthlyPrice)}/month`;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plans"
        description="The plans a merchant can be on, and what each one allows."
        actions={<DemoBadge label="Demo catalogue" />}
      />

      <DemoNotice title="Sample plan catalogue">
        The backend has no plan model and no billing service. The prices,
        limits and merchant counts below are sample records. Changing a plan
        is not possible here and nothing is ever charged.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plans in the catalogue"
          value={formatNumber(plans.length)}
          hint="Including Enterprise"
          icon={Flag}
        />
        <StatCard
          label="With a list price"
          value={formatNumber(withListPrice.length)}
          hint={`${plans.length - withListPrice.length} priced on request`}
          icon={Flag}
        />
        <StatCard
          label="Entry price"
          value={Number.isFinite(entryPrice) ? formatBDT(entryPrice) : "—"}
          hint="Per month, before yearly discount"
          icon={Flag}
        />
        <StatCard
          label="Highest list price"
          value={formatBDT(highestPrice)}
          hint="Per month"
          icon={Flag}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const merchants = usageByPlan.get(plan.id) ?? 0;

          return (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {plan.popular ? (
                    <Badge tone="brand" dot>
                      Popular
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-5">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-ink">
                    {planPrice(plan)}
                  </p>
                  {plan.monthlyPrice !== null && plan.monthlyPrice > 0 ? (
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {formatBDT(plan.yearlyPrice ?? 0)} a year
                    </p>
                  ) : null}
                </div>

                <div className="rounded-lg border border-line bg-elevated px-4 py-3">
                  <p className="text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                    Merchants on this plan
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {formatNumber(merchants)}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                    Limits
                  </p>
                  <dl className="flex flex-col gap-2 text-[13px]">
                    {(
                      [
                        ["Transactions", plan.limits.transactions],
                        ["Payment links", plan.limits.paymentLinks],
                        ["Devices", plan.limits.devices],
                        ["API requests", plan.limits.apiRequests],
                        ["Team members", plan.limits.teamMembers],
                        ["Brands", plan.limits.brands],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4"
                      >
                        <dt className="text-ink-muted">{label}</dt>
                        <dd className="font-medium text-ink">
                          {renderLimit(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                    Includes
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[13px] text-ink-soft"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-success-fg"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.monthlyPrice === null ? (
                  <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
                    <Minus className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    There is no list price for this plan. A merchant on it has
                    limits agreed separately.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[12px] leading-relaxed text-ink-muted">
        The prices are demonstration figures. The backend has no fee model and
        no billing service, and a provider&apos;s real rates are not published
        through the API.
      </p>
    </div>
  );
}
