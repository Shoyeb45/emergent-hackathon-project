/**
 * Normalize API date (ISO or "YYYY-MM-DD") to a Date at noon local time for safe formatting.
 * Handles: "2025-03-15", "2025-03-15T00:00:00.000Z", "2025-03-15T00:00:00"
 */
function parseDateSafe(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  const dateOnly = trimmed.split("T")[0];
  if (!dateOnly || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  const [y, m, d] = dateOnly.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format 24h time string "HH:mm" to 12h with AM/PM (e.g. "14:30" → "2:30 PM").
 */
export function formatTimeAmPm(time24: string): string {
  if (!time24 || typeof time24 !== "string") return "";
  const trimmed = time24.trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) return trimmed;
  const [hStr, mStr] = trimmed.split(":");
  const h = parseInt(hStr!, 10);
  const m = parseInt(mStr!, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return trimmed;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr!.padStart(2, "0")} ${period}`;
}

/**
 * Format event date for display: "Saturday, 15 March 2025"
 * Returns fallback if date is invalid.
 */
export function formatEventDate(dateStr: string): string {
  const date = parseDateSafe(dateStr);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Short date for badges: "15" and "Mar" (day and month separately for layout)
 */
export function formatEventDateShort(dateStr: string): { day: string; month: string } {
  const date = parseDateSafe(dateStr);
  if (!date) return { day: "—", month: "—" };
  const day = date.toLocaleDateString("en-IN", { day: "numeric" });
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  return { day, month };
}

/**
 * Format wedding/event date in layout: "Saturday, 15 March 2025"
 */
export function formatWeddingDate(dateStr: string | null | undefined): string {
  const date = parseDateSafe(dateStr ?? "");
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Short format for cards: "15 Mar 2025"
 */
export function formatDateMedium(dateStr: string | null | undefined): string {
  const date = parseDateSafe(dateStr ?? "");
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", { dateStyle: "medium" });
}
