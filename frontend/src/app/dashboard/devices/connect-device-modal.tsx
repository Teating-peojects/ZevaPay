"use client";

import * as React from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Label, Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { apiFetch } from "@/lib/api-client";
import { PROVIDER_LIST } from "@/data/providers";
import type { ApiPairingCode, ApiPaymentAccount } from "@/types/api";

/**
 * Connect-device modal. Issues a real, single-use pairing code that the
 * Android SMS Bridge app exchanges for a device record. The code expires
 * after fifteen minutes.
 */
export function ConnectDeviceModal({
  open,
  onClose,
  onPaired,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  onPaired: () => void;
  /** Payment accounts the device can be linked to. */
  accounts: ApiPaymentAccount[];
}) {
  const { toast } = useToast();
  const { copied, copy } = useCopyToClipboard();
  const [pairing, setPairing] = React.useState<ApiPairingCode | null>(null);
  const [accountId, setAccountId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Bumped to force a fresh pairing code (on open, on "New code", or after
  // the target account changes).
  const [requestToken, setRequestToken] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function issueCode() {
      try {
        const response = await apiFetch<{ pairingCode: ApiPairingCode }>(
          "/api/v1/merchant/devices/pairing-codes",
          {
            method: "POST",
            body: { connectedAccountId: accountId || null },
          },
        );
        if (cancelled) return;
        setPairing(response.pairingCode);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("We could not issue a pairing code. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void issueCode();

    return () => {
      cancelled = true;
    };
  }, [open, requestToken, accountId]);

  async function handleCopy() {
    if (!pairing) return;
    const ok = await copy(pairing.code);
    toast({
      title: ok ? "Pairing code copied" : "Could not copy",
      description: ok
        ? `${pairing.code} is on your clipboard.`
        : "Your browser blocked clipboard access. Select the code manually.",
      tone: ok ? "success" : "error",
    });
  }

  const expiresAt = pairing ? new Date(pairing.expiresAt) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Connect device"
      description="Pair an Android SMS Bridge device with this merchant."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
          <Button
            type="button"
            onClick={() => {
              onPaired();
              onClose();
            }}
          >
            Done
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          The pairing code is single-use and expires after 15 minutes. The
          device posts its notifications to ZevaPay once it is paired.
        </Alert>

        <div>
          <Label htmlFor="pairing-account" required>
            Payment account
          </Label>
          <Select
            id="pairing-account"
            value={accountId}
            onChange={(event) => {
              setAccountId(event.target.value);
              setPairing(null);
              setRequestToken((token) => token + 1);
            }}
            hint="Notifications from the device are attributed to this account."
          >
            <option value="">Any account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.label} · {PROVIDER_LIST.find(
                  (provider) => provider.id === account.provider,
                )?.name ?? account.provider}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-soft">
            Pairing code
          </p>
          {error ? (
            <Alert tone="danger" className="mb-3">
              {error}
            </Alert>
          ) : null}
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4">
            <code className="flex-1 font-mono text-lg font-semibold tracking-widest text-ink">
              {loading && !pairing ? "·······" : (pairing?.code ?? "—")}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!pairing}
              className="shrink-0"
            >
              {copied ? (
                <Check className="size-3.5 text-success-600" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy code"}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-ink-muted">
              {expiresAt
                ? `Expires at ${expiresAt.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : ""}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRequestToken((token) => token + 1)}
              loading={loading}
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              New code
            </Button>
          </div>
        </div>

        <ol className="flex flex-col gap-2.5">
          {[
            "Open the ZevaPay Android app on the device.",
            "Go to Settings → Connect Device.",
            "Enter the pairing code shown above.",
            "The device will appear here as soon as it pairs.",
          ].map((step, index) => (
            <li key={step} className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-semibold text-ink-soft">
                {index + 1}
              </span>
              <span className="text-[13px] leading-relaxed text-ink-soft">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
}
