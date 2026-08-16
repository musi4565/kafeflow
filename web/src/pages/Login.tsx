import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      login(res);
      navigate(res.role === "OWNER" ? "/egasi" : "/ofitsiant");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("login.errorFallback"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        <div className="mb-8 text-center">
          <Coffee className="mx-auto h-8 w-8 text-moss" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-semibold">KafeFlow</h1>
          <p className="mt-1 text-sm text-charcoal/60">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-charcoal/10 bg-white p-7">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {t("login.email")}
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring rounded-lg border border-charcoal/20 px-4 py-2.5 text-sm"
                placeholder="email@kafeflow.uz"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              {t("login.password")}
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring rounded-lg border border-charcoal/20 px-4 py-2.5 text-sm"
                placeholder="••••••"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3 text-sm font-medium text-ivory transition hover:bg-moss disabled:opacity-60"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-charcoal/40">{t("login.demoHint")}</p>
      </motion.div>
    </div>
  );
}
