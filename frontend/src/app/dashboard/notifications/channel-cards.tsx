"use client";

import * as React from "react";
import {
  AtSign,
  Bell,
  Hash,
  MessageCircle,
  MessagesSquare,
  Send,
  Webhook,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import type { MockNotificationChannelConfig, NotificationChannel } from "@/mock";

/**
 * The icon for each channel.
 *
 * The channels are named after the products merchants already use, so the
 * icon is what makes a card recognisable at a glance.
 */
const CHANNEL_ICONS: Record<
  NotificationChannel,
  React.ComponentType<{ className?: string }>
> = {
  email: AtSign,
  dashboard: Bell,
  sms: MessageCircle,
  telegram: Send,
  discord: MessagesSquare,
  slack: Hash,
  webhook: Webhook,
};

/**
 * The channels a merchant can receive notifications on.
 *
 * Each card shows where the channel would deliver to and whether the merchant
 * has switched it on. The switch is the important control: a channel that is
 * off carries no events at all.
 */
export function ChannelCards({
  channels,
  onToggle,
  onConfigure,
  onTest,
}: {
  channels: MockNotificationChannelConfig[];
  onToggle: (channel: NotificationChannel, enabled: boolean) => void;
  onConfigure: (channel: NotificationChannel) => void;
  onTest: (channel: NotificationChannel) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {channels.map((config) => {
        const Icon = CHANNEL_ICONS[config.channel];

        return (
          <div
            key={config.channel}
            className={`surface flex flex-col gap-3 rounded-xl border p-4 shadow-card ${
              config.enabled ? "" : "bg-elevated"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    config.enabled
                      ? "bg-brand-tint text-brand-ink"
                      : "bg-sunken text-ink-faint"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold capitalize text-ink">
                    {config.channel}
                  </p>
                  <p className="truncate text-[12px] text-ink-muted">
                    {config.destination ?? "Not set up"}
                  </p>
                </div>
              </div>
              <Badge tone={config.enabled ? "success" : "neutral"} dot>
                {config.enabled ? "On" : "Off"}
              </Badge>
            </div>

            {config.note ? (
              <p className="text-[12px] leading-relaxed text-ink-muted">
                {config.note}
              </p>
            ) : null}

            <div className="mt-auto flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="flex-1"
                aria-label={`${config.destination ? "Edit" : "Set up"} the ${config.channel} channel`}
                onClick={() => onConfigure(config.channel)}
              >
                {config.destination ? "Edit" : "Set up"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="flex-1"
                aria-label={`Send a test on the ${config.channel} channel`}
                disabled={!config.enabled}
                onClick={() => onTest(config.channel)}
              >
                Send test
              </Button>
            </div>

            <label className="flex cursor-pointer items-center gap-2 border-t border-line pt-3 text-[12px] font-medium text-ink-soft">
              <input
                type="checkbox"
                checked={config.enabled}
                aria-label={`Use the ${config.channel} channel`}
                onChange={(event) =>
                  onToggle(config.channel, event.target.checked)
                }
                className="size-4 cursor-pointer rounded border-line-strong accent-brand-solid"
              />
              Use this channel
            </label>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The form that sets where a channel delivers to.
 *
 * It lives in a modal on the page rather than inside the card, because the
 * destination for a Slack webhook is longer than a card can hold.
 */
export function ChannelDestinationForm({
  channel,
  destination,
  onChange,
  onSubmit,
  onCancel,
  saving,
  error,
}: {
  channel: NotificationChannel | null;
  destination: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  if (!channel) return null;

  const placeholders: Record<NotificationChannel, string> = {
    email: "you@example.com",
    dashboard: "Notification centre",
    sms: "+880 17XX-XXXXXX",
    telegram: "@your_bot_chat",
    discord: "https://discord.com/api/webhooks/…",
    slack: "https://hooks.slack.com/services/…",
    webhook: "https://your-site.test/api/zevapay",
  };

  const labels: Record<NotificationChannel, string> = {
    email: "Email address",
    dashboard: "Shown in",
    sms: "Mobile number",
    telegram: "Telegram chat",
    discord: "Discord webhook URL",
    slack: "Slack webhook URL",
    webhook: "Endpoint",
  };

  const readOnly = channel === "dashboard";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label
          htmlFor="channel-destination"
          className="mb-1.5 block text-[13px] font-medium text-ink-soft"
        >
          {labels[channel]}
        </label>
        <Input
          id="channel-destination"
          value={destination}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholders[channel]}
          readOnly={readOnly}
          error={error ?? undefined}
          hint={
            readOnly
              ? "Dashboard notifications appear in the notification centre and have no address."
              : undefined
          }
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={readOnly}>
          Save channel
        </Button>
      </div>
    </form>
  );
}
