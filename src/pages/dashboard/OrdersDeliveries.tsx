import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Truck } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApp } from "../../store/AppContext";
import { Badge, ButtonLink, Card, EmptyState, Skeleton, Tabs } from "../../components/ui";
import { DeliveryCard, MealCategoryBadge } from "../../components/product";
import { mockOrders, mockUpcomingDeliveries, MOCK_HISTORY_DELIVERIES } from "../../mock/data";
import { cn } from "../../lib/utils";
import type { Order } from "../../types";

const orderTone: Record<Order["status"], "forest" | "sage" | "sand" | "clay"> = {
  confirmed: "forest",
  in_preparation: "sage",
  delivered: "sand",
  cancelled: "clay",
};

function OrderCard({ order }: { order: Order }) {
  const { t, L, date } = useI18n();
  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <img src={order.meal.image} alt="" className="h-20 w-full shrink-0 rounded-xl object-cover sm:h-16 sm:w-24" loading="lazy" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <MealCategoryBadge category={order.meal.category} />
          <Badge tone={orderTone[order.status]}>{t(`orders.s.${order.status}`)}</Badge>
        </div>
        <p className="mt-1.5 truncate font-display text-[16px] font-semibold text-forest-950">{L(order.meal.name)}</p>
        <p className="mt-0.5 text-[12.5px] font-medium text-mute">
          {date(order.date)} · {t("orders.delivery")} 11h00 – 13h00 · × {order.quantity}
        </p>
      </div>
      <span className="shrink-0 text-[12px] font-bold tracking-wide text-mute uppercase">{order.id}</span>
    </Card>
  );
}

export function OrdersPage() {
  const { t } = useI18n();
  const app = useApp();
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(id);
  }, []);
  const { upcoming, past } = mockOrders();
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("orders.title")}</h1>
          <p className="mt-1 text-[14px] text-mute">{t("orders.sub")}</p>
        </div>
        <Tabs id="orders" active={tab} onChange={setTab} items={[
          { id: "upcoming", label: t("orders.upcoming"), count: upcoming.length },
          { id: "past", label: t("orders.past"), count: past.length },
        ]} />
      </div>
      <div className="mt-6 space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : list.length === 0 ? (
          <EmptyState icon={<PackageOpen className="h-6 w-6" />} title={t("orders.empty")} description={t("orders.emptyD")}
            action={<ButtonLink to="/dashboard/semaine" size="sm">{t("dash.q1")}</ButtonLink>} />
        ) : (
          <AnimatePresence mode="popLayout">
            {list.map((o) => (
              <motion.div key={o.id + tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <OrderCard order={o} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      {tab === "upcoming" && !loading && upcoming.length === 0 && app.remainingCredits > 0 && (
        <p className="mt-4 text-center text-[13px] font-medium text-mute">{t("states.noMeals")}</p>
      )}
    </div>
  );
}

export function DeliveriesPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(id);
  }, []);
  const upcoming = mockUpcomingDeliveries();
  const list = tab === "upcoming" ? upcoming : MOCK_HISTORY_DELIVERIES;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-semibold text-forest-950">{t("deliv.title")}</h1>
          <p className="mt-1 text-[14px] text-mute">{t("deliv.sub")}</p>
        </div>
        <Tabs id="deliv" active={tab} onChange={setTab} items={[
          { id: "upcoming", label: t("deliv.upcoming"), count: upcoming.length },
          { id: "history", label: t("deliv.history"), count: MOCK_HISTORY_DELIVERIES.length },
        ]} />
      </div>
      <div className={cn("mt-6 space-y-4")}>
        {loading ? (
          <>
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </>
        ) : list.length === 0 ? (
          <EmptyState icon={<Truck className="h-6 w-6" />} title={t("deliv.empty")} description={t("deliv.emptyD")}
            action={<ButtonLink to="/dashboard/semaine" size="sm">{t("dash.q1")}</ButtonLink>} />
        ) : (
          list.map((d) => <DeliveryCard key={d.id + tab} delivery={d} />)
        )}
      </div>
    </div>
  );
}
