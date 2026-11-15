import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase pauses free projects after ~7 days with little activity. If no friend opens the
// app for a week, it would stop working. A Vercel cron (vercel.json) calls this once a day so
// the database always sees some traffic.
//
// It runs one tiny query as a signed-out visitor. Row rules hide every row from signed-out
// users, so the answer has no data in it, but Postgres still runs the query.

export const dynamic = "force-dynamic"; // never cache: every call must reach the database

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 500 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const started = Date.now();
  const { error } = await supabase.from("stays").select("id").limit(1);

  if (error) {
    console.error("keepalive: database query failed", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
  return NextResponse.json({ ok: true, ms: Date.now() - started, at: new Date().toISOString() });
}
