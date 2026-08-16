// Thin wrapper around the native BarcodeDetector API. No external QR-decoding
// dependency — degrades gracefully (manual table-number entry) where unsupported.

export function isQrScanSupported(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

// Accepts either a full URL like "https://kafeflow-web.onrender.com/menyu?stol=04"
// (what a real printed QR code encodes) or a bare value like "4" / "STOL-04".
export function extractTableNumber(raw: string): number | null {
  const text = raw.trim();
  try {
    const url = new URL(text);
    const param = url.searchParams.get("stol");
    if (param) {
      const n = Number(param);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    // not a URL, fall through to plain-text parsing
  }
  const match = text.match(/(\d+)/);
  if (match) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
