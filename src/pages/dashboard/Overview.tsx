import { motion } from "framer-motion";
import { ArrowRight, Bell, CalendarDays, Gift, Lock, Package, Truck, UtensilsCrossed } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { AnimatedNumber, Badge, ButtonLink, Card, Progress, Reveal, useRM } from "../../components/ui";
import { mockUpcomingDeliveries } from "../../mock/data";
import { planById, PROMO_CODE } from "../../mock/plans";
import { currentWeek, isLocked, iso, isSameDay } from "../../lib/utils";
import { cn } from "../../lib/utils";

export default function Overview() {
  const { t, L, date, dateShort, weekday } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const rm = useRM();
  if (!app.user || !app.subscription) return null;

  const plan = planById(app.subscription.planId);
  const status = app.subscription.status;
  const deliveries = mockUpcomingDeliveries().slice(0, 2);
  const week = currentWeek();
  const notifs = app.notifications.filter((n) => !n.read).slice(0, 2);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
    } catch {
      /* clipboard unavailable in some contexts */
    }
    app.toast(t("dash.copied"));
  };

  const stagger = (i: number) => ({
    initial: rm ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div>
      <motion.div {...stagger(0)}>
        <h1 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold text-forest-950">{t("dash.greeting", { name: app.user.firstName })}</h1>
        <p className="mt-1 text-[14px] text-mute">{t("dash.sub")}</p>
      </motion.div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {/* Subscription summary */}
        <motion.div {...stagger(1)} className="lg:col-span-2">
          <Card className="relative overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sage-200/40 blur-2xl" aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">{t("dash.subT")}</p>
                <p className="font-display mt-2 text-[34px] leading-none font-semibold text-forest-950 uppercase">{plan.id}</p>
              </div>
              <Badge tone={status === "active" ? "forest" : status === "paused" ? "amber" : "clay"}>{t(`dash.status.${status}`)}</Badge>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[13.5px] sm:grid-cols-4">
              <div>
                <dt className="font-semibold text-mute">{t("dash.mealsL")}</dt>
                <dd className="font-display mt-0.5 text-[20px] font-semibold text-forest-900">{plan.mealsPerWeek}</dd>
              </div>
              <div>
                <dt className="font-semibold text-mute">{t("dash.creditsL")}</dt>
                <dd className="font-display mt-0.5 text-[20px] font-semibold text-forest-900">
                  <AnimatedNumber value={app.usedCredits} /> / {app.credits}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-mute">{t("dash.startL")}</dt>
                <dd className="mt-1 font-semibold text-ink">{dateShort(app.subscription.startDate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-mute">{t("dash.renewalL")}</dt>
                <dd className="mt-1 font-semibold text-ink">{dateShort(app.subscription.nextRenewal)}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[13px] font-semibold text-ink-soft">{t("dash.xOfY", { x: app.usedCredits, y: app.credits })}</p>
                {app.remainingCredits > 0 ? (
                  <p className="text-[12.5px] font-semibold text-gold-600">{t("dash.remaining", { n: app.remainingCredits })}</p>
                ) : (
                  <p className="text-[12.5px] font-semibold text-forest-700">{t("dash.allSelected")}</p>
                )}
              </div>
              <Progress value={app.usedCredits} max={app.credits} className="h-3" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to="/dashboard/semaine" size="sm" arrow>
                {t("dash.viewWeek")}
              </ButtonLink>
              <ButtonLink to="/dashboard/abonnement" variant="outline" size="sm">
                {t("sidebar.subscription")}
              </ButtonLink>
            </div>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div {...stagger(2)}>
          <Card className="h-full p-5">
            <p className="text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">{t("dash.quickT")}</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { to: "/dashboard/semaine", icon: UtensilsCrossed, label: t("dash.q1") },
                { to: "/dashboard/menu", icon: CalendarDays, label: t("dash.q2") },
                { to: "/dashboard/livraisons", icon: Truck, label: t("dash.q3") },
                { to: "/dashboard/box", icon: Package, label: t("dash.q4") },
              ].map((q) => (
                <Link key={q.to} to={q.to} className="group flex flex-col items-start gap-2.5 rounded-2xl border border-sand-deep/60 bg-cream/70 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-700/40 hover:bg-forest-50 hover:shadow-soft">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-800 transition-colors group-hover:bg-forest-800 group-hover:text-cream">
                    <q.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[12.5px] leading-tight font-bold text-forest-950">{q.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Upcoming deliveries */}
        <motion.div {...stagger(3)} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">{t("dash.upcomingT")}</p>
              <Link to="/dashboard/livraisons" className="inline-flex items-center gap-1 text-[12.5px] font-bold text-forest-800 hover:underline">
                {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {deliveries.length === 0 ? (
              <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-sand-deep bg-cream/60 px-5 py-8 text-center">
                <Truck className="h-6 w-6 text-sage-500" />
                <p className="mt-2.5 font-display text-[15.5px] font-semibold text-forest-950">{t("dash.noUpcoming")}</p>
                <p className="mt-1 text-[12.5px] text-mute">{t("dash.noUpcomingD")}</p>
                <ButtonLink to="/dashboard/semaine" size="sm" className="mt-4">
                  {t("dash.q1")}
                </ButtonLink>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {deliveries.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 rounded-2xl border border-sand-deep/60 bg-white/60 p-3 transition-colors hover:border-sage-400">
                    <img src={d.meal.image} alt="" className="h-14 w-[70px] shrink-0 rounded-xl object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-bold tracking-[0.1em] text-sage-600 uppercase">{date(d.date)}</p>
                      <p className="truncate font-display text-[15px] font-semibold text-forest-950">{L(d.meal.name)}</p>
                    </div>
                    <Badge tone={d.status === "out" ? "gold" : d.status === "prepared" ? "sage" : "sand"}>
                      {d.status === "out" && <motion.span animate={rm ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-gold-600" />}
                      {t(`deliv.s.${d.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Week strip */}
        <motion.div {...stagger(4)}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">{t("dash.weekT")}</p>
              <Link to="/dashboard/semaine" className="inline-flex items-center gap-1 text-[12.5px] font-bold text-forest-800 hover:underline">
                {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {week.map((d, i) => {
                const dayIso = iso(d);
                const sel = app.selections[dayIso];
                const locked = isLocked(d);
                const today = isSameDay(d, new Date());
                return (
                  <button key={dayIso} type="button" onClick={() => navigate("/dashboard/semaine")}
                    className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-200", today ? "border-forest-700/40 bg-forest-50" : "border-transparent hover:bg-sand/60")}>
                    <span className="w-9 shrink-0 text-[11.5px] font-bold tracking-wide text-mute uppercase">{weekday(i)}</span>
                    {sel ? (
                      <>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-forest-700" />
                        <span className="truncate text-[13px] font-semibold text-forest-950">{(() => { const mm = mealById(sel); return mm ? L(mm.name) : ""; })()}</span>
                      </>
                    ) : locked ? (
                      <>
                        <Lock className="h-3.5 w-3.5 shrink-0 text-sand-deep" />
                        <span className="text-[12.5px] font-medium text-mute">{t("week.lockedState")}</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 shrink-0 rounded-full border-2 border-sand-deep" />
                        <span className="text-[12.5px] font-medium text-mute">{t("week.noDelivery")}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Box */}
        <motion.div {...stagger(5)}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">{t("dash.boxT")}</p>
              <Badge tone="forest">{t("boxp.statusOk")}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-800 text-cream">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[16px] font-semibold text-forest-950">{t("dash.boxN")} {app.boxNumber}</p>
                <p className="text-[12.5px] text-mute">{t("dash.boxD")}</p>
              </div>
            </div>
            <Link to="/dashboard/box" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold text-forest-800 hover:underline">
              {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </motion.div>

        {/* Notifications preview */}
        <motion.div {...stagger(6)}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">
                <Bell className="h-3.5 w-3.5" /> {t("dash.notifT")}
              </p>
              {app.unreadCount > 0 && <Badge tone="clay">{app.unreadCount} {t("notif.unread")}</Badge>}
            </div>
            <div className="mt-4 space-y-3">
              {notifs.length === 0 && <p className="text-[13px] text-mute">{t("notif.emptyD")}</p>}
              {notifs.map((n) => (
                <Link key={n.id} to="/dashboard/notifications" className="block rounded-xl border border-sand-deep/60 bg-white/60 p-3 transition-colors hover:border-sage-400">
                  <p className="flex items-center gap-2 text-[13px] font-bold text-forest-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-clay-600" /> {L(n.title)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[12px] text-mute">{L(n.body)}</p>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Promo */}
        <motion.div {...stagger(7)} className="lg:col-span-3">
          <div className="flex flex-col items-start justify-between gap-5 rounded-[1.4rem] bg-forest-900 p-7 text-cream shadow-lift sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-forest-950">
                <Gift className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[20px] font-semibold">{t("dash.promoT")}</p>
                <p className="mt-1 max-w-md text-[13px] text-cream/65">{t("dash.promoD")}</p>
              </div>
            </div>
            <button type="button" onClick={copyCode} className="group flex items-center gap-3 rounded-2xl border border-cream/20 bg-forest-950/50 px-5 py-3 transition-all duration-200 hover:border-gold-300/60">
              <span className="font-display text-[17px] font-semibold tracking-wide text-gold-300">{PROMO_CODE}</span>
              <span className="rounded-full bg-cream px-3 py-1 text-[11.5px] font-bold text-forest-900 transition-transform duration-200 group-hover:scale-105">
                {t("dash.copy")}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { mealById } from "../../mock/meals";
function mealName(id: string): string {
  return mealById(id)?.name.fr ?? "";
}
