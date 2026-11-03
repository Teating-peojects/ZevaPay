"use client";

import * as React from "react";
import { FlaskConical, LifeBuoy, Play, Trash2, Webhook } from "lucide-react";
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
import { DemoBadge } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { Input, Label, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDateTime } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import { PROVIDER_LIST } from "@/data/providers";
import {
  mockDeleteSandboxTransaction,
  mockFetchSandboxTransactions,
  mockFetchWebhooks,
  mockRunSandboxPayment,
  mockSendTestWebhook,
  type MockSandboxTransaction,
} from "@/mock";
import type { PaymentProvider } from "@/types/api";

const SCENARIOS = [
  {
    id: "success" as const,
    label: "Successful payment",
    description:
      "A notification arrives and matches. The record is confirmed from the notification — it is not a provider-side settlement check.",
    tone: "success" as const,
  },
  {
    id: "failed" as const,
    label: "Failed payment",
    description:
      "No matching notification is found, so the payment cannot be accepted and needs a human decision.",
    tone: "danger" as const,
  },
  {
    id: "pending" as const,
    label: "Pending payment",
    description:
      "A notification arrives but no order is matched yet. The record waits for verification.",
    tone: "warning" as const,
  },
];

const SCENARIO_TONES: Record<
  MockSandboxTransaction["scenario"],
  "success" | "danger" | "warning"
> = {
  success: "success",
  failed: "danger",
  pending: "warning",
};

const SCENARIO_LABELS: Record<MockSandboxTransaction["scenario"], string> = {
  success: "Successful",
  failed: "Failed",
  pending: "Pending",
};

/**
 * The sandbox screen.
 *
 * Everything on this page is simulated. The point of the sandbox is that a
 * developer can see what each outcome looks like without a real payment being
 * made, so the whole page is styled apart from the live data: a tinted
 * canvas, a dashed border and a "sandbox" marker on every record.
 */
export default function SandboxPage() {
  const { toast } = useToast();
  const [scenario, setScenario] =
    React.useState<MockSandboxTransaction["scenario"]>("success");
  const [amount, setAmount] = React.useState("1500");
  const [provider, setProvider] = React.useState<PaymentProvider>("BKASH");
  const [error, setError] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);
  const [viewing, setViewing] =
    React.useState<MockSandboxTransaction | null>(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<MockSandboxTransaction | null>(null);
  const [removing, setRemoving] = React.useState(false);

  const table = useMockTable<MockSandboxTransaction>({
    fetch: (options) => mockFetchSandboxTransactions(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  const endpoints = React.useMemo(
    () => mockFetchWebhooks({ pageSize: 200 }).rows,
    [],
  );

  function handleRun() {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    setRunning(true);

    const result = mockRunSandboxPayment({
      scenario,
      amount: parsed,
      provider,
    });

    setRunning(false);
    table.refresh();

    toast({
      title: "Sandbox payment simulated",
      description:
        "Nothing was charged and no provider was contacted. The response is shown below.",
      tone: "warning",
    });

    setViewing(result.transaction);
  }

  function handleTestWebhook(webhookId: string) {
    const delivery = mockSendTestWebhook(webhookId, "payment.confirmed");
    if (!delivery) {
      toast({
        title: "Could not send the test event",
        description: "Pick an endpoint first.",
        tone: "error",
      });
      return;
    }

    toast({
      title: "Test webhook recorded",
      description:
        "The delivery was written to the webhook log. No request was sent to the endpoint.",
      tone: "warning",
    });
  }

  function handleRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);
    mockDeleteSandboxTransaction(pendingRemoval.id);
    setPendingRemoval(null);
    setRemoving(false);
    table.refresh();
    toast({
      title: "Sandbox record cleared",
      description: "The sample record was removed from this browser session.",
      tone: "info",
    });
  }

  const columns: Column<MockSandboxTransaction>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => (
        <span className="font-mono text-[12px] font-medium text-ink">
          {row.reference}
        </span>
      ),
      sortValue: (row) => row.reference,
    },
    {
      key: "scenario",
      header: "Outcome",
      render: (row) => (
        <Badge tone={SCENARIO_TONES[row.scenario]} dot>
          {SCENARIO_LABELS[row.scenario]}
        </Badge>
      ),
      sortValue: (row) => row.scenario,
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
    {
      key: "provider",
      header: "Method",
      render: (row) => {
        const meta = PROVIDER_LIST.find((entry) => entry.id === row.provider);
        return (
          <span className="text-[13px] text-ink-soft">{meta?.name ?? row.provider}</span>
        );
      },
      sortValue: (row) => row.provider,
    },
    {
      key: "when",
      header: "Simulated",
      align: "right",
      render: (row) => (
        <span className="text-[13px] text-ink-muted">
          {formatDateTime(row.createdAt)}
        </span>
      ),
      sortValue: (row) => row.createdAt,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sandbox"
        description="Try the API without moving any money."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo sandbox — no real money" />
          </div>
        }
      />

      {/* The sandbox banner. It marks the whole page apart from live data. */}
      <div className="rounded-xl border-2 border-dashed border-warning-line bg-warning-tint px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-line/40">
            <FlaskConical className="size-4 text-warning-fg" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-ink">
              Everything below is simulated
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Sandbox records are not payments. They never appear in your live
              transaction list, your revenue figures or your settlement
              reports, and no provider is ever contacted. Use a sandbox API key
              if you call the API directly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Simulator */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Simulate a payment</CardTitle>
            <CardDescription>
              Pick an outcome and see the response your code would receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {error ? <Alert tone="danger">{error}</Alert> : null}

            <div className="flex flex-col gap-2">
              {SCENARIOS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setScenario(entry.id)}
                  aria-pressed={scenario === entry.id}
                  className={`rounded-lg border px-3.5 py-3 text-left transition-colors ${
                    scenario === entry.id
                      ? "border-brand-solid bg-brand-tint"
                      : "border-line bg-elevated hover:border-line-strong"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-ink">
                      {entry.label}
                    </span>
                    <Badge tone={entry.tone}>{entry.id}</Badge>
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-ink-muted">
                    {entry.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sandbox-amount" required>
                  Amount (BDT)
                </Label>
                <Input
                  id="sandbox-amount"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sandbox-provider">Method</Label>
                <Select
                  id="sandbox-provider"
                  value={provider}
                  onChange={(event) =>
                    setProvider(event.target.value as PaymentProvider)
                  }
                >
                  {PROVIDER_LIST.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <Button type="button" onClick={handleRun} loading={running}>
              <Play className="size-4" aria-hidden="true" />
              Run sandbox payment
            </Button>

            <p className="text-[12px] leading-relaxed text-ink-muted">
              The request body is the one your code would send to{" "}
              <code className="font-mono">POST /api/v1/sandbox/payments</code>.
              The response is returned below so you can model it.
            </p>
          </CardContent>
        </Card>

        {/* Test webhook */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Send a test webhook</CardTitle>
            <CardDescription>
              Write a test delivery to one of your endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert tone="warning" title="Nothing is sent">
              The test delivery is written to the webhook log so you can see the
              request and response shapes. The endpoint itself is never
              contacted.
            </Alert>

            {endpoints.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                You have no webhook endpoints yet. Add one on the Webhooks page
                first.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {endpoints.map((endpoint) => (
                  <li
                    key={endpoint.id}
                    className="flex flex-col gap-2 rounded-lg border border-dashed border-line-strong px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[12px] font-medium text-ink">
                        {endpoint.url}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">
                        {endpoint.events.length} events ·{" "}
                        {endpoint.status === "ACTIVE" ? "Active" : "Disabled"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="shrink-0"
                      onClick={() => handleTestWebhook(endpoint.id)}
                    >
                      <Webhook className="size-3.5" aria-hidden="true" />
                      Send test
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sandbox records */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <LifeBuoy className="size-4 text-warning-fg" aria-hidden="true" />
          <h2 className="text-[15px] font-semibold text-ink">
            Sandbox records
          </h2>
          <DemoBadge label="Simulated only" />
        </div>

        <DataTable
          columns={columns}
          rows={table.rows}
          loading={table.loading}
          error={table.error ?? undefined}
          showSearch
          searchPlaceholder="Search by reference"
          filters={[
            {
              id: "status",
              label: "All outcomes",
              options: [
                { value: "success", label: "Successful" },
                { value: "failed", label: "Failed" },
                { value: "pending", label: "Pending" },
              ],
            },
          ]}
          emptyTitle="No sandbox records yet"
          emptyDescription="Run a simulated payment above and it will appear here."
          emptyIcon={LifeBuoy}
          actions={(row) => [
            {
              label: "View request and response",
              onSelect: () => setViewing(row),
            },
            {
              label: "Clear record",
              icon: Trash2,
              variant: "danger",
              onSelect: () => setPendingRemoval(row),
            },
          ]}
          onRowClick={(row) => setViewing(row)}
          hideExport
          server={{
            total: table.total,
            page: table.page,
            pageSize: table.pageSize,
            query: table.query,
            filters: table.filters,
            sort: table.sort,
            onPageChange: table.setPage,
            onQueryChange: table.setQuery,
            onFilterChange: table.setFilter,
            onSortChange: table.setSort,
          }}
        />
      </div>

      {/* Request and response */}
      <Drawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Sandbox request"
        description={viewing?.reference}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setViewing(null)} type="button">
            Close
          </Button>
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border-2 border-dashed border-warning-line bg-warning-tint px-4 py-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <FlaskConical className="size-4 text-warning-fg" aria-hidden="true" />
                A simulated record
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                No money moved. This record does not appear in your live
                transactions.
              </p>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Request
              </p>
              <pre className="overflow-x-auto rounded-lg border border-line bg-elevated px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                {viewing.request}
              </pre>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Response
              </p>
              <pre className="overflow-x-auto rounded-lg border border-line bg-elevated px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                {viewing.response}
              </pre>
            </div>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Clear this sandbox record?"
        description={`"${pendingRemoval?.reference}" will be removed from this browser session. It was a simulation, so nothing else changes.`}
        confirmLabel="Clear record"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}
