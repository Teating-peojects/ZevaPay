/**
 * In-memory helpers for the mock layer.
 *
 * The mock layer is a small, honest substitute for the API. It keeps records
 * in module-level arrays, supports the same filter / sort / paginate
 * parameters the real endpoints accept, and returns the same envelope:
 *
 *     { rows: [...], pagination: { page, pageSize, total, totalPages } }
 *
 * Nothing here is random and nothing is derived from the current clock. The
 * dataset in `data.ts` is copied once at module load, so a mutation on one
 * request is visible on the next one — exactly like a real database row —
 * but a page render never changes the numbers underneath the reader.
 */

/** Query parameters a mock list endpoint understands. */
export interface MockQuery {
  /** Free-text search term. */
  q?: string;
  /** 1-based page number. */
  page?: number;
  /** Rows per page. */
  pageSize?: number;
  /** Field to sort by. */
  sort?: string;
  /** Sort direction. */
  order?: "asc" | "desc";
  /** Exact-match filters, keyed by field name. */
  filters?: Record<string, string | undefined>;
}

/** The pagination block every list endpoint returns. */
export interface MockPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** A page of rows plus its pagination block. */
export interface MockListResult<T> {
  rows: T[];
  pagination: MockPagination;
}

/** Deep-copies a seed record so mutations never touch the source array. */
function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * A mutable collection of records.
 *
 * `MockCollection` is deliberately tiny: list, get, insert, update, remove.
 * Everything a page needs beyond that — filtering, sorting, paging — is
 * expressed with the free functions below so the shape of a request stays
 * visible at the call site.
 */
export class MockCollection<T extends { id: string }> {
  private rows: T[];

  constructor(seed: readonly T[]) {
    this.rows = seed.map((row) => clone(row));
  }

  /** Every record, in insertion order. */
  all(): T[] {
    return this.rows;
  }

  /** The first record matching the predicate. */
  find(predicate: (row: T) => boolean): T | undefined {
    return this.rows.find(predicate);
  }

  /** Every record matching the predicate. */
  filter(predicate: (row: T) => boolean): T[] {
    return this.rows.filter(predicate);
  }

  /** One record by id. */
  get(id: string): T | undefined {
    return this.rows.find((row) => row.id === id);
  }

  /** Adds a record. */
  insert(row: T): T {
    this.rows.unshift(row);
    return row;
  }

  /** Merges a patch into a record. */
  update(id: string, patch: Partial<T>): T | undefined {
    const index = this.rows.findIndex((row) => row.id === id);
    if (index === -1) return undefined;
    const next = { ...this.rows[index], ...clone(patch) };
    this.rows[index] = next;
    return next;
  }

  /** Removes a record. Returns true when something was removed. */
  remove(id: string): boolean {
    const index = this.rows.findIndex((row) => row.id === id);
    if (index === -1) return false;
    this.rows.splice(index, 1);
    return true;
  }

  /** How many records the collection holds. */
  get size(): number {
    return this.rows.length;
  }
}

/**
 * Builds the pagination block for a row set.
 *
 * The total is the count *after* filtering, so the pager always reflects
 * the number of matching records rather than the size of the page.
 */
export function paginate<T>(
  rows: T[],
  query: MockQuery = {},
): MockListResult<T> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, query.pageSize ?? 20));
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    pagination: { page, pageSize, total, totalPages },
  };
}

/**
 * Keeps the rows whose searched fields contain the search term.
 *
 * The comparison is case-insensitive so "bkash" matches "bKash".
 */
export function searchRows<T>(
  rows: T[],
  q: string | undefined,
  fields: (row: T) => Array<string | number | null | undefined>,
): T[] {
  const term = q?.trim().toLowerCase();
  if (!term) return rows;

  return rows.filter((row) =>
    fields(row).some((value) =>
      value === null || value === undefined
        ? false
        : String(value).toLowerCase().includes(term),
    ),
  );
}

/**
 * Applies an exact-match filter.
 *
 * A filter value of `"ALL"` (or an empty string) means "no filter", which is
 * how the table filter controls pass their "All statuses" option through.
 */
export function matchesFilter(
  value: string | number | boolean | null | undefined,
  filter: string | undefined,
): boolean {
  if (filter === undefined || filter === "" || filter === "ALL") return true;
  if (value === null || value === undefined) return false;
  return String(value) === filter;
}

/**
 * Sorts rows by a named field.
 *
 * The accessor lets callers sort by a derived value — "the newest first" is
 * `sortBy(rows, "createdAt", "desc")`; "the largest first" needs an accessor
 * because the amount lives under a different key.
 */
export function sortRows<T>(
  rows: T[],
  sort: string | undefined,
  order: "asc" | "desc" = "desc",
  accessor?: (row: T) => string | number,
): T[] {
  if (!sort) return rows;

  const direction = order === "asc" ? 1 : -1;
  const read = accessor ?? ((row: T) => (row as Record<string, unknown>)[sort] as string | number);

  return [...rows].sort((a, b) => {
    const left = read(a);
    const right = read(b);

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * direction;
    }

    return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * direction;
  });
}

/**
 * A stable pseudo-id for records created inside the mock layer.
 *
 * It counts existing ids rather than using randomness, so two records
 * created in the same session never collide and the id looks like the rest.
 */
export function nextId(prefix: string, existing: Array<{ id: string }>): string {
  const highest = existing.reduce((max, row) => {
    const match = /(\d+)$/.exec(row.id);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `${prefix}_${String(highest + 1).padStart(4, "0")}`;
}
