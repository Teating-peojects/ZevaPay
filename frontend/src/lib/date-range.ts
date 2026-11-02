/**
 * Relative date ranges offered by the date filter on list pages.
 *
 * Shared by the table component and the server-table hook so both agree on
 * the vocabulary.
 */
export type DateRange = "all" | "today" | "7d" | "30d";

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Converts a range into the `from`/`to` bounds the API expects. `undefined`
 * means "no bound", which the API reads as "do not filter on this side".
 */
export function dateRangeBounds(
  range: DateRange,
  now: number = Date.now(),
): { from?: string; to?: string } {
  if (range === "all") return {};

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: new Date(now).toISOString() };
  }

  const days = range === "7d" ? 7 : 30;
  return { from: new Date(now - days * DAY_MS).toISOString() };
}
