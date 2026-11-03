"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import {
  platformNotificationSchema,
  type PlatformNotificationValues,
} from "@/lib/schemas";

/**
 * The admin console's "announce something to merchants" form.
 *
 * The announcement it creates lives in the demo layer. The backend has no
 * notification service, so nothing is delivered to anybody — the page says
 * so, and the toast repeats it.
 */
export function NotificationForm({
  open,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: PlatformNotificationValues) => void;
  saving: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlatformNotificationValues>({
    resolver: zodResolver(platformNotificationSchema),
    defaultValues: {
      title: "",
      detail: "",
      channel: "dashboard",
      audience: "All merchants",
    },
  });

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Send an announcement"
      description="Writes a notification record to the demo list."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={close} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            form="platform-notification-form"
            loading={saving}
          >
            Queue announcement
          </Button>
        </>
      }
    >
      <form
        id="platform-notification-form"
        onSubmit={handleSubmit(onSave)}
        noValidate
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="notification-title" required>
              Title
            </Label>
            <Input
              id="notification-title"
              error={errors.title?.message}
              {...register("title")}
            />
          </div>

          <div>
            <Label htmlFor="notification-detail" required>
              Message
            </Label>
            <Textarea
              id="notification-detail"
              error={errors.detail?.message}
              {...register("detail")}
            />
          </div>

          <div>
            <Label htmlFor="notification-channel" required>
              Channel
            </Label>
            <Select
              id="notification-channel"
              error={errors.channel?.message}
              {...register("channel")}
            >
              <option value="dashboard">Dashboard — shown in the console</option>
              <option value="email">Email — to the account address</option>
              <option value="sms">SMS — to the registered mobile number</option>
              <option value="telegram">Telegram — to the merchant&apos;s bot chat</option>
              <option value="discord">Discord — to a channel webhook</option>
              <option value="slack">Slack — to a channel webhook</option>
              <option value="webhook">Webhook — to a configured endpoint</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="notification-audience" required>
              Audience
            </Label>
            <Input
              id="notification-audience"
              error={errors.audience?.message}
              {...register("audience")}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
