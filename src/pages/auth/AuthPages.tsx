import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, MailCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Button, Card, Container, Field, Input, SuccessCheck } from "../../components/ui";
import { Logo } from "../../components/layout/Header";
import { wait } from "../../lib/utils";

function AuthShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <Container className="flex min-h-[78vh] items-center justify-center py-14">
      <div className={wide ? "w-full max-w-lg" : "w-full max-w-md"}>
        <div className="mb-7 flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </Container>
  );
}

export function LoginPage() {
  const { t } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    email: z.string().email(t("v.email")),
    password: z.string().min(1, t("v.required")),
  });
  type FormData = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    setLoading(true);
    await wait(900);
    app.login(d.email);
    app.toast(t("auth.loginOk"));
    navigate("/dashboard");
  };

  return (
    <AuthShell>
      <Card className="p-7 sm:p-9">
        <h1 className="font-display text-center text-[26px] font-semibold text-forest-950">{t("auth.welcome")}</h1>
        <p className="mt-1.5 text-center text-[13.5px] text-mute">{t("auth.loginSub")}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
          <Field label={t("auth.email")} error={errors.email?.message} htmlFor="l-email">
            <Input id="l-email" type="email" autoComplete="email" invalid={Boolean(errors.email)} placeholder="vous@exemple.mu" {...register("email")} />
          </Field>
          <Field label={t("auth.password")} error={errors.password?.message} htmlFor="l-pass">
            <div>
              <Input id="l-pass" type="password" autoComplete="current-password" invalid={Boolean(errors.password)} placeholder="••••••••" {...register("password")} />
              <Link to="/mot-de-passe-oublie" className="mt-1.5 inline-block text-[12.5px] font-semibold text-forest-700 hover:underline">
                {t("auth.forgot")}
              </Link>
            </div>
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-[12px] font-semibold tracking-wide text-mute">
          <span className="h-px flex-1 bg-sand-deep" /> {t("auth.or")} <span className="h-px flex-1 bg-sand-deep" />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Button variant="outline" onClick={() => app.toast(t("toasts.demo"), "info")}>
            <GoogleGlyph /> {t("auth.google")}
          </Button>
          <Button variant="outline" onClick={() => app.toast(t("toasts.demo"), "info")}>
            <AppleGlyph /> {t("auth.apple")}
          </Button>
        </div>
        <p className="mt-6 text-center text-[13.5px] text-mute">
          {t("auth.noAccount")}{" "}
          <Link to="/inscription" className="font-bold text-forest-800 hover:underline">
            {t("auth.createAccount")}
          </Link>
        </p>
        <p className="mt-3 rounded-xl bg-sage-100 px-3.5 py-2.5 text-center text-[12px] font-medium text-sage-700">{t("auth.demoNote")}</p>
      </Card>
    </AuthShell>
  );
}

export function ForgotPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const schema = z.object({ email: z.string().email(t("v.email")) });
  type FormData = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    setLoading(true);
    await wait(1000);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell>
      <Card className="p-7 sm:p-9">
        {sent ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
              <MailCheck className="h-6 w-6" />
            </span>
            <h1 className="font-display mt-4 text-[22px] font-semibold text-forest-950">{t("auth.sentT")}</h1>
            <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-mute">{t("auth.sentD")}</p>
            <Link to="/connexion" className="mt-6 text-[13.5px] font-bold text-forest-800 hover:underline">
              {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-center text-[24px] font-semibold text-forest-950">{t("auth.forgotT")}</h1>
            <p className="mt-1.5 text-center text-[13.5px] text-mute">{t("auth.forgotSub")}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
              <Field label={t("auth.email")} error={errors.email?.message} htmlFor="f-email">
                <Input id="f-email" type="email" invalid={Boolean(errors.email)} placeholder="vous@exemple.mu" {...register("email")} />
              </Field>
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {loading ? t("auth.sending") : t("auth.sendLink")}
              </Button>
            </form>
            <p className="mt-6 text-center">
              <Link to="/connexion" className="text-[13.5px] font-bold text-forest-800 hover:underline">
                {t("auth.backToLogin")}
              </Link>
            </p>
          </>
        )}
      </Card>
    </AuthShell>
  );
}

export function ResetPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const schema = z
    .object({
      password: z.string().min(8, t("v.min8")),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { path: ["confirm"], message: t("v.match") });
  type FormData = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    setLoading(true);
    await wait(1000);
    setLoading(false);
    setDone(true);
  };

  return (
    <AuthShell>
      <Card className="p-7 sm:p-9">
        {done ? (
          <div className="flex flex-col items-center py-4 text-center">
            <SuccessCheck big />
            <h1 className="font-display mt-4 text-[22px] font-semibold text-forest-950">{t("auth.resetOkT")}</h1>
            <p className="mt-2 max-w-xs text-[13.5px] text-mute">{t("auth.resetOkD")}</p>
            <Link to="/connexion" className="mt-6 inline-flex items-center gap-2 text-[13.5px] font-bold text-forest-800 hover:underline">
              <KeyRound className="h-4 w-4" /> {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-center text-[24px] font-semibold text-forest-950">{t("auth.resetT")}</h1>
            <p className="mt-1.5 text-center text-[13.5px] text-mute">{t("auth.resetSub")}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
              <Field label={t("auth.newPass")} error={errors.password?.message} htmlFor="r-pass">
                <Input id="r-pass" type="password" invalid={Boolean(errors.password)} placeholder="••••••••" {...register("password")} />
              </Field>
              <Field label={t("auth.confirmPass")} error={errors.confirm?.message} htmlFor="r-confirm">
                <Input id="r-confirm" type="password" invalid={Boolean(errors.confirm)} placeholder="••••••••" {...register("confirm")} />
              </Field>
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {t("auth.resetBtn")}
              </Button>
            </form>
          </>
        )}
      </Card>
    </AuthShell>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5L1.3 17.4C3.3 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.1 14.4c-.3-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.3 6.6C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.8-3z" />
      <path fill="#EA4335" d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.3-3.2C18 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l3.8 3c1-2.9 3.7-4.9 6.9-4.9z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.7-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.2 1.9-1 3 1 .1 2-.5 2.7-1.4z" />
    </svg>
  );
}
