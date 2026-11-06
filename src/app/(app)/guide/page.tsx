"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble, ChevronDown, Flame, Heart, Info, Key, Pencil, Phone, Plus, TramFront, Trash2, Utensils, Wifi, type LucideIcon,
} from "lucide-react";
import Sheet from "@/components/Sheet";
import { deleteSection, saveSection, useAuth, useGuide } from "@/lib/data";
import type { GuideSection } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = { key: Key, wifi: Wifi, flame: Flame, utensils: Utensils, trash: Trash2, tram: TramFront, heart: Heart, phone: Phone, bed: BedDouble, info: Info };

function Body({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim());
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { blocks.push(<ul key={blocks.length} className="space-y-1.5">{list.map((l, i) => <li key={i} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />{l}</li>)}</ul>); list = []; } };
  for (const l of lines) {
    if (/^\s*[-•*]\s+/.test(l)) list.push(l.replace(/^\s*[-•*]\s+/, ""));
    else { flush(); blocks.push(<p key={blocks.length}>{l}</p>); }
  }
  flush();
  return <div className="space-y-3 text-[15px] leading-relaxed">{blocks}</div>;
}

export default function GuidePage() {
  const { sections, loading, refresh } = useGuide();
  const { canEdit } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<(Omit<GuideSection, "id"> & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!edit?.title.trim()) return;
    setBusy(true);
    try { await saveSection(edit); await refresh(); setEdit(null); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!edit?.id) return;
    setBusy(true);
    try { await deleteSection(edit.id); await refresh(); setEdit(null); } finally { setBusy(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 22 }} className="relative mb-8 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-navy via-[#22427f] to-navy-2 px-6 py-10 text-white shadow-xl shadow-navy/25 sm:px-10 sm:py-14">
        <motion.div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-navy-2/60 blur-3xl" animate={{ x: [0, -20, 0], y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[#6f97e0]/40 blur-3xl" animate={{ x: [0, 25, 0] }} transition={{ duration: 12, repeat: Infinity }} />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Guest guide</p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 20 }} className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Make yourself at home</motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-3 h-1 w-20 origin-left rounded-full bg-gold" />
          <p className="mt-3 max-w-lg text-white/80">Everything you need for your stay: getting in, Wi-Fi, how things work, and our favourite spots nearby.</p>
        </div>
      </motion.div>

      {canEdit && (
        <div className="mb-4 flex justify-end">
          <button className="btn btn-ghost text-sm" onClick={() => setEdit({ title: "", icon: "info", body: "", position: sections.length })}>
            <Plus className="h-4 w-4" /> Add section
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="card skeleton h-20" />)}</div>
      ) : (
        <div className="grid items-start gap-3 sm:grid-cols-2">
          {sections.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Info;
            const open = openId === s.id;
            return (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 220, damping: 24 }} whileHover={{ y: -3 }} className="card overflow-hidden transition-shadow hover:shadow-lg hover:shadow-navy/10">
                <button className="group flex w-full items-center gap-4 p-4 text-left" onClick={() => setOpenId(open ? null : s.id)}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><Icon className="h-5 w-5" /></span>
                  <span className="flex-1 font-semibold">{s.title}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-5 w-5 text-muted" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
                      <div className="border-t border-line px-5 pb-5 pt-4">
                        <Body text={s.body} />
                        {canEdit && (
                          <button className="btn btn-ghost mt-4 !py-1.5 text-xs" onClick={() => setEdit(s)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit section" : "New section"}>
        {edit && (
          <div className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-medium">Title</span>
              <input className="input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
            <div><span className="mb-1.5 block text-sm font-medium">Icon</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ICONS).map(([k, I]) => (
                  <button key={k} type="button" onClick={() => setEdit({ ...edit, icon: k })}
                    className={`grid h-10 w-10 place-items-center rounded-xl border transition ${edit.icon === k ? "border-navy bg-navy/10 text-navy" : "border-line text-muted"}`}><I className="h-5 w-5" /></button>
                ))}
              </div></div>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">Text</span>
              <textarea className="input min-h-48 font-mono text-sm" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
              <span className="mt-1 block text-xs text-muted">Start a line with “- ” to make a bullet point.</span></label>
            <div className="flex items-center justify-between pt-2">
              {edit.id ? <button className="btn btn-danger" disabled={busy} onClick={remove}><Trash2 className="h-4 w-4" /> Delete</button> : <span />}
              <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
