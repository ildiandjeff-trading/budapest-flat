"use client";
import { useMemo, useState } from "react";
import {
  addDays, addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, endOfWeek,
  format, isSameMonth, isToday, max as maxD, min as minD, parseISO, startOfMonth, startOfWeek,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Stay } from "@/lib/types";
import { lastNight, toKey } from "@/lib/dates";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_LANES = 3;

type Seg = { stay: Stay; col: number; span: number; lane: number; startsHere: boolean; endsHere: boolean };

function weekSegments(weekStart: Date, stays: Stay[]): Seg[] {
  const weekEnd = addDays(weekStart, 6);
  const segs: Seg[] = [];
  const laneEnds: number[] = [];
  for (const stay of stays) {
    const a = parseISO(stay.start_date);
    const b = lastNight(stay);
    if (b < weekStart || a > weekEnd || b < a) continue;
    const s = maxD([a, weekStart]);
    const e = minD([b, weekEnd]);
    const col = differenceInCalendarDays(s, weekStart);
    const span = differenceInCalendarDays(e, s) + 1;
    let lane = laneEnds.findIndex((end) => end < col);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = col + span - 1;
    segs.push({ stay, col, span, lane, startsHere: s.getTime() === a.getTime(), endsHere: e.getTime() === b.getTime() });
  }
  return segs;
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
                    const more = hidden.filter((h) => { const c = differenceInCalendarDays(day, week[0]); return c >= h.col && c < h.col + h.span; }).length;
                    return (
                      <button
                        key={toKey(day)}
                        onClick={() => onDayClick(toKey(day))}
                        className={`relative flex h-[88px] flex-col items-start justify-start bg-elev p-1.5 text-left transition-colors hover:bg-bg sm:h-[104px] ${inMonth ? "" : "bg-bg/60 text-muted/50"}`}
                      >
                        <span className={`inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold ${today ? "bg-today text-today-ink" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {more > 0 && <span className="absolute bottom-1 right-1.5 text-[10px] font-medium text-muted">+{more}</span>}
                      </button>
                    );
                  })}
                  {segs.filter((s) => s.lane < MAX_LANES).map((s) => (
                    <motion.button
                      key={s.stay.id}
                      onClick={(e) => { e.stopPropagation(); onStayClick(s.stay); }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 + s.col * 0.02 }}
                      whileHover={{ y: -1 }}
                      className="absolute z-10 h-[20px] origin-left truncate px-2 text-left text-[11px] font-semibold leading-[20px] text-white shadow-sm"
                      style={{
                        background: s.stay.color,
                        top: 32 + s.lane * 23,
                        left: `calc(${(s.col / 7) * 100}% + ${s.startsHere ? 4 : 0}px)`,
                        width: `calc(${(s.span / 7) * 100}% - ${(s.startsHere ? 4 : 0) + (s.endsHere ? 4 : 0)}px)`,
                        borderRadius: `${s.startsHere ? 999 : 0}px ${s.endsHere ? 999 : 0}px ${s.endsHere ? 999 : 0}px ${s.startsHere ? 999 : 0}px`,
                      }}
                    >
                      {(s.startsHere || s.col === 0) && s.stay.guest_name}
                    </motion.button>
                  ))}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
