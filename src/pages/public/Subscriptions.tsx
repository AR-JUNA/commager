import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { ButtonLink, Container, Reveal, SectionHeading } from "../../components/ui";
import { PlanCard, PlanComparison } from "../../components/product";
import { PLANS } from "../../mock/plans";

export default function Subscriptions() {
  const { t } = useI18n();
  const app = useApp();
  const navigate = useNavigate();

  const choose = (id: (typeof PLANS)[number]["id"]) => {
    app.setPendingPlan(id);
    if (!app.user) {
      navigate("/inscription");
    } else if (app.subscription && app.subscription.status === "active") {
      navigate("/dashboard/abonnement");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      <section className="pt-14 pb-10 sm:pt-20">
        <Container>
          <SectionHeading kicker={t("planssec.kicker")} title={t("planssec.title")} sub={t("planssec.sub")} />
          <div className="grid gap-6 pt-4 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} className="h-full">
                <PlanCard plan={p} current={app.subscription?.planId === p.id && app.subscription.status === "active"} onSelect={() => choose(p.id)} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mx-auto mt-12 flex max-w-2xl items-start gap-4 rounded-2xl border border-gold-300/60 bg-gold-100/50 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-forest-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-[18px] font-semibold text-forest-950">{t("planssec.creditRuleT")}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{t("planssec.creditRuleD")}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-10">
        <Container>
          <Reveal>
            <PlanComparison />
          </Reveal>
        </Container>
      </section>

      <section className="pb-4">
        <Container className="text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium text-forest-950">
              {t("finalsec.t1")} <span className="text-forest-700 italic">{t("finalsec.t2")}</span>
            </h2>
            <div className="mt-7">
              <ButtonLink to={app.user ? "/dashboard" : "/inscription"} size="lg" arrow>
                {t("finalsec.cta")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
