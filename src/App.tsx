import { useEffect } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { I18nProvider, useI18n } from "./i18n";
import { AppProvider, useApp } from "./store/AppContext";
import { ButtonLink, Container, Toasts } from "./components/ui";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Home from "./pages/public/Home";
import HowItWorks from "./pages/public/HowItWorks";
import MenuPage from "./pages/public/MenuPage";
import Subscriptions from "./pages/public/Subscriptions";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import MealDetailPage from "./pages/MealDetail";
import { ForgotPage, LoginPage, ResetPage } from "./pages/auth/AuthPages";
import Register from "./pages/auth/Register";
import { CheckoutPage, FailPage, PaymentPage, SuccessPage } from "./pages/checkout/Checkout";
import Overview from "./pages/dashboard/Overview";
import Week from "./pages/dashboard/Week";
import DashMenu from "./pages/dashboard/DashMenu";
import { DeliveriesPage, OrdersPage } from "./pages/dashboard/OrdersDeliveries";
import { BoxPage, SubscriptionPage } from "./pages/dashboard/SubscriptionBox";
import Account from "./pages/dashboard/Account";
import Notifications from "./pages/dashboard/Notifications";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <Header />
      <main className="pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function NotFound() {
  const { t } = useI18n();
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-[64px] leading-none font-semibold text-sage-300">404</p>
      <h1 className="font-display mt-3 text-[26px] font-semibold text-forest-950">{t("notfound.t")}</h1>
      <p className="mt-2 text-[14px] text-mute">{t("notfound.d")}</p>
      <div className="mt-7">
        <ButtonLink to="/" arrow>
          {t("notfound.home")}
        </ButtonLink>
      </div>
    </Container>
  );
}

function RequireAuth() {
  // Lightweight guard used for checkout routes.
  const { user } = useApp();
  if (!user) return <Navigate to="/inscription" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/comment-ca-fonctionne" element={<HowItWorks />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/menu/:mealId" element={<MealDetailPage />} />
              <Route path="/abonnements" element={<Subscriptions />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPage />} />
              <Route path="/nouveau-mot-de-passe" element={<ResetPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/paiement" element={<PaymentPage />} />
              <Route path="/checkout/succes" element={<SuccessPage />} />
              <Route path="/checkout/echec" element={<FailPage />} />
            </Route>

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="menu" element={<DashMenu />} />
              <Route path="menu/:mealId" element={<MealDetailPage />} />
              <Route path="semaine" element={<Week />} />
              <Route path="commandes" element={<OrdersPage />} />
              <Route path="livraisons" element={<DeliveriesPage />} />
              <Route path="abonnement" element={<SubscriptionPage />} />
              <Route path="box" element={<BoxPage />} />
              <Route path="compte" element={<Account />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toasts />
        </HashRouter>
      </AppProvider>
    </I18nProvider>
  );
}
