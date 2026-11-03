"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, CircleHelp, LifeBuoy, Plus, TicketCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type SupportTicket = {
  id: string;
  subject: string;
  details: string;
  category: string;
  status: "Open" | "Resolved";
  createdAt: string;
};

const FAQS = [
  { question: "How are payment notifications recorded?", href: "/docs" },
  { question: "Where can I find API examples?", href: "/docs/quick-start" },
  { question: "How do I pair a device?", href: "/dashboard/devices" },
];

export default function SupportPage() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([
    { id: "TKT-1042", subject: "Help pairing a counter device", details: "The pairing code expired before setup finished.", category: "Devices", status: "Open", createdAt: "Nov 2, 2026" },
    { id: "TKT-1031", subject: "Question about a transaction review", details: "I would like to understand why this notification needs review.", category: "Payments", status: "Resolved", createdAt: "Oct 29, 2026" },
  ]);

  function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") ?? "").trim();
    const details = String(form.get("details") ?? "").trim();
    if (subject.length < 5) {
      toast({ title: "Add a little more detail", description: "Use at least five characters for the subject.", tone: "error" });
      return;
    }
    setTickets((items) => [{
      id: `TKT-${1043 + items.length}`,
      subject,
      details,
      category: String(form.get("category") ?? "General"),
      status: "Open",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }, ...items]);
    setOpen(false);
    event.currentTarget.reset();
    toast({ title: "Demo request added", description: "This request is stored only in this page session; it was not sent to support.", tone: "success" });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Help & support"
        description="Find guidance or draft a support request."
        actions={<><DemoBadge label="Demo support" /><Button onClick={() => setOpen(true)}><Plus className="size-4" />New request</Button></>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CircleHelp className="size-4 text-brand-link" />Common questions</CardTitle>
            <CardDescription>Guides for common setup tasks.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-line">
            {FAQS.map((faq) => (
              <Link key={faq.question} href={faq.href} className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-ink-soft transition-colors first:pt-0 last:pb-0 hover:text-brand-link">
                {faq.question}<ArrowUpRight className="size-4 shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LifeBuoy className="size-4 text-brand-link" />Contact support</CardTitle>
            <CardDescription>Draft a request and see how the ticket flow works.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-ink-muted">Requests created here stay in your browser session. No message is sent and no response time is promised.</p>
            <Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>Create a request</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TicketCheck className="size-4 text-brand-link" />Recent requests</CardTitle>
          <CardDescription>Sample tickets for this prototype.</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead><tr className="border-b border-line text-xs text-ink-muted"><th className="pb-3 pr-4 font-medium">Request</th><th className="pb-3 pr-4 font-medium">Category</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 font-medium">Created</th></tr></thead>
              <tbody className="divide-y divide-line">{tickets.map((ticket) => <tr key={ticket.id}><td className="py-3 pr-4"><span className="font-mono text-xs text-ink-muted">{ticket.id}</span><span className="mt-0.5 block font-medium text-ink">{ticket.subject}</span><span className="mt-0.5 block max-w-lg text-xs text-ink-muted">{ticket.details}</span></td><td className="py-3 pr-4 text-ink-soft">{ticket.category}</td><td className="py-3 pr-4"><span className="rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-ink-soft">{ticket.status}</span></td><td className="py-3 text-ink-muted">{ticket.createdAt}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <p className="text-sm text-ink-muted">No requests yet.</p>}
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New support request" description="This is a local-only prototype form." size="md">
        <form onSubmit={submitTicket} className="flex flex-col gap-4">
          <div><Label htmlFor="support-category">Category</Label><Select id="support-category" name="category" defaultValue="General"><option>General</option><option>Payments</option><option>Devices</option><option>API</option><option>Account</option></Select></div>
          <div><Label htmlFor="support-subject" required>Subject</Label><Input id="support-subject" name="subject" minLength={5} maxLength={100} required placeholder="Briefly describe the issue" /></div>
          <div><Label htmlFor="support-details" required>Details</Label><Textarea id="support-details" name="details" minLength={10} maxLength={2000} required placeholder="Add the details someone would need to understand the issue" /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Add demo request</Button></div>
        </form>
      </Modal>
    </div>
  );
}
