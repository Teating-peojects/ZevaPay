"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  MockNotificationChannelConfig,
  MockNotificationSetting,
  NotificationChannel,
  NotificationEvent,
} from "@/mock";

/**
 * The event preference grid.
 *
 * One row per event, one column per channel. A tick means "when this event
 * happens, tell me on this channel". The grid is the part of the page a
 * merchant actually reasons about, so it is a real table rather than a set of
 * separate switches.
 */
export function EventGrid({
  events,
  channels,
  settings,
  onToggle,
}: {
  events: { id: NotificationEvent; label: string }[];
  channels: MockNotificationChannelConfig[];
  settings: MockNotificationSetting[];
  onToggle: (
    event: NotificationEvent,
    channel: NotificationChannel,
    enabled: boolean,
  ) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-surface px-5 py-3 text-left text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
            >
              Event
            </th>
            {channels.map((config) => (
              <th
                key={config.channel}
                scope="col"
                className="px-3 py-3 text-center text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
              >
                <span className="capitalize">{config.channel}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const setting = settings.find((row) => row.event === event.id);

            return (
              <tr
                key={event.id}
                className="border-t border-line transition-colors hover:bg-elevated"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-5 py-3 text-left text-[13px] font-medium text-ink"
                >
                  <span className="block">{event.label}</span>
                  <span className="mt-0.5 block font-mono text-[11px] font-normal text-ink-faint">
                    {event.id}
                  </span>
                </th>
                {channels.map((config) => {
                  const enabled = setting?.channels[config.channel] ?? false;
                  // A channel that is switched off cannot carry an event, so
                  // its boxes are disabled and read as empty.
                  const blocked = !config.enabled;

                  return (
                    <td key={config.channel} className="px-3 py-3 text-center">
                      <button
                        type="button"
                        disabled={blocked}
                        aria-pressed={enabled}
                        aria-label={`${event.label} on ${config.channel}`}
                        title={
                          blocked
                            ? `${config.channel} is switched off`
                            : undefined
                        }
                        onClick={() =>
                          onToggle(event.id, config.channel, !enabled)
                        }
                        className={`inline-flex size-6 items-center justify-center rounded-md border transition-colors ${
                          enabled
                            ? "border-brand-solid bg-brand-solid text-white"
                            : "border-line-strong bg-elevated text-transparent hover:border-brand-solid"
                        } ${blocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                      >
                        <Check className="size-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A short summary of how many events each channel carries.
 *
 * It sits above the grid so a merchant can see the shape of their setup
 * without reading every row.
 */
export function ChannelSummary({
  channels,
  settings,
}: {
  channels: MockNotificationChannelConfig[];
  settings: MockNotificationSetting[];
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {channels.map((config) => {
        const count = settings.filter((row) => row.channels[config.channel]).length;

        return (
          <li key={config.channel}>
            <Badge
              tone={config.enabled ? "brand" : "neutral"}
              className="capitalize"
            >
              {config.channel} · {count}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
