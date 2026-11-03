"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/form";
import {
  DOC_PAGES,
  DOC_SEARCH_ENTRIES,
  docsHref,
  type DocsSearchEntry,
} from "@/lib/docs-content";
import { cn } from "@/lib/utils";

/** How many results the search shows at once. */
const MAX_RESULTS = 8;

/**
 * Scores one entry against the query.
 *
 * A heading that starts with the term beats a heading that merely contains
 * it, and a heading beats body text. Returns `null` when the entry does not
 * match at all.
 */
function scoreEntry(entry: DocsSearchEntry, term: string): number | null {
  const heading = entry.heading.toLowerCase();
  const text = entry.text.toLowerCase();

  if (heading.startsWith(term)) return 100;
  if (heading.includes(term)) return 70;
  if (text.includes(term)) return 40;
  return null;
}

/**
 * The documentation search box.
 *
 * It searches a hand-written index of headings (`DOC_SEARCH_ENTRIES`) rather
 * than the rendered pages, so it works before the page content exists and
 * stays fast enough to run on every keystroke.
 */
export function DocsSearch({ className }: { className?: string }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const term = query.trim().toLowerCase();

  const results = React.useMemo(() => {
    if (!term) return [];

    const scored: { entry: DocsSearchEntry; score: number }[] = [];

    for (const entry of DOC_SEARCH_ENTRIES) {
      const score = scoreEntry(entry, term);
      if (score !== null) scored.push({ entry, score });
    }

    // A page title that matches the term is worth showing even when no
    // heading matches, so the reader still gets somewhere to go.
    for (const page of DOC_PAGES) {
      if (!page.title.toLowerCase().includes(term)) continue;
      if (scored.some((row) => row.entry.slug === page.slug && !row.entry.anchor)) {
        continue;
      }
      scored.push({
        entry: {
          slug: page.slug,
          anchor: "",
          heading: page.title,
          text: page.description,
        },
        score: 60,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, MAX_RESULTS).map((row) => row.entry);
  }, [term]);

  // Close the results when the reader clicks elsewhere.
  React.useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function handleClear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search the documentation"
          aria-label="Search the documentation"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="pr-9 pl-9"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {open && term ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-overlay">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-ink-muted">
              Nothing matched &ldquo;{query.trim()}&rdquo;. Try a shorter term, or
              browse the sidebar.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result) => {
                const href = docsHref(result.slug, result.anchor);
                const page = DOC_PAGES.find((p) => p.slug === result.slug);

                return (
                  <li key={`${result.slug}#${result.anchor}`}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-elevated"
                    >
                      <span className="block text-[13px] font-medium text-ink">
                        {result.heading}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
                        {result.text}
                      </span>
                      {result.anchor && page ? (
                        <span className="mt-1 block text-[11px] text-ink-faint">
                          {page.title}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
