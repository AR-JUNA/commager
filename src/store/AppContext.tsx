import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppNotification, Customer, PlanId, Subscription, WeeklySelections } from "../types";
import { MOCK_BOX, MOCK_CUSTOMER, MOCK_NOTIFICATIONS, MOCK_SELECTIONS, MOCK_SUBSCRIPTION } from "../mock/data";
import { planById } from "../mock/plans";
import { currentWeek, iso, nextRenewalDate, readStorage, uid, writeStorage } from "../lib/utils";

export interface Toast {
  id: string;
  message: string;
  kind: "success" | "error" | "info";
}

export type BoxMethod = "present" | "box";

interface AppState {
  user: Customer | null;
  subscription: Subscription | null;
  selections: WeeklySelections;
  favorites: string[];
  notifications: AppNotification[];
  boxMethod: BoxMethod;
  boxNumber: string;
  pendingPlanId: PlanId;
  toasts: Toast[];
}

interface AppCtx extends AppState {
  credits: number;
  usedCredits: number;
  remainingCredits: number;
  unreadCount: number;
  login: (email: string) => void;
  logout: () => void;
  register: (customer: Customer, planId: PlanId) => void;
  confirmSubscription: () => void;
  selectMeal: (dayIso: string, mealId: string) => { ok: boolean; reason?: "max" };
  clearSelection: (dayIso: string) => void;
  toggleFavorite: (mealId: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setPendingPlan: (id: PlanId) => void;
  changePlan: (id: PlanId) => void;
  pauseSubscription: () => void;
  resumeSubscription: () => void;
  cancelSubscription: () => void;
  setBoxMethod: (m: BoxMethod) => void;
  updateUser: (patch: Partial<Customer>) => void;
  updateNotifications: (updater: (n: AppNotification[]) => AppNotification[]) => void;
  toast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: string) => void;
}

const KEY = "cmg_app_v1";

function loadState(): AppState {
  const fallback: AppState = {
    user: null,
    subscription: null,
    selections: {},
    favorites: [],
    notifications: [],
    boxMethod: MOCK_BOX.method,
    boxNumber: MOCK_BOX.number,
    pendingPlanId: "standard",
    toasts: [],
  };
  const saved = readStorage<Partial<AppState> | null>(KEY, null);
  if (!saved) return fallback;
  // Drop selections from previous weeks so credits always reflect the current week.
  const weekKeys = new Set(currentWeek().map(iso));
  const selections: WeeklySelections = {};
  for (const [day, mealId] of Object.entries(saved.selections ?? {})) {
    if (weekKeys.has(day)) selections[day] = mealId;
  }
  return { ...fallback, ...saved, selections, toasts: [] };
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    const { toasts: _t, ...persistable } = state;
    writeStorage(KEY, persistable);
  }, [state]);

  const toast = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = uid("toast");
    setState((s) => ({ ...s, toasts: [...s.toasts, { id, message, kind }] }));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
  }, []);

  const login = useCallback((email: string) => {
    setState((s) => ({
      ...s,
      user: { ...MOCK_CUSTOMER, email },
      subscription: { ...MOCK_SUBSCRIPTION },
      selections: { ...MOCK_SELECTIONS },
      notifications: [...MOCK_NOTIFICATIONS],
      boxMethod: MOCK_BOX.method,
      boxNumber: MOCK_BOX.number,
    }));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      user: null,
      subscription: null,
      selections: {},
      notifications: [],
    }));
  }, []);

  const register = useCallback((customer: Customer, planId: PlanId) => {
    setState((s) => ({
      ...s,
      user: customer,
      subscription: {
        id: `SUB-${uid("cmg").toUpperCase().slice(4)}`,
        planId,
        status: "pending_payment",
        startDate: iso(new Date()),
        nextRenewal: iso(nextRenewalDate()),
      },
      selections: {},
      notifications: [...MOCK_NOTIFICATIONS.slice(0, 1)],
      pendingPlanId: planId,
    }));
  }, []);

  const confirmSubscription = useCallback(() => {
    setState((s) =>
      s.subscription ? { ...s, subscription: { ...s.subscription, status: "active" } } : s,
    );
  }, []);

  const setPendingPlan = useCallback((id: PlanId) => {
    setState((s) => ({ ...s, pendingPlanId: id }));
  }, []);

  const changePlan = useCallback((id: PlanId) => {
    setState((s) => {
      const plan = planById(id);
      let selections = s.selections;
      const used = Object.values(selections).filter(Boolean).length;
      if (used > plan.credits) {
        const keep: WeeklySelections = {};
        let count = 0;
        for (const [day, mealId] of Object.entries(selections)) {
          if (mealId && count < plan.credits) {
            keep[day] = mealId;
            count += 1;
          } else if (!mealId) {
            keep[day] = mealId;
          }
        }
        selections = keep;
      }
      return {
        ...s,
        selections,
        pendingPlanId: id,
        subscription: s.subscription ? { ...s.subscription, planId: id } : s.subscription,
      };
    });
  }, []);

  const pauseSubscription = useCallback(() => {
    setState((s) => (s.subscription ? { ...s, subscription: { ...s.subscription, status: "paused" } } : s));
  }, []);

  const resumeSubscription = useCallback(() => {
    setState((s) => (s.subscription ? { ...s, subscription: { ...s.subscription, status: "active" } } : s));
  }, []);

  const cancelSubscription = useCallback(() => {
    setState((s) => ({
      ...s,
      subscription: s.subscription ? { ...s.subscription, status: "cancelled" } : s.subscription,
      selections: {},
    }));
  }, []);

  const selectMeal = useCallback(
    (dayIso: string, mealId: string): { ok: boolean; reason?: "max" } => {
      let result: { ok: boolean; reason?: "max" } = { ok: true };
      setState((s) => {
        if (!s.subscription) return s;
        const plan = planById(s.subscription.planId);
        const used = Object.entries(s.selections).filter(([d, v]) => v && d !== dayIso).length;
        if (used >= plan.credits) {
          result = { ok: false, reason: "max" };
          return s;
        }
        return { ...s, selections: { ...s.selections, [dayIso]: mealId } };
      });
      return result;
    },
    [],
  );

  const clearSelection = useCallback((dayIso: string) => {
    setState((s) => {
      const next = { ...s.selections };
      delete next[dayIso];
      return { ...s, selections: next };
    });
  }, []);

  const toggleFavorite = useCallback((mealId: string): boolean => {
    let added = false;
    setState((s) => {
      const has = s.favorites.includes(mealId);
      added = !has;
      return { ...s, favorites: has ? s.favorites.filter((f) => f !== mealId) : [...s.favorites, mealId] };
    });
    return added;
  }, []);

  const markRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const updateNotifications = useCallback((updater: (n: AppNotification[]) => AppNotification[]) => {
    setState((s) => ({ ...s, notifications: updater(s.notifications) }));
  }, []);

  const setBoxMethod = useCallback((m: BoxMethod) => {
    setState((s) => ({ ...s, boxMethod: m }));
  }, []);

  const updateUser = useCallback((patch: Partial<Customer>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
  }, []);

  const derived = useMemo(() => {
    const plan = state.subscription ? planById(state.subscription.planId) : null;
    const usedCredits = Object.values(state.selections).filter(Boolean).length;
    return {
      credits: plan?.credits ?? 0,
      usedCredits,
      remainingCredits: Math.max(0, (plan?.credits ?? 0) - usedCredits),
      unreadCount: state.notifications.filter((n) => !n.read).length,
    };
  }, [state.subscription, state.selections, state.notifications]);

  const value = useMemo<AppCtx>(
    () => ({ ...state, ...derived, login, logout, register, confirmSubscription, selectMeal, clearSelection, toggleFavorite, markRead, markAllRead, setPendingPlan, changePlan, pauseSubscription, resumeSubscription, cancelSubscription, setBoxMethod, updateUser, updateNotifications, toast, dismissToast }),
    [state, derived, login, logout, register, confirmSubscription, selectMeal, clearSelection, toggleFavorite, markRead, markAllRead, setPendingPlan, changePlan, pauseSubscription, resumeSubscription, cancelSubscription, setBoxMethod, updateUser, updateNotifications, toast, dismissToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
