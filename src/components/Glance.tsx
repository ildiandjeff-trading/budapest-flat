"use client";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import type { Stay } from "@/lib/types";
import Bastion from "@/components/Bastion";
import { isActive, nights, rangeLabel, toKey } from "@/lib/dates";

export function BastionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-[#132650] via-navy to-navy-2 px-3 pb-2 pt-5 shadow-xl shadow-navy/25"
    >
      <motion.div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-[#6f97e0]/30 blur-2xl" animate={{ x: [0, 40, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#6f97e0]/15 blur-2xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div
        aria-hidden
        className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["0%", "450%"] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 6, ease: "easeInOut", delay: 4 }}
      />
      <Bastion className="relative w-full" />
    </motion.div>
  );
}

export function UpcomingList({ stays, onSelect }: { stays: Stay[]; onSelect: (s: Stay) => void }) {
  const t = toKey(new Date());
  const upcoming = stays.filter((s) => s.end_date > t).slice(0, 8);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 24 }} className="card p-4 sm:p-5">
      <h3 className="mb-3 font-display text-lg font-semibold">Coming up</h3>
      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Nothing on the horizon yet.</p>
      ) : (
        <ul className="space-y-1">
          {upcoming.map((s, i) => {
            const active = isActive(s);
            const inD = differenceInCalendarDays(parseISO(s.start_date), new Date());
            return (
              <motion.li key={s.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 260, damping: 24 }} whileHover={{ x: 4 }}>
                <button onClick={() => onSelect(s)} className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-bg">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105" style={{ background: s.color }}>
                    <span className="text-center leading-none">
                      <span className="block text-[10px] font-medium uppercase opacity-80">{format(parseISO(s.start_date), "MMM")}</span>
                      <span className="block text-base font-bold">{format(parseISO(s.start_date), "d")}</span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.guest_name}</span>
                    <span className="block text-xs text-muted">{rangeLabel(s)} · {nights(s)} nights · {s.guests} {s.guests === 1 ? "guest" : "guests"}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-navy text-white" : "bg-bg text-muted"}`}>
                    {active ? "Now" : inD === 1 ? "Tomorrow" : `${inD}d`}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
