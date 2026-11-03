"use client";

import * as React from "react";
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Download,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate, formatNumber } from "@/lib/format";
import {
  mockCancelSubscription,
  mockChangePlan,
  mockFetchBillingHistory,
  mockFetchPlans,
  mockFetchSubscription,
  type MockInvoiceRecord,
  type MockPlan,
  type MockSubscription,
} from "@/mock";

/**
 * The billing page.
 *
 * Everything on it is a demonstration. The backend has no billing model at
 * all, so there is no card to charge and no invoice to issue. The page says so
 * at the top and at every point where a real product would take money.
 */

/** A usage bar, with the limit shown alongside it. */
function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const unlimited = limit === null;
  const ratio = unlimited ? 0 : Math.min(1, used / limit);
  const tone =
    ratio >= 0.9
      ? "bg-danger-500"
      : ratio >= 0.75
        ? "bg-warning-500"
        : "bg-brand-solid";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink-soft">{label}</span>
        <span className="text-[13px] text-ink-muted">
          {formatNumber(used)}
          {unlimited ? " / unlimited" : ` / ${formatNumber(limit)}`}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
        role="progressbar"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemax={limit ?? undefined}
        aria-valuemin={0}
      >
        <div
          className={`h-full rounded-full ${unlimited ? "bg-line-strong" : tone}`}
          style={{ width: unlimited ? "100%" : `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

/** The price of a plan, on the cycle the merchant is looking at. */
function planPrice(plan: MockPlan, cycle: "MONTHLY" | "YEARLY") {
  return cycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;
}

export default function BillingPage() {
  const { toast } = useToast();

  const [cycle, setCycle] = React.useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [subscription, setSubscription] = React.useState<MockSubscription>(() =>
    mockFetchSubscription(),
  );
  const plans = React.useMemo<MockPlan[]>(() => mockFetchPlans(), []);
  const history = React.useMemo<MockInvoiceRecord[]>(
    () => mockFetchBillingHistory({ pageSize: 50 }).rows,
    [],
  );

  const [changing, setChanging] = React.useState<MockPlan | null>(null);
  const [changingBusy, setChangingBusy] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const currentPlan = plans.find((plan) => plan.id === subscription.planId);
  const currentPrice = currentPlan ? planPrice(currentPlan, cycle) : null;

  function handleChangePlan(plan: MockPlan) {
    setChangingBusy(true);
    const next = mockChangePlan(plan.id, cycle);
    setChangingBusy(false);
    setChanging(null);

    if (!next) return;

    setSubscription(next);
    toast({
      title: `Plan changed to ${plan.name}`,
      description:
        "Nothing was charged. The backend has no billing model, so this only changes what the page shows.",
      tone: "warning",
    });
  }

  function handleCancel() {
    setCancelling(true);
    mockCancelSubscription();
    setSubscription(mockFetchSubscription());
    setCancelling(false);
    setCancelOpen(false);

    toast({
      title: "Subscription cancelled",
      description:
        "This is a demonstration. No cancellation was sent to any billing system.",
      tone: "warning",
    });
  }

  const historyColumns: Column<MockInvoiceRecord>[] = [
    {
      key: "number",
      header: "Invoice",
      render: (row) => (
        <span className="font-mono text-[12px] font-medium text-ink">
          {row.number}
        </span>
      ),
      sortValue: (row) => row.number,
    },
    {
      key: "plan",
      header: "Plan",
      render: (row) => (
        <span className="text-[13px] text-ink-soft">{row.plan}</span>
      ),
      sortValue: (row) => row.plan,
    },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-[13px] text-ink-muted">{formatDate(row.date)}</span>
      ),
      sortValue: (row) => row.date,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          tone={
            row.status === "PAID"
              ? "success"
              : row.status === "PENDING"
                ? "warning"
                : "neutral"
          }
          dot
        >
          {row.status === "PAID"
            ? "Paid"
            : row.status === "PENDING"
              ? "Pending"
              : "Refunded"}
        </Badge>
      ),
      sortValue: (row) => row.status,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className="font-medium text-ink">{formatBDT(row.amount)}</span>
      ),
      sortValue: (row) => row.amount,
    },
  ];

  const usageRows = currentPlan
    ? [
        {
          label: "Transactions",
          used: subscription.usage.transactions,
          limit: currentPlan.limits.transactions,
        },
        {
          label: "API requests",
          used: subscription.usage.apiRequests,
          limit: currentPlan.limits.apiRequests,
        },
        {
          label: "Payment links",
          used: subscription.usage.paymentLinks,
          limit: currentPlan.limits.paymentLinks,
        },
        {
          label: "Devices",
          used: subscription.usage.devices,
          limit: currentPlan.limits.devices,
        },
        {
          label: "Team members",
          used: subscription.usage.teamMembers,
          limit: currentPlan.limits.teamMembers,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Your plan, what you have used, and what it costs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge label="Demo billing — nothing is charged" />
          </div>
        }
      />

      <DemoNotice title="No money moves on this page">
        The backend has no billing model. There is no card on file, no invoice
        is issued and no payment is taken — the figures below are a
        demonstration of how the page would behave.
      </DemoNotice>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                What this merchant account is on right now.
              </CardDescription>
            </div>
            <Badge
              tone={
                subscription.status === "ACTIVE"
                  ? "success"
                  : subscription.status === "PAST_DUE"
                    ? "danger"
                    : "warning"
              }
              dot
            >
              {subscription.status === "ACTIVE"
                ? "Active"
                : subscription.status === "TRIALING"
                  ? "Trialling"
                  : subscription.status === "PAST_DUE"
                    ? "Past due"
                    : "Cancelled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[28px] font-semibold tracking-tight text-ink">
                {currentPlan?.name ?? "—"}
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                {currentPlan?.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[20px] font-semibold text-ink">
                {currentPrice === null || currentPrice === undefined
                  ? "Custom"
                  : formatBDT(currentPrice)}
                {currentPrice !== null && currentPrice !== undefined ? (
                  <span className="text-[13px] font-normal text-ink-muted">
                    {" "}
                    / {cycle === "MONTHLY" ? "month" : "year"}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1.5 text-[12px] text-ink-muted">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Renews {formatDate(subscription.renewsAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
              disabled={subscription.status === "CANCELLED"}
            >
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Cancel subscription
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                document
                  .getElementById("plan-comparison")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Compare plans
            </Button>
          </div>

          {subscription.status === "CANCELLED" ? (
            <Alert tone="warning" title="This subscription is cancelled">
              The plan below stays visible so you can see what it covered, but
              nothing is active.
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage this period</CardTitle>
          <CardDescription>
            What the {currentPlan?.name ?? "current"} plan allows, and how much
            of it has been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {usageRows.map((row) => (
            <UsageBar
              key={row.label}
              label={row.label}
              used={row.used}
              limit={row.limit}
            />
          ))}
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Usage figures are sample data. A real account counts these from
            your own transactions.
          </p>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <div id="plan-comparison" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Compare plans</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Prices in BDT. Change the cycle to see the yearly rate.
            </p>
          </div>
          <div
            className="inline-flex items-center rounded-lg border border-line bg-elevated p-1"
            role="group"
            aria-label="Billing cycle"
          >
            {(["MONTHLY", "YEARLY"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={cycle === option}
                onClick={() => setCycle(option)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  cycle === option
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink-soft"
                }`}
              >
                {option === "MONTHLY" ? "Monthly" : "Yearly"}
                {option === "YEARLY" ? (
                  <span className="ml-1.5 text-[11px] text-success-fg">
                    2 months free
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const price = planPrice(plan, cycle);
            const isCurrent = plan.id === subscription.planId;

            return (
              <div
                key={plan.id}
                className={`surface flex flex-col gap-4 rounded-xl border p-5 shadow-card ${
                  plan.popular ? "border-brand-solid" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">
                      {plan.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {plan.description}
                    </p>
                  </div>
                  {plan.popular ? <Badge tone="brand">Popular</Badge> : null}
                  {isCurrent ? <Badge tone="success">Current</Badge> : null}
                </div>

                <div>
                  <p className="text-[22px] font-semibold tracking-tight text-ink">
                    {price === null ? "Custom" : formatBDT(price)}
                    {price === null ? null : (
                      <span className="text-[13px] font-normal text-ink-muted">
                        {" "}
                        / {cycle === "MONTHLY" ? "mo" : "yr"}
                      </span>
                    )}
                  </p>
                  {cycle === "YEARLY" && price !== null && price > 0 ? (
                    <p className="mt-0.5 text-[12px] text-ink-faint">
                      {formatBDT(Math.round(price / 12))} a month, billed yearly
                    </p>
                  ) : null}
                </div>

                <ul className="flex flex-col gap-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[13px] text-ink-soft"
                    >
                      <BadgeCheck
                        className="mt-0.5 size-3.5 shrink-0 text-success-fg"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? "outline" : "primary"}
                  size="sm"
                  className="mt-auto w-full"
                  disabled={isCurrent}
                  onClick={() => setChanging(plan)}
                >
                  {isCurrent ? "Your current plan" : `Switch to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing history */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Billing history</CardTitle>
              <CardDescription>
                Every invoice raised against this account.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" aria-hidden="true" />
              Download all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            rows={history}
            showSearch
            searchPlaceholder="Search by invoice number"
            emptyTitle="No invoices yet"
            emptyDescription="Invoices appear here once your first billing period is closed."
            emptyIcon={CreditCard}
            hideExport
          />
        </CardContent>
      </Card>

      {/* Change plan */}
      <Modal
        open={changing !== null}
        onClose={() => setChanging(null)}
        title={changing ? `Switch to ${changing.name}` : "Switch plan"}
        description="Nothing is charged and no card is needed."
        footer={null}
      >
        {changing ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-line bg-elevated px-4 py-3">
              <p className="text-[13px] font-medium text-ink">
                {changing.name} ·{" "}
                {planPrice(changing, cycle) === null
                  ? "Custom pricing"
                  : `${formatBDT(planPrice(changing, cycle)!)} per ${
                      cycle === "MONTHLY" ? "month" : "year"
                    }`}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {changing.description}
              </p>
            </div>

            <Alert tone="warning" title="No payment is taken">
              The backend has no billing model, so this only changes the plan
              shown on this page.
            </Alert>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setChanging(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                loading={changingBusy}
                onClick={() => handleChangePlan(changing)}
              >
                Confirm switch
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this subscription?"
        description={`The ${currentPlan?.name ?? "current"} plan would stop at the end of the billing period. This is a demonstration, so no cancellation is sent to any billing system.`}
        confirmLabel="Cancel subscription"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
