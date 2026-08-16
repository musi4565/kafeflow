import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Users, X } from "lucide-react";
import { LoadingState, ErrorState } from "../components/States";
import { OfflineBanner, useOnlineStatus } from "../components/OfflineBanner";
import { PaymentModal } from "../components/PaymentModal";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";
import { getSocket } from "../lib/socket";
import { flushOfflineQueue, queuePayment } from "../lib/offlineQueue";
import { tableStatusColor, tableStatusLabel } from "../lib/labels";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import type { Order, PaymentMethod, TableInfo } from "../lib/types";

export default function Waiter() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { t, language } = useLanguage();

  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payQueuedMsg, setPayQueuedMsg] = useState<string | null>(null);
  const [noShowConfirming, setNoShowConfirming] = useState(false);
  const [noShowSubmitting, setNoShowSubmitting] = useState(false);
  const [noShowError, setNoShowError] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    try {
      const data = await api.getTables();
      setTables(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("waiter.errorFallback"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    const interval = setInterval(loadTables, 15000);
    return () => clearInterval(interval);
  }, [loadTables]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => loadTables();
    socket.on("table:updated", refresh);
    socket.on("order:new", refresh);
    socket.on("order:updated", refresh);
    return () => {
      socket.off("table:updated", refresh);
      socket.off("order:new", refresh);
      socket.off("order:updated", refresh);
    };
  }, [loadTables]);

  useEffect(() => {
    if (online) {
      flushOfflineQueue().then((n) => {
        if (n > 0) {
          setPayQueuedMsg(`${n} ${t("waiter.queuedFlushedMsg")}`);
          loadTables();
          setTimeout(() => setPayQueuedMsg(null), 4000);
        }
      });
    }
  }, [online, loadTables, t]);

  const openTable = async (table: TableInfo) => {
    setSelectedTable(table);
    setOrderDetail(null);
    setPayError(null);
    if (!table.activeOrder) return;
    setDetailLoading(true);
    try {
      const order = await api.getOrder(table.activeOrder.id);
      setOrderDetail(order);
    } catch {
      setOrderDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeTable = () => {
    setSelectedTable(null);
    setOrderDetail(null);
    setPaymentOpen(false);
    setPayError(null);
    setNoShowConfirming(false);
    setNoShowError(null);
  };

  const handleNoShow = async () => {
    if (!orderDetail) return;
    setNoShowSubmitting(true);
    setNoShowError(null);
    try {
      await api.markNoShow(orderDetail.id);
      closeTable();
      loadTables();
    } catch (e) {
      setNoShowError(e instanceof ApiError ? e.message : t("waiter.noShowError"));
      setNoShowConfirming(false);
    } finally {
      setNoShowSubmitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (paymentOpen) setPaymentOpen(false);
        else if (noShowConfirming) setNoShowConfirming(false);
        else if (selectedTable) closeTable();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paymentOpen, selectedTable, noShowConfirming]);

  const handleConfirmPayment = async (method: PaymentMethod) => {
    if (!orderDetail) return;
    setPaySubmitting(true);
    setPayError(null);

    if (!navigator.onLine) {
      queuePayment(orderDetail.id, method);
      setPaySubmitting(false);
      setPaymentOpen(false);
      closeTable();
      setPayQueuedMsg(t("waiter.offlinePayQueued"));
      setTimeout(() => setPayQueuedMsg(null), 5000);
      return;
    }

    try {
      await api.payOrder(orderDetail.id, method);
      setPaymentOpen(false);
      closeTable();
      loadTables();
    } catch (e) {
      setPayError(e instanceof ApiError ? e.message : t("waiter.payError"));
    } finally {
      setPaySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <OfflineBanner />
      <header className="border-b border-charcoal/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-moss" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-semibold">{t("waiter.title")}</h1>
              <p className="text-xs text-charcoal/50">{auth?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => {
                logout();
                navigate("/kirish");
              }}
              className="focus-ring flex items-center gap-2 rounded-full border border-charcoal/20 px-4 py-2 text-sm font-medium hover:border-charcoal/40"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> {t("waiter.logout")}
            </button>
          </div>
        </div>
      </header>

      {payQueuedMsg && (
        <div className="bg-moss/10 px-6 py-2 text-center text-sm text-moss" role="status">
          {payQueuedMsg}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading && <LoadingState label={t("waiter.loading")} />}
        {!loading && error && <ErrorState message={error} onRetry={loadTables} />}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => openTable(table)}
                className={`focus-ring flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition hover:shadow-md ${tableStatusColor(
                  table.status
                )}`}
              >
                <span className="font-display text-2xl font-semibold">
                  {t("waiter.table")}
                  {String(table.number).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">
                  {tableStatusLabel(table.status, language)}
                </span>
                {table.activeOrder && (
                  <span className="text-xs font-medium opacity-70">
                    №{table.activeOrder.code} · {formatSum(table.activeOrder.total)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {selectedTable && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-charcoal/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="table-detail-title"
          onClick={closeTable}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-2xl bg-ivory p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="table-detail-title" className="font-display text-2xl font-semibold">
                {t("waiter.table")}
                {String(selectedTable.number).padStart(2, "0")}
              </h2>
              <button
                onClick={closeTable}
                className="focus-ring rounded-full p-1.5 text-charcoal/60 hover:bg-charcoal/5"
                aria-label={t("waiter.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!selectedTable.activeOrder ? (
              <p className="py-8 text-center text-sm text-charcoal/60">{t("waiter.noActiveOrder")}</p>
            ) : detailLoading ? (
              <LoadingState label={t("waiter.orderLoading")} />
            ) : orderDetail ? (
              <>
                <p className="text-sm text-charcoal/60">
                  {t("waiter.orderNum")}
                  {orderDetail.code}
                </p>
                <ul className="mt-4 divide-y divide-charcoal/10 border-y border-charcoal/10">
                  {orderDetail.items.map((item) => (
                    <li key={item.productId} className="flex justify-between py-2.5 text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatSum(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-medium">{t("waiter.total")}</p>
                  <p className="font-display text-2xl font-semibold">{formatSum(orderDetail.total)}</p>
                </div>

                {orderDetail.status === "PAID" ? (
                  <p className="mt-6 rounded-full bg-moss/10 py-2.5 text-center text-sm font-medium text-moss">
                    {t("waiter.paid")}
                  </p>
                ) : noShowConfirming ? (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm text-red-800">{t("waiter.noShowConfirmQuestion")}</p>
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={handleNoShow}
                        disabled={noShowSubmitting}
                        className="focus-ring flex-1 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        {noShowSubmitting ? t("kitchen.actionSubmitting") : t("waiter.noShowConfirmYes")}
                      </button>
                      <button
                        onClick={() => setNoShowConfirming(false)}
                        disabled={noShowSubmitting}
                        className="focus-ring flex-1 rounded-full border border-charcoal/20 py-2.5 text-sm font-medium hover:border-charcoal/40"
                      >
                        {t("waiter.noShowConfirmNo")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setPaymentOpen(true)}
                      className="focus-ring mt-6 w-full rounded-full bg-charcoal py-3 text-sm font-medium text-ivory transition hover:bg-moss"
                    >
                      {t("waiter.acceptPayment")}
                    </button>
                    <button
                      onClick={() => setNoShowConfirming(true)}
                      className="focus-ring mt-3 w-full rounded-full border border-red-200 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    >
                      {t("waiter.noShowButton")}
                    </button>
                    {noShowError && (
                      <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                        {noShowError}
                      </p>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-red-600">{t("waiter.orderLoadError")}</p>
            )}
          </motion.div>
        </div>
      )}

      {paymentOpen && orderDetail && (
        <PaymentModal
          order={orderDetail}
          onClose={() => setPaymentOpen(false)}
          onConfirm={handleConfirmPayment}
          submitting={paySubmitting}
          errorMessage={payError}
        />
      )}
    </div>
  );
}
