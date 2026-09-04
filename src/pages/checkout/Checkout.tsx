import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CreditCard, LockKeyhole, Package, Truck } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Badge, Button, Card, Container, Field, Input, LanguageSwitcher, SuccessCheck } from "../../components/ui";
import { CheckoutSteps, CheckoutSummary } from "../../components/product";
import { Logo } from "../../components/layout/Header";
import { PLANS } from "../../mock/plans";
import { formatRs, nextDeliveryDate, nextRenewalDate, wait } from "../../lib/utils";
import { cn } from "../../lib/utils";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-sand-deep/50 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-8">
          <Logo />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}

/* ================= /checkout ================= */

export function CheckoutPage() {
  const { t, L } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const [address, setAddress] = useState(app.user?.address ?? "");
  const [instructions, setInstructions] = useState(app.user?.deliveryInstructions ?? "");
  const [addressError, setAddressError] = useState("");

  if (!app.user || !app.subscription) return <Navigate to="/inscription" replace />;

  const cities = ["Quatre-Bornes", "Port-Louis", "Rose-Hill", "Vacoas-Phoenix", "Curepipe", "Ébène", "Moka", "Flic-en-Flac", "Grand-Baie"];

  const proceed = () => {
    if (address.trim().length < 4) {
      setAddressError(t("v.required"));
      return;
    }
    if (app.user) app.updateUser({ address, deliveryInstructions: instructions });
    navigate("/checkout/paiement");
  };

  return (
    <Shell>
      <CheckoutSteps current={0} />
      <h1 className="font-display mt-7 text-[clamp(1.6rem,3.4vw,2.3rem)] font-semibold text-forest-950">{t("checkout.title")}</h1>
      <p className="mt-1.5 text-[14px] text-mute">{t("checkout.sub")}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          {/* Plan */}
          <Card className="p-6">
            <p className="text-[12px] font-bold tracking-[0.18em] text-sage-600 uppercase">{t("checkout.s1")}</p>
            <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={t("checkout.plan")}>
              {PLANS.map((p) => {
                const active = app.pendingPlanId === p.id;
                return (
                  <button key={p.id} type="button" role="radio" aria-checked={active} onClick={() => app.setPendingPlan(p.id)}
                    className={cn("flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200", active ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700/20" : "border-sand-deep/60 bg-white/60 hover:border-sage-400")}>
                    <span>
                      <span className="flex items-center gap-2">
                        <span className="font-display text-[15.5px] font-semibold text-forest-950 uppercase">{p.id}</span>
                        {p.recommended && <Badge tone="gold">{t("planssec.popular")}</Badge>}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] font-medium text-mute">
                        {t("plans.feat.meals", { n: p.mealsPerWeek })} · {t("plans.feat.credits", { n: p.credits })}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="font-display block text-[18px] font-semibold text-forest-900">{formatRs(p.priceWeekly)}</span>
                      <span className="text-[11.5px] font-medium text-mute">{t("checkout.perWeek")}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Delivery */}
          <Card className="p-6">
            <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] text-sage-600 uppercase">
              <Truck className="h-4 w-4" /> {t("checkout.s2")}
            </p>
            <p className="mt-2.5 text-[13px] text-mute">{t("checkout.deliveryD")}</p>
            <div className="mt-5 space-y-4">
              <Field label={t("checkout.address")} error={addressError} htmlFor="ck-addr">
                <Input id="ck-addr" value={address} invalid={Boolean(addressError)} onChange={(e) => { setAddress(e.target.value); setAddressError(""); }} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("checkout.city")} htmlFor="ck-city">
                  <Input id="ck-city" defaultValue={app.user.city} />
                </Field>
                <Field label={`${t("checkout.instructions")} (${t("common.optional")})`} htmlFor="ck-instr">
                  <Input id="ck-instr" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={t("reg.instrPh")} />
                </Field>
              </div>
              <div className="rounded-2xl border border-sand-deep/60 bg-cream/70 p-4">
                <p className="flex items-center gap-2 text-[13px] font-bold text-forest-950">
                  <Package className="h-4 w-4 text-sage-600" /> {t("checkout.boxT")}
                </p>
                <p className="mt-1 text-[12.5px] text-mute">{t("checkout.boxD")}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup">
                  <button type="button" role="radio" aria-checked={app.boxMethod === "box"} onClick={() => app.setBoxMethod("box")}
                    className={cn("rounded-xl border px-4 py-3 text-left text-[13px] font-semibold transition-all", app.boxMethod === "box" ? "border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700/15" : "border-sand-deep/70 bg-white/60 text-ink-soft hover:border-sage-400")}>
                    {t("checkout.boxYes")}
                    <span className="mt-0.5 block text-[11.5px] font-medium text-mute">{t("checkout.included")}</span>
                  </button>
                  <button type="button" role="radio" aria-checked={app.boxMethod === "present"} onClick={() => app.setBoxMethod("present")}
                    className={cn("rounded-xl border px-4 py-3 text-left text-[13px] font-semibold transition-all", app.boxMethod === "present" ? "border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700/15" : "border-sand-deep/70 bg-white/60 text-ink-soft hover:border-sage-400")}>
                    {t("checkout.boxNo")}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Link to={app.subscription.status === "pending_payment" ? "/dashboard" : "/abonnements"} className="inline-flex items-center gap-2 text-[13.5px] font-bold text-forest-800 hover:underline">
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Link>
            <Button size="lg" onClick={proceed}>
              {t("checkout.toPayment")}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <CheckoutSummary planId={app.pendingPlanId} box={app.boxMethod === "box"} />
        </div>
      </div>
    </Shell>
  );
}

/* ================= /checkout/paiement ================= */

type PayData = { card: string; exp: string; cvc: string; holder: string };

export function PaymentPage() {
  const { t } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const plan = PLANS.find((p) => p.id === app.pendingPlanId) ?? PLANS[1];

  const schema = z.object({
    card: z
      .string()
      .transform((s) => s.replace(/\D/g, ""))
      .pipe(z.string().length(16, t("checkout.vCard"))),
    exp: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, t("checkout.vExp")),
    cvc: z.string().regex(/^\d{3}$/, t("checkout.vCvc")),
    holder: z.string().min(2, t("v.required")),
  });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PayData>({ resolver: zodResolver(schema), defaultValues: { card: "", exp: "", cvc: "", holder: app.user?.firstName ? `${app.user.firstName} ${app.user.lastName}` : "" } });

  if (!app.user || !app.subscription) return <Navigate to="/inscription" replace />;

  const onCard = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setValue("card", digits.replace(/(\d{4})(?=\d)/g, "$1 "), { shouldValidate: true });
  };
  const onExp = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setValue("exp", digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits, { shouldValidate: true });
  };

  const pay = async (d: PayData) => {
    setProcessing(true);
    await wait(1900);
    const digits = d.card.replace(/\D/g, "");
    if (digits.startsWith("4")) {
      app.confirmSubscription();
      app.changePlan(app.pendingPlanId);
      navigate("/checkout/succes");
    } else {
      navigate("/checkout/echec?reason=declined");
    }
  };

  return (
    <Shell>
      <CheckoutSteps current={2} />
      <h1 className="font-display mt-7 text-[clamp(1.6rem,3.4vw,2.3rem)] font-semibold text-forest-950">{t("checkout.payT")}</h1>
      <p className="mt-1.5 text-[14px] text-mute">{t("checkout.payD")}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="h-fit p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[13px] font-bold text-forest-950">
              <CreditCard className="h-4.5 w-4.5 text-forest-700" style={{ width: 18, height: 18 }} /> {t("checkout.payT")}
            </p>
            <Badge tone="sage">
              <LockKeyhole className="h-3 w-3" /> {t("checkout.secure")}
            </Badge>
          </div>
          <form onSubmit={handleSubmit(pay)} className="mt-6 space-y-5" noValidate>
            <Field label={t("checkout.card")} error={errors.card?.message} htmlFor="p-card">
              <Input id="p-card" inputMode="numeric" autoComplete="cc-number" invalid={Boolean(errors.card)} placeholder="4242 4242 4242 4242" value={watch("card")} onChange={(e) => onCard(e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t("checkout.expiry")} error={errors.exp?.message} htmlFor="p-exp">
                <Input id="p-exp" inputMode="numeric" autoComplete="cc-exp" invalid={Boolean(errors.exp)} placeholder="12/27" value={watch("exp")} onChange={(e) => onExp(e.target.value)} />
              </Field>
              <Field label={t("checkout.cvc")} error={errors.cvc?.message} htmlFor="p-cvc">
                <Input id="p-cvc" inputMode="numeric" autoComplete="cc-csc" invalid={Boolean(errors.cvc)} placeholder="123" maxLength={3} {...register("cvc")} />
              </Field>
              <div className="sm:col-span-1" />
            </div>
            <Field label={t("checkout.holder")} error={errors.holder?.message} htmlFor="p-holder">
              <Input id="p-holder" autoComplete="cc-name" invalid={Boolean(errors.holder)} placeholder="AISHA RAMDIN" {...register("holder")} />
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={processing}>
              {processing ? t("checkout.processing") : t("checkout.pay", { amount: formatRs(plan.priceWeekly) })}
            </Button>
            <button type="button" onClick={() => navigate("/checkout/echec?reason=cancelled")} className="w-full text-center text-[13px] font-semibold text-mute transition-colors hover:text-clay-600">
              {t("checkout.cancelPay")}
            </button>
          </form>
          <p className="mt-5 rounded-xl bg-gold-100/70 px-4 py-3 text-[12.5px] font-medium text-gold-600">{t("checkout.hint")}</p>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <CheckoutSummary planId={app.pendingPlanId} box={app.boxMethod === "box"} />
          <Link to="/checkout" className="inline-flex items-center gap-2 text-[13.5px] font-bold text-forest-800 hover:underline">
            <ArrowLeft className="h-4 w-4" /> {t("common.back")}
          </Link>
        </div>
      </div>
    </Shell>
  );
}

/* ================= /checkout/succes ================= */

export function SuccessPage() {
  const { t, date, locale } = useI18n();
  const app = useApp();
  const plan = app.subscription ? PLANS.find((p) => p.id === app.subscription?.planId) ?? PLANS[1] : PLANS[1];

  return (
    <Shell>
      <div className="mx-auto max-w-[620px] text-center">
        <CheckoutSteps current={3} />
        <div className="mt-10 flex justify-center">
          <SuccessCheck big />
        </div>
        <p className="mt-6 text-[12.5px] font-bold tracking-[0.18em] text-sage-600 uppercase">{t("payOk.kicker")}</p>
        <h1 className="font-display mt-2 text-[clamp(1.8rem,4vw,2.7rem)] leading-tight font-semibold text-forest-950">{t("payOk.t")}</h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-mute">{t("payOk.d")}</p>

        <Card className="mt-8 p-6 text-left">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11.5px] font-bold tracking-[0.12em] text-mute uppercase">{t("payOk.planL")}</dt>
              <dd className="font-display mt-1 text-[22px] font-semibold text-forest-900 uppercase">{plan.id}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-bold tracking-[0.12em] text-mute uppercase">{t("payOk.mealsL")}</dt>
              <dd className="font-display mt-1 text-[22px] font-semibold text-forest-900">{plan.mealsPerWeek}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-bold tracking-[0.12em] text-mute uppercase">{t("payOk.renewalL")}</dt>
              <dd className="mt-1 text-[14px] font-semibold text-ink">{date(nextRenewalDate())}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-bold tracking-[0.12em] text-mute uppercase">{t("payOk.firstL")}</dt>
              <dd className="mt-1 text-[14px] font-semibold text-ink">
                {date(nextDeliveryDate())} · {locale === "fr" ? "11h00 – 13h00" : "11:00 AM – 1:00 PM"}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Button size="lg" onClick={() => (window.location.hash = "#/dashboard/semaine")}>
            {t("payOk.chooseMeals")}
          </Button>
          <Button variant="outline" size="lg" onClick={() => (window.location.hash = "#/dashboard")}>
            {t("payOk.goDash")}
          </Button>
        </div>
      </div>
    </Shell>
  );
}

/* ================= /checkout/echec ================= */

export function FailPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const cancelled = params.get("reason") === "cancelled";

  return (
    <Shell>
      <div className="mx-auto max-w-[560px] py-6 text-center">
        <CheckoutSteps current={2} />
        <div className="mt-10 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-clay-100 text-clay-600">
            <CreditCard className="h-7 w-7" />
          </span>
        </div>
        <h1 className="font-display mt-6 text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight font-semibold text-forest-950">
          {cancelled ? t("payFail.cancelled") : t("payFail.t")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-mute">{cancelled ? t("payFail.cancelledD") : t("payFail.d")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          {!cancelled && (
            <Button size="lg" onClick={() => (window.location.hash = "#/checkout/paiement")}>
              {t("payFail.retry")}
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={() => (window.location.hash = "#/")}>
            {t("payFail.home")}
          </Button>
          {cancelled && (
            <Button size="lg" onClick={() => (window.location.hash = "#/checkout/paiement")}>
              {t("payFail.retry")}
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
