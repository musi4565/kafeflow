import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { extractTableNumber, isQrScanSupported } from "../lib/qr";

interface QrScannerProps {
  onDetect: (tableNumber: number) => void;
  onClose: () => void;
}

// Minimal shape of the (experimental) native BarcodeDetector API.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

export function QrScanner({ onDetect, onClose }: QrScannerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isQrScanSupported()) {
      setError(t("qrScanner.unsupported"));
      return;
    }

    let cancelled = false;
    const Detector = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorLike })
      .BarcodeDetector;
    const detector = new Detector({ formats: ["qr_code"] });

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        scan();
      } catch (err) {
        const name = (err as DOMException)?.name;
        setError(
          name === "NotAllowedError" || name === "PermissionDeniedError"
            ? t("qrScanner.permissionDenied")
            : t("qrScanner.cameraError")
        );
      }
    }

    async function scan() {
      if (cancelled || !videoRef.current) return;
      try {
        const results = await detector.detect(videoRef.current);
        if (results.length > 0) {
          const tableNumber = extractTableNumber(results[0].rawValue);
          if (tableNumber) {
            onDetect(tableNumber);
            return;
          }
        }
      } catch {
        // transient detection errors are expected mid-scan; keep trying
      }
      rafRef.current = requestAnimationFrame(scan);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-ivory"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <h2 id="qr-scanner-title" className="font-display text-lg font-semibold">
            {t("qrScanner.title")}
          </h2>
          <button
            onClick={onClose}
            className="focus-ring rounded-full p-1.5 text-charcoal/60 hover:bg-charcoal/5"
            aria-label={t("qrScanner.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="p-6 text-center">
            <p className="text-sm text-charcoal/70">{error}</p>
          </div>
        ) : (
          <div className="relative aspect-square bg-charcoal">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-ivory/70" />
            <p className="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-ivory/90">
              {t("qrScanner.hint")}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
