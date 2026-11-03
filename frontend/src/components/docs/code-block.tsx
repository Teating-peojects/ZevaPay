"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

export interface CodeSample {
  /** The tab label, e.g. "Node.js". */
  id: string;
  label: string;
  /** The code itself. */
  code: string;
}

/**
 * A code block with one tab per language and a copy button.
 *
 * The examples it renders are illustrative: they show the shape of a call,
 * not a promise about a live endpoint. The banner above the tabs says so,
 * because a reader who copies a curl command will expect it to work.
 */
export function CodeTabs({
  samples,
  className,
}: {
  samples: CodeSample[];
  className?: string;
}) {
  const { toast } = useToast();
  const { copied, copy } = useCopyToClipboard();
  const [active, setActive] = React.useState(samples[0]?.id ?? "");

  const current =
    samples.find((sample) => sample.id === active) ?? samples[0] ?? null;

  async function handleCopy() {
    if (!current) return;
    const ok = await copy(current.code);
    toast({
      title: ok ? "Code copied" : "Could not copy",
      description: ok
        ? `The ${current.label} example is on your clipboard.`
        : "Your browser blocked clipboard access. Select the code and copy it manually.",
      tone: ok ? "success" : "error",
    });
  }

  if (!current) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-elevated",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-sunken px-3 py-2">
        <div
          className="flex items-center gap-1 overflow-x-auto scrollbar-thin"
          role="tablist"
          aria-label="Code language"
        >
          {samples.map((sample) => {
            const isActive = sample.id === current.id;
            return (
              <button
                key={sample.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(sample.id)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink-soft",
                )}
              >
                {sample.label}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleCopy()}
          className="shrink-0"
        >
          {copied ? (
            <Check className="size-3.5 text-success-fg" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12px] leading-relaxed text-ink-soft">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
