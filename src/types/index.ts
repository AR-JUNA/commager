export type Locale = "fr" | "en";

/** Localizable string living in mock/data (not in the UI dictionary). */
export interface LStr {
  fr: string;
  en: string;
}

/* ---------- Meals ---------- */

export type MealCategory = "vegetarian" | "local" | "light" | "gourmet";

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: LStr;
  category: MealCategory;
  description: LStr;
  image: string;
  ingredients: LStr[];
  allergens: string[]; // keys in i18n: allergen.*
  calories: number;
  nutrition: Nutrition;
  diet: string[]; // keys in i18n: diet.*
  spice: 0 | 1 | 2 | 3;
  /** ISO date of the delivery day this meal is served. */
  date: string;
}

/* ---------- Subscription ---------- */

export type PlanId = "basic" | "standard" | "premium";
export type BillingPeriod = "weekly" | "monthly";

export interface SubscriptionPlan {
  id: PlanId;
  mealsPerWeek: number;
  credits: number;
  priceWeekly: number; // Rs — centralized mock pricing
  priceMonthly: number; // Rs
  billingPeriod: BillingPeriod;
  features: string[]; // i18n keys: plans.feat.*
  recommended: boolean;
}

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "pending_payment";

export interface Subscription {
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: string;
  nextRenewal: string;
}

/* ---------- Customer ---------- */

export type FoodPreference = "everything" | "vegetarian" | "no_pork" | "other";
export type AllergyKey = "none" | "gluten" | "dairy" | "nuts" | "shellfish" | "eggs" | "soy";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryInstructions: string;
  preferences: FoodPreference;
  otherPreference?: string;
  allergies: AllergyKey[];
}

/* ---------- Deliveries / orders ---------- */

export type DeliveryStatus = "to_prepare" | "prepared" | "out" | "delivered" | "issue";

export interface Delivery {
  id: string;
  date: string; // ISO
  timeWindow: LStr;
  meal: Meal;
  quantity: number;
  address: string;
  instructions: string;
  box: boolean; // delivered to the Commanger Box
  status: DeliveryStatus;
}

export type OrderStatus = "confirmed" | "in_preparation" | "delivered" | "cancelled";

export interface Order {
  id: string;
  date: string;
  meal: Meal;
  quantity: number;
  deliveryId: string;
  status: OrderStatus;
}

/* ---------- Notifications ---------- */

export type NotifCategory = "menu" | "selection" | "delivery" | "payment" | "subscription";

export interface AppNotification {
  id: string;
  category: NotifCategory;
  title: LStr;
  body: LStr;
  date: string;
  read: boolean;
}

/* ---------- Weekly selection ---------- */

/** ISO day → selected meal id (null = nothing selected yet). */
export type WeeklySelections = Record<string, string | null>;

export type DayState = "selected" | "choose" | "locked" | "past";
