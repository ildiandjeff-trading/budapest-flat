"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Clock, Hammer, MapPin, Pencil, Plus, Siren, Trash2, User, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Sheet from "@/components/Sheet";
import { deleteIssue, notifyHosts, saveIssue, useIssues, type IssueInput } from "@/lib/data";
import type { Issue, IssueStatus, IssueUrgency } from "@/lib/types";
import { useI18n, type TKey } from "@/lib/i18n";

const AREAS = ["Kitchen", "Bathroom", "Toilet", "Bedroom", "Living room", "Heating & water", "Wi-Fi & TV", "Windows & shades", "Other"];

const URGENCY: Record<IssueUrgency, { label: TKey; hint: TKey; cls: string }> = {
  low: { label: "iss.u.low", hint: "iss.u.lowHint", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  normal: { label: "iss.u.normal", hint: "iss.u.normalHint", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  urgent: { label: "iss.u.urgent", hint: "iss.u.urgentHint", cls: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS: Record<IssueStatus, { label: TKey; cls: string; icon: typeof Clock }> = {
  open: { label: "iss.st.open", cls: "bg-navy/10 text-navy", icon: Clock },
  in_progress: { label: "iss.st.in_progress", cls: "bg-amber-100 text-amber-800", icon: Hammer },
  resolved: { label: "iss.st.resolved", cls: "bg-emerald-100 text-emerald-800", icon: CircleCheck },
};

const blank = (): IssueInput => ({ title: "", details: "", area: "Other", urgency: "normal", reported_by: "", status: "open" });

type Filter = "active" | "resolved" | "all";

export default function IssuesPage() {
  const { issues, loading, error, refresh } = useIssues();
  const { t, locale } = useI18n();
  const areaLabel = (a: string) => (AREAS.includes(a) ? t(`area.${a}` as TKey) : a);
  const [edit, setEdit] = useState<IssueInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");
  const [justSent, setJustSent] = useState<null | "saved" | "emailed">(null);

  const counts = useMemo(() => ({
    active: issues.filter((i) => i.status !== "resolved").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    all: issues.length,
  }), [issues]);
  const shown = issues.filter((i) => (filter === "all" ? true : filter === "resolved" ? i.status === "resolved" : i.status !== "resolved"));

  const save = async () => {
    if (!edit?.title.trim()) return;
    setBusy(true);
    try {
      const isNew = !edit.id;
      const newId = await saveIssue({ ...edit, title: edit.title.trim(), details: edit.details?.trim() || null, reported_by: edit.reported_by?.trim() || null });
      await refresh();
      setEdit(null);
      if (isNew) {
        setFilter("active");
        setJustSent("saved");
        if (newId) notifyHosts(newId).then((ok) => ok && setJustSent("emailed"));
        setTimeout(() => setJustSent(null), 6000);
      }
    } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!edit?.id) return;
    setBusy(true);
    try { await deleteIssue(edit.id); await refresh(); setEdit(null); } finally { setBusy(false); }
  };
  const setStatus = async (i: Issue, status: IssueStatus) => {
    await saveIssue({ id: i.id, title: i.title, details: i.details, area: i.area, urgency: i.urgency, reported_by: i.reported_by, status });
    await refresh();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="relative mb-6 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-navy via-[#22427f] to-navy-2 px-6 py-9 text-white shadow-xl shadow-navy/25 sm:px-10 sm:py-12">
        <motion.div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-navy-2/60 blur-3xl" animate={{ x: [0, -20, 0], y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{t("iss.kicker")}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{t("iss.title")}</h1>
            <div className="mt-3 h-1 w-20 rounded-full bg-gold" />
            <p className="mt-3 max-w-lg text-white/80">{t("iss.sub")}</p>
          </div>
          <button onClick={() => setEdit(blank())}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-5 py-3 font-semibold text-navy shadow-lg shadow-black/20 transition active:scale-95 sm:self-auto">
            <Plus className="h-5 w-5" /> {t("iss.report")}
          </button>
        </div>
      </motion.div>

      <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[14px] text-red-900">
        <Siren className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <p><span className="font-semibold">{t("iss.emLead")}</span> {t("iss.emBefore")} <a className="font-semibold underline" href="tel:112">112</a>{t("iss.emAfter")}</p>
      </div>

      <AnimatePresence>
        {justSent && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
            <CircleCheck className="h-5 w-5 text-emerald-600" /> {justSent === "emailed" ? t("iss.emailed") : t("iss.saved")}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 inline-flex rounded-full border border-line bg-elev p-1 text-sm">
        {([["active", "iss.f.active"], ["resolved", "iss.f.resolved"], ["all", "iss.f.all"]] as [Filter, TKey][]).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className="relative rounded-full px-4 py-1.5 font-medium">
            {filter === k && <motion.span layoutId="issue-filter" className="absolute inset-0 rounded-full bg-navy" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className={`relative z-10 ${filter === k ? "text-white" : "text-muted"}`}>{t(label)} <span className="opacity-70">{counts[k]}</span></span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t("err.load")}</p>}

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="card skeleton h-24" />)}</div>
      ) : shown.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card grid place-items-center px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><CircleCheck className="h-7 w-7" /></span>
          <p className="mt-4 font-semibold">{filter === "resolved" ? t("iss.emptyResolvedT") : t("iss.emptyOpenT")}</p>
          <p className="mt-1 text-sm text-muted">{filter === "resolved" ? t("iss.emptyResolvedS") : t("iss.emptyOpenS")}</p>
        </motion.div>
      ) : (
        <div className="grid items-start gap-3 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {shown.map((i, n) => {
              const st = STATUS[i.status];
              const urg = URGENCY[i.urgency];
              const StIcon = st.icon;
              return (
                <motion.article key={i.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: n * 0.03, type: "spring", stiffness: 240, damping: 26 }}
                  className={`card overflow-hidden ${i.urgency === "urgent" && i.status !== "resolved" ? "ring-2 ring-red-300" : ""}`}>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`text-[16px] font-semibold ${i.status === "resolved" ? "text-muted line-through decoration-1" : ""}`}>{i.title}</h3>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}><StIcon className="h-3.5 w-3.5" />{t(st.label)}</span>
                    </div>
                    {i.details && <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/80">{i.details}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
                      <span className={`rounded-full border px-2 py-0.5 font-medium ${urg.cls}`}>{t(urg.label)}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{areaLabel(i.area)}</span>
                      {i.reported_by && <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />{i.reported_by}</span>}
                      <span>{formatDistanceToNow(new Date(i.created_at), { addSuffix: true, locale })}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-line bg-bg/60 px-4 py-2.5 sm:px-5">
                    {i.status === "open" && <button className="btn btn-ghost !py-1.5 text-xs" onClick={() => setStatus(i, "in_progress")}><Hammer className="h-3.5 w-3.5" /> {t("iss.beingFixed")}</button>}
                    {i.status !== "resolved"
                      ? <button className="btn btn-ghost !py-1.5 text-xs text-emerald-700" onClick={() => setStatus(i, "resolved")}><CircleCheck className="h-3.5 w-3.5" /> {t("iss.markResolved")}</button>
                      : <button className="btn btn-ghost !py-1.5 text-xs" onClick={() => setStatus(i, "open")}><Clock className="h-3.5 w-3.5" /> {t("iss.reopen")}</button>}
                    <button className="btn btn-ghost ml-auto !py-1.5 text-xs" onClick={() => setEdit({ id: i.id, title: i.title, details: i.details ?? "", area: i.area, urgency: i.urgency, reported_by: i.reported_by ?? "", status: i.status })}><Pencil className="h-3.5 w-3.5" /> {t("edit")}</button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t("iss.editTitle") : t("iss.report")}>
        {edit && (
          <div className="space-y-5">
            <label className="block"><span className="mb-1.5 block text-sm font-medium">{t("iss.what")}</span>
              <input className="input" autoFocus placeholder={t("iss.whatPh")} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
            <div><span className="mb-2 block text-sm font-medium">{t("iss.where")}</span>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <button key={a} type="button" onClick={() => setEdit({ ...edit, area: a })}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${edit.area === a ? "border-navy bg-navy text-white" : "border-line text-muted hover:border-navy/40"}`}>{areaLabel(a)}</button>
                ))}
              </div></div>
            <div><span className="mb-2 block text-sm font-medium">{t("iss.how")}</span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(URGENCY) as IssueUrgency[]).map((u) => (
                  <button key={u} type="button" onClick={() => setEdit({ ...edit, urgency: u })}
                    className={`rounded-2xl border-2 px-2 py-2.5 text-center transition ${edit.urgency === u ? URGENCY[u].cls + " border-current" : "border-line text-muted"}`}>
                    <span className="block text-sm font-semibold">{t(URGENCY[u].label)}</span>
                    <span className="block text-[11px] opacity-80">{t(URGENCY[u].hint)}</span>
                  </button>
                ))}
              </div></div>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">{t("iss.details")} <span className="font-normal text-muted">{t("optional")}</span></span>
              <textarea className="input min-h-28" placeholder={t("iss.detailsPh")} value={edit.details ?? ""} onChange={(e) => setEdit({ ...edit, details: e.target.value })} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium">{t("iss.name")} <span className="font-normal text-muted">{t("optional")}</span></span>
              <input className="input" value={edit.reported_by ?? ""} onChange={(e) => setEdit({ ...edit, reported_by: e.target.value })} /></label>
            <div className="flex items-center justify-between pt-1">
              {edit.id ? <button className="btn btn-danger" disabled={busy} onClick={remove}><Trash2 className="h-4 w-4" /> {t("delete")}</button> : <span />}
              <button className="btn btn-primary" disabled={busy || !edit.title.trim()} onClick={save}><Wrench className="h-4 w-4" />{busy ? t("iss.sending") : edit.id ? t("save") : t("iss.send")}</button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
