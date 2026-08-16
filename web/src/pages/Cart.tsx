import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { PublicHeader } from "../components/PublicHeader";
import { EmptyState } from "../components/States";
import { useCart } from "../context/CartContext";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";

export default function Cart() {
  const navigate = useNavigate();
  const { items, tableNumber, incrementItem, decrementItem, removeItem, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!tableNumber) {
      setError("Stol raqami aniqlanmadi. Iltimos, QR-kod orqali qayta kiring.");
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.createOrder(
        tableNumber,
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      clearCart();
      navigate(`/buyurtma/${order.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Buyurtma yuborilmadi. Qayta urinib koʻring.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <button
          onClick={() => navigate(-1)}
          className="focus-ring mb-6 flex items-center gap-2 text-sm font-medium text-charcoal/60 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Orqaga
        </button>

        <h1 className="font-display text-4xl font-semibold">Buyurtmangiz</h1>
        {tableNumber !== null && (
          <p className="mt-2 text-sm text-charcoal/60">STOL №{String(tableNumber).padStart(2, "0")}</p>
        )}

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Savat boʻsh"
              description="Menyudan mahsulot tanlab, savatga qoʻshing."
            />
            <div className="text-center">
              <button
                onClick={() => navigate("/menyu")}
                className="focus-ring rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-ivory hover:bg-moss"
              >
                Menyuga oʻtish
              </button>
            </div>
          </div>
        ) : (
          <>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="mt-8 divide-y divide-charcoal/10 border-y border-charcoal/10"
            >
              {items.map((item) => (
                <motion.li
                  key={item.productId}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="flex items-center gap-4 py-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-charcoal/60">{formatSum(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-charcoal/15 px-2 py-1">
                    <button
                      onClick={() => decrementItem(item.productId)}
                      className="focus-ring rounded-full p-1.5 hover:bg-charcoal/5"
                      aria-label={`${item.name} sonini kamaytirish`}
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => incrementItem(item.productId)}
                      className="focus-ring rounded-full p-1.5 hover:bg-charcoal/5"
                      aria-label={`${item.name} sonini oshirish`}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="w-24 shrink-0 text-right text-sm font-semibold">
                    {formatSum(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="focus-ring rounded-full p-2 text-charcoal/40 hover:bg-red-50 hover:text-red-600"
                    aria-label={`${item.name} savatdan oʻchirish`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-lg font-medium">Jami</p>
              <p className="font-display text-3xl font-semibold">{formatSum(totalPrice)}</p>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="focus-ring mt-8 w-full rounded-full bg-charcoal py-4 text-base font-medium text-ivory transition hover:bg-moss disabled:opacity-60"
            >
              {submitting ? "Yuborilmoqda..." : "Buyurtma berish"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
