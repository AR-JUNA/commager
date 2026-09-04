import type { LStr, PlanId, SubscriptionPlan } from "../types";

/**
 * Centralized mock pricing — replace with API data later.
 * All amounts in Mauritian Rupees (Rs).
 */
export const PRICING = {
  currency: "Rs",
  basic: { weekly: 399, monthly: 1490 },
  standard: { weekly: 599, monthly: 2190 },
  premium: { weekly: 799, monthly: 2890 },
  boxIncluded: true,
} as const;

export const PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    mealsPerWeek: 3,
    credits: 3,
    priceWeekly: PRICING.basic.weekly,
    priceMonthly: PRICING.basic.monthly,
    billingPeriod: "weekly",
    features: ["plans.feat.meals", "plans.feat.credits", "plans.feat.menu", "plans.feat.box", "plans.feat.flex"],
    recommended: false,
  },
  {
    id: "standard",
    mealsPerWeek: 5,
    credits: 5,
    priceWeekly: PRICING.standard.weekly,
    priceMonthly: PRICING.standard.monthly,
    billingPeriod: "weekly",
    features: ["plans.feat.meals", "plans.feat.credits", "plans.feat.menu", "plans.feat.box", "plans.feat.flex", "plans.feat.support"],
    recommended: true,
  },
  {
    id: "premium",
    mealsPerWeek: 7,
    credits: 7,
    priceWeekly: PRICING.premium.weekly,
    priceMonthly: PRICING.premium.monthly,
    billingPeriod: "weekly",
    features: ["plans.feat.meals", "plans.feat.credits", "plans.feat.menu", "plans.feat.box", "plans.feat.flex", "plans.feat.support", "plans.feat.preview"],
    recommended: false,
  },
];

export function planById(id: PlanId): SubscriptionPlan {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}

export const CITIES: LStr[] = [
  { fr: "Port-Louis", en: "Port Louis" },
  { fr: "Quatre-Bornes", en: "Quatre Bornes" },
  { fr: "Rose-Hill", en: "Rose Hill" },
  { fr: "Vacoas-Phoenix", en: "Vacoas-Phoenix" },
  { fr: "Curepipe", en: "Curepipe" },
  { fr: "Beau-Bassin", en: "Beau Bassin" },
  { fr: "Ébène", en: "Ebene" },
  { fr: "Moka", en: "Moka" },
  { fr: "Triolet", en: "Triolet" },
  { fr: "Goodlands", en: "Goodlands" },
  { fr: "Centre de Flacq", en: "Centre de Flacq" },
  { fr: "Flic-en-Flac", en: "Flic en Flac" },
  { fr: "Tamarin", en: "Tamarin" },
  { fr: "Grand-Baie", en: "Grand Baie" },
  { fr: "Mahébourg", en: "Mahébourg" },
];

export const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const PROMO_CODE = "CMG-FAM10";
