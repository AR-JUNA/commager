import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { ButtonLink, Container, Reveal, SectionHeading } from "../../components/ui";
import { IMG } from "../../mock/meals";

export default function About() {
  const { t } = useI18n();
  const { user } = useApp();

  const sections = [
    { img: IMG.salad, tt: t("about.s1t"), d: t("about.s1d"), alt: "Bol équilibré quinoa et légumes" },
    { img: IMG.rougaille, tt: t("about.s2t"), d: t("about.s2d"), alt: "Rougaille mauricienne" },
    { img: IMG.hero, tt: t("about.s3t"), d: t("about.s3d"), alt: "Repas Commanger sur une table" },
  ];

  return (
    <>
      <section className="pt-14 pb-6 sm:pt-20">
        <Container className="max-w-[860px] text-center">
          <SectionHeading kicker={t("about.kicker")} title={t("about.title")} />
          <Reveal>
            <p className="mx-auto -mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">{t("about.lead")}</p>
          </Reveal>
        </Container>
      </section>
      <section className="pb-8">
        <Container className="max-w-[980px] space-y-16 sm:space-y-20">
          {sections.map((s, i) => (
            <Reveal key={s.tt}>
              <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="overflow-hidden rounded-[1.6rem] border-[5px] border-paper shadow-lift">
                  <img src={s.img} alt={s.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.04]" />
                </div>
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-semibold text-forest-950">{s.tt}</h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>
      <section className="pb-4">
        <Container>
          <Reveal className="mx-auto max-w-[760px] rounded-[2rem] bg-forest-900 px-8 py-12 text-center text-cream sm:px-14">
            <p className="font-display text-[clamp(1.3rem,2.8vw,1.8rem)] leading-snug font-medium italic">{t("about.quote")}</p>
            <p className="mt-4 text-[13px] font-bold tracking-[0.14em] text-sage-300 uppercase">{t("about.quoteA")}</p>
            <div className="mt-8">
              <ButtonLink to={user ? "/dashboard" : "/inscription"} variant="gold" arrow>
                {t("about.cta")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
