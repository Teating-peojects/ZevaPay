"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select, Switch } from "@/components/ui/form";
import { ProviderBadge } from "@/components/shared/provider-badge";
import { AccountStatusBadge } from "@/components/shared/status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";
import { useToast } from "@/components/ui/toast";
import { formatBDT, formatDate } from "@/lib/format";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { AccountDemoSettings } from "@/lib/demo-account-settings";
import type {
  AccountStatus,
  AccountType,
  ApiPaymentAccount,
} from "@/types/api";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  PERSONAL: "Personal",
  MERCHANT: "Merchant",
  AGENT: "Agent",
  BUSINESS: "Business",
};

export type { AccountDemoSettings };

/**
 * The account settings panel.
 *
 * The real fields — label, account type, status — are saved through the API.
 * The demo fields are saved in the browser only, and every one of them is
 * marked with a Demo badge so nobody mistakes them for real account state.
 */
export function AccountSettingsDrawer({
  account,
  settings,
  onClose,
  onSettingsChange,
}: {
  account: ApiPaymentAccount | null;
  /** The demo settings for this account, when it is open. */
  settings: AccountDemoSettings | null;
  onClose: () => void;
  /** Called when the demo fields change. */
  onSettingsChange: (
    id: string,
    settings: AccountDemoSettings,
  ) => void;
}) {
  if (!account) return null;

  // The panel is keyed by the account id, so each account gets a form that
  // starts from its own values. There is no effect copying the record in
  // after the fact, and no window where the fields show another account's
  // numbers.
  return (
    <AccountSettingsPanel
      key={account.id}
      account={account}
      settings={settings}
      onClose={onClose}
      onSettingsChange={onSettingsChange}
    />
  );
}

/**
 * The drawer for one account.
 *
 * Every field starts from the record it belongs to, so the form is correct
 * on the first paint.
 */
function AccountSettingsPanel({
  account,
  settings,
  onClose,
  onSettingsChange,
}: {
  account: ApiPaymentAccount;
  settings: AccountDemoSettings | null;
  onClose: () => void;
  onSettingsChange: (
    id: string,
    settings: AccountDemoSettings,
  ) => void;
}) {
  const { toast } = useToast();

  const [label, setLabel] = React.useState(account.label);
  const [accountType, setAccountType] = React.useState<AccountType>(
    account.accountType,
  );
  const [status, setStatus] = React.useState<AccountStatus>(account.status);

  const [priority, setPriority] = React.useState(settings?.priority ?? 1);
  const [enabled, setEnabled] = React.useState(settings?.enabled ?? true);
  const [dailyLimit, setDailyLimit] = React.useState(
    String(settings?.dailyLimit ?? 200_000),
  );

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      // Only the fields the API knows about are sent.
      await apiFetch(`/api/v1/merchant/accounts/${account.id}`, {
        method: "PATCH",
        body: {
          label: label.trim(),
          accountType,
          status,
        },
      });

      onSettingsChange(account.id, {
        priority,
        enabled,
        dailyLimit: Number(dailyLimit) || 0,
        health: settings?.health ?? 92,
      });

      toast({
        title: "Account saved",
        description: `${label.trim()} was updated. The demo fields were saved in this browser only.`,
        tone: "success",
      });
      onClose();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "We could not reach the server. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const limitValue = Number(dailyLimit);
  const health = settings?.health ?? 92;

  const limitHint =
    Number.isFinite(limitValue) && limitValue > 0
      ? `Payments above ${formatBDT(limitValue)} would be held for review.`
      : "No ceiling is set for this account.";

  return (
    <Drawer
      open
      onClose={onClose}
      title={account.label}
      description="Account label, type and priority."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} type="button">
            <Save className="size-4" aria-hidden="true" />
            Save account
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {error ? <Alert tone="danger">{error}</Alert> : null}

        {/* Identity — read only */}
        <div className="flex flex-col gap-1 rounded-lg border border-line bg-elevated px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <ProviderBadge provider={account.provider} size="sm" />
            <AccountStatusBadge status={account.status} />
          </div>
          <span className="mt-2 font-mono text-[13px] text-ink">
            {account.accountNumber}
          </span>
          <p className="text-[12px] text-ink-muted">
            The account number is masked. ZevaPay never stores the full number on
            this screen.
          </p>
          <p className="text-[12px] text-ink-muted">
            Added {formatDate(account.createdAt)}
          </p>
        </div>

        {/* Real fields */}
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="account-label" required>
              Label
            </Label>
            <Input
              id="account-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={80}
            />
            <p className="mt-1.5 text-[12px] text-ink-muted">
              The name your team uses to tell this account apart.
            </p>
          </div>

          <div>
            <Label htmlFor="account-type" required>
              Account type
            </Label>
            <Select
              id="account-type"
              value={accountType}
              onChange={(event) =>
                setAccountType(event.target.value as AccountType)
              }
            >
              <option value="PERSONAL">Personal</option>
              <option value="MERCHANT">Merchant</option>
              <option value="AGENT">Agent</option>
              <option value="BUSINESS">Business</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="account-status" required>
              Status
            </Label>
            <Select
              id="account-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AccountStatus)
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              A suspended account stops receiving new notifications.
            </p>
          </div>
        </div>

        {/* Demo fields */}
        <div className="flex flex-col gap-4 rounded-lg border border-warning-line bg-warning-tint px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-ink">Routing and limits</p>
            <DemoBadge label="Demo fields" />
          </div>

          <p className="text-[13px] leading-relaxed text-ink-muted">
            The API stores a label, a type and a status. Priority, the enable
            toggle and the daily limit are sample values — they are saved in this
            browser and are never sent to the server.
          </p>

          <div>
            <Label htmlFor="account-priority">
              Priority
              <span className="ml-2 align-middle">
                <DemoBadge label="Demo" />
              </span>
            </Label>
            <Input
              id="account-priority"
              type="number"
              min={1}
              max={99}
              value={priority}
              onChange={(event) =>
                setPriority(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-24"
            />
            <p className="mt-1.5 text-[12px] text-ink-muted">
              Accounts with a lower number are offered to customers first.
            </p>
          </div>

          <div>
            <Label htmlFor="account-limit">
              Daily limit (BDT)
              <span className="ml-2 align-middle">
                <DemoBadge label="Demo" />
              </span>
            </Label>
            <Input
              id="account-limit"
              type="number"
              min={0}
              value={dailyLimit}
              onChange={(event) => setDailyLimit(event.target.value)}
            />
            <p className="mt-1.5 text-[12px] text-ink-muted">{limitHint}</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Switch
              id="account-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              label="Accept payments"
              description="Turn this off to keep the account listed but stop routing payments to it."
            />
            <DemoBadge label="Demo" />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-warning-line pt-3">
            <p className="text-[13px] text-ink-soft">Account health</p>
            <span className="flex items-center gap-2">
              <Badge
                tone={
                  health >= 85 ? "success" : health >= 60 ? "warning" : "danger"
                }
              >
                {health}%
              </Badge>
              <DemoBadge label="Demo" />
            </span>
          </div>

          <p className="text-[12px] text-ink-muted">
            {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType} ·{" "}
            {account.provider.toLowerCase()} account
          </p>
        </div>
      </div>
    </Drawer>
  );
}
