/**
 * Minimal RFC 4180 CSV builder with spreadsheet formula-injection protection.
 *
 * Expense names/categories are user-controlled, so a cell like
 * `=HYPERLINK("http://evil","click")` would execute if the exported file is
 * opened in Excel/Sheets. `escapeCsvCell` neutralizes that by prefixing any
 * cell that begins with a formula trigger (`= + - @`, tab, CR) with a single
 * quote — but it leaves plain numbers alone so a negative amount like `-4.20`
 * stays numeric. Every cell is quoted and embedded quotes are doubled.
 */

const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
const NUMERIC = /^-?\d+(\.\d+)?$/;

export function escapeCsvCell(value: string | number | bigint): string {
  const str = 'string' === typeof value ? value : String(value);
  // Guard against formula injection, but don't mangle genuine numbers (a
  // Leading "-" on a negative amount is legitimate, not a formula).
  const safe = FORMULA_TRIGGER.test(str) && !NUMERIC.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsvRow(cells: (string | number | bigint)[]): string {
  return cells.map(escapeCsvCell).join(',');
}

export function toCsv(headers: string[], rows: (string | number | bigint)[][]): string {
  return [toCsvRow(headers), ...rows.map(toCsvRow)].join('\n');
}
