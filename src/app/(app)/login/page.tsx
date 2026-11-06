"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SHARED_EMAIL = process.env.NEXT_PUBLIC_SHARED_EMAIL ?? "";

export default function Login() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: SHARED_EMAIL, password });
    setBusy(false);
    if (error) setErr("That password didn't work. Try again?");
  };

  return (
    <div className="mx-auto mt-8 max-w-sm sm:mt-16">
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="card p-6 sm:p-8">
        <motion.span initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.15, type: "spring" }}
          className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-gold text-white shadow-lg">
          <Lock className="h-6 w-6" />
        </motion.span>
        <h1 className="font-display text-3xl font-semibold">Welcome in</h1>
        <p className="mt-1 text-sm text-muted">Enter the flat password to see the calendar and guest guide.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <input type={show ? "text" : "password"} required autoFocus className="input pr-11" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-muted" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button className="btn btn-primary w-full !py-3" disabled={busy}>{busy ? "Opening the door…" : "Come in"}</button>
          {err && <motion.p initial={{ x: -6 }} animate={{ x: [6, -4, 2, 0] }} className="text-center text-sm text-red-500">{err}</motion.p>}
        </form>
      </motion.div>
    </div>
  );
}
