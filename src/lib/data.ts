"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isDemo } from "./supabase";
import { DEFAULT_GUIDE, DEMO_STAYS } from "./defaults";
import type { GuideSection, Stay } from "./types";

const LS_STAYS = "bf_demo_stays";
const LS_GUIDE = "bf_demo_guide";

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
  const { id, ...rest } = sec;
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
