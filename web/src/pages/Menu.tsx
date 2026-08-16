import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, MicOff, Plus, ShoppingCart } from "lucide-react";
import { PublicHeader } from "../components/PublicHeader";
import { LoadingState, EmptyState, ErrorState } from "../components/States";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";
import { useCart } from "../context/CartContext";
import type { MenuResponse, Product } from "../lib/types";
import { isVoiceSupported, listenOnce, speak } from "../lib/speech";

export default function Menu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableParam = searchParams.get("stol");
  const tableNumber = tableParam ? Number(tableParam) : null;

  const { setTableNumber, addItem, totalCount, totalPrice } = useCart();

  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Barchasi");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState<string>("");
  const [addedFlash, setAddedFlash] = useState<string | null>(null);

  useEffect(() => {
    if (tableNumber !== null && !Number.isNaN(tableNumber)) {
      setTableNumber(tableNumber);
    }
  }, [tableNumber, setTableNumber]);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMenu();
      setMenu(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const categories = useMemo(() => ["Barchasi", ...(menu?.categories || [])], [menu]);

  const filteredProducts = useMemo(() => {
    const products = menu?.products || [];
    if (activeCategory === "Barchasi") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [menu, activeCategory]);

  const handleAdd = useCallback(
    (product: Product) => {
      addItem(product);
      setAddedFlash(product.id);
      setTimeout(() => setAddedFlash(null), 700);
      if (voiceEnabled) speak(`${product.name} savatga qoʻshildi.`);
    },
    [addItem, voiceEnabled]
  );

  const handleVoiceCommand = useCallback(
    (text: string) => {
      setVoiceMsg(`Eshitildi: "${text}"`);
      if (text.includes("savat") && text.includes("qo")) {
        navigate("/savat");
        return;
      }
      if (text.includes("buyurtma") && text.includes("ber")) {
        navigate("/savat");
        return;
      }
      if (text.includes("menyu")) {
        setActiveCategory("Barchasi");
        return;
      }
      if (text.includes("orqaga")) {
        navigate(-1);
        return;
      }
      const product = (menu?.products || []).find((p) => text.includes(p.name.toLowerCase()));
      if (product) {
        handleAdd(product);
      }
    },
    [menu, navigate, handleAdd]
  );

  const toggleVoice = useCallback(() => {
    if (!isVoiceSupported()) return;
    if (voiceEnabled) {
      setVoiceEnabled(false);
      setVoiceMsg("");
      return;
    }
    setVoiceEnabled(true);
    speak("Ovozli rejim yoqildi.");
    listenOnce(handleVoiceCommand, () => setVoiceMsg("Ovozni tanib boʻlmadi."));
  }, [voiceEnabled, handleVoiceCommand]);

  return (
    <div className="min-h-screen pb-28">
      <PublicHeader
        showVoiceToggle={isVoiceSupported()}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
      />

      <div aria-live="polite" className="sr-only">
        {voiceMsg}
      </div>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {tableNumber !== null && !Number.isNaN(tableNumber) && (
              <p className="mb-2 inline-block rounded-full bg-moss/10 px-4 py-1.5 text-sm font-semibold text-moss">
                STOL №{String(tableNumber).padStart(2, "0")}
              </p>
            )}
            <h1 className="font-display text-4xl font-semibold">Menyu</h1>
          </div>

          {isVoiceSupported() && (
            <button
              onClick={toggleVoice}
              className="focus-ring flex items-center gap-2 rounded-full border border-charcoal/20 px-4 py-2 text-sm font-medium md:hidden"
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              Ovozli rejim
            </button>
          )}
        </div>

        {loading && <LoadingState label="Menyu yuklanmoqda..." />}
        {!loading && error && <ErrorState message={error} onRetry={loadMenu} />}

        {!loading && !error && menu && (
          <>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Kategoriyalar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`focus-ring shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition ${
                    activeCategory === cat
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-charcoal/20 text-charcoal/70 hover:border-charcoal/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                title="Bu kategoriyada mahsulot topilmadi"
                description="Boshqa kategoriyani tanlab koʻring."
              />
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                    }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-white"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-beige/40">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-charcoal/30">
                          Rasm yoʻq
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-display text-lg font-semibold">{product.name}</p>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-charcoal/60">{product.description}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <p className="text-base font-semibold">{formatSum(product.price)}</p>
                        <button
                          onClick={() => handleAdd(product)}
                          disabled={product.active === false}
                          className="focus-ring flex items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-xs font-medium text-ivory transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          {addedFlash === product.id ? "Qoʻshildi!" : "Savatga qoʻshish"}
                        </button>
                      </div>
                      {product.active === false && (
                        <p className="mt-2 text-xs text-red-600">Bu mahsulot hozir mavjud emas.</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>

      {totalCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-charcoal text-ivory"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {totalCount} ta mahsulot · {formatSum(totalPrice)}
            </p>
            <button
              onClick={() => navigate("/savat")}
              className="focus-ring rounded-full bg-ivory px-6 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-beige"
            >
              Savatni koʻrish
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
