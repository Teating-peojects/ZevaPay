import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, Laptop } from "lucide-react";
import { PublicLayout } from "@/components/marketing/public-layout";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the ZevaPay team.",
};

const DETAILS = [
  {
    icon: Mail,
    title: "Support email",
    body: "support@zevapay.com",
    detail:
      "Include your business name on the account plus a short description of the problem.",
  },
  {
    icon: Clock,
    title: "Support hours",
    body: "Mon–Sat, 9:00 AM – 8:00 PM BST (UTC+6)",
    detail:
      "Anything sent outside those hours is picked up the next working day.",
  },
  {
    icon: Laptop,
    title: "For device issues",
    body: "Include the device ID and Android version",
    detail:
      "Both are shown on the device card in your dashboard, and speed up diagnosis considerably.",
  },
];

export default function ContactPage() {
  return (
    <PublicLayout>
      <section className="border-b border-line bg-elevated">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Contact
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Questions about pairing a device, connecting a payment account, or
            using the dashboard? Here is how to reach us.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                Send us a message
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                Tell us what you were doing and what you expected to happen.
                The more specific you are, the faster we can help.
              </p>

              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                Other ways to reach us
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                The email address below reaches the team directly, whether or
                not you use the form.
              </p>

              <ul className="mt-6 flex flex-col gap-4">
                {DETAILS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className="rounded-xl border border-line bg-surface p-5"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-tint">
                        <Icon
                          className="size-4 text-brand-link"
                          aria-hidden="true"
                        />
                      </span>
                      <h3 className="mt-3.5 text-[14px] font-semibold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] font-medium text-ink-soft">
                        {item.body}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                        {item.detail}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 rounded-xl border border-line bg-elevated px-5 py-4">
                <h3 className="text-[14px] font-semibold text-ink">
                  Before you write
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  Most questions are answered by the How It Works section of the
                  home page, which walks through connecting a payment account,
                  pairing an Android device, and reviewing recorded
                  transactions.
                </p>
                <Link
                  href="/#how-it-works"
                  className="mt-3 inline-block text-[13px] font-medium text-brand-link underline underline-offset-2 hover:text-brand-link-hover"
                >
                  Read How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
