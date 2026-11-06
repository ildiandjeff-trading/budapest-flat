"use client";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Home, Moon, Sparkles } from "lucide-react";
import type { Stay } from "@/lib/types";
import { isActive, nights, rangeLabel, toKey } from "@/lib/dates";

export function GlanceCard({ stays }: { stays: Stay[] }) {
  const today = new Date();
  const now = stays.find((s) => isActive(s, today));
  const next = stays.find((s) => s.start_date > toKey(today));

  let title: string, sub: string, Icon = Home, tone = "from-danube to-[#5a67d8]";
  if (now) {
    const left = differenceInCalendarDays(parseISO(now.end_date), today);
    title = `${now.guest_name} ${now.guests > 1 ? "are" : "is"} staying`;
    sub = `Checking out ${format(parseISO(now.end_date), "EEE d MMM")} · ${left === 1 ? "tomorrow" : `in ${left} days`}`;
    tone = "from-accent to-gold";
  } else if (next) {
    const inD = differenceInCalendarDays(parseISO(next.start_date), today);
    title = "The flat is free right now";
    sub = `Next up: ${next.guest_name} ${inD === 1 ? "tomorrow" : `in ${inD} days`}`;
    Icon = Moon;
  } else {
    title = "No stays planned";
    sub = "Tap a day on the calendar to add one.";
    Icon = Sparkles;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${tone} p-5 text-white shadow-lg`}
    >
      <motion.div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
          <Icon className="h-4 w-4" /> Right now
        </div>
        <p className="font-display text-2xl font-semibold leading-tight">{title}</p>
        <p className="mt-1 text-sm text-white/85">{sub}</p>
      </div>
    </motion.div>
  );
}

export function UpcomingList({ stays, onSelect }: { stays: Stay[]; onSelect: (s: Stay) => void }) {
  const t = toKey(new Date());
  const upcoming = stays.filter((s) => s.end_date > t).slice(0, 8);
  return (
    <div className="card p-4 sm:p-5">
      <h3 className="mb-3 font-display text-lg font-semibold">Coming up</h3>
      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Nothing on the horizon yet.</p>
      ) : (
        <ul className="space-y-1">
          {upcoming.map((s, i) => {
            const active = isActive(s);
            const inD = differenceInCalendarDays(parseISO(s.start_date), new Date());
            return (
              <motion.li key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <button onClick={() => onSelect(s)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-bg">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: s.color }}>
                    <span className="text-center leading-none">
                      <span className="block text-[10px] font-medium uppercase opacity-80">{format(parseISO(s.start_date), "MMM")}</span>
                      <span className="block text-base font-bold">{format(parseISO(s.start_date), "d")}</span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.guest_name}</span>
                    <span className="block text-xs text-muted">{rangeLabel(s)} · {nights(s)} nights · {s.guests} {s.guests === 1 ? "guest" : "guests"}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-accent/15 text-accent" : "bg-bg text-muted"}`}>
                    {active ? "Now" : inD === 1 ? "Tomorrow" : `${inD}d`}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
