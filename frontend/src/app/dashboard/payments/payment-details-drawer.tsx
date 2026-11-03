"use client";

import * as React from "react";
import { Check, MessageSquarePlus, RotateCcw, X } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/form";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDateTime } from "@/lib/format";
import {
  mockAddPaymentNote,
  mockUpdatePaymentStatus,
  type MockPayment,
} from "@/mock";

/** Who the demo actions are attributed to. */
const DEMO_AUTHOR = "You (demo)";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="text-[13px] font-medium text-ink sm:text-right">
        {children}
      </span>
    </div>
  );
}

/**
 * The payment detail panel.
 *
 * It shows the timeline, the internal notes, and the demo actions. The
 * approve / reject / refund buttons are labelled as demo actions on the
 * buttons themselves, because none of them reaches a provider: ZevaPay reads
 * notifications, it does not move money.
 */
export function PaymentDetailsDrawer({
  payment,
  onClose,
  onChanged,
}: {
  payment: MockPayment | null;
  onClose: () => void;
  /** Called after a demo action changed the record. */
  onChanged: () => void;
}) {
  if (!payment) return null;

  // The panel is keyed by the payment id, so each payment gets its own
  // record and note box. The record is re-read from the mock layer after
  // every change, so the drawer always shows the current state of the row.
  return (
    <PaymentDetailsPanel
      key={payment.id}
      payment={payment}
      onClose={onClose}
      onChanged={onChanged}
    />
  );
}

/**
 * The drawer for one payment.
 */
function PaymentDetailsPanel({
  payment,
  onClose,
  onChanged,
}: {
  payment: MockPayment;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const [record, setRecord] = React.useState<MockPayment>(payment);

  function run(action: () => MockPayment | undefined) {
    setBusy(true);
    try {
      const updated = action();
      if (!updated) {
        toast({
          title: "The demo action did not apply",
          description: "The sample record could not be updated.",
          tone: "error",
        });
        return;
      }
      setRecord(updated);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  function handleApprove() {
    run(() =>
      mockUpdatePaymentStatus(record.id, "CONFIRMED", {
        body: "Approved in the demo console. No provider-side check was performed.",
        author: DEMO_AUTHOR,
      }),
    );
    toast({
      title: "Marked as confirmed (demo)",
      description:
        "The sample record changed. No money was moved and no provider was contacted.",
      tone: "info",
    });
  }

  function handleReject() {
    run(() =>
      mockUpdatePaymentStatus(record.id, "FAILED", {
        body: "Rejected in the demo console. No provider-side check was performed.",
        author: DEMO_AUTHOR,
      }),
    );
    toast({
      title: "Rejected (demo)",
      description:
        "The sample record changed. No money was moved and no provider was contacted.",
      tone: "info",
    });
  }

  function handleRefund() {
    run(() =>
      mockUpdatePaymentStatus(record.id, "REFUNDED", {
        body: "Refund requested in the demo console. Nothing was sent to a provider.",
        author: DEMO_AUTHOR,
      }),
    );
    toast({
      title: "Refund recorded (demo)",
      description:
        "The sample record changed. No money was moved and no provider was contacted.",
      tone: "info",
    });
  }

  function handleAddNote() {
    if (note.trim().length === 0) return;
    const updated = mockAddPaymentNote(record.id, note.trim(), DEMO_AUTHOR);
    if (!updated) return;
    setRecord(updated);
    setNote("");
    onChanged();
    toast({
      title: "Note added",
      description: "The note was saved to this sample record.",
      tone: "success",
    });
  }

  const timeline = React.useMemo(
    () => [...record.timeline].sort((a, b) => (a.at < b.at ? 1 : -1)),
    [record],
  );

  const notes = React.useMemo(
    () => [...record.notes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [record],
  );

  const confidencePercent = Math.round(record.confidence * 100);

  const canApprove =
    record.status === "PENDING" || record.status === "REVIEW";

  const canRefund = record.status === "CONFIRMED";

  return (
    <Drawer
      open
      onClose={onClose}
      title={record.reference}
      description="Payment detail, timeline and internal notes."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            loading={busy}
            disabled={!canApprove}
            type="button"
          >
            <X className="size-4" aria-hidden="true" />
            Reject (demo)
          </Button>
          <Button
            onClick={handleApprove}
            loading={busy}
            disabled={!canApprove}
            type="button"
          >
            <Check className="size-4" aria-hidden="true" />
            Approve (demo)
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
          <Alert tone="warning" title="Demo actions">
            The buttons below change this sample record only. ZevaPay reads
            provider notifications — it does not settle payments, and no
            provider is contacted when you approve, reject or refund.
          </Alert>

          {/* Amount */}
          <div className="flex flex-col gap-1 rounded-lg border border-line bg-elevated px-4 py-4">
            <span className="text-[13px] text-ink-muted">Amount</span>
            <span className="text-2xl font-semibold tracking-tight text-ink">
              {formatBDT(record.amount)}
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <ProviderBadge provider={record.provider} size="sm" />
              <PaymentStatusBadge status={record.status} />
              {confidencePercent > 0 ? (
                <Badge tone="neutral">{confidencePercent}% parsed</Badge>
              ) : null}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <DetailRow label="Payment method">
              <ProviderBadge provider={record.provider} size="sm" />
            </DetailRow>
            <DetailRow label="Customer name">
              {record.customerName ?? "Not identified"}
            </DetailRow>
            <DetailRow label="Customer phone">
              {record.customerPhone ?? "Not identified"}
            </DetailRow>
            <DetailRow label="Payment account">
              {record.accountLabel}
            </DetailRow>
            <DetailRow label="Order reference">
              {record.orderReference ?? "Not linked"}
            </DetailRow>
            <DetailRow label="Provider reference">
              {record.providerRef ?? "Not found"}
            </DetailRow>
            <DetailRow label="Parser confidence">
              {confidencePercent}%
            </DetailRow>
            <DetailRow label="Created">
              {formatDateTime(record.createdAt)}
            </DetailRow>
            <DetailRow label="Last updated">
              {formatDateTime(record.updatedAt)}
            </DetailRow>
          </div>

          {/* Refund */}
          {canRefund ? (
            <div className="flex flex-col gap-2 rounded-lg border border-line px-4 py-3">
              <p className="text-[13px] font-medium text-ink">
                Record a refund
              </p>
              <p className="text-[13px] leading-relaxed text-ink-muted">
                This marks the sample record as refunded. It does not send a
                refund to the provider.
              </p>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefund}
                  loading={busy}
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Refund (demo)
                </Button>
              </div>
            </div>
          ) : null}

          {/* Raw notification */}
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">
              Recorded notification
            </p>
            <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-line bg-elevated px-3.5 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-soft">
              {record.rawNotification}
            </pre>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-3 text-[13px] font-medium text-ink-soft">
              Timeline
            </p>
            <ol className="flex flex-col gap-0">
              {timeline.map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-solid" />
                    {index < timeline.length - 1 ? (
                      <span className="w-px flex-1 bg-line" />
                    ) : null}
                  </div>
                  <div className="pb-4">
                    <p className="text-[13px] font-medium text-ink">
                      {entry.label}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      {formatDateTime(entry.at)}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      {entry.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Notes */}
          <div>
            <p className="mb-3 text-[13px] font-medium text-ink-soft">
              Internal notes
            </p>
            {notes.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                No notes have been added to this payment.
              </p>
            ) : (
              <ul className="mb-4 flex flex-col gap-3">
                {notes.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-line bg-elevated px-3.5 py-3"
                  >
                    <p className="text-[13px] leading-relaxed text-ink-soft">
                      {entry.body}
                    </p>
                    <p className="mt-1.5 text-[12px] text-ink-muted">
                      {entry.author} · {formatDateTime(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a note for your team…"
                aria-label="New internal note"
                className="min-h-20"
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNote}
                  disabled={note.trim().length === 0}
                >
                  <MessageSquarePlus className="size-3.5" aria-hidden="true" />
                  Add note
                </Button>
              </div>
            </div>
          </div>
        </div>
    </Drawer>
  );
}
