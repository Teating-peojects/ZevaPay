"use client";

import * as React from "react";
import { Eye, RefreshCw, Send, Webhook } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockFetchWebhookDeliveries,
  mockFetchWebhooks,
  mockRetryWebhookDelivery,
  mockSendTestWebhook,
  type MockWebhook,
  type MockWebhookDelivery,
} from "@/mock";

const DELIVERY_TONES: Record<
  MockWebhookDelivery["status"],
  "success" | "danger" | "warning" | "info"
> = {
  DELIVERED: "success",
  FAILED: "danger",
  PENDING: "info",
  RETRYING: "warning",
};

const DELIVERY_LABELS: Record<MockWebhookDelivery["status"], string> = {
  DELIVERED: "Delivered",
  FAILED: "Failed",
  PENDING: "Pending",
  RETRYING: "Retrying",
};

/**
 * Webhook monitoring, across every merchant.
 *
 * The backend has no webhook delivery service, so this screen reads from the
 * mock layer. It is the platform-wide view of the endpoints merchants
 * registered and the deliveries that were attempted against them.
 */
export default function AdminWebhooksPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("endpoints");
  const [viewingDelivery, setViewingDelivery] =
    React.useState<MockWebhookDelivery | null>(null);

  const endpoints = useMockTable<MockWebhook>({
    fetch: (options) => mockFetchWebhooks(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
    extra: { merchantId: "*" },
  });

  const deliveries = useMockTable<MockWebhookDelivery>({
    fetch: (options) => mockFetchWebhookDeliveries(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  // Endpoint URLs and their merchants, so the delivery table can name where
  // a delivery went without re-reading the list on every cell.
  const endpointIndex = new Map<string, { url: string; merchantId: string }>();
  for (const endpoint of mockFetchWebhooks({
    pageSize: 200,
    merchantId: "*",
  }).rows) {
    endpointIndex.set(endpoint.id, {
      url: endpoint.url,
      merchantId: endpoint.merchantId,
    });
  }

  function handleTest(webhook: MockWebhook) {
    const delivery = mockSendTestWebhook(webhook.id, "payment.confirmed");
    if (!delivery) return;

    toast({
      title: "Test event recorded",
      description:
        "A test delivery was written to the log. No request was sent to the endpoint.",
      tone: "warning",
    });

    deliveries.refresh();
    endpoints.refresh();
    setTab("deliveries");
    setViewingDelivery(delivery);
  }

  function handleRetry(delivery: MockWebhookDelivery) {
    const updated = mockRetryWebhookDelivery(delivery.id);
    if (!updated) return;

    toast({
      title: "Delivery queued",
      description:
        "The delivery was marked for another attempt. Nothing left your browser.",
      tone: "warning",
    });

    deliveries.refresh();
  }

  const endpointColumns: Column<MockWebhook>[] = [
    {
      key: "url",
      header: "Endpoint",
      render: (webhook) => (
        <span className="block">
          <span className="block max-w-[300px] truncate font-mono text-[12px] font-medium text-ink">
            {webhook.url}
          </span>
          <span className="block text-[12px] text-ink-muted">
            {webhook.description || "No description"}
          </span>
        </span>
      ),
      sortValue: (webhook) => webhook.url,
    },
    {
      key: "merchantId",
      header: "Merchant",
      render: (webhook) => (
        <span className="font-mono text-[12px] text-ink-soft">
          {webhook.merchantId}
        </span>
      ),
      sortValue: (webhook) => webhook.merchantId,
    },
    {
      key: "events",
      header: "Events",
      align: "right",
      render: (webhook) => (
        <span className="text-[13px] text-ink-soft">{webhook.events.length}</span>
      ),
      sortValue: (webhook) => webhook.events.length,
    },
    {
      key: "success",
      header: "Success rate",
      align: "right",
      render: (webhook) => (
        <span
          className={
            webhook.successRate >= 95
              ? "text-[13px] font-medium text-ink"
              : "text-[13px] font-medium text-warning-fg"
          }
        >
          {formatPercent(webhook.successRate)}
        </span>
      ),
      sortValue: (webhook) => webhook.successRate,
    },
    {
      key: "last",
      header: "Last delivery",
      align: "right",
      render: (webhook) => (
        <span className="text-[13px] text-ink-muted">
          {webhook.lastDeliveryAt
            ? formatDateTime(webhook.lastDeliveryAt)
            : "Never"}
        </span>
      ),
      sortValue: (webhook) => webhook.lastDeliveryAt ?? "",
    },
    {
      key: "status",
      header: "Status",
      render: (webhook) => (
        <Badge tone={webhook.status === "ACTIVE" ? "success" : "neutral"} dot>
          {webhook.status === "ACTIVE" ? "Active" : "Disabled"}
        </Badge>
      ),
      sortValue: (webhook) => webhook.status,
    },
  ];

  const deliveryColumns: Column<MockWebhookDelivery>[] = [
    {
      key: "event",
      header: "Event",
      render: (delivery) => (
        <span className="font-mono text-[12px] font-medium text-ink">
          {delivery.event}
        </span>
      ),
      sortValue: (delivery) => delivery.event,
    },
    {
      key: "endpoint",
      header: "Endpoint",
      render: (delivery) => (
        <span className="block max-w-[260px] truncate font-mono text-[12px] text-ink-soft">
          {endpointIndex.get(delivery.webhookId)?.url ?? delivery.webhookId}
        </span>
      ),
      sortValue: (delivery) => delivery.webhookId,
    },
    {
      key: "merchant",
      header: "Merchant",
      render: (delivery) => (
        <span className="font-mono text-[12px] text-ink-soft">
          {endpointIndex.get(delivery.webhookId)?.merchantId ?? "—"}
        </span>
      ),
      sortValue: (delivery) =>
        endpointIndex.get(delivery.webhookId)?.merchantId ?? "",
    },
    {
      key: "status",
      header: "Status",
      render: (delivery) => (
        <Badge tone={DELIVERY_TONES[delivery.status]} dot>
          {DELIVERY_LABELS[delivery.status]}
        </Badge>
      ),
      sortValue: (delivery) => delivery.status,
    },
    {
      key: "code",
      header: "Code",
      align: "right",
      render: (delivery) => (
        <span className="text-[13px] text-ink-soft">
          {delivery.statusCode ?? "—"}
        </span>
      ),
      sortValue: (delivery) => delivery.statusCode ?? 0,
    },
    {
      key: "attempt",
      header: "Attempt",
      align: "right",
      render: (delivery) => (
        <span className="text-[13px] text-ink-soft">{delivery.attempt}</span>
      ),
      sortValue: (delivery) => delivery.attempt,
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      render: (delivery) => (
        <span className="text-[13px] text-ink-muted">
          {delivery.durationMs > 0 ? `${delivery.durationMs} ms` : "—"}
        </span>
      ),
      sortValue: (delivery) => delivery.durationMs,
    },
    {
      key: "when",
      header: "When",
      align: "right",
      render: (delivery) => (
        <span className="text-[13px] text-ink-muted">
          {formatDateTime(delivery.createdAt)}
        </span>
      ),
      sortValue: (delivery) => delivery.createdAt,
    },
  ];

  const endpointRows = endpoints.rows;
  const deliveryRows = deliveries.rows;
  const failed = deliveryRows.filter((row) => row.status === "FAILED").length;
  const averageSuccess =
    endpointRows.length > 0
      ? endpointRows.reduce((sum, row) => sum + row.successRate, 0) /
        endpointRows.length
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Webhook monitoring"
        description="Endpoints merchants registered, and the deliveries attempted against them."
        actions={<DemoBadge label="Demo webhooks" />}
      />

      <DemoNotice title="Sample delivery log">
        The backend has no webhook delivery service yet. The endpoints, their
        events and their delivery logs are sample records covering every
        merchant on the platform. No request is sent to any URL on this page.
      </DemoNotice>

      <Alert tone="info" title="A webhook event is a notification, not a settlement">
        The events a webhook carries describe records ZevaPay has already
        logged. A &ldquo;payment.confirmed&rdquo; event means a notification
        was recorded — ZevaPay has still not checked with bKash, Nagad, Rocket
        or Upay.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Endpoints registered"
          value={formatNumber(endpointRows.length)}
          hint="Across all merchants on this page"
          icon={Webhook}
        />
        <StatCard
          label="Deliveries attempted"
          value={formatNumber(deliveryRows.length)}
          hint="On this page"
          icon={RefreshCw}
        />
        <StatCard
          label="Failed deliveries"
          value={formatNumber(failed)}
          hint="Retried with a backoff"
          icon={RefreshCw}
          tone={failed > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Average success rate"
          value={averageSuccess > 0 ? formatPercent(averageSuccess) : "—"}
          hint="Over the last 100 deliveries per endpoint"
          icon={Webhook}
        />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "endpoints", label: "Endpoints", icon: Webhook },
          { id: "deliveries", label: "Delivery log", icon: RefreshCw },
        ]}
      />

      <TabPanel id="endpoints" value={tab}>
        <DataTable
          columns={endpointColumns}
          rows={endpointRows}
          loading={endpoints.loading}
          error={endpoints.error ?? undefined}
          showSearch
          searchPlaceholder="Search by URL or description"
          filters={[
            {
              id: "status",
              label: "All statuses",
              options: [
                { value: "ACTIVE", label: "Active" },
                { value: "DISABLED", label: "Disabled" },
              ],
            },
          ]}
          emptyTitle="No webhook endpoints"
          emptyDescription="Endpoints appear here once a merchant registers one."
          emptyIcon={Webhook}
          actions={(webhook) => [
            {
              label: "Send test event",
              icon: Send,
              onSelect: () => handleTest(webhook),
            },
          ]}
          hideExport
          server={{
            total: endpoints.total,
            page: endpoints.page,
            pageSize: endpoints.pageSize,
            query: endpoints.query,
            filters: endpoints.filters,
            sort: endpoints.sort,
            onPageChange: endpoints.setPage,
            onQueryChange: endpoints.setQuery,
            onFilterChange: endpoints.setFilter,
            onSortChange: endpoints.setSort,
          }}
        />
      </TabPanel>

      <TabPanel id="deliveries" value={tab}>
        <DataTable
          columns={deliveryColumns}
          rows={deliveryRows}
          loading={deliveries.loading}
          error={deliveries.error ?? undefined}
          showSearch
          searchPlaceholder="Search by event or delivery ID"
          filters={[
            {
              id: "status",
              label: "All statuses",
              options: [
                { value: "DELIVERED", label: "Delivered" },
                { value: "FAILED", label: "Failed" },
                { value: "PENDING", label: "Pending" },
                { value: "RETRYING", label: "Retrying" },
              ],
            },
          ]}
          emptyTitle="No deliveries yet"
          emptyDescription="Deliveries appear here once an endpoint receives an event."
          emptyIcon={RefreshCw}
          actions={(delivery) => [
            {
              label: "View delivery",
              icon: Eye,
              onSelect: () => setViewingDelivery(delivery),
            },
            {
              label: "Retry delivery",
              icon: RefreshCw,
              onSelect: () => handleRetry(delivery),
            },
          ]}
          onRowClick={(delivery) => setViewingDelivery(delivery)}
          hideExport
          server={{
            total: deliveries.total,
            page: deliveries.page,
            pageSize: deliveries.pageSize,
            query: deliveries.query,
            filters: deliveries.filters,
            sort: deliveries.sort,
            onPageChange: deliveries.setPage,
            onQueryChange: deliveries.setQuery,
            onFilterChange: deliveries.setFilter,
            onSortChange: deliveries.setSort,
          }}
        />
      </TabPanel>

      <Drawer
        open={viewingDelivery !== null}
        onClose={() => setViewingDelivery(null)}
        title="Delivery"
        description={viewingDelivery?.event}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setViewingDelivery(null)}
              type="button"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!viewingDelivery) return;
                handleRetry(viewingDelivery);
                setViewingDelivery(null);
              }}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry delivery
            </Button>
          </>
        }
      >
        {viewingDelivery ? (
          <div className="flex flex-col gap-5">
            <Alert tone="info" title="A sample delivery">
              The request and response below are fixed demo content. No request
              was made to any endpoint.
            </Alert>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <Badge tone={DELIVERY_TONES[viewingDelivery.status]} dot>
                    {DELIVERY_LABELS[viewingDelivery.status]}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Endpoint</dt>
                <dd className="max-w-[220px] truncate font-mono font-medium text-ink">
                  {endpointIndex.get(viewingDelivery.webhookId)?.url ??
                    viewingDelivery.webhookId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">HTTP status</dt>
                <dd className="font-medium text-ink">
                  {viewingDelivery.statusCode ?? "No response"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Attempt</dt>
                <dd className="font-medium text-ink">{viewingDelivery.attempt}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Duration</dt>
                <dd className="font-medium text-ink">
                  {viewingDelivery.durationMs} ms
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Sent</dt>
                <dd className="font-medium text-ink">
                  {formatDateTime(viewingDelivery.createdAt)}
                </dd>
              </div>
            </dl>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Request body
              </p>
              <pre className="overflow-x-auto rounded-lg border border-line bg-elevated px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                {viewingDelivery.requestBody}
              </pre>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Response body
              </p>
              {viewingDelivery.responseBody ? (
                <pre className="overflow-x-auto rounded-lg border border-line bg-elevated px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                  {viewingDelivery.responseBody}
                </pre>
              ) : (
                <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-ink-muted">
                  No response was received.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
