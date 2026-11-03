import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { PublicLayout } from "@/components/marketing/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-badge";

export const metadata: Metadata = {
  description:
    "The current state of the ZevaPay service and its provider integrations, shown as sample content.",
  title: "Status",
};

const SERVICES = [
  {
    name: "Merchant dashboard",
    status: "Operational",
    detail: "Sign-in, dashboards, and transaction review are responding normally.",
    tone: "success" as const,
  },
  {
    name: "Developer API",
    status: "Operational",
    detail: "API requests are being accepted and returned on time.",
    tone: "success" as const,
  },
  {
    name: "Webhook delivery",
    status: "Operational",
    detail: "Events are being delivered to configured endpoints.",
    tone: "success" as const,
  },
  {
    name: "bKash notification parsing",
    status: "Operational",
    detail: "The parser is reading bKash notifications at its current version.",
    tone: "success" as const,
  },
  {
    name: "Nagad notification parsing",
    status: "Operational",
    detail: "The parser is reading Nagad notifications at its current version.",
    tone: "success" as const,
  },
  {
    name: "Rocket notification parsing",
    status: "Degraded",
    detail: "Some Rocket notifications are taking longer than usual to parse.",
    tone: "warning" as const,
  },
  {
    name: "Upay notification parsing",
    status: "Operational",
    detail: "The parser is reading Upay notifications at its current version.",
    tone: "success" as const,
  },
];

/** Recent incidents, as fixed sample content. */
const INCIDENTS = [
  {
    date: "Nov 1, 2026",
    title: "Rocket notifications parsed slowly",
    status: "Monitoring",
    detail:
      "Some Rocket notifications took longer than expected to parse. Records were still recorded, but a number of them arrived later than usual and sat in the review queue for longer.",
  },
  {
    date: "Oct 24, 2026",
    title: "Intermittent webhook delivery delays",
    status: "Resolved",
    detail:
      "Webhook deliveries to some endpoints were delayed by up to a few minutes. Every delayed delivery was retried and eventually succeeded, so no event was lost.",
  },
  {
    date: "Oct 12, 2026",
    title: "Dashboard report pages slow to load",
    status: "Resolved",
    detail:
      "The reports pages took noticeably longer to render during peak hours. The underlying data was unaffected and no record was lost.",
  },
];

export default function StatusPage() {
  return (
    <PublicLayout>
      <section className="border-b border-line bg-elevated">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <Badge tone="brand">Status</Badge>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Service status
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            A plain view of what is working. If a device cannot reach
            ZevaPay, it will show as offline in your dashboard and no new
            notifications will be recorded until it reconnects.
          </p>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <DemoNotice title="Sample status">
            The status below is fixed sample content for this prototype. It is
            not read from a live monitoring system and does not reflect the
            real state of any provider.
          </DemoNotice>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-4">
            <CircleCheck
              className="size-5 shrink-0 text-accent-fg"
              aria-hidden="true"
            />
            <div>
              <p className="text-[15px] font-semibold text-ink">
                All core services are operational
              </p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                One provider integration is running slower than usual.
              </p>
            </div>
          </div>

          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {SERVICES.map((service) => (
              <li
                key={service.name}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">
                    {service.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {service.detail}
                  </p>
                </div>
                <span
                  className={
                    service.tone === "success"
                      ? "inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-accent-fg"
                      : "inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-warning-fg"
                  }
                >
                  {service.tone === "success" ? (
                    <CircleCheck className="size-4" aria-hidden="true" />
                  ) : (
                    <TriangleAlert className="size-4" aria-hidden="true" />
                  )}
                  {service.status}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-lg font-semibold tracking-tight text-ink">
            Recent incidents
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {INCIDENTS.map((incident) => (
              <li
                key={incident.title}
                className="rounded-xl border border-line bg-surface px-5 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[14px] font-semibold text-ink">
                    {incident.title}
                  </p>
                  <span className="shrink-0 text-[12px] text-ink-muted">
                    {incident.date}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  {incident.detail}
                </p>
                <p className="mt-2.5">
                  <span
                    className={
                      incident.status === "Monitoring"
                        ? "inline-flex items-center gap-1.5 text-[12px] font-medium text-warning-fg"
                        : "inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-fg"
                    }
                  >
                    {incident.status === "Monitoring" ? (
                      <TriangleAlert className="size-3.5" aria-hidden="true" />
                    ) : (
                      <CircleCheck className="size-3.5" aria-hidden="true" />
                    )}
                    {incident.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-xl border border-line bg-elevated px-5 py-5">
            <h2 className="text-[15px] font-semibold text-ink">
              What a status change means for you
            </h2>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-muted">
              <li>
                <strong className="font-medium text-ink-soft">
                  Parser degraded.
                </strong>{" "}
                Notifications are still received, but a record may sit in
                &ldquo;Needs review&rdquo; longer than usual.
              </li>
              <li>
                <strong className="font-medium text-ink-soft">
                  Device offline.
                </strong>{" "}
                No notifications are recorded for that device until it
                reconnects. Payments made in the meantime are not lost — they
                appear once the device is back.
              </li>
              <li>
                <strong className="font-medium text-ink-soft">
                  API degraded.
                </strong>{" "}
                Your storefront may fail to create payment requests. Retrying
                with the same idempotency key is safe.
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Link href="/contact">
              <Button variant="outline">Report a problem</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
