"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, LogOut, Wrench } from "lucide-react";
import { useAuth, useIssues } from "@/lib/data";
import { useI18n, type Lang, type TKey } from "@/lib/i18n";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

const tabs: { href: string; label: TKey; icon: typeof CalendarDays }[] = [
  { href: "/calendar", label: "nav.calendar", icon: CalendarDays },
  { href: "/guide", label: "nav.guide", icon: BookOpen },
  { href: "/issues", label: "nav.issues", icon: Wrench },
];

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t("lang.switch")} className="relative flex shrink-0 items-center rounded-full border border-line bg-elev p-0.5 text-[11px] font-bold">
      {(["en", "hu"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} className="relative rounded-full px-2.5 py-1">
          {lang === l && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-navy" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
          <span className={`relative z-10 ${lang === l ? "text-white" : "text-muted"}`}>{l === "en" ? "EN" : "HU"}</span>
        </button>
      ))}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { session, ready, isDemo } = useAuth();
  const { t } = useI18n();
  const onLogin = path.startsWith("/login");
  const locked = !isDemo && !session;
  const { issues } = useIssues(!locked && ready);
  const openIssues = issues.filter((i) => i.status !== "resolved").length;

  useEffect(() => {
    if (!ready) return;
    if (locked && !onLogin) router.replace("/login");
    if (!locked && onLogin) router.replace("/calendar");
  }, [ready, locked, onLogin, router]);

  if (!isDemo && (!ready || (locked && !onLogin))) {
    return <div className="grid min-h-dvh place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" /></div>;
  }

  return (
    <div className="relative min-h-dvh pb-28 sm:pb-10">
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
            <Logo className="h-9 w-9" />
            <span className="truncate font-display text-base font-semibold sm:text-lg">Jildi&apos;s Budapest Nest</span>
          </Link>

          {!locked && <nav className="hidden items-center gap-1 rounded-full border border-line bg-elev p-1 sm:flex">
            {tabs.map((tab) => {
              const active = path.startsWith(tab.href);
              return (
                <Link key={tab.href} href={tab.href} className="relative rounded-full px-4 py-1.5 text-sm font-medium">
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-navy to-navy-2" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <span className={`relative z-10 inline-flex items-center gap-1.5 ${active ? "text-white" : "text-muted hover:text-ink"}`}>
                    {t(tab.label)}
                    {tab.href === "/issues" && openIssues > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{openIssues}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>}

          <div className="flex items-center gap-2">
            <LangSwitch />
            {isDemo ? (
              <span className="hidden rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold sm:inline">{t("demoMode")}</span>
            ) : session ? (
              <button className="btn btn-ghost shrink-0 !px-2.5 !py-1.5 text-xs" onClick={() => supabase?.auth.signOut()} aria-label={t("signOut")} title={t("signOut")}>
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("signOut")}</span>
              </button>
            ) : null}
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">{children}</main>

      {/* Mobile tab bar */}
      {!locked && <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.375rem+env(safe-area-inset-bottom))] sm:hidden">
        <div className="grid h-16 grid-cols-3 gap-1 rounded-[1.4rem] border border-white/60 bg-elev/65 p-1 shadow-[0_-6px_30px_-8px_rgb(15_29_58/0.25)] backdrop-blur-xl backdrop-saturate-150">
          {tabs.map((tab) => {
            const active = path.startsWith(tab.href);
            const Icon = tab.icon;
            const badge = tab.href === "/issues" ? openIssues : 0;
            return (
              <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className="relative flex flex-col items-center justify-center gap-0.5 rounded-[1.1rem] text-[11px] font-semibold leading-tight">
                {active && (
                  <motion.span layoutId="tab-bg" className="absolute inset-0 rounded-[1.1rem] bg-navy/[0.07]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <motion.span
                  animate={{ scale: active ? 1.06 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`relative grid h-8 w-11 place-items-center rounded-xl transition-colors ${active ? "bg-gradient-to-br from-navy to-navy-2 text-white shadow-lg shadow-navy/35" : "bg-navy/[0.06] text-navy/70"}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">{badge}</span>
                  )}
                </motion.span>
                <span className={`relative ${active ? "text-navy" : "text-muted"}`}>{t(tab.label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
