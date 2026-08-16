import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { LoadingState, EmptyState, ErrorState } from "../components/States";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";
import { getSocket } from "../lib/socket";
import type { Order } from "../lib/types";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

interface OrderCardProps {
  order: Order;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  finalLabel?: string;
}

function OrderCard({ order, actionLabel, onAction, actionLoading, finalLabel }: OrderCardProps) {
  const { t } = useLanguage();
  const tableNum = order.table ?? order.tableNumber;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">№{order.code}</p>
        <span className="rounded-full bg-beige px-3 py-1 text-xs font-semibold">
          {t("kitchen.table")}
          {String(tableNum).padStart(2, "0")}
        </span>
      </div>
      <ul className="mt-4 space-y-1.5">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between text-sm text-charcoal/80">
            <span>{item.name}</span>
            <span className="font-medium">×{item.quantity}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-charcoal/50">
        {t("kitchen.total")} {formatSum(order.total)}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          disabled={actionLoading}
          className="focus-ring mt-5 w-full rounded-full bg-charcoal py-2.5 text-sm font-medium text-ivory transition hover:bg-moss disabled:opacity-60"
        >
          {actionLoading ? t("kitchen.actionSubmitting") : actionLabel}
        </button>
      )}
      {finalLabel && (
        <p className="mt-5 rounded-full bg-moss/10 py-2.5 text-center text-sm font-medium text-moss">
          {finalLabel}
        </p>
      )}
    </motion.div>
  );
}

export default function Kitchen() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const active = await api.getOrders(["NEW", "PREPARING", "READY"]);
      setOrders(active);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("kitchen.errorFallback"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => loadOrders();
    socket.on("order:new", refresh);
    socket.on("order:updated", refresh);
    socket.on("table:updated", refresh);
    return () => {
      socket.off("order:new", refresh);
      socket.off("order:updated", refresh);
      socket.off("table:updated", refresh);
    };
  }, [loadOrders]);

  const updateStatus = async (id: string, status: "PREPARING" | "READY") => {
    setBusyId(id);
    try {
      await api.updateOrderStatus(id, status);
      await loadOrders();
    } catch {
      setError(t("kitchen.statusUpdateError"));
    } finally {
      setBusyId(null);
    }
  };

  const newOrders = orders.filter((o) => o.status === "NEW");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");

  const columns = [
    {
      title: t("kitchen.col.new"),
      list: newOrders,
      render: (o: Order) => (
        <OrderCard
          key={o.id}
          order={o}
          actionLabel={t("kitchen.actionStart")}
          actionLoading={busyId === o.id}
          onAction={() => updateStatus(o.id, "PREPARING")}
        />
      ),
    },
    {
      title: t("kitchen.col.preparing"),
      list: preparingOrders,
      render: (o: Order) => (
        <OrderCard
          key={o.id}
          order={o}
          actionLabel={t("kitchen.actionReady")}
          actionLoading={busyId === o.id}
          onAction={() => updateStatus(o.id, "READY")}
        />
      ),
    },
    {
      title: t("kitchen.col.ready"),
      list: readyOrders,
      render: (o: Order) => <OrderCard key={o.id} order={o} finalLabel={t("kitchen.servedLabel")} />,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-charcoal/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-moss" aria-hidden="true" />
            <h1 className="font-display text-2xl font-semibold">{t("kitchen.title")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading && <LoadingState label={t("kitchen.loading")} />}
        {!loading && error && <ErrorState message={error} onRetry={loadOrders} />}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-3">
            {columns.map((col) => (
              <section key={col.title} aria-label={col.title}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{col.title}</h2>
                  <span className="rounded-full bg-beige px-2.5 py-0.5 text-xs font-semibold text-charcoal/70">
                    {col.list.length}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {col.list.length === 0 ? (
                    <EmptyState title={t("kitchen.empty")} />
                  ) : (
                    col.list.map((o) => col.render(o))
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
