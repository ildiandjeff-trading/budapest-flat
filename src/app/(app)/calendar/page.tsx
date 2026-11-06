"use client";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import MonthCalendar from "@/components/MonthCalendar";
import StayDialog from "@/components/StayDialog";
import { GlanceCard, UpcomingList } from "@/components/Glance";
import { useAuth, useStays } from "@/lib/data";
import { STAY_COLORS, type Stay } from "@/lib/types";
import { toKey } from "@/lib/dates";

type Draft = Omit<Stay, "id"> & { id?: string };

export default function CalendarPage() {
  const { stays, loading, error, refresh } = useStays();
  const { canEdit } = useAuth();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);

  const newStay = (start = toKey(new Date())) => {
    if (!canEdit) return;
    setDraft({
      guest_name: "", start_date: start, end_date: format(addDays(parseISO(start), 3), "yyyy-MM-dd"),
      guests: 2, color: STAY_COLORS[stays.length % STAY_COLORS.length], notes: null,
    });
    setOpen(true);
  };
  const openStay = (s: Stay) => { setDraft(s); setOpen(true); };

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="font-display text-3xl font-semibold text-navy sm:text-4xl">Who&apos;s staying</motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mt-1 h-1 w-16 origin-left rounded-full bg-gradient-to-r from-navy to-gold" />
          <p className="mt-2 text-sm text-muted">{canEdit ? "Tap a day to add a stay, or a bar to edit it." : "Tap a stay to see the details."}</p>
        </div>
        {canEdit && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="btn btn-primary group hidden sm:inline-flex" onClick={() => newStay()}>
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Add stay
          </motion.button>
        )}
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="order-2 lg:order-1">
          {loading ? <div className="card skeleton h-[560px]" /> : <MonthCalendar stays={stays} onDayClick={newStay} onStayClick={openStay} />}
        </div>
        <div className="order-1 space-y-5 lg:order-2">
          <GlanceCard stays={stays} />
          <div className="hidden lg:block"><UpcomingList stays={stays} onSelect={openStay} /></div>
        </div>
        <div className="order-3 lg:hidden"><UpcomingList stays={stays} onSelect={openStay} /></div>
      </div>

      {canEdit && (
        <motion.button
          initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }}
          whileTap={{ scale: 0.88, rotate: 90 }}
          onClick={() => newStay()}
          className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-navy to-navy-2 text-white shadow-xl shadow-navy/40 sm:hidden"
          aria-label="Add stay"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      <StayDialog open={open} onClose={() => setOpen(false)} initial={draft} stays={stays} canEdit={canEdit} onSaved={refresh} />
    </>
  );
}
