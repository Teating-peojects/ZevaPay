"use client";

import * as React from "react";
import { Eye, Shield, ShieldOff } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatNumber, formatPercent } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import { mockFetchProviders, mockUpdateProvider, type MockProvider } from "@/mock";

/**
 * Providers and parsers.
 *
 * The backend has no provider registry and no parser service, so this screen
 * reads from the mock layer. It is the one place an administrator can see
 * which mobile financial services ZevaPay reads notifications from, and how
 * each parser is behaving.
 *
 * The honesty rule matters here too: a parser is what turns a notification
 * into a record. A parser's health tells you how often it read a message
 * correctly — it says nothing about whether a merchant's money arrived.
 */
export default function AdminProvidersPage() {
  const { toast } = useToast();
  const [selected, setSelected] = React.useState<MockProvider | null>(null);

  const table = useMockTable<MockProvider>({
    fetch: (options) => mockFetchProviders(options),
    pageSize: 10,
    initialSort: { sort: "name", order: "asc" },
  });

  function handleToggle(provider: MockProvider) {
    const next = provider.status === "ENABLED" ? "DISABLED" : "ENABLED";
    mockUpdateProvider(provider.id, { status: next });

    toast({
      title: next === "ENABLED" ? "Provider enabled" : "Provider disabled",
      description:
        next === "ENABLED"
          ? `${provider.name} notifications will be parsed again.`
          : `${provider.name} notifications will stop being recorded.`,
      tone: next === "ENABLED" ? "success" : "warning",
    });

    setSelected(null);
    table.refresh();
  }

  const columns: Column<MockProvider>[] = [
    {
      key: "name",
      header: "Provider",
      render: (provider) => (
        <span className="flex items-center gap-2">
          <ProviderBadge provider={provider.code} size="sm" />
        </span>
      ),
      sortValue: (provider) => provider.name,
    },
    {
      key: "parserVersion",
      header: "Parser",
      render: (provider) => (
        <span className="font-mono text-[12px] text-ink-soft">
          {provider.parserVersion}
        </span>
      ),
      sortValue: (provider) => provider.parserVersion,
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      render: (provider) => (
        <span className="text-[13px] text-ink-soft">
          {formatPercent(provider.feePercent, 2)}
        </span>
      ),
      sortValue: (provider) => provider.feePercent,
    },
    {
      key: "volume",
      header: "Volume (30 days)",
      align: "right",
      render: (provider) => (
        <span className="text-[13px] text-ink-soft">
          {formatNumber(provider.volume30d)}
        </span>
      ),
      sortValue: (provider) => provider.volume30d,
    },
    {
      key: "errorRate",
      header: "Error rate",
      align: "right",
      render: (provider) => (
        <span
          className={
            provider.errorRate >= 3
              ? "text-[13px] font-medium text-warning-fg"
              : "text-[13px] text-ink-muted"
          }
        >
          {formatPercent(provider.errorRate)}
        </span>
      ),
      sortValue: (provider) => provider.errorRate,
    },
    {
      key: "health",
      header: "Health",
      align: "right",
      render: (provider) => (
        <span
          className={
            provider.health >= 95
              ? "text-[13px] font-medium text-ink"
              : "text-[13px] font-medium text-warning-fg"
          }
        >
          {provider.health > 0 ? formatPercent(provider.health) : "—"}
        </span>
      ),
      sortValue: (provider) => provider.health,
    },
    {
      key: "status",
      header: "Status",
      render: (provider) => (
        <Badge tone={provider.status === "ENABLED" ? "success" : "neutral"} dot>
          {provider.status === "ENABLED" ? "Enabled" : "Disabled"}
        </Badge>
      ),
      sortValue: (provider) => provider.status,
    },
  ];

  const rows = table.rows;
  const enabled = rows.filter((row) => row.status === "ENABLED").length;
  const averageHealth =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + row.health, 0) / rows.length
      : 0;
  const volume = rows.reduce((sum, row) => sum + row.volume30d, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Providers &amp; parsers"
        description="The mobile financial services ZevaPay reads notifications from."
        actions={<DemoBadge label="Demo providers" />}
      />

      <DemoNotice title="Sample provider registry">
        The backend has no provider registry and no parser service yet. The
        providers, fees, limits and parser versions below are sample records.
        Switching a provider on or off changes the sample record only — no
        provider is contacted, and no notification is read or discarded.
      </DemoNotice>

      <Alert tone="warning" title="A parser is not a payment check">
        The parser turns a notification into a record. Its health score says
        how often it read a message correctly. It says nothing about whether
        a merchant&apos;s money arrived — that is what the provider&apos;s own
        records say, and ZevaPay does not read them.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Providers listed"
          value={formatNumber(rows.length)}
          hint="On this page"
          icon={Shield}
        />
        <StatCard
          label="Enabled"
          value={formatNumber(enabled)}
          hint={`${rows.length - enabled} disabled`}
          icon={Shield}
          tone="success"
        />
        <StatCard
          label="Average parser health"
          value={averageHealth > 0 ? formatPercent(averageHealth) : "—"}
          hint="Across the providers on this page"
          icon={Shield}
          tone={averageHealth >= 95 ? "success" : "warning"}
        />
        <StatCard
          label="Notifications parsed"
          value={formatNumber(volume)}
          hint="Recorded over the last 30 days"
          icon={Shield}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by provider or parser version"
        filters={[
          {
            id: "status",
            label: "All statuses",
            options: [
              { value: "ENABLED", label: "Enabled" },
              { value: "DISABLED", label: "Disabled" },
            ],
          },
          {
            id: "provider",
            label: "All providers",
            options: [
              { value: "BKASH", label: "bKash" },
              { value: "NAGAD", label: "Nagad" },
              { value: "ROCKET", label: "Rocket" },
              { value: "UPAY", label: "Upay" },
            ],
          },
        ]}
        emptyTitle="No providers listed"
        emptyDescription="Providers appear here once the platform registry is connected."
        emptyIcon={Shield}
        actions={(provider) => [
          {
            label: "View provider",
            icon: Eye,
            onSelect: () => setSelected(provider),
          },
          {
            label:
              provider.status === "ENABLED"
                ? "Disable provider"
                : "Enable provider",
            icon: provider.status === "ENABLED" ? ShieldOff : Shield,
            variant: provider.status === "ENABLED" ? ("danger" as const) : undefined,
            onSelect: () => handleToggle(provider),
          },
        ]}
        onRowClick={(provider) => setSelected(provider)}
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

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Provider"
        description={selected?.name}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)} type="button">
              Close
            </Button>
            <Button
              type="button"
              variant={selected?.status === "ENABLED" ? "danger" : "primary"}
              onClick={() => {
                if (selected) handleToggle(selected);
              }}
            >
              {selected?.status === "ENABLED" ? (
                <>
                  <ShieldOff className="size-4" aria-hidden="true" />
                  Disable provider
                </>
              ) : (
                <>
                  <Shield className="size-4" aria-hidden="true" />
                  Enable provider
                </>
              )}
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 rounded-lg border border-line bg-elevated px-4 py-4">
              <span className="text-[13px] text-ink-muted">Provider</span>
              <span className="text-lg font-semibold tracking-tight text-ink">
                {selected.name}
              </span>
              <div className="mt-1.5">
                <Badge
                  tone={selected.status === "ENABLED" ? "success" : "neutral"}
                  dot
                >
                  {selected.status === "ENABLED" ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Parser version</dt>
                <dd className="font-mono font-medium text-ink">
                  {selected.parserVersion}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Fee per transaction</dt>
                <dd className="font-medium text-ink">
                  {formatPercent(selected.feePercent, 2)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Per-transaction limit</dt>
                <dd className="font-medium text-ink">
                  {formatBDT(selected.perTransactionLimit)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Daily limit</dt>
                <dd className="font-medium text-ink">
                  {formatBDT(selected.dailyLimit)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Account types</dt>
                <dd className="font-medium text-ink">
                  {selected.accountTypes.join(", ")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Parsed, last 30 days</dt>
                <dd className="font-medium text-ink">
                  {formatNumber(selected.volume30d)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Error rate</dt>
                <dd className="font-medium text-ink">
                  {formatPercent(selected.errorRate)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Parser health</dt>
                <dd className="font-medium text-ink">
                  {selected.health > 0 ? formatPercent(selected.health) : "—"}
                </dd>
              </div>
            </dl>

            <p className="text-[12px] leading-relaxed text-ink-muted">
              The fee and the limits are demonstration figures. The backend has
              no fee model, and a provider&apos;s real rates are not published
              through the API.
            </p>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
