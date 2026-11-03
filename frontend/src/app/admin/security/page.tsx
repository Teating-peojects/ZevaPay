"use client";

import * as React from "react";
import { Monitor, ShieldAlert, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { DemoNotice } from "@/components/ui/demo-badge";
import { formatDateTime } from "@/lib/format";
import { mockFetchAdminSessions, mockFetchSecurityEvents, type MockAdminSession, type MockSecurityEvent } from "@/mock";

const SEVERITY_TONE = { INFO: "neutral", WARNING: "warning", CRITICAL: "danger" } as const;

export default function AdminSecurityPage() {
  const events = React.useMemo(() => mockFetchSecurityEvents(), []);
  const sessions = React.useMemo(() => mockFetchAdminSessions({ pageSize: 100 }).rows, []);

  const eventColumns: Column<MockSecurityEvent>[] = [
    { key: "title", header: "Event", render: (event) => <><span className="font-medium text-ink">{event.title}</span><span className="mt-0.5 block text-xs text-ink-muted">{event.detail}</span></>, sortValue: (event) => event.title },
    { key: "severity", header: "Severity", render: (event) => <Badge tone={SEVERITY_TONE[event.severity]}>{event.severity.toLowerCase()}</Badge>, sortValue: (event) => event.severity },
    { key: "at", header: "Time", align: "right", render: (event) => <span className="text-xs text-ink-muted">{formatDateTime(event.at)}</span>, sortValue: (event) => event.at },
  ];

  const sessionColumns: Column<MockAdminSession>[] = [
    { key: "staffName", header: "Staff", render: (session) => <><span className="font-medium text-ink">{session.staffName}</span><span className="mt-0.5 block font-mono text-xs text-ink-muted">{session.ipAddress}</span></>, sortValue: (session) => session.staffName },
    { key: "device", header: "Device", render: (session) => <span className="text-sm text-ink-soft">{session.device}</span>, sortValue: (session) => session.device },
    { key: "lastActiveAt", header: "Last active", align: "right", render: (session) => <span className="text-xs text-ink-muted">{formatDateTime(session.lastActiveAt)}</span>, sortValue: (session) => session.lastActiveAt },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Security" description="Review sample platform access events and administrator sessions." />
      <DemoNotice title="Sample security data">The backend does not expose a platform-wide security event feed. These records are fixed demo data; no live monitoring is implied.</DemoNotice>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Admin sessions" value={String(sessions.length)} hint="Sample active sessions" icon={Monitor} />
        <StatCard label="Warnings" value={String(events.filter((event) => event.severity === "WARNING").length)} hint="In the sample event feed" icon={ShieldAlert} tone="warning" />
        <StatCard label="Critical events" value={String(events.filter((event) => event.severity === "CRITICAL").length)} hint="In the sample event feed" icon={ShieldCheck} tone="success" />
      </div>
      <section className="flex flex-col gap-3">
        <div><h2 className="text-base font-semibold text-ink">Security events</h2><p className="mt-1 text-sm text-ink-muted">Sign-in and account changes in the demo feed.</p></div>
        <DataTable columns={eventColumns} rows={events} showSearch searchPlaceholder="Search security events" emptyTitle="No security events" emptyDescription="There are no matching sample events." emptyIcon={ShieldCheck} hideExport />
      </section>
      <section className="flex flex-col gap-3">
        <div><h2 className="text-base font-semibold text-ink">Administrator sessions</h2><p className="mt-1 text-sm text-ink-muted">Sample platform staff sessions.</p></div>
        <DataTable columns={sessionColumns} rows={sessions} showSearch searchPlaceholder="Search staff or device" emptyTitle="No sessions" emptyDescription="There are no matching sample sessions." emptyIcon={Monitor} hideExport />
      </section>
    </div>
  );
}
