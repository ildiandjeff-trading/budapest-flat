"use client";
import { useEffect, useMemo, useState } from "react";
import {
  addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, endOfWeek,
  format, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek,
} from "date-fns";
import { AnimatePresence, animate, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Stay } from "@/lib/types";
import { toKey } from "@/lib/dates";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_LANES = 3;

// Positions are in half-day units (0..14 per week). A stay starts halfway through its
// check-in day and ends halfway through its check-out day, so back-to-back stays meet
// cleanly in the middle of the changeover day instead of sitting side by side.
type Seg = { stay: Stay; from: number; to: number; lane: number; startsHere: boolean; endsHere: boolean };

function weekSegments(weekStart: Date, stays: Stay[]): Seg[] {
  const segs: Seg[] = [];
  const laneEnds: number[] = [];
  for (const stay of stays) {
    const a = differenceInCalendarDays(parseISO(stay.start_date), weekStart) * 2 + 1;
    const b = differenceInCalendarDays(parseISO(stay.end_date), weekStart) * 2 + 1;
    if (b <= 0 || a >= 14 || b <= a) continue;
    const from = Math.max(a, 0);
    const to = Math.min(b, 14);
    let lane = laneEnds.findIndex((end) => end <= from);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = to;
    segs.push({ stay, from, to, lane, startsHere: a >= 0, endsHere: b <= 14 });
  }
  return segs;
}

const GAP = 3; // px gap at a changeover so the two bars read as separate

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const c = animate(shown, value, { duration: 0.6, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{shown}</>;
}

export default function MonthCalendar({
  stays, onDayClick, onStayClick,
}: { stays: Stay[]; onDayClick: (day: string) => void; onStayClick: (s: Stay) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [dir, setDir] = useState(0);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const out: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [month]);

  const sorted = useMemo(() => [...stays].sort((a, b) => a.start_date.localeCompare(b.start_date) || b.end_date.localeCompare(a.end_date)), [stays]);

  const go = (n: number) => { setDir(n); setMonth((m) => addMonths(m, n)); };

  const bookedNights = useMemo(() => {
    const ms = startOfMonth(month), me = endOfMonth(month);
    let n = 0;
    for (const d of eachDayOfInterval({ start: ms, end: me })) {
      const k = toKey(d);
      if (stays.some((s) => s.start_date <= k && s.end_date > k)) n++;
    }
    return n;
  }, [month, stays]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.05 }} className="card overflow-hidden p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h2 key={toKey(month)} className="font-display text-2xl font-semibold sm:text-3xl"
              initial={{ opacity: 0, y: dir * 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -dir * 12 }}>
              {format(month, "MMMM")} <span className="text-muted">{format(month, "yyyy")}</span>
            </motion.h2>
          </AnimatePresence>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-line">
              <motion.span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-navy to-navy-2"
                animate={{ width: `${(bookedNights / Number(format(endOfMonth(month), "d"))) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </span>
            <span><CountUp value={bookedNights} /> of {format(endOfMonth(month), "d")} nights booked</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isSameMonth(month, new Date()) && (
            <button className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={() => { setDir(month < new Date() ? 1 : -1); setMonth(startOfMonth(new Date())); }}>Today</button>
          )}
          <motion.button whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.9 }} className="grid h-9 w-9 place-items-center rounded-full text-navy hover:bg-navy/5" onClick={() => go(-1)} aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></motion.button>
          <motion.button whileHover={{ scale: 1.1, x: 2 }} whileTap={{ scale: 0.9 }} className="grid h-9 w-9 place-items-center rounded-full text-navy hover:bg-navy/5" onClick={() => go(1)} aria-label="Next month"><ChevronRight className="h-5 w-5" /></motion.button>
        </div>
      </div>

      <div className="grid grid-cols-7 px-0.5 pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted">
        {WEEKDAYS.map((w) => <div key={w}>{w.slice(0, 3)}</div>)}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={toKey(month)}
            custom={dir}
            initial={{ x: `${dir * 30}%`, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: `${-dir * 30}%`, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, i) => { if (i.offset.x < -60) go(1); else if (i.offset.x > 60) go(-1); }}
            className="space-y-px overflow-hidden rounded-2xl border border-line bg-line"
          >
            {weeks.map((week, wi) => {
              const segs = weekSegments(week[0], sorted);
              const hidden = segs.filter((s) => s.lane >= MAX_LANES);
              return (
                <motion.div key={toKey(week[0])} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * wi, duration: 0.35, ease: "easeOut" }} className="relative grid grid-cols-7 gap-px">
                  {week.map((day) => {
                    const inMonth = isSameMonth(day, month);
                    const today = isToday(day);
                    const more = hidden.filter((h) => { const c = differenceInCalendarDays(day, week[0]) * 2; return c + 2 > h.from && c < h.to; }).length;
                    return (
                      <button
                        key={toKey(day)}
                        onClick={() => onDayClick(toKey(day))}
                        className={`group relative flex h-[96px] flex-col items-start justify-start bg-elev p-1.5 text-left transition-colors hover:bg-navy/[0.03] sm:h-[112px] ${inMonth ? "" : "bg-bg/60 text-muted/50"}`}
                      >
                        <span className={`relative inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold ${today ? "bg-today text-today-ink shadow-md shadow-navy/40" : "group-hover:text-navy"}`}>
                          {today && <motion.span aria-hidden className="absolute inset-0 rounded-full bg-navy" animate={{ scale: [1, 1.7], opacity: [0.45, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />}
                          <span className="relative">{format(day, "d")}</span>
                        </span>
                        {more > 0 && <span className="absolute bottom-1 right-1.5 text-[10px] font-medium text-muted">+{more}</span>}
                      </button>
                    );
                  })}
                  {segs.filter((s) => s.lane < MAX_LANES).map((s) => {
                    const left = s.startsHere ? GAP : 0;
                    const right = s.endsHere ? GAP : 0;
                    const showLabel = (s.startsHere || s.from === 0) && s.to - s.from >= 2;
                    return (
                      <motion.button
                        key={s.stay.id}
                        onClick={(e) => { e.stopPropagation(); onStayClick(s.stay); }}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 + s.from * 0.01 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        title={s.stay.guest_name}
                        className="absolute z-10 h-[22px] origin-left truncate px-2 text-left text-[11px] font-semibold leading-[22px] text-white shadow-sm ring-2 ring-elev"
                        style={{
                          background: s.stay.color,
                          top: 34 + s.lane * 26,
                          left: `calc(${(s.from / 14) * 100}% + ${left}px)`,
                          width: `calc(${((s.to - s.from) / 14) * 100}% - ${left + right}px)`,
                          borderRadius: `${s.startsHere ? 999 : 0}px ${s.endsHere ? 999 : 0}px ${s.endsHere ? 999 : 0}px ${s.startsHere ? 999 : 0}px`,
                        }}
                      >
                        {showLabel && s.stay.guest_name}
                      </motion.button>
                    );
                  })}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
