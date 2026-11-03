"use client";

import * as React from "react";
import { Bell, Eye, Megaphone, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useMockTable } from "@/hooks/use-mock-table";
import {
  mockFetchPlatformNotifications,
  mockSendPlatformNotification,
  type MockPlatformNotification,
} from "@/mock";
import type { PlatformNotificationValues } from "@/lib/schemas";
import { NotificationForm } from "./notification-form";

/**
 * Platform announcements — what the platform has told merchants.
 *
 * The backend has no notification service, so this screen reads from the
 * mock layer. Queueing an announcement adds a record; it does not send
 * anything to anybody.
 */

const STATUS_TONES: Record<
  MockPlatformNotification["status"],
  "success" | "warning" | "danger"
> = {
  DELIVERED: "success",
  QUEUED: "warning",
  FAILED: "danger",
};

const STATUS_LABELS: Record<MockPlatformNotification["status"], string> = {
  DELIVERED: "Delivered",
  QUEUED: "Queued",
  FAILED: "Failed",
};

const CHANNEL_LABELS: Record<
  MockPlatformNotification["channel"],
  string
> = {
  email: "Email",
  dashboard: "Dashboard",
  sms: "SMS",
  telegram: "Telegram",
  discord: "Discord",
  slack: "Slack",
  webhook: "Webhook",
};

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [selected, setSelected] =
    React.useState<MockPlatformNotification | null>(null);

  const table = useMockTable<MockPlatformNotification>({
    fetch: (options) => mockFetchPlatformNotifications(options),
    pageSize: 10,
    initialSort: { sort: "sentAt", order: "desc" },
  });

  function handleSend(values: PlatformNotificationValues) {
    setSending(true);

    mockSendPlatformNotification({
      title: values.title,
      detail: values.detail,
      channel: values.channel,
      audience: values.audience,
      recipients: 0,
    });

    toast({
      title: "Announcement queued",
      description:
        "The announcement was written to the list. Nothing was delivered — the backend has no notification service, so no merchant received it.",
      tone: "warning",
    });

    setFormOpen(false);
    table.refresh();
  }

  const columns: Column<MockPlatformNotification>[] = [
    {
      key: "title",
      header: "Announcement",
      render: (row) => (
        <span className="block max-w-[320px]">
          <span className="block truncate text-[13px] font-medium text-ink">
            {row.title}
          </span>
          <span className="block truncate text-[12px] text-ink-muted">
            {row.detail}
          </span>
        </span>
      ),
      sortValue: (row) => row.title,
    },
    {
      key: "channel",
      header: "Channel",
      render: (row) => (
        <Badge tone="neutral">{CHANNEL_LABELS[row.channel]}</Badge>
      ),
      sortValue: (row) => row.channel,
    },
    {
      key: "audience",
      header: "Audience",
      render: (row) => (
        <span className="text-[13px] text-ink-soft">{row.audience}</span>
      ),
      sortValue: (row) => row.audience,
    },
    {
      key: "recipients",
      header: "Recipients",
      align: "right",
      render: (row) => (
        <span className="text-[13px] text-ink-soft">
          {formatNumber(row.recipients)}
        </span>
      ),
      sortValue: (row) => row.recipients,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={STATUS_TONES[row.status]} dot>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
      sortValue: (row) => row.status,
    },
    {
      key: "sentAt",
      header: "Sent",
      align: "right",
      render: (row) => (
        <span className="text-[13px] text-ink-muted">
          {row.sentAt ? formatDateTime(row.sentAt) : "Not sent"}
        </span>
      ),
      sortValue: (row) => row.sentAt ?? "",
    },
  ];

  const rows = table.rows;
  const delivered = rows.filter((row) => row.status === "DELIVERED").length;
  const queued = rows.filter((row) => row.status === "QUEUED").length;
  const failed = rows.filter((row) => row.status === "FAILED").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Announcements the platform has sent, or queued to send, to merchants."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo notifications" />
            <Button onClick={() => setFormOpen(true)}>
              <Megaphone className="size-4" aria-hidden="true" />
              New announcement
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample announcement log">
        The backend has no notification service. The announcements below are
        sample records, and queuing a new one adds a record to this list — no
        email, SMS or message is delivered to any merchant.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Announcements on this page"
          value={formatNumber(rows.length)}
          hint="Newest first"
          icon={Bell}
        />
        <StatCard
          label="Delivered"
          value={formatNumber(delivered)}
          hint="On this page"
          icon={Send}
          tone={delivered > 0 ? "success" : "neutral"}
        />
        <StatCard
          label="Waiting"
          value={formatNumber(queued)}
          hint="Queued, not sent"
          icon={Bell}
          tone={queued > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Failed"
          value={formatNumber(failed)}
          hint="On this page"
          icon={Bell}
          tone={failed > 0 ? "warning" : "neutral"}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={table.loading}
        error={table.error ?? undefined}
        showSearch
        searchPlaceholder="Search by title, message, or audience"
        filters={[
          {
            id: "status",
            label: "All statuses",
            options: [
              { value: "DELIVERED", label: "Delivered" },
              { value: "QUEUED", label: "Queued" },
              { value: "FAILED", label: "Failed" },
            ],
          },
          {
            id: "channel",
            label: "All channels",
            options: [
              { value: "email", label: "Email" },
              { value: "dashboard", label: "Dashboard" },
              { value: "sms", label: "SMS" },
              { value: "telegram", label: "Telegram" },
              { value: "discord", label: "Discord" },
              { value: "slack", label: "Slack" },
              { value: "webhook", label: "Webhook" },
            ],
          },
        ]}
        emptyTitle="No announcements"
        emptyDescription="Announcements appear here once the platform sends one."
        emptyIcon={Megaphone}
        actions={(row) => [
          {
            label: "View announcement",
            icon: Eye,
            onSelect: () => setSelected(row),
          },
        ]}
        onRowClick={(row) => setSelected(row)}
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

      <NotificationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSend}
        saving={sending}
      />

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Announcement"
        description={selected?.title}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setSelected(null)} type="button">
            Close
          </Button>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 rounded-lg border border-line bg-elevated px-4 py-4">
              <span className="text-[13px] text-ink-muted">Title</span>
              <span className="text-lg font-semibold tracking-tight text-ink">
                {selected.title}
              </span>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONES[selected.status]} dot>
                  {STATUS_LABELS[selected.status]}
                </Badge>
                <Badge tone="neutral">
                  {CHANNEL_LABELS[selected.channel]}
                </Badge>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide uppercase text-ink-muted">
                Message
              </p>
              <p className="rounded-lg border border-line bg-elevated px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                {selected.detail}
              </p>
            </div>

            <dl className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Notification ID</dt>
                <dd className="font-mono font-medium text-ink">{selected.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Audience</dt>
                <dd className="font-medium text-ink">{selected.audience}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Recipients</dt>
                <dd className="font-medium text-ink">
                  {formatNumber(selected.recipients)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Sent</dt>
                <dd className="font-medium text-ink">
                  {selected.sentAt ? formatDateTime(selected.sentAt) : "Not sent"}
                </dd>
              </div>
            </dl>

            <p className="text-[12px] leading-relaxed text-ink-muted">
              The recipient count is a figure carried by the record. Nothing here
              was actually sent — there is no mail or messaging service behind
              this screen.
            </p>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
