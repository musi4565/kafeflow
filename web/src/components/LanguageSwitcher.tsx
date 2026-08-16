import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../lib/translations";
import { LANGUAGES } from "../lib/translations";

const NATIVE_NAMES: Record<Language, string> = {
  uz: "Oʻzbekcha",
  ru: "Русский",
  en: "English",
};

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("header.lang.aria")}
      className={`flex items-center gap-0.5 rounded-full border border-charcoal/20 p-0.5 ${className}`}
    >
      {LANGUAGES.map((code) => {
        const active = language === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            aria-label={NATIVE_NAMES[code]}
            title={NATIVE_NAMES[code]}
            className={`focus-ring rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
              active ? "bg-charcoal text-ivory" : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
