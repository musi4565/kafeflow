import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";
import { PublicHeader } from "../components/PublicHeader";
import { LoadingState, EmptyState, ErrorState } from "../components/States";
import { api, ApiError } from "../lib/api";
import { formatSum } from "../lib/format";
import { useCart } from "../context/CartContext";
import type { MenuResponse, Product } from "../lib/types";
import { speak } from "../lib/speech";
import { useLanguage } from "../context/LanguageContext";
import { matchesVoiceKeyword, voiceLangCode } from "../lib/translations";
import { VOICE_COMMAND_EVENT, useVoice } from "../context/VoiceContext";

const ALL_CATEGORY = "__ALL__";

export default function Menu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { voiceEnabled } = useVoice();
  const tableParam = searchParams.get("stol");
  const tableNumber = tableParam ? Number(tableParam) : null;

  const { setTableNumber, addItem, totalCount, totalPrice } = useCart();

  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
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
      setError(e instanceof ApiError ? e.message : t("menu.errorFallback"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const categories = useMemo(() => [ALL_CATEGORY, ...(menu?.categories || [])], [menu]);

  const filteredProducts = useMemo(() => {
    const products = menu?.products || [];
    if (activeCategory === ALL_CATEGORY) return products;
    return products.filter((p) => p.category === activeCategory);
  }, [menu, activeCategory]);

  const handleAdd = useCallback(
    (product: Product) => {
      addItem(product);
      setAddedFlash(product.id);
      setTimeout(() => setAddedFlash(null), 700);
      if (voiceEnabled) {
        speak(`${product.name} ${t("voice.addedToCartSuffix")}`, voiceLangCode(language));
      }
    },
    [addItem, t, language, voiceEnabled]
  );

  // Per-page voice command handling: subscribe to the global recognizer's events.
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<{ text: string }>).detail?.text || "";
      if (!text) return;
      setVoiceMsg(`${t("voice.heardPrefix")} "${text}"`);
      const lower = text.toLowerCase();

      if (matchesVoiceKeyword(lower, language, "cart") || matchesVoiceKeyword(lower, language, "order")) {
        navigate("/savat");
        return;
      }

      const product = (menu?.products || []).find((p) => lower.includes(p.name.toLowerCase()));
      if (product) {
        handleAdd(product);
      }
    };
    window.addEventListener(VOICE_COMMAND_EVENT, handler);
    return () => window.removeEventListener(VOICE_COMMAND_EVENT, handler);
  }, [menu, navigate, handleAdd, t, language]);

  return (
    <div className="min-h-screen pb-28">
      <PublicHeader />

      <div aria-live="polite" className="sr-only">
        {voiceMsg}
      </div>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {tableNumber !== null && !Number.isNaN(tableNumber) && (
              <p className="mb-2 inline-block rounded-full bg-moss/10 px-4 py-1.5 text-sm font-semibold text-moss">
                {t("menu.table")}
                {String(tableNumber).padStart(2, "0")}
              </p>
            )}
            <h1 className="font-display text-4xl font-semibold">{t("menu.title")}</h1>
          </div>
        </div>

        {loading && <LoadingState label={t("menu.loading")} />}
        {!loading && error && <ErrorState message={error} onRetry={loadMenu} />}

        {!loading && !error && menu && (
          <>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label={t("menu.categoriesAria")}>
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
                  {cat === ALL_CATEGORY ? t("menu.categoryAll") : cat}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState title={t("menu.emptyTitle")} description={t("menu.emptyDesc")} />
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
                          {t("menu.noImage")}
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
                          {addedFlash === product.id ? t("menu.added") : t("menu.add")}
                        </button>
                      </div>
                      {product.active === false && (
                        <p className="mt-2 text-xs text-red-600">{t("menu.unavailable")}</p>
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
              {totalCount} {t("menu.itemsUnit")} · {formatSum(totalPrice)}
            </p>
            <button
              onClick={() => navigate("/savat")}
              className="focus-ring rounded-full bg-ivory px-6 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-beige"
            >
              {t("menu.viewCart")}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
