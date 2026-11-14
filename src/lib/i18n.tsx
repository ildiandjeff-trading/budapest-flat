"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { enGB, hu as huLocale, type Locale } from "date-fns/locale";

export type Lang = "en" | "hu";
const LS_LANG = "bf_lang";

const en = {
  // shell
  "nav.calendar": "Calendar",
  "nav.guide": "Guest guide",
  "nav.issues": "Report issue",
  "signOut": "Sign out",
  "demoMode": "Demo mode",
  "lang.switch": "Language",

  // common
  "edit": "Edit",
  "delete": "Delete",
  "save": "Save",
  "saving": "Saving…",
  "reset": "Reset",
  "optional": "(optional)",
  "err.save": "Could not save",
  "err.delete": "Could not delete",

  // intro
  "intro.sub": "Who's staying when, and everything you need for your stay.",
  "intro.enter": "Come on in",

  // login
  "login.title": "Welcome in",
  "login.sub": "Enter the flat password to see the calendar and guest guide.",
  "login.password": "Password",
  "login.show": "Show password",
  "login.hide": "Hide password",
  "login.busy": "Opening the door…",
  "login.submit": "Come in",
  "login.error": "That password didn't work. Try again?",

  // calendar
  "cal.title": "Who's staying",
  "cal.hintEdit": "Tap a day to add a stay, or a bar to edit it.",
  "cal.hintView": "Tap a stay to see the details.",
  "cal.add": "Add stay",
  "cal.today": "Today",
  "cal.prev": "Previous month",
  "cal.next": "Next month",
  "cal.booked": "{n} of {total} nights booked",
  "up.title": "Coming up",
  "up.empty": "Nothing on the horizon yet.",
  "up.now": "Now",
  "up.tomorrow": "Tomorrow",
  "up.inDays": "{n}d",
  "nights.one": "{n} night",
  "nights.other": "{n} nights",
  "guests.one": "{n} guest",
  "guests.other": "{n} guests",

  // stay dialog
  "stay.new": "New stay",
  "stay.edit": "Edit stay",
  "stay.who": "Who's staying?",
  "stay.whoPh": "e.g. Anna & Peter",
  "stay.in": "Check-in",
  "stay.out": "Check-out",
  "stay.overlaps": "Overlaps with {names}",
  "stay.guests": "Guests",
  "stay.colour": "Colour",
  "stay.notes": "Notes",
  "stay.notesPh": "Flight times, special requests…",
  "stay.reallyDelete": "Really delete?",
  "stay.save": "Save stay",

  // guide
  "guide.kicker": "Guest guide",
  "guide.title": "Make yourself at home",
  "guide.sub": "Everything you need for your stay: getting in, Wi-Fi, how things work, and our favourite spots nearby.",
  "guide.add": "Add section",
  "guide.editSection": "Edit section",
  "guide.newSection": "New section",
  "guide.fTitle": "Title",
  "guide.fIcon": "Icon",
  "guide.fText": "Text",
  "guide.help": "Start a line with “- ” for a bullet, “## ” for a small heading, “! ” for a warning box. Links: [Name](https://…). The ✓ list icon makes a tick-off checklist at the bottom.",
  "guide.huFallback": "Leave the Hungarian empty to show the English text.",
  "check.kicker": "Before you go",
  "check.done": "done",
  "check.allDone": "All done, thank you! Safe travels and we hope to see you again. 💛",
  "check.local": "Ticks are saved on this phone only.",

  // issues
  "iss.kicker": "Something not right?",
  "iss.title": "Report an issue",
  "iss.sub": "Broken, stuck, leaking or just odd? Tell us here and we'll get it sorted.",
  "iss.report": "Report a problem",
  "iss.emLead": "Emergency?",
  "iss.emBefore": "If you smell gas, close the gas valve, open the windows, leave the flat and call",
  "iss.emAfter": ". For a water leak, close the water valve under the sink. Then message or call Ildi right away.",
  "iss.saved": "Thanks! Your report is saved and the hosts can see it here.",
  "iss.emailed": "Thanks! Your report is saved and the hosts have been emailed.",
  "iss.f.active": "Open",
  "iss.f.resolved": "Resolved",
  "iss.f.all": "All",
  "iss.emptyResolvedT": "Nothing resolved yet",
  "iss.emptyResolvedS": "Fixed problems will show up here.",
  "iss.emptyOpenT": "No open issues",
  "iss.emptyOpenS": "Everything's working. If that changes, tap “Report a problem”.",
  "iss.st.open": "Open",
  "iss.st.in_progress": "Being fixed",
  "iss.st.resolved": "Resolved",
  "iss.beingFixed": "Being fixed",
  "iss.markResolved": "Mark resolved",
  "iss.reopen": "Reopen",
  "iss.u.low": "Minor",
  "iss.u.lowHint": "Can wait",
  "iss.u.normal": "Needs fixing",
  "iss.u.normalHint": "During my stay",
  "iss.u.urgent": "Urgent",
  "iss.u.urgentHint": "Right now",
  "iss.editTitle": "Edit issue",
  "iss.what": "What's wrong?",
  "iss.whatPh": "e.g. Toilet keeps running",
  "iss.where": "Where?",
  "iss.how": "How urgent?",
  "iss.details": "Details",
  "iss.detailsPh": "When did it start? What have you tried?",
  "iss.name": "Your name",
  "iss.sending": "Sending…",
  "iss.send": "Send report",
  "area.Kitchen": "Kitchen",
  "area.Bathroom": "Bathroom",
  "area.Toilet": "Toilet",
  "area.Bedroom": "Bedroom",
  "area.Living room": "Living room",
  "area.Heating & water": "Heating & water",
  "area.Wi-Fi & TV": "Wi-Fi & TV",
  "area.Windows & shades": "Windows & shades",
  "area.Other": "Other",
} as const;

export type TKey = keyof typeof en;

const hu: Record<TKey, string> = {
  "nav.calendar": "Naptár",
  "nav.guide": "Vendégkalauz",
  "nav.issues": "Hibabejelentés",
  "signOut": "Kijelentkezés",
  "demoMode": "Demó mód",
  "lang.switch": "Nyelv",

  "edit": "Szerkesztés",
  "delete": "Törlés",
  "save": "Mentés",
  "saving": "Mentés…",
  "reset": "Újrakezdés",
  "optional": "(nem kötelező)",
  "err.save": "Nem sikerült menteni",
  "err.delete": "Nem sikerült törölni",

  "intro.sub": "Ki mikor lakik itt, és minden, amire szükséged lesz itt-tartózkodásod alatt.",
  "intro.enter": "Gyere be",

  "login.title": "Üdv nálunk",
  "login.sub": "Add meg a lakás jelszavát, és máris látod a naptárat és a vendégkalauzt.",
  "login.password": "Jelszó",
  "login.show": "Jelszó megjelenítése",
  "login.hide": "Jelszó elrejtése",
  "login.busy": "Nyitjuk az ajtót…",
  "login.submit": "Belépés",
  "login.error": "Ez a jelszó nem jó. Megpróbálod újra?",

  "cal.title": "Ki lakik itt",
  "cal.hintEdit": "Koppints egy napra új foglaláshoz, vagy egy sávra a szerkesztéshez.",
  "cal.hintView": "Koppints egy foglalásra a részletekért.",
  "cal.add": "Új foglalás",
  "cal.today": "Ma",
  "cal.prev": "Előző hónap",
  "cal.next": "Következő hónap",
  "cal.booked": "{total} éjszakából {n} foglalt",
  "up.title": "Hamarosan",
  "up.empty": "Egyelőre nincs semmi a láthatáron.",
  "up.now": "Most",
  "up.tomorrow": "Holnap",
  "up.inDays": "{n} nap",
  "nights.one": "{n} éjszaka",
  "nights.other": "{n} éjszaka",
  "guests.one": "{n} vendég",
  "guests.other": "{n} vendég",

  "stay.new": "Új foglalás",
  "stay.edit": "Foglalás szerkesztése",
  "stay.who": "Ki érkezik?",
  "stay.whoPh": "pl. Anna és Péter",
  "stay.in": "Érkezés",
  "stay.out": "Távozás",
  "stay.overlaps": "Ütközik: {names}",
  "stay.guests": "Vendégek",
  "stay.colour": "Szín",
  "stay.notes": "Megjegyzés",
  "stay.notesPh": "Járatidők, különleges kérések…",
  "stay.reallyDelete": "Biztosan törlöd?",
  "stay.save": "Foglalás mentése",

  "guide.kicker": "Vendégkalauz",
  "guide.title": "Érezd magad otthon",
  "guide.sub": "Minden, amire szükséged lehet: bejutás, Wi-Fi, hogyan működnek a dolgok, és a kedvenc helyeink a környéken.",
  "guide.add": "Új szakasz",
  "guide.editSection": "Szakasz szerkesztése",
  "guide.newSection": "Új szakasz",
  "guide.fTitle": "Cím",
  "guide.fIcon": "Ikon",
  "guide.fText": "Szöveg",
  "guide.help": "„- ” a sor elején: felsorolás, „## ”: kis alcím, „! ”: figyelmeztető doboz. Hivatkozás: [Név](https://…). A ✓ lista ikon kipipálható listát készít az oldal aljára.",
  "guide.huFallback": "Ha a magyar mező üres, az angol szöveg jelenik meg.",
  "check.kicker": "Indulás előtt",
  "check.done": "kész",
  "check.allDone": "Minden kész, köszönjük! Jó utat, reméljük, hamarosan újra találkozunk! 💛",
  "check.local": "A pipák csak ezen a telefonon mentődnek.",

  "iss.kicker": "Valami nem stimmel?",
  "iss.title": "Hibabejelentés",
  "iss.sub": "Elromlott, beragadt, szivárog vagy csak furcsa? Írd meg itt, és megoldjuk.",
  "iss.report": "Probléma bejelentése",
  "iss.emLead": "Vészhelyzet?",
  "iss.emBefore": "Ha gázszagot érzel, zárd el a gázcsapot, nyiss ablakot, hagyd el a lakást, és hívd a",
  "iss.emAfter": " segélyhívót. Szivárgás esetén zárd el a vízcsapot a mosogató alatt. Utána azonnal írj vagy telefonálj Ildinek.",
  "iss.saved": "Köszönjük! A bejelentésedet elmentettük, a szállásadók itt látják.",
  "iss.emailed": "Köszönjük! A bejelentésedet elmentettük, és e-mailt küldtünk a szállásadóknak.",
  "iss.f.active": "Nyitott",
  "iss.f.resolved": "Megoldva",
  "iss.f.all": "Összes",
  "iss.emptyResolvedT": "Még nincs megoldott bejelentés",
  "iss.emptyResolvedS": "A megjavított problémák itt jelennek meg.",
  "iss.emptyOpenT": "Nincs nyitott bejelentés",
  "iss.emptyOpenS": "Minden rendben működik. Ha valami elromlik, koppints a „Probléma bejelentése” gombra.",
  "iss.st.open": "Nyitott",
  "iss.st.in_progress": "Javítás alatt",
  "iss.st.resolved": "Megoldva",
  "iss.beingFixed": "Javítás alatt",
  "iss.markResolved": "Megoldva",
  "iss.reopen": "Újranyitás",
  "iss.u.low": "Apróság",
  "iss.u.lowHint": "Ráér",
  "iss.u.normal": "Javítani kell",
  "iss.u.normalHint": "Az ottlétem alatt",
  "iss.u.urgent": "Sürgős",
  "iss.u.urgentHint": "Azonnal",
  "iss.editTitle": "Bejelentés szerkesztése",
  "iss.what": "Mi a probléma?",
  "iss.whatPh": "pl. Folyamatosan folyik a víz a WC-ben",
  "iss.where": "Hol?",
  "iss.how": "Mennyire sürgős?",
  "iss.details": "Részletek",
  "iss.detailsPh": "Mikor kezdődött? Mit próbáltál már?",
  "iss.name": "A neved",
  "iss.sending": "Küldés…",
  "iss.send": "Bejelentés küldése",
  "area.Kitchen": "Konyha",
  "area.Bathroom": "Fürdőszoba",
  "area.Toilet": "WC",
  "area.Bedroom": "Hálószoba",
  "area.Living room": "Nappali",
  "area.Heating & water": "Fűtés és víz",
  "area.Wi-Fi & TV": "Wi-Fi és TV",
  "area.Windows & shades": "Ablakok és árnyékolók",
  "area.Other": "Egyéb",
};

const DICTS: Record<Lang, Record<TKey, string>> = { en, hu };
const LOCALES: Record<Lang, Locale> = { en: enGB, hu: huLocale };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  /** Picks the singular/plural form: n("nights", 3) → "3 nights" */
  n: (base: "nights" | "guests", count: number) => string;
  locale: Locale;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_LANG);
      if (saved === "hu" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LS_LANG, l); } catch {}
  }, []);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    const t: Ctx["t"] = (key, vars) => {
      let s: string = dict[key] ?? en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    };
    const n: Ctx["n"] = (base, count) => t(`${base}.${count === 1 ? "one" : "other"}` as TKey, { n: count });
    return { lang, setLang, t, n, locale: LOCALES[lang] };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** The English or Hungarian version of a piece of content, falling back to English. */
export function pick(lang: Lang, english: string, hungarian?: string | null) {
  return lang === "hu" && hungarian && hungarian.trim() ? hungarian : english;
}
