import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Clock3, Leaf, Package, Sparkles, Truck, UtensilsCrossed, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { AccordionItem, ButtonLink, Container, Reveal, SectionHeading, useRM } from "../../components/ui";
import { BoxVisual, MealGrid, PlanCard } from "../../components/product";
import { IMG, mealsForDay } from "../../mock/meals";
import { PLANS, FAQ_KEYS } from "../../mock/plans";
import { currentWeek } from "../../lib/utils";

export default function Home() {
  const { t } = useI18n();
  const { user } = useApp();
  const location = useLocation();
  const rm = useRM();
  const reduced = useReducedMotion();
  const [day, setDay] = useState(() => Math.min(6, Math.max(0, (new Date().getDay() + 6) % 7)));
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const week = currentWeek();
  const meals = mealsForDay(week[day].toISOString().slice(0, 10));

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const para1 = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);
  const para2 = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);

  useEffect(() => {
    if (location.hash.includes("faq")) {
      setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), 60);
    }
  }, [location.hash, reduced]);

  const title = (s: string, delay: number) => (
    <motion.span initial={rm ? { opacity: 0 } : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className="block">
      {s}
    </motion.span>
  );

  return (
    <>
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-sage-200/40 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-40 -right-32 h-[380px] w-[380px] rounded-full bg-gold-100/50 blur-3xl" aria-hidden />
        <Container className="relative grid items-center gap-12 pt-14 pb-16 lg:grid-cols-[1.04fr_0.96fr] lg:pt-20 lg:pb-24">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 rounded-full border border-sage-300 bg-sage-100/70 px-4 py-1.5 text-[12.5px] font-bold tracking-[0.06em] text-sage-700">
              <Truck className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </motion.p>
            <h1 className="font-display mt-6 text-[clamp(2.7rem,6.2vw,4.6rem)] leading-[1.02] font-medium tracking-[-0.015em] text-forest-950">
              {title(t("hero.t1"), 0.15)}
              {title(t("hero.t2"), 0.28)}
              <motion.span initial={rm ? { opacity: 0 } : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.41, ease: [0.22, 1, 0.36, 1] }} className="block text-forest-700 italic">
                {t("hero.t3")}
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
              {t("hero.sub")}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68, duration: 0.6 }} className="mt-8 flex flex-wrap items-center gap-3.5">
              <ButtonLink to={user ? "/dashboard/semaine" : "/inscription"} size="lg" arrow>
                {t("hero.primary")}
              </ButtonLink>
              <ButtonLink to="/menu" variant="outline" size="lg">
                {t("hero.secondary")}
              </ButtonLink>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="mt-5 text-[12.5px] font-medium text-mute">
              {t("hero.note")}
            </motion.p>
          </div>

          <motion.div initial={rm ? { opacity: 0 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="overflow-hidden rounded-[2rem] rounded-t-[10rem] border-[6px] border-paper shadow-lift">
              <img src={IMG.hero} alt="Bols de plats Commanger : riz, curry de légumes, poulet rôti et herbes fraîches" className="aspect-[5/5.4] w-full object-cover sm:aspect-[5/4.6]" />
            </div>
            <motion.div style={{ y: para1 }} className="absolute top-[16%] -left-3 sm:-left-8">
              <motion.div animate={reduced ? undefined : { y: [0, -9, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2.5 rounded-2xl border border-sand-deep/60 bg-paper/95 px-4 py-3 shadow-lift backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-800"><UtensilsCrossed className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /></span>
                <span>
                  <span className="block font-display text-[16px] leading-none font-semibold text-forest-950">4</span>
                  <span className="text-[11px] font-semibold text-mute">{t("weeksec.perDay")}</span>
                </span>
              </motion.div>
            </motion.div>
            <motion.div style={{ y: para2 }} className="absolute -right-2 bottom-[14%] sm:-right-6">
              <motion.div animate={reduced ? undefined : { y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="flex items-center gap-2.5 rounded-2xl border border-sand-deep/60 bg-paper/95 px-4 py-3 shadow-lift backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-gold-600"><Clock3 className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /></span>
                <span>
                  <span className="block font-display text-[16px] leading-none font-semibold text-forest-950">16h00</span>
                  <span className="text-[11px] font-semibold text-mute">{t("menu.deadlineNote")}</span>
                </span>
              </motion.div>
            </motion.div>
            <Leaf className="absolute -top-5 right-10 h-10 w-10 rotate-12 text-sage-400" aria-hidden />
          </motion.div>
        </Container>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="border-y border-sand-deep/50 bg-cream/70">
        <Container className="py-16 sm:py-20">
          <SectionHeading kicker={t("benefits.kicker")} title={t("benefits.title")} />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
              { n: "01", icon: Clock3, tt: t("benefits.b1t"), d: t("benefits.b1d") },
              { n: "02", icon: Leaf, tt: t("benefits.b2t"), d: t("benefits.b2d") },
              { n: "03", icon: Sparkles, tt: t("benefits.b3t"), d: t("benefits.b3d") },
              { n: "04", icon: Wallet, tt: t("benefits.b4t"), d: t("benefits.b4d") },
            ].map((b, i) => (
              <Reveal key={b.n} delay={i * 0.08} className="border-t-2 border-forest-800/15 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[34px] leading-none font-light text-sage-400">{b.n}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                    <b.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                  </span>
                </div>
                <h3 className="font-display mt-4 text-[19px] font-semibold text-forest-950">{b.tt}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-mute">{b.d}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading kicker={t("how.kicker")} title={t("how.title")} sub={t("how.sub")} />
          <ol className="relative mx-auto max-w-3xl space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[22px] before:w-px before:bg-sand-deep sm:space-y-10">
            {[
              { icon: Wallet, tt: t("how.s1t"), d: t("how.s1d") },
              { icon: UtensilsCrossed, tt: t("how.s2t"), d: t("how.s2d") },
              { icon: Truck, tt: t("how.s3t"), d: t("how.s3d") },
              { icon: Sparkles, tt: t("how.s4t"), d: t("how.s4d") },
            ].map((s, i) => (
              <Reveal key={s.tt} delay={i * 0.06}>
                <li className="relative flex gap-5 sm:gap-7">
                  <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-forest-800 bg-paper text-forest-800 shadow-soft">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div className="pt-1">
                    <p className="text-[12px] font-bold tracking-[0.16em] text-sage-600 uppercase">{t("weeksec.kicker").split(" ")[0]} {i + 1} / 4</p>
                    <h3 className="font-display mt-1 text-[20px] font-semibold text-forest-950">{s.tt}</h3>
                    <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-mute">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-10 text-center">
            <ButtonLink to="/comment-ca-fonctionne" variant="outline" arrow>
              {t("how.cta")}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* ============ WEEK MENU ============ */}
      <section className="bg-forest-950 py-16 text-cream sm:py-24">
        <Container>
          <motion.div initial={rm ? { opacity: 0 } : { opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }} className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-[13px] font-semibold tracking-[0.18em] text-sage-400 uppercase">{t("weeksec.kicker")}</p>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.08] font-medium">{t("weeksec.title")}</h2>
            <p className="mt-4 text-[15px] text-cream/65">{t("weeksec.sub")}</p>
          </motion.div>
          <div className="mx-auto mb-8 flex max-w-xl justify-center rounded-2xl bg-forest-900/80 p-1.5">
            <DaySelectorDark days={week} active={day} onChange={setDay} />
          </div>
          <MealGrid meals={meals} detailBase="/menu" />
          <p className="mt-6 text-center text-[12.5px] font-medium text-cream/55">{t("weeksec.deadline")}</p>
          <div className="mt-8 text-center">
            <ButtonLink to="/menu" variant="light" size="lg" arrow>
              {t("weeksec.cta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ============ PLANS ============ */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading kicker={t("planssec.kicker")} title={t("planssec.title")} sub={t("planssec.sub")} />
          <div className="grid gap-6 pt-4 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} className="h-full">
                <PlanCard plan={p} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mx-auto mt-10 flex max-w-2xl items-start gap-4 rounded-2xl border border-gold-300/60 bg-gold-100/50 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-forest-950">
              <Sparkles className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            </span>
            <div>
              <p className="font-display text-[16.5px] font-semibold text-forest-950">{t("planssec.creditRuleT")}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{t("planssec.creditRuleD")}</p>
            </div>
          </Reveal>
          <Reveal className="mt-10 text-center">
            <ButtonLink to="/abonnements" size="lg" arrow>
              {t("finalsec.secondary")}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* ============ WHY ============ */}
      <section className="border-y border-sand-deep/50 bg-cream/70 py-16 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" kicker={t("whysec.kicker")} title={t("whysec.title")} className="mb-8" />
            <div className="space-y-6">
              {[
                { tt: t("whysec.w1t"), d: t("whysec.w1d") },
                { tt: t("whysec.w2t"), d: t("whysec.w2d") },
                { tt: t("whysec.w3t"), d: t("whysec.w3d") },
                { tt: t("whysec.w4t"), d: t("whysec.w4d") },
              ].map((w, i) => (
                <Reveal key={w.tt} delay={i * 0.06} className="flex gap-4">
                  <span className="mt-2 h-[3px] w-8 shrink-0 rounded-full bg-gold-500" />
                  <div>
                    <h3 className="font-display text-[18.5px] font-semibold text-forest-950">{w.tt}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-mute">{w.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-9">
              <ButtonLink to="/inscription" arrow>
                {t("whysec.cta")}
              </ButtonLink>
            </Reveal>
          </div>
          <div className="relative">
            <Reveal className="overflow-hidden rounded-[1.6rem] shadow-lift">
              <img src={IMG.curry} alt="Curry de légumes au lait de coco" loading="lazy" className="aspect-[4/3.4] w-full object-cover transition-transform duration-700 hover:scale-[1.04]" />
            </Reveal>
            <Reveal delay={0.15} className="absolute -bottom-8 -left-4 hidden w-52 overflow-hidden rounded-2xl border-4 border-paper shadow-lift sm:block">
              <img src={IMG.salad} alt="Bowl quinoa et patate douce" loading="lazy" className="aspect-square w-full object-cover" />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ============ BOX ============ */}
      <section className="py-16 sm:py-24">
        <Container className="overflow-hidden rounded-[2rem] bg-forest-900 text-cream shadow-lift">
          <div className="grid items-center gap-10 p-8 sm:p-14 lg:grid-cols-2">
            <BoxVisual number="BOX-CMG-000124" />
            <div>
              <p className="text-[13px] font-semibold tracking-[0.18em] text-sage-400 uppercase">{t("boxsec.kicker")}</p>
              <h2 className="font-display mt-3 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-medium">{t("boxsec.title")}</h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-cream/70">{t("boxsec.body")}</p>
              <ul className="mt-7 space-y-4">
                {[
                  { tt: t("boxsec.f1"), d: t("boxsec.f1d") },
                  { tt: t("boxsec.f2"), d: t("boxsec.f2d") },
                  { tt: t("boxsec.f3"), d: t("boxsec.f3d") },
                ].map((f) => (
                  <li key={f.tt} className="flex gap-3.5">
                    <Package className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
                    <div>
                      <p className="font-semibold text-[15px]">{f.tt}</p>
                      <p className="text-[13px] text-cream/60">{f.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink to="/inscription" variant="gold" arrow>
                  {t("boxsec.cta")}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-16 sm:py-24">
        <Container className="max-w-[820px]">
          <SectionHeading kicker={t("faqsec.kicker")} title={t("faqsec.title")} sub={t("faqsec.sub")} />
          <div className="space-y-3">
            {FAQ_KEYS.map((k) => (
              <Reveal key={k} delay={k * 0.03}>
                <AccordionItem q={t(`faqsec.q${k}`)} a={t(`faqsec.a${k}`)} open={openFaq === k} onToggle={() => setOpenFaq(openFaq === k ? null : k)} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="pb-4">
        <Container>
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-forest-950 px-6 py-14 text-center text-cream sm:px-14 sm:py-20">
            <Leaf className="absolute top-8 left-10 h-12 w-12 -rotate-12 text-sage-400/40" aria-hidden />
            <Leaf className="absolute right-12 bottom-8 h-16 w-16 rotate-45 text-sage-400/25" aria-hidden />
            <h2 className="font-display mx-auto max-w-2xl text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.06] font-medium">
              {t("finalsec.t1")} <span className="text-sage-300 italic">{t("finalsec.t2")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-cream/65">{t("finalsec.sub")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <ButtonLink to={user ? "/dashboard/semaine" : "/inscription"} variant="gold" size="lg" arrow>
                {t("finalsec.cta")}
              </ButtonLink>
              <ButtonLink to="/abonnements" variant="light" size="lg">
                {t("finalsec.secondary")}
              </ButtonLink>
            </div>
            <Link to="/menu" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-cream/60 transition-colors hover:text-cream">
              {t("hero.secondary")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

/** Day selector variant tuned for dark sections. */
function DaySelectorDark({ days, active, onChange }: { days: Date[]; active: number; onChange: (i: number) => void }) {
  const { weekday } = useI18n();
  return (
    <div className="no-scrollbar flex w-full gap-1 overflow-x-auto" role="tablist">
      {days.map((d, i) => (
        <button key={d.toISOString()} role="tab" aria-selected={i === active} onClick={() => onChange(i)}
          className={`relative min-w-[64px] flex-1 rounded-xl px-2 py-2 text-center transition-colors duration-200 sm:min-w-[76px] ${i === active ? "text-forest-950" : "text-cream/70 hover:text-cream"}`}>
          {i === active && <motion.span layoutId="day-dark" className="absolute inset-0 rounded-xl bg-sage-300" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          <span className="relative z-10 block text-[10.5px] font-bold tracking-[0.12em] uppercase">{weekday(i)}</span>
          <span className="font-display relative z-10 block text-[16px] font-semibold">{d.getDate()}</span>
        </button>
      ))}
    </div>
  );
}
