"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble, Car, Check, ChevronDown, Flame, Heart, Info, Key, ListChecks, MapPin, Pencil, Phone, Plus, RotateCcw, TramFront, Trash2, TriangleAlert, Utensils, Wifi, type LucideIcon,
} from "lucide-react";
import Sheet from "@/components/Sheet";
import { deleteSection, saveSection, useAuth, useGuide } from "@/lib/data";
import type { GuideSection } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = { key: Key, wifi: Wifi, flame: Flame, utensils: Utensils, trash: Trash2, tram: TramFront, heart: Heart, phone: Phone, bed: BedDouble, info: Info, map: MapPin, car: Car, alert: TriangleAlert, checklist: ListChecks };

/** A section with this icon is the checkout list: shown open at the bottom with tick boxes. */
const CHECKLIST_ICON = "checklist";

/** Inline text: turns [label](https://…) into a tappable link. */
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const isMap = /google\.[^/]+\/maps|maps\.app\.goo\.gl|maps\.apple\.com/.test(m[2]);
    parts.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 rounded-full bg-navy/8 px-2 py-0.5 text-[13px] font-semibold text-navy-2 underline-offset-2 transition hover:bg-navy/15 hover:underline">
        {isMap && <MapPin className="h-3.5 w-3.5" />}{m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Body({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim());
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { blocks.push(<ul key={blocks.length} className="space-y-1.5">{list.map((l, i) => <li key={i} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" /><span><Inline text={l} /></span></li>)}</ul>); list = []; } };
  for (const l of lines) {
    if (/^\s*[-•*]\s+/.test(l)) list.push(l.replace(/^\s*[-•*]\s+/, ""));
    else if (/^\s*##\s+/.test(l)) { flush(); blocks.push(<h3 key={blocks.length} className="pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{l.replace(/^\s*##\s+/, "")}</h3>); }
    else if (/^\s*!\s+/.test(l)) {
      flush();
      blocks.push(
        <div key={blocks.length} className="flex gap-3 rounded-xl border border-amber-300/70 bg-amber-50 px-3.5 py-3 text-amber-950">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><span><Inline text={l.replace(/^\s*!\s+/, "")} /></span>
        </div>,
      );
    }
    else { flush(); blocks.push(<p key={blocks.length}><Inline text={l} /></p>); }
  }
  flush();
  return <div className="space-y-3 text-[15px] leading-relaxed">{blocks}</div>;
}

/** The checkout list: always open, full width, each bullet is a tick box (saved on this device). */
function Checklist({ section, canEdit, onEdit, delay }: { section: GuideSection; canEdit: boolean; onEdit: () => void; delay: number }) {
  const lines = section.body.split("\n").filter((l) => l.trim());
  const intro = lines.filter((l) => !/^\s*[-•*]\s+/.test(l));
  const items = lines.filter((l) => /^\s*[-•*]\s+/.test(l)).map((l) => l.replace(/^\s*[-•*]\s+/, ""));
  // Key on the item text so editing the list doesn't leave stale ticks behind.
  const key = `bf_checkout_${section.id}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try { const v = localStorage.getItem(key); if (v) setDone(JSON.parse(v)); } catch {}
  }, [key]);
  const persist = (next: string[]) => { setDone(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch {} };
  const toggle = (item: string) => persist(done.includes(item) ? done.filter((d) => d !== item) : [...done, item]);
  const count = items.filter((i) => done.includes(i)).length;
  const all = items.length > 0 && count === items.length;

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 200, damping: 24 }}
      className="relative mt-8 overflow-hidden rounded-[1.5rem] border-2 border-navy/15 bg-elev shadow-xl shadow-navy/10">
      <div className="flex items-center gap-4 bg-gradient-to-br from-navy to-navy-2 px-5 py-5 text-white sm:px-7">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15"><ListChecks className="h-6 w-6" /></span>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">Before you go</p>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{section.title}</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold">{count}<span className="text-white/50">/{items.length}</span></p>
          <p className="text-xs text-white/60">done</p>
        </div>
      </div>
      <div className="h-1.5 bg-navy/10">
        <motion.div className="h-full bg-gold" initial={false} animate={{ width: items.length ? `${(count / items.length) * 100}%` : "0%" }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
      <div className="px-5 pb-6 pt-5 sm:px-7">
        {intro.length > 0 && <div className="mb-4 space-y-2 text-[15px] text-muted">{intro.map((l, i) => <p key={i}><Inline text={l} /></p>)}</div>}
        <ul className="space-y-2.5">
          {items.map((item) => {
            const on = done.includes(item);
            return (
              <li key={item}>
                <button type="button" onClick={() => toggle(item)} aria-pressed={on}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition ${on ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-line bg-bg hover:border-navy/30"}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition ${on ? "border-emerald-500 bg-emerald-500 text-white" : "border-navy/30 bg-white"}`}>
                    <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-4 w-4" strokeWidth={3} /></motion.span>}</AnimatePresence>
                  </span>
                  <span className={on ? "line-through decoration-emerald-400/70" : ""}><Inline text={item} /></span>
                </button>
              </li>
            );
          })}
        </ul>
        <AnimatePresence>
          {all && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-2xl bg-gold/15 px-4 py-3 text-center font-semibold text-ink">
              All done, thank you! Safe travels and we hope to see you again. 💛
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">Ticks are saved on this phone only.</p>
          <div className="flex gap-2">
            {count > 0 && <button className="btn btn-ghost !py-1.5 text-xs" onClick={() => persist([])}><RotateCcw className="h-3.5 w-3.5" /> Reset</button>}
            {canEdit && <button className="btn btn-ghost !py-1.5 text-xs" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Edit</button>}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function GuidePage() {
  const { sections: allSections, loading, refresh } = useGuide();
  const sections = allSections.filter((s) => s.icon !== CHECKLIST_ICON);
  const checklists = allSections.filter((s) => s.icon === CHECKLIST_ICON);
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
          <button className="btn btn-ghost text-sm" onClick={() => setEdit({ title: "", icon: "info", body: "", position: allSections.length })}>
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

      {!loading && checklists.map((c, i) => (
        <Checklist key={c.id} section={c} canEdit={canEdit} onEdit={() => setEdit(c)} delay={0.2 + (sections.length + i) * 0.05} />
      ))}

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
              <span className="mt-1 block text-xs text-muted">Start a line with “- ” for a bullet, “## ” for a small heading, “! ” for a warning box. Links: [Name](https://…). The ✓ list icon makes a tick-off checklist at the bottom.</span></label>
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
