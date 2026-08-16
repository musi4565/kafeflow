import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { LoadingState, EmptyState, ErrorState } from "../components/States";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";
import { getSocket } from "../lib/socket";
import type { Order } from "../lib/types";

interface OrderCardProps {
  order: Order;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  finalLabel?: string;
}

function OrderCard({ order, actionLabel, onAction, actionLoading, finalLabel }: OrderCardProps) {
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
          Stol №{String(tableNum).padStart(2, "0")}
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
      <p className="mt-3 text-xs text-charcoal/50">Jami: {formatSum(order.total)}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          disabled={actionLoading}
          className="focus-ring mt-5 w-full rounded-full bg-charcoal py-2.5 text-sm font-medium text-ivory transition hover:bg-moss disabled:opacity-60"
        >
          {actionLoading ? "Yuborilmoqda..." : actionLabel}
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
      setError(e instanceof ApiError ? e.message : "Buyurtmalarni yuklab boʻlmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

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
      setError("Holatni yangilab boʻlmadi. Qayta urinib koʻring.");
    } finally {
      setBusyId(null);
    }
  };

  const newOrders = orders.filter((o) => o.status === "NEW");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");

  const columns = [
    {
      title: "Yangi",
      list: newOrders,
      render: (o: Order) => (
        <OrderCard
          key={o.id}
          order={o}
          actionLabel="Tayyorlashni boshlash"
          actionLoading={busyId === o.id}
          onAction={() => updateStatus(o.id, "PREPARING")}
        />
      ),
    },
    {
      title: "Tayyorlanmoqda",
      list: preparingOrders,
      render: (o: Order) => (
        <OrderCard
          key={o.id}
          order={o}
          actionLabel="Tayyor"
          actionLoading={busyId === o.id}
          onAction={() => updateStatus(o.id, "READY")}
        />
      ),
    },
    {
      title: "Tayyor",
      list: readyOrders,
      render: (o: Order) => <OrderCard key={o.id} order={o} finalLabel="Mijozga berildi" />,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-charcoal/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
          <ChefHat className="h-6 w-6 text-moss" aria-hidden="true" />
          <h1 className="font-display text-2xl font-semibold">Oshxona</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading && <LoadingState label="Buyurtmalar yuklanmoqda..." />}
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
                    <EmptyState title="Hozircha boʻsh" />
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
