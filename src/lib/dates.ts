import { differenceInCalendarDays, format, parseISO, subDays, type Locale } from "date-fns";
import type { Stay } from "./types";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const nights = (s: Stay) => differenceInCalendarDays(parseISO(s.end_date), parseISO(s.start_date));
export const lastNight = (s: Stay) => subDays(parseISO(s.end_date), 1);

export function rangeLabel(s: Stay, lang: "en" | "hu" = "en", locale?: Locale) {
  const a = parseISO(s.start_date);
  const b = parseISO(s.end_date);
  const o = { locale };
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (lang === "hu") {
    return sameMonth ? `${format(a, "MMM d", o)}–${format(b, "d.", o)}` : `${format(a, "MMM d.", o)} – ${format(b, "MMM d.", o)}`;
  }
  return sameMonth ? `${format(a, "d", o)}–${format(b, "d MMM", o)}` : `${format(a, "d MMM", o)} – ${format(b, "d MMM", o)}`;
}

export function isActive(s: Stay, today = new Date()) {
  const t = toKey(today);
  return s.start_date <= t && s.end_date > t;
}
