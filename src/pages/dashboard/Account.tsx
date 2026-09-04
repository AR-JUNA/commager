import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Laptop, LocateFixed, ShieldAlert, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Badge, Button, Card, Field, Input, Modal, Select, Switch, Textarea } from "../../components/ui";
import { CITIES } from "../../mock/plans";
import { cn, wait } from "../../lib/utils";
import type { AllergyKey, FoodPreference } from "../../types";

export default function Account() {
  const { t, L } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, delivery: true, reminders: true });
  const [gps, setGps] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  /* Personal */
  const personalSchema = z.object({
    firstName: z.string().min(2, t("v.min2")),
    lastName: z.string().min(2, t("v.min2")),
    email: z.string().email(t("v.email")),
    phone: z.string().min(7, t("v.phone")),
  });
  type Personal = z.infer<typeof personalSchema>;
  const personal = useForm<Personal>({
    resolver: zodResolver(personalSchema),
    defaultValues: { firstName: app.user?.firstName ?? "", lastName: app.user?.lastName ?? "", email: app.user?.email ?? "", phone: app.user?.phone ?? "" },
  });

  /* Delivery */
  const deliverySchema = z.object({
    address: z.string().min(4, t("v.required")),
    city: z.string().min(1, t("v.required")),
    instructions: z.string(),
  });
  type DeliveryF = z.infer<typeof deliverySchema>;
  const delivery = useForm<DeliveryF>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { address: app.user?.address ?? "", city: app.user?.city ?? "", instructions: app.user?.deliveryInstructions ?? "" },
  });

  /* Security */
  const passSchema = z
    .object({
      current: z.string().min(1, t("v.required")),
      next: z.string().min(8, t("v.min8")),
      confirm: z.string(),
    })
    .refine((d) => d.next === d.confirm, { path: ["confirm"], message: t("v.match") });
  type PassF = z.infer<typeof passSchema>;
  const passForm = useForm<PassF>({ resolver: zodResolver(passSchema), defaultValues: { current: "", next: "", confirm: "" } });

  const [allergies, setAllergies] = useState<AllergyKey[]>((app.user?.allergies ?? ["none"]) as AllergyKey[]);
  const [preference, setPreference] = useState<FoodPreference>((app.user?.preferences ?? "everything") as FoodPreference);

  const allergyOpts: AllergyKey[] = ["none", "gluten", "dairy", "nuts", "shellfish", "eggs", "soy"];

  const toggleAllergy = (a: AllergyKey) => {
    setAllergies((cur) => {
      if (a === "none") return cur.includes("none") ? [] : ["none"];
      const without = cur.filter((x) => x !== "none");
      return without.includes(a) ? without.filter((x) => x !== a) : [...without, a];
    });
  };

  const saveFood = () => {
    app.updateUser({ preferences: preference, allergies: allergies.length ? allergies : ["none"] });
    app.toast(t("account.savedToast"));
  };

  const locate = async () => {
    setGpsLoading(true);
    await wait(1000);
    setGps("-20.2466, 57.4864");
    setGpsLoading(false);
    app.toast(t("reg.gpsOk"));
  };

  const doDelete = async () => {
    setDeleting(true);
    await wait(1200);
    app.logout();
    app.toast(t("account.deletedToast"), "info");
    navigate("/");
  };

  const prefOpts: Array<{ id: FoodPreference; label: string }> = [
    { id: "everything", label: t("account.prefL.everything") },
    { id: "vegetarian", label: t("account.prefL.vegetarian") },
    { id: "no_pork", label: t("account.prefL.no_pork") },
    { id: "other", label: t("account.prefL.other") },
  ];

  const sectionTitle = "text-[12px] font-bold tracking-[0.18em] text-sage-600 uppercase";

  return (
    <div>
      <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("account.title")}</h1>
      <p className="mt-1 text-[14px] text-mute">{t("account.sub")}</p>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {/* Personal */}
        <Card className="p-6">
          <p className={sectionTitle}>{t("account.personalT")}</p>
          <form className="mt-4 space-y-4" onSubmit={personal.handleSubmit((d) => { app.updateUser(d); app.toast(t("account.savedToast")); })} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("reg.fn")} error={personal.formState.errors.firstName?.message} htmlFor="a-fn">
                <Input id="a-fn" invalid={Boolean(personal.formState.errors.firstName)} {...personal.register("firstName")} />
              </Field>
              <Field label={t("reg.ln")} error={personal.formState.errors.lastName?.message} htmlFor="a-ln">
                <Input id="a-ln" invalid={Boolean(personal.formState.errors.lastName)} {...personal.register("lastName")} />
              </Field>
            </div>
            <Field label={t("auth.email")} error={personal.formState.errors.email?.message} htmlFor="a-email">
              <Input id="a-email" type="email" invalid={Boolean(personal.formState.errors.email)} {...personal.register("email")} />
            </Field>
            <Field label={t("reg.phone")} error={personal.formState.errors.phone?.message} htmlFor="a-phone">
              <Input id="a-phone" invalid={Boolean(personal.formState.errors.phone)} {...personal.register("phone")} />
            </Field>
            <Button type="submit" size="sm">{t("common.save")}</Button>
          </form>
        </Card>

        {/* Delivery */}
        <Card className="p-6">
          <p className={sectionTitle}>{t("account.deliveryT")}</p>
          <form className="mt-4 space-y-4" onSubmit={delivery.handleSubmit((d) => { app.updateUser({ address: d.address, city: d.city, deliveryInstructions: d.instructions }); app.toast(t("account.savedToast")); })} noValidate>
            <Field label={t("reg.address")} error={delivery.formState.errors.address?.message} htmlFor="a-addr">
              <Textarea id="a-addr" className="min-h-[70px]" invalid={Boolean(delivery.formState.errors.address)} {...delivery.register("address")} />
            </Field>
            <Field label={t("reg.city")} error={delivery.formState.errors.city?.message} htmlFor="a-city">
              <Select id="a-city" invalid={Boolean(delivery.formState.errors.city)} {...delivery.register("city")}>
                {CITIES.map((c) => (
                  <option key={c.fr} value={L(c)}>{L(c)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("reg.instructions")} htmlFor="a-instr">
              <Input id="a-instr" {...delivery.register("instructions")} />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" loading={gpsLoading} onClick={locate}>
                <LocateFixed className="h-4 w-4" /> {gpsLoading ? t("reg.gpsLoading") : t("reg.gps")}
              </Button>
              {gps && <Badge tone="forest">GPS · {gps}</Badge>}
              <span className="text-[12px] font-medium text-mute">{t("account.location")}</span>
            </div>
            <Button type="submit" size="sm">{t("common.save")}</Button>
          </form>
        </Card>

        {/* Food */}
        <Card className="p-6">
          <p className={sectionTitle}>{t("account.foodT")}</p>
          <div className="mt-4 space-y-5">
            <div>
              <p className="mb-2 text-[13px] font-bold text-ink">{t("account.prefsL")}</p>
              <div className="grid grid-cols-2 gap-2">
                {prefOpts.map((p) => (
                  <button key={p.id} type="button" aria-pressed={preference === p.id} onClick={() => setPreference(p.id)}
                    className={cn("rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-semibold transition-all", preference === p.id ? "border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700/15" : "border-sand-deep/60 bg-white/60 text-ink-soft hover:border-sage-400")}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold text-ink">{t("account.allergiesL")}</p>
              <div className="flex flex-wrap gap-2">
                {allergyOpts.map((a) => {
                  const active = allergies.includes(a);
                  return (
                    <button key={a} type="button" aria-pressed={active} onClick={() => toggleAllergy(a)}
                      className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all", active ? "border-clay-600 bg-clay-100 text-clay-700" : "border-sand-deep/70 bg-white/60 text-ink-soft hover:border-sage-400")}>
                      {t(`allergen.${a}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button size="sm" onClick={saveFood}>{t("common.save")}</Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <p className={sectionTitle}>{t("account.securityT")}</p>
          <form className="mt-4 space-y-4" onSubmit={passForm.handleSubmit(() => { passForm.reset(); app.toast(t("account.passToast")); })} noValidate>
            <p className="text-[13px] font-bold text-ink">{t("account.changePass")}</p>
            <Field label={t("account.currentPass")} error={passForm.formState.errors.current?.message} htmlFor="s-cur">
              <Input id="s-cur" type="password" invalid={Boolean(passForm.formState.errors.current)} {...passForm.register("current")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("auth.newPass")} error={passForm.formState.errors.next?.message} htmlFor="s-new">
                <Input id="s-new" type="password" invalid={Boolean(passForm.formState.errors.next)} {...passForm.register("next")} />
              </Field>
              <Field label={t("auth.confirmPass")} error={passForm.formState.errors.confirm?.message} htmlFor="s-conf">
                <Input id="s-conf" type="password" invalid={Boolean(passForm.formState.errors.confirm)} {...passForm.register("confirm")} />
              </Field>
            </div>
            <Button type="submit" size="sm">{t("common.save")}</Button>
          </form>
          <div className="mt-6 border-t border-sand pt-5">
            <p className="text-[13px] font-bold text-ink">{t("account.sessions")}</p>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-sand-deep/60 bg-cream/70 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                <Laptop className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-forest-950">Chrome · Mauritius</p>
                <p className="text-[12px] text-mute">{t("account.currentSession")}</p>
              </div>
              <Badge tone="forest">{t("dash.status.active")}</Badge>
            </div>
          </div>
        </Card>

        {/* Notifications prefs */}
        <Card className="p-6">
          <p className={sectionTitle}>{t("account.notifsT")}</p>
          <div className="mt-4 space-y-4">
            {([
              ["email", t("account.emailNotifs")],
              ["delivery", t("account.deliveryNotifs")],
              ["reminders", t("account.reminders")],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <p className="text-[14px] font-semibold text-ink">{label}</p>
                <Switch checked={notifPrefs[key]} label={label} onChange={(v) => { setNotifPrefs((s) => ({ ...s, [key]: v })); app.toast(t("account.savedToast"), "info"); }} />
              </div>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="border-clay-600/25 p-6">
          <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] text-clay-600 uppercase">
            <ShieldAlert className="h-4 w-4" /> {t("account.dangerT")}
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{t("account.dangerD")}</p>
          <Button variant="danger" size="sm" className="mt-4" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> {t("account.deleteBtn")}
          </Button>
        </Card>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("account.deleteT")}>
        <p className="text-[14px] leading-relaxed text-ink-soft">{t("account.deleteD")}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t("common.cancel")}</Button>
          <Button variant="danger" loading={deleting} onClick={doDelete}>{t("account.deleteConfirm")}</Button>
        </div>
      </Modal>
    </div>
  );
}
