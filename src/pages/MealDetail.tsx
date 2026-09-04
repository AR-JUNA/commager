import { ArrowLeft, Check, Flame, Heart, Lock } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import { useApp } from "../store/AppContext";
import { Badge, Button, ButtonLink, Container, EmptyState, Progress } from "../components/ui";
import { MealCategoryBadge } from "../components/product";
import { mealById } from "../mock/meals";
import { isLocked } from "../lib/utils";
import { useState } from "react";

export default function MealDetailPage() {
  const { mealId } = useParams();
  const { t, L, date } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [pop, setPop] = useState(false);
  const meal = mealById(mealId ?? "");
  const inDashboard = location.pathname.startsWith("/dashboard");
  const base = inDashboard ? "/dashboard/menu" : "/menu";

  if (!meal) {
    return (
      <Container className="py-20">
        <EmptyState title={t("meal.notFound")} description={t("meal.notFoundD")} action={<ButtonLink to={base} variant="outline">{t("meal.back")}</ButtonLink>} />
      </Container>
    );
  }

  const locked = isLocked(new Date(meal.date));
  const loggedIn = Boolean(app.user && app.subscription);
  const selected = app.selections[meal.date] === meal.id;
  const fav = app.favorites.includes(meal.id);
  const spiceLabel = t(`meal.s${meal.spice}`);

  const select = () => {
    if (!app.subscription) return;
    if (app.subscription.status === "pending_payment") {
      app.toast(t("states.payReq"), "error");
      return;
    }
    if (locked) {
      app.toast(t("week.lockedToast"), "error");
      return;
    }
    const res = app.selectMeal(meal.date, meal.id);
    if (!res.ok) {
      app.toast(t("week.maxToast"), "error");
      return;
    }
    app.toast(t("week.selectedToast", { meal: L(meal.name) }));
  };

  const toggleFav = () => {
    const added = app.toggleFavorite(meal.id);
    app.toast(added ? t("toasts.favAdd") : t("toasts.favRemove"), "info");
    setPop(true);
    setTimeout(() => setPop(false), 450);
  };

  const nutrition = [
    { label: t("meal.cal"), value: meal.nutrition.calories, unit: "kcal", max: 800 },
    { label: t("meal.protein"), value: meal.nutrition.protein, unit: "g", max: 60 },
    { label: t("meal.carbs"), value: meal.nutrition.carbs, unit: "g", max: 100 },
    { label: t("meal.fat"), value: meal.nutrition.fat, unit: "g", max: 40 },
  ];

  return (
    <Container className="pt-12 pb-24 sm:pt-16 lg:pb-12">
      <button type="button" onClick={() => navigate(base)} className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-forest-800 transition-colors hover:text-forest-600">
        <ArrowLeft className="h-4 w-4" /> {t("meal.back")}
      </button>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="overflow-hidden rounded-[1.8rem] border-[5px] border-paper shadow-lift">
          <img src={meal.image} alt={L(meal.name)} className="aspect-[4/3.2] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MealCategoryBadge category={meal.category} />
            <Badge tone="sand">{t("meal.servedOn")} {date(meal.date)}</Badge>
            {selected && (
              <Badge tone="forest">
                <Check className="h-3 w-3" strokeWidth={3} /> {t("week.selected")}
              </Badge>
            )}
          </div>
          <h1 className="font-display mt-4 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.08] font-semibold text-forest-950">{L(meal.name)}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{L(meal.description)}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {meal.diet.map((d) => (
              <span key={d} className="rounded-full border border-sage-300 bg-sage-100/60 px-3 py-1.5 text-[12px] font-bold text-sage-700">{t(`diet.${d}`)}</span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-100/70 px-3 py-1.5 text-[12px] font-bold text-gold-600">
              <Flame className="h-3.5 w-3.5" /> {spiceLabel}
            </span>
          </div>

          <div className="mt-7">
            <h2 className="text-[13px] font-bold tracking-[0.14em] text-sage-600 uppercase">{t("menu.ingredients")}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {meal.ingredients.map((ing) => (
                <li key={ing.fr} className="rounded-full bg-sand px-3.5 py-1.5 text-[13px] font-semibold text-ink-soft">{L(ing)}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="text-[13px] font-bold tracking-[0.14em] text-sage-600 uppercase">{t("meal.allergensT")}</h2>
            <p className="mt-2 text-[14px] font-semibold text-ink-soft">
              {meal.allergens.map((a) => t(`allergen.${a}`)).join(" · ")}
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-sand-deep/60 bg-cream/80 p-5">
            <h2 className="text-[13px] font-bold tracking-[0.14em] text-sage-600 uppercase">{t("meal.nutritionT")}</h2>
            <dl className="mt-4 space-y-3.5">
              {nutrition.map((n) => (
                <div key={n.label}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <dt className="font-semibold text-ink-soft">{n.label}</dt>
                    <dd className="font-bold text-forest-900">{n.value} {n.unit}</dd>
                  </div>
                  <Progress value={n.value} max={n.max} className="h-1.5" />
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
            {loggedIn && !selected && (
              <Button size="lg" onClick={select} disabled={locked} className="min-w-[220px]">
                {locked ? (<><Lock className="h-4 w-4" /> {t("week.locked")}</>) : t("meal.chooseThis")}
              </Button>
            )}
            {loggedIn && selected && (
              <div className="flex h-[52px] min-w-[220px] items-center justify-center gap-2 rounded-full border border-forest-700/30 bg-forest-50 px-8 text-[15px] font-semibold text-forest-800">
                <Check className="h-4 w-4" /> {t("week.selected")} — {date(meal.date)}
              </div>
            )}
            {!loggedIn && (
              <ButtonLink to="/inscription" size="lg" arrow>
                {t("nav.register")}
              </ButtonLink>
            )}
            {loggedIn && (
              <Button variant="outline" size="lg" onClick={toggleFav}>
                <Heart className={pop ? "h-4.5 w-4.5 fill-clay-600 text-clay-600" : fav ? "h-4.5 w-4.5 fill-clay-600 text-clay-600" : "h-4.5 w-4.5"} style={{ width: 18, height: 18 }} />
                {fav ? t("meal.removeFav") : t("meal.addFav")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {loggedIn && (
        <div className={`fixed inset-x-0 z-[65] border-t border-sand-deep/60 bg-paper/95 p-3 backdrop-blur lg:hidden ${inDashboard ? "bottom-[58px]" : "bottom-0"}`}>
          <div className="mx-auto flex max-w-[560px] gap-2.5">
            {!selected ? (
              <Button className="flex-1" onClick={select} disabled={locked}>
                {locked ? (<><Lock className="h-4 w-4" /> {t("week.locked")}</>) : t("meal.chooseThis")}
              </Button>
            ) : (
              <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-forest-700/30 bg-forest-50 text-[14px] font-semibold text-forest-800">
                <Check className="h-4 w-4" /> {t("week.selected")}
              </div>
            )}
            <Button variant="outline" onClick={toggleFav} aria-label={fav ? t("meal.removeFav") : t("meal.addFav")}>
              <Heart className={fav ? "h-4.5 w-4.5 fill-clay-600 text-clay-600" : "h-4.5 w-4.5"} style={{ width: 18, height: 18 }} />
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
