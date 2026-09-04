import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { LanguageSwitcher, Modal } from "../ui";
import { Logo } from "./Header";

type LegalDoc = "privacy" | "terms" | "cookies";

export function Footer() {
  const { t } = useI18n();
  const [doc, setDoc] = useState<LegalDoc | null>(null);

  const nav = [
    { to: "/", label: t("nav.home") },
    { to: "/comment-ca-fonctionne", label: t("nav.how") },
    { to: "/menu", label: t("nav.menu") },
    { to: "/abonnements", label: t("nav.plans") },
    { to: "/a-propos", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const support = [
    { label: t("footer.faq"), to: "/#faq" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const legal: Array<{ id: LegalDoc; label: string }> = [
    { id: "privacy", label: t("footer.privacy") },
    { id: "terms", label: t("footer.terms") },
    { id: "cookies", label: t("footer.cookies") },
  ];

  return (
    <footer className="mt-24 bg-forest-950 text-cream">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-cream/65">{t("footer.tagline")}</p>
            <div className="mt-5">
              <LanguageSwitcher dark />
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="mb-4 text-[12.5px] font-bold tracking-[0.16em] text-sage-400 uppercase">{t("footer.navT")}</p>
            <ul className="space-y-2.5">
              {nav.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[14px] text-cream/75 transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Support">
            <p className="mb-4 text-[12.5px] font-bold tracking-[0.16em] text-sage-400 uppercase">{t("footer.supportT")}</p>
            <ul className="space-y-2.5">
              {support.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[14px] text-cream/75 transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="mb-4 text-[12.5px] font-bold tracking-[0.16em] text-sage-400 uppercase">{t("footer.legalT")}</p>
            <ul className="space-y-2.5">
              {legal.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => setDoc(l.id)} className="text-left text-[14px] text-cream/75 transition-colors hover:text-cream">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/12 pt-6 text-[12.5px] text-cream/50 sm:flex-row">
          <p>© 2026 Commanger.com — {t("footer.rights")}</p>
          <p>{t("footer.made")}</p>
        </div>
      </div>

      <Modal open={doc !== null} onClose={() => setDoc(null)} title={doc ? legal.find((l) => l.id === doc)?.label : undefined}>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          {t("legal.body")}
        </p>
        <p className="mt-3 rounded-xl bg-sage-100 px-4 py-3 text-[12.5px] font-medium text-sage-700">{t("common.demo")} — front-end uniquement.</p>
      </Modal>
    </footer>
  );
}
