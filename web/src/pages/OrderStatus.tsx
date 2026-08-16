import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, Send } from "lucide-react";
import { PublicHeader } from "../components/PublicHeader";
import { LoadingState, ErrorState } from "../components/States";
import { api, ApiError } from "../lib/api";
import { formatCountdown, formatSum } from "../lib/format";
import { getSocket } from "../lib/socket";
import type { Order } from "../lib/types";
import { useLanguage } from "../context/LanguageContext";
import type { TranslationKey } from "../lib/translations";

function stepIndex(status: Order["status"]): number {
  switch (status) {
    case "NEW":
      return 0;
    case "PREPARING":
      return 1;
    case "READY":
      return 2;
    case "PAID":
      return 4;
    default:
      return 0;
  }
}

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const TIMELINE: { key: string; labelKey: TranslationKey }[] = [
    { key: "NEW", labelKey: "orderStatus.timeline.new" },
    { key: "PREPARING", labelKey: "orderStatus.timeline.preparing" },
    { key: "READY", labelKey: "orderStatus.timeline.ready" },
    { key: "WAITING_PAYMENT", labelKey: "orderStatus.timeline.waitingPayment" },
    { key: "PAID", labelKey: "orderStatus.timeline.paid" },
  ];

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const lastStatus = useRef<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getOrder(id);
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("orderStatus.notFound"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    const onUpdate = (payload: Order | { id: string }) => {
      if (payload && "id" in payload && payload.id === id) {
        loadOrder();
      }
    };
    socket.on("order:updated", onUpdate);
    socket.on("order:new", onUpdate);
    return () => {
      socket.off("order:updated", onUpdate);
      socket.off("order:new", onUpdate);
    };
  }, [id, loadOrder]);

  useEffect(() => {
    if (!order) return;
    if (lastStatus.current && lastStatus.current !== order.status) {
      const messages: Partial<Record<Order["status"], TranslationKey>> = {
        PREPARING: "orderStatus.speakPreparing",
        READY: "orderStatus.speakReady",
        PAID: "orderStatus.speakPaid",
        CANCELLED: "orderStatus.speakCancelled",
      };
      const key = messages[order.status];
      if (key) {
        setLiveMessage(t(key));
      }
    }
    lastStatus.current = order.status;
  }, [order, t]);

  const handleCancel = useCallback(async () => {
    if (!id) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await api.cancelOrder(id);
      setOrder(updated);
      setLiveMessage(t("orderStatus.cancelledLive"));
    } catch (e) {
      setCancelError(e instanceof ApiError ? e.message : t("orderStatus.cancelErrorFallback"));
    } finally {
      setCancelling(false);
    }
  }, [id, t]);

  const deadline = order?.cancelDeadline ? new Date(order.cancelDeadline).getTime() : null;
  const msRemaining = deadline ? deadline - now : 0;
  const timerExpired = deadline ? msRemaining <= 0 : true;
  const canCancel = order?.status === "NEW" && order?.canCancel !== false && !timerExpired;

  if (loading) {
    return (
      <div>
        <PublicHeader />
        <LoadingState label={t("orderStatus.loading")} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <PublicHeader />
        <ErrorState message={error || t("orderStatus.notFound")} onRetry={loadOrder} />
      </div>
    );
  }

  const currentStep = order.status === "CANCELLED" ? -1 : stepIndex(order.status);
  const tableNum = order.table ?? order.tableNumber;

  return (
    <div className="min-h-screen pb-16">
      <PublicHeader />
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-moss/10 px-4 py-1.5 text-sm font-semibold text-moss">
            <Check className="h-4 w-4" aria-hidden="true" /> {t("orderStatus.accepted")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold">
            {t("orderStatus.orderNum")}
            {order.code}
          </h1>
          <p className="mt-2 text-charcoal/60">
            {t("orderStatus.table")}
            {String(tableNum).padStart(2, "0")} · {t("orderStatus.total")} {formatSum(order.total)}
          </p>
          <a
            href="https://t.me/KafeFlowBot"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-medium text-charcoal transition hover:border-charcoal/40"
          >
            <Send className="h-4 w-4" aria-hidden="true" /> {t("orderStatus.telegramCta")}
          </a>
        </motion.div>

        {order.status === "NEW" && (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-charcoal/10 bg-white p-8 text-center">
            <p className="text-sm font-medium text-charcoal/60">{t("orderStatus.cancelTimeLabel")}</p>
            <p className="mt-2 font-display text-5xl font-semibold tabular-nums">
              {timerExpired ? "00:00" : formatCountdown(msRemaining)}
            </p>

            {canCancel ? (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="focus-ring mt-6 rounded-full border border-red-300 px-6 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                {cancelling ? t("orderStatus.cancelling") : t("orderStatus.cancelButton")}
              </button>
            ) : (
              <p className="mt-6 flex items-center gap-2 text-sm font-medium text-charcoal/50">
                <Lock className="h-4 w-4" aria-hidden="true" /> {t("orderStatus.cancelExpired")}
              </p>
            )}

            {cancelError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                {cancelError}
              </p>
            )}
          </div>
        )}

        {order.status === "CANCELLED" ? (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {t("orderStatus.cancelledOrderMsg")}
          </div>
        ) : (
          <div className="mt-12">
            <h2 className="sr-only">{t("orderStatus.statusHeading")}</h2>
            <ol className="flex flex-col gap-0">
              {TIMELINE.map((step, idx) => {
                const done = idx < currentStep || order.status === "PAID";
                const active = idx === currentStep && order.status !== "PAID";
                return (
                  <li key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                          done
                            ? "border-moss bg-moss text-ivory"
                            : active
                              ? "border-moss text-moss"
                              : "border-charcoal/20 text-charcoal/30"
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" aria-hidden="true" /> : idx + 1}
                      </span>
                      {idx < TIMELINE.length - 1 && (
                        <span
                          className={`h-10 w-0.5 ${done ? "bg-moss" : "bg-charcoal/15"}`}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="pb-8 pt-1">
                      <p
                        className={`text-sm font-medium ${
                          done || active ? "text-charcoal" : "text-charcoal/40"
                        }`}
                      >
                        {t(step.labelKey)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-charcoal/10 p-6">
          <p className="mb-4 text-sm font-semibold text-charcoal/60">{t("orderStatus.contentsTitle")}</p>
          <ul className="divide-y divide-charcoal/10">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatSum(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/menyu")}
            className="focus-ring rounded-full border border-charcoal/20 px-6 py-3 text-sm font-medium hover:border-charcoal/40"
          >
            {t("orderStatus.newOrderButton")}
          </button>
        </div>
      </main>
    </div>
  );
}
