import { useState } from "react";
import { Clock3, Lock } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { AnimatedNumber, Badge } from "../../components/ui";
import { DaySelector, MealCard, MealGrid } from "../../components/product";
import { mealsForDay } from "../../mock/meals";
import { currentWeek, isLocked, iso } from "../../lib/utils";
import type { Meal } from "../../types";

export default function DashMenu() {
  const { t, L } = useI18n();
  const app = useApp();
  const week = currentWeek();
  const [day, setDay] = useState(() => (new Date().getDay() + 6) % 7);
  const dayIso = iso(week[day]);
  const meals = mealsForDay(dayIso);
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
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("menu.title")}</h1>
          <p className="mt-1 text-[14px] text-mute">{t("menu.sub")}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Badge tone="gold">
            <Clock3 className="h-3 w-3" /> {t("menu.deadlineNote")}
          </Badge>
          <Badge tone="forest">
            <AnimatedNumber value={app.remainingCredits} /> / {app.credits} {t("common.credits")}
          </Badge>
          {locked && (
            <Badge tone="clay">
              <Lock className="h-3 w-3" /> {t("menu.lockedNote")}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-sand-deep/60 bg-cream p-1.5">
        <DaySelector days={week} active={day} onChange={setDay} />
      </div>

      <div className="mt-6">
        <MealGrid
          meals={meals}
          detailBase="/dashboard/menu"
          renderCard={(meal) => (
            <MealCard
              meal={meal}
              detailTo={`/dashboard/menu/${meal.id}`}
              selected={selectedId === meal.id}
              locked={locked}
              onSelect={() => handleSelect(meal)}
            />
          )}
        />
      </div>
    </div>
  );
}
