"use client";

import * as React from "react";
import { Pencil, Plus, RefreshCw, Send, Trash2, Webhook } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CopyableValue } from "@/components/shared/copyable-value";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockCreateWebhook,
  mockDeleteWebhook,
  mockFetchWebhookDeliveries,
  mockFetchWebhooks,
  mockRetryWebhookDelivery,
  mockSendTestWebhook,
  mockUpdateWebhook,
  type MockWebhook,
  type MockWebhookDelivery,
} from "@/mock";
import { WebhookForm, type WebhookValues } from "./webhook-form";

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
 * The webhooks screen.
 *
 * Endpoints, the events they listen for, the masked signing secret and the
 * delivery log. Every endpoint here is a sample record — nothing is sent to
 * any of these URLs.
 */
export default function WebhooksPage() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("endpoints");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MockWebhook | null>(null);
  const [viewing, setViewing] = React.useState<MockWebhook | null>(null);
  const [viewingDelivery, setViewingDelivery] =
    React.useState<MockWebhookDelivery | null>(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<MockWebhook | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const [retrying, setRetrying] = React.useState<string | null>(null);

  const endpoints = useMockTable<MockWebhook>({
    fetch: (options) => mockFetchWebhooks(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  const deliveries = useMockTable<MockWebhookDelivery>({
    fetch: (options) => mockFetchWebhookDeliveries(options),
    pageSize: 10,
    initialSort: { sort: "createdAt", order: "desc" },
  });

  function handleSave(values: WebhookValues) {
    if (editing) {
      mockUpdateWebhook(editing.id, {
        url: values.url,
        description: values.description,
        events: values.events,
      });
      toast({
        title: "Endpoint updated",
        description: `${values.url} was updated.`,
        tone: "success",
      });
    } else {
      const created = mockCreateWebhook({
        merchantId: "mer_001",
        url: values.url,
        description: values.description,
        events: values.events,
        status: "ACTIVE",
      });
      toast({
        title: "Endpoint added",
        description: `${values.url} was added. Nothing is sent to it in the demo.`,
        tone: "success",
      });
      setViewing(created);
    }

    setEditing(null);
    endpoints.refresh();
  }

  async function handleRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);

    mockDeleteWebhook(pendingRemoval.id);
    toast({
      title: "Endpoint deleted",
      description: `${pendingRemoval.url} was removed, along with its delivery log.`,
      tone: "success",
    });
    setPendingRemoval(null);
    setRemoving(false);
    endpoints.refresh();
    deliveries.refresh();
  }

  function handleToggleStatus(webhook: MockWebhook) {
    const next = webhook.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    mockUpdateWebhook(webhook.id, { status: next });
    toast({
      title: next === "ACTIVE" ? "Endpoint enabled" : "Endpoint disabled",
      description:
        next === "ACTIVE"
          ? `${webhook.url} will receive events again.`
          : `${webhook.url} will not receive any events.`,
      tone: "success",
    });
    endpoints.refresh();
  }

  function handleRetry(delivery: MockWebhookDelivery) {
    setRetrying(delivery.id);
    const updated = mockRetryWebhookDelivery(delivery.id);
    setRetrying(null);

    if (updated) {
      toast({
        title: "Delivery queued",
        description:
          "The delivery was queued for another attempt. Nothing left your browser.",
        tone: "warning",
      });
    }
    deliveries.refresh();
  }

  function handleTestEvent(webhook: MockWebhook) {
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
    setViewingDelivery(delivery);
  }

  const endpointColumns: Column<MockWebhook>[] = [
    {
      key: "url",
      header: "Endpoint",
      render: (webhook) => (
        <span className="block">
          <span className="block max-w-[320px] truncate font-mono text-[12px] font-medium text-ink">
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
      key: "events",
      header: "Events",
      render: (webhook) => (
        <span className="text-[13px] text-ink-soft">
          {webhook.events.length}
        </span>
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
          {webhook.successRate.toFixed(1)}%
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

  // Endpoint URLs by id, so the delivery table can name where a delivery went
  // without re-reading the list on every cell.
  const endpointUrls = new Map<string, string>();
  for (const endpoint of mockFetchWebhooks({ pageSize: 200 }).rows) {
    endpointUrls.set(endpoint.id, endpoint.url);
  }

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
        <span className="block max-w-[280px] truncate font-mono text-[12px] text-ink-soft">
          {endpointUrls.get(delivery.webhookId) ?? delivery.webhookId}
        </span>
      ),
      sortValue: (delivery) => delivery.webhookId,
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Webhooks"
        description="Send events to your own systems as they happen."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo webhooks" />
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add endpoint
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample endpoints">
        The backend has no webhook delivery service yet. These endpoints, their
        events, their delivery logs and their retry behaviour are sample
        records — no request is sent to any URL on this page.
      </DemoNotice>

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
          rows={endpoints.rows}
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
          emptyDescription="Add an endpoint so ZevaPay can tell your systems about a payment."
          emptyIcon={Webhook}
          actions={(webhook) => [
            {
              label: "View endpoint",
              onSelect: () => setViewing(webhook),
            },
            {
              label: "Edit endpoint",
              icon: Pencil,
              onSelect: () => {
                setEditing(webhook);
                setFormOpen(true);
              },
            },
            {
              label:
                webhook.status === "ACTIVE"
                  ? "Disable endpoint"
                  : "Enable endpoint",
              onSelect: () => handleToggleStatus(webhook),
            },
            {
              label: "Send test event",
              icon: Send,
              onSelect: () => handleTestEvent(webhook),
            },
            {
              label: "Delete endpoint",
              icon: Trash2,
              variant: "danger",
              onSelect: () => setPendingRemoval(webhook),
            },
          ]}
          onRowClick={(webhook) => setViewing(webhook)}
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
        <div className="flex flex-col gap-4">
          <DataTable
            columns={deliveryColumns}
            rows={deliveries.rows}
            loading={deliveries.loading}
            error={deliveries.error ?? undefined}
            showSearch
            searchPlaceholder="Search by event or ID"
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

          <p className="text-[12px] leading-relaxed text-ink-muted">
            A failed delivery is retried with a backoff. The retry button
            marks the record as retrying and increments the attempt counter —
            it does not contact the endpoint.
          </p>
        </div>
      </TabPanel>

      <WebhookForm
        open={formOpen}
        webhook={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      {/* Endpoint detail */}
      <Drawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Webhook endpoint"
        description={viewing?.url}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewing(null)} type="button">
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!viewing) return;
                setEditing(viewing);
                setViewing(null);
                setFormOpen(true);
              }}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit endpoint
            </Button>
          </>
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Endpoint
              </p>
              <CopyableValue
                value={viewing.url}
                label="The endpoint URL"
              />
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Signing secret
              </p>
              <CopyableValue
                value={viewing.secret}
                label="The masked signing secret"
              />
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                The secret is masked. It was shown once, when the endpoint was
                created, and it cannot be shown again.
              </p>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Events
              </p>
              <div className="flex flex-wrap gap-1.5">
                {viewing.events.map((event) => (
                  <Badge key={event} tone="neutral">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <Badge
                    tone={viewing.status === "ACTIVE" ? "success" : "neutral"}
                    dot
                  >
                    {viewing.status === "ACTIVE" ? "Active" : "Disabled"}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Success rate</dt>
                <dd className="font-medium text-ink">
                  {viewing.successRate.toFixed(1)}%
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Last delivery</dt>
                <dd className="font-medium text-ink">
                  {viewing.lastDeliveryAt
                    ? formatDateTime(viewing.lastDeliveryAt)
                    : "Never"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Added</dt>
                <dd className="font-medium text-ink">
                  {formatDateTime(viewing.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Drawer>

      {/* Delivery detail */}
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
              loading={retrying === viewingDelivery?.id}
              onClick={() => {
                if (!viewingDelivery) return;
                handleRetry(viewingDelivery);
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
                  <Badge
                    tone={DELIVERY_TONES[viewingDelivery.status]}
                    dot
                  >
                    {DELIVERY_LABELS[viewingDelivery.status]}
                  </Badge>
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
                <dd className="font-medium text-ink">
                  {viewingDelivery.attempt}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Duration</dt>
                <dd className="font-medium text-ink">
                  {viewingDelivery.durationMs > 0
                    ? `${viewingDelivery.durationMs} ms`
                    : "—"}
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

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Delete webhook endpoint?"
        description={`"${pendingRemoval?.url}" will be removed, along with its delivery log. Events will no longer be sent to it.`}
        confirmLabel="Delete endpoint"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}
