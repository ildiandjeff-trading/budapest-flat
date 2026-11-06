"use client";
import { useMemo, useState } from "react";
import {
  addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, endOfWeek,
  format, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
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
    <div className="card overflow-hidden p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h2 key={toKey(month)} className="font-display text-2xl font-semibold sm:text-3xl"
              initial={{ opacity: 0, y: dir * 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -dir * 12 }}>
              {format(month, "MMMM")} <span className="text-muted">{format(month, "yyyy")}</span>
            </motion.h2>
          </AnimatePresence>
          <p className="text-xs text-muted">{bookedNights} of {format(endOfMonth(month), "d")} nights booked</p>
        </div>
        <div className="flex items-center gap-1">
          {!isSameMonth(month, new Date()) && (
            <button className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={() => { setDir(month < new Date() ? 1 : -1); setMonth(startOfMonth(new Date())); }}>Today</button>
          )}
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg" onClick={() => go(-1)} aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></button>
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg" onClick={() => go(1)} aria-label="Next month"><ChevronRight className="h-5 w-5" /></button>
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
            {weeks.map((week) => {
              const segs = weekSegments(week[0], sorted);
              const hidden = segs.filter((s) => s.lane >= MAX_LANES);
              return (
                <div key={toKey(week[0])} className="relative grid grid-cols-7 gap-px">
                  {week.map((day) => {
                    const inMonth = isSameMonth(day, month);
                    const today = isToday(day);
                    const more = hidden.filter((h) => { const c = differenceInCalendarDays(day, week[0]) * 2; return c + 2 > h.from && c < h.to; }).length;
                    return (
                      <button
                        key={toKey(day)}
                        onClick={() => onDayClick(toKey(day))}
                        className={`relative flex h-[96px] flex-col items-start justify-start bg-elev p-1.5 text-left transition-colors hover:bg-bg sm:h-[112px] ${inMonth ? "" : "bg-bg/60 text-muted/50"}`}
                      >
                        <span className={`inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold ${today ? "bg-today text-today-ink" : ""}`}>
                          {format(day, "d")}
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
                        whileHover={{ y: -1 }}
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
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
