import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CheckCheck } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Button, EmptyState, Skeleton, Tabs } from "../../components/ui";
import { NotificationCard } from "../../components/product";
import type { NotifCategory } from "../../types";

const CATS: NotifCategory[] = ["menu", "selection", "delivery", "payment", "subscription"];

export default function Notifications() {
  const { t } = useI18n();
  const app = useApp();
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  const filtered = tab === "all" ? app.notifications : app.notifications.filter((n) => n.category === tab);
  const countFor = (c: NotifCategory) => app.notifications.filter((n) => n.category === c && !n.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("notif.title")}</h1>
          <p className="mt-1 text-[14px] text-mute">
            {t("notif.sub")}
            {app.unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-clay-100 px-2 py-0.5 text-[11.5px] font-bold text-clay-700">
                {app.unreadCount} {t("notif.unread")}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { app.markAllRead(); app.toast(t("account.savedToast"), "info"); }} disabled={app.unreadCount === 0}>
          <CheckCheck className="h-4 w-4" /> {t("notif.markAll")}
        </Button>
      </div>

      <div className="mt-6">
        <Tabs
          id="notif"
          active={tab}
          onChange={setTab}
          items={[
            { id: "all", label: t("notif.all"), count: app.notifications.filter((n) => !n.read).length },
            ...CATS.map((c) => ({ id: c, label: t(`notif.cats.${c}`), count: countFor(c) })),
          ]}
        />
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<BellRing className="h-6 w-6" />} title={t("notif.empty")} description={t("notif.emptyD")} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((n) => (
              <motion.div key={n.id + tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <NotificationCard n={n} onRead={() => app.markRead(n.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
