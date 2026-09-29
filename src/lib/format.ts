/**
 * Formatting helpers. Output is deterministic (no reliance on the
 * browser's Intl locale data) so prices look identical on every phone.
 */

/** 25000 → "₦25,000" */
export function formatNaira(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${amount < 0 ? "-" : ""}₦${grouped}`;
}

/** "+₦5,000" for positive deltas, "" for zero. */
export function formatDelta(delta: number | undefined): string {
  if (!delta) return "";
  return `${delta > 0 ? "+" : "-"}${formatNaira(Math.abs(delta))}`;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse "yyyy-mm-dd" as a local calendar date (no timezone shifting). */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** "2026-09-27" → "Sun, 27 Sep 2026" */
export function formatDate(value: string): string {
  const date = parseISODate(value);
  if (!date) return value;
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "18:00" → "6:00 PM" */
export function formatTime(value: string): string {
  const m = /^(\d{2}):(\d{2})/.exec(value);
  if (!m) return value;
  const h = Number(m[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

/** Local date as "yyyy-mm-dd". */
export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function pluralize(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** 10, { one: "pack", many: "packs" } → "10 packs"; no unit → "10 items". */
export function formatQuantity(count: number, unit?: { one: string; many: string }): string {
  return unit ? pluralize(count, unit.one, unit.many) : pluralize(count, "item");
}
