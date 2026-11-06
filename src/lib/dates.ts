import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import type { Stay } from "./types";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const nights = (s: Stay) => differenceInCalendarDays(parseISO(s.end_date), parseISO(s.start_date));
export const lastNight = (s: Stay) => subDays(parseISO(s.end_date), 1);

export function rangeLabel(s: Stay) {
  const a = parseISO(s.start_date);
  const b = parseISO(s.end_date);
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return sameMonth ? `${format(a, "d")}–${format(b, "d MMM")}` : `${format(a, "d MMM")} – ${format(b, "d MMM")}`;
}

export function isActive(s: Stay, today = new Date()) {
  const t = toKey(today);
  return s.start_date <= t && s.end_date > t;
}
