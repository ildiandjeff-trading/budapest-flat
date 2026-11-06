"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const tabs = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/guide", label: "Guest guide", icon: BookOpen },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { session, isDemo } = useAuth();

  return (
    <div className="min-h-dvh pb-24 sm:pb-10">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-gold text-sm font-bold text-white shadow-md">
              BP
            </span>
            <span className="font-display text-lg font-semibold">Our Budapest Flat</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-line bg-elev p-1 sm:flex">
            {tabs.map((t) => {
              const active = path.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href} className="relative rounded-full px-4 py-1.5 text-sm font-medium">
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <span className={`relative z-10 ${active ? "text-bg" : "text-muted hover:text-ink"}`}>{t.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isDemo ? (
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">Demo mode</span>
            ) : session ? (
              <button className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={() => supabase?.auth.signOut()}>
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : (
              <Link href="/login" className="btn btn-ghost !px-3 !py-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" /> Owner sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">{children}</main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-elev/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-2">
          {tabs.map((t) => {
            const active = path.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="relative flex flex-col items-center gap-1 py-3 text-xs font-medium">
                {active && <motion.span layoutId="tab-dot" className="absolute top-0 h-0.5 w-10 rounded-full bg-accent" />}
                <Icon className={`h-5 w-5 ${active ? "text-ink" : "text-muted"}`} />
                <span className={active ? "text-ink" : "text-muted"}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
