"use client";

import * as React from "react";
import { FileUp, Upload } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { mockImportCustomersCsv, type MockCustomerImportResult } from "@/mock";

/**
 * The CSV import panel.
 *
 * The file is read in the browser and never uploaded. The rows are validated
 * by the mock layer, and every rejected row is reported back rather than
 * being dropped silently.
 */
export function CustomerImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  /** Called after at least one customer was added. */
  onImported: () => void;
}) {
  if (!open) return null;

  // The modal is keyed by the open state, so each time it opens it starts
  // with a clean slate — no file, no result, no error — without an effect
  // clearing them out after the fact.
  return (
    <CustomerImportPanel
      key="import"
      onClose={onClose}
      onImported={onImported}
    />
  );
}

/**
 * The modal body.
 */
function CustomerImportPanel({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const { toast } = useToast();
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<MockCustomerImportResult | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError(null);
    setResult(null);
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      return;
    }

    let contents: string;
    try {
      contents = await file.text();
    } catch {
      setError("The file could not be read. Please try again.");
      return;
    }

    const outcome = mockImportCustomersCsv(contents);
    setResult(outcome);

    if (outcome.created > 0) {
      onImported();
      toast({
        title: "Import finished",
        description: `${outcome.created} customer${outcome.created === 1 ? "" : "s"} added, ${outcome.skipped} skipped, ${outcome.errors.length} rejected.`,
        tone: "success",
      });
      return;
    }

    toast({
      title: "Nothing was imported",
      description:
        outcome.errors.length > 0
          ? "Every row in the file was rejected. Check the messages below."
          : "Every row in the file was already in the directory.",
      tone: "warning",
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Import customers"
      description="Add customers to the directory from a CSV file."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
          <Button
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Upload className="size-4" aria-hidden="true" />
            Choose file
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          The file is read in your browser and is never uploaded. It needs a{" "}
          <code className="font-mono">name</code> column in the first row;{" "}
          <code className="font-mono">email</code>,{" "}
          <code className="font-mono">phone</code>,{" "}
          <code className="font-mono">tags</code> and{" "}
          <code className="font-mono">notes</code> are optional.
        </Alert>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong bg-elevated px-6 py-8 text-center transition-colors hover:bg-sunken"
        >
          <FileUp className="size-6 text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-medium text-ink">
            {fileName ?? "Choose a CSV file"}
          </span>
          <span className="text-[13px] text-ink-muted">
            {fileName
              ? "Choose a different file to replace it."
              : "The file is processed locally and never leaves your browser."}
          </span>
        </button>

        {error ? <Alert tone="danger">{error}</Alert> : null}

        {result ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-success-tint px-2 py-1 text-[12px] font-semibold text-success-text">
                {result.created} added
              </span>
              <span className="rounded-md bg-elevated px-2 py-1 text-[12px] font-semibold text-ink-soft">
                {result.skipped} skipped
              </span>
              <span className="rounded-md bg-danger-tint px-2 py-1 text-[12px] font-semibold text-danger-text">
                {result.errors.length} rejected
              </span>
            </div>

            {result.errors.length > 0 ? (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-soft">
                  Rejected rows
                </p>
                <ul className="flex flex-col gap-1.5">
                  {result.errors.map((entry) => (
                    <li
                      key={`${entry.row}-${entry.message}`}
                      className="text-[13px] text-ink-muted"
                    >
                      <span className="font-mono text-ink-soft">
                        Row {entry.row}
                      </span>{" "}
                      — {entry.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
