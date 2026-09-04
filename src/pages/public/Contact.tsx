import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import { useI18n } from "../../i18n";
import { Button, Card, Container, Field, Input, SectionHeading, Select, SuccessCheck, Textarea } from "../../components/ui";
import { wait } from "../../lib/utils";

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export default function Contact() {
  const { t, raw } = useI18n();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const schema = z.object({
    name: z.string().min(2, t("v.min2")),
    email: z.string().email(t("v.email")),
    phone: z.string(),
    subject: z.string().min(1, t("v.required")),
    message: z.string().min(10, t("v.min10")),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const subjects = (raw("contact.subjects") as string[]) ?? [];

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    await wait(1300);
    // Simulated transport: fail roughly 1 in 6 times to demonstrate the error state.
    if (Math.random() < 0.16) {
      setStatus("error");
      return;
    }
    void data;
    setStatus("success");
    reset();
  };

  const info = [
    { icon: Mail, label: t("contact.emailL"), value: "bonjour@commanger.com" },
    { icon: Phone, label: t("contact.phoneL"), value: "+230 5 700 20 30" },
    { icon: Clock3, label: t("contact.hoursL"), value: t("contact.hours") },
    { icon: MapPin, label: t("contact.addressL"), value: "Royal Road, Floréal, Maurice" },
  ];

  return (
    <section className="pt-14 pb-10 sm:pt-20">
      <Container>
        <SectionHeading kicker={t("contact.kicker")} title={t("contact.title")} sub={t("contact.sub")} />
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <Card className="p-6">
              <p className="font-display text-[18px] font-semibold text-forest-950">{t("contact.infoT")}</p>
              <ul className="mt-5 space-y-4">
                {info.map((i) => (
                  <li key={i.label} className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                      <i.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                    </span>
                    <span>
                      <span className="block text-[11.5px] font-bold tracking-[0.12em] text-mute uppercase">{i.label}</span>
                      <span className="text-[14px] font-semibold text-ink">{i.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-6 sm:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center py-10 text-center">
                <SuccessCheck big />
                <h2 className="font-display mt-5 text-[22px] font-semibold text-forest-950">{t("contact.okT")}</h2>
                <p className="mt-2 max-w-sm text-[14px] text-mute">{t("contact.okD")}</p>
                <Button variant="outline" className="mt-6" onClick={() => setStatus("idle")}>
                  {t("contact.again")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {status === "error" && (
                  <div className="flex items-start gap-3 rounded-xl border border-clay-600/30 bg-clay-100/70 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-clay-600" style={{ width: 18, height: 18 }} />
                    <div>
                      <p className="text-[13.5px] font-bold text-clay-700">{t("contact.errT")}</p>
                      <p className="text-[12.5px] text-clay-700/80">{t("contact.errD")}</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("contact.name")} error={errors.name?.message} htmlFor="c-name">
                    <Input id="c-name" invalid={Boolean(errors.name)} placeholder="Aisha Ramdin" {...register("name")} />
                  </Field>
                  <Field label={t("auth.email")} error={errors.email?.message} htmlFor="c-email">
                    <Input id="c-email" type="email" invalid={Boolean(errors.email)} placeholder="vous@exemple.mu" {...register("email")} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={`${t("reg.phone")} (${t("common.optional")})`} error={errors.phone?.message} htmlFor="c-phone">
                    <Input id="c-phone" placeholder="5XXX XXXX" {...register("phone")} />
                  </Field>
                  <Field label={t("contact.subject")} error={errors.subject?.message} htmlFor="c-subject">
                    <Select id="c-subject" invalid={Boolean(errors.subject)} defaultValue="" {...register("subject")}>
                      <option value="" disabled>
                        {t("contact.subjectPh")}
                      </option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label={t("contact.message")} error={errors.message?.message} htmlFor="c-msg">
                  <Textarea id="c-msg" invalid={Boolean(errors.message)} placeholder={t("contact.messagePh")} rows={5} {...register("message")} />
                </Field>
                <Button type="submit" size="lg" loading={status === "loading"} className="w-full sm:w-auto">
                  {status === "loading" ? t("contact.sending") : (<><Send className="h-4 w-4" /> {t("contact.send")}</>)}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </Container>
    </section>
  );
}
