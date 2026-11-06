"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${window.location.origin}/calendar`, shouldCreateUser: false },
    });
    if (error) { setState("error"); setMsg(error.message); } else setState("sent");
  };

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card p-6">
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Mail className="h-6 w-6" /></span>
        <h1 className="font-display text-2xl font-semibold">Owner sign in</h1>
        <p className="mt-1 text-sm text-muted">We&apos;ll email you a magic link. No password needed.</p>
        {state === "sent" ? (
          <p className="mt-5 rounded-xl bg-green-500/10 p-3 text-sm text-green-600">Check your inbox for the sign-in link.</p>
        ) : (
          <form onSubmit={send} className="mt-5 space-y-3">
            <input type="email" required className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-primary w-full" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send magic link"}</button>
            {state === "error" && <p className="text-sm text-red-500">{msg}</p>}
          </form>
        )}
      </motion.div>
    </div>
  );
}
