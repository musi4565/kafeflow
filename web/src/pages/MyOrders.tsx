import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicHeader } from "../components/PublicHeader";
import { LoadingState, EmptyState } from "../components/States";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";
import { formatSum } from "../lib/format";
import { orderStatusColor, orderStatusLabel } from "../lib/labels";
import { getSocket } from "../lib/socket";
import type { Order } from "../lib/types";

export default function MyOrders() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { myOrderIds } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (myOrderIds.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const results = await Promise.all(
      myOrderIds.map(async (id) => {
        try {
          return await api.getOrder(id);
        } catch {
          return null;
        }
      })
    );
    setOrders(results.filter((o): o is Order => !!o));
    setLoading(false);
  }, [myOrderIds]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => loadOrders();
    socket.on("order:updated", refresh);
    return () => {
      socket.off("order:updated", refresh);
    };
  }, [loadOrders]);

  return (
    <div className="min-h-screen pb-16">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-4xl font-semibold">{t("myOrders.title")}</h1>

        {loading && <LoadingState label={t("myOrders.loading")} />}

        {!loading && orders.length === 0 && (
          <div className="mt-8">
            <EmptyState title={t("myOrders.emptyTitle")} description={t("myOrders.emptyDesc")} />
            <div className="text-center">
              <button
                onClick={() => navigate("/menyu")}
                className="focus-ring rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-ivory hover:bg-moss"
              >
                {t("myOrders.goToMenu")}
              </button>
            </div>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mt-8 flex flex-col gap-4"
          >
            {orders.map((order) => (
              <motion.li
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              >
                <button
                  onClick={() => navigate(`/buyurtma/${order.id}`)}
                  className="focus-ring flex w-full items-center justify-between rounded-2xl border border-charcoal/10 bg-white p-5 text-left transition hover:border-charcoal/25"
                >
                  <div>
                    <p className="font-display text-lg font-semibold">№{order.code}</p>
                    <p className="mt-1 text-sm text-charcoal/60">
                      {t("myOrders.table")}
                      {String(order.tableNumber).padStart(2, "0")} · {formatSum(order.total)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusColor(order.status)}`}
                  >
                    {orderStatusLabel(order.status, language)}
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </main>
    </div>
  );
}
