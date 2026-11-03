"use client";

import * as React from "react";
import {
  Activity,
  Database,
  HardDrive,
  HeartPulse,
  Inbox,
  RefreshCw,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/format";
import { mockFetchSystemHealth, type MockSystemHealth } from "@/mock";

/**
 * The platform's health snapshot.
 *
 * The backend has no health endpoint and no metrics pipeline, so every number
 * on this page comes from the mock layer. The page says so plainly rather
 * than implying the platform is being monitored in real time.
 */

/** How a status maps to a badge tone. */
const STATUS_TONES = {
  OPERATIONAL: "success",
  DEGRADED: "warning",
  OUTAGE: "danger",
} as const;

const STATUS_LABELS = {
  OPERATIONAL: "Operational",
  DEGRADED: "Degraded",
  OUTAGE: "Outage",
} as const;

/** One row in the services table. */
interface ServiceCheck {
  id: string;
  name: string;
  detail: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE";
  /** The reading that backs the status, shown under the name. */
  reading: string;
}

export default function AdminHealthPage() {
  const [health, setHealth] = React.useState<MockSystemHealth>(() =>
    mockFetchSystemHealth(),
  );

  const storagePercent = Math.round(
    (health.storageUsedGb / health.storageTotalGb) * 100,
  );

  const services: ServiceCheck[] = [
    {
      id: "api",
      name: "Public API",
      detail: "Merchant-facing REST endpoints.",
      status: health.apiUptime >= 99.9 ? "OPERATIONAL" : "DEGRADED",
      reading: `${formatPercent(health.apiUptime, 2)} uptime · ${health.apiLatencyMs} ms average latency`,
    },
    {
      id: "database",
      name: "Database",
      detail: "PostgreSQL, the source of truth for merchants and transactions.",
      status: health.databaseStatus,
      reading: `Primary and replica responding · ${health.databaseStatus.toLowerCase()}`,
    },
    {
      id: "queue",
      name: "Processing queue",
      detail: "Work waiting to be written to the transaction ledger.",
      status: health.queueDepth > 50 ? "DEGRADED" : "OPERATIONAL",
      reading: `${formatNumber(health.queueDepth)} items queued`,
    },
    {
      id: "webhooks",
      name: "Webhook delivery",
      detail: "Outbound notifications to merchant endpoints.",
      status: health.webhooksQueued > 20 ? "DEGRADED" : "OPERATIONAL",
      reading: `${formatNumber(health.webhooksQueued)} deliveries queued`,
    },
    {
      id: "storage",
      name: "Object storage",
      detail: "Invoices, receipts and uploaded brand assets.",
      status: storagePercent > 90 ? "DEGRADED" : "OPERATIONAL",
      reading: `${health.storageUsedGb} GB of ${health.storageTotalGb} GB used (${storagePercent}%)`,
    },
  ];

  const degraded = services.filter(
    (service) => service.status !== "OPERATIONAL",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System health"
        description="The state of the services ZevaPay runs on."
        actions={
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo health data" />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setHealth(mockFetchSystemHealth())}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        }
      />

      <DemoNotice title="Sample health snapshot">
        The backend has no health endpoint and no metrics pipeline, so these
        readings are sample figures rather than live measurements. Nothing is
        polled, and a red service here is not a real outage.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="API uptime"
          value={formatPercent(health.apiUptime, 2)}
          hint="Over the last 30 days"
          icon={Activity}
          tone={health.apiUptime >= 99.9 ? "success" : "warning"}
        />
        <StatCard
          label="Average latency"
          value={`${health.apiLatencyMs} ms`}
          hint="Across all endpoints"
          icon={HeartPulse}
        />
        <StatCard
          label="Queue depth"
          value={formatNumber(health.queueDepth)}
          hint="Items waiting to be processed"
          icon={Inbox}
          tone={health.queueDepth > 50 ? "warning" : "neutral"}
        />
        <StatCard
          label="Storage used"
          value={`${storagePercent}%`}
          hint={`${health.storageUsedGb} GB of ${health.storageTotalGb} GB`}
          icon={HardDrive}
          tone={storagePercent > 90 ? "warning" : "neutral"}
        />
      </div>

      <Alert
        tone={degraded > 0 ? "warning" : "success"}
        title={
          degraded > 0
            ? `${degraded} service${degraded === 1 ? " is" : "s are"} not fully operational`
            : "Every service is operational"
        }
      >
        {degraded > 0
          ? "The readings below are sample figures, so treat them as a shape of the page rather than an incident report."
          : "These readings are sample figures. A real health endpoint would report them from the platform's own instrumentation."}
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            What each part of the platform is doing, as of the last check.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-2 rounded-lg border border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  {service.id === "database" ? (
                    <Database
                      className="size-3.5 shrink-0 text-ink-muted"
                      aria-hidden="true"
                    />
                  ) : service.id === "webhooks" ? (
                    <Webhook
                      className="size-3.5 shrink-0 text-ink-muted"
                      aria-hidden="true"
                    />
                  ) : null}
                  {service.name}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {service.detail}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-faint">
                  {service.reading}
                </p>
              </div>
              <Badge
                tone={STATUS_TONES[service.status]}
                dot
                className="shrink-0 self-start sm:self-auto"
              >
                {STATUS_LABELS[service.status]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last check</CardTitle>
          <CardDescription>
            When this snapshot was taken, and what it can and cannot tell you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Checked at</dt>
              <dd className="font-medium text-ink">
                {formatDateTime(health.checkedAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Database status</dt>
              <dd>
                <Badge tone={STATUS_TONES[health.databaseStatus]} dot>
                  {STATUS_LABELS[health.databaseStatus]}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-muted">Webhooks queued</dt>
              <dd className="font-medium text-ink">
                {formatNumber(health.webhooksQueued)}
              </dd>
            </div>
          </dl>

          <p className="text-[12px] leading-relaxed text-ink-muted">
            A real health page would read from the platform&apos;s own
            instrumentation and refresh on a timer. This one holds a fixed
            snapshot, so the numbers do not move unless the page is reloaded.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
