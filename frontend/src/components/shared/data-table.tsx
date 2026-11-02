"use client";

import * as React from "react";
import { Download, MoreHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Dropdown, type DropdownItem } from "@/components/ui/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, TableSkeleton } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { DATE_RANGE_OPTIONS, type DateRange } from "@/lib/date-range";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Extra classes for both the header and body cells. */
  className?: string;
  align?: "left" | "right";
}

export interface FilterConfig<T> {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  /**
   * Returns true when the row matches the selected filter value.
   * Only used in client mode — in server mode the API applies the filter.
   */
  match?: (row: T, value: string) => boolean;
}

/** Relative date ranges offered by the date filter. */
export type { DateRange } from "@/lib/date-range";

export {
  DATE_RANGE_OPTIONS,
  dateRangeBounds,
} from "@/lib/date-range";

/**
 * Builds a date-range matcher against a fixed reference instant so results
 * stay stable across renders.
 */
export function makeDateMatcher<T>(
  getDate: (row: T) => string,
  referenceNow: number,
): (row: T, range: DateRange) => boolean {
  const dayMs = 24 * 60 * 60 * 1000;

  return (row, range) => {
    if (range === "all") return true;
    const time = new Date(getDate(row)).getTime();
    if (range === "today") {
      const start = new Date(referenceNow);
      start.setHours(0, 0, 0, 0);
      return time >= start.getTime();
    }
    const days = range === "7d" ? 7 : 30;
    return time >= referenceNow - days * dayMs;
  };
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** Text fields searched by the search box. */
  searchKeys?: (row: T) => string[];
  /** Shows the search box even when the search happens on the server. */
  showSearch?: boolean;
  searchPlaceholder?: string;
  filters?: FilterConfig<T>[];
  /** Enables the date-range select. */
  dateFilter?: (row: T, range: DateRange) => boolean;
  /**
   * Shows the date-range select without a client-side matcher. Used in
   * server mode, where the API applies the range.
   */
  showDateFilter?: boolean;
  /** Row-level actions rendered in a trailing menu column. */
  actions?: (row: T) => DropdownItem[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  /** Set to true to render the skeleton instead of the table body. */
  loading?: boolean;
  /** Set to true to render the error state instead of the table body. */
  error?: string;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
  /** Hide the built-in export button (e.g. when a custom one is provided). */
  hideExport?: boolean;
  /** Pre-filled search term, e.g. from a `?q=` query parameter. */
  initialQuery?: string;
  /**
   * When provided, filtering and pagination are delegated to the server.
   * The rows are used as-is and the component reports user intent upward.
   */
  server?: {
    /** Total number of matching records across all pages. */
    total: number;
    page: number;
    pageSize: number;
    /** Current search term — the table renders it as the input value. */
    query?: string;
    /** Current filter values, keyed by filter id. */
    filters?: Record<string, string>;
    /** Current date range. */
    dateRange?: DateRange;
    onPageChange: (page: number) => void;
    onQueryChange?: (query: string) => void;
    onFilterChange?: (id: string, value: string) => void;
    onDateRangeChange?: (range: DateRange) => void;
    /** Extra handler for the export button. */
    onExport?: () => void;
  };
}

/**
 * Searchable, filterable, paginated table used across all dashboard list
 * pages. Keeps the markup and behavior consistent between merchant and admin
 * views.
 *
 * The table works in two modes. By default it filters and paginates the
 * rows it is given in the browser. When a `server` prop is supplied it
 * instead reports every interaction upward so the caller can re-query the
 * API — the rows are then treated as the current page.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  searchKeys,
  showSearch = false,
  searchPlaceholder = "Search…",
  filters,
  dateFilter,
  showDateFilter = false,
  actions,
  pageSize = 10,
  emptyTitle = "No records found",
  emptyDescription,
  emptyIcon,
  loading = false,
  error,
  onRowClick,
  toolbar,
  hideExport = false,
  initialQuery = "",
  server,
}: DataTableProps<T>) {
  const isServerMode = server !== undefined;

  // In client mode the table owns its filter state. In server mode the parent
  // owns it, and the table only reports intent upward.
  const [localQuery, setLocalQuery] = React.useState(initialQuery);
  const [localFilterValues, setLocalFilterValues] = React.useState<
    Record<string, string>
  >({});
  const [localDateRange, setLocalDateRange] = React.useState<DateRange>("all");
  const [page, setPage] = React.useState(1);

  const query = isServerMode ? (server.query ?? "") : localQuery;
  const filterValues = React.useMemo(
    () => (isServerMode ? (server.filters ?? {}) : localFilterValues),
    [isServerMode, server, localFilterValues],
  );
  const dateRange = isServerMode ? (server.dateRange ?? "all") : localDateRange;

  const filteredRows = React.useMemo(() => {
    // In server mode the API has already filtered and paginated the rows.
    if (isServerMode) return rows;

    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        !searchKeys ||
        searchKeys(row).some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      if (!matchesQuery) return false;

      const matchesFilters = (filters ?? []).every((filter) => {
        const value = filterValues[filter.id];
        if (!value) return true;
        return filter.match ? filter.match(row, value) : true;
      });

      if (!matchesFilters) return false;

      return dateFilter ? dateFilter(row, dateRange) : true;
    });
  }, [
    rows,
    query,
    filters,
    filterValues,
    searchKeys,
    dateFilter,
    dateRange,
    isServerMode,
  ]);

  const pageCount = isServerMode
    ? Math.max(1, Math.ceil(server.total / server.pageSize))
    : Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const safePage = isServerMode
    ? Math.min(server.page, pageCount)
    : Math.min(page, pageCount);

  const pageRows = isServerMode
    ? filteredRows
    : filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasActiveFilters =
    query.trim().length > 0 ||
    Object.keys(filterValues).length > 0 ||
    dateRange !== "all";

  function handleQueryChange(value: string) {
    if (isServerMode) {
      server.onQueryChange?.(value);
      server.onPageChange(1);
    } else {
      setLocalQuery(value);
      setPage(1);
    }
  }

  function handleFilterChange(id: string, value: string) {
    if (isServerMode) {
      server.onFilterChange?.(id, value);
      server.onPageChange(1);
    } else {
      setLocalFilterValues((current) => ({ ...current, [id]: value }));
      setPage(1);
    }
  }

  function handleDateChange(value: DateRange) {
    if (isServerMode) {
      server.onDateRangeChange?.(value);
      server.onPageChange(1);
    } else {
      setLocalDateRange(value);
      setPage(1);
    }
  }

  function clearFilters() {
    if (isServerMode) {
      server.onQueryChange?.("");
      for (const filter of filters ?? []) server.onFilterChange?.(filter.id, "");
      server.onDateRangeChange?.("all");
      server.onPageChange(1);
    } else {
      setLocalQuery("");
      setLocalFilterValues({});
      setLocalDateRange("all");
      setPage(1);
    }
  }

  function handlePageChange(next: number) {
    if (isServerMode) server.onPageChange(next);
    else setPage(next);
  }

  const totalColumns = columns.length + (actions ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      {(searchKeys || showSearch || filters?.length || dateFilter || showDateFilter || toolbar) &&
      !loading &&
      !error ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {searchKeys || showSearch ? (
            <div className="relative w-full lg:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 pl-9"
              />
            </div>
          ) : null}

          {filters?.map((filter) => (
            <div key={filter.id} className="w-full lg:w-44">
              <Select
                value={filterValues[filter.id] ?? ""}
                onChange={(event) =>
                  handleFilterChange(filter.id, event.target.value)
                }
                aria-label={filter.label}
                className="h-9"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}

          {dateFilter || showDateFilter ? (
            <div className="w-full lg:w-40">
              <Select
                value={dateRange}
                onChange={(event) =>
                  handleDateChange(event.target.value as DateRange)
                }
                aria-label="Filter by date"
                className="h-9"
              >
                {DATE_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear
            </Button>
          ) : null}

          <div className="flex items-center gap-2 lg:ml-auto">
            {toolbar}
            {!hideExport ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => server?.onExport?.()}
              >
                <Download className="size-3.5" aria-hidden="true" />
                Export
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="surface overflow-hidden rounded-xl">
        {loading ? (
          <TableSkeleton rows={pageSize} columns={totalColumns} />
        ) : error ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[15px] font-semibold text-ink">
              We couldn&apos;t load this list
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">{error}</p>
            <Button variant="outline" size="sm" className="mt-5">
              Retry
            </Button>
          </div>
        ) : pageRows.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No matching results" : emptyTitle}
            description={
              hasActiveFilters
                ? "Try a different search term or clear your filters."
                : emptyDescription
            }
            icon={emptyIcon}
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.align === "right" && "text-right",
                        column.className,
                      )}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                  {actions ? (
                    <TableHead className="w-12 text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      onRowClick && !actions && "cursor-pointer",
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.align === "right" && "text-right",
                          column.className,
                        )}
                      >
                        {column.render(row)}
                      </TableCell>
                    ))}
                    {actions ? (
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Dropdown
                            align="right"
                            triggerClassName="rounded-lg p-1.5 hover:bg-neutral-100"
                            trigger={
                              <>
                                <span className="sr-only">Row actions</span>
                                <MoreHorizontal
                                  className="size-4 text-ink-muted"
                                  aria-hidden="true"
                                />
                              </>
                            }
                            items={actions(row)}
                          />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              page={safePage}
              pageCount={pageCount}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
