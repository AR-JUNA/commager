import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarOff, Check, ChevronRight, Clock3, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { AnimatedNumber, Badge, Button, Card, Progress, useRM } from "../../components/ui";
import { MealCategoryBadge, MealSelectorModal } from "../../components/product";
import { mealById, mealsForDay } from "../../mock/meals";
import { currentWeek, isLocked, iso, isSameDay } from "../../lib/utils";
import { cn } from "../../lib/utils";

export default function Week() {
  const { t, L, date, weekday } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const rm = useRM();
  const [pickerDay, setPickerDay] = useState<Date | null>(null);
  const week = currentWeek();

  if (!app.subscription) return null;

  const pickIso = pickerDay ? iso(pickerDay) : "";
  const pickMeals = pickerDay ? mealsForDay(pickIso) : [];
  const pickSelected = pickIso ? app.selections[pickIso] ?? null : null;

  const confirmPick = (mealId: string) => {
    if (app.subscription?.status === "pending_payment") {
      app.toast(t("states.payReq"), "error");
      setPickerDay(null);
      return;
    }
    const meal = mealById(mealId);
    const res = app.selectMeal(pickIso, mealId);
    if (!res.ok) {
      app.toast(t("week.maxToast"), "error");
      return;
    }
    if (meal) app.toast(t("week.selectedToast", { meal: L(meal.name) }));
    setPickerDay(null);
  };

  const clearPick = () => {
    app.clearSelection(pickIso);
    app.toast(t("week.removedToast"), "info");
    setPickerDay(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("week.title")}</h1>
          <p className="mt-1 max-w-xl text-[14px] text-mute">{t("week.sub")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="gold">
            <Clock3 className="h-3 w-3" /> {t("week.deadline")}
          </Badge>
          <Badge tone={app.remainingCredits > 0 ? "forest" : "clay"}>
            <AnimatedNumber value={app.remainingCredits} /> {t("common.credits")}
          </Badge>
        </div>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[13.5px] font-semibold text-ink-soft">{t("week.xOfY", { x: app.usedCredits, y: app.credits })}</p>
          {app.remainingCredits === 0 ? (
            <p className="text-[12.5px] font-semibold text-forest-700">{t("dash.allSelected")}</p>
          ) : (
            <p className="text-[12.5px] font-semibold text-gold-600">{t("week.remainingC", { n: app.remainingCredits })}</p>
          )}
        </div>
        <Progress value={app.usedCredits} max={app.credits} className="mt-2.5 h-3" />
      </Card>

      <div className="mt-6 space-y-3">
        {week.map((d, i) => {
          const dayIso = iso(d);
          const sel = app.selections[dayIso];
          const meal = sel ? mealById(sel) : undefined;
          const locked = isLocked(d);
          const today = isSameDay(d, new Date());
          const noCredits = app.remainingCredits === 0 && !sel;

          return (
            <motion.div key={dayIso} initial={rm ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: rm ? 0 : i * 0.05 }}>
              <Card className={cn("p-4 transition-colors sm:p-5", today && "border-forest-700/40 bg-forest-50/60", sel && !locked && "border-forest-700/30")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex w-full items-center gap-3.5 sm:w-40 sm:shrink-0 sm:flex-col sm:items-start sm:gap-0">
                    <p className={cn("text-[12px] font-bold tracking-[0.14em] uppercase", today ? "text-forest-700" : "text-sage-600")}>{weekday(i, true)}</p>
                    <p className="font-display text-[19px] leading-tight font-semibold text-forest-950 sm:mt-0.5">{date(d, { day: "numeric", month: "short" })}</p>
                    {today && <Badge tone="forest" className="mt-1 hidden sm:inline-flex">{t("menu.todayBadge")}</Badge>}
                  </div>

                  <div className="min-w-0 flex-1">
                    {meal ? (
                      <div className="flex items-center gap-3.5">
                        <img src={meal.image} alt="" className="h-14 w-[68px] shrink-0 rounded-xl object-cover" loading="lazy" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <MealCategoryBadge category={meal.category} />
                            {locked && (
                              <Badge tone="sand">
                                <Lock className="h-3 w-3" /> {t("week.lockedState")}
                              </Badge>
                            )}
                            {!locked && (
                              <Badge tone="forest">
                                <Check className="h-3 w-3" strokeWidth={3} /> {t("week.selected")}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 truncate font-display text-[15.5px] font-semibold text-forest-950">{L(meal.name)}</p>
                        </div>
                      </div>
                    ) : locked ? (
                      <div className="flex items-center gap-3 text-mute">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand">
                          <Lock className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[13.5px] font-bold text-ink-soft">{t("week.locked")}</p>
                          <p className="text-[12px]">{t("week.lockedD")}</p>
                        </div>
                      </div>
                    ) : noCredits ? (
                      <div className="flex items-center gap-3 text-mute">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand">
                          <CalendarOff className="h-4 w-4" />
                        </span>
                        <p className="max-w-sm text-[12.5px] leading-snug">{t("week.creditsOut")}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-mute">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-sand-deep">
                          <CalendarOff className="h-4 w-4" />
                        </span>
                        <p className="text-[13.5px] font-semibold">{t("week.noDelivery")}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    {!locked && meal && (
                      <Button variant="outline" size="sm" onClick={() => setPickerDay(d)}>
                        {t("week.changeBtn")}
                      </Button>
                    )}
                    {!locked && !meal && (
                      <Button size="sm" disabled={noCredits} onClick={() => setPickerDay(d)}>
                        {t("week.chooseBtn")} <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    {!locked && !meal && (
                      <button type="button" onClick={() => navigate("/dashboard/menu")} className="text-[12px] font-bold text-forest-800 hover:underline">
                        {t("sidebar.menu")}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12.5px] font-medium text-mute">{t("planssec.creditRuleD")}</p>

      <MealSelectorModal
        open={pickerDay !== null}
        day={pickerDay}
        meals={pickMeals}
        selectedId={pickSelected}
        onClose={() => setPickerDay(null)}
        onPick={confirmPick}
        onClear={clearPick}
      />
    </div>
  );
}
