import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, LocateFixed, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Badge, Button, Card, Container, Field, Input, Progress, Select, Textarea, useRM } from "../../components/ui";
import { Logo } from "../../components/layout/Header";
import { CITIES, PLANS } from "../../mock/plans";
import { formatRs, uid, wait } from "../../lib/utils";
import { cn } from "../../lib/utils";
import type { AllergyKey, Customer, FoodPreference, PlanId } from "../../types";

type RegData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  instructions: string;
  preference: string;
  otherPreference: string;
  allergies: string[];
  plan: string;
};

const STEPS = 5;

export default function Register() {
  const { t, L } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const rm = useRM();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [gps, setGps] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const schema = z
    .object({
      firstName: z.string().min(2, t("v.min2")),
      lastName: z.string().min(2, t("v.min2")),
      email: z.string().email(t("v.email")),
      phone: z
        .string()
        .transform((s) => s.replace(/[\s-]/g, ""))
        .pipe(z.string().regex(/^(\+?230)?[2-9]\d{6}$/, t("v.phone"))),
      password: z.string().min(8, t("v.min8")),
      address: z.string().min(2, t("v.required")),
      city: z.string().min(1, t("v.required")),
      instructions: z.string(),
      preference: z.string().min(1, t("v.required")),
      otherPreference: z.string(),
      allergies: z.array(z.string()),
      plan: z.string().min(1, t("v.required")),
    })
    .superRefine((d, ctx) => {
      if (d.preference === "other" && d.otherPreference.trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["otherPreference"], message: t("v.required") });
      }
    });

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<RegData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", address: "", city: "", instructions: "", preference: "", otherPreference: "", allergies: [], plan: "standard" },
  });

  const preference = watch("preference");
  const allergies = watch("allergies");
  const plan = watch("plan");

  const stepFields: Array<Array<keyof RegData>> = [
    ["firstName", "lastName", "email", "phone", "password"],
    ["address", "city"],
    ["preference"],
    ["allergies"],
    ["plan"],
  ];

  const next = async () => {
    const ok = await trigger(stepFields[step]);
    if (ok) {
      setDir(1);
      setStep((s) => Math.min(STEPS - 1, s + 1));
    }
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const locate = async () => {
    setGpsLoading(true);
    await wait(1100);
    setGps("-20.2466, 57.4864");
    setGpsLoading(false);
    app.toast(t("reg.gpsOk"));
  };

  const toggleAllergy = (a: AllergyKey) => {
    const current = allergies ?? [];
    if (a === "none") {
      setValue("allergies", current.includes("none") ? [] : ["none"], { shouldValidate: false });
      return;
    }
    const without = current.filter((x) => x !== "none");
    setValue("allergies", without.includes(a) ? without.filter((x) => x !== a) : [...without, a], { shouldValidate: false });
  };

  const onSubmit = async (d: RegData) => {
    setSubmitting(true);
    await wait(1400);
    const customer: Customer = {
      id: `CUS-${uid("x").slice(2, 7).toUpperCase()}`,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      address: d.address + (gps ? ` (GPS ${gps})` : ""),
      city: d.city,
      deliveryInstructions: d.instructions,
      preferences: d.preference as FoodPreference,
      otherPreference: d.otherPreference || undefined,
      allergies: (d.allergies.length ? d.allergies : ["none"]) as AllergyKey[],
    };
    app.register(customer, d.plan as PlanId);
    app.toast(t("reg.success"));
    navigate("/checkout");
  };

  const stepLabels = [t("reg.s1"), t("reg.s2"), t("reg.s3"), t("reg.s4"), t("reg.s5")];
  const allergyOpts: AllergyKey[] = ["none", "gluten", "dairy", "nuts", "shellfish", "eggs", "soy"];
  const prefOpts: Array<{ id: FoodPreference; label: string }> = [
    { id: "everything", label: t("reg.prefEverything") },
    { id: "vegetarian", label: t("reg.prefVeg") },
    { id: "no_pork", label: t("reg.prefNoPork") },
    { id: "other", label: t("reg.prefOther") },
  ];
  const selectedPlan = PLANS.find((p) => p.id === plan);

  return (
    <Container className="flex min-h-[80vh] items-start justify-center py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card className="overflow-hidden">
          {/* Progress */}
          <div className="border-b border-sand-deep/50 bg-cream/70 px-7 pt-6 pb-5">
            <div className="flex items-baseline justify-between">
              <h1 className="font-display text-[22px] font-semibold text-forest-950">{t("reg.title")}</h1>
              <p className="text-[12px] font-bold tracking-wide text-sage-600 uppercase">{t("reg.step", { n: step + 1, total: STEPS })}</p>
            </div>
            <p className="mt-1 text-[13px] text-mute">{t("reg.sub")}</p>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={step + 1} max={STEPS} className="h-1.5 flex-1" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stepLabels.map((l, i) => (
                <span key={l} className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", i === step ? "bg-forest-800 text-cream" : i < step ? "bg-forest-100 text-forest-800" : "bg-sand text-mute")}>
                  {i + 1}. {l}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-7" noValidate>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={rm ? { opacity: 0 } : { opacity: 0, x: dir * 44 }} animate={{ opacity: 1, x: 0 }} exit={rm ? { opacity: 0 } : { opacity: 0, x: dir * -30 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label={t("reg.fn")} error={errors.firstName?.message} htmlFor="r-fn">
                        <Input id="r-fn" invalid={Boolean(errors.firstName)} placeholder="Aisha" {...register("firstName")} />
                      </Field>
                      <Field label={t("reg.ln")} error={errors.lastName?.message} htmlFor="r-ln">
                        <Input id="r-ln" invalid={Boolean(errors.lastName)} placeholder="Ramdin" {...register("lastName")} />
                      </Field>
                    </div>
                    <Field label={t("auth.email")} error={errors.email?.message} htmlFor="r-email">
                      <Input id="r-email" type="email" invalid={Boolean(errors.email)} placeholder="vous@exemple.mu" {...register("email")} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label={t("reg.phone")} error={errors.phone?.message} htmlFor="r-phone">
                        <Input id="r-phone" invalid={Boolean(errors.phone)} placeholder="+230 5765 4321" {...register("phone")} />
                      </Field>
                      <Field label={t("auth.password")} error={errors.password?.message} htmlFor="r-pass">
                        <Input id="r-pass" type="password" invalid={Boolean(errors.password)} placeholder="••••••••" {...register("password")} />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <Field label={t("reg.address")} error={errors.address?.message} htmlFor="r-addr">
                      <Textarea id="r-addr" className="min-h-[84px]" invalid={Boolean(errors.address)} placeholder="12 Rue des Lilas, Résidence Les Palmiers" {...register("address")} />
                    </Field>
                    <Field label={t("reg.city")} error={errors.city?.message} htmlFor="r-city">
                      <Select id="r-city" invalid={Boolean(errors.city)} defaultValue="" {...register("city")}>
                        <option value="" disabled>
                          {t("reg.cityPh")}
                        </option>
                        {CITIES.map((c) => (
                          <option key={c.fr} value={L(c)}>
                            {L(c)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={`${t("reg.instructions")} (${t("common.optional")})`} htmlFor="r-instr">
                      <Input id="r-instr" placeholder={t("reg.instrPh")} {...register("instructions")} />
                    </Field>
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-sand-deep/60 bg-cream/70 p-4">
                      <Button type="button" variant="outline" size="sm" loading={gpsLoading} onClick={locate}>
                        <LocateFixed className="h-4 w-4" />
                        {gpsLoading ? t("reg.gpsLoading") : t("reg.gps")}
                      </Button>
                      {gps && <Badge tone="forest">GPS · {gps}</Badge>}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="font-display text-[17px] font-semibold text-forest-950">{t("reg.prefT")}</p>
                    <p className="mt-1 text-[13px] text-mute">{t("reg.prefD")}</p>
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2" role="radiogroup">
                      {prefOpts.map((p) => (
                        <button key={p.id} type="button" role="radio" aria-checked={preference === p.id} onClick={() => setValue("preference", p.id, { shouldValidate: true })}
                          className={cn("rounded-2xl border px-4 py-3.5 text-left text-[14px] font-semibold transition-all duration-200", preference === p.id ? "border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700/20" : "border-sand-deep/60 bg-white/60 text-ink-soft hover:border-sage-400")}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {errors.preference && <p className="mt-2 text-[12.5px] font-medium text-clay-600">{errors.preference.message}</p>}
                    {preference === "other" && (
                      <div className="mt-4">
                        <Field label={t("reg.prefOther")} error={errors.otherPreference?.message} htmlFor="r-other">
                          <Textarea id="r-other" className="min-h-[70px]" invalid={Boolean(errors.otherPreference)} placeholder={t("reg.otherPh")} {...register("otherPreference")} />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <p className="font-display text-[17px] font-semibold text-forest-950">{t("reg.allergT")}</p>
                    <div className="mt-2 flex items-start gap-2.5 rounded-xl bg-amberish-100/70 px-4 py-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amberish-600" />
                      <p className="text-[12.5px] font-medium text-amberish-600">{t("reg.allergD")}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {allergyOpts.map((a) => {
                        const active = (allergies ?? []).includes(a);
                        return (
                          <button key={a} type="button" aria-pressed={active} onClick={() => toggleAllergy(a)}
                            className={cn("rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-all duration-200", active ? "border-clay-600 bg-clay-100 text-clay-700" : "border-sand-deep/70 bg-white/60 text-ink-soft hover:border-sage-400")}>
                            {t(`allergen.${a}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <p className="font-display text-[17px] font-semibold text-forest-950">{t("reg.planT")}</p>
                    <p className="mt-1 text-[13px] text-mute">{t("reg.planD")}</p>
                    <div className="mt-4 grid gap-2.5" role="radiogroup">
                      {PLANS.map((p) => (
                        <button key={p.id} type="button" role="radio" aria-checked={plan === p.id} onClick={() => setValue("plan", p.id, { shouldValidate: true })}
                          className={cn("flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200", plan === p.id ? "border-forest-700 bg-forest-50 ring-2 ring-forest-700/20" : "border-sand-deep/60 bg-white/60 hover:border-sage-400")}>
                          <span>
                            <span className="flex items-center gap-2">
                              <span className="font-display text-[16px] font-semibold text-forest-950 uppercase">{p.id}</span>
                              {p.recommended && <Badge tone="gold">{t("planssec.popular")}</Badge>}
                            </span>
                            <span className="mt-0.5 block text-[12.5px] font-medium text-mute">
                              {t("plans.feat.meals", { n: p.mealsPerWeek })} · {t("plans.feat.credits", { n: p.credits })}
                            </span>
                          </span>
                          <span className="text-right">
                            <span className="font-display block text-[19px] font-semibold text-forest-900">{formatRs(p.priceWeekly)}</span>
                            <span className="text-[11.5px] font-medium text-mute">{t("common.perWeek")}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    {selectedPlan && (
                      <div className="mt-4 rounded-2xl bg-sage-100/80 px-5 py-4">
                        <p className="text-[12px] font-bold tracking-[0.14em] text-sage-700 uppercase">{t("reg.recap")}</p>
                        <p className="mt-1 text-[14px] font-semibold text-forest-950">
                          {selectedPlan.id.toUpperCase()} — {formatRs(selectedPlan.priceWeekly)} {t("checkout.perWeek")} · {selectedPlan.credits} {t("common.credits")} / {t("common.week")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={back}>
                  <ArrowLeft className="h-4 w-4" /> {t("common.prev")}
                </Button>
              ) : (
                <Link to="/connexion" className="text-[13.5px] font-bold text-forest-800 hover:underline">
                  {t("auth.haveAccount")}
                </Link>
              )}
              {step < STEPS - 1 ? (
                <Button type="button" onClick={next}>
                  {t("common.next")} <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" loading={submitting}>
                  {submitting ? t("reg.creating") : t("reg.submit")}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
