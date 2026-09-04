import { useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, ChevronDown, Loader2, SearchX, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useApp } from "../store/AppContext";

/* ---------- Motion helpers ---------- */

export function useRM(): boolean {
  return Boolean(useReducedMotion());
}

export const fadeUp = (rm: boolean, delay = 0) => ({
  initial: rm ? { opacity: 0 } : { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const rm = useRM();
  return (
    <motion.div {...fadeUp(rm, delay)} className={className}>
      {children}
    </motion.div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden />;
}

/* ---------- Layout ---------- */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}>{children}</div>;
}

export function SectionHeading({ kicker, title, sub, align = "center", className }: { kicker?: string; title: string; sub?: string; align?: "center" | "left"; className?: string }) {
  const rm = useRM();
  return (
    <motion.div {...fadeUp(rm)} className={cn("mb-10 max-w-2xl sm:mb-14", align === "center" ? "mx-auto text-center" : "", className)}>
      {kicker && <p className="mb-3 text-[13px] font-semibold tracking-[0.18em] text-sage-600 uppercase">{kicker}</p>}
      <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.08] font-medium text-forest-900">{title}</h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-mute sm:text-base">{sub}</p>}
    </motion.div>
  );
}

/* ---------- Buttons ---------- */

type BtnVariant = "primary" | "light" | "outline" | "ghost" | "danger" | "gold";
type BtnSize = "sm" | "md" | "lg";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-forest-800 text-cream hover:bg-forest-700 shadow-soft",
  light: "bg-cream text-forest-900 hover:bg-white shadow-soft",
  outline: "border border-forest-800/25 bg-transparent text-forest-800 hover:border-forest-800/50 hover:bg-forest-50",
  ghost: "text-forest-800 hover:bg-forest-800/8",
  danger: "bg-clay-600 text-cream hover:bg-clay-700",
  gold: "bg-gold-500 text-forest-950 hover:bg-gold-300",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "h-9 px-4 text-[13px] gap-1.5",
  md: "h-11 px-6 text-[14.5px] gap-2",
  lg: "h-[52px] px-8 text-[15.5px] gap-2.5",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: BtnProps) {
  const rm = useRM();
  return (
    <motion.button
      whileHover={rm ? undefined : { scale: 1.02 }}
      whileTap={rm ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.01em] transition-colors duration-200 select-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...(rest as Record<string, unknown>)}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

export function ButtonLink({ to, variant = "primary", size = "md", className, children, arrow }: { to: string; variant?: BtnVariant; size?: BtnSize; className?: string; children: ReactNode; arrow?: boolean }) {
  const rm = useRM();
  return (
    <motion.span whileHover={rm ? undefined : { scale: 1.02 }} whileTap={rm ? undefined : { scale: 0.97 }} className="inline-flex">
      <Link
        to={to}
        className={cn(
          "group/btn inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-200",
          btnVariants[variant],
          btnSizes[size],
          className,
        )}
      >
        {children}
        {arrow && (
          <svg className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </Link>
    </motion.span>
  );
}

/* ---------- Badges & cards ---------- */

type Tone = "forest" | "sage" | "gold" | "clay" | "amber" | "sand";
const tones: Record<Tone, string> = {
  forest: "bg-forest-100 text-forest-800",
  sage: "bg-sage-100 text-sage-700",
  gold: "bg-gold-100 text-gold-600",
  clay: "bg-clay-100 text-clay-700",
  amber: "bg-amberish-100 text-amberish-600",
  sand: "bg-sand text-ink-soft",
};

export function Badge({ tone = "sage", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold tracking-[0.04em]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-card border border-sand-deep/50 bg-paper shadow-card", className)}>{children}</div>;
}

/* ---------- Form fields ---------- */

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13.5px] font-semibold text-ink">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[12.5px] font-medium text-clay-600">
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-[12.5px] text-mute">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const fieldCls = (error?: string) =>
  cn(
    "w-full rounded-xl border bg-white/70 px-4 py-2.5 text-[14.5px] text-ink placeholder:text-mute/70 transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-forest-600/25 focus:border-forest-600 focus:bg-white",
    error ? "border-clay-600/60" : "border-sand-deep/70 hover:border-sage-400",
  );

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export function Input({ invalid, className, ...rest }: InputProps) {
  return <input className={cn(fieldCls(invalid ? "x" : undefined), className)} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <select className={cn(fieldCls(invalid ? "x" : undefined), "appearance-none pr-10 bg-no-repeat", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2377735f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 14px center" }}
      {...rest}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return <textarea className={cn(fieldCls(invalid ? "x" : undefined), "min-h-[120px] resize-y", className)} {...rest} />;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn("relative h-6.5 w-11.5 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-forest-700" : "bg-sand-deep")}
      style={{ height: 26, width: 46 }}>
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className="absolute top-[3px] block h-5 w-5 rounded-full bg-white shadow"
        style={{ left: checked ? 23 : 3 }} />
    </button>
  );
}

/* ---------- Progress & numbers ---------- */

export function Progress({ value, max, className, barClass }: { value: number; max: number; className?: string; barClass?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-sand", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <motion.div className={cn("h-full rounded-full bg-forest-700", barClass)}
        initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 22 }} />
    </div>
  );
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const rm = useRM();
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (rm) {
      setDisplay(value);
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.55, ease: "easeOut", onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [value, rm, mv]);
  return <span className={className}>{display}</span>;
}

/* ---------- States ---------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-sand-deep bg-cream/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-700">
        {icon ?? <SearchX className="h-6 w-6" />}
      </div>
      <p className="font-display text-lg font-medium text-forest-900">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13.5px] text-mute">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  const { t } = useI18n();
  const retryLabel = t("common.retry");
  return (
    <div className="flex flex-col items-center rounded-card border border-clay-600/25 bg-clay-100/40 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-clay-100 text-clay-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="font-display text-lg font-medium text-forest-900">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13.5px] text-mute">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/* ---------- Accordion ---------- */

export function AccordionItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={cn("rounded-2xl border transition-colors duration-200", open ? "border-forest-800/25 bg-paper shadow-card" : "border-sand-deep/60 bg-paper/60 hover:border-sage-400")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
        <span className="text-[15px] font-semibold text-ink">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-forest-700">
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <p className="px-5 pb-5 text-[14px] leading-relaxed text-ink-soft sm:px-6">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  const rm = useRM();
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby={title ? id : undefined}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-forest-950/55 backdrop-blur-[3px]" />
          <motion.div
            initial={rm ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={rm ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative max-h-[88vh] w-full overflow-y-auto rounded-3xl border border-sand-deep/50 bg-paper p-6 shadow-lift sm:p-8", wide ? "max-w-2xl" : "max-w-md")}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title && (
                <h3 id={id} className="font-display text-[22px] leading-tight font-medium text-forest-900">
                  {title}
                </h3>
              )}
              <button type="button" onClick={onClose} aria-label="close" className="rounded-full p-1.5 text-mute transition-colors hover:bg-sand hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Tabs ---------- */

export function Tabs({ items, active, onChange, id }: { items: Array<{ id: string; label: string; count?: number }>; active: string; onChange: (id: string) => void; id: string }) {
  return (
    <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-full border border-sand-deep/60 bg-cream p-1">
      {items.map((item) => (
        <button key={item.id} role="tab" aria-selected={active === item.id} onClick={() => onChange(item.id)}
          className={cn("relative rounded-full px-4 py-1.5 text-[13.5px] font-semibold transition-colors duration-200", active === item.id ? "text-cream" : "text-ink-soft hover:text-forest-800")}>
          {active === item.id && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-full bg-forest-800" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          <span className="relative z-10 inline-flex items-center gap-1.5">
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className={cn("rounded-full px-1.5 text-[11px]", active === item.id ? "bg-cream/20" : "bg-sand")}>{item.count}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Language switcher ---------- */

export function LanguageSwitcher({ dark }: { dark?: boolean }) {
  const { locale, setLocale } = useI18n();
  const opts: Array<{ id: "fr" | "en"; label: string }> = [
    { id: "fr", label: "FR" },
    { id: "en", label: "EN" },
  ];
  return (
    <div role="group" aria-label="Language" className={cn("inline-flex items-center rounded-full border p-0.5 text-[12.5px] font-bold tracking-wide", dark ? "border-cream/25 bg-forest-950/40" : "border-sand-deep/70 bg-white/60")}>
      {opts.map((o) => (
        <button key={o.id} type="button" onClick={() => setLocale(o.id)} aria-pressed={locale === o.id}
          className={cn("rounded-full px-2.5 py-1 transition-all duration-200", locale === o.id ? (dark ? "bg-cream text-forest-900" : "bg-forest-800 text-cream shadow-sm") : dark ? "text-cream/70 hover:text-cream" : "text-mute hover:text-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

import { useI18n } from "../i18n";

/* ---------- Toasts ---------- */

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.25 }}
            className={cn("pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift backdrop-blur", t.kind === "error" ? "border-clay-600/30 bg-clay-100/95 text-clay-700" : "border-forest-800/20 bg-forest-900/95 text-cream")}>
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", t.kind === "error" ? "bg-clay-600 text-cream" : "bg-sage-400 text-forest-950")}>
              {t.kind === "error" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            </span>
            <p className="flex-1 text-[13.5px] leading-snug font-medium">{t.message}</p>
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="dismiss" className="mt-0.5 opacity-60 transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function SuccessCheck({ big }: { big?: boolean }) {
  const rm = useRM();
  return (
    <motion.span initial={rm ? { opacity: 0 } : { scale: 0 }} animate={rm ? { opacity: 1 } : { scale: [0, 1.15, 1] }} transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("inline-flex items-center justify-center rounded-full bg-forest-700 text-cream", big ? "h-16 w-16" : "h-6 w-6")}>
      <Check className={big ? "h-8 w-8" : "h-3.5 w-3.5"} strokeWidth={2.6} />
    </motion.span>
  );
}
