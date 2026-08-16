import { AlertTriangle, Loader2, PackageOpen } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function LoadingState({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-charcoal/60" role="status" aria-live="polite">
      <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
      <p className="text-sm">{label ?? t("states.loadingDefault")}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-charcoal/60">
      <PackageOpen className="h-8 w-8" aria-hidden="true" />
      <p className="text-base font-medium text-charcoal">{title}</p>
      {description && <p className="max-w-sm text-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
      <p className="max-w-sm text-sm text-charcoal/80">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring rounded-full border border-charcoal/20 px-5 py-2 text-sm font-medium text-charcoal transition hover:bg-charcoal hover:text-ivory"
        >
          {t("states.retry")}
        </button>
      )}
    </div>
  );
}
