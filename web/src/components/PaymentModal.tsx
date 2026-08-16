import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Banknote, CreditCard, Smartphone, X } from "lucide-react";
import { formatSum } from "../lib/format";
import type { Order, PaymentMethod } from "../lib/types";

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => Promise<void> | void;
  submitting?: boolean;
  errorMessage?: string | null;
}

const methods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Naqd pul", icon: Banknote },
  { value: "CARD", label: "Karta", icon: CreditCard },
  { value: "ONLINE", label: "Onlayn", icon: Smartphone },
];

export function PaymentModal({ order, onClose, onConfirm, submitting, errorMessage }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-ivory p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="payment-modal-title" className="font-display text-2xl font-semibold">
            Toʻlov
          </h2>
          <button
            onClick={onClose}
            className="focus-ring rounded-full p-1.5 text-charcoal/60 hover:bg-charcoal/5"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-charcoal/60">Buyurtma №{order.code}</p>
        <p className="mt-1 font-display text-3xl font-semibold">{formatSum(order.total)}</p>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-medium text-charcoal/70">Toʻlov usulini tanlang</legend>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((m) => {
              const Icon = m.icon;
              const active = method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`focus-ring flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-medium transition ${
                    active
                      ? "border-moss bg-moss/10 text-moss"
                      : "border-charcoal/15 text-charcoal/70 hover:border-charcoal/30"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          onClick={() => onConfirm(method)}
          disabled={submitting}
          className="focus-ring mt-6 w-full rounded-full bg-charcoal py-3 text-sm font-medium text-ivory transition hover:bg-moss disabled:opacity-60"
        >
          {submitting ? "Yuborilmoqda..." : "Toʻlovni tasdiqlash"}
        </button>
      </motion.div>
    </div>
  );
}
