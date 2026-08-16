import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { isQrScanSupported } from "../lib/qr";
import { api, ApiError } from "../lib/api";
import { QrScanner } from "./QrScanner";

interface TableGateProps {
  onSelect: (tableNumber: number) => void;
}

export function TableGate({ onSelect }: TableGateProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [checking, setChecking] = useState(false);

  // A table is only free to claim if no one else already has an active order
  // on it — prevents two different customers from ending up on the same table.
  const selectTable = async (n: number) => {
    setChecking(true);
    setError(null);
    try {
      const tables = await api.getTables();
      const table = tables.find((tb) => tb.number === n);
      if (table && table.status !== "AVAILABLE") {
        setError(t("tableGate.occupied"));
        return;
      }
      onSelect(n);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("tableGate.checkError"));
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      setError(t("tableGate.invalidNumber"));
      return;
    }
    selectTable(n);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mt-10 max-w-sm rounded-2xl border border-charcoal/10 bg-white p-7 text-center"
    >
      <QrCode className="mx-auto h-8 w-8 text-moss" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold">{t("tableGate.title")}</h1>
      <p className="mt-2 text-sm text-charcoal/60">{t("tableGate.subtitle")}</p>

      {isQrScanSupported() && (
        <button
          onClick={() => setScanning(true)}
          disabled={checking}
          className="focus-ring mt-6 w-full rounded-full bg-charcoal py-3 text-sm font-medium text-ivory transition hover:bg-moss disabled:opacity-60"
        >
          {t("tableGate.scanButton")}
        </button>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-left text-sm font-medium">
          {t("tableGate.inputLabel")}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder={t("tableGate.inputPlaceholder")}
            className="focus-ring rounded-lg border border-charcoal/20 px-4 py-2.5 text-sm"
          />
        </label>
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={checking}
          className="focus-ring w-full rounded-full border border-charcoal/20 py-3 text-sm font-medium transition hover:border-charcoal/40 disabled:opacity-60"
        >
          {checking ? t("tableGate.checking") : t("tableGate.continueButton")}
        </button>
      </form>

      {scanning && (
        <QrScanner
          onDetect={(n) => {
            setScanning(false);
            selectTable(n);
          }}
          onClose={() => setScanning(false)}
        />
      )}
    </motion.div>
  );
}
