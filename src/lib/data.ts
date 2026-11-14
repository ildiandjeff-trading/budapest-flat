"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isDemo } from "./supabase";
import { DEFAULT_GUIDE, DEMO_STAYS } from "./defaults";
import type { GuideSection, Issue, Stay } from "./types";

const LS_STAYS = "bf_demo_stays";
const LS_GUIDE = "bf_demo_guide";
const LS_ISSUES = "bf_demo_issues";

function lsGet<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}
const uid = () => Math.random().toString(36).slice(2, 10);
const sortStays = (s: Stay[]) => [...s].sort((a, b) => a.start_date.localeCompare(b.start_date));

// ---------- Stays ----------
export async function fetchStays(): Promise<Stay[]> {
  if (!supabase) return sortStays(lsGet(LS_STAYS, DEMO_STAYS));
  const { data, error } = await supabase.from("stays").select("*").order("start_date");
  if (error) throw error;
  return data as Stay[];
}

export async function saveStay(stay: Omit<Stay, "id"> & { id?: string }): Promise<void> {
  if (!supabase) {
    const all = lsGet(LS_STAYS, DEMO_STAYS);
    const next = stay.id ? all.map((s) => (s.id === stay.id ? (stay as Stay) : s)) : [...all, { ...stay, id: uid() }];
    lsSet(LS_STAYS, next);
    return;
  }
  const { id, ...rest } = stay;
  const q = id ? supabase.from("stays").update(rest).eq("id", id) : supabase.from("stays").insert(rest);
  const { error } = await q;
  if (error) throw error;
}

export async function deleteStay(id: string): Promise<void> {
  if (!supabase) {
    lsSet(LS_STAYS, lsGet(LS_STAYS, DEMO_STAYS).filter((s) => s.id !== id));
    return;
  }
  const { error } = await supabase.from("stays").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Guide ----------
const demoGuide = (): GuideSection[] => DEFAULT_GUIDE.map((g, i) => ({ ...g, id: `g${i}` }));

export async function fetchGuide(): Promise<GuideSection[]> {
  if (!supabase) return lsGet(LS_GUIDE, demoGuide()).sort((a, b) => a.position - b.position);
  const { data, error } = await supabase.from("guide_sections").select("*").order("position");
  if (error) throw error;
  return data as GuideSection[];
}

export async function saveSection(sec: Omit<GuideSection, "id"> & { id?: string }): Promise<void> {
  if (!supabase) {
    const all = lsGet(LS_GUIDE, demoGuide());
    const next = sec.id ? all.map((s) => (s.id === sec.id ? (sec as GuideSection) : s)) : [...all, { ...sec, id: uid() }];
    lsSet(LS_GUIDE, next);
    return;
  }
  const { id, ...fields } = sec;
  const rest = { ...fields, title_hu: fields.title_hu?.trim() || null, body_hu: fields.body_hu?.trim() || null };
  const q = id ? supabase.from("guide_sections").update(rest).eq("id", id) : supabase.from("guide_sections").insert(rest);
  const { error } = await q;
  if (error) throw error;
}

export async function deleteSection(id: string): Promise<void> {
  if (!supabase) {
    lsSet(LS_GUIDE, lsGet(LS_GUIDE, demoGuide()).filter((s) => s.id !== id));
    return;
  }
  const { error } = await supabase.from("guide_sections").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Issues ----------
export type IssueInput = Omit<Issue, "id" | "created_at" | "resolved_at"> & { id?: string };

export async function fetchIssues(): Promise<Issue[]> {
  if (!supabase) return lsGet<Issue[]>(LS_ISSUES, []).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await supabase.from("issues").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Issue[];
}

/** Saves an issue. Returns the new issue's id when one was created. */
export async function saveIssue(issue: IssueInput): Promise<string | void> {
  const resolved_at = issue.status === "resolved" ? new Date().toISOString() : null;
  if (!supabase) {
    const all = lsGet<Issue[]>(LS_ISSUES, []);
    const next = issue.id
      ? all.map((i) => (i.id === issue.id ? { ...i, ...issue, resolved_at: issue.status === "resolved" ? i.resolved_at ?? resolved_at : null } as Issue : i))
      : [...all, { ...issue, id: uid(), created_at: new Date().toISOString(), resolved_at } as Issue];
    lsSet(LS_ISSUES, next);
    return;
  }
  const { id, ...rest } = issue;
  if (id) {
    const { error } = await supabase.from("issues").update({ ...rest, resolved_at }).eq("id", id);
    if (error) throw error;
    return;
  }
  const { data, error } = await supabase.from("issues").insert({ ...rest, resolved_at }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

/** Emails the hosts about a new issue (via the notify-issue function). Never throws. */
export async function notifyHosts(issueId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.functions.invoke("notify-issue", { body: { id: issueId, appUrl: window.location.origin } });
    return !error && !!data?.sent;
  } catch {
    return false;
  }
}

export async function deleteIssue(id: string): Promise<void> {
  if (!supabase) {
    lsSet(LS_ISSUES, lsGet<Issue[]>(LS_ISSUES, []).filter((i) => i.id !== id));
    return;
  }
  const { error } = await supabase.from("issues").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Hooks ----------
export function useStays() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setStays(await fetchStays());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load stays");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    if (!supabase) return;
    const ch = supabase
      .channel("stays")
      .on("postgres_changes", { event: "*", schema: "public", table: "stays" }, () => refresh())
      .subscribe();
    return () => { supabase?.removeChannel(ch); };
  }, [refresh]);
  return { stays, loading, error, refresh };
}

export function useGuide() {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { setSections(await fetchGuide()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { sections, loading, refresh };
}

export function useIssues(enabled = true) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setIssues(await fetchIssues());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load issues");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    refresh();
    if (!supabase) return;
    const ch = supabase
      .channel(`issues-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "issues" }, () => refresh())
      .subscribe();
    return () => { supabase?.removeChannel(ch); };
  }, [refresh, enabled]);
  return { issues, loading, error, refresh };
}

/** Everyone signs in with the one shared password. In demo mode (no Supabase configured) no sign-in is needed. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(isDemo);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready, canEdit: isDemo || !!session, isDemo };
}
