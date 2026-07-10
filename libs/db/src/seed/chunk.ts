import { getTableColumns } from "drizzle-orm";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";

/**
 * D1 binds at most 100 parameters per query. libSQL's ceiling is 32766, so a
 * multi-row insert that is fine locally can still fail against a preview
 * database — 28 interests × 4 columns = 112 was the first one to do so.
 */
export const D1_MAX_BOUND_PARAMS = 100;

/**
 * Runs a multi-row insert in slices small enough for D1's parameter cap.
 *
 * The caller supplies the insert itself, so each site keeps its own conflict
 * clause. Slice size is derived from the table's *column count*, not the keys
 * present on the rows: Drizzle also binds a parameter for any column with a
 * JS-valued default (`$defaultFn`, `$onUpdate`) that the row omits, so counting
 * row keys would undercount. Columns defaulted by a SQL expression bind nothing,
 * which only makes the slice more conservative.
 */
export async function insertInChunks<Row>(
  table: AnySQLiteTable,
  rows: readonly Row[],
  insert: (chunk: Row[]) => PromiseLike<unknown>,
): Promise<void> {
  if (rows.length === 0) return;

  const columnCount = Object.keys(getTableColumns(table)).length;
  const size = Math.max(1, Math.floor(D1_MAX_BOUND_PARAMS / columnCount));

  for (let i = 0; i < rows.length; i += size) {
    await insert(rows.slice(i, i + size));
  }
}

/**
 * Runs a `where(inArray(column, values))` lookup in slices, concatenating the
 * rows. `inArray` binds one parameter per element, so a long list hits the same
 * ceiling an oversized insert does — silently, since the list is usually derived
 * from seed data rather than written out.
 *
 * Order of the returned rows follows the slices, not `values`. Every caller
 * turns them into a lookup map, so this is not worth preserving.
 *
 * `reservedParams` is for a query that also binds parameters outside the list
 * (an extra `where` term, a `limit`); those come out of the same budget.
 */
export async function selectInChunks<Value, Row>(
  values: readonly Value[],
  select: (chunk: Value[]) => PromiseLike<Row[]>,
  reservedParams = 0,
): Promise<Row[]> {
  if (values.length === 0) return [];

  const size = Math.max(1, D1_MAX_BOUND_PARAMS - reservedParams);
  const rows: Row[] = [];

  for (let i = 0; i < values.length; i += size) {
    rows.push(...(await select(values.slice(i, i + size))));
  }
  return rows;
}
