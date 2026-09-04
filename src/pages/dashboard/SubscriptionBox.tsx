import { useState } from "react";
import { CalendarX, Check, Pause, Repeat, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Badge, Button, Card, Modal, Progress, AnimatedNumber, Reveal } from "../../components/ui";
import { BoxVisual, PlanComparison } from "../../components/product";
import { MOCK_BOX } from "../../mock/data";
import { PLANS, planById } from "../../mock/plans";
import { formatRs } from "../../lib/utils";
import { cn } from "../../lib/utils";
import type { PlanId } from "../../types";

export function SubscriptionPage() {
  const { t, date } = useI18n();
  const app = useApp();
  const [changeOpen, setChangeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [choice, setChoice] = useState<PlanId | null>(null);

  if (!app.subscription) return null;
  const plan = planById(app.subscription.planId);
  const status = app.subscription.status;

  const applyChange = () => {
    if (!choice) return;
    app.changePlan(choice);
    app.toast(t("subm.changedToast", { plan: choice.toUpperCase() }));
    setChangeOpen(false);
    setChoice(null);
  };

  return (
    <div>
      <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("subm.title")}</h1>
      <p className="mt-1 text-[14px] text-mute">{t("subm.sub")}</p>

      <Card className="mt-6 overflow-hidden">
        <div className="relative bg-forest-900 p-7 text-cream">
          <div className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full bg-sage-400/15 blur-2xl" aria-hidden />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold tracking-[0.18em] text-sage-300 uppercase">{t("subm.currentT")}</p>
              <p className="font-display mt-2 text-[42px] leading-none font-semibold uppercase">{plan.id}</p>
              <p className="mt-2 text-[14px] text-cream/70">
                {formatRs(plan.priceWeekly)} {t("common.perWeek")} · ≈ {formatRs(Math.round(plan.priceWeekly / plan.mealsPerWeek))} / {t("common.meals").replace(/s$/, "")}
              </p>
            </div>
            <Badge tone={status === "active" ? "forest" : status === "paused" ? "amber" : "clay"} className="bg-cream/15 text-cream">
              {t(`dash.status.${status}`)}
            </Badge>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="font-semibold text-cream/55">{t("dash.mealsL")}</dt>
              <dd className="font-display mt-0.5 text-[20px] font-semibold">{plan.mealsPerWeek}</dd>
            </div>
            <div>
              <dt className="font-semibold text-cream/55">{t("dash.creditsL")}</dt>
              <dd className="font-display mt-0.5 text-[20px] font-semibold">
                <AnimatedNumber value={app.usedCredits} /> / {app.credits}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-cream/55">{t("subm.sinceL")}</dt>
              <dd className="mt-1 font-semibold">{date(app.subscription.startDate)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-cream/55">{t("subm.renewalL")}</dt>
              <dd className="mt-1 font-semibold">{date(app.subscription.nextRenewal)}</dd>
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[12.5px] font-semibold text-cream/70">{t("subm.creditsL")}</p>
            <Progress value={app.usedCredits} max={app.credits} className="bg-forest-950/60" barClass="bg-sage-300" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 p-6">
          <Button onClick={() => { setChoice(app.subscription?.planId ?? null); setChangeOpen(true); }}>
            <Repeat className="h-4 w-4" /> {t("subm.changeT")}
          </Button>
          {status === "paused" ? (
            <Button variant="outline" onClick={() => { app.resumeSubscription(); app.toast(t("subm.resumedToast")); }}>
              <Sparkles className="h-4 w-4" /> {t("subm.resume")}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { app.pauseSubscription(); app.toast(t("subm.pausedToast"), "info"); }}>
              <Pause className="h-4 w-4" /> {t("subm.pause")}
            </Button>
          )}
          <Button variant="ghost" className="text-clay-600 hover:bg-clay-100/60" onClick={() => setCancelOpen(true)}>
            <CalendarX className="h-4 w-4" /> {t("subm.cancelT")}
          </Button>
        </div>
      </Card>

      <div className="mt-10">
        <h2 className="font-display mb-5 text-[20px] font-semibold text-forest-950">{t("subm.plansT")}</h2>
        <Reveal>
          <PlanComparison />
        </Reveal>
      </div>

      {/* Change plan modal */}
      <Modal open={changeOpen} onClose={() => setChangeOpen(false)} title={t("subm.changeT")} wide>
        <p className="-mt-2 mb-4 text-[13px] text-mute">{t("subm.changeD")}</p>
        <div className="space-y-2.5" role="radiogroup">
          {PLANS.map((p) => {
            const active = choice === p.id;
            const isCurrent = app.subscription?.planId === p.id;
            return (
              <button key={p.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(p.id)}
                className={cn("flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200", active ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700/20" : "border-sand-deep/60 bg-white/60 hover:border-sage-400")}>
                <span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-[15.5px] font-semibold text-forest-950 uppercase">{p.id}</span>
                    {p.recommended && <Badge tone="gold">{t("planssec.popular")}</Badge>}
                    {isCurrent && <Badge tone="sage">{t("planssec.current")}</Badge>}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium text-mute">
                    {t("plans.feat.meals", { n: p.mealsPerWeek })} · {t("plans.feat.credits", { n: p.credits })}
                  </span>
                </span>
                <span className="text-right">
                  <span className="font-display block text-[18px] font-semibold text-forest-900">{formatRs(p.priceWeekly)}</span>
                  <span className="text-[11.5px] font-medium text-mute">{t("common.perWeek")}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="outline" onClick={() => setChangeOpen(false)}>{t("common.cancel")}</Button>
          <Button disabled={!choice || choice === app.subscription?.planId} onClick={applyChange}>{t("common.confirm")}</Button>
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={t("subm.cancelModalT")}>
        <p className="text-[14px] leading-relaxed text-ink-soft">{t("subm.cancelModalD")}</p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => { setCancelOpen(false); app.pauseSubscription(); app.toast(t("subm.pausedToast"), "info"); }}>
            <Pause className="h-4 w-4" /> {t("subm.pause")}
          </Button>
          <Button variant="danger" onClick={() => { app.cancelSubscription(); app.toast(t("subm.cancelledToast"), "info"); setCancelOpen(false); }}>
            {t("subm.cancelBtn")}
          </Button>
        </div>
        <button type="button" className="mt-3 w-full text-center text-[13px] font-bold text-forest-800 hover:underline" onClick={() => setCancelOpen(false)}>
          {t("subm.keepBtn")}
        </button>
      </Modal>
    </div>
  );
}

export function BoxPage() {
  const { t, date } = useI18n();
  const app = useApp();
  const [method, setMethod] = useState(app.boxMethod);

  const save = (m: "present" | "box") => {
    setMethod(m);
    app.setBoxMethod(m);
    app.toast(t("boxp.savedToast"));
  };

  return (
    <div>
      <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("boxp.title")}</h1>
      <p className="mt-1 text-[14px] text-mute">{t("boxp.sub")}</p>

      <div className="mt-7 grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="flex items-center justify-center bg-gradient-to-b from-forest-50 to-paper p-8">
          <BoxVisual number={app.boxNumber} />
        </Card>
        <div className="space-y-5">
          <Card className="p-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13.5px]">
              <div>
                <dt className="font-semibold text-mute">{t("boxp.number")}</dt>
                <dd className="font-display mt-0.5 text-[18px] font-semibold text-forest-900">{app.boxNumber}</dd>
              </div>
              <div>
                <dt className="font-semibold text-mute">{t("boxp.status")}</dt>
                <dd className="mt-1"><Badge tone="forest"><Check className="h-3 w-3" strokeWidth={3} /> {t("boxp.statusOk")}</Badge></dd>
              </div>
              <div>
                <dt className="font-semibold text-mute">{t("boxp.installed")}</dt>
                <dd className="mt-1 font-semibold text-ink">{date(MOCK_BOX.installedOn)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-mute">{t("deliv.address")}</dt>
                <dd className="mt-1 font-semibold text-ink">{app.user?.address}</dd>
              </div>
            </dl>
            <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">{t("boxp.bodyT")}</p>
          </Card>

          <Card className="p-6">
            <p className="font-display text-[17px] font-semibold text-forest-950">{t("boxp.methodT")}</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label={t("boxp.method")}>
              <button type="button" role="radio" aria-checked={method === "present"} onClick={() => save("present")}
                className={cn("rounded-2xl border px-4 py-4 text-left transition-all duration-200", method === "present" ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700/15" : "border-sand-deep/60 bg-white/60 hover:border-sage-400")}>
                <span className="block text-[14px] font-bold text-forest-950">{t("boxp.mPresent")}</span>
              </button>
              <button type="button" role="radio" aria-checked={method === "box"} onClick={() => save("box")}
                className={cn("rounded-2xl border px-4 py-4 text-left transition-all duration-200", method === "box" ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700/15" : "border-sand-deep/60 bg-white/60 hover:border-sage-400")}>
                <span className="block text-[14px] font-bold text-forest-950">{t("boxp.mBox")}</span>
              </button>
            </div>
            <div className="mt-5 rounded-xl border border-sand-deep/60 bg-cream/70 p-4">
              <p className="text-[12px] font-bold tracking-[0.14em] text-sage-600 uppercase">{t("boxp.instrT")}</p>
              <p className="mt-1.5 text-[13.5px] text-ink-soft">{app.user?.deliveryInstructions || "—"}</p>
            </div>
            <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-sage-100/80 px-4 py-3 text-[12.5px] font-medium text-sage-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> {t("boxp.privacy")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
