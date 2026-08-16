import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, ShoppingCart, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

function CartButton({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { totalCount } = useCart();

  return (
    <button
      onClick={() => {
        onNavigate?.();
        navigate("/savat");
      }}
      className="focus-ring relative rounded-full border border-charcoal/20 p-2.5 text-charcoal/80 transition hover:bg-charcoal hover:text-ivory"
      aria-label={t("header.cart.aria")}
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      {totalCount > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-moss px-1 text-[10px] font-bold text-ivory"
          aria-hidden="true"
        >
          {totalCount}
        </span>
      )}
    </button>
  );
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const links = [
    { label: t("header.menu"), href: "/menyu" },
    { label: t("header.about"), href: "/#biz-haqimizda" },
    { label: t("header.order"), href: "/buyurtmalarim" },
    { label: t("header.contact"), href: "/#aloqa" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="focus-ring rounded font-display text-2xl font-semibold tracking-tight">
          KafeFlow
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={t("header.nav.aria")}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="focus-ring rounded text-sm font-medium text-charcoal/80 transition hover:text-charcoal"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <CartButton />
          <button
            onClick={() => navigate("/menyu")}
            className="focus-ring rounded-full bg-charcoal px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-moss"
          >
            {t("header.orderButton")}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartButton />
          <button
            className="focus-ring rounded p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("header.menuClose") : t("header.menuOpen")}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-charcoal/10 bg-ivory px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label={t("header.nav.mobile.aria")}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded text-sm font-medium text-charcoal/80"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 flex items-center gap-3">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/menyu");
              }}
              className="focus-ring mt-2 w-full rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-ivory"
            >
              {t("header.orderButton")}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
