import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { ButtonLink, LanguageSwitcher, useRM } from "../ui";
import { cn } from "../../lib/utils";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Commanger.com">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 shadow-soft transition-transform duration-300 group-hover:rotate-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M4 12a8 8 0 0 0 16 0" stroke="#F5F0E4" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M12 12c0-4 2.6-6.5 6.5-7-0.4 4-2.8 6.6-6.5 7Z" fill="#A4B996" />
          <path d="M12 12c0-3-2-5-5-5.4.3 3.2 2.1 5 5 5.4Z" fill="#F5F0E4" />
        </svg>
      </span>
      <span className={cn("font-display text-[21px] font-semibold tracking-tight", light ? "text-cream" : "text-forest-900")}>
        commanger<span className={light ? "text-sage-400" : "text-sage-600"}>.com</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { t } = useI18n();
  const { user } = useApp();
  const location = useLocation();
  const rm = useRM();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/comment-ca-fonctionne", label: t("nav.how") },
    { to: "/menu", label: t("nav.menu") },
    { to: "/abonnements", label: t("nav.plans") },
    { to: "/a-propos", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-all duration-300",
          scrolled ? "border-b border-sand-deep/60 bg-ivory/88 shadow-[0_8px_30px_-18px_rgb(27_56_38/0.35)] backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className="relative py-2 text-[14px] font-medium text-ink-soft transition-colors duration-200 hover:text-forest-800">
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-[2.5px] rounded-full bg-forest-700" transition={{ type: "spring", stiffness: 480, damping: 38 }} />}
                    <span className={cn(isActive && "font-semibold text-forest-900")}>{l.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <ButtonLink to="/dashboard" size="sm" className="hidden sm:inline-flex">
                {t("nav.dashboard")}
              </ButtonLink>
            ) : (
              <div className="hidden items-center gap-2.5 sm:flex">
                <ButtonLink to="/connexion" variant="ghost" size="sm">
                  {t("nav.login")}
                </ButtonLink>
                <ButtonLink to="/inscription" size="sm" arrow>
                  {t("nav.register")}
                </ButtonLink>
              </div>
            )}
            <button type="button" onClick={() => setOpen(true)} aria-label={t("nav.home")} className="rounded-full border border-sand-deep/70 bg-white/60 p-2 text-forest-900 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-forest-950/50 backdrop-blur-[2px]" />
            <motion.div
              initial={rm ? { opacity: 0 } : { x: "100%" }}
              animate={rm ? { opacity: 1 } : { x: 0 }}
              exit={rm ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute top-0 right-0 flex h-full w-[min(84vw,320px)] flex-col bg-paper shadow-lift"
              role="dialog" aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-sand-deep/50 px-5 py-4">
                <Logo />
                <button type="button" onClick={() => setOpen(false)} aria-label={t("common.close")} className="rounded-full p-2 text-mute hover:bg-sand">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-5" aria-label="Mobile">
                {links.map((l, i) => (
                  <motion.div key={l.to} initial={rm ? { opacity: 0 } : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + i * 0.05, duration: 0.3 }}>
                    <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => cn("block rounded-xl px-4 py-3 text-[15px] font-medium transition-colors", isActive ? "bg-forest-50 font-semibold text-forest-900" : "text-ink-soft hover:bg-sand/60")}>
                      {l.label}
                    </NavLink>
                  </motion.div>
                ))}
                <div className="mt-4 border-t border-sand-deep/50 pt-4">
                  {user ? (
                    <ButtonLink to="/dashboard" className="w-full">
                      {t("nav.dashboard")}
                    </ButtonLink>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <ButtonLink to="/inscription" className="w-full">
                        {t("nav.register")}
                      </ButtonLink>
                      <ButtonLink to="/connexion" variant="outline" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        {t("nav.login")}
                      </ButtonLink>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
