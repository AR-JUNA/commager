import { CalendarCheck, ChefHat, Sparkles, Truck, Wallet } from "lucide-react";
import { useI18n } from "../../i18n";
import { ButtonLink, Container, Reveal, SectionHeading } from "../../components/ui";
import { IMG } from "../../mock/meals";

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    { icon: Wallet, img: IMG.hero, tt: t("how.s1t"), d: t("how.s1d"), extra: t("planssec.sub") },
    { icon: CalendarCheck, img: IMG.salad, tt: t("how.s2t"), d: t("how.s2d"), extra: t("weeksec.deadline") },
    { icon: ChefHat, img: IMG.curry, tt: "howPrep.t", d: "howPrep.d", extra: "" },
    { icon: Truck, img: IMG.pasta, tt: t("how.s3t"), d: t("how.s3d"), extra: t("checkout.deliveryD") },
    { icon: Sparkles, img: IMG.chicken, tt: t("how.s4t"), d: t("how.s4d"), extra: "" },
  ];

  return (
    <>
      <section className="pt-14 pb-8 sm:pt-20">
        <Container>
          <SectionHeading kicker={t("how.kicker")} title={t("how.title")} sub={t("how.sub")} />
        </Container>
      </section>
      <section className="pb-10">
        <Container className="max-w-[980px] space-y-16 sm:space-y-24">
          {steps.map((s, i) => (
            <Reveal key={i}>
              <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="overflow-hidden rounded-[1.6rem] border-[5px] border-paper shadow-lift">
                  <img src={s.img} alt={s.tt === "howPrep.t" ? "Cuisine Commanger" : s.tt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.04]" />
                </div>
                <div>
                  <p className="font-display text-[46px] leading-none font-light text-sage-300">{String(i + 1).padStart(2, "0")}</p>
                  <div className="mt-3 inline-flex items-center gap-2.5 rounded-full bg-forest-100 px-4 py-2 text-[13px] font-bold text-forest-800">
                    <s.icon className="h-4 w-4" />
                    {s.tt === "howPrep.t" ? t("howPrep.t") : s.tt}
                  </div>
                  <h2 className="font-display mt-4 text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-semibold text-forest-950">
                    {s.tt === "howPrep.t" ? t("howPrep.t") : s.tt}
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{s.tt === "howPrep.t" ? t("howPrep.d") : s.d}</p>
                  {s.extra && <p className="mt-3 rounded-xl bg-sand/70 px-4 py-2.5 text-[12.5px] font-semibold text-ink-soft">{s.extra}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>
      <section className="pb-4">
        <Container className="text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium text-forest-950">{t("finalsec.t1")} <span className="text-forest-700 italic">{t("finalsec.t2")}</span></h2>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <ButtonLink to="/inscription" size="lg" arrow>
                {t("finalsec.cta")}
              </ButtonLink>
              <ButtonLink to="/menu" variant="outline" size="lg">
                {t("hero.secondary")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
