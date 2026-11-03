"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/form";
import { WEBHOOK_EVENTS, type MockWebhook } from "@/mock";

/**
 * The webhook endpoint form.
 *
 * The event list is fixed by the product — a merchant picks which of the
 * events ZevaPay sends to this endpoint. The signing secret is never edited
 * here; it is shown once when the endpoint is created.
 */
export function WebhookForm({
  open,
  onClose,
  onSave,
  webhook,
}: {
  open: boolean;
  onClose: () => void;
  /** Called with the fields the reader entered. */
  onSave: (values: WebhookValues) => void;
  /** The endpoint being edited, or null when creating a new one. */
  webhook: MockWebhook | null;
}) {
  const [url, setUrl] = React.useState(webhook?.url ?? "");
  const [description, setDescription] = React.useState(
    webhook?.description ?? "",
  );
  const [events, setEvents] = React.useState<string[]>(
    webhook?.events ?? ["payment.confirmed"],
  );
  const [error, setError] = React.useState<string | null>(null);

  function toggleEvent(event: string) {
    setEvents((current) =>
      current.includes(event)
        ? current.filter((entry) => entry !== event)
        : [...current, event],
    );
  }

  function handleSubmit() {
    setError(null);

    const trimmedUrl = url.trim();
    if (!/^https?:\/\/.+/.test(trimmedUrl)) {
      setError("The endpoint must be a full http or https URL.");
      return;
    }

    if (events.length === 0) {
      setError(
        "Choose at least one event. An endpoint with no events never receives anything.",
      );
      return;
    }

    onSave({
      url: trimmedUrl,
      description: description.trim(),
      events: events as WebhookValues["events"],
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={webhook ? "Edit webhook endpoint" : "Add webhook endpoint"}
      description={
        webhook
          ? "Change where ZevaPay sends events and which events it sends."
          : "ZevaPay will POST events to this URL."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            {webhook ? "Save changes" : "Add endpoint"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          This endpoint is a sample. Nothing is sent to it — the backend has no
          webhook delivery service yet.
        </Alert>

        {error ? <Alert tone="danger">{error}</Alert> : null}

        <div>
          <Label htmlFor="webhook-url" required>
            Endpoint URL
          </Label>
          <Input
            id="webhook-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://your-store.test/api/zevapay"
            maxLength={300}
          />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            ZevaPay sends a POST request with a JSON body. Answer with a 2xx
            status within 10 seconds or the delivery is retried.
          </p>
        </div>

        <div>
          <Label htmlFor="webhook-description">Description</Label>
          <Input
            id="webhook-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this endpoint is for"
            maxLength={120}
          />
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-soft">
            Events to send
          </p>
          <div className="flex flex-col gap-2.5 rounded-lg border border-line bg-elevated px-4 py-4">
            {WEBHOOK_EVENTS.map((event) => (
              <Checkbox
                key={event}
                id={`webhook-event-${event}`}
                checked={events.includes(event)}
                onChange={() => toggleEvent(event)}
                label={event}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-ink-muted">
            {events.length} of {WEBHOOK_EVENTS.length} events selected.
          </p>
        </div>

        <div>
          <Label htmlFor="webhook-note">Signing secret</Label>
          <Textarea
            id="webhook-note"
            value="Generated when the endpoint is added. It is shown once, then masked — use it to verify the signature on every request."
            readOnly
            className="min-h-16 bg-elevated text-[12px] text-ink-muted"
          />
        </div>
      </div>
    </Modal>
  );
}

/** The fields the webhook form collects. */
export interface WebhookValues {
  url: string;
  description: string;
  events: MockWebhook["events"];
}
