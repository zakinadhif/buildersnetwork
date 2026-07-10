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
