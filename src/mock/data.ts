import type { AppNotification, Customer, Delivery, Order, Subscription, WeeklySelections } from "../types";
import { addDays, currentWeek, iso, nextRenewalDate } from "../lib/utils";
import { mealById } from "./meals";

export const MOCK_CUSTOMER: Customer = {
  id: "CUS-84213",
  firstName: "Aisha",
  lastName: "Ramdin",
  email: "aisha.ramdin@demo.mu",
  phone: "+230 5765 4321",
  address: "12 Rue des Lilas, Résidence Les Palmiers",
  city: "Quatre-Bornes",
  deliveryInstructions: "Portail vert — déposer la box près du garage.",
  preferences: "no_pork",
  allergies: ["nuts"],
};

export const MOCK_SUBSCRIPTION: Subscription = {
  id: "SUB-CMG-2049",
  planId: "standard",
  status: "active",
  startDate: iso(addDays(new Date(), -34)),
  nextRenewal: iso(nextRenewalDate()),
};

/** Standard plan (5 credits): 3 meals already selected this week. */
export const MOCK_SELECTIONS: WeeklySelections = (() => {
  const week = currentWeek();
  return {
    [iso(week[0])]: "m-mon-local",
    [iso(week[1])]: "m-tue-light",
    [iso(week[3])]: "m-thu-veg",
  };
})();

export const MOCK_BOX = {
  number: "BOX-CMG-000124",
  installedOn: iso(addDays(new Date(), -30)),
  method: "box" as "present" | "box",
  instructions: "Portail vert — déposer la box près du garage.",
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

function deliveryFromSelection(dateIso: string, mealId: string, status: Delivery["status"]): Delivery | null {
  const meal = mealById(mealId);
  if (!meal) return null;
  return {
    id: `DEL-${dateIso.slice(5).replace("-", "")}`,
    date: dateIso,
    timeWindow: { fr: "11h00 – 13h00", en: "11:00 AM – 1:00 PM" },
    meal,
    quantity: 1,
    address: MOCK_CUSTOMER.address,
    instructions: MOCK_CUSTOMER.deliveryInstructions,
    box: true,
    status,
  };
}

/** Upcoming deliveries derived from this week's selections. */
export function mockUpcomingDeliveries(): Delivery[] {
  const today = new Date();
  const todayIso = iso(today);
  const out: Delivery[] = [];
  for (const [dateIso, mealId] of Object.entries(MOCK_SELECTIONS)) {
    if (!mealId || dateIso < todayIso) continue;
    const status: Delivery["status"] = dateIso === todayIso ? "out" : dateIso === iso(addDays(today, 1)) ? "prepared" : "to_prepare";
    const d = deliveryFromSelection(dateIso, mealId, status);
    if (d) out.push(d);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Past deliveries for the history tab. */
export const MOCK_HISTORY_DELIVERIES: Delivery[] = (() => {
  const specs: Array<[number, string, Delivery["status"]]> = [
    [-7, "m-mon-gour", "delivered"],
    [-6, "m-tue-local", "delivered"],
    [-4, "m-wed-light", "delivered"],
    [-3, "m-thu-gour", "issue"],
    [-1, "m-fri-veg", "delivered"],
  ];
  return specs.map(([offset, mealId, status]) => {
    const dateIso = iso(addDays(new Date(), offset));
    const d = deliveryFromSelection(dateIso, mealId, status);
    return d ? { ...d, box: offset !== -4 } : null;
  }).filter((d): d is Delivery => d !== null);
})();

export function mockOrders(): { upcoming: Order[]; past: Order[] } {
  const upcoming = mockUpcomingDeliveries().map((d, i) => ({
    id: `CMD-2${410 + i}`,
    date: d.date,
    meal: d.meal,
    quantity: d.quantity,
    deliveryId: d.id,
    status: d.status === "to_prepare" ? ("confirmed" as const) : ("in_preparation" as const),
  }));
  const past = MOCK_HISTORY_DELIVERIES.map((d, i) => ({
    id: `CMD-2${388 + i}`,
    date: d.date,
    meal: d.meal,
    quantity: d.quantity,
    deliveryId: d.id,
    status: d.status === "issue" ? ("cancelled" as const) : ("delivered" as const),
  }));
  return { upcoming, past };
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1", category: "menu", read: false, date: hoursAgo(3),
    title: { fr: "Nouveau menu disponible", en: "New menu available" },
    body: { fr: "Votre nouveau menu de la semaine est disponible. Découvrez les 4 plats de chaque jour.", en: "Your new weekly menu is available. Discover the 4 meals on offer each day." },
  },
  {
    id: "n2", category: "selection", read: false, date: hoursAgo(7),
    title: { fr: "Il vous reste 2 repas à sélectionner", en: "You have 2 meals left to select" },
    body: { fr: "Il vous reste 2 repas à sélectionner cette semaine. Choisissez avant 16h00 la veille.", en: "You still have 2 meals to select this week. Choose before 4:00 PM the day before." },
  },
  {
    id: "n3", category: "selection", read: false, date: hoursAgo(26),
    title: { fr: "Repas de demain non sélectionné", en: "Tomorrow's meal not selected" },
    body: { fr: "Vous n'avez pas sélectionné votre repas de demain. Pensez à le choisir avant 16h00.", en: "You haven't selected tomorrow's meal yet. Remember to pick it before 4:00 PM." },
  },
  {
    id: "n4", category: "delivery", read: true, date: hoursAgo(30),
    title: { fr: "Votre repas a été livré", en: "Your meal has been delivered" },
    body: { fr: "Votre repas a été déposé dans votre Commanger Box. Bon appétit !", en: "Your meal was placed in your Commanger Box. Enjoy!" },
  },
  {
    id: "n5", category: "subscription", read: true, date: hoursAgo(50),
    title: { fr: "Renouvellement à venir", en: "Upcoming renewal" },
    body: { fr: "Votre abonnement sera renouvelé bientôt. Aucun action requise.", en: "Your subscription will renew soon. No action needed." },
  },
  {
    id: "n6", category: "payment", read: true, date: hoursAgo(74),
    title: { fr: "Paiement échoué", en: "Payment failed" },
    body: { fr: "Votre paiement n'a pas pu être traité. Mettez à jour votre moyen de paiement.", en: "Your payment could not be processed. Please update your payment method." },
  },
  {
    id: "n7", category: "menu", read: true, date: hoursAgo(98),
    title: { fr: "Le plat gourmand de la semaine", en: "This week's gourmet dish" },
    body: { fr: "Poulet rôti, sauce crémeuse aux champignons — déjà un classique de nos abonnés.", en: "Roast chicken, creamy mushroom sauce — already a member favourite." },
  },
];
