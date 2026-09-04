import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import fr from "./fr";
import en from "./en";
import type { Dict } from "./fr";
import type { Locale, LStr } from "../types";
import { fmtDate, fmtDateShort, fmtTime, formatRs, ls } from "../lib/utils";

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  raw: (key: string) => unknown;
  L: (s: LStr) => string;
  rs: (n: number) => string;
  date: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string;
  dateShort: (d: Date | string) => string;
  time: (d: Date | string) => string;
  weekday: (index: number, full?: boolean) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const dicts: Record<Locale, Dict> = { fr, en };

function lookup(dict: Dict, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem("cmg_locale");
      return saved === "en" ? "en" : "fr";
    } catch {
      return "fr";
    }
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("cmg_locale", l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const val = lookup(dicts[locale], key);
      let str = typeof val === "string" ? val : key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) str = str.split(`{${k}}`).join(String(v));
      }
      return str;
    },
    [locale],
  );

  const value = useMemo<I18nCtx>(
    () => ({
      locale,
      setLocale,
      t,
      raw: (key: string) => lookup(dicts[locale], key),
      L: (s: LStr) => ls(s, locale),
      rs: formatRs,
      date: (d, opts) => fmtDate(d, locale, opts),
      dateShort: (d) => fmtDateShort(d, locale),
      time: (d) => fmtTime(d, locale),
      weekday: (i, full) => (full ? dicts[locale].menu.daysFull[i] : dicts[locale].menu.daysShort[i]),
    }),
    [locale, setLocale, t],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
