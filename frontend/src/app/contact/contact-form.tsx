"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { UiOnlyNotice } from "@/components/auth/ui-only-notice";
import { contactSchema, type ContactValues } from "@/lib/schemas";

/**
 * The contact form.
 *
 * There is no ticketing system behind the contact page yet, so the form
 * validates the input and then says plainly that the message was not sent.
 * Pretending otherwise would be the dishonest option.
 */
export function ContactForm() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: "general", message: "" },
  });

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center rounded-lg border border-success-line bg-success-tint px-6 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface">
            <CircleCheck
              className="size-5 text-success-fg"
              aria-hidden="true"
            />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">
            Message ready
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            Your message passed every check. It was not sent, because the
            contact page has no ticketing system behind it yet.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            reset();
            setSent(false);
          }}
        >
          Write another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(() => setSent(true))}
      noValidate
      className="flex flex-col gap-5"
    >
      <UiOnlyNotice>
        This page is not connected to a ticketing system, so nothing is sent
        and no reply is scheduled. Use the email address below to reach the
        team directly.
      </UiOnlyNotice>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name" required>
            Your name
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Arif Hossain"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <Label htmlFor="topic" required>
            What is this about?
          </Label>
          <Select id="topic" error={errors.topic?.message} {...register("topic")}>
            <option value="general">A general question</option>
            <option value="device">Pairing or connecting a device</option>
            <option value="payment">A payment that was not recorded</option>
            <option value="account">My merchant account</option>
            <option value="api">The developer API</option>
            <option value="billing">Plans, limits or billing</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="message" required>
            Message
          </Label>
          <Textarea
            id="message"
            rows={5}
            placeholder="Tell us what you were doing and what you expected to happen."
            error={errors.message?.message}
            {...register("message")}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Send className="size-4" aria-hidden="true" />
          Send message
        </Button>
      </div>

      {errors.message ? (
        <Alert tone="danger" title="Check the message">
          The message field needs attention before it can be sent.
        </Alert>
      ) : null}
    </form>
  );
}
