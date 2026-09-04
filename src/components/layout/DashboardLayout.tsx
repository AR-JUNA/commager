import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Repeat, Truck, UtensilsCrossed, UserRound, X } from "lucide-react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { AnimatedNumber, Badge, ButtonLink, LanguageSwitcher, Progress, useRM } from "../ui";
import { Logo } from "./Header";
import { cn } from "../../lib/utils";
import { planById } from "../../mock/plans";

interface NavItem {
  to: string;
  key: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

export function DashboardLayout() {
  const { t } = useI18n();
  const app = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const rm = useRM();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname]);

  if (!app.user) return <Navigate to="/connexion" replace />;

  const plan = app.subscription ? planById(app.subscription.planId) : null;
  const status = app.subscription?.status;

  const items: NavItem[] = [
    { to: "/dashboard", key: "sidebar.dashboard", icon: LayoutDashboard, end: true },
    { to: "/dashboard/menu", key: "sidebar.menu", icon: UtensilsCrossed },
    { to: "/dashboard/commandes", key: "sidebar.orders", icon: ClipboardList },
    { to: "/dashboard/abonnement", key: "sidebar.subscription", icon: Repeat },
    { to: "/dashboard/livraisons", key: "sidebar.deliveries", icon: Truck },
    { to: "/dashboard/box", key: "sidebar.box", icon: Package },
    { to: "/dashboard/compte", key: "sidebar.account", icon: UserRound },
    { to: "/dashboard/notifications", key: "sidebar.notifications", icon: Bell },
  ];

  const bottomItems: NavItem[] = [
    items[0],
    items[1],
    { to: "/dashboard/semaine", key: "dash.weekT", icon: UtensilsCrossed },
    items[4],
    items[6],
  ];

  const logout = () => {
    app.logout();
    app.toast(t("toasts.logout"), "info");
    navigate("/");
  };

  const navBtn = (item: NavItem, mobile?: boolean) => {
    const Icon = item.icon;
    return (
      <NavLink key={item.to + (mobile ? "-m" : "")} to={item.to} end={item.end}
        className={({ isActive }) =>
          cn(
            "relative flex items-center gap-3 rounded-xl text-[14px] font-medium transition-colors duration-200",
            mobile ? "flex-col gap-1 py-2 text-[10.5px]" : "px-4 py-2.5",
            isActive ? "text-forest-900" : "text-ink-soft hover:bg-sand/60 hover:text-forest-900",
          )
        }>
        {({ isActive }) => (
          <>
            {isActive && !mobile && (
              <motion.span layoutId="side-active" className="absolute inset-0 rounded-xl border border-forest-800/15 bg-forest-100/80" transition={{ type: "spring", stiffness: 480, damping: 38 }} />
            )}
            {isActive && mobile && <motion.span layoutId="bottom-active" className="absolute top-0 h-[3px] w-8 rounded-full bg-forest-700" transition={{ type: "spring", stiffness: 480, damping: 38 }} />}
            <Icon className={cn(mobile ? "h-5 w-5" : "h-[18px] w-[18px]", isActive && "text-forest-800")} />
            <span className={cn("relative z-10", isActive && "font-semibold")}>{t(item.key)}</span>
            {item.key === "sidebar.notifications" && app.unreadCount > 0 && !mobile && (
              <span className="relative z-10 ml-auto rounded-full bg-clay-600 px-1.5 py-0.5 text-[10.5px] font-bold text-cream">{app.unreadCount}</span>
            )}
            {item.key === "sidebar.notifications" && app.unreadCount > 0 && mobile && (
              <span className="absolute top-1 right-1/2 translate-x-4 rounded-full bg-clay-600 px-1 text-[9px] font-bold text-cream">{app.unreadCount}</span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-[60] hidden w-[252px] flex-col border-r border-sand-deep/50 bg-cream/80 backdrop-blur lg:flex">
        <div className="px-5 pt-5 pb-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Dashboard">
          {items.map((i) => navBtn(i))}
        </nav>
        <div className="space-y-3 p-4">
          {plan && (
            <div className="rounded-2xl border border-sand-deep/60 bg-paper p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-bold tracking-[0.14em] text-sage-600 uppercase">{plan.id}</p>
                <Badge tone={status === "active" ? "forest" : status === "paused" ? "amber" : "clay"}>{t(`dash.status.${status ?? "active"}`)}</Badge>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <AnimatedNumber value={app.usedCredits} className="font-display text-[26px] font-semibold text-forest-900" />
                <span className="text-[13px] font-medium text-mute">/ {app.credits} {t("common.credits")}</span>
              </div>
              <Progress value={app.usedCredits} max={app.credits} className="mt-2 h-2" />
            </div>
          )}
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-medium text-clay-600 transition-colors hover:bg-clay-100/60">
            <LogOut className="h-[18px] w-[18px]" />
            {t("sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-[55] flex h-16 items-center justify-between border-b border-sand-deep/50 bg-ivory/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/dashboard/notifications" className="relative rounded-full border border-sand-deep/60 bg-white/70 p-2 text-forest-900" aria-label={t("sidebar.notifications")}>
            <Bell className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            {app.unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-clay-600" />}
          </Link>
          <button type="button" onClick={() => setDrawer(true)} aria-label="Menu" className="rounded-full border border-sand-deep/60 bg-white/70 p-2 text-forest-900">
            <Menu className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="absolute inset-0 bg-forest-950/50" />
            <motion.div initial={rm ? { opacity: 0 } : { x: "-100%" }} animate={rm ? { opacity: 1 } : { x: 0 }} exit={rm ? { opacity: 0 } : { x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute top-0 left-0 flex h-full w-[min(84vw,300px)] flex-col bg-paper shadow-lift" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between border-b border-sand-deep/50 px-5 py-4">
                <Logo />
                <button type="button" onClick={() => setDrawer(false)} aria-label={t("common.close")} className="rounded-full p-2 text-mute hover:bg-sand">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Dashboard mobile">
                {items.map((i, idx) => (
                  <motion.div key={i.to} initial={rm ? { opacity: 0 } : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + idx * 0.04, duration: 0.25 }}>
                    {navBtn(i, false)}
                  </motion.div>
                ))}
                <motion.div initial={rm ? { opacity: 0 } : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.25 }}>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-medium text-clay-600 hover:bg-clay-100/60">
                    <LogOut className="h-[18px] w-[18px]" />
                    {t("sidebar.logout")}
                  </button>
                </motion.div>
              </nav>
              <div className="border-t border-sand-deep/50 p-4">
                <LanguageSwitcher />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-[252px]">
        {status === "pending_payment" && (
          <div className="border-b border-gold-300/50 bg-gold-100 px-4 py-3">
            <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-[13.5px] font-semibold text-gold-600">⚠ {t("dash.pendingNote")}</p>
              <ButtonLink to="/checkout" size="sm" variant="gold">
                {t("checkout.toPayment")}
              </ButtonLink>
            </div>
          </div>
        )}
        {status === "paused" && (
          <div className="border-b border-amberish-100 bg-amberish-100/60 px-4 py-3">
            <p className="mx-auto max-w-[1040px] text-[13.5px] font-semibold text-amberish-600">⏸ {t("subm.pauseNote")}</p>
          </div>
        )}
        <main className="mx-auto max-w-[1040px] px-4 pt-6 pb-28 sm:px-6 lg:pt-10 lg:pb-16">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-[55] border-t border-sand-deep/50 bg-paper/95 backdrop-blur lg:hidden" aria-label="Bottom">
        <div className="grid grid-cols-5">
          {bottomItems.map((i) => navBtn(i, true))}
        </div>
      </nav>
    </div>
  );
}
