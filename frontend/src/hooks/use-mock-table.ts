"use client";

import * as React from "react";
import type { DateRange } from "@/lib/date-range";
import { amountBounds } from "@/lib/money";

/**
 * State a mock-backed table needs.
 *
 * Mirrors `ServerTableState` so the two table modes feel the same to the
 * caller, even though one resolves against the API and the other against the
 * mock layer.
 */
export interface MockTableState {
  query: string;
  filters: Record<string, string>;
  dateRange: DateRange;
  /** Inclusive lower bound on the amount, in BDT. */
  minAmount?: number;
  /** Inclusive upper bound on the amount, in BDT. */
  maxAmount?: number;
  /** Field the rows are sorted by. */
  sort?: string;
  /** Sort direction. */
  order?: "asc" | "desc";
}

/**
 * The amount window, as the reader typed it.
 *
 * The table's inputs are text fields, so the raw strings are kept here and the
 * numeric bounds are derived when the mock layer is called.
 */
export interface MockAmountRange {
  min: string;
  max: string;
}

export interface MockTableOptions {
  /**
   * The mock list function to call.
   *
   * It receives the table's state translated into the mock layer's own
   * parameter names — `q` for the search term, `status` / `provider` for the
   * well-known filters, and `filters` for anything else — so a mock endpoint
   * can be swapped for its real counterpart without the page changing.
   */
  fetch: (
    options: MockTableState & {
      page: number;
      pageSize: number;
      /** The search term, in the API's own name. */
      q?: string;
      /** The named filters, in the API's own bag. */
      filters?: Record<string, string>;
      /** The well-known filters, lifted to top-level parameters. */
      status?: string;
      provider?: string;
    },
  ) => {
    rows: unknown[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
  pageSize?: number;
  initialQuery?: string;
  initialFilters?: Record<string, string>;
  initialDateRange?: DateRange;
  initialSort?: { sort: string; order: "asc" | "desc" };
  /** Extra options merged into every call, e.g. a merchant scope. */
  extra?: Record<string, unknown>;
}

export interface MockTableResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  query: string;
  filters: Record<string, string>;
  dateRange: DateRange;
  /** The current amount window, as the reader typed it. */
  amount: MockAmountRange;
  sort: { sort: string; order: "asc" | "desc" };
  setQuery: (query: string) => void;
  setFilter: (id: string, value: string) => void;
  setDateRange: (range: DateRange) => void;
  setAmount: (value: MockAmountRange) => void;
  setSort: (sort: { sort: string; order: "asc" | "desc" }) => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

/**
 * Drives a table whose filtering, sorting and pagination happen against the
 * mock layer.
 *
 * The shape mirrors `useServerTable` exactly, so a page can move from the
 * mock layer to the real API by swapping the hook and the fetch function —
 * nothing else in the page changes.
 */
export function useMockTable<T>({
  fetch: fetchRows,
  pageSize = 10,
  initialQuery = "",
  initialFilters = {},
  initialDateRange = "all",
  initialSort = { sort: "createdAt", order: "desc" },
  extra,
}: MockTableOptions): MockTableResult<T> {
  const [query, setQueryState] = React.useState(initialQuery);
  const [filters, setFilters] = React.useState<Record<string, string>>(
    initialFilters,
  );
  const [dateRange, setDateRangeState] = React.useState<DateRange>(
    initialDateRange,
  );
  const [amount, setAmountState] = React.useState<MockAmountRange>({
    min: "",
    max: "",
  });
  const [sort, setSortState] = React.useState(initialSort);
  const [page, setPage] = React.useState(1);

  const [rows, setRows] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  // The debounce keeps a fast typist from re-filtering on every keystroke.
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const state = React.useMemo<MockTableState>(
    () => ({
      query: debouncedQuery,
      filters,
      dateRange,
      minAmount: amountBounds(amount.min, amount.max).min,
      maxAmount: amountBounds(amount.min, amount.max).max,
      sort: sort.sort,
      order: sort.order,
    }),
    [debouncedQuery, filters, dateRange, amount, sort],
  );

  /**
   * The mock layer speaks the API's vocabulary, not the table's.
   *
   * The table talks about a "query" and a bag of named "filters"; the mock
   * endpoints take a `q` term and a handful of named query parameters
   * (`status`, `provider`, `merchantId`, …). This translation is what makes
   * the table's search box and filter dropdowns actually narrow the list —
   * without it a search returns the whole page and the filter does nothing.
   *
   * A filter whose id has no matching query parameter is passed through under
   * `filters`, so a mock endpoint that reads `options.filters?.x` keeps
   * working too.
   */
  const requestOptions = React.useMemo(() => {
    const { min, max } = amountBounds(amount.min, amount.max);

    return {
      ...extra,
      q: debouncedQuery,
      filters,
      status: filters.status,
      provider: filters.provider,
      minAmount: min,
      maxAmount: max,
      sort: sort.sort,
      order: sort.order,
    };
  }, [extra, debouncedQuery, filters, amount, sort]);

  const queryKey = JSON.stringify({ state, requestOptions, reloadToken });

  React.useEffect(() => {
    let cancelled = false;

    // A short delay keeps the skeleton visible for a moment, so the table
    // does not flash between states while the reader is typing.
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      try {
        const result = fetchRows({
          ...state,
          ...requestOptions,
          page,
          pageSize,
        });
        if (cancelled) return;
        setRows(result.rows as T[]);
        setTotal(result.pagination.total);
      } catch {
        if (cancelled) return;
        setRows([]);
        setTotal(0);
        setError("We could not load this list. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `queryKey` captures every input that should trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, page, pageSize]);

  const setQuery = React.useCallback((value: string) => {
    setQueryState(value);
    setPage(1);
  }, []);

  const setFilter = React.useCallback((id: string, value: string) => {
    setFilters((current) => ({ ...current, [id]: value }));
    setPage(1);
  }, []);

  const setDateRange = React.useCallback((range: DateRange) => {
    setDateRangeState(range);
    setPage(1);
  }, []);

  const setAmount = React.useCallback((value: MockAmountRange) => {
    setAmountState({ min: value.min, max: value.max });
    setPage(1);
  }, []);

  const setSort = React.useCallback(
    (next: { sort: string; order: "asc" | "desc" }) => {
      setSortState(next);
      setPage(1);
    },
    [],
  );

  const refresh = React.useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    pageSize,
    loading,
    error,
    query,
    filters,
    dateRange,
    amount,
    sort,
    setQuery,
    setFilter,
    setDateRange,
    setAmount,
    setSort,
    setPage,
    refresh,
  };
}
