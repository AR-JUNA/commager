import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, Heart, Lock, Minus, Package, Truck, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AppNotification, Delivery, Meal, SubscriptionPlan } from "../types";
import { PLANS } from "../mock/plans";
import { useI18n } from "../i18n";
import { useApp } from "../store/AppContext";
import { Badge, Button, Card, Modal, Progress, AnimatedNumber, useRM } from "./ui";
import { cn, formatRs, isSameDay } from "../lib/utils";

/* ---------- Meal category ---------- */

const catTone: Record<Meal["category"], string> = {
  vegetarian: "bg-forest-100 text-forest-800",
  local: "bg-gold-100 text-gold-600",
  light: "bg-sage-100 text-sage-700",
  gourmet: "bg-clay-100 text-clay-700",
};

export function MealCategoryBadge({ category, className }: { category: Meal["category"]; className?: string }) {
  const { t } = useI18n();
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase", catTone[category], className)}>{t(`menu.cat.${category}`)}</span>;
}

/* ---------- Meal card ---------- */

export function MealCard({ meal, detailTo, selected, locked, cta = "select", onSelect, compact }: {
  meal: Meal;
  detailTo: string;
  selected?: boolean;
  locked?: boolean;
  cta?: "select" | "view";
  onSelect?: () => void;
  compact?: boolean;
}) {
  const { t, L, locale } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const rm = useRM();
  const fav = app.favorites.includes(meal.id);
  const [pop, setPop] = useState(false);

  const toggleFav = () => {
    const added = app.toggleFavorite(meal.id);
    app.toast(added ? t("toasts.favAdd") : t("toasts.favRemove"), "info");
    setPop(true);
    setTimeout(() => setPop(false), 450);
  };

  return (
    <motion.article
      whileHover={rm ? undefined : { y: -5 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border bg-paper shadow-card transition-[border-color,box-shadow] duration-300",
        selected ? "border-forest-700 ring-2 ring-forest-700/25" : "border-sand-deep/50 hover:shadow-lift",
      )}
    >
      {selected && (
        <motion.span initial={rm ? { opacity: 0 } : { scale: 0 }} animate={rm ? { opacity: 1 } : { scale: [0, 1.15, 1] }} transition={{ duration: 0.4 }}
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-forest-700 px-3 py-1.5 text-[11.5px] font-bold text-cream shadow-soft">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          {t("week.selected")}
        </motion.span>
      )}
      {!selected && (
        <span className={cn("absolute top-3 left-3 z-20")}>
          <MealCategoryBadge category={meal.category} />
        </span>
      )}
      <button type="button" onClick={toggleFav} aria-label={fav ? t("meal.removeFav") : t("meal.addFav")} aria-pressed={fav}
        className="absolute top-3 right-3 z-20 rounded-full bg-paper/90 p-2 shadow-sm backdrop-blur transition-colors hover:bg-paper">
        <motion.span animate={pop && !rm ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}>
          <Heart className={cn("h-[17px] w-[17px] transition-colors duration-200", fav ? "fill-clay-600 text-clay-600" : "text-ink-soft")} />
        </motion.span>
      </button>

      <button type="button" onClick={() => navigate(detailTo)} className="relative block aspect-[4/3] w-full overflow-hidden text-left" aria-label={L(meal.name)}>
        <img src={meal.image} alt={L(meal.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]" />
        <span className="absolute inset-0 bg-gradient-to-t from-forest-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      <div className={cn("flex flex-1 flex-col p-4", compact && "p-3.5")}>
        <button type="button" onClick={() => navigate(detailTo)} className="text-left">
          <h3 className="font-display text-[17px] leading-snug font-semibold text-forest-950 transition-colors group-hover:text-forest-700">{L(meal.name)}</h3>
        </button>
        {!compact && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-mute">{L(meal.description)}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11.5px] font-bold text-ink-soft">
            <Flame className="h-3 w-3 text-gold-600" />
            {meal.calories} {t("menu.kcal")}
          </span>
          {meal.diet.slice(0, 2).map((d) => (
            <span key={d} className="rounded-full border border-sage-300 px-2.5 py-1 text-[11.5px] font-semibold text-sage-700">
              {t(`diet.${d}`)}
            </span>
          ))}
        </div>
        <div className="mt-4 flex-1" />
        {cta === "view" ? (
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(detailTo)}>
            {t("menu.view")}
          </Button>
        ) : selected ? (
          <div className="flex h-9 items-center justify-center rounded-full border border-forest-700/30 bg-forest-50 text-[13px] font-semibold text-forest-800">
            <Check className="mr-1.5 h-4 w-4" /> {t("week.selected")}
          </div>
        ) : (
          <Button size="sm" className="w-full" onClick={onSelect} disabled={locked}>
            {locked ? (
              <>
                <Lock className="h-3.5 w-3.5" /> {t("week.locked")}
              </>
            ) : (
              t("menu.choose")
            )}
          </Button>
        )}
      </div>
    </motion.article>
  );
}

/* ---------- Day selector ---------- */

export function DaySelector({ days, active, onChange }: { days: Date[]; active: number; onChange: (i: number) => void }) {
  const { weekday, date } = useI18n();
  const today = new Date();
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1" role="tablist" aria-label={date(days[active])}>
      {days.map((d, i) => {
        const isActive = i === active;
        const isToday = isSameDay(d, today);
        return (
          <button key={d.toISOString()} role="tab" aria-selected={isActive} onClick={() => onChange(i)}
            className={cn("relative shrink-0 rounded-2xl px-4 py-2.5 text-center transition-colors duration-200 sm:min-w-[86px]", isActive ? "text-cream" : "text-ink-soft hover:bg-sand/70")}>
            {isActive && <motion.span layoutId="day-active" className="absolute inset-0 rounded-2xl bg-forest-800 shadow-soft" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative z-10 block text-[11px] font-bold tracking-[0.14em] uppercase opacity-80">{weekday(i)}</span>
            <span className="relative z-10 block font-display text-[19px] font-semibold">{d.getDate()}</span>
            {isToday && <span className={cn("relative z-10 mx-auto mt-0.5 block h-1 w-1 rounded-full", isActive ? "bg-sage-300" : "bg-forest-700")} />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Meal grid with day-change transition ---------- */

export function MealGrid({ meals, detailBase, renderCard }: { meals: Meal[]; detailBase: string; renderCard?: (meal: Meal) => ReactNode }) {
  const { L } = useI18n();
  const rm = useRM();
  return (
    <div key={meals[0]?.date ?? "empty"} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {meals.map((meal, i) => (
          <motion.div key={meal.id} initial={rm ? { opacity: 0 } : { opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={rm ? { opacity: 0 } : { opacity: 0, x: -18 }} transition={{ duration: 0.32, delay: rm ? 0 : i * 0.05 }}>
            {renderCard ? renderCard(meal) : <MealCard meal={meal} detailTo={`${detailBase}/${meal.id}`} cta="view" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Plans ---------- */

export function PlanCard({ plan, current, onSelect, compact }: { plan: SubscriptionPlan; current?: boolean; onSelect?: () => void; compact?: boolean }) {
  const { t } = useI18n();
  const rm = useRM();
  const dark = plan.recommended;
  return (
    <motion.div whileHover={rm ? undefined : { y: -6 }} transition={{ duration: 0.25 }}
      className={cn("relative flex h-full flex-col rounded-[1.4rem] border p-6 sm:p-7", dark ? "border-forest-950 bg-forest-900 text-cream shadow-lift" : "border-sand-deep/60 bg-paper shadow-card", current && "ring-2 ring-gold-500/70")}>
      {plan.recommended && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.08em] whitespace-nowrap text-forest-950 uppercase shadow-soft">
          {t("planssec.popular")}
        </span>
      )}
      {current && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.08em] whitespace-nowrap text-forest-950 uppercase shadow-soft">
          {t("planssec.current")}
        </span>
      )}
      <p className={cn("text-[13px] font-bold tracking-[0.2em] uppercase", dark ? "text-sage-300" : "text-sage-600")}>{plan.id}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn("font-display text-[40px] leading-none font-semibold", dark ? "text-cream" : "text-forest-900")}>{formatRs(plan.priceWeekly)}</span>
        <span className={cn("text-[13px] font-medium", dark ? "text-cream/60" : "text-mute")}>{t("common.perWeek")}</span>
      </div>
      <p className={cn("mt-1 text-[13px]", dark ? "text-cream/65" : "text-mute")}>
        ≈ {formatRs(Math.round(plan.priceWeekly / plan.mealsPerWeek))} / {t("common.meals").replace(/s$/, "")}
      </p>
      <ul className={cn("mt-6 space-y-3 border-t pt-5 text-[13.5px]", dark ? "border-cream/15" : "border-sand")}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className={cn("mt-0.5 h-4 w-4 shrink-0", dark ? "text-sage-300" : "text-forest-700")} strokeWidth={2.6} />
            <span className={dark ? "text-cream/85" : "text-ink-soft"}>
              {t(f.includes("meals") ? "plans.feat.meals" : f.includes("credits") ? "plans.feat.credits" : f, {
                n: f.includes("meals") ? plan.mealsPerWeek : plan.credits,
              })}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex-1" />
      {onSelect && (
        <Button variant={dark ? "gold" : "primary"} className="w-full" size={compact ? "sm" : "md"} onClick={onSelect} disabled={current}>
          {current ? t("planssec.current") : t("planssec.choose")}
        </Button>
      )}
    </motion.div>
  );
}

export function PlanComparison() {
  const { t } = useI18n();
  const rows: Array<{ label: string; get: (p: SubscriptionPlan) => string | boolean }> = [
    { label: t("checkout.mealsWeek"), get: (p) => `${p.mealsPerWeek}` },
    { label: t("checkout.weeklyCredits"), get: (p) => `${p.credits}` },
    { label: t("plans.feat.menu"), get: () => true },
    { label: t("plans.feat.box"), get: () => true },
    { label: t("plans.feat.flex"), get: () => true },
    { label: t("plans.feat.support"), get: (p) => p.id !== "basic" },
    { label: t("plans.feat.preview"), get: (p) => p.id === "premium" },
  ];
  return (
    <div className="overflow-x-auto rounded-card border border-sand-deep/60 bg-paper shadow-card">
      <table className="w-full min-w-[560px] text-[13.5px]">
        <thead>
          <tr className="border-b border-sand">
            <th className="px-5 py-4 text-left font-semibold text-mute">{t("planssec.compareT")}</th>
            {PLANS.map((p) => (
              <th key={p.id} className={cn("px-4 py-4 text-center font-display text-[16px] font-semibold", p.recommended ? "text-forest-800" : "text-ink")}>{p.id.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={cn(i % 2 === 1 && "bg-cream/70")}>
              <td className="px-5 py-3.5 font-medium text-ink-soft">{r.label}</td>
              {PLANS.map((p) => {
                const v = r.get(p);
                return (
                  <td key={p.id} className="px-4 py-3.5 text-center">
                    {v === true ? <Check className="mx-auto h-4.5 w-4.5 text-forest-700" style={{ width: 18, height: 18 }} strokeWidth={2.6} /> : v === false ? <Minus className="mx-auto h-4 w-4 text-sand-deep" /> : <span className="font-semibold text-forest-900">{v}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/* ---------- Credits ---------- */

export function CreditProgress({ showLabel = true }: { showLabel?: boolean }) {
  const { t } = useI18n();
  const { usedCredits, credits, remainingCredits } = useApp();
  return (
    <div>
      {showLabel && (
        <div className="mb-2.5 flex items-baseline justify-between">
          <p className="text-[13px] font-semibold text-ink-soft">{t("dash.progressT")}</p>
          <p className="text-[13px] font-medium text-mute">
            <AnimatedNumber value={usedCredits} className="font-display text-[17px] font-semibold text-forest-900" /> / {credits}
          </p>
        </div>
      )}
      <Progress value={usedCredits} max={credits} />
      <p className="mt-2 text-[12.5px] font-medium text-mute">
        {remainingCredits > 0 ? t("dash.remaining", { n: remainingCredits }) : t("dash.allSelected")}
      </p>
    </div>
  );
}

/* ---------- Delivery ---------- */

const statusTone: Record<Delivery["status"], "sand" | "sage" | "gold" | "forest" | "clay"> = {
  to_prepare: "sand",
  prepared: "sage",
  out: "gold",
  delivered: "forest",
  issue: "clay",
};

export function DeliveryStatusBadge({ status }: { status: Delivery["status"] }) {
  const { t } = useI18n();
  const rm = useRM();
  return (
    <Badge tone={statusTone[status]}>
      {status === "out" && <motion.span animate={rm ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-gold-600" />}
      {status === "delivered" && <Check className="h-3 w-3" strokeWidth={3} />}
      {t(`deliv.s.${status}`)}
    </Badge>
  );
}

export function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const { t, L, date } = useI18n();
  const rm = useRM();
  return (
    <motion.div initial={rm ? { opacity: 0 } : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44">
            <img src={delivery.meal.image} alt={L(delivery.meal.name)} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute top-3 left-3">
              <MealCategoryBadge category={delivery.meal.category} />
            </span>
          </div>
          <div className="flex-1 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold tracking-[0.1em] text-sage-600 uppercase">{date(delivery.date)}</p>
                <h3 className="mt-0.5 font-display text-[18px] font-semibold text-forest-950">{L(delivery.meal.name)}</h3>
              </div>
              <DeliveryStatusBadge status={delivery.status} />
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="font-semibold text-mute">{t("deliv.window")} :</dt>
                <dd className="text-ink-soft">{L(delivery.timeWindow)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-mute">{t("deliv.qty")} :</dt>
                <dd className="text-ink-soft">{delivery.quantity}</dd>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <dt className="font-semibold text-mute">{t("deliv.address")} :</dt>
                <dd className="text-ink-soft">{delivery.address}</dd>
              </div>
              {delivery.instructions && (
                <div className="flex gap-2 sm:col-span-2">
                  <dt className="font-semibold text-mute">{t("deliv.instructions")} :</dt>
                  <dd className="text-ink-soft">{delivery.instructions}</dd>
                </div>
              )}
              {delivery.box && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Package className="h-3.5 w-3.5 text-sage-600" />
                  <dd className="font-semibold text-sage-700">{t("deliv.boxB")}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ---------- Notification ---------- */

const notifIcon: Record<AppNotification["category"], typeof Truck> = {
  menu: UtensilsCrossed,
  selection: Check,
  delivery: Truck,
  payment: Package,
  subscription: Minus,
};

export function NotificationCard({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const { L, dateShort, time } = useI18n();
  const Icon = notifIcon[n.category];
  return (
    <button type="button" onClick={onRead}
      className={cn("flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200", n.read ? "border-sand-deep/50 bg-paper/70" : "border-forest-800/20 bg-paper shadow-card hover:shadow-lift")}>
      <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", n.read ? "bg-sand text-mute" : "bg-forest-100 text-forest-800")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className={cn("text-[14px]", n.read ? "font-medium text-ink-soft" : "font-bold text-forest-950")}>{L(n.title)}</span>
          <span className="shrink-0 text-[11.5px] font-medium text-mute">{dateShort(n.date)} · {time(n.date)}</span>
        </span>
        <span className={cn("mt-1 block text-[13px] leading-relaxed", n.read ? "text-mute" : "text-ink-soft")}>{L(n.body)}</span>
      </span>
      {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-clay-600" />}
    </button>
  );
}

/* ---------- Checkout ---------- */

export function CheckoutSteps({ current }: { current: number }) {
  const { t } = useI18n();
  const steps = [t("checkout.s1"), t("checkout.s2"), t("checkout.s3"), t("checkout.s4")];
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={cn("flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold", i < current ? "bg-forest-100 text-forest-800" : i === current ? "bg-forest-800 text-cream shadow-soft" : "bg-sand text-mute")}>
            {i < current ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="text-[11px]">{i + 1}</span>}
            <span className="hidden sm:inline">{s}</span>
          </span>
          {i < steps.length - 1 && <span className={cn("h-[2px] w-4 rounded-full sm:w-7", i < current ? "bg-forest-700" : "bg-sand-deep")} />}
        </li>
      ))}
    </ol>
  );
}

export function CheckoutSummary({ planId, box }: { planId: string; box: boolean }) {
  const { t } = useI18n();
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];
  return (
    <Card className="p-6">
      <p className="text-[12px] font-bold tracking-[0.18em] text-sage-600 uppercase">{t("checkout.summaryT")}</p>
      <div className="mt-4 space-y-3 text-[14px]">
        <div className="flex justify-between">
          <span className="text-mute">{t("checkout.plan")}</span>
          <span className="font-display text-[16px] font-semibold text-forest-900 uppercase">{plan.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-mute">{t("checkout.mealsWeek")}</span>
          <span className="font-semibold text-ink">{plan.mealsPerWeek}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-mute">{t("checkout.weeklyCredits")}</span>
          <span className="font-semibold text-ink">{plan.credits}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-mute">{t("checkout.billing")}</span>
          <span className="font-semibold text-ink">{t("common.perWeek").replace("/", "").trim()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-mute">{t("checkout.box")}</span>
          <span className="font-semibold text-sage-700">{box ? t("checkout.boxYes") : t("checkout.included")}</span>
        </div>
      </div>
      <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-sand-deep pt-5">
        <span className="text-[14px] font-semibold text-ink">{t("checkout.total")}</span>
        <span className="font-display text-[30px] font-semibold text-forest-900">
          Rs <AnimatedNumber value={plan.priceWeekly} /> <span className="text-[15px] font-sans font-medium text-mute">{t("checkout.perWeek")}</span>
        </span>
      </div>
      <p className="mt-3 rounded-xl bg-sage-100 px-3.5 py-2.5 text-[12px] font-medium text-sage-700">
        {t("planssec.creditRuleD")}
      </p>
    </Card>
  );
}

/* ---------- Box visual ---------- */

export function BoxVisual({ number }: { number: string }) {
  const { t } = useI18n();
  const rm = useRM();
  return (
    <motion.div initial={rm ? { opacity: 0 } : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
      <div className="relative mx-auto w-full max-w-[340px]">
        <svg viewBox="0 0 320 260" className="w-full drop-shadow-xl" role="img" aria-label="Commanger Box">
          {/* lid */}
          <polygon points="160,28 292,86 160,144 28,86" fill="#234830" />
          <polygon points="160,28 292,86 160,144 28,86" fill="url(#lidShine)" opacity="0.35" />
          {/* left face */}
          <polygon points="28,86 160,144 160,236 28,178" fill="#1b3826" />
          {/* right face */}
          <polygon points="292,86 160,144 160,236 292,178" fill="#142a1c" />
          {/* handle */}
          <polygon points="136,64 184,64 196,88 124,88" fill="#0e1f15" opacity="0.55" />
          {/* label on right face */}
          <g transform="matrix(1,-0.44,0,1,0,0)">
            <rect x="188" y="236" width="86" height="34" rx="6" fill="#f5f0e4" opacity="0.95" transform="translate(0,6)" />
          </g>
          <defs>
            <linearGradient id="lidShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a4b996" />
              <stop offset="1" stopColor="#234830" />
            </linearGradient>
          </defs>
          {/* leaf mark on lid */}
          <g transform="translate(160,86)">
            <circle r="17" fill="#f5f0e4" />
            <path d="M-7 5c0-8 5.5-13 13.5-14-.8 8.2-5.6 13.4-13.5 14Z" fill="#234830" />
            <path d="M-7 5c0-5.6-3.6-9.4-9-10.2.6 6 3.8 9.4 9 10.2Z" fill="#6f8a63" />
          </g>
        </svg>
        <div className="absolute right-[8%] bottom-[26%] rotate-[-6deg] rounded-lg bg-cream px-3 py-1.5 shadow-soft">
          <p className="text-[10px] font-bold tracking-[0.12em] text-sage-600 uppercase">Commanger</p>
          <p className="font-display text-[13px] font-semibold text-forest-900">{number}</p>
        </div>
        <div className="absolute top-[16%] left-[4%]">
          <Badge tone="sage">
            <Package className="h-3 w-3" /> {t("boxsec.f1")}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Meal selector modal ---------- */

export function MealSelectorModal({ open, day, meals, selectedId, onClose, onPick, onClear }: {
  open: boolean;
  day: Date | null;
  meals: Meal[];
  selectedId: string | null;
  onClose: () => void;
  onPick: (mealId: string) => void;
  onClear: () => void;
}) {
  const { t, L, date } = useI18n();
  const [choice, setChoice] = useState<string | null>(null);
  const current = choice ?? selectedId;
  return (
    <Modal open={open} onClose={onClose} title={t("week.selectorT")} wide>
      {day && <p className="-mt-2 mb-4 text-[13.5px] font-medium text-mute">{t("week.selectorD", { day: date(day) })}</p>}
      <div className="space-y-2.5" role="radiogroup" aria-label={t("week.selectorT")}>
        {meals.map((meal) => {
          const active = current === meal.id;
          return (
            <button key={meal.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(meal.id)}
              className={cn("flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-200", active ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700/20" : "border-sand-deep/60 bg-white/60 hover:border-sage-400")}>
              <img src={meal.image} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <MealCategoryBadge category={meal.category} />
                </span>
                <span className="mt-1 block truncate font-display text-[15.5px] font-semibold text-forest-950">{L(meal.name)}</span>
                <span className="block text-[12px] font-medium text-mute">{meal.calories} {t("menu.kcal")}</span>
              </span>
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all", active ? "border-forest-700 bg-forest-700 text-cream" : "border-sand-deep")}>
                {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        {selectedId && (
          <Button variant="ghost" className="sm:flex-none" onClick={() => { setChoice(null); onClear(); }}>
            {t("week.clear")}
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button disabled={!choice || choice === selectedId} onClick={() => choice && onPick(choice)}>
          {t("week.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
