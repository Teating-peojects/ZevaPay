"use client";

import * as React from "react";
import { BellRing, ListChecks, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoBadge, DemoNotice } from "@/components/ui/demo-badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  mockFetchNotificationChannelConfigs,
  mockFetchNotificationEvents,
  mockFetchNotificationSettings,
  mockSendTestNotification,
  mockUpdateNotificationChannel,
  mockUpdateNotificationChannelDestination,
  mockUpdateNotificationSetting,
  type MockNotificationChannelConfig,
  type MockNotificationSetting,
  type NotificationChannel,
  type NotificationEvent,
} from "@/mock";
import { ChannelCards, ChannelDestinationForm } from "./channel-cards";
import { ChannelSummary, EventGrid } from "./event-grid";

/**
 * The notifications page.
 *
 * A merchant chooses two things: which channels they want to hear from, and
 * which events travel on them. This page covers both.
 *
 * Nothing is sent. There is no notification service behind this — the backend
 * has no notification model yet — so the page says so plainly rather than
 * letting a "Send test" button imply that a message went out.
 */
export default function NotificationsPage() {
  const { toast } = useToast();

  const [channels, setChannels] = React.useState<MockNotificationChannelConfig[]>(
    () => mockFetchNotificationChannelConfigs(),
  );
  const [settings, setSettings] = React.useState<MockNotificationSetting[]>(() =>
    mockFetchNotificationSettings(),
  );
  const events = React.useMemo(
    () => [...mockFetchNotificationEvents()],
    [],
  );

  const [editing, setEditing] =
    React.useState<NotificationChannel | null>(null);
  const [destination, setDestination] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const enabledCount = channels.filter((config) => config.enabled).length;
  const subscribedCount = settings.filter((setting) =>
    Object.values(setting.channels).some(Boolean),
  ).length;

  function handleToggleChannel(
    channel: NotificationChannel,
    enabled: boolean,
  ) {
    mockUpdateNotificationChannel(channel, enabled);
    setChannels(mockFetchNotificationChannelConfigs());
    // Switching a channel off clears it from every event, so the grid has to
    // be re-read to show that.
    setSettings(mockFetchNotificationSettings());

    toast({
      title: enabled
        ? `Channel turned on: ${channel}`
        : `Channel turned off: ${channel}`,
      description: enabled
        ? "Nothing has been sent. The channel is now available in the event grid."
        : "This channel was removed from every event.",
      tone: "info",
    });
  }

  function handleToggleEvent(
    event: NotificationEvent,
    channel: NotificationChannel,
    enabled: boolean,
  ) {
    mockUpdateNotificationSetting(event, channel, enabled);
    setSettings(mockFetchNotificationSettings());
  }

  function handleOpenConfigure(channel: NotificationChannel) {
    const config = channels.find((row) => row.channel === channel);
    setEditing(channel);
    setDestination(config?.destination ?? "");
    setFormError(null);
  }

  function handleSaveDestination() {
    if (!editing) return;

    if (editing !== "dashboard" && destination.trim() === "") {
      setFormError("Add an address for this channel.");
      return;
    }

    if (editing !== "dashboard" && !isPlausibleDestination(editing, destination)) {
      setFormError(destinationError(editing));
      return;
    }

    setSaving(true);
    mockUpdateNotificationChannelDestination(editing, destination.trim());
    setChannels(mockFetchNotificationChannelConfigs());
    setSaving(false);
    setEditing(null);

    toast({
      title: "Channel updated",
      description:
        "The address is stored. No message has been sent to it.",
      tone: "success",
    });
  }

  function handleTest(channel: NotificationChannel) {
    const result = mockSendTestNotification(channel);

    toast({
      title: "No message was sent",
      description: result?.destination
        ? `A test to ${result.destination} would be sent here. Nothing left your browser.`
        : "There is no delivery service behind this page yet.",
      tone: "warning",
    });
  }

  function handleReset() {
    setChannels(mockFetchNotificationChannelConfigs());
    setSettings(mockFetchNotificationSettings());
    toast({
      title: "Preferences reloaded",
      description: "The stored preferences were read back from the mock layer.",
      tone: "info",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Choose where ZevaPay tells you about your payments."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge label="Demo notifications" />
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reload preferences
            </Button>
          </div>
        }
      />

      <DemoNotice title="Nothing is sent from this page">
        There is no notification service behind this screen. Your choices are
        stored in the demo dataset so the page behaves like the real thing, but
        no email, SMS or chat message is ever produced — not even by the
        &ldquo;Send test&rdquo; buttons.
      </DemoNotice>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Channels in use"
          value={String(enabledCount)}
          hint={`of ${channels.length} available`}
          tone={enabledCount > 0 ? "success" : "neutral"}
          icon={BellRing}
        />
        <StatCard
          label="Events you hear about"
          value={String(subscribedCount)}
          hint={`of ${events.length} available`}
          tone="info"
          icon={ListChecks}
        />
        <StatCard
          label="Deliveries"
          value="0"
          hint="nothing has been sent"
          tone="warning"
          icon={BellRing}
        />
      </div>

      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            Where a notification would be delivered. Switch a channel off and
            it stops carrying every event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChannelCards
            channels={channels}
            onToggle={handleToggleChannel}
            onConfigure={handleOpenConfigure}
            onTest={handleTest}
          />
        </CardContent>
      </Card>

      {/* Event grid */}
      <Card>
        <CardHeader>
          <CardTitle>Event preferences</CardTitle>
          <CardDescription>
            Which events travel on which channels. A tick means &ldquo;tell me
            about this&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ChannelSummary channels={channels} settings={settings} />

          <Alert tone="info" title="A notification is not a receipt">
            Notifications tell you that something happened. A message saying
            &ldquo;payment received&rdquo; does not mean the money is in your
            account — it means ZevaPay recorded a notification that matched the
            payment. The transaction list is where the record of a payment
            lives.
          </Alert>

          <div className="-mx-5 overflow-hidden rounded-b-xl border-t border-line">
            <EventGrid
              events={events}
              channels={channels}
              settings={settings}
              onToggle={handleToggleEvent}
            />
          </div>

          <p className="text-[12px] leading-relaxed text-ink-muted">
            Channels that are switched off are greyed out in the grid. Switch
            one on above and its boxes become usable again.
          </p>
        </CardContent>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Set up ${editing}` : "Set up channel"}
        description="The address is stored on your account. It is never contacted from this prototype."
        footer={null}
      >
        <ChannelDestinationForm
          channel={editing}
          destination={destination}
          onChange={setDestination}
          onSubmit={handleSaveDestination}
          onCancel={() => setEditing(null)}
          saving={saving}
          error={formError}
        />
      </Modal>
    </div>
  );
}

/**
 * A light sanity check on a destination.
 *
 * This is not a validator for real delivery — it only catches the obvious
 * mistakes, so the demo does not accept "hello" as a webhook URL.
 */
function isPlausibleDestination(
  channel: NotificationChannel,
  value: string,
): boolean {
  const trimmed = value.trim();

  if (channel === "email") return trimmed.includes("@");
  if (channel === "sms") return trimmed.replace(/[^0-9]/g, "").length >= 10;
  if (channel === "telegram") return trimmed.startsWith("@");
  if (channel === "discord" || channel === "slack" || channel === "webhook") {
    return /^https:\/\/.+/i.test(trimmed);
  }

  return true;
}

function destinationError(channel: NotificationChannel): string {
  if (channel === "email") {
    return "That does not look like an email address.";
  }
  if (channel === "sms") {
    return "Enter a full mobile number, including the country code.";
  }
  if (channel === "telegram") {
    return "A Telegram chat starts with @, for example @my_shop_bot.";
  }
  return "Enter a full https:// address.";
}
