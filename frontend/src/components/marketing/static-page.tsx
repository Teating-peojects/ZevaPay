import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export interface StaticSection {
  heading: string;
  body: string;
}

/**
 * Shared layout for the simple informational pages (About, Contact, Privacy,
 * Terms). Keeps these pages consistent without pulling in a full CMS.
 */
export function StaticPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: StaticSection[];
}) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{intro}</p>
          </div>
        </section>

        <section className="border-b border-neutral-200">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-col gap-10">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-lg font-semibold tracking-tight text-ink">
                    {section.heading}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-5">
              <p className="text-[13px] leading-relaxed text-ink-muted">
                This page describes the ZevaPay service as it operates today.
                It is a summary for your convenience and does not replace a
                formal legal agreement.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="text-[13px] font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
