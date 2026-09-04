import type { Locale, LStr } from "../types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Pick the right string for the active locale. */
export function ls(s: LStr, locale: Locale): string {
  return locale === "fr" ? s.fr : s.en;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ---------- Money / dates ---------- */

export function formatRs(n: number): string {
  return `Rs ${n.toLocaleString("en-US")}`;
}

export function fmtDate(d: Date | string, locale: Locale, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", opts ?? { weekday: "long", day: "numeric", month: "long" });
}

export function fmtDateShort(d: Date | string, locale: Locale): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
}

export function fmtTime(d: Date | string, locale: Locale): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (locale === "fr") return `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ---------- Week + selection deadline logic ---------- */

export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday → Sunday of the current week. */
export function currentWeek(): Date[] {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = addDays(today, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isPastDay(d: Date): boolean {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return d < today;
}

/** Selection closes at 16:00 the day before delivery. */
export function isLocked(d: Date, now = new Date()): boolean {
  const deadline = addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -1);
  deadline.setHours(16, 0, 0, 0);
  return now.getTime() > deadline.getTime();
}

export function nextDeliveryDate(): Date {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return addDays(today, 1);
}

export function nextRenewalDate(): Date {
  const t = new Date();
  const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const dow = (d.getDay() + 6) % 7; // Monday-based
  return addDays(d, 7 - dow); // coming Monday
}

export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode — ignore */
  }
}
