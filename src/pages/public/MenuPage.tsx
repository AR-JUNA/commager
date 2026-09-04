import { useState } from "react";
import { Clock3, Lock } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { AnimatedNumber, Badge, ButtonLink, Container, SectionHeading } from "../../components/ui";
import { DaySelector, MealGrid, MealCard } from "../../components/product";
import { mealsForDay } from "../../mock/meals";
import { currentWeek, isLocked, iso } from "../../lib/utils";
import type { Meal } from "../../types";

export default function MenuPage() {
  const { t, L } = useI18n();
  const app = useApp();
  const week = currentWeek();
  const [day, setDay] = useState(() => (new Date().getDay() + 6) % 7);
  const dayIso = iso(week[day]);
  const meals = mealsForDay(dayIso);
  const loggedIn = Boolean(app.user && app.subscription);
  const locked = isLocked(week[day]);
  const selectedId = app.selections[dayIso] ?? null;

  const handleSelect = (meal: Meal) => {
    if (!app.subscription) return;
    if (app.subscription.status === "pending_payment") {
      app.toast(t("states.payReq"), "error");
      return;
    }
    if (locked) {
      app.toast(t("week.lockedToast"), "error");
      return;
    }
    const res = app.selectMeal(dayIso, meal.id);
    if (!res.ok) {
      app.toast(t("week.maxToast"), "error");
      return;
    }
    app.toast(t("week.selectedToast", { meal: L(meal.name) }));
  };

  return (
    <section className="pt-14 pb-10 sm:pt-20">
      <Container>
        <SectionHeading kicker={t("menu.kicker")} title={t("menu.title")} sub={t("menu.sub")} />
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-4">
          <div className="w-full rounded-2xl border border-sand-deep/60 bg-cream p-1.5">
            <DaySelector days={week} active={day} onChange={setDay} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Badge tone="gold">
              <Clock3 className="h-3 w-3" /> {t("menu.deadlineNote")}
            </Badge>
            {loggedIn && (
              <Badge tone="forest">
                <AnimatedNumber value={app.remainingCredits} /> {t("week.remainingC", { n: "" }).replace(/^\s*/, "")}
              </Badge>
            )}
            {locked && (
              <Badge tone="clay">
                <Lock className="h-3 w-3" /> {t("menu.lockedNote")}
              </Badge>
            )}
          </div>
        </div>

        <MealGrid
          meals={meals}
          detailBase="/menu"
          renderCard={
            loggedIn
              ? (meal) => (
                  <MealCard
                    meal={meal}
                    detailTo={`/menu/${meal.id}`}
                    selected={selectedId === meal.id}
                    locked={locked}
                    onSelect={() => handleSelect(meal)}
                  />
                )
              : undefined
          }
        />

        {!loggedIn && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-[1.6rem] border border-sand-deep/60 bg-cream/80 px-6 py-10 text-center">
            <p className="font-display text-[20px] font-semibold text-forest-950">{t("menu.loginToSelect")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink to="/connexion" variant="outline">
                {t("nav.login")}
              </ButtonLink>
              <ButtonLink to="/inscription" arrow>
                {t("nav.register")}
              </ButtonLink>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
