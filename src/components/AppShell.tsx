"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, LogOut } from "lucide-react";
import { useAuth } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const tabs = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/guide", label: "Guest guide", icon: BookOpen },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { session, ready, isDemo } = useAuth();
  const onLogin = path.startsWith("/login");
  const locked = !isDemo && !session;

  useEffect(() => {
    if (!ready) return;
    if (locked && !onLogin) router.replace("/login");
    if (!locked && onLogin) router.replace("/calendar");
  }, [ready, locked, onLogin, router]);

  if (!isDemo && (!ready || (locked && !onLogin))) {
    return <div className="grid min-h-dvh place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" /></div>;
  }

  return (
    <div className="relative min-h-dvh pb-24 sm:pb-10">
      {/* soft drifting background glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#9db8ea]/25 blur-3xl" style={{ animation: "drift 18s ease-in-out infinite" }} />
        <div className="absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[#b9cdf2]/30 blur-3xl" style={{ animation: "drift 22s ease-in-out infinite reverse" }} />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-[#dbe6fb]/50 blur-3xl" style={{ animation: "drift 26s ease-in-out infinite" }} />
      </div>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="sticky top-0 z-30 border-b border-line/70 bg-bg/75 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-navy to-navy-2 text-sm font-bold text-white shadow-md shadow-navy/30"
            >
              JB
            </motion.span>
            <span className="truncate font-display text-base font-semibold sm:text-lg">Jildi&apos;s Budapest Nest</span>
          </Link>

          {!locked && <nav className="hidden items-center gap-1 rounded-full border border-line bg-elev p-1 sm:flex">
            {tabs.map((t) => {
              const active = path.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href} className="relative rounded-full px-4 py-1.5 text-sm font-medium">
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-navy to-navy-2" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <span className={`relative z-10 ${active ? "text-white" : "text-muted hover:text-ink"}`}>{t.label}</span>
                </Link>
              );
            })}
          </nav>}

          <div className="flex items-center gap-2">
            {isDemo ? (
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">Demo mode</span>
            ) : session ? (
              <button className="btn btn-ghost shrink-0 !px-3 !py-1.5 text-xs" onClick={() => supabase?.auth.signOut()}>
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : null}
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">{children}</main>

      {/* Mobile tab bar */}
      {!locked && <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-elev/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-2">
          {tabs.map((t) => {
            const active = path.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="relative flex flex-col items-center gap-1 py-3 text-xs font-medium">
                {active && <motion.span layoutId="tab-dot" className="absolute top-0 h-0.5 w-10 rounded-full bg-navy" />}
                <motion.span animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Icon className={`h-5 w-5 ${active ? "text-navy" : "text-muted"}`} />
                </motion.span>
                <span className={active ? "text-navy" : "text-muted"}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
