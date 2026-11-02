"use client";

import { Check, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { TransactionStatusBadge } from "@/components/shared/status-badge";
import { formatBDT, formatDateTime } from "@/lib/format";
import type { ApiTransaction } from "@/types/api";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="text-[13px] font-medium text-ink sm:text-right">
        {children}
      </span>
    </div>
  );
}

/**
 * Read-only view of a single transaction record.
 *
 * Records are parsed provider notifications. They are never presented as
 * verified or settled payments — the confidence score shows how much of the
 * message the parser was able to read.
 */
export function TransactionDetailsModal({
  transaction,
  onClose,
  merchantName,
  onAccept,
  onReject,
  reviewing = false,
}: {
  transaction: ApiTransaction | null;
  onClose: () => void;
  /** Optional merchant label, shown in the merchant and admin views. */
  merchantName?: string;
  /** Shown when the record is waiting for a review decision. */
  onAccept?: () => void;
  onReject?: () => void;
  reviewing?: boolean;
}) {
  const confidencePercent = transaction
    ? Math.round(transaction.confidence * 100)
    : 0;

  const awaitingReview = transaction?.status === "REVIEW";

  return (
    <Modal
      open={transaction !== null}
      onClose={onClose}
      title="Transaction details"
      description={transaction?.reference}
      size="md"
      footer={
        awaitingReview && (onAccept || onReject) ? (
          <>
            <Button
              variant="outline"
              onClick={onReject}
              loading={reviewing}
              type="button"
            >
              <X className="size-4" aria-hidden="true" />
              Reject
            </Button>
            <Button
              onClick={onAccept}
              loading={reviewing}
              type="button"
            >
              <Check className="size-4" aria-hidden="true" />
              Accept payment
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-neutral-50"
          >
            Close
          </button>
        )
      }
    >
      {transaction ? (
        <div className="flex flex-col gap-4">
          {awaitingReview ? (
            <Alert tone="warning">
              This notification was parsed with {confidencePercent}% confidence,
              which is below the auto-accept threshold. It is waiting for a
              decision from your team and has not been counted as a payment.
            </Alert>
          ) : (
            <Alert tone="info">
              Parsed from a provider notification with {confidencePercent}%
              confidence. ZevaPay reads the message; it does not settle the
              payment with the provider.
            </Alert>
          )}

          <div className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4">
            <span className="text-[13px] text-ink-muted">Amount</span>
            <span className="text-2xl font-semibold tracking-tight text-ink">
              {formatBDT(transaction.amount)}
            </span>
            <div className="mt-1.5 flex items-center gap-2">
              <ProviderBadge provider={transaction.provider} size="sm" />
              <TransactionStatusBadge status={transaction.status} />
            </div>
          </div>

          <div className="flex flex-col">
            <DetailRow label="Transaction ID">{transaction.reference}</DetailRow>
            {merchantName ? (
              <DetailRow label="Merchant">{merchantName}</DetailRow>
            ) : null}
            <DetailRow label="Payment method">
              <ProviderBadge provider={transaction.provider} size="sm" />
            </DetailRow>
            <DetailRow label="Customer name">
              {transaction.customerName ?? "Not identified"}
            </DetailRow>
            <DetailRow label="Customer phone">
              {transaction.customerPhone ?? "Not identified"}
            </DetailRow>
            <DetailRow label="Payment account">
              {transaction.accountLabel ?? "Not linked"}
            </DetailRow>
            <DetailRow label="Reporting device">
              {transaction.deviceName ?? "Not linked"}
            </DetailRow>
            <DetailRow label="Provider reference">
              {transaction.providerRef ?? "Not found"}
            </DetailRow>
            <DetailRow label="Parser confidence">
              {confidencePercent}%
            </DetailRow>
            <DetailRow label="Occurred at">
              {formatDateTime(transaction.occurredAt)}
            </DetailRow>
            <DetailRow label="Recorded at">
              {formatDateTime(transaction.createdAt)}
            </DetailRow>
            {transaction.reviewedByName ? (
              <DetailRow label="Reviewed by">
                {transaction.reviewedByName} ·{" "}
                {transaction.reviewedAt
                  ? formatDateTime(transaction.reviewedAt)
                  : ""}
              </DetailRow>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">
              Raw notification
            </p>
            <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-soft">
              {transaction.rawNotification}
            </pre>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
