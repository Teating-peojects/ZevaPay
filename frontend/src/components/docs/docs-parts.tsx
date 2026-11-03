import * as React from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The shared building blocks of a documentation page.
 *
 * Every page in the portal uses the same heading rhythm and the same
 * "illustrative" banner, so a reader learns once where to look.
 */

/** The banner every code example sits under. */
export function IllustrativeNotice({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Alert tone="warning" title="Illustrative example" className={className}>
      {children ??
        "The code below shows the shape of a call. It is written against a placeholder host and placeholder credentials, and is not a copy-paste guarantee against a live endpoint."}
    </Alert>
  );
}

/** A page title, with the optional badge above it. */
export function DocsTitle({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <header className="border-b border-line pb-6">
      {badge ? (
        <Badge tone="brand" className="mb-4">
          {badge}
        </Badge>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft sm:text-base">
        {description}
      </p>
    </header>
  );
}

/** A section with an anchor target. */
export function DocsSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** A paragraph of prose. */
export function DocsText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] leading-relaxed text-ink-soft">{children}</p>
  );
}

/** A bulleted list. */
export function DocsList({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-soft"
        >
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500"
            aria-hidden="true"
          />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A definition-style block: a term on the left, an explanation on the right.
 */
export function DocsDefinition({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-[13px] font-semibold text-ink">{term}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}

/**
 * A table of fields, used by the request and response sections.
 */
export function DocsFieldTable({
  fields,
  caption,
}: {
  fields: {
    name: string;
    type: string;
    required?: boolean;
    description: string;
  }[];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left">
        {caption ? (
          <caption className="border-b border-line bg-elevated px-4 py-2.5 text-left text-[12px] font-semibold text-ink-soft">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b border-line bg-elevated">
            <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
              Field
            </th>
            <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
              Type
            </th>
            <th className="px-4 py-2.5 text-[12px] font-semibold text-ink-muted">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {fields.map((field) => (
            <tr key={field.name} className="align-top">
              <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-ink">
                {field.name}
                {field.required ? (
                  <span className="ml-1 text-danger-fg" aria-label="required">
                    *
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-ink-muted">
                {field.type}
              </td>
              <td className="px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
                {field.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Links to the neighbouring pages, at the foot of every page. */
export function DocsPager({
  previous,
  next,
}: {
  previous?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <nav
      className="mt-14 grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
      aria-label="Documentation pages"
    >
      {previous ? (
        <Link
          href={previous.href}
          className="rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:bg-elevated"
        >
          <span className="block text-[11px] tracking-wide text-ink-faint uppercase">
            Previous
          </span>
          <span className="mt-1 block text-[13px] font-medium text-ink">
            {previous.label}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={next.href}
          className="rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:bg-elevated sm:col-start-2 sm:text-right"
        >
          <span className="block text-[11px] tracking-wide text-ink-faint uppercase">
            Next
          </span>
          <span className="mt-1 block text-[13px] font-medium text-ink">
            {next.label}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
