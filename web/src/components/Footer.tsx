import { useLanguage } from "../context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="aloqa" className="border-t border-charcoal/10 bg-charcoal text-ivory">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-semibold">KafeFlow</p>
            <p className="mt-3 max-w-xs text-sm text-ivory/60">{t("footer.tagline")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ivory/50">{t("footer.contact")}</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory/70">
              <li>{t("footer.address")}</li>
              <li>+998 90 123 45 67</li>
              <li>hello@kafeflow.uz</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ivory/50">{t("footer.hours.label")}</p>
            <ul className="mt-3 space-y-2 text-sm text-ivory/70">
              <li>{t("footer.hours.value")}</li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-ivory/10 pt-6 text-xs text-ivory/40">
          © {new Date().getFullYear()} KafeFlow. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
