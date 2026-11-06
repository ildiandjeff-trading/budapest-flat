"use client";
import { useEffect, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Check, Trash2, Users } from "lucide-react";
import Sheet from "./Sheet";
import { STAY_COLORS, type Stay } from "@/lib/types";
import { deleteStay, saveStay } from "@/lib/data";
import { nights } from "@/lib/dates";

type Draft = Omit<Stay, "id"> & { id?: string };

export default function StayDialog({
  open, onClose, initial, stays, canEdit, onSaved,
}: { open: boolean; onClose: () => void; initial: Draft | null; stays: Stay[]; canEdit: boolean; onSaved: () => void }) {
  const [d, setD] = useState<Draft | null>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => { setD(initial); setErr(null); setConfirmDel(false); }, [initial]);
  if (!d) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const valid = d.guest_name.trim() && d.start_date && d.end_date && d.end_date > d.start_date;
  const overlaps = stays.filter((s) => s.id !== d.id && s.start_date < d.end_date && s.end_date > d.start_date);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD({ ...d, [k]: v });

  const submit = async () => {
    if (!valid) return;
    setBusy(true); setErr(null);
    try { await saveStay({ ...d, guest_name: d.guest_name.trim(), notes: d.notes?.trim() || null }); onSaved(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not save"); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!d.id) return;
    setBusy(true);
    try { await deleteStay(d.id); onSaved(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not delete"); }
    finally { setBusy(false); }
  };

  if (!canEdit) {
    return (
      <Sheet open={open} onClose={onClose} title={d.guest_name}>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
            {format(parseISO(d.start_date), "EEE d MMM")} → {format(parseISO(d.end_date), "EEE d MMM yyyy")}</div>
          <div className="text-muted">{nights(d as Stay)} nights · {d.guests} {d.guests === 1 ? "guest" : "guests"}</div>
          {d.notes && <p className="rounded-xl bg-bg p-3">{d.notes}</p>}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={d.id ? "Edit stay" : "New stay"}>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Who&apos;s staying?</span>
          <input autoFocus={!d.id} className="input" placeholder="e.g. Anna & Peter" value={d.guest_name} onChange={(e) => set("guest_name", e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Check-in</span>
            <input type="date" className="input" value={d.start_date}
              onChange={(e) => {
                const v = e.target.value;
                setD({ ...d, start_date: v, end_date: d.end_date > v ? d.end_date : format(addDays(parseISO(v), 1), "yyyy-MM-dd") });
              }} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Check-out</span>
            <input type="date" className="input" min={d.start_date} value={d.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </label>
        </div>
        {valid && <p className="-mt-1 text-xs text-muted">{nights(d as Stay)} nights</p>}
        {overlaps.length > 0 && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gold/15 px-3 py-2 text-xs text-gold">
            Overlaps with {overlaps.map((o) => o.guest_name).join(", ")}
          </motion.p>
        )}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Users className="h-4 w-4" /> Guests</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} type="button" onClick={() => set("guests", n)}
                className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${d.guests === n ? "border-ink bg-ink text-bg" : "border-line hover:border-muted"}`}>{n}</button>
            ))}
          </div>
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-medium">Colour</span>
          <div className="flex flex-wrap gap-2">
            {STAY_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("color", c)} aria-label={`Colour ${c}`}
                className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110" style={{ background: c }}>
                {d.color === c && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Notes</span>
          <textarea className="input min-h-20" placeholder="Flight times, special requests…" value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </label>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <div className="flex items-center justify-between gap-3 pt-2">
          {d.id ? (
            confirmDel ? (
              <button className="btn btn-danger" disabled={busy} onClick={remove}><Trash2 className="h-4 w-4" /> Really delete?</button>
            ) : (
              <button className="btn btn-ghost" onClick={() => setConfirmDel(true)}><Trash2 className="h-4 w-4" /> Delete</button>
            )
          ) : <span />}
          <button className="btn btn-primary min-w-28" disabled={!valid || busy} onClick={submit} style={{ opacity: !valid || busy ? 0.5 : 1 }}>
            {busy ? "Saving…" : "Save stay"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
